import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TransactionForm from '../transactions/TransactionForm';
import Modal from '../common/Modal';

const QuickActions = ({ onActionComplete }) => {
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const navigate = useNavigate();

  const quickActions = [
    {
      title: 'Add Transaction',
      description: 'Record income or expense',
      icon: '💳',
      color: 'blue',
      action: () => setShowTransactionModal(true)
    },
    {
      title: 'View Transactions',
      description: 'See all your transactions',
      icon: '📋',
      color: 'green',
      action: () => navigate('/transactions')
    },
    {
      title: 'Manage Categories',
      description: 'Organize your spending',
      icon: '🏷️',
      color: 'orange',
      action: () => navigate('/categories')
    },
    {
      title: 'Set Budgets',
      description: 'Plan your spending',
      icon: '🎯',
      color: 'purple',
      action: () => navigate('/budgets')
    }
  ];

  const handleTransactionSuccess = () => {
    setShowTransactionModal(false);
    if (onActionComplete) {
      onActionComplete();
    }
  };

  return (
    <>
      <div className="card">
        <div className="card-header">
          <h2>Quick Actions</h2>
        </div>
        <div className="card-body">
          <div className="quick-actions-grid">
            {quickActions.map((action, index) => (
              <button
                key={index}
                className={`quick-action-button quick-action-${action.color}`}
                onClick={action.action}
              >
                <div className="quick-action-icon">
                  {action.icon}
                </div>
                <div className="quick-action-content">
                  <div className="quick-action-title">
                    {action.title}
                  </div>
                  <div className="quick-action-description">
                    {action.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <Modal
        isOpen={showTransactionModal}
        onClose={() => setShowTransactionModal(false)}
        title="Add New Transaction"
      >
        <TransactionForm
          onSuccess={handleTransactionSuccess}
          onCancel={() => setShowTransactionModal(false)}
        />
      </Modal>
    </>
  );
};

export default QuickActions;