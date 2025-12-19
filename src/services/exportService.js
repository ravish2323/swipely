// Export functionality has been removed
// This file is kept for compatibility but all functions are no-ops

// Export transactions to CSV (Excel compatible) - DISABLED
export const exportToCSV = async (transactions, dateRange = null) => {
  // Export functionality disabled
  console.log('Export to CSV is disabled');
  return { success: false, message: 'Export functionality has been removed' };
};

// Export transactions to PDF (simple text-based PDF) - DISABLED
export const exportToPDF = async (transactions, dateRange = null) => {
  // Export functionality disabled
  console.log('Export to PDF is disabled');
  return { success: false, message: 'Export functionality has been removed' };
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

