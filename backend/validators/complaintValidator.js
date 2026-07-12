const { check, validationResult } = require('express-validator');

const validateComplaint = [
  check('title', 'Title is required').notEmpty().trim().isLength({ max: 100 }),
  check('description', 'Description is required').notEmpty().trim(),
  check('category', 'Category is required').notEmpty().isIn(['Billing', 'Technical Support', 'Account Issues', 'Customer Service', 'Hardware', 'Other']),
  check('priority', 'Priority must be Low, Medium, High, or Urgent').optional().isIn(['Low', 'Medium', 'High', 'Urgent']),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
];

module.exports = {
  validateComplaint,
};
