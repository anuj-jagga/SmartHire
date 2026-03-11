const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const registerUser = async (userData) => {
    const { name, email, password, role, skills, resume } = userData;
    let user = await User.findOne({ email });
    if (user) throw new Error('User already exists');
    user = await User.create({ name, email, password, role, skills, resume });
    return {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
    };
};

const loginUser = async (email, password) => {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
        return {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id)
        };
    }
    throw new Error('Invalid email or password');
};

const getUserProfile = async (userId) => {
    const user = await User.findById(userId).select('-password');
    if (user) {
        return user;
    }
    throw new Error('User not found');
};

const getAllUsers = async (page = 1, limit = 10, search = '', role = '') => {
    const skip = (page - 1) * limit;
    
    const query = {};
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
        ];
    }
    if (role) {
        query.role = role;
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    return {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        data: users
    };
};

const updateUserRole = async (userId, role) => {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
    user.role = role || user.role;
    const updatedUser = await user.save();
    return {
        _id: updatedUser._id,
        name: updatedUser.name,
        role: updatedUser.role
    };
};

const deleteUser = async (userId) => {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const Job = require('../models/Job');
    const Application = require('../models/Application');

    const userJobs = await Job.find({ postedBy: user._id });
    const jobIds = userJobs.map(j => j._id);

    await Application.deleteMany({ job: { $in: jobIds } });
    await Job.deleteMany({ postedBy: user._id });
    await Application.deleteMany({ candidate: user._id });

    await User.deleteOne({ _id: user._id });
    return { message: 'User cleanly removed and cascade-deleted' };
};

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    getAllUsers,
    updateUserRole,
    deleteUser
};
