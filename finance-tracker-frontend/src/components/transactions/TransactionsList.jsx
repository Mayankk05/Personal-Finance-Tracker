import React, { useState, useEffect } from 'react';
import transactionService from '../../services/transactionService';
import categoryService from '../../services/categoryService';
import TransactionForm from './TransactionForm';
import TransactionFilters from './TransactionFilters';
import Modal from '../common/Modal';
import LoadingSpinner from '../common/LoadingSpinner';
import Pagination from '../common/Pagination';

const TransactionList = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    categoryId: '',
    type: ''
  });
  const [pagination, setPagination] = useState({
    page: 0,
    size: 20,
    totalPages: 0,
    totalElements: 0
  });

  useEffect(() => {
    loadTransactions();
    loadCategories();
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [filters, pagination.page]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        size: pagination.size,
        ...filters
      };
      
      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null) {
          delete params[key];
        }
      });

      const response = await transactionService.getTransactions(params);
      
      setTransactions(response.content || []);
      setPagination(prev => ({
        ...prev,
        totalPages: response.totalPages || 0,
        totalElements: response.totalElements || 0
      }));
    } catch (error) {
      console.error('Error loading transactions:', error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await categoryService.getCategories();
      setCategories(response || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 0 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleAddTransaction = () => {
    setShowAddModal(true);
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setShowEditModal(true);
  };

  const handleDeleteTransaction = async (transactionId) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    try {
      await transactionService.deleteTransaction(transactionId);
      loadTransactions();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Failed to delete transaction. Please try again.');
    }
  };

  const handleTransactionSuccess = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setEditingTransaction(null);
    loadTransactions();
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

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  return (
    <div className="transactions-page">
      <div className="page-header">
        <div>
          <h1>Transactions</h1>
          <p className="text-gray-600">Manage your income and expenses</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleAddTransaction}
        >
          Add Transaction
        </button>
      </div>

      <div className="page-content">
        <TransactionFilters
          filters={filters}
          categories={categories}
          onFilterChange={handleFilterChange}
        />

        {loading ? (
          <div className="loading-container">
            <LoadingSpinner />
            <p>Loading transactions...</p>
          </div>
        ) : (
          <>
            <div className="transactions-summary">
              <p className="text-sm text-gray-600">
                Showing {transactions.length} of {pagination.totalElements} transactions
              </p>
            </div>

            {transactions.length > 0 ? (
              <>
                <div className="transactions-table">
                  <div className="table-header">
                    <div className="table-cell">Date</div>
                    <div className="table-cell">Description</div>
                    <div className="table-cell">Category</div>
                    <div className="table-cell">Type</div>
                    <div className="table-cell">Amount</div>
                    <div className="table-cell">Actions</div>
                  </div>
                  
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="table-row">
                      <div className="table-cell">
                        {formatDate(transaction.transactionDate)}
                      </div>
                      <div className="table-cell">
                        <div className="transaction-description">
                          {transaction.description || 'No description'}
                        </div>
                      </div>
                      <div className="table-cell">
                        <span className="category-badge">
                          {transaction.categoryName}
                        </span>
                      </div>
                      <div className="table-cell">
                        <span className={`type-badge ${transaction.type.toLowerCase()}`}>
                          {transaction.type}
                        </span>
                      </div>
                      <div className="table-cell">
                        <span className={`amount ${transaction.type.toLowerCase()}`}>
                          {transaction.type === 'INCOME' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </span>
                      </div>
                      <div className="table-cell">
                        <div className="action-buttons">
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => handleEditTransaction(transaction)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDeleteTransaction(transaction.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              </>
            ) : (
              <div className="empty-state">
                <p>No transactions found</p>
                <p className="text-sm text-gray-500">
                  {Object.values(filters).some(v => v) 
                    ? 'Try adjusting your filters' 
                    : 'Start by adding your first transaction'
                  }
                </p>
                <button
                  className="btn btn-primary mt-4"
                  onClick={handleAddTransaction}
                >
                  Add Transaction
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Transaction"
      >
        <TransactionForm
          onSuccess={handleTransactionSuccess}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Transaction"
      >
        <TransactionForm
          transaction={editingTransaction}
          onSuccess={handleTransactionSuccess}
          onCancel={() => setShowEditModal(false)}
        />
      </Modal>
    </div>
  );
};

export default TransactionList;