import React from 'react';

const Summary = ({ data }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const summaryCards = [
    {
      title: 'Total Income',
      value: data.totalIncome,
      icon: '💰',
      color: 'green',
      trend: data.totalIncome > 0 ? 'positive' : 'neutral'
    },
    {
      title: 'Total Expenses',
      value: data.totalExpenses,
      icon: '💸',
      color: 'red',
      trend: 'negative'
    },
    {
      title: 'Balance',
      value: data.balance,
      icon: data.balance >= 0 ? '📈' : '📉',
      color: data.balance >= 0 ? 'green' : 'red',
      trend: data.balance >= 0 ? 'positive' : 'negative'
    },
    {
      title: 'Transactions',
      value: data.transactionCount,
      icon: '📊',
      color: 'blue',
      trend: 'neutral',
      isCount: true
    }
  ];

  return (
    <div className="summary-grid">
      {summaryCards.map((card, index) => (
        <div key={index} className={`summary-card summary-card-${card.color}`}>
          <div className="summary-card-header">
            <div className="summary-card-icon">
              {card.icon}
            </div>
            <div className="summary-card-title">
              {card.title}
            </div>
          </div>
          
          <div className="summary-card-content">
            <div className={`summary-card-value ${card.trend}`}>
              {card.isCount ? card.value : formatCurrency(Math.abs(card.value))}
            </div>
            
            {!card.isCount && card.value !== 0 && (
              <div className={`summary-card-indicator ${card.trend}`}>
                {card.trend === 'positive' && '+'}
                {card.trend === 'negative' && '-'}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Summary;