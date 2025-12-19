// Transaction parser using regex and keyword matching
// Returns parsed transaction with confidence score (0-1)

const CURRENCY_SYMBOLS = ['₹', 'Rs', 'Rs.', 'INR', 'rupees', 'rupee'];
const DEBIT_KEYWORDS = ['debited', 'debit', 'paid', 'payment', 'spent', 'withdrawn', 'deducted', 'sent', 'charged'];
const CREDIT_KEYWORDS = ['credited', 'credit', 'received', 'deposited', 'added'];
const TRANSACTION_KEYWORDS = [...DEBIT_KEYWORDS, ...CREDIT_KEYWORDS, 'transaction', 'account'];
const BALANCE_KEYWORDS = ['balance', 'bal', 'avl bal', 'available balance', 'remaining balance', 'current balance'];

// Amount regex patterns - Only patterns with ₹ or INR
// Exclude balance-related patterns
const AMOUNT_PATTERNS = [
  /(?:₹|Rs\.?|INR)\s*([\d,]+\.?\d*)/gi,  // ₹1,234.56 or Rs 1234 or INR 1234
  /([\d,]+\.?\d*)\s*(?:₹|Rs\.?|INR)/gi,  // 1234.56 ₹ or 1234 INR
  /(?:amount|amt)[\s:]*[₹Rs\.]*\s*([\d,]+\.?\d*)/gi,  // amount: ₹1234 (only if ₹/Rs present)
];

export const parseTransaction = (smsBody, sender) => {
  const body = smsBody.toLowerCase();
  let confidence = 0.0;
  let amount = null;
  
  // Check for transaction keywords
  const hasTransactionKeyword = TRANSACTION_KEYWORDS.some(keyword => 
    body.includes(keyword.toLowerCase())
  );
  
  // Check for currency symbols
  const hasCurrencySymbol = CURRENCY_SYMBOLS.some(symbol => 
    body.includes(symbol.toLowerCase())
  );
  
  // Extract amount - Only from patterns that include ₹, Rs, or INR
  // Exclude balance amounts and prioritize transaction amounts
  const currencyPattern = /(?:₹|Rs\.?|INR)/gi;
  const hasCurrencyInText = currencyPattern.test(smsBody);
  
  let candidateAmounts = [];
  
  // Only extract amounts if currency symbol (₹, Rs, or INR) is present
  if (hasCurrencyInText) {
    for (const pattern of AMOUNT_PATTERNS) {
      const matches = [...smsBody.matchAll(pattern)];
      for (const match of matches) {
        // Verify that the match contains a currency symbol
        const matchText = match[0];
        if (/(?:₹|Rs\.?|INR)/i.test(matchText)) {
          const amountStr = match[1]?.replace(/,/g, '');
          const parsedAmount = parseFloat(amountStr);
          if (!isNaN(parsedAmount) && parsedAmount > 0) {
            // Get the position of this amount in the text
            const matchIndex = match.index;
            const beforeMatch = smsBody.substring(Math.max(0, matchIndex - 50), matchIndex).toLowerCase();
            const afterMatch = smsBody.substring(matchIndex + matchText.length, Math.min(smsBody.length, matchIndex + matchText.length + 50)).toLowerCase();
            const context = beforeMatch + ' ' + afterMatch;
            
            // Check if this amount is near balance keywords
            const isNearBalance = BALANCE_KEYWORDS.some(keyword => 
              context.includes(keyword.toLowerCase())
            );
            
            // Check if this amount is near transaction keywords (prioritize these)
            const isNearTransaction = [...DEBIT_KEYWORDS, ...CREDIT_KEYWORDS, 'amount', 'amt'].some(keyword =>
              context.includes(keyword.toLowerCase())
            );
            
            candidateAmounts.push({
              amount: parsedAmount,
              isBalance: isNearBalance,
              isTransaction: isNearTransaction,
              context: context,
            });
          }
        }
      }
    }
  }
  
  // Filter out balance amounts and prioritize transaction amounts
  const transactionAmounts = candidateAmounts.filter(c => !c.isBalance && c.isTransaction);
  const nonBalanceAmounts = candidateAmounts.filter(c => !c.isBalance);
  
  // Priority: 1) Transaction amounts, 2) Non-balance amounts, 3) All amounts
  let selectedAmount = null;
  if (transactionAmounts.length > 0) {
    // If we have transaction amounts, use the one with transaction keywords nearby
    selectedAmount = Math.max(...transactionAmounts.map(c => c.amount));
  } else if (nonBalanceAmounts.length > 0) {
    // Use non-balance amounts
    selectedAmount = Math.max(...nonBalanceAmounts.map(c => c.amount));
  } else if (candidateAmounts.length > 0) {
    // Fallback: use all amounts (but prefer smaller ones as they're more likely transaction amounts)
    // Balance is usually larger, so we'll pick the smaller amount
    const sortedAmounts = candidateAmounts.map(c => c.amount).sort((a, b) => a - b);
    selectedAmount = sortedAmounts[0]; // Take the smallest (most likely transaction)
  }
  
  amount = selectedAmount;
  
  // Calculate confidence score
  // Require currency symbol (₹ or INR) to have any meaningful confidence
  if (hasTransactionKeyword && hasCurrencySymbol && amount) {
    confidence = 0.9;
  } else if (hasCurrencySymbol && amount) {
    confidence = 0.7; // Has currency symbol and amount
  } else if (hasTransactionKeyword && hasCurrencySymbol) {
    confidence = 0.5; // Has keywords and currency but no amount extracted
  } else if (hasCurrencySymbol) {
    confidence = 0.3; // Has currency symbol but no amount extracted
  } else {
    confidence = 0.1; // No currency symbol - very low confidence
  }
  
  // Only consider it a valid transaction if it has both currency symbol and amount
  if (!hasCurrencySymbol || !amount) {
    // If no currency symbol or no amount, significantly lower confidence
    confidence = Math.max(0.1, confidence - 0.3);
  }
  
  // Boost confidence if amount is reasonable (between ₹1 and ₹10,00,000)
  if (amount && amount >= 1 && amount <= 1000000) {
    confidence = Math.min(confidence + 0.1, 1.0);
  }
  
  // Check for common bank/payment sender patterns
  const bankPatterns = ['bank', 'upi', 'paytm', 'gpay', 'phonepe', 'razorpay'];
  const isFromBank = bankPatterns.some(pattern => 
    sender.toLowerCase().includes(pattern)
  );
  
  if (isFromBank) {
    confidence = Math.min(confidence + 0.15, 1.0);
  }
  
  // Determine transaction type
  let type = 'unknown';
  if (DEBIT_KEYWORDS.some(keyword => body.includes(keyword.toLowerCase()))) {
    type = 'debit';
    if (amount) amount = -Math.abs(amount); // Negative for debits
  } else if (CREDIT_KEYWORDS.some(keyword => body.includes(keyword.toLowerCase()))) {
    type = 'credit';
    if (amount) amount = Math.abs(amount); // Positive for credits
  }
  
  return {
    amount,
    confidence: Math.round(confidence * 100) / 100, // Round to 2 decimals
    type,
    hasAmount: amount !== null,
    hasKeywords: hasTransactionKeyword,
    hasCurrency: hasCurrencySymbol,
  };
};

export const shouldParseAsTransaction = (smsBody, sender, minConfidence = 0.3) => {
  const parsed = parseTransaction(smsBody, sender);
  // Require both currency symbol and amount for valid transaction
  const hasCurrency = CURRENCY_SYMBOLS.some(symbol => 
    smsBody.toLowerCase().includes(symbol.toLowerCase())
  );
  
  // Only parse if it has currency symbol and amount
  if (!hasCurrency || !parsed.amount) {
    return false;
  }
  
  return parsed.confidence >= minConfidence;
};

