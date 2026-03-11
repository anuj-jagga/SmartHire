const adminService = require('../services/adminService');

const getDashboardStats = async (req, res) => {
    try {
        const stats = await adminService.getDashboardStats();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching stats', error: error.message });
    }
};

module.exports = {
    getDashboardStats
};
