import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  signInWithEmailAndPassword,
  multiFactor,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator
} from 'firebase/auth';
import { auth } from '../firebase';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaResolver, setMfaResolver] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();
      localStorage.setItem('token', idToken);
      navigate('/admin');
    } catch (err) {
      if (err.code === 'auth/multi-factor-auth-required') {
        const resolver = multiFactor(auth).getMultiFactorResolver(err);
        setMfaResolver(resolver);
        const phoneInfoOptions = {
          multiFactorHint: resolver.hints[0],
          session: resolver.session,
        };
        const phoneAuthProvider = new PhoneAuthProvider(auth);
        const verificationId = await phoneAuthProvider.verifyPhoneNumber(phoneInfoOptions, window.recaptchaVerifier);
        window.verificationId = verificationId;
      } else {
        alert('Invalid credentials: ' + err.message);
      }
    }
  };

  const handleMfaSubmit = async (e) => {
    e.preventDefault();
    try {
      const cred = PhoneAuthProvider.credential(window.verificationId, mfaCode);
      const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);
      const userCredential = await mfaResolver.resolveSignIn(multiFactorAssertion);
      const idToken = await userCredential.user.getIdToken();
      localStorage.setItem('token', idToken);
      navigate('/admin');
    } catch (err) {
      alert('MFA verification failed: ' + err.message);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f5f5f5',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        border: '2px solid #ccc',
        borderRadius: '10px',
        padding: '30px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
      }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <button style={{
            marginBottom: '20px',
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            width: '100%'
          }}>
            Home
          </button>
        </Link>

        {!mfaResolver ? (
          <form onSubmit={handleLogin}>
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Admin Login</h2>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={inputStyle}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={inputStyle}
            />
            <div id="recaptcha-container" style={{ marginBottom: '15px' }}></div>
            <button type="submit" style={buttonStyle}>Login</button>
          </form>
        ) : (
          <form onSubmit={handleMfaSubmit}>
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Enter MFA Code</h2>
            <input
              type="text"
              placeholder="MFA Code"
              value={mfaCode}
              onChange={e => setMfaCode(e.target.value)}
              required
              style={inputStyle}
            />
            <button type="submit" style={buttonStyle}>Verify</button>
          </form>
        )}
      </div>
    </div>
  );
};

// Inline Styles
const inputStyle = {
  width: '100%',
  padding: '12px',
  marginBottom: '15px',
  borderRadius: '5px',
  border: '1px solid #ccc',
  fontSize: '14px',
  boxSizing: 'border-box'
};

const buttonStyle = {
  width: '100%',
  padding: '12px',
  backgroundColor: '#28a745',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  fontSize: '16px',
  cursor: 'pointer'
};

export default Login;
