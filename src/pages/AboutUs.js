import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      padding: '20px',
      maxWidth: '800px',
      margin: '0 auto',
      backgroundColor: '#f9f9f9',
      border: '2px solid #ccc',
      borderRadius: '10px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
    }}>
      <Link to="/" style={{ textDecoration: 'none' }}>
        <button style={{ marginBottom: '20px' }}>Home</button>
      </Link>
      <h2>About Us</h2>
      <p>
        At <strong>IWB Recycling</strong>, we are passionate about transforming the tech world with sustainable solutions.
        Founded with a vision to reduce e-waste and promote a circular economy, we specialize in recycling, refurbishing,
        and supplying high-quality computer parts.
      </p>
      <p>
        Our commitment to excellence and environmental stewardship drives us to partner with leading brands and serve
        our community with integrity. Join us on this green journey to a better tomorrow!
      </p>
    </div>
  );
};

export default About;
