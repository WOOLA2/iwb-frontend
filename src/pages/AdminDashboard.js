import React, { useEffect, useState } from 'react';
import { auth } from '../firebase';
import IncomeChart from '../components/IncomeChart';
import ProductForm from '../components/ProductForm';
import SalesPage from '../pages/SalesPage';

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [queries, setQueries] = useState([]);
  const [incomeData, setIncomeData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('products');
  const [cachedToken, setCachedToken] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', price: '', stock: '', category: '', description: '' });
  const [replyForms, setReplyForms] = useState({}); // State to manage reply inputs for each query

  useEffect(() => {
    const initialize = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          throw new Error('No user logged in. Please log in again.');
        }
        const token = await user.getIdToken(true);
        setCachedToken(token);
        const tokenResult = await user.getIdTokenResult();
        if (!tokenResult.claims.role || !['admin', 'sales', 'finance', 'investor'].includes(tokenResult.claims.role)) {
          throw new Error('User lacks required role. Contact administrator to set "admin" role.');
        }
        setLoading(false);
      } catch (err) {
        if (err.code === 'auth/quota-exceeded') {
          setError('Firebase authentication quota exceeded. Please try again later or upgrade your Firebase plan.');
        } else {
          setError(err.message);
        }
        setLoading(false);
      }
    };
    initialize();
  }, []);

  useEffect(() => {
    if (loading || error || !cachedToken) return;

    const fetchData = async (url, setter, transform = (data) => data) => {
      try {
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${cachedToken}` },
        });
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`HTTP error! Status: ${res.status}, Message: ${errorText}`);
        }
        const data = await res.json();
        setter(transform(data));
      } catch (err) {
        setError(`Failed to load data from ${url}: ${err.message}`);
      }
    };

    fetchData('http://localhost:5000/api/products', setProducts);

    fetchData('http://localhost:5000/api/sales', (data) => {
      const validSales = data.filter(sale => 
        sale.productId && 
        sale.date && 
        !isNaN(new Date(sale.date).getTime()) && 
        typeof sale.total === 'number' && 
        !isNaN(sale.total)
      );
      setSales(validSales);
      return validSales;
    });

    fetchData('http://localhost:5000/api/queries', setQueries);

    fetchData('http://localhost:5000/api/income', (data) => {
      const salesByMonth = sales.reduce((acc, sale) => {
        const date = new Date(sale.date);
        const month = date.toLocaleString('default', { month: 'short', year: 'numeric' });
        const existing = acc.find(item => item.month === month);
        if (existing) {
          existing.sales += sale.total;
        } else {
          acc.push({ month, sales: sale.total, donations: 0, investments: 0 });
        }
        return acc;
      }, []);

      const incomeByMonth = data.monthly.reduce((acc, item) => {
        const date = new Date(item.date);
        const month = date.toLocaleString('default', { month: 'short', year: 'numeric' });
        const existing = acc.find(i => i.month === month);
        if (existing) {
          if (item.source === 'Donation') existing.donations += item.amount;
          if (item.source === 'Investment') existing.investments += item.amount;
        } else {
          acc.push({
            month,
            sales: 0,
            donations: item.source === 'Donation' ? item.amount : 0,
            investments: item.source === 'Investment' ? item.amount : 0,
          });
        }
        return acc;
      }, []);

      const mergedData = [];
      const allMonths = new Set([...salesByMonth.map(s => s.month), ...incomeByMonth.map(i => i.month)]);

      allMonths.forEach(month => {
        const salesEntry = salesByMonth.find(s => s.month === month) || { sales: 0 };
        const incomeEntry = incomeByMonth.find(i => i.month === month) || { sales: 0, donations: 0, investments: 0 };
        mergedData.push({
          month,
          sales: salesEntry.sales,
          donations: incomeEntry.donations,
          investments: incomeEntry.investments,
        });
      });

      const sortedData = mergedData.sort((a, b) => new Date(a.month) - new Date(b.month));
      setIncomeData(sortedData);
    });
  }, [loading, error, cachedToken, sales]);

  const handleDelete = async (productId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/products/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${cachedToken}` },
      });
      if (!res.ok) throw new Error('Failed to delete product');
      setProducts(products.filter(p => p._id !== productId));
      alert('Product deleted successfully!');
    } catch (err) {
      alert('Error deleting product: ' + err.message);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product._id);
    setEditForm({
      name: product.name,
      price: product.price,
      stock: product.stock,
      category: product.category || 'Recycled',
      description: product.description || '',
    });
  };

  const handleUpdate = async (e, productId) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cachedToken}`,
        },
        body: JSON.stringify({
          name: editForm.name,
          price: Number(editForm.price),
          stock: Number(editForm.stock),
          category: editForm.category,
          description: editForm.description,
        }),
      });
      if (!res.ok) throw new Error('Failed to update product');
      const updatedProduct = await res.json();
      setProducts(products.map(p => (p._id === productId ? updatedProduct : p)));
      setEditingProduct(null);
      alert('Product updated successfully!');
    } catch (err) {
      alert('Error updating product: ' + err.message);
    }
  };

  const handleReply = async (queryId) => {
    const reply = replyForms[queryId] || '';
    if (!reply.trim()) {
      alert('Please enter a reply before submitting.');
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/queries/${queryId}/reply`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cachedToken}`,
        },
        body: JSON.stringify({ reply }),
      });
      if (!res.ok) throw new Error('Failed to send reply');
      const updatedQuery = await res.json();
      setQueries(queries.map(q => (q._id === queryId ? updatedQuery : q)));
      setReplyForms({ ...replyForms, [queryId]: '' }); // Clear the reply input
      alert('Reply sent successfully!');
    } catch (err) {
      alert('Error sending reply: ' + err.message);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem('token');
      window.location.href = '/login';
    } catch (err) {
      console.error('Error logging out:', err.message);
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

  const buttonStyle = {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    margin: '5px',
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    margin: '8px 0',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '14px',
  };

  const textareaStyle = {
    ...inputStyle,
    height: '60px',
    resize: 'vertical',
  };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '50px', fontFamily: 'Arial, sans-serif' }}>
      <p style={{ fontSize: '18px', color: '#333' }}>Loading...</p>
    </div>
  );

  if (error) return (
    <div style={containerStyle}>
      <p style={{ color: '#f44336', fontSize: '16px', textAlign: 'center' }}>
        Error: {error}
      </p>
      <button
        onClick={handleLogout}
        style={{
          ...buttonStyle,
          backgroundColor: '#f44336',
          display: 'block',
          margin: '20px auto',
        }}
        onMouseOver={(e) => e.target.style.backgroundColor = '#d32f2f'}
        onMouseOut={(e) => e.target.style.backgroundColor = '#f44336'}
      >
        Log Out
      </button>
    </div>
  );

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px' }}>
      <div style={containerStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
          <h2 style={{ color: '#333', margin: 0 }}>Admin Dashboard</h2>
          <button
            onClick={handleLogout}
            style={{
              ...buttonStyle,
              backgroundColor: '#f44336',
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#d32f2f'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#f44336'}
          >
            Log Out
          </button>
        </div>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '10px',
          marginBottom: '25px',
          borderBottom: '2px solid #ccc',
          paddingBottom: '10px',
        }}>
          {['addProduct', 'products', 'sales', 'queries', 'income'].map(section => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              style={{
                ...buttonStyle,
                backgroundColor: activeSection === section ? '#0056b3' : '#007bff',
                padding: '8px 15px',
                fontSize: '14px',
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = activeSection === section ? '#003d82' : '#0056b3'}
              onMouseOut={(e) => e.target.style.backgroundColor = activeSection === section ? '#0056b3' : '#007bff'}
            >
              {section === 'addProduct' ? 'Add Product' :
               section === 'products' ? 'Products' :
               section === 'sales' ? 'Sales' :
               section === 'queries' ? 'Queries' :
               'Income Statement'}
            </button>
          ))}
        </div>

        {activeSection === 'addProduct' && (
          <div>
            <h3 style={{ color: '#333', marginBottom: '15px' }}>Add Product</h3>
            <ProductForm />
          </div>
        )}

        {activeSection === 'products' && (
          <div>
            <h3 style={{ color: '#333', marginBottom: '15px' }}>Products</h3>
            {products.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#666', fontSize: '16px' }}>
                No products available
              </p>
            ) : (
              <ul style={{ listStyleType: 'none', padding: 0 }}>
                {products.map(p => (
                  <li key={p._id} style={{
                    marginBottom: '20px',
                    padding: '15px',
                    border: '1px solid #bbb',
                    borderRadius: '8px',
                    backgroundColor: '#fff',
                    boxShadow: '2px 2px 5px rgba(0,0,0,0.1)',
                  }}>
                    {editingProduct === p._id ? (
                      <form onSubmit={(e) => handleUpdate(e, p._id)} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          placeholder="Product Name"
                          required
                          style={inputStyle}
                        />
                        <input
                          type="number"
                          value={editForm.price}
                          onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                          placeholder="Price"
                          required
                          style={inputStyle}
                        />
                        <input
                          type="number"
                          value={editForm.stock}
                          onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                          placeholder="Stock"
                          required
                          style={inputStyle}
                        />
                        <select
                          value={editForm.category}
                          onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                          style={{ ...inputStyle, padding: '10px' }}
                        >
                          <option value="Recycled">Recycled</option>
                          <option value="RAM">RAM</option>
                          <option value="Storage">Storage</option>
                          <option value="Motherboard">Motherboard</option>
                        </select>
                        <textarea
                          value={editForm.description}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          placeholder="Description"
                          style={{ ...inputStyle, height: '80px', resize: 'vertical' }}
                        />
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button
                            type="submit"
                            style={{
                              ...buttonStyle,
                              backgroundColor: '#4CAF50',
                            }}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#45a049'}
                            onMouseOut={(e) => e.target.style.backgroundColor = '#4CAF50'}
                          >
                            Update
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingProduct(null)}
                            style={{
                              ...buttonStyle,
                              backgroundColor: '#f44336',
                            }}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#d32f2f'}
                            onMouseOut={(e) => e.target.style.backgroundColor = '#f44336'}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ fontSize: '16px', color: '#333' }}>
                            {p.name}
                          </strong>
                          <p style={{ fontSize: '14px', color: '#666', margin: '5px 0' }}>
                            ${p.price} | Stock: {p.stock} | Category: {p.category || 'N/A'}
                          </p>
                          <p style={{ fontSize: '14px', color: '#666' }}>
                            {p.description || 'No description'}
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button
                            onClick={() => handleEdit(p)}
                            style={buttonStyle}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
                            onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(p._id)}
                            style={{
                              ...buttonStyle,
                              backgroundColor: '#f44336',
                            }}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#d32f2f'}
                            onMouseOut={(e) => e.target.style.backgroundColor = '#f44336'}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {activeSection === 'sales' && (
          <SalesPage />
        )}

        {activeSection === 'queries' && (
          <div>
            <h3 style={{ color: '#333', marginBottom: '15px' }}>Queries</h3>
            {queries.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#666', fontSize: '16px' }}>
                No queries available
              </p>
            ) : (
              <ul style={{ listStyleType: 'none', padding: 0 }}>
                {queries.map(q => (
                  <li key={q._id} style={{
                    marginBottom: '15px',
                    padding: '15px',
                    border: '1px solid #bbb',
                    borderRadius: '8px',
                    backgroundColor: '#fff',
                    boxShadow: '2px 2px 5px rgba(0,0,0,0.1)',
                  }}>
                    <p style={{ fontSize: '14px', color: '#333', margin: '5px 0' }}>
                      <strong>Name:</strong> {q.name}
                    </p>
                    <p style={{ fontSize: '14px', color: '#333', margin: '5px 0' }}>
                      <strong>Email:</strong> {q.email}
                    </p>
                    <p style={{ fontSize: '14px', color: '#333', margin: '5px 0' }}>
                      <strong>Message:</strong> {q.message}
                    </p>
                    {q.reply && (
                      <p style={{ fontSize: '14px', color: '#333', margin: '5px 0' }}>
                        <strong>Reply:</strong> {q.reply}
                      </p>
                    )}
                    <p style={{ fontSize: '14px', color: '#666', margin: '5px 0' }}>
                      <strong>Status:</strong> {q.status}
                    </p>
                    {q.status === 'pending' && (
                      <div style={{ marginTop: '10px' }}>
                        <textarea
                          placeholder="Write your reply here..."
                          value={replyForms[q._id] || ''}
                          onChange={(e) => setReplyForms({ ...replyForms, [q._id]: e.target.value })}
                          style={textareaStyle}
                        />
                        <button
                          onClick={() => handleReply(q._id)}
                          style={{
                            ...buttonStyle,
                            backgroundColor: '#4CAF50',
                            marginTop: '10px',
                          }}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#45a049'}
                          onMouseOut={(e) => e.target.style.backgroundColor = '#4CAF50'}
                        >
                          Send Reply
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {activeSection === 'income' && (
          <div>
            <h3 style={{ color: '#333', marginBottom: '15px' }}>Income Statement</h3>
            {incomeData.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#666', fontSize: '16px' }}>
                No data available
              </p>
            ) : (
              <div style={{
                padding: '20px',
                backgroundColor: '#fff',
                border: '1px solid #bbb',
                borderRadius: '8px',
                boxShadow: '2px 2px 5px rgba(0,0,0,0.1)',
              }}>
                <IncomeChart income={incomeData} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;