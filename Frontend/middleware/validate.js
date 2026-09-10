const { body, param, query, validationResult } = require('express-validator');
const mongoose = require('mongoose');

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errorCode: 'VALIDATION_ERROR',
      errors: errors.array().map(({ path, msg }) => ({ path, message: msg })),
    });
  }
  next();
}

const validateRegistration = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }).withMessage('Name is too long'),
  body('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  handleValidationErrors,
];

const validateLogin = [
  body('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors,
];

const validateBooking = [
  body('hotelId').isMongoId().withMessage('A valid hotelId is required'),
  body('roomTypeId').isMongoId().withMessage('A valid roomTypeId is required'),
  body('guestId').optional().isMongoId().withMessage('guestId must be a valid ObjectId'),
  body('checkIn').isISO8601().withMessage('checkIn must be a valid ISO date').toDate(),
  body('checkOut').isISO8601().withMessage('checkOut must be a valid ISO date').toDate(),
  body('checkIn').custom((value) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (value < today) throw new Error('checkIn cannot be before today');
    return true;
  }),
  body('checkOut').custom((value, { req }) => {
    if (value <= req.body.checkIn) throw new Error('checkOut must be after checkIn');
    return true;
  }),
  handleValidationErrors,
];

const validateHotelSearch = [
  query('city').optional().trim().isLength({ max: 100 }).withMessage('city is too long'),
  query('guests').optional().isInt({ min: 1, max: 50 }).withMessage('guests must be between 1 and 50').toInt(),
  query('checkIn').isISO8601().withMessage('checkIn must be a valid ISO date').toDate(),
  query('checkOut').isISO8601().withMessage('checkOut must be a valid ISO date').toDate(),
  query('checkOut').custom((value, { req }) => {
    if (value <= req.query.checkIn) throw new Error('checkOut must be after checkIn');
    return true;
  }),
  handleValidationErrors,
];

function validateObjectId(name, source = 'param') {
  const field = source === 'query' ? query(name) : param(name);
  return [
    field.custom((value) => mongoose.isValidObjectId(value)).withMessage(`${name} must be a valid ObjectId`),
    handleValidationErrors,
  ];
}

const validateIdParam = (name = 'id') => validateObjectId(name);

module.exports = {
  handleValidationErrors,
  validateRegistration,
  validateLogin,
  validateBooking,
  validateHotelSearch,
  validateObjectId,
  validateIdParam,
};
