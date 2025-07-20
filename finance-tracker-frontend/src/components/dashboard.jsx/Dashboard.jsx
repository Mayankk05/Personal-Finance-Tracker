import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import transactionService from '../../services/transactionService';
import budgetService from '../../services/budgetService';
import Summary from './Summary';
import QuickActions from './QuickActions';
import LoadingSpinner from '../common/LoadingSpinner';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    recentTransactions: [],
    summary: {
      totalIncome: 0,
      totalExpenses: 0,
      balance: 0,
      transactionCount: 0
    },
    budgets: []
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get recent transactions
      const transactionsResponse = await transactionService.getTransactions({
        page: 0,
        size: 5
      });

      // Get current month's budgets
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      
      const budgetsResponse = await budgetService.getBudgets(currentMonth, currentYear);

      // Calculate summary from all transactions (first page gives us totals)
      const allTransactions = transactionsResponse.content || [];
      
      const summary = calculateSummary(allTransactions);

      setDashboardData({
        recentTransactions: allTransactions,
        summary,
        budgets: budgetsResponse || []
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (transactions) => {
    const summary = {
      totalIncome: 0,
      totalExpenses: 0,
      balance: 0,
      transactionCount: transactions.length
    };

    transactions.forEach(transaction => {
      if (transaction.type === 'INCOME') {
        summary.totalIncome += parseFloat(transaction.amount);
      } else {
        summary.totalExpenses += parseFloat(transaction.amount);
      }
    });

    summary.balance = summary.totalIncome - summary.totalExpenses;
    
    return summary;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <LoadingSpinner />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.username}! 👋</h1>
        <p className="text-gray-600">Here's your financial overview</p>
      </div>

      <Summary data={dashboardData.summary} />
      
      <div className="dashboard-grid">
        <div className="dashboard-section">
          <div className="card">
            <div className="card-header">
              <h2>Recent Transactions</h2>
            </div>
            <div className="card-body">
              {dashboardData.recentTransactions.length > 0 ? (
                <div className="transaction-list">
                  {dashboardData.recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="transaction-item">
                      <div className="transaction-info">
                        <div className="transaction-description">
                          {transaction.description || 'No description'}
                        </div>
                        <div className="transaction-meta">
                          <span className="transaction-category">
                            {transaction.categoryName}
                          </span>
                          <span className="transaction-date">
                            {formatDate(transaction.transactionDate)}
                          </span>
                        </div>
                      </div>
                      <div className={`transaction-amount ${transaction.type.toLowerCase()}`}>
                        {transaction.type === 'INCOME' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>No transactions yet</p>
                  <p className="text-sm text-gray-500">
                    Start by adding your first transaction
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="dashboard-section">
          <QuickActions onActionComplete={loadDashboardData} />
          
          {dashboardData.budgets.length > 0 && (
            <div className="card mt-6">
              <div className="card-header">
                <h2>Current Month Budgets</h2>
              </div>
              <div className="card-body">
                <div className="budget-list">
                  {dashboardData.budgets.slice(0, 3).map((budget) => (
                    <div key={budget.id} className="budget-item">
                      <div className="budget-info">
                        <div className="budget-category">{budget.categoryName}</div>
                        <div className="budget-amount">
                          Budget: {formatCurrency(budget.amount)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default  Dashboard;