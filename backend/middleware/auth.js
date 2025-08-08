const adminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ 
      error: 'Unauthorized', 
      message: 'Authorization header required' 
    });
  }

  const token = authHeader.split(' ')[1]; // Extract token from "Bearer <token>"
  
  if (!token) {
    return res.status(401).json({ 
      error: 'Unauthorized', 
      message: 'Bearer token required' 
    });
  }

  if (token !== process.env.ADMIN_TOKEN) {
    return res.status(403).json({ 
      error: 'Forbidden', 
      message: 'Invalid admin token' 
    });
  }

  next();
};

module.exports = { adminAuth };