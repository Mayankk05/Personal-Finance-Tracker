import { useState, useEffect } from 'react';
import budgetService from '../../services/budgetService';
import categoryService from '../../services/categoryService';
import transactionService from '../../services/transactionService';
import BudgetForm from './BudgetForm';
import Modal from '../common/Modal';
import LoadingSpinner from '../common/LoadingSpinner';

const BudgetList = () => {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [spentAmounts, setSpentAmounts] = useState({});

  useEffect(() => {
    loadData();
  }, [selectedMonth, selectedYear]);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([
      loadBudgets(),
      loadCategories(),
      loadSpentAmounts()
    ]);
    setLoading(false);
  };

  const loadBudgets = async () => {
    try {
      const response = await budgetService.getBudgets(selectedMonth, selectedYear);
      setBudgets(response || []);
    } catch (error) {
      console.error('Error loading budgets:', error);
      setBudgets([]);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await categoryService.getCategories('EXPENSE');
      setCategories(response || []);
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([]);
    }
  };

  const loadSpentAmounts = async () => {
    try {
      // Get first and last day of selected month
      const startDate = new Date(selectedYear, selectedMonth - 1, 1).toISOString().split('T')[0];
      const endDate = new Date(selectedYear, selectedMonth, 0).toISOString().split('T')[0];
      
      const response = await transactionService.getTransactions({
        startDate,
        endDate,
        type: 'EXPENSE',
        size: 1000 // Get all transactions for the month
      });

      const transactions = response.content || [];
      const spentByCategory = {};

      transactions.forEach(transaction => {
        const categoryId = transaction.categoryId;
        if (!spentByCategory[categoryId]) {
          spentByCategory[categoryId] = 0;
        }
        spentByCategory[categoryId] += parseFloat(transaction.amount);
      });

      setSpentAmounts(spentByCategory);
    } catch (error) {
      console.error('Error loading spent amounts:', error);
      setSpentAmounts({});
    }
  };

  const handleAddBudget = () => {
    setShowAddModal(true);
  };

  const handleEditBudget = (budget) => {
    setEditingBudget(budget);
    setShowEditModal(true);
  };

  const handleDeleteBudget = async (budgetId) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) {
      return;
    }

    try {
      await budgetService.deleteBudget(budgetId);
      loadBudgets();
    } catch (error) {
      console.error('Error deleting budget:', error);
      alert('Failed to delete budget. Please try again.');
    }
  };

  const handleBudgetSuccess = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setEditingBudget(null);
    loadBudgets();
  };

  const handleMonthYearChange = (month, year) => {
    setSelectedMonth(month);
    setSelectedYear(year);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const calculateProgress = (budgetAmount, spentAmount) => {
    if (budgetAmount === 0) return 0;
    return Math.min((spentAmount / budgetAmount) * 100, 100);
  };

  const getProgressColor = (progress) => {
    if (progress >= 100) return 'red';
    if (progress >= 80) return 'orange';
    if (progress >= 60) return 'yellow';
    return 'green';
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({length: 5}, (_, i) => currentYear - 2 + i);

  if (loading) {
    return (
      <div className="loading-container">
        <LoadingSpinner />
        <p>Loading budgets...</p>
      </div>
    );
  }

  return (
    <div className="budgets-page">
      <div className="page-header">
        <div>
          <h1>Budgets</h1>
          <p className="text-gray-600">Plan and track your spending</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleAddBudget}
        >
          Add Budget
        </button>
      </div>

      <div className="page-content">
        <div className="budget-controls">
          <div className="period-selector">
            <div className="form-group">
              <label className="form-label">Month</label>
              <select
                className="form-select"
                value={selectedMonth}
                onChange={(e) => handleMonthYearChange(parseInt(e.target.value), selectedYear)}
              >
                {months.map((month, index) => (
                  <option key={index} value={index + 1}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Year</label>
              <select
                className="form-select"
                value={selectedYear}
                onChange={(e) => handleMonthYearChange(selectedMonth, parseInt(e.target.value))}
              >
                {years.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {budgets.length > 0 ? (
          <div className="budgets-grid">
            {budgets.map(budget => {
              const spentAmount = spentAmounts[budget.categoryId] || 0;
              const progress = calculateProgress(budget.amount, spentAmount);
              const progressColor = getProgressColor(progress);
              const remaining = budget.amount - spentAmount;

              return (
                <div key={budget.id} className="budget-card">
                  <div className="budget-header">
                    <div className="budget-category">
                      <h3>{budget.categoryName}</h3>
                      <span className="budget-period">
                        {months[selectedMonth - 1]} {selectedYear}
                      </span>
                    </div>
                    <div className="budget-actions">
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => handleEditBudget(budget)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeleteBudget(budget.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="budget-amounts">
                    <div className="budget-total">
                      <span className="label">Budget:</span>
                      <span className="amount">{formatCurrency(budget.amount)}</span>
                    </div>
                    <div className="budget-spent">
                      <span className="label">Spent:</span>
                      <span className={`amount ${spentAmount > budget.amount ? 'over-budget' : ''}`}>
                        {formatCurrency(spentAmount)}
                      </span>
                    </div>
                    <div className="budget-remaining">
                      <span className="label">Remaining:</span>
                      <span className={`amount ${remaining < 0 ? 'over-budget' : 'remaining'}`}>
                        {formatCurrency(Math.abs(remaining))}
                        {remaining < 0 && ' over'}
                      </span>
                    </div>
                  </div>

                  <div className="budget-progress">
                    <div className="progress-bar">
                      <div 
                        className={`progress-fill progress-${progressColor}`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      ></div>
                    </div>
                    <div className="progress-text">
                      <span>{progress.toFixed(1)}% used</span>
                      {progress > 100 && (
                        <span className="over-budget-indicator">⚠️ Over budget</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <p>No budgets for {months[selectedMonth - 1]} {selectedYear}</p>
            <p className="text-sm text-gray-500">
              Start by adding a budget for your expense categories
            </p>
            <button
              className="btn btn-primary mt-4"
              onClick={handleAddBudget}
            >
              Add Budget
            </button>
          </div>
        )}
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Budget"
      >
        <BudgetForm
          month={selectedMonth}
          year={selectedYear}
          categories={categories}
          existingBudgets={budgets}
          onSuccess={handleBudgetSuccess}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Budget"
      >
        <BudgetForm
          budget={editingBudget}
          month={selectedMonth}
          year={selectedYear}
          categories={categories}
          existingBudgets={budgets}
          onSuccess={handleBudgetSuccess}
          onCancel={() => setShowEditModal(false)}
        />
      </Modal>
    </div>
  );
};

export default BudgetList;