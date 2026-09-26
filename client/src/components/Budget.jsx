import React, { useState, useEffect } from 'react';
import { DollarSign, PieChart, TrendingUp, Plus, Trash2, Loader } from 'lucide-react';

const Budget = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalBudget, setTotalBudget] = useState(25000);
  const [budgetStyle, setBudgetStyle] = useState('Mid-range');

  const loadExpenses = () => {
    const token = localStorage.getItem('token');

    // Fetch active trip budget details
    fetch('/api/trips/active', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(trip => {
        if (trip.totalBudget) setTotalBudget(trip.totalBudget);
        if (trip.budgetStyle) setBudgetStyle(trip.budgetStyle);
      })
      .catch(err => console.error('Error fetching active trip details:', err));

    fetch('/api/expenses', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setExpenses(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching expenses:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadExpenses();
    window.addEventListener('trip-updated', loadExpenses);
    return () => window.removeEventListener('trip-updated', loadExpenses);
  }, []);

  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const percentageSpent = Math.min((totalSpent / totalBudget) * 100, 100);

  if (loading) {
    return (
      <div style={{ padding: '4rem', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
        <Loader className="text-primary animate-spin" size={40} style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }} className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Trip <span className="text-gradient">Budget</span></h2>
          <p className="text-muted">Track your spending (Style: {budgetStyle}). Stay on budget.</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => {
            const title = window.prompt("Enter expense description (e.g., 'Seafood Dinner at Shack'):");
            if (!title) return;
            const amountStr = window.prompt("Enter amount (₹):");
            if (!amountStr) return;
            const amount = parseFloat(amountStr);
            if (isNaN(amount) || amount <= 0) {
              alert("Please enter a valid positive number for the amount.");
              return;
            }
            const category = window.prompt("Enter category (e.g., Transport, Accommodation, Activities, Food, Shopping):", "Food");
            if (!category) return;

            const dateString = new Date().toISOString().split('T')[0];
            const token = localStorage.getItem('token');

            fetch('/api/expenses', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ title, amount, category, dateString })
            })
            .then(res => {
              if (!res.ok) throw new Error('Failed to add expense');
              return res.json();
            })
            .then(newExpense => {
              setExpenses([...expenses, newExpense]);
            })
            .catch(err => alert(err.message));
          }}
        >
          <Plus size={18} /> Add Expense
        </button>
      </div>

      {/* Budget Summary Tracker */}
      <div className="glass-panel" style={{ marginBottom: '2rem', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'flex-end' }}>
          <div>
            <p className="text-muted" style={{ marginBottom: '0.5rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={18} className="text-primary" /> Total Spent
            </p>
            <h3 style={{ fontSize: '2.5rem', margin: 0 }}>
              ₹{totalSpent.toLocaleString()} <span className="text-muted" style={{ fontSize: '1.25rem', fontWeight: 400 }}>/ ₹{totalBudget.toLocaleString()}</span>
            </h3>
          </div>
        </div>
        
        <div style={{ width: '100%', height: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '999px', overflow: 'hidden' }}>
          <div style={{ 
            height: '100%', 
            width: `${percentageSpent}%`, 
            background: percentageSpent > 90 ? 'var(--color-danger)' : 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))',
            borderRadius: '999px',
            transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
          }}></div>
        </div>
      </div>

      {/* Expenses List */}
      <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <PieChart size={20} className="text-primary" /> Recent Expenses
      </h3>
      
      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        {expenses.map((expense, i) => (
          <div 
            key={expense._id || expense.id || i}
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: '1.25rem 1.5rem',
              borderBottom: i < expenses.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              background: 'rgba(255,255,255,0.02)',
              transition: 'background 0.2s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '10px', 
                background: 'rgba(139, 92, 246, 0.1)', 
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <DollarSign size={20} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: '1.1rem', letterSpacing: 'normal', textTransform: 'none' }}>
                  {expense.title}
                </h4>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
                  <span className="text-muted" style={{ fontSize: '0.85rem' }}>{expense.dateString}</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-secondary)', background: 'rgba(6, 182, 212, 0.1)', padding: '0 0.5rem', borderRadius: '1rem' }}>
                    {expense.category}
                  </span>
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>
                ₹{expense.amount.toLocaleString()}
              </span>
              <button 
                style={{ color: 'var(--color-text-muted)', transition: 'color 0.2s', padding: '0.25rem', cursor: 'pointer' }} 
                onMouseEnter={e => e.currentTarget.style.color = 'var(--color-danger)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}
                onClick={() => {
                  if (!window.confirm(`Are you sure you want to delete "${expense.title}"?`)) return;
                  const token = localStorage.getItem('token');
                  fetch(`/api/expenses/${expense._id || expense.id}`, {
                    method: 'DELETE',
                    headers: {
                      'Authorization': `Bearer ${token}`
                    }
                  })
                  .then(res => {
                    if (!res.ok) throw new Error('Failed to delete expense');
                    setExpenses(expenses.filter(e => (e._id || e.id) !== (expense._id || expense.id)));
                  })
                  .catch(err => alert(err.message));
                }}
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Budget;
