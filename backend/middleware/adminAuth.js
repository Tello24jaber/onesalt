const adminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No admin token provided' });
  }
  
  const token = authHeader.substring(7);
  
  if (token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Invalid admin token' });
  }
  
  next();
};

module.exports = adminAuth;