// IndexedDB Storage Manager for Expense Tracker PWA
class ExpenseStorage {
  constructor() {
    this.dbName = 'ExpenseTracker';
    this.version = 1;
    this.db = null;
    this.defaultCategories = [
      'Food', 'Transport', 'Bills', 'Shopping', 'Health', 
      'Zakat/Charity', 'Entertainment', 'Other'
    ];
  }

  // Initialize database
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create expenses store
        if (!db.objectStoreNames.contains('expenses')) {
          const expenseStore = db.createObjectStore('expenses', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          expenseStore.createIndex('date', 'date', { unique: false });
          expenseStore.createIndex('category', 'category', { unique: false });
        }
        
        // Create categories store
        if (!db.objectStoreNames.contains('categories')) {
          const categoryStore = db.createObjectStore('categories', { 
            keyPath: 'name' 
          });
          
          // Add default categories
          this.defaultCategories.forEach(cat => {
            categoryStore.add({ name: cat, isDefault: true });
          });
        }
        
        // Create settings store
        if (!db.objectStoreNames.contains('settings')) {
          const settingsStore = db.createObjectStore('settings', { 
            keyPath: 'key' 
          });
          settingsStore.add({ key: 'theme', value: 'light' });
        }
      };
    });
  }

  // Add new expense
  async addExpense(amount, note, category) {
    const expense = {
      amount: parseFloat(amount),
      note: note || '',
      category: category || 'Other',
      date: new Date().toISOString(),
      timestamp: Date.now()
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['expenses'], 'readwrite');
      const store = transaction.objectStore('expenses');
      const request = store.add(expense);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Get expenses with optional date filtering
  async getExpenses(dateFilter = null) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['expenses'], 'readonly');
      const store = transaction.objectStore('expenses');
      const request = store.getAll();
      
      request.onsuccess = () => {
        let expenses = request.result;
        
        if (dateFilter) {
          expenses = expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            return this.isInDateRange(expenseDate, dateFilter);
          });
        }
        
        // Sort by date (newest first)
        expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
        resolve(expenses);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Check if date is in specified range
  isInDateRange(date, filter) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (filter) {
      case 'day':
        const expenseDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        return expenseDay.getTime() === today.getTime();
      
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        return date >= weekStart && date <= weekEnd;
      
      case 'month':
        return date.getMonth() === now.getMonth() && 
               date.getFullYear() === now.getFullYear();
      
      default:
        return true;
    }
  }

  // Get categories
  async getCategories() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['categories'], 'readonly');
      const store = transaction.objectStore('categories');
      const request = store.getAll();
      
      request.onsuccess = () => {
        const categories = request.result.map(cat => cat.name);
        resolve(categories);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Add custom category
  async addCategory(categoryName) {
    const category = {
      name: categoryName,
      isDefault: false
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['categories'], 'readwrite');
      const store = transaction.objectStore('categories');
      const request = store.add(category);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Delete expense
  async deleteExpense(id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['expenses'], 'readwrite');
      const store = transaction.objectStore('expenses');
      const request = store.delete(id);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Export data as CSV
  async exportCSV() {
    const expenses = await this.getExpenses();
    const headers = ['Date', 'Amount', 'Category', 'Note'];
    const csvContent = [
      headers.join(','),
      ...expenses.map(expense => [
        new Date(expense.date).toLocaleDateString(),
        expense.amount,
        expense.category,
        `"${expense.note.replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');
    
    return csvContent;
  }

  // Export data as JSON
  async exportJSON() {
    const expenses = await this.getExpenses();
    return JSON.stringify(expenses, null, 2);
  }

  // Download file helper
  downloadFile(content, filename, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Get/Set theme
  async getTheme() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['settings'], 'readonly');
      const store = transaction.objectStore('settings');
      const request = store.get('theme');
      
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.value : 'light');
      };
      request.onerror = () => reject(request.error);
    });
  }

  async setTheme(theme) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['settings'], 'readwrite');
      const store = transaction.objectStore('settings');
      const request = store.put({ key: 'theme', value: theme });
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Calculate totals and stats
  calculateStats(expenses) {
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const categoryTotals = {};
    
    expenses.forEach(expense => {
      categoryTotals[expense.category] = 
        (categoryTotals[expense.category] || 0) + expense.amount;
    });

    return {
      total,
      categoryTotals,
      count: expenses.length,
      average: expenses.length > 0 ? total / expenses.length : 0
    };
  }
}

// Create global instance
const storage = new ExpenseStorage();
