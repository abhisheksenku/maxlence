const  User = require('../models/User');
const { Op } = require('sequelize');
const {
  getCache,
  setCache,
  deleteCache,
  deleteCachePattern,
} = require('../config/redis');
const path = require('path');
const fs = require('fs');

const SAFE_ATTRS = {
  exclude: [
    'password',
    'refreshToken',
    'verificationToken',
    'resetPasswordToken',
    'verificationTokenExpiry',
    'resetPasswordExpiry',
  ],
};

// Get users (paginated + search)
const getUsers = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search?.trim() || '';
    const offset = (page - 1) * limit;

    const cacheKey = `users:page:${page}:limit:${limit}:search:${search}`;

    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      return res.json({ success: true, ...cachedData, fromCache: true });
    }

    const where = {};

    if (search) {
      where[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    const { rows, count } = await User.findAndCountAll({
      where,
      attributes: SAFE_ATTRS,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    const result = {
      data: { users: rows },
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
        hasNext: page < Math.ceil(count / limit),
        hasPrev: page > 1,
      },
    };

    await setCache(cacheKey, result, 60);

    return res.json({ success: true, ...result });
  } catch (error) {
    console.error('Get users error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
    });
  }
};

// Get single user
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `user:profile:${id}`;

    let user = await getCache(cacheKey);

    if (!user) {
      const dbUser = await User.findByPk(id, { attributes: SAFE_ATTRS });

      if (!dbUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      user = dbUser.toJSON();
      await setCache(cacheKey, user, 300);
    }

    return res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
    });
  }
};

// Update profile
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName } = req.body;

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;

    if (req.file) {
      // Delete old image
      if (user.profileImage && user.profileImage.startsWith('/uploads/')) {
        const oldPath = path.join(__dirname, '..', user.profileImage);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      user.profileImage = `/uploads/${req.file.filename}`;
    }

    await user.save();

    await deleteCache(`user:${user.id}`);
    await deleteCache(`user:profile:${user.id}`);
    await deleteCachePattern('users:page:*');

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: user.toSafeObject() },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile',
    });
  }
};

// Update user role (admin)
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role',
      });
    }

    if (Number(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot change your own role',
      });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.role = role;
    await user.save();

    await deleteCache(`user:${id}`);
    await deleteCache(`user:profile:${id}`);

    return res.json({
      success: true,
      message: 'Role updated',
      data: { user: user.toSafeObject() },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update role',
    });
  }
};

// Delete user (admin)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (Number(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account',
      });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Delete profile image
    if (user.profileImage && user.profileImage.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '..', user.profileImage);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await user.destroy();

    await deleteCache(`user:${id}`);
    await deleteCache(`user:profile:${id}`);
    await deleteCachePattern('users:page:*');

    return res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete user',
    });
  }
};

// Toggle user status (admin)
const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    if (Number(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot deactivate your own account',
      });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    await deleteCache(`user:${id}`);
    await deleteCachePattern('users:page:*');

    return res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'}`,
      data: { user: user.toSafeObject() },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update user status',
    });
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateProfile,
  updateUserRole,
  deleteUser,
  toggleUserStatus,
};