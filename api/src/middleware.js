const jwt = require('jsonwebtoken');

const authenticate = async (req, res, next) => {
    try {
        let token;

        if (req.cookies.token) {
            token = req.cookies.token;
        } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1]; // Authorization: Bearer TOKEN
        }

        if (!token) {
            return res.status(401).json({ error: "You are not logged in. Please log in to get access." });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // You might want to add more checks here (e.g., check if user still exists)
        req.user = decoded; // Optional: add decoded data to request object

        next(); // pass the execution off to whatever request the client intended
    } catch (error) {
        console.error("Authentication error:", error.message);
        res.status(401).json({ error: "Authentication failed. Invalid token." });
    }
};

module.exports = authenticate;