import React, { useEffect, useState } from 'react';
import { auth } from '../firebase';

const SalesPage = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const user = auth.currentUser;
        if (!user) throw new Error('User not authenticated');
        const token = await user.getIdToken(true);
        const res = await fetch('http://localhost:5000/api/sales', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Failed to fetch sales: ${res.statusText}`);
        const data = await res.json();
        console.log('Sales data received:', data);
        // Ensure sales data has populated productId
        setSales(data.filter(sale => sale.productId && sale.date));
        setLoading(false);
      } catch (err) {
        console.error('Fetch sales error:', err);
        setError(err.message);
        setLoading(false);
      }
    };
    fetchSales();
  }, []);

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

  if (loading) return <div style={{ textAlign: 'center', color: '#666', fontSize: '16px' }}>Loading...</div>;
  if (error) return <div style={{ textAlign: 'center', color: '#f44336', fontSize: '16px' }}>Error: {error}</div>;

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px' }}>
      <div style={containerStyle}>
        <h2 style={{ textAlign: 'center', color: '#333', marginBottom: '25px' }}>Sales</h2>
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
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SalesPage;