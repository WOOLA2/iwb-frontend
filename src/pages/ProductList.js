import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import hddImage from '../assets/1tbhdd.jpg';
import ram8gbImage from '../assets/8gb ram.jpg';
import fanImage from '../assets/case fan.jpeg';
import coolerImage from '../assets/cpucooler.jpg';
import ddr3Image from '../assets/DDR3 RAM.jpg';
import ethernetImage from '../assets/ethernet card.jpeg';
import gpuImage from '../assets/gtxgpu.jpg';
import motherboardImage from '../assets/motherboard.jpeg';
import psuImage from '../assets/power supply.jpg';
import ssdImage from '../assets/ssd.png';
import hubImage from '../assets/udb hub.jpg';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem('cart')) || []);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/products');
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Failed to fetch products: ${res.status} ${errorText}`);
        }
        const data = await res.json();
        console.log('Fetched products:', data);
        setProducts(data);
        setFilteredProducts(data);
        setError('');
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products: ' + err.message);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProducts(products);
    } else {
      const lowerQuery = searchQuery.trim().toLowerCase();
      const filtered = products.filter((product) =>
        product.name.toLowerCase().includes(lowerQuery) ||
        (product.description && product.description.toLowerCase().includes(lowerQuery))
      );
      setFilteredProducts(filtered);
    }
    setCurrentIndex(0);
  }, [searchQuery, products]);

  const addToCart = (product) => {
    const existingItem = cart.find(item => item._id === product._id);
    const currentQuantity = existingItem ? existingItem.quantity : 0;
    if (currentQuantity + 1 > product.stock) {
      alert(`Cannot add more ${product.name}. Only ${product.stock} available in stock.`);
      return;
    }
    if (existingItem) {
      setCart(cart.map(item =>
        item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    alert(`${product.name} added to cart!`);
  };

  const handleInquiry = (product) => {
    console.log('Navigating to /query-form with:', {
      productName: product.name,
      productDescription: product.description || `About ${product.name}`,
    });
    navigate('/query-form', {
      state: {
        productName: product.name,
        productDescription: product.description || `About ${product.name}`,
      },
    });
  };

  const handleBuyNow = () => {
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    navigate('/cart');
  };

  const getImageForProduct = (product) => {
    if (product.image && product.image.startsWith('data:image/')) {
      return product.image;
    }
    const lower = product.name.toLowerCase();
    if (lower.includes('hdd')) return hddImage;
    if (lower.includes('8gb') || lower.includes('8 gb')) return ram8gbImage;
    if (lower.includes('fan')) return fanImage;
    if (lower.includes('cpu cooler') || lower.includes('cooler')) return coolerImage;
    if (lower.includes('ddr3')) return ddr3Image;
    if (lower.includes('ethernet')) return ethernetImage;
    if (lower.includes('gpu') || lower.includes('gtx')) return gpuImage;
    if (lower.includes('motherboard')) return motherboardImage;
    if (lower.includes('power supply')) return psuImage;
    if (lower.includes('ssd')) return ssdImage;
    if (lower.includes('usb hub') || lower.includes('hub')) return hubImage;
    return null;
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => {
      if (prevIndex === 0) {
        return filteredProducts.length > 0 ? filteredProducts.length - 1 : 0;
      }
      return prevIndex - 1;
    });
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => {
      if (prevIndex >= filteredProducts.length - 1) {
        return 0;
      }
      return prevIndex + 1;
    });
  };

  const displayedProducts = () => {
    if (filteredProducts.length === 0) return [];
    const start = currentIndex;
    const end = Math.min(start + 3, filteredProducts.length);
    const productsToShow = filteredProducts.slice(start, end);
    if (productsToShow.length < 3 && filteredProducts.length > productsToShow.length) {
      const additional = filteredProducts.slice(0, 3 - productsToShow.length);
      return [...productsToShow, ...additional];
    }
    return productsToShow;
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

  const searchBarStyle = {
    width: '100%',
    maxWidth: '500px',
    padding: '10px',
    margin: '0 auto 20px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '16px',
    display: 'block',
  };

  const navButtonStyle = {
    padding: '10px 20px',
    backgroundColor: '#555',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '18px',
    margin: '0 10px',
    minWidth: '40px',
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px' }}>
      <style>
        {`
          .product-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 8px;
            transition: transform 0.5s ease;
            transform-origin: center center;
          }
          .product-image:hover {
            transform: scale(1.1) rotateY(10deg);
            z-index: 1;
          }
          .image-container {
            width: 100%;
            height: 160px;
            border-radius: 8px;
            overflow: visible;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #f0f0f0;
            margin-bottom: 10px;
          }
        `}
      </style>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
      />

      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <button style={buttonStyle}>Home</button>
        </Link>
        <Link to="/cart" style={{ textDecoration: 'none' }}>
          <button style={buttonStyle}>
            <i className="fas fa-shopping-cart"></i> Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})
          </button>
        </Link>
        <button style={{ ...buttonStyle, backgroundColor: '#4caf50' }} onClick={handleBuyNow}>
          Buy Now
        </button>
      </div>

      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Available Products</h2>

      <input
        type="text"
        placeholder="Search products by name or description..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={searchBarStyle}
      />

      {error ? (
        <p style={{ textAlign: 'center', color: 'red' }}>{error}</p>
      ) : filteredProducts.length === 0 ? (
        <p style={{ textAlign: 'center' }}>
          {searchQuery ? 'No products match your search.' : 'No products available'}
        </p>
      ) : (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px' }}>
            <button
              onClick={handlePrev}
              style={navButtonStyle}
              disabled={filteredProducts.length <= 3}
              title="Previous Products"
            >
              &lt;
            </button>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '15px',
              flex: 1,
            }}>
              {displayedProducts().map(p => (
                <div key={p._id} style={{
                  width: '200px',
                  height: '350px',
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: '#fff',
                  textAlign: 'center',
                  padding: '10px',
                  boxShadow: '2px 2px 5px rgba(0,0,0,0.1)',
                }}>
                  <div className="image-container">
                    {getImageForProduct(p) ? (
                      <img
                        src={getImageForProduct(p)}
                        alt={p.name}
                        className="product-image"
                      />
                    ) : (
                      <span style={{ color: '#666' }}>No Image Available</span>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <strong style={{ fontSize: '14px' }}>{p.name}</strong>
                    <p style={{ fontSize: '12px', margin: '5px 0' }}>${p.price}</p>
                    <p style={{ fontSize: '12px', color: '#666' }}>
                      Stock: {p.stock}
                    </p>
                    <p style={{ fontSize: '12px', color: '#666' }}>
                      {p.description || 'No description'}
                    </p>
                  </div>
                  <button
                    onClick={() => addToCart(p)}
                    style={{
                      padding: '8px 15px',
                      backgroundColor: '#2196f3',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      width: '80%',
                      marginBottom: '5px',
                    }}
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={() => handleInquiry(p)}
                    style={{
                      padding: '8px 15px',
                      backgroundColor: '#ff9800',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      width: '80%',
                      marginBottom: '10px',
                    }}
                  >
                    Inquiry
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={handleNext}
              style={navButtonStyle}
              disabled={filteredProducts.length <= 3}
              title="Next Products"
            >
              &gt;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;