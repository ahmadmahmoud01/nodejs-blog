import bcrypt from 'bcryptjs';
import User from '../models/user.js'; // Ensure this is an ES module import
import sendMail from '../utils/mailer.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Registers a new user with email, name, and password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - name
 *               - email
 *               - password
 *     responses:
 *       201:
 *         description: User registered successfully. Please verify your email.
 *       400:
 *         description: All fields are required
 *       500:
 *         description: Error registering user
 */
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            isVerified: false,
        });

        // Generate verification token
        const verificationToken = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Send email with the token
        await sendMail(
            email,
            'Email Verification',
            `Click this link to verify your email: http://localhost:3000/api/auth/verify-email?token=${verificationToken}`
        );

        res.status(201).json({ message: 'User registered successfully. Please verify your email.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error registering user' });
    }
};

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     description: Logs in a user with email and password and returns a JWT token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Please verify your email to log in.
 *       500:
 *         description: Error logging in
 */
const loginUser = (req, res) => {
    const { email, password } = req.body;

    User.findOne({ where: { email } })
        .then(async (user) => {
            if (!user) return res.status(401).json({ message: 'Invalid credentials' });
            if (!user.isVerified) return res.status(403).json({ message: 'Please verify your email to log in.' });

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

            // Generate JWT
            const token = jwt.sign(
                { userId: user.id, userName: user.name },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN }
            );

            res.status(200).json({
                message: 'Login successful',
                token,
                user: { id: user.id, name: user.name },
            });
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({ message: 'Error logging in' });
        });
};

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     summary: User logout
 *     description: Logs out the currently logged-in user by destroying the session.
 *     responses:
 *       200:
 *         description: Logout successful
 *       500:
 *         description: Error logging out
 */
const logoutUser = (req, res) => {
    req.session.destroy(() => {
        res.status(200).json({ message: 'Logout successful' });
    });
};

/**
 * @openapi
 * /api/auth/verify-email:
 *   post:
 *     summary: Verify user email
 *     description: Verifies the user's email using a token.
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Email verified successfully.
 *       400:
 *         description: Verification token is required or invalid
 *       500:
 *         description: Invalid or expired token
 */
const verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({ message: 'Verification token is required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findByPk(decoded.userId);
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        user.isVerified = true;
        await user.save();

        res.status(200).json({ message: 'Email verified successfully. You can now log in.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Invalid or expired token' });
    }
};

export default { registerUser, loginUser, logoutUser, verifyEmail }; // Use ES module exports
