const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');
const {
  validate,
  updateProfileValidation,
  paginationValidation,
} = require('../middleware/validate');

// Apply authentication to all routes
router.use(authenticate);

// Get all users (paginated + searchable)
router.get(
  '/',
  paginationValidation,
  validate,
  userController.getUsers
);

// Get user by ID
router.get('/:id', userController.getUserById);

// Update current user's profile
router.put(
  '/profile/me',
  upload.single('profileImage'),
  handleUploadError,
  updateProfileValidation,
  validate,
  userController.updateProfile
);

// Admin-only routes
router.put(
  '/:id/role',
  authorize('admin'),
  userController.updateUserRole
);

router.delete(
  '/:id',
  authorize('admin'),
  userController.deleteUser
);

router.put(
  '/:id/toggle-status',
  authorize('admin'),
  userController.toggleUserStatus
);

module.exports = router;