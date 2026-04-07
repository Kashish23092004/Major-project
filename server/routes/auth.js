const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User'); // Ensure this path is correct
const { protect } = require('../middleware/auth'); // Ensure this path is correct

const router = express.Router();

// --- EMAIL TRANSPORTER SETUP ---
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // Use SSL
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS // MUST be a 16-character Google App Password
    },
    tls: {
        rejectUnauthorized: false
    }
});

// --- JWT GENERATION ---
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_key', { 
        expiresIn: '30d' 
    });
};

// @route   POST /register
// @desc    Register user, hash password, and send OTP
router.post('/register', async (req, res) => {
    try {
        let { name, email, mobileNumber, password, role } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide at least email and password.' });
        }

        email = email.trim().toLowerCase();
        
        // 1. Check if user already exists
        const userExists = await User.findOne({ 
            $or: [{ email }, { mobileNumber: mobileNumber || null }] 
        });
        
        if (userExists) {
            return res.status(400).json({ message: 'User already exists with this email or mobile number.' });
        }


        // 3. Generate 6-digit OTP and expiry time
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60000); // 10 minutes from now

        // 4. Create the unverified user in the database
        const user = await User.create({
            name: name || 'User',
            email,
             password: password,
            mobileNumber,
            role: role || 'user',
            isVerified: false,
            otp,
            otpExpiry
        });

        console.log(`\n🚨 DEBUG: VERIFICATION OTP FOR ${email} IS: ${otp} 🚨\n`);

        // 5. Send Email (MUST AWAIT FOR VERCEL)
        try {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Verify Your Account - OTP',
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px;">
                        <h2>Welcome!</h2>
                        <p>Your OTP for email verification is:</p>
                        <h1 style="color: #4CAF50; letter-spacing: 5px;">${otp}</h1>
                        <p>This code will expire in 10 minutes.</p>
                    </div>
                `
            });
            console.log("Registration email sent successfully.");
        } catch (mailError) {
            console.error("Mail Error Details:", mailError);
            // Optional: Delete the user if the email fails so they can try again immediately
            await User.findByIdAndDelete(user._id);
            return res.status(500).json({ message: 'Failed to send OTP email. Please try registering again.' });
        }
        
        // 6. Respond to frontend
        res.status(201).json({ message: 'OTP sent to email.', email: user.email });

    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
});

// @route   POST /verify-otp
// @desc    Verify the OTP and activate the account
router.post('/verify-otp', async (req, res) => {
    try {
        let { email, otp } = req.body;
        
        if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required.' });
        
        email = email.trim().toLowerCase(); 
        const cleanOtp = String(otp).trim(); 

        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ message: 'User not found.' });
        
        // Check OTP match and expiry
        if (user.otp !== cleanOtp) return res.status(400).json({ message: 'Invalid OTP.' });
        if (user.otpExpiry < Date.now()) return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });

        // Activate user and clean up OTP fields
        user.isVerified = true; 
        user.otp = undefined; 
        user.otpExpiry = undefined;
        await user.save();

        res.json({ 
            user: { _id: user.id, name: user.name, email: user.email, role: user.role }, 
            token: generateToken(user._id) 
        });
    } catch (error) {
        console.error("Verify OTP Error:", error);
        res.status(500).json({ message: 'Server error during verification.' });
    }
});

// @route   POST /login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
    try {
        let { email, password } = req.body;
        
        if (!email || !password) return res.status(400).json({ message: 'Please provide email and password.' });
        
        email = email.trim().toLowerCase();
        
        const user = await User.findOne({ email });

        if (!user) return res.status(401).json({ message: 'Invalid email or password.' });
        
        // Ensure user verified their email before logging in
        if (!user.isVerified) return res.status(401).json({ message: 'Please verify your email account first.' });

        // Compare hashed password
        if (await bcrypt.compare(password, user.password)) {
            res.json({ 
                user: { _id: user.id, name: user.name, email: user.email, role: user.role }, 
                token: generateToken(user._id) 
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password.' });
        }
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

// @route   POST /forgot-password
// @desc    Send password reset OTP
router.post('/forgot-password', async (req, res) => {
    try {
        let { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email is required.' });
        
        email = email.trim().toLowerCase();
        
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User with this email does not exist.' });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpiry = new Date(Date.now() + 10 * 60000);
        await user.save();

        console.log(`\n🚨 DEBUG: PASSWORD RESET OTP FOR ${email} IS: ${otp} 🚨\n`);

        // Send Email (MUST AWAIT FOR VERCEL)
        try {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Password Reset Request',
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px;">
                        <h2>Password Reset Request</h2>
                        <p>Your OTP to reset your password is:</p>
                        <h1 style="color: #E53935; letter-spacing: 5px;">${otp}</h1>
                        <p>If you did not request this, please ignore this email.</p>
                    </div>
                `
            });
             console.log("Password Reset Email sent successfully!");
        } catch (mailError) {
             console.error("Password Reset Mail error:", mailError);
             return res.status(500).json({ message: 'Failed to send reset email. Please try again.' });
        }
        
        res.json({ message: 'Password reset OTP sent to your email.' });

    } catch (error) {
        console.error("Forgot Password Error:", error);
        res.status(500).json({ message: 'Server error.' });
    }
});

// @route   POST /reset-password
// @desc    Verify OTP and set new password
router.post('/reset-password', async (req, res) => {
    try {
        let { email, otp, newPassword } = req.body;
        
        if (!email || !otp || !newPassword) return res.status(400).json({ message: 'All fields are required.' });
        
        email = email.trim().toLowerCase();
        const cleanOtp = String(otp).trim();
        
        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ message: 'User not found.' });
        if (user.otp !== cleanOtp) return res.status(400).json({ message: 'Invalid OTP.' });
        if (user.otpExpiry < Date.now()) return res.status(400).json({ message: 'OTP has expired.' });

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        
        // Clean up OTP fields
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        res.json({ message: 'Password has been reset successfully. You can now login.' });
    } catch (error) {
        console.error("Reset Password Error:", error);
        res.status(500).json({ message: 'Server error.' });
    }
});

// @route   GET /me
// @desc    Get user data
router.get('/me', protect, async (req, res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.error("Get Me Error:", error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;