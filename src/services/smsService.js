import { parseTransaction, shouldParseAsTransaction } from './parser';
import { saveTransaction, transactionExists } from './database';
import { PermissionsAndroid, Platform } from 'react-native';

// Try to import SMS module (only available in custom dev builds)
let SmsAndroid = null;
try {
  SmsAndroid = require('react-native-get-sms-android');
} catch (e) {
  console.log('SMS module not available (using mock mode)');
}

class SMSService {
  constructor() {
    this.isInitialized = false;
    this.hasPermission = false;
    this.mockMode = false;
    this.smsListener = null;
    this.mockDataLoaded = false; // Track if mock data has been loaded
    this.lastProcessedSmsDate = 0; // Track last processed SMS date (ms)
  }

  async initialize() {
    try {
      // Check if SMS module is available
      if (!SmsAndroid) {
        console.log('SMS module not available. Using mock data mode.');
        this.mockMode = true;
        // Only load mock data if not already loaded
        if (!this.mockDataLoaded) {
          setTimeout(() => {
            this.loadMockData();
          }, 1000);
        }
        this.isInitialized = true;
        return;
      }

      // Request permissions and check if available
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.log('SMS permissions not granted. Using mock data mode.');
        this.mockMode = true;
        // Only load mock data if not already loaded
        if (!this.mockDataLoaded) {
          setTimeout(() => {
            this.loadMockData();
          }, 1000);
        }
      } else {
        this.hasPermission = true;
        await this.setupSMSListener();
        await this.loadRecentSMS();
      }
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize SMS service:', error);
      this.mockMode = true;
      // Only load mock data if not already loaded
      if (!this.mockDataLoaded) {
        setTimeout(() => {
          this.loadMockData();
        }, 1000);
      }
      this.isInitialized = true;
    }
  }

  async requestPermissions() {
    try {
      if (Platform.OS !== 'android') return false;
      if (!SmsAndroid) return false;
  
      console.log('Requesting SMS permissions...');
  
      const result = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.READ_SMS,
        PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
        // PermissionsAndroid.PERMISSIONS.SEND_SMS, // only if you actually send SMS!
      ]);
  
      const grantedRead =
        result[PermissionsAndroid.PERMISSIONS.READ_SMS] === PermissionsAndroid.RESULTS.GRANTED;
  
      if (grantedRead) {
        this.hasPermission = true;
        console.log('SMS permissions granted ✅');
        return true;
      } else {
        console.log('SMS permissions denied ❌');
        return false;
      }
    } catch (error) {
      console.log('Permission request error:', error);
      return false;
    }
  }
  

  async setupSMSListener() {
    try {
      if (!SmsAndroid || !this.hasPermission) {
        return;
      }

      // One-time SMS scan on app start
      console.log('SMS listener setup - one-time scan only');
      await this.loadRecentSMS();
      
    } catch (error) {
      console.error('Failed to setup SMS listener:', error);
    }
  }

  async loadRecentSMS() {
    try {
      if (!SmsAndroid || !this.hasPermission) {
        return;
      }

      // Get SMS from mid-October to today (as per FE key plan change requirement)
      // Base start date
      const baseStartDate = new Date(2025, 9, 15); // Months are 0-based: 9 = October
      baseStartDate.setHours(0, 0, 0, 0);
      const baseStartTimestamp = baseStartDate.getTime();

      // Only fetch SMS newer than the last processed one to avoid re-processing
      const effectiveStartTimestamp =
        this.lastProcessedSmsDate && this.lastProcessedSmsDate > baseStartTimestamp
          ? this.lastProcessedSmsDate
          : baseStartTimestamp;

      const filter = {
        box: 'inbox',
        minDate: effectiveStartTimestamp,
        maxDate: Date.now(),
      };

      // Use promise wrapper for better async handling
      return new Promise((resolve, reject) => {
        SmsAndroid.list(
          JSON.stringify(filter),
          (fail) => {
            console.error('Failed to load SMS:', fail);
            reject(fail);
          },
          async (count, smsList) => {
            try {
              const messages = JSON.parse(smsList);
              if (Array.isArray(messages)) {
                console.log(`Found ${messages.length} SMS messages to process`);
                // Process each SMS sequentially to avoid race conditions
                let processedCount = 0;
                for (const msg of messages) {
                  const sender = msg.address || msg.originatingAddress;
                  const body = msg.body;
                  const timestampSeconds = Math.floor(msg.date / 1000);

                  const processed = await this.processNewSMS(
                    sender,
                    body,
                    timestampSeconds
                  );
                  if (processed) {
                    processedCount++;
                  }

                  // Track last processed SMS date in ms
                  if (!this.lastProcessedSmsDate || msg.date > this.lastProcessedSmsDate) {
                    this.lastProcessedSmsDate = msg.date;
                  }
                }
                console.log(`Processed ${processedCount} new SMS transactions`);
                resolve(processedCount);
              } else {
                resolve(0);
              }
            } catch (error) {
              console.error('Error parsing SMS list:', error);
              reject(error);
            }
          }
        );
      });
    } catch (error) {
      console.error('Error loading recent SMS:', error);
    }
  }

  async loadMockData() {
    // Check if mock data was already loaded
    if (this.mockDataLoaded) {
      console.log('Mock data already loaded. Skipping...');
      return;
    }

    // Check if there are already pending transactions
    try {
      const { getPendingTransactions } = require('./database');
      const pending = await getPendingTransactions();
      if (pending && pending.length > 0) {
        console.log(`Found ${pending.length} pending transactions. Not loading mock data.`);
        this.mockDataLoaded = true; // Mark as loaded to prevent future loads
        return;
      }
    } catch (error) {
      console.log('Could not check pending transactions:', error);
    }

    console.log('Loading mock SMS data...');
    this.mockDataLoaded = true; // Mark as loaded
    
    // Small delay to ensure database is fully ready
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockMessages = [
      {
        sender: 'HDFCBK',
        body: '₹1,250.00 debited from A/c **1234 on 15-Jan-24. UPI/Paytm. Avl Bal: ₹45,230.00',
        timestamp: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
      },
      {
        sender: 'TEST',
        body: 'You spent ₹100. Your balance is ₹500. Thank you.',
        timestamp: Math.floor(Date.now() / 1000) - 1800, // 30 mins ago - Test case for balance filtering
      },
      {
        sender: 'ICICIB',
        body: 'Your a/c 5678901234 is credited with INR 5,000.00 on 15-Jan-24 by NEFT. Bal: ₹50,230.00',
        timestamp: Math.floor(Date.now() / 1000) - 7200, // 2 hours ago
      },
      {
        sender: 'PAYTM',
        body: 'Payment of ₹850.00 to Amazon India successful. Transaction ID: T123456789',
        timestamp: Math.floor(Date.now() / 1000) - 10800, // 3 hours ago
      },
      {
        sender: 'GPAY',
        body: 'You paid ₹2,340.00 to Swiggy. UPI Ref: 123456789012',
        timestamp: Math.floor(Date.now() / 1000) - 14400, // 4 hours ago
      },
      {
        sender: 'PHONEPE',
        body: '₹1,890.00 sent to Zomato successfully. Balance: ₹42,000.00',
        timestamp: Math.floor(Date.now() / 1000) - 18000, // 5 hours ago
      },
      {
        sender: 'SBI',
        body: 'INR 10,000.00 credited to A/c XX3456 on 15-Jan via IMPS. Thank you for banking with SBI.',
        timestamp: Math.floor(Date.now() / 1000) - 21600, // 6 hours ago
      },
      {
        sender: 'AMAZON',
        body: 'Your order #123-4567890-1234567 has been shipped! Track your package.',
        timestamp: Math.floor(Date.now() / 1000) - 25200, // 7 hours ago
      },
      {
        sender: 'FLIPKART',
        body: 'Great news! Your order will be delivered today. OTP: 123456',
        timestamp: Math.floor(Date.now() / 1000) - 28800, // 8 hours ago
      },
      {
        sender: 'UBER',
        body: 'Your ride from Airport to Downtown completed. Fare: ₹450.00 charged to card ending 5678',
        timestamp: Math.floor(Date.now() / 1000) - 32400, // 9 hours ago
      },
      {
        sender: 'ZOMATO',
        body: 'Payment of ₹650.00 received for your order. Enjoy your meal!',
        timestamp: Math.floor(Date.now() / 1000) - 36000, // 10 hours ago
      },
    ];

    // Process and save mock messages
    let savedCount = 0;
    for (const msg of mockMessages) {
      try {
        const parsed = parseTransaction(msg.body, msg.sender);
        
        if (shouldParseAsTransaction(msg.body, msg.sender, 0.3)) {
          await saveTransaction({
            sender: msg.sender,
            body: msg.body,
            amount: parsed.amount,
            timestamp: msg.timestamp,
            status: 'pending',
            confidence: parsed.confidence,
          });
          savedCount++;
        }
      } catch (error) {
        console.error(`Error saving mock message from ${msg.sender}:`, error);
      }
    }
    
    console.log(`Loaded ${savedCount} transactions from ${mockMessages.length} mock messages`);
  }

  async processNewSMS(sender, body, timestamp) {
    try {
      const parsed = parseTransaction(body, sender);
      
      if (shouldParseAsTransaction(body, sender, 0.3)) {
        // Check if transaction already exists (avoid duplicates)
        const ts = timestamp || Math.floor(Date.now() / 1000);
        const exists = await transactionExists(sender, body, ts);
        if (exists) {
          console.log('Skipping duplicate transaction:', sender, body);
          return false;
        }
        
        await saveTransaction({
          sender,
          body,
          amount: parsed.amount,
          timestamp: ts,
          status: 'pending',
          confidence: parsed.confidence,
        });
        
        console.log(`New transaction detected: ${sender} - ₹${parsed.amount}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error processing SMS:', error);
      return false;
    }
  }

  // Cleanup method
  stop() {
    if (this.smsCheckInterval) {
      clearInterval(this.smsCheckInterval);
      this.smsCheckInterval = null;
    }
  }
}

export default new SMSService();
