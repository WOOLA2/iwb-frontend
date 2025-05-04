import React from 'react';
import { Link } from 'react-router-dom';

const brandData = [
  { name: 'A-Tech Components', logo: 'atech.png', url: 'https://www.atechcomponents.com/' },
  { name: 'Acer', logo: 'acer.jpg', url: 'https://www.acer.com/' },
  { name: 'Advantech', logo: 'advantech.png', url: 'https://www.advantech.com/' },
  { name: 'AMD', logo: 'AMD-Logo.png', url: 'https://www.amd.com/' },
  { name: 'Apacer', logo: 'asper.jpg', url: 'https://www.apacer.com/' },
  { name: 'ASRock', logo: 'asrok.jpeg', url: 'https://www.asrock.com/' },
  { name: 'ASUS', logo: 'asus.jpg', url: 'https://www.asus.com/' },
  { name: 'Biostar', logo: 'boistar.jpg', url: 'https://www.biostar.com.tw/' },
  { name: 'Broadcom', logo: 'broad.jpg', url: 'https://www.broadcom.com/' },
  { name: 'Brocade', logo: 'brocade.jpg', url: 'https://www.brocade.com/' },
  { name: 'Cisco', logo: 'cisco.jpg', url: 'https://www.cisco.com/' },
  { name: 'Colorful', logo: 'color.jpeg', url: 'https://en.colorful.cn/' },
  { name: 'Corsair', logo: 'corsairr.jpeg', url: 'https://www.corsair.com/' },
  { name: 'Crucial', logo: 'crucial.jpg', url: 'https://www.crucial.com/' },
  { name: 'Dell', logo: 'Dell-Logo.png', url: 'https://www.dell.com/' },
  { name: 'Dell EMC', logo: 'dell-emc.jpg', url: 'https://www.dellemc.com/' },
  { name: 'Emulex', logo: 'emulex-logo.png', url: 'https://www.broadcom.com/products/fibre-channel/emulex' },
  { name: 'EVGA', logo: 'Evga_logo_2.jpg', url: 'https://www.evga.com/' }
];

const BrandSuppliers = () => {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px' }}>
      <Link to="/" style={{ marginBottom: '20px', display: 'inline-block' }}>
        <button style={buttonStyle}>Home</button>
      </Link>
      <h2 style={{ textAlign: 'center' }}>Brand Suppliers</h2>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '15px',
        marginTop: '20px'
      }}>
        {brandData.map((brand, index) => (
          <a
            key={index}
            href={brand.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              width: '140px',
              height: '140px',
              border: '1px solid #ccc',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#fff',
              textAlign: 'center',
              padding: '10px',
              textDecoration: 'none',
              color: '#000',
              boxShadow: '2px 2px 5px rgba(0,0,0,0.1)'
            }}
          >
            <img
              src={require(`../brands/${brand.logo}`)}
              alt={brand.name}
              style={{ maxWidth: '100%', maxHeight: '60px', marginBottom: '10px', objectFit: 'contain' }}
            />
            <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{brand.name}</span>
          </a>
        ))}
      </div>
    </div>
  );
};

const buttonStyle = {
  padding: '10px 20px',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer'
};

export default BrandSuppliers;
