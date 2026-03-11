const Joi = require('joi');

const validateRegister = (req, res, next) => {
    const schema = Joi.object({
        name: Joi.string().trim().required().min(2).max(50),
        email: Joi.string().email().required(),
        password: Joi.string().required().min(6),
        role: Joi.string().valid('Admin', 'HR', 'Candidate').default('Candidate'),
        skills: Joi.array().items(Joi.string()).optional(),
        resume: Joi.string().optional()
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    next();
};

const validateLogin = (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    next();
};

const validateJobPost = (req, res, next) => {
    const schema = Joi.object({
        title: Joi.string().required().min(3),
        company: Joi.string().required().min(2),
        description: Joi.string().required().min(10),
        jdUrl: Joi.string().optional().allow(''),
        requirements: Joi.array().items(Joi.string()).optional(),
        location: Joi.string().required(),
        salary: Joi.string().optional().allow(''),
        minSalary: Joi.number().optional().allow(null),
        maxSalary: Joi.number().optional().allow(null)
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    next();
};

module.exports = {
    validateRegister,
    validateLogin,
    validateJobPost
};
