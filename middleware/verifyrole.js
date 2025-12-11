// const jwt = require("jsonwebtoken");

// const verifyRole = (requiredRole) => {
//   return (req, res, next) => {
//     const authHeader = req.headers.authorization;
//     if (!authHeader) return res.status(401).json({ message: "No token provided" });

//     const token = authHeader.split(" ")[1];
//     jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
//       if (err) return res.status(403).json({ message: "Invalid token" });

//       if (decoded.role !== requiredRole) {
//         return res.status(403).json({ message: `Access denied for ${requiredRole} route` });
//       }

//       req.user = decoded;
//       next();
//     });
//   };
// };

// module.exports = verifyRole;
