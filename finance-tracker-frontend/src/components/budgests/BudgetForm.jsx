import  { useState, useEffect } from 'react';
import budgetService from '../../services/budgetService';
import LoadingSpinner from '../common/LoadingSpinner';

const BudgetForm = ({ 
  budget = null, 
  month, 
  year, 
  categories, 
  existingBudgets, 
  onSuccess, 
  onCancel 
}) => {
  const [formData, setFormData] = useState({
    categoryId: '',
    amount: '',
    month: month,
    year: year
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!budget;

  useEffect(() => {
    if (budget) {
      setFormData({
        categoryId: budget.categoryId.toString(),
        amount: budget.amount.toString(),
        month: budget.month,
        year: budget.year
      });
    } else {
      setFormData(prev => ({
        ...prev,
        month: month,
        year: year
      }));
    }
  }, [budget, month, year]);

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
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.categoryId) {
      newErrors.categoryId = 'Please select a category';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Budget amount must be greater than 0';
    }

    // Check if budget already exists for this category/month/year (when not editing)
    if (!isEditing) {
      const existingBudget = existingBudgets.find(b => 
        b.categoryId.toString() === formData.categoryId &&
        b.month === formData.month &&
        b.year === formData.year
      );
      if (existingBudget) {
        newErrors.categoryId = 'Budget already exists for this category and period';
      }
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
        categoryId: parseInt(formData.categoryId),
        amount: parseFloat(formData.amount),
        month: formData.month,
        year: formData.year
      };

      await budgetService.createOrUpdateBudget(submitData);
      onSuccess();
    } catch (error) {
      console.error('Error saving budget:', error);
      setErrors({ 
        submit: error.response?.data?.message || 'Failed to save budget. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableCategories = categories.filter(category => {
    if (isEditing && category.id.toString() === formData.categoryId) {
      return true; // Allow current category when editing
    }
    // Filter out categories that already have budgets for this period
    return !existingBudgets.some(b => 
      b.categoryId === category.id &&
      b.month === formData.month &&
      b.year === formData.year
    );
  });

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <form className="budget-form" onSubmit={handleSubmit}>
      {errors.submit && (
        <div className="error-message mb-4">
          {errors.submit}
        </div>
      )}

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
          disabled={isSubmitting || isEditing}
        >
          <option value="">Select a category</option>
          {availableCategories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {errors.categoryId && (
          <div className="form-error">{errors.categoryId}</div>
        )}
        {availableCategories.length === 0 && !isEditing && (
          <p className="text-xs text-gray-500 mt-1">
            All expense categories already have budgets for this period
          </p>
        )}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="amount">
          Budget Amount ($)
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

      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="month">
            Month
          </label>
          <select
            id="month"
            name="month"
            className="form-select"
            value={formData.month}
            onChange={handleChange}
            disabled={isSubmitting}
          >
            {months.map((monthName, index) => (
              <option key={index} value={index + 1}>
                {monthName}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="year">
            Year
          </label>
          <input
            type="number"
            id="year"
            name="year"
            className="form-input"
            value={formData.year}
            onChange={handleChange}
            min="2020"
            max="2030"
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="budget-preview">
        <p className="text-sm text-gray-600">
          This budget will be for <strong>{months[formData.month - 1]} {formData.year}</strong>
          {formData.categoryId && formData.amount && (
            <>
              <br />
              Setting a <strong>${formData.amount}</strong> limit for{' '}
              <strong>
                {categories.find(c => c.id.toString() === formData.categoryId)?.name}
              </strong>
            </>
          )}
        </p>
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
          disabled={isSubmitting || availableCategories.length === 0}
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner size="small" />
              <span style={{ marginLeft: '8px' }}>
                {isEditing ? 'Updating...' : 'Creating...'}
              </span>
            </>
          ) : (
            isEditing ? 'Update Budget' : 'Add Budget'
          )}
        </button>
      </div>
    </form>
  );
};

export default BudgetForm;