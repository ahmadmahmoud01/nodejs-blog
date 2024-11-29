import jwt from 'jsonwebtoken';

const isAuthenticated = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // Get token from "Authorization: Bearer <token>"

    if (!token) {
        return res.status(401).json({ message: 'Authentication token is required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach decoded token data to the request
        next();
    } catch (error) {
        console.error(error); // Log the error to the console
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};

export default isAuthenticated;
