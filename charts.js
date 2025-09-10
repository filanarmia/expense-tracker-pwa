// Charts Manager for Expense Tracker PWA
class ChartManager {
  constructor() {
    this.currentChart = null;
    this.chartColors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
      '#F97316', '#06B6D4', '#84CC16', '#EC4899', '#6B7280'
    ];
  }

  // Destroy current chart if exists
  destroyCurrentChart() {
    if (this.currentChart) {
      this.currentChart.destroy();
      this.currentChart = null;
    }
  }

  // Create daily view (simple list with total)
  async createDailyView(expenses) {
    const container = document.getElementById('chart-container');
    const stats = storage.calculateStats(expenses);
    
    container.innerHTML = `
      <div class="daily-summary">
        <div class="total-card">
          <h3>Today's Total</h3>
          <div class="total-amount">RM${stats.total.toFixed(2)}</div>
          <div class="expense-count">${stats.count} expenses</div>
        </div>
      </div>
      
      <div class="expense-list">
        ${expenses.length > 0 ? expenses.map(expense => `
          <div class="expense-item" data-id="${expense.id}">
            <div class="expense-info">
            <div class="expense-amount">RM${expense.amount.toFixed(2)}</div>
              <div class="expense-details">
                <span class="expense-category">${expense.category}</span>
                ${expense.note ? `<span class="expense-note">${expense.note}</span>` : ''}
              </div>
            </div>
            <div class="expense-time">
              ${new Date(expense.date).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
            <button class="delete-btn" onclick="deleteExpense(${expense.id})">×</button>
          </div>
        `).join('') : '<div class="no-expenses">No expenses today</div>'}
      </div>
    `;
  }

  // Create weekly bar chart
  async createWeeklyChart(expenses) {
    const container = document.getElementById('chart-container');
    container.innerHTML = '<canvas id="weekly-chart"></canvas>';
    
    const ctx = document.getElementById('weekly-chart').getContext('2d');
    const weeklyData = this.prepareWeeklyData(expenses);
    
    this.currentChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: weeklyData.labels,
        datasets: [{
          label: 'Daily Spending',
          data: weeklyData.data,
          backgroundColor: this.chartColors[0],
          borderColor: this.chartColors[0],
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `RM${context.parsed.y.toFixed(2)}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return 'RM' + value.toFixed(0);
              }
            }
          }
        }
      }
    });
    
    // Add summary stats
    const stats = storage.calculateStats(expenses);
    const summaryDiv = document.createElement('div');
    summaryDiv.className = 'weekly-summary';
    summaryDiv.innerHTML = `
      <div class="summary-stats">
        <div class="stat-item">
          <span class="stat-label">Week Total</span>
          <span class="stat-value">RM${stats.total.toFixed(2)}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Daily Average</span>
          <span class="stat-value">RM${(stats.total / 7).toFixed(2)}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Expenses</span>
          <span class="stat-value">${stats.count}</span>
        </div>
      </div>
    `;
    container.appendChild(summaryDiv);
  }

  // Create monthly charts (pie + line)
  async createMonthlyCharts(expenses) {
    const container = document.getElementById('chart-container');
    container.innerHTML = `
      <div class="monthly-charts">
        <div class="chart-section">
          <h4>Spending by Category</h4>
          <canvas id="category-pie-chart"></canvas>
        </div>
        <div class="chart-section">
          <h4>Daily Trend</h4>
          <canvas id="trend-line-chart"></canvas>
        </div>
      </div>
    `;
    
    // Category pie chart
    this.createCategoryPieChart(expenses);
    
    // Daily trend line chart
    this.createTrendLineChart(expenses);
    
    // Add summary stats
    const stats = storage.calculateStats(expenses);
    const summaryDiv = document.createElement('div');
    summaryDiv.className = 'monthly-summary';
    summaryDiv.innerHTML = `
      <div class="summary-stats">
        <div class="stat-item">
          <span class="stat-label">Month Total</span>
          <span class="stat-value">RM${stats.total.toFixed(2)}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Daily Average</span>
          <span class="stat-value">RM${stats.average.toFixed(2)}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Expenses</span>
          <span class="stat-value">${stats.count}</span>
        </div>
      </div>
    `;
    container.appendChild(summaryDiv);
  }

  // Create category pie chart
  createCategoryPieChart(expenses) {
    const ctx = document.getElementById('category-pie-chart').getContext('2d');
    const stats = storage.calculateStats(expenses);
    
    const categories = Object.keys(stats.categoryTotals);
    const amounts = Object.values(stats.categoryTotals);
    
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: categories,
        datasets: [{
          data: amounts,
          backgroundColor: this.chartColors.slice(0, categories.length),
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              usePointStyle: true
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const percentage = ((context.parsed / stats.total) * 100).toFixed(1);
                return `${context.label}: RM${context.parsed.toFixed(2)} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }

  // Create trend line chart
  createTrendLineChart(expenses) {
    const ctx = document.getElementById('trend-line-chart').getContext('2d');
    const trendData = this.prepareTrendData(expenses);
    
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: trendData.labels,
        datasets: [{
          label: 'Daily Spending',
          data: trendData.data,
          borderColor: this.chartColors[1],
          backgroundColor: this.chartColors[1] + '20',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `RM${context.parsed.y.toFixed(2)}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return 'RM' + value.toFixed(0);
              }
            }
          }
        }
      }
    });
  }

  // Prepare weekly data for bar chart
  prepareWeeklyData(expenses) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dailyTotals = new Array(7).fill(0);
    
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    expenses.forEach(expense => {
      const expenseDate = new Date(expense.date);
      const dayOfWeek = expenseDate.getDay();
      const daysDiff = Math.floor((expenseDate - startOfWeek) / (24 * 60 * 60 * 1000));
      
      if (daysDiff >= 0 && daysDiff < 7) {
        dailyTotals[dayOfWeek] += expense.amount;
      }
    });
    
    return {
      labels: days,
      data: dailyTotals
    };
  }

  // Prepare trend data for line chart
  prepareTrendData(expenses) {
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const labels = [];
    const data = new Array(daysInMonth).fill(0);
    
    // Generate day labels
    for (let i = 1; i <= daysInMonth; i++) {
      labels.push(i.toString());
    }
    
    // Fill in expense data
    expenses.forEach(expense => {
      const expenseDate = new Date(expense.date);
      const day = expenseDate.getDate() - 1; // 0-indexed
      if (day >= 0 && day < daysInMonth) {
        data[day] += expense.amount;
      }
    });
    
    return { labels, data };
  }
}

// Create global instance
const chartManager = new ChartManager();
