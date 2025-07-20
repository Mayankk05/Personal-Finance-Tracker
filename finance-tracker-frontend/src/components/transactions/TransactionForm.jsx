import  { useState, useEffect } from 'react';
import transactionService from '../../services/transactionService';
import categoryService from '../../services/categoryService';
import LoadingSpinner from '../common/LoadingSpinner';

const TransactionForm = ({ transaction = null, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    type: 'EXPENSE',
    categoryId: '',
    transactionDate: new Date().toISOString().split('T')[0]
  });
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const isEditing = !!transaction;

  useEffect(() => {
    loadCategories();
    
    if (transaction) {
      setFormData({
        amount: transaction.amount.toString(),
        description: transaction.description || '',
        type: transaction.type,
        categoryId: transaction.categoryId.toString(),
        transactionDate: transaction.transactionDate
      });
    }
  }, [transaction]);

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await categoryService.getCategories();
      setCategories(response || []);
    } catch (error) {
      console.error('Error loading categories:', error);
      setErrors({ submit: 'Failed to load categories' });
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Clear category error when type changes
    if (name === 'type' && errors.categoryId) {
      setErrors(prev => ({
        ...prev,
        categoryId: ''
      }));
      setFormData(prev => ({
        ...prev,
        categoryId: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'Please select a category';
    }

    if (!formData.transactionDate) {
      newErrors.transactionDate = 'Transaction date is required';
    }

    // Validate that category type matches transaction type
    const selectedCategory = categories.find(cat => cat.id.toString() === formData.categoryId);
    if (selectedCategory && selectedCategory.type !== formData.type) {
      newErrors.categoryId = `Selected category is for ${selectedCategory.type.toLowerCase()} transactions`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const submitData = {
        ...formData,
        amount: parseFloat(formData.amount),
        categoryId: parseInt(formData.categoryId)
      };

      if (isEditing) {
        await transactionService.updateTransaction(transaction.id, submitData);
      } else {
        await transactionService.createTransaction(submitData);
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error saving transaction:', error);
      setErrors({ 
        submit: error.response?.data?.message || 'Failed to save transaction. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCategories = categories.filter(category => category.type === formData.type);

  if (loadingCategories) {
    return (
      <div className="form-loading">
        <LoadingSpinner />
        <p>Loading categories...</p>
      </div>
    );
  }

  return (
    <form className="transaction-form" onSubmit={handleSubmit}>
      {errors.submit && (
        <div className="error-message mb-4">
          {errors.submit}
        </div>
      )}

      <div className="form-group">
        <label className="form-label" htmlFor="type">
          Transaction Type
        </label>
        <select
          id="type"
          name="type"
          className="form-select"
          value={formData.type}
          onChange={handleChange}
          disabled={isSubmitting}
        >
          <option value="EXPENSE">Expense</option>
          <option value="INCOME">Income</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="amount">
          Amount ($)
        </label>
        <input
          type="number"
          id="amount"
          name="amount"
          className={`form-input ${errors.amount ? 'error' : ''}`}
          value={formData.amount}
          onChange={handleChange}
          placeholder="0.00"
          step="0.01"
          min="0"
          disabled={isSubmitting}
        />
        {errors.amount && (
          <div className="form-error">{errors.amount}</div>
        )}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="categoryId">
          Category
        </label>
        <select
          id="categoryId"
          name="categoryId"
          className={`form-select ${errors.categoryId ? 'error' : ''}`}
          value={formData.categoryId}
          onChange={handleChange}
          disabled={isSubmitting}
        >
          <option value="">Select a category</option>
          {filteredCategories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {errors.categoryId && (
          <div className="form-error">{errors.categoryId}</div>
        )}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="description">
          Description (Optional)
        </label>
        <input
          type="text"
          id="description"
          name="description"
          className="form-input"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter description"
          disabled={isSubmitting}
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="transactionDate">
          Date
        </label>
        <input
          type="date"
          id="transactionDate"
          name="transactionDate"
          className={`form-input ${errors.transactionDate ? 'error' : ''}`}
          value={formData.transactionDate}
          onChange={handleChange}
          disabled={isSubmitting}
        />
        {errors.transactionDate && (
          <div className="form-error">{errors.transactionDate}</div>
        )}
      </div>

      <div className="form-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner size="small" />
              <span style={{ marginLeft: '8px' }}>
                {isEditing ? 'Updating...' : 'Creating...'}
              </span>
            </>
          ) : (
            isEditing ? 'Update Transaction' : 'Add Transaction'
          )}
        </button>
      </div>
    </form>
  );
};

export default TransactionForm;