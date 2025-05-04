import React, { useState } from 'react';
import { auth } from '../firebase';

const ProductForm = () => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('Recycled');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (e.g., max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('Image size must be less than 2MB');
        return;
      }
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user logged in');
      }
      const token = await user.getIdToken(true);

      const payload = {
        name,
        price: Number(price),
        stock: Number(stock),
        category,
        description,
      };

      if (image) {
        const reader = new FileReader();
        const base64Image = await new Promise((resolve) => {
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(image);
        });
        payload.image = base64Image;
      }

      const response = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to add product: ${errorData.message || response.statusText}`);
      }

      alert('Product added successfully!');
      setName('');
      setPrice('');
      setStock('');
      setCategory('Recycled');
      setDescription('');
      setImage(null);
      setImagePreview(null);
      window.location.reload();
    } catch (err) {
      console.error('Error adding product:', err);
      alert(`Error adding product: ${err.message}`);
    }
  };

  const containerStyle = {
    margin: '20px 0',
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    margin: '8px 0',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '14px',
    boxSizing: 'border-box',
  };

  const selectStyle = {
    ...inputStyle,
    padding: '10px',
  };

  const textareaStyle = {
    ...inputStyle,
    height: '80px',
    resize: 'vertical',
  };

  const buttonStyle = {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    marginTop: '10px',
  };

  const imageUploadStyle = {
    display: 'flex',
    alignItems: 'center',
    margin: '10px 0',
  };

  const imagePreviewStyle = {
    maxWidth: '100px',
    maxHeight: '100px',
    marginLeft: '10px',
    borderRadius: '4px',
    objectFit: 'cover',
  };

  const plusIconStyle = {
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007bff',
    color: 'white',
    borderRadius: '50%',
    fontSize: '24px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  };

  return (
    <div style={containerStyle}>
      <h3 style={{ color: '#333', marginBottom: '15px' }}>Add New Product</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Product Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="number"
          placeholder="Stock"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          required
          style={inputStyle}
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={selectStyle}
        >
          <option value="Recycled">Recycled</option>
          <option value="RAM">RAM</option>
          <option value="Storage">Storage</option>
          <option value="Motherboard">Motherboard</option>
        </select>
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={textareaStyle}
        />
        <div style={imageUploadStyle}>
          <label style={plusIconStyle}>
            +
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
          </label>
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Preview"
              style={imagePreviewStyle}
            />
          )}
        </div>
        <button
          type="submit"
          style={buttonStyle}
          onMouseOver={(e) => (e.target.style.backgroundColor = '#0056b3')}
          onMouseOut={(e) => (e.target.style.backgroundColor = '#007bff')}
        >
          Add Product
        </button>
      </form>
    </div>
  );
};

export default ProductForm;