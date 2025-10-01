const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; 
  
  if (token == null) {
    return res.sendStatus(401); 
  }
  console.log("JWT_SECRET (desde middleware):", process.env.JWT_SECRET);


  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error("Token verification error:", err);
      return res.sendStatus(403); 
    }

    req.user = user; 
    console.log("req.user", req.user);
    next(); 
  });
};

module.exports = authenticateToken;