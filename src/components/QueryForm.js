import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const QueryForm = () => {
  const { state } = useLocation();
  console.log('Received state in QueryForm:', state);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(state?.productDescription || '');
  const [queries, setQueries] = useState([]);

  const fetchQueries = async () => {
    console.log('Fetching all queries');
    try {
      const response = await fetch('http://localhost:5000/api/queries');
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch queries: Status ${response.status}, ${errorText}`);
      }
      const fetchedQueries = await response.json();
      console.log('Raw fetched queries from database:', fetchedQueries);
      const sortedQueries = fetchedQueries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      console.log('Sorted queries:', sortedQueries);
      setQueries(sortedQueries);
    } catch (err) {
      console.error('Error fetching queries from database:', err.message);
    }
  };

  useEffect(() => {
    fetchQueries();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !name || !message) {
      alert('Please fill in all fields.');
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/api/queries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Network response was not ok. Status: ${response.status}, Message: ${errorText}`);
      }
      const newQuery = await response.json();
      console.log('New query submitted:', newQuery);
      alert('Query submitted successfully!');
      setName('');
      setEmail('');
      setMessage('');
      setQueries([newQuery, ...queries]); // Immediate update
      await fetchQueries(); // Sync with backend
    } catch (err) {
      console.error('Query submission error:', err.message);
      alert('Error submitting query: ' + err.message);
    }
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold',
    color: '#333',
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    marginBottom: '15px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '14px',
  };

  const textareaStyle = {
    ...inputStyle,
    resize: 'vertical',
    height: '100px',
  };

  const submitStyle = {
    width: '100%',
    padding: '12px',
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  };

  const reviewStyle = {
    marginTop: '20px',
    padding: '15px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    backgroundColor: '#f9f9f9',
    color: '#333',
  };

  const buttonStyle = {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    margin: '5px',
  };

  const queryItemStyle = {
    marginBottom: '15px',
    padding: '15px',
    border: '1px solid #bbb',
    borderRadius: '8px',
    backgroundColor: '#fff',
    boxShadow: '2px 2px 5px rgba(0,0,0,0.1)',
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px' }}>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
      />

      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <button style={buttonStyle}>Home</button>
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>
          Inquiry about {state?.productName || 'Product'}
        </h3>
        <label style={labelStyle}>Name</label>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={inputStyle}
        />
        <label style={labelStyle}>Email</label>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={inputStyle}
        />
        <label style={labelStyle}>Message</label>
        <textarea
          placeholder="Your Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          style={textareaStyle}
        />
        <button
          type="submit"
          style={submitStyle}
          onMouseOver={(e) => (e.target.style.backgroundColor = '#218838')}
          onMouseOut={(e) => (e.target.style.backgroundColor = '#28a745')}
        >
          Submit
        </button>
      </form>

      <div style={reviewStyle}>
        <h4>Review Answer</h4>
        {queries.length > 0 ? (
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {queries.map((query) => (
              <li key={query._id} style={queryItemStyle}>
                <p style={{ fontSize: '14px', color: '#333', margin: '5px 0' }}>
                  <strong>Name:</strong> {query.name}
                </p>
                <p style={{ fontSize: '14px', color: '#333', margin: '5px 0' }}>
                  <strong>Email:</strong> {query.email}
                </p>
                <p style={{ fontSize: '14px', color: '#333', margin: '5px 0' }}>
                  <strong>Message:</strong> {query.message}
                </p>
                {query.reply && (
                  <p style={{ fontSize: '14px', color: '#333', margin: '5px 0' }}>
                    <strong>Reply:</strong> {query.reply}
                  </p>
                )}
                {query.autoReply && (
                  <p style={{ fontSize: '14px', color: '#333', margin: '5px 0' }}>
                    <strong>Auto Reply:</strong> {query.autoReply}
                  </p>
                )}
                <p style={{ fontSize: '14px', color: '#666', margin: '5px 0' }}>
                  <strong>Status:</strong> {query.status.charAt(0).toUpperCase() + query.status.slice(1)}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No queries available.</p>
        )}
      </div>
    </div>
  );
};

export default QueryForm;