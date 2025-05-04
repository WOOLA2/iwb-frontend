import React from 'react';
import { Link } from 'react-router-dom';

const Service = () => {
  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      padding: '20px',
      maxWidth: '800px',
      margin: '0 auto',
      backgroundColor: '#f9f9f9',
      border: '2px solid #ccc',
      borderRadius: '10px'
    }}>
      <Link to="/" style={{ textDecoration: 'none' }}>
        <button style={{ marginBottom: '20px' }}>Home</button>
      </Link>
      <h2>Our Services</h2>
      <ul>
        <li><strong>Computer Repair</strong>: Expert diagnosis and repair of hardware and software issues.</li>
        <li><strong>Recycling</strong>: Environmentally friendly disposal and recycling of electronic waste.</li>
        <li><strong>Refurbishment</strong>: Restoration of used computers to like-new condition for resale.</li>
      </ul>
    </div>
  );
};

export default Service;
