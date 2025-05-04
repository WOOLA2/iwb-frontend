// pages/Home.js
import React from 'react';
import { Link } from 'react-router-dom';
import videoSource from '../assets/homevideo.mp4'; // Ensure the path is correct

const Home = () => {
  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      {/* Background video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: -1,
        }}
      >
        <source src={videoSource} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Font Awesome CDN for icons */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
      />

      {/* Main content container */}
      <div
        style={{
          maxWidth: '800px',
          margin: '40px auto',
          padding: '30px',
          border: '2px solid #ccc',
          borderRadius: '10px',
          backgroundColor: 'rgba(249, 249, 249, 0.9)', // Slightly transparent background
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <h1 style={{ textAlign: 'center', color: '#2e7d32' }}>Welcome to IWB Recycling</h1>
        <p style={{ textAlign: 'center', fontSize: '18px', marginBottom: '30px' }}>
          Browse our recycled computer parts or get in touch.
        </p>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '15px',
          }}
        >
          {[
            { to: '/service', icon: 'fas fa-tools', text: 'Service' },
            { to: '/products', icon: 'fas fa-box-open', text: 'All Products' },
            { to: '/brand-suppliers', icon: 'fas fa-industry', text: 'Brand Suppliers' },
            { to: '/about', icon: 'fas fa-info-circle', text: 'About Us' },
            { to: '/query-form', icon: 'fas fa-envelope', text: 'Contact Us' },
            { to: '/login', icon: 'fas fa-sign-in-alt', text: 'Admin Login' },
          ].map((link, idx) => (
            <Link
              key={idx}
              to={link.to}
              style={{
                width: '200px',
                padding: '15px',
                textAlign: 'center',
                border: '1px solid #aaa',
                borderRadius: '8px',
                textDecoration: 'none',
                backgroundColor: '#fff',
                color: '#333',
                boxShadow: '2px 2px 5px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <i className={link.icon} style={{ marginBottom: '8px', fontSize: '20px' }}></i>
              <div>{link.text}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
