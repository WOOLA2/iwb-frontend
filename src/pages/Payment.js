import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Payment = () => {
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem('cart')) || []);
  const [form, setForm] = useState({
    name: '',
    surname: '',
    paymentMethod: 'account',
    accountNumber: '',
    cvv: '',
    mobile: '',
    pin: '',
    country: '',
    address: '',
    streetNumber: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (form.paymentMethod === 'account') {
      if (!/^\d{13}$/.test(form.accountNumber)) {
        setError('Account number must be 13 digits.');
        return;
      }
      if (!/^\d{3}$/.test(form.cvv)) {
        setError('CVV must be 3 digits.');
        return;
      }
    } else {
      if (!/^\d{8}$/.test(form.mobile)) {
        setError('Mobile number must be 8 digits.');
        return;
      }
      if (!/^\d{4}$/.test(form.pin)) {
        setError('PIN must be 4 digits.');
        return;
      }
    }

    if (!form.name || !form.surname || !form.country || !form.address || !form.streetNumber) {
      setError('All fields are required.');
      return;
    }

    try {
      console.log('Cart contents:', cart.map(item => ({
        id: item._id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })));

      // Validate cart items
      const validCartItems = [];
      for (const item of cart) {
        console.log(`Fetching product with ID: ${item._id}`);
        const res = await fetch(`http://localhost:5000/api/products/${item._id}`);
        if (!res.ok) {
          const errorText = await res.text();
          console.error(`Failed to fetch product ${item.name}: Status ${res.status}, ${errorText}`);
          setError(`Product ${item.name} not found or inaccessible. Clearing cart.`);
          setCart([]);
          localStorage.removeItem('cart');
          return;
        }
        const product = await res.json();
        console.log(`Fetched product:`, product);
        if (!product) {
          console.error(`Product ${item.name} returned null for ID: ${item._id}`);
          setError(`Product ${item.name} not found. Clearing cart.`);
          setCart([]);
          localStorage.removeItem('cart');
          return;
        }
        if (product.stock < item.quantity) {
          setError(`Insufficient stock for ${item.name}. Only ${product.stock} available.`);
          return;
        }
        validCartItems.push({ ...item, product });
      }

      // Update stock and record sales
      for (const item of validCartItems) {
        console.log(`Updating stock for ${item.name}, ID: ${item._id}`);
        const updateRes = await fetch(`http://localhost:5000/api/products/${item._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: item.product.name,
            price: item.product.price,
            stock: item.product.stock - item.quantity,
            category: item.product.category || '',
            description: item.product.description || '',
          }),
        });
        if (!updateRes.ok) {
          const errorText = await updateRes.text();
          console.error(`Stock update error for ${item.name}: Status ${updateRes.status}, ${errorText}`);
          if (updateRes.status === 401) {
            setError(`Cannot update stock for ${item.name}: Unauthorized access. Please contact support.`);
          } else {
            setError(`Failed to update stock for ${item.name}: ${errorText}`);
          }
          throw new Error(`Failed to update stock for ${item.name}: ${errorText}`);
        }
        console.log(`Stock updated for ${item.name}`);

        console.log(`Recording sale for ${item.name}`);
        const saleRes = await fetch('http://localhost:5000/api/sales', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productId: item._id,
            quantity: item.quantity,
            total: (item.price * item.quantity).toFixed(2),
            date: new Date().toISOString(),
          }),
        });
        if (!saleRes.ok) {
          const errorText = await saleRes.text();
          console.error(`Sale creation error for ${item.name}: Status ${saleRes.status}, ${errorText}`);
          if (saleRes.status === 401) {
            setError(`Cannot record sale for ${item.name}: Unauthorized access. Please contact support.`);
          } else {
            setError(`Failed to record sale for ${item.name}: ${errorText}`);
          }
          throw new Error(`Failed to record sale for ${item.name}: ${errorText}`);
        }
        console.log(`Sale recorded for ${item.name}`);
      }

      // Clear cart
      setCart([]);
      localStorage.removeItem('cart');

      // Show success message
      alert('Paid successfully! You will be notified when your delivery is ready.');
      navigate('/products');
    } catch (err) {
      console.error('Payment error:', err);
      setError('Error processing payment: ' + err.message);
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
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    margin: '8px 0',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '14px',
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px' }}>
      <div style={containerStyle}>
        <Link to="/cart" style={{ textDecoration: 'none' }}>
          <button style={{ ...buttonStyle, marginBottom: '20px' }}>
            ← Back to Cart
          </button>
        </Link>

        <h2 style={{ textAlign: 'center', color: '#333', marginBottom: '25px' }}>
          Payment Method
        </h2>

        {cart.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666', fontSize: '16px' }}>
            No items selected.
          </p>
        ) : (
          <>
            <h3 style={{ color: '#333', marginBottom: '15px' }}>Selected Items</h3>
            <ul style={{ listStyleType: 'none', padding: 0, marginBottom: '20px' }}>
              {cart.map(item => (
                <li key={item._id} style={{
                  marginBottom: '15px',
                  padding: '15px',
                  border: '1px solid #bbb',
                  borderRadius: '8px',
                  backgroundColor: '#fff',
                  boxShadow: '2px 2px 5px rgba(0,0,0,0.1)',
                }}>
                  <strong style={{ fontSize: '16px', color: '#333' }}>
                    {item.name}
                  </strong>
                  <p style={{ margin: '5px 0', fontSize: '14px' }}>
                    ${item.price.toFixed(2)} × {item.quantity} = <strong>${(item.price * item.quantity).toFixed(2)}</strong>
                  </p>
                  <p style={{ fontSize: '14px', color: '#666' }}>
                    Category: {item.category || 'N/A'}<br />
                    Description: {item.description || 'N/A'}
                  </p>
                </li>
              ))}
            </ul>
            <p style={{
              fontWeight: 'bold',
              textAlign: 'right',
              fontSize: '18px',
              color: '#333',
            }}>
              Total: ${cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
            </p>
          </>
        )}

        <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
          <h3 style={{ color: '#333', marginBottom: '15px' }}>Payment Details</h3>
          {error && (
            <p style={{ color: '#f44336', fontSize: '14px', marginBottom: '15px' }}>
              {error}
            </p>
          )}
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            required
            style={inputStyle}
          />
          <input
            type="text"
            name="surname"
            placeholder="Surname"
            value={form.surname}
            onChange={handleChange}
            required
            style={inputStyle}
          />
          <select
            name="paymentMethod"
            value={form.paymentMethod}
            onChange={handleChange}
            style={{ ...inputStyle, padding: '10px' }}
          >
            <option value="account">Account Number</option>
            <option value="mobile">Mobile</option>
          </select>
          {form.paymentMethod === 'account' ? (
            <>
              <input
                type="text"
                name="accountNumber"
                placeholder="Account Number (13 digits)"
                value={form.accountNumber}
                onChange={handleChange}
                required
                style={inputStyle}
              />
              <input
                type="text"
                name="cvv"
                placeholder="CVV (3 digits)"
                value={form.cvv}
                onChange={handleChange}
                required
                style={inputStyle}
              />
            </>
          ) : (
            <>
              <input
                type="text"
                name="mobile"
                placeholder="Mobile Number (8 digits)"
                value={form.mobile}
                onChange={handleChange}
                required
                style={inputStyle}
              />
              <input
                type="text"
                name="pin"
                placeholder="PIN (4 digits)"
                value={form.pin}
                onChange={handleChange}
                required
                style={inputStyle}
              />
            </>
          )}
          <input
            type="text"
            name="country"
            placeholder="Country"
            value={form.country}
            onChange={handleChange}
            required
            style={inputStyle}
          />
          <input
            type="text"
            name="address"
            placeholder="Address"
            value={form.address}
            onChange={handleChange}
            required
            style={inputStyle}
          />
          <input
            type="text"
            name="streetNumber"
            placeholder="Street Number"
            value={form.streetNumber}
            onChange={handleChange}
            required
            style={inputStyle}
          />
          <button
            type="submit"
            style={{
              ...buttonStyle,
              backgroundColor: '#4CAF50',
              padding: '12px 30px',
              fontSize: '16px',
              width: '100%',
              marginTop: '15px',
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#45a049'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#4CAF50'}
          >
            Complete Payment
          </button>
        </form>
      </div>
    </div>
  );
};

export default Payment;