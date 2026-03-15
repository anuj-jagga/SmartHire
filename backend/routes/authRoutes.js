const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect, onlyAdmin } = require('../middleware/authMiddleware');
const { validateRegister, validateLogin } = require('../middleware/validators');

// @desc    Register a new user
// @route   POST /api/auth/register
router.post('/register', validateRegister, authController.registerUser);

// @desc    Auth user & get token
// @route   POST /api/auth/login
router.post('/login', validateLogin, authController.loginUser);

// @desc    Logout user
// @route   POST /api/auth/logout
router.post('/logout', authController.logoutUser);

// @desc    Get user profile
// @route   GET /api/auth/profile
router.get('/profile', protect, authController.getUserProfile);

// @desc    Get all users (Admin only)
// @route   GET /api/auth/users
router.get('/users', protect, onlyAdmin, authController.getAllUsers);

// @desc    Update user role (Admin only)
// @route   PUT /api/auth/users/:id/role
router.put('/users/:id/role', protect, onlyAdmin, authController.updateUserRole);

// @desc    Delete a user (Admin only)
// @route   DELETE /api/auth/users/:id
router.delete('/users/:id', protect, onlyAdmin, authController.deleteUser);

module.exports = router;
