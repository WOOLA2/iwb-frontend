import React, { useEffect, useState } from 'react';
import { auth } from '../firebase';

const SalesPage = () => {
  const [sales, setSales] = useState([]);
  const [additionalExpenses, setAdditionalExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expenseForm, setExpenseForm] = useState({ saleId: '', name: '', amount: '', type: 'sale-related' });
  const [editForm, setEditForm] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) throw new Error('User not authenticated');
        const token = await user.getIdToken(true);
        console.log('User token:', token);

        // Fetch sales
        const salesRes = await fetch('http://localhost:5000/api/sales', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!salesRes.ok) {
          const errorText = await salesRes.text();
          throw new Error(`Failed to fetch sales: ${salesRes.status} ${errorText}`);
        }
        const salesData = await salesRes.json();
        console.log('Sales data received:', salesData);
        setSales(salesData.filter(sale => sale.productId && sale.date));

        // Fetch additional expenses (optional)
        try {
          const expensesRes = await fetch('http://localhost:5000/api/expenses', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!expensesRes.ok) {
            const errorText = await expensesRes.text();
            console.warn(`Failed to fetch expenses: ${expensesRes.status} ${errorText}`);
            setAdditionalExpenses([]); // Fallback to empty array
          } else {
            const expensesData = await expensesRes.json();
            console.log('Additional expenses received:', expensesData);
            setAdditionalExpenses(expensesData);
          }
        } catch (err) {
          console.warn('Expenses fetch error (continuing without expenses):', err.message);
          setAdditionalExpenses([]);
        }

        // Fetch products for edit form
        const productsRes = await fetch('http://localhost:5000/api/products', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!productsRes.ok) {
          const errorText = await productsRes.text();
          throw new Error(`Failed to fetch products: ${productsRes.status} ${errorText}`);
        }
        const productsData = await productsRes.json();
        console.log('Products data received:', productsData);
        setProducts(productsData);

        setLoading(false);
      } catch (err) {
        console.error('Fetch data error:', err);
        setError(err.message);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');
      const token = await user.getIdToken(true);

      if (expenseForm.type === 'sale-related') {
        const sale = sales.find(s => s._id === expenseForm.saleId);
        if (!sale) throw new Error('Sale not found');

        const newExpense = { name: expenseForm.name, amount: parseFloat(expenseForm.amount) };
        if (!newExpense.name || isNaN(newExpense.amount) || newExpense.amount < 0) {
          throw new Error('Invalid expense: name and non-negative amount required');
        }

        const updatedExpenses = [...(sale.expenses || []), newExpense];
        const res = await fetch(`http://localhost:5000/api/sales/${expenseForm.saleId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            productId: sale.productId._id,
            quantity: sale.quantity,
            total: sale.total,
            date: sale.date,
            expenses: updatedExpenses,
          }),
        });
        if (!res.ok) throw new Error(`Failed to add expense: ${await res.text()}`);
        const updatedSale = await res.json();
        setSales(sales.map(s => (s._id === updatedSale._id ? updatedSale : s)));
      } else {
        const newExpense = {
          name: expenseForm.name,
          amount: parseFloat(expenseForm.amount),
          date: new Date().toISOString(),
        };
        if (!newExpense.name || isNaN(newExpense.amount) || newExpense.amount < 0) {
          throw new Error('Invalid expense: name and non-negative amount required');
        }

        const res = await fetch('http://localhost:5000/api/expenses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newExpense),
        });
        if (!res.ok) throw new Error(`Failed to add additional expense: ${await res.text()}`);
        const createdExpense = await res.json();
        setAdditionalExpenses([createdExpense, ...additionalExpenses]);
      }

      setExpenseForm({ saleId: '', name: '', amount: '', type: 'sale-related' });
      alert('Expense added successfully');
    } catch (err) {
      console.error('Add expense error:', err);
      setError(err.message);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');
      const token = await user.getIdToken(true);

      const { _id, productId, quantity, total, date } = editForm;
      const res = await fetch(`http://localhost:5000/api/sales/${_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId,
          quantity: parseInt(quantity),
          total: parseFloat(total),
          date,
          expenses: editForm.expenses || [],
        }),
      });
      if (!res.ok) throw new Error(`Failed to update sale: ${await res.text()}`);
      const updatedSale = await res.json();
      setSales(sales.map(s => (s._id === updatedSale._id ? updatedSale : s)));
      setEditForm(null);
      alert('Sale updated successfully');
    } catch (err) {
      console.error('Update sale error:', err);
      setError(err.message);
    }
  };

  const handleDelete = async (saleId) => {
    if (!window.confirm('Are you sure you want to delete this sale?')) return;
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');
      const token = await user.getIdToken(true);

      const res = await fetch(`http://localhost:5000/api/sales/${saleId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Failed to delete sale: ${await res.text()}`);
      setSales(sales.filter(s => s._id !== saleId));
      alert('Sale deleted successfully');
    } catch (err) {
      console.error('Delete sale error:', err);
      setError(err.message);
    }
  };

  const containerStyle = {
    maxWidth: '900px',
    margin: '30px auto',
    padding: '25px',
    border: '2px solid #ccc',
    borderRadius: '12px',
    backgroundColor: '#f9f9f9',
    boxShadow: '0 6px 12px rgba(0,0,0,0.1)',
    fontFamily: 'Arial, sans-serif',
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    margin: '8px 0',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '14px',
  };

  const buttonStyle = {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    margin: '0 5px',
  };

  console.log('Rendering SalesPage, state:', { loading, error, salesLength: sales.length, additionalExpensesLength: additionalExpenses.length });

  if (loading) {
    console.log('Showing loading state');
    return <div style={{ textAlign: 'center', color: '#666', fontSize: '16px' }}>Loading...</div>;
  }
  if (error) {
    console.log('Showing error state:', error);
    return <div style={{ textAlign: 'center', color: '#f44336', fontSize: '16px' }}>Error: {error}</div>;
  }

  console.log('Rendering main content');

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px' }}>
      <div style={containerStyle}>
        <h2 style={{ textAlign: 'center', color: '#333', marginBottom: '25px' }}>Sales Management</h2>

        {/* Expense Form */}
        <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <h3 style={{ color: '#333', marginBottom: '15px' }}>Add Expense</h3>
          <form onSubmit={handleExpenseSubmit}>
            <select
              name="type"
              value={expenseForm.type}
              onChange={e => setExpenseForm({ ...expenseForm, type: e.target.value })}
              required
              style={inputStyle}
            >
              <option value="sale-related">Sale-Related</option>
              <option value="additional">Additional (Not Sale-Related)</option>
            </select>
            {expenseForm.type === 'sale-related' && (
              <select
                name="saleId"
                value={expenseForm.saleId}
                onChange={e => setExpenseForm({ ...expenseForm, saleId: e.target.value })}
                required
                style={inputStyle}
              >
                <option value="">Select Sale</option>
                {sales.map(sale => (
                  <option key={sale._id} value={sale._id}>
                    {sale.productId?.name || 'Unknown Product'} - {new Date(sale.date).toLocaleDateString()}
                  </option>
                ))}
              </select>
            )}
            <input
              type="text"
              name="name"
              placeholder="Expense Name"
              value={expenseForm.name}
              onChange={e => setExpenseForm({ ...expenseForm, name: e.target.value })}
              required
              style={inputStyle}
            />
            <input
              type="number"
              name="amount"
              placeholder="Amount"
              value={expenseForm.amount}
              onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })}
              required
              min="0"
              step="0.01"
              style={inputStyle}
            />
            <button
              type="submit"
              style={{ ...buttonStyle, backgroundColor: '#4CAF50', width: '100%' }}
              onMouseOver={e => (e.target.style.backgroundColor = '#45a049')}
              onMouseOut={e => (e.target.style.backgroundColor = '#4CAF50')}
            >
              Add Expense
            </button>
          </form>
        </div>

        {/* Additional Expenses List */}
        {additionalExpenses.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: '#333', marginBottom: '15px' }}>Additional Expenses</h3>
            <ul style={{ listStyleType: 'none', padding: 0 }}>
              {additionalExpenses.map(expense => (
                <li
                  key={expense._id}
                  style={{
                    marginBottom: '15px',
                    padding: '15px',
                    border: '1px solid #bbb',
                    borderRadius: '8px',
                    backgroundColor: '#fff',
                    boxShadow: '2px 2px 5px rgba(0,0,0,0.1)',
                  }}
                >
                  <span style={{ fontWeight: 'bold', color: '#333' }}>
                    {expense.name}
                  </span>
                  {' - '}
                  <span>
                    ${expense.amount.toFixed(2)}
                  </span>
                  {' - '}
                  <span>
                    {new Date(expense.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Sales List */}
        <h3 style={{ color: '#333', marginBottom: '15px' }}>Sales</h3>
        {sales.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666', fontSize: '16px' }}>No sales available</p>
        ) : (
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {sales.map(sale => (
              <li
                key={sale._id}
                style={{
                  marginBottom: '15px',
                  padding: '15px',
                  border: '1px solid #bbb',
                  borderRadius: '8px',
                  backgroundColor: '#fff',
                  boxShadow: '2px 2px 5px rgba(0,0,0,0.1)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontWeight: 'bold', color: '#333' }}>
                      {sale.date && !isNaN(new Date(sale.date).getTime())
                        ? new Date(sale.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : 'Invalid Date'}
                    </span>
                    {' - '}
                    <span>{sale.quantity ? sale.quantity : 'N/A'} x </span>
                    <span>{sale.productId?.name || 'Unknown Product'}</span>
                    {' - '}
                    <span>
                      ${sale.total !== undefined && sale.total !== null ? sale.total.toFixed(2) : 'N/A'}
                    </span>
                    {sale.expenses && sale.expenses.length > 0 && (
                      <div style={{ marginTop: '10px' }}>
                        <strong>Expenses:</strong>
                        <ul style={{ paddingLeft: '20px' }}>
                          {sale.expenses.map((expense, index) => (
                            <li key={index}>
                              {expense.name}: ${expense.amount.toFixed(2)}
                            </li>
                          ))}
                        </ul>
                        <strong>Total Expenses: ${sale.expenseTotal.toFixed(2)}</strong>
                      </div>
                    )}
                  </div>
                  <div>
                    <button
                      onClick={() => setEditForm({
                        _id: sale._id,
                        productId: sale.productId._id,
                        quantity: sale.quantity,
                        total: sale.total,
                        date: new Date(sale.date).toISOString().split('T')[0],
                        expenses: sale.expenses,
                      })}
                      style={{ ...buttonStyle, backgroundColor: '#FFC107' }}
                      onMouseOver={e => (e.target.style.backgroundColor = '#FFB300')}
                      onMouseOut={e => (e.target.style.backgroundColor = '#FFC107')}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(sale._id)}
                      style={{ ...buttonStyle, backgroundColor: '#f44336' }}
                      onMouseOver={e => (e.target.style.backgroundColor = '#d32f2f')}
                      onMouseOut={e => (e.target.style.backgroundColor = '#f44336')}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Edit Form */}
        {editForm && (
          <div style={{ marginTop: '20px' }}>
            <h3 style={{ color: '#333', marginBottom: '15px' }}>Edit Sale</h3>
            <form onSubmit={handleEditSubmit}>
              <select
                name="productId"
                value={editForm.productId}
                onChange={e => setEditForm({ ...editForm, productId: e.target.value })}
                required
                style={inputStyle}
              >
                <option value="">Select Product</option>
                {products.map(product => (
                  <option key={product._id} value={product._id}>
                    {product.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                name="quantity"
                placeholder="Quantity"
                value={editForm.quantity}
                onChange={e => setEditForm({ ...editForm, quantity: e.target.value })}
                required
                min="1"
                style={inputStyle}
              />
              <input
                type="number"
                name="total"
                placeholder="Total"
                value={editForm.total}
                onChange={e => setEditForm({ ...editForm, total: e.target.value })}
                required
                min="0"
                step="0.01"
                style={inputStyle}
              />
              <input
                type="date"
                name="date"
                value={editForm.date}
                onChange={e => setEditForm({ ...editForm, date: e.target.value })}
                required
                style={inputStyle}
              />
              <button
                type="submit"
                style={{ ...buttonStyle, backgroundColor: '#4CAF50', width: '100%' }}
                onMouseOver={e => (e.target.style.backgroundColor = '#45a049')}
                onMouseOut={e => (e.target.style.backgroundColor = '#4CAF50')}
              >
                Update Sale
              </button>
              <button
                type="button"
                onClick={() => setEditForm(null)}
                style={{ ...buttonStyle, backgroundColor: '#f44336', width: '100%', marginTop: '10px' }}
                onMouseOver={e => (e.target.style.backgroundColor = '#d32f2f')}
                onMouseOut={e => (e.target.style.backgroundColor = '#f44336')}
              >
                Cancel
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesPage;