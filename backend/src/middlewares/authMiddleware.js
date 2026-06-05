import jwt from 'jsonwebtoken';
import prisma from '../utils/db.js';

// 1. Secure token protection middleware
export const protect = async (req, res, next) => {
  let token;

  // Scan both browser cookies and authorization headers
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, login required.' });
  }

  try {
    // Decode token and read database record
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true
      }
    });

    if (!user) {
      const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';
      res.cookie('token', 'none', {
        expires: new Date(Date.now() + 500),
        httpOnly: true,
        secure: isHttps,
        sameSite: isHttps ? 'none' : 'lax',
      });
      return res.status(401).json({ success: false, message: 'User record no longer exists.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error(`[Auth Middleware Error]: ${error.message}`);
    const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 500),
      httpOnly: true,
      secure: isHttps,
      sameSite: isHttps ? 'none' : 'lax',
    });
    return res.status(401).json({ success: false, message: 'Token is expired or invalid.' });
  }
};

// 2. Role Gating for Admins Only
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    return res.status(403).json({ success: false, message: 'Access denied, administrative privileges required.' });
  }
};
