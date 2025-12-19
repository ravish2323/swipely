import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getDatabase } from './database';

// Export transactions to CSV (Excel compatible)
export const exportToCSV = async (transactions, dateRange = null) => {
  try {
    const database = getDatabase();
    
    let query = `SELECT * FROM transactions WHERE 1=1`;
    let params = [];
    
    if (dateRange) {
      if (dateRange.startDate) {
        query += ` AND timestamp >= ?`;
        params.push(Math.floor(dateRange.startDate.getTime() / 1000));
      }
      if (dateRange.endDate) {
        query += ` AND timestamp <= ?`;
        params.push(Math.floor(dateRange.endDate.getTime() / 1000));
      }
    }
    
    query += ` ORDER BY timestamp DESC`;
    
    const allTransactions = await database.getAllAsync(
      query,
      params.length > 0 ? params : undefined
    );
    
    // Create CSV content
    const headers = ['Date', 'Time', 'Sender', 'Amount', 'Status', 'Category', 'Confidence', 'Message'];
    const rows = allTransactions.map(t => {
      const date = new Date(t.timestamp * 1000);
      const dateStr = date.toLocaleDateString('en-IN');
      const timeStr = date.toLocaleTimeString('en-IN');
      const amount = t.amount ? `₹${Math.abs(t.amount).toLocaleString('en-IN')}` : '—';
      const category = t.category || '—';
      const confidence = `${Math.round((t.confidence || 0) * 100)}%`;
      const body = (t.body || '').replace(/"/g, '""'); // Escape quotes
      
      return [
        dateStr,
        timeStr,
        t.sender || '—',
        amount,
        t.status || 'pending',
        category,
        confidence,
        `"${body}"` // Wrap in quotes for CSV
      ];
    });
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Save to file
    const fileName = `transactions_${Date.now()}.csv`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;
    
    await FileSystem.writeAsStringAsync(fileUri, csvContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/csv',
        dialogTitle: 'Export Transactions',
      });
    }
    
    return { success: true, fileUri };
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    throw error;
  }
};

// Export transactions to PDF (simple text-based PDF)
export const exportToPDF = async (transactions, dateRange = null) => {
  try {
    const database = getDatabase();
    
    let query = `SELECT * FROM transactions WHERE 1=1`;
    let params = [];
    
    if (dateRange) {
      if (dateRange.startDate) {
        query += ` AND timestamp >= ?`;
        params.push(Math.floor(dateRange.startDate.getTime() / 1000));
      }
      if (dateRange.endDate) {
        query += ` AND timestamp <= ?`;
        params.push(Math.floor(dateRange.endDate.getTime() / 1000));
      }
    }
    
    query += ` ORDER BY timestamp DESC`;
    
    const allTransactions = await database.getAllAsync(
      query,
      params.length > 0 ? params : undefined
    );
    
    // Create simple text-based PDF content (HTML that can be converted)
    const dateRangeText = dateRange 
      ? `\nDate Range: ${dateRange.startDate?.toLocaleDateString()} - ${dateRange.endDate?.toLocaleDateString()}`
      : '';
    
    let pdfContent = `Transaction Report${dateRangeText}\n`;
    pdfContent += `Generated: ${new Date().toLocaleString()}\n`;
    pdfContent += `Total Transactions: ${allTransactions.length}\n\n`;
    pdfContent += '='.repeat(80) + '\n\n';
    
    allTransactions.forEach((t, index) => {
      const date = new Date(t.timestamp * 1000);
      const amount = t.amount ? `₹${Math.abs(t.amount).toLocaleString('en-IN')}` : '—';
      
      pdfContent += `Transaction #${index + 1}\n`;
      pdfContent += `Date: ${date.toLocaleString()}\n`;
      pdfContent += `Sender: ${t.sender || '—'}\n`;
      pdfContent += `Amount: ${amount}\n`;
      pdfContent += `Status: ${t.status || 'pending'}\n`;
      pdfContent += `Category: ${t.category || '—'}\n`;
      pdfContent += `Confidence: ${Math.round((t.confidence || 0) * 100)}%\n`;
      pdfContent += `Message: ${(t.body || '').substring(0, 100)}${t.body?.length > 100 ? '...' : ''}\n`;
      pdfContent += '-'.repeat(80) + '\n\n';
    });
    
    // Save as text file (can be opened as PDF or converted)
    const fileName = `transactions_${Date.now()}.txt`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;
    
    await FileSystem.writeAsStringAsync(fileUri, pdfContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/plain',
        dialogTitle: 'Export Transactions Report',
      });
    }
    
    return { success: true, fileUri };
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw error;
  }
};

// Get date range based on filter type
export const getDateRange = (filterType, customStartDate = null, customEndDate = null) => {
  const now = new Date();
  let startDate = null;
  let endDate = new Date(now);
  endDate.setHours(23, 59, 59, 999);
  
  switch (filterType) {
    case 'today':
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'week':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'custom':
      if (customStartDate) {
        startDate = new Date(customStartDate);
        startDate.setHours(0, 0, 0, 0);
      }
      if (customEndDate) {
        endDate = new Date(customEndDate);
        endDate.setHours(23, 59, 59, 999);
      }
      break;
    default:
      return null; // All time
  }
  
  return { startDate, endDate };
};

