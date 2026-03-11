const authService = require('../services/authService');

const registerUser = async (req, res) => {
    try {
        const result = await authService.registerUser(req.body);
        res.status(201).json(result);
    } catch (error) {
        if (error.message === 'User already exists') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await authService.loginUser(email, password);
        res.json(result);
    } catch (error) {
        if (error.message === 'Invalid email or password') {
            return res.status(401).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getUserProfile = async (req, res) => {
    try {
        const user = await authService.getUserProfile(req.user._id);
        res.json(user);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const search = req.query.search || '';
        const role = req.query.role || '';

        const users = await authService.getAllUsers(page, limit, search, role);
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching users', error: error.message });
    }
};

const updateUserRole = async (req, res) => {
    try {
        const result = await authService.updateUserRole(req.params.id, req.body.role);
        res.json(result);
    } catch (error) {
        if (error.message === 'User not found') {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error updating role', error: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const result = await authService.deleteUser(req.params.id);
        res.json(result);
    } catch (error) {
        if (error.message === 'User not found') {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error deleting user', error: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    getAllUsers,
    updateUserRole,
    deleteUser
};
