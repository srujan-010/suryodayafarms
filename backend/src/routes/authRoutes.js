import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import prisma from '../utils/db.js';
import { protect } from '../middlewares/authMiddleware.js';
import cloudinary from '../utils/cloudinary.js';

const router = express.Router();

// Helper: Generate JWT Token and set inside Cookie
const sendTokenResponse = (user, statusCode, req, res) => {
  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });

  const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: isHttps,
    sameSite: isHttps ? 'none' : 'lax',
  };

  console.log(`[Express Backend Auth Audit] Cookie created. Host: ${req.headers.host}, Secure: ${cookieOptions.secure}, SameSite: ${cookieOptions.sameSite}`);

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
};

// 1. SECURE EMAIL REGISTER
router.post('/register', async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'This email is already registered.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        role: 'CUSTOMER'
      }
    });

    try {
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: 'Welcome to Suryodaya!',
          message: 'Explore our catalog and connect with native unrefined staples.',
        }
      });
    } catch (notifError) {
      console.error('Failed to create welcome notification:', notifError);
    }

    console.log(`[Express Backend] Auto-created User Profile: ${user.email}`);
    sendTokenResponse(user, 201, req, res);

  } catch (error) {
    console.error('[Express Backend Register Error]', error);
    next(error);
  }
});

// 2. SECURE EMAIL LOGIN
router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;

  console.log(`[Express Backend Auth Audit] Login request received for email: ${email}`);

  try {
    if (!email || !password) {
      console.warn(`[Express Backend Auth Audit] Login failed: Missing email or password.`);
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      console.warn(`[Express Backend Auth Audit] User found: false (Email: ${email})`);
      return res.status(400).json({ success: false, message: 'Invalid email or password.' });
    }

    console.log(`[Express Backend Auth Audit] User found: true (ID: ${user.id}, Role: ${user.role})`);

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    console.log(`[Express Backend Auth Audit] Password validation result: ${isMatch}`);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid email or password.' });
    }

    console.log(`[Express Backend Auth Audit] Token creation in progress for User ID: ${user.id}`);
    sendTokenResponse(user, 200, req, res);

    console.log(`[Express Backend Auth Audit] Login response sent successfully for email: ${user.email}`);

  } catch (error) {
    console.error('[Express Backend Login Error]', error);
    next(error);
  }
});

// 3. LOGOUT USER
// POST /api/auth/logout
router.post('/logout', (req, res) => {
  const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 500),
    httpOnly: true,
    secure: isHttps,
    sameSite: isHttps ? 'none' : 'lax',
  });

  res.status(200).json({ success: true, message: 'Logged out successfully.' });
});

// 4. FETCH LOGGED IN USER
// GET /api/auth/me
router.get('/me', protect, (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});

// ================= ADDRESS MANAGEMENT =================

// 5. GET SAVED ADDRESSES
router.get('/addresses', protect, async (req, res, next) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.user.id },
      orderBy: { isDefault: 'desc' },
    });

    res.status(200).json({ success: true, count: addresses.length, addresses });
  } catch (error) {
    next(error);
  }
});

// 6. ADD ADDRESS
router.post('/addresses', protect, async (req, res, next) => {
  const { title, recipientName, phone, street, city, state, postalCode, country, isDefault } = req.body;

  try {
    if (!title || !recipientName || !phone || !street || !city || !state || !postalCode) {
      return res.status(400).json({ success: false, message: 'All address parameters are required.' });
    }

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user.id },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId: req.user.id,
        title,
        recipientName,
        phone,
        street,
        city,
        state,
        postalCode,
        country: country || 'India',
        isDefault: !!isDefault,
      },
    });

    res.status(201).json({ success: true, address });
  } catch (error) {
    next(error);
  }
});

// 7. EDIT ADDRESS
router.put('/addresses/:id', protect, async (req, res, next) => {
  const { id } = req.params;
  const { title, recipientName, phone, street, city, state, postalCode, country, isDefault } = req.body;

  try {
    const addressExists = await prisma.address.findFirst({
      where: { id, userId: req.user.id }
    });

    if (!addressExists) {
      return res.status(404).json({ success: false, message: 'Address not found or unauthorized.' });
    }

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user.id },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.update({
      where: { id },
      data: {
        title,
        recipientName,
        phone,
        street,
        city,
        state,
        postalCode,
        country,
        isDefault: !!isDefault,
      },
    });

    res.status(200).json({ success: true, address });
  } catch (error) {
    next(error);
  }
});

// 8. DELETE ADDRESS
router.delete('/addresses/:id', protect, async (req, res, next) => {
  const { id } = req.params;

  try {
    const addressExists = await prisma.address.findFirst({
      where: { id, userId: req.user.id }
    });

    if (!addressExists) {
      return res.status(404).json({ success: false, message: 'Address not found or unauthorized.' });
    }

    await prisma.address.delete({ where: { id } });

    res.status(200).json({ success: true, message: 'Address deleted successfully.' });
  } catch (error) {
    next(error);
  }
});

// 9. GET USER NOTIFICATIONS
router.get('/notifications', protect, async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ success: true, count: notifications.length, notifications });
  } catch (error) {
    next(error);
  }
});

// 10. UPDATE USER PROFILE (Name and Avatar)
router.put('/profile', protect, async (req, res, next) => {
  const { name, avatarUrl } = req.body;
  try {
    const data = {};
    if (name !== undefined) data.name = name;
    if (avatarUrl !== undefined) data.avatarUrl = avatarUrl;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true
      }
    });

    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    next(error);
  }
});

// 11. UPLOAD IMAGE TO CLOUDINARY (User/Customer/Admin scope)
router.post('/upload-cloudinary', protect, async (req, res, next) => {
  const { image, folder } = req.body;
  try {
    if (!image) {
      return res.status(400).json({ success: false, message: 'Image data is required.' });
    }
    const uploadFolder = folder || 'general';
    const uploadResponse = await cloudinary.uploader.upload(image, {
      folder: uploadFolder,
      resource_type: 'auto'
    });
    res.status(200).json({
      success: true,
      url: uploadResponse.secure_url,
      public_id: uploadResponse.public_id,
      width: uploadResponse.width,
      height: uploadResponse.height
    });
  } catch (error) {
    console.error('[Cloudinary User Upload Error]:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to upload image to Cloudinary.' });
  }
});

export default router;
