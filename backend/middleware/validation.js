const validator = require('validator');

// Sanitize string input to prevent injection
const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  return validator.escape(str.trim());
};

// Validate UUID format
const isValidUUID = (uuid) => {
  return validator.isUUID(uuid, 4);
};

// Validate order data
const validateOrderData = (req, res, next) => {
  const { name, phone, address, city, product_id, product_name, color, size } = req.body;
  
  // Check required fields
  const requiredFields = ['name', 'phone', 'address', 'city', 'product_id', 'product_name', 'color', 'size'];
  const missingFields = requiredFields.filter(field => !req.body[field] || req.body[field].toString().trim() === '');
  
  if (missingFields.length > 0) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Missing required fields',
      missingFields
    });
  }

  // Validate product_id format
  if (!isValidUUID(product_id)) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Invalid product_id format'
    });
  }

  // Sanitize all string inputs
  req.body = {
    name: sanitizeString(name),
    phone: sanitizeString(phone),
    address: sanitizeString(address),
    city: sanitizeString(city),
    product_id: product_id,
    product_name: sanitizeString(product_name),
    color: sanitizeString(color),
    size: sanitizeString(size),
    notes: req.body.notes ? sanitizeString(req.body.notes) : ''
  };

  next();
};

module.exports = { validateOrderData, sanitizeString, isValidUUID };