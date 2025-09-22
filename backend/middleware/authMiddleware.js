const jwt = require('jsonwebtoken');

// This function acts as a gatekeeper for protected routes.
const authMiddleware = (req, res, next) => {
    // Get the token from the 'x-auth-token' header sent by the frontend
    const token = req.header('x-auth-token');

    // If there's no token, the user is not authenticated. Deny access.
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // If there is a token, we need to verify it
    try {
        // Decode the token using your JWT_SECRET
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Add the user's ID from the token to the request object
        // so that the next function (e.g., the submit route) can use it.
        req.user = decoded.user;
        
        // The token is valid. Allow the request to proceed to the actual route handler.
        next();
    } catch (err) {
        // If the token is invalid (e.g., expired or tampered with), deny access.
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

module.exports = authMiddleware;