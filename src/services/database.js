import * as SQLite from 'expo-sqlite';

let db = null;

export const initDatabase = async () => {
  try {
    db = await SQLite.openDatabaseAsync('spendswipe.db');
    
    // Create tables
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender TEXT NOT NULL,
        body TEXT NOT NULL,
        amount REAL,
        timestamp INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        confidence REAL DEFAULT 0.0,
        created_at INTEGER DEFAULT (strftime('%s', 'now'))
      );
      
      CREATE INDEX IF NOT EXISTS idx_timestamp ON transactions(timestamp);
      CREATE INDEX IF NOT EXISTS idx_status ON transactions(status);
    `);

    // Add category column if it doesn't exist
    try {
      await db.execAsync(`
        ALTER TABLE transactions ADD COLUMN category TEXT;
      `);
      console.log('Added category column to transactions table');
    } catch (alterError) {
      // Ignore "duplicate column" or other harmless errors
      console.log('Category column may already exist:', alterError?.message || alterError);
    }
    
    console.log('Database initialized successfully');
    return db;
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

export const getDatabase = () => {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
};

// Save a transaction
export const saveTransaction = async (transaction) => {
  const database = getDatabase();
  try {
    const result = await database.runAsync(
      `INSERT INTO transactions (sender, body, amount, timestamp, status, confidence, category)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        transaction.sender,
        transaction.body,
        transaction.amount || null,
        transaction.timestamp,
        transaction.status || 'pending',
        transaction.confidence || 0.0,
        transaction.category || null,
      ]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error('Error saving transaction:', error);
    throw error;
  }
};

// Update transaction status
export const updateTransactionStatus = async (id, status) => {
  const database = getDatabase();
  try {
    await database.runAsync(
      `UPDATE transactions SET status = ? WHERE id = ?`,
      [status, id]
    );
  } catch (error) {
    console.error('Error updating transaction:', error);
    throw error;
  }
};

// Update transaction category
export const updateTransactionCategory = async (id, category) => {
  const database = getDatabase();
  try {
    await database.runAsync(
      `UPDATE transactions SET category = ? WHERE id = ?`,
      [category, id]
    );
  } catch (error) {
    console.error('Error updating transaction:', error);
    throw error;
  }
};

// Get all pending transactions (not filtered by date)
export const getPendingTransactions = async () => {
  const database = getDatabase();
  try {
    const result = await database.getAllAsync(
      `SELECT * FROM transactions 
       WHERE status = 'pending'
       ORDER BY timestamp DESC`
    );
    return result;
  } catch (error) {
    console.error('Error fetching pending transactions:', error);
    throw error;
  }
};

// Get all transactions with status
export const getTransactionsByStatus = async (status = null) => {
  const database = getDatabase();
  try {
    let query = `SELECT * FROM transactions`;
    let params = [];
    
    if (status) {
      query += ` WHERE status = ?`;
      params.push(status);
    }
    
    query += ` ORDER BY timestamp DESC`;
    
    const result = await database.getAllAsync(query, params.length > 0 ? params : undefined);
    return result;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
};

// Check if a transaction already exists (to avoid duplicates)
export const transactionExists = async (sender, body, timestamp) => {
  const database = getDatabase();
  try {
    const existing = await database.getFirstAsync(
      `SELECT id FROM transactions WHERE sender = ? AND body = ? AND timestamp = ? LIMIT 1`,
      [sender, body, timestamp]
    );
    return !!existing;
  } catch (error) {
    console.error('Error checking existing transaction:', error);
    return false;
  }
};

// Get summary statistics
export const getSummaryStats = async () => {
  const database = getDatabase();
  try {
    const confirmed = await database.getFirstAsync(
      `SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total FROM transactions WHERE status = 'confirmed'`
    );
    const rejected = await database.getFirstAsync(
      `SELECT COUNT(*) as count FROM transactions WHERE status = 'rejected'`
    );
    const special = await database.getFirstAsync(
      `SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total FROM transactions WHERE status = 'special'`
    );
    const pending = await database.getFirstAsync(
      `SELECT COUNT(*) as count FROM transactions WHERE status = 'pending'`
    );
    const food = await database.getFirstAsync(
      `SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total FROM transactions WHERE category = 'food'`
    );
    
    return {
      confirmed: {
        count: confirmed?.count || 0,
        total: confirmed?.total || 0,
      },
      rejected: {
        count: rejected?.count || 0,
      },
      special: {
        count: special?.count || 0,
        total: special?.total || 0,
      },
      pending: {
        count: pending?.count || 0,
      },
      food: {
        count: food?.count || 0,
        total: food?.total || 0,
      },
    };
  } catch (error) {
    console.error('Error fetching summary stats:', error);
    throw error;
  }
};

// Get transactions by category
export const getTransactionsByCategory = async (category) => {
  const database = getDatabase();
  try {
    const result = await database.getAllAsync(
      `SELECT * FROM transactions WHERE category = ? ORDER BY timestamp DESC`,
      [category]
    );
    return result;
  } catch (error) {
    console.error('Error fetching transactions by category:', error);
    throw error;
  }
};

// Clear all transactions from database
export const clearAllTransactions = async () => {
  const database = getDatabase();
  try {
    await database.execAsync(`DELETE FROM transactions`);
    console.log('All transactions cleared from database');
    return true;
  } catch (error) {
    console.error('Error clearing transactions:', error);
    throw error;
  }
};

// Reset database (drop and recreate tables)
export const resetDatabase = async () => {
  const database = getDatabase();
  try {
    // Drop existing tables
    await database.execAsync(`DROP TABLE IF EXISTS transactions`);
    
    // Recreate tables
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender TEXT NOT NULL,
        body TEXT NOT NULL,
        amount REAL,
        timestamp INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        confidence REAL DEFAULT 0.0,
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        category TEXT
      );
      
      CREATE INDEX IF NOT EXISTS idx_timestamp ON transactions(timestamp);
      CREATE INDEX IF NOT EXISTS idx_status ON transactions(status);
    `);
    
    console.log('Database reset successfully');
    return true;
  } catch (error) {
    console.error('Error resetting database:', error);
    throw error;
  }
};
