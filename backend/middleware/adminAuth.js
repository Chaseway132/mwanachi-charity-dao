const jwt = require('jsonwebtoken');
require('dotenv').config();

// Admin wallet addresses (from environment or hardcoded)
const ADMIN_WALLETS = (process.env.ADMIN_WALLETS || '').split(',').map(addr => addr.toLowerCase().trim()).filter(Boolean);

// Fallback admin wallet (contract deployer address)
const DEFAULT_ADMIN_WALLET = '0x06A8ee55E0846F5b8A5CdEeA925FCfecB6504ac3'.toLowerCase();

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Verify admin wallet signature
 * Frontend sends: { walletAddress, signature, message, timestamp }
 * Backend verifies the signature matches the wallet
 */
const verifyWalletSignature = (message, signature, walletAddress) => {
  try {
    const { ethers } = require('ethers');
    const recoveredAddress = ethers.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === walletAddress.toLowerCase();
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
};

/**
 * Middleware: Check if wallet is admin
 * Usage: app.post('/api/admin/campaigns', checkAdminWallet, createCampaign)
 */
const checkAdminWallet = (req, res, next) => {
  try {
    const { walletAddress, signature, message, timestamp } = req.body;

    // Validate required fields
    if (!walletAddress || !signature || !message) {
      return res.status(400).json({
        success: false,
        error: 'Missing wallet address, signature, or message'
      });
    }

    // Check timestamp (prevent replay attacks - must be within 5 minutes)
    const messageTimestamp = parseInt(message.split('Timestamp: ')[1] || 0);
    const now = Date.now();
    if (Math.abs(now - messageTimestamp) > 5 * 60 * 1000) {
      return res.status(401).json({
        success: false,
        error: 'Message timestamp expired. Please sign a new message.'
      });
    }

    // Verify signature
    if (!verifyWalletSignature(message, signature, walletAddress)) {
      return res.status(401).json({
        success: false,
        error: 'Invalid signature. Wallet verification failed.'
      });
    }

    // Check if wallet is admin
    const isAdmin = ADMIN_WALLETS.includes(walletAddress.toLowerCase()) || 
                    walletAddress.toLowerCase() === DEFAULT_ADMIN_WALLET;

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Wallet is not authorized as admin'
      });
    }

    // Attach admin info to request
    req.admin = {
      walletAddress: walletAddress.toLowerCase(),
      isAdmin: true,
      timestamp: now
    };

    next();
  } catch (error) {
    console.error('Admin wallet check error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication error'
    });
  }
};

/**
 * Middleware: Check JWT token
 * Usage: app.post('/api/admin/campaigns', checkAdminToken, createCampaign)
 */
const checkAdminToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Missing or invalid authorization header'
      });
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, JWT_SECRET);

      // Check if this is a username-based token (from adminLoginSimple)
      if (decoded.username) {
        // Username-based authentication
        if (!decoded.isAdmin) {
          return res.status(403).json({
            success: false,
            error: 'User is not authorized as admin'
          });
        }

        req.admin = {
          username: decoded.username,
          isAdmin: true,
          tokenExpiry: decoded.exp
        };

        next();
      } else if (decoded.walletAddress) {
        // Wallet-based authentication
        const isAdmin = ADMIN_WALLETS.includes(decoded.walletAddress.toLowerCase()) ||
                        decoded.walletAddress.toLowerCase() === DEFAULT_ADMIN_WALLET;

        if (!isAdmin) {
          return res.status(403).json({
            success: false,
            error: 'Token wallet is not authorized as admin'
          });
        }

        req.admin = {
          walletAddress: decoded.walletAddress.toLowerCase(),
          isAdmin: true,
          tokenExpiry: decoded.exp
        };

        next();
      } else {
        return res.status(401).json({
          success: false,
          error: 'Invalid token format'
        });
      }
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }
  } catch (error) {
    console.error('Token check error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication error'
    });
  }
};

/**
 * Generate JWT token for admin
 * Called after successful wallet verification
 */
const generateAdminToken = (walletAddress) => {
  const payload = {
    walletAddress: walletAddress.toLowerCase(),
    isAdmin: true,
    iat: Math.floor(Date.now() / 1000)
  };

  // Token expires in 24 hours
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
  return token;
};

/**
 * Endpoint: Login with wallet signature
 * POST /api/admin/login
 * Body: { walletAddress, signature, message }
 */
const adminLogin = (req, res) => {
  try {
    const { walletAddress, signature, message } = req.body;

    if (!walletAddress || !signature || !message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Verify signature
    if (!verifyWalletSignature(message, signature, walletAddress)) {
      return res.status(401).json({
        success: false,
        error: 'Invalid signature'
      });
    }

    // Check if wallet is admin
    const isAdmin = ADMIN_WALLETS.includes(walletAddress.toLowerCase()) || 
                    walletAddress.toLowerCase() === DEFAULT_ADMIN_WALLET;

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Wallet is not authorized as admin'
      });
    }

    // Generate token
    const token = generateAdminToken(walletAddress);

    res.json({
      success: true,
      message: 'Admin login successful',
      token,
      walletAddress: walletAddress.toLowerCase(),
      expiresIn: '24h'
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
};

/**
 * Simple username/password login (for development/testing)
 * Frontend sends: { username, password }
 * Backend verifies credentials and returns JWT token
 */
const adminLoginSimple = (req, res) => {
  console.log('adminLoginSimple called with:', { username: req.body.username, password: '***' });
  try {
    const { username, password } = req.body;

    // Validate required fields
    if (!username || !password) {
      console.log('Missing username or password');
      return res.status(400).json({
        success: false,
        error: 'Username and password are required'
      });
    }

    // Simple credential check (in production, use bcrypt and database)
    // Demo credentials: admin / admin123
    const validCredentials = {
      'admin': 'admin123',
      'superadmin': 'super123'
    };

    if (!validCredentials[username] || validCredentials[username] !== password) {
      return res.status(401).json({
        success: false,
        error: 'Invalid username or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        username,
        isAdmin: true,
        iat: Date.now()
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Admin login successful',
      token,
      username,
      expiresIn: '24h'
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
};

module.exports = {
  checkAdminWallet,
  checkAdminToken,
  generateAdminToken,
  verifyWalletSignature,
  adminLogin,
  adminLoginSimple,
  ADMIN_WALLETS,
  DEFAULT_ADMIN_WALLET,
  JWT_SECRET
};

