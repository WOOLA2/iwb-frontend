import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Cart = () => {
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem('cart')) || []);
  const navigate = useNavigate();

  const handleProceedToPayment = () => {
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    navigate('/payment');
  };

  const handleRemove = (productId) => {
    const updatedCart = cart.filter(item => item._id !== productId);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const updateQuantity = (productId, quantity) => {
    const updatedCart = cart.map(item =>
      item._id === productId ? { ...item, quantity: Math.max(1, quantity) } : item
    );
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
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
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px' }}>
      <div style={containerStyle}>
        <Link to="/products" style={{ textDecoration: 'none' }}>
          <button style={{ ...buttonStyle, marginBottom: '20px' }}>
            ← Back to Products
          </button>
        </Link>

        <h2 style={{ textAlign: 'center', color: '#333', marginBottom: '25px' }}>
          Your Cart
        </h2>

        {cart.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666', fontSize: '16px' }}>
            Your cart is empty.
          </p>
        ) : (
          <>
            <ul style={{ listStyleType: 'none', padding: 0 }}>
              {cart.map(item => (
                <li key={item._id} style={{
                  marginBottom: '20px',
                  padding: '15px',
                  border: '1px solid #bbb',
                  borderRadius: '8px',
                  backgroundColor: '#fff',
                  boxShadow: '2px 2px 5px rgba(0,0,0,0.1)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div style={{ flex: 1 }}>
                    <strong style={{ fontSize: '16px', color: '#333' }}>
                      {item.name}
                    </strong>
                    <p style={{ margin: '5px 0', fontSize: '14px' }}>
                      ${item.price.toFixed(2)} ×
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item._id, parseInt(e.target.value))}
                        min="1"
                        style={{
                          width: '60px',
                          margin: '0 10px',
                          padding: '5px',
                          fontSize: '14px',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                        }}
                      />
                      = <strong>${(item.price * item.quantity).toFixed(2)}</strong>
                    </p>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      Category: {item.category || 'N/A'}<br />
                      Description: {item.description || 'N/A'}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemove(item._id)}
                    style={{
                      padding: '8px 15px',
                      backgroundColor: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#d32f2f'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#f44336'}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>

            <p style={{
              fontWeight: 'bold',
              textAlign: 'right',
              fontSize: '18px',
              color: '#333',
              marginTop: '20px',
            }}>
              Total: ${cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
            </p>

            <div style={{ textAlign: 'right' }}>
              <button
                onClick={handleProceedToPayment}
                style={{
                  ...buttonStyle,
                  backgroundColor: '#4CAF50',
                  padding: '12px 30px',
                  fontSize: '16px',
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#45a049'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#4CAF50'}
              >
                Proceed to Payment
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;