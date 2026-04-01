const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // Use SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS 
  },
  tls: {
    rejectUnauthorized: false 
  }
});

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_key', { expiresIn: '30d' });
};

router.post('/register', async (req, res) => {
    try {
        let { name, email, mobileNumber, password } = req.body;
        email = email.trim().toLowerCase();
        
        const userExists = await User.findOne({ $or: [{ email }, { mobileNumber }] });
        if (userExists) return res.status(400).json({ message: 'User already exists.' });

        // Hash the password before saving! (Added this crucial step)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60000);

        const user = await User.create({
            name, 
            email, 
            mobileNumber, 
            password: hashedPassword, // Store the hashed password
            isVerified: false, 
            otp, 
            otpExpiry
        });

        console.log(`\n🚨 DEBUG: OTP FOR ${email} IS: ${otp} 🚨\n`);

        // 🛑 FIXED: MUST AWAIT ON SERVERLESS ENVIRONMENTS
        // We wrap this in a try-catch so if the email fails, the app doesn't crash, 
        // but we still wait for it to finish.
        try {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Verification OTP',
                html: `<h1>Your OTP is: ${otp}</h1>`
            });
            console.log("Email sent successfully!");
        } catch (mailError) {
            console.error("Mail Error:", mailError);
            // Optional: You could delete the user here if you only want them in the DB if the email succeeds.
            return res.status(500).json({ message: 'User created, but failed to send OTP email.' });
        }
        
        // Response ONLY happens after the email is confirmed sent or failed.
        res.status(201).json({ message: 'OTP sent to email.', email: user.email });

    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/verify-otp', async (req, res) => {
    try {
        let { email, otp } = req.body;
        email = email.trim().toLowerCase(); 
        const cleanOtp = String(otp).trim(); 

        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ message: 'User not found' });
        
        if (user.otp !== cleanOtp) return res.status(400).json({ message: 'Invalid OTP' });
        if (user.otpExpiry < Date.now()) return res.status(400).json({ message: 'OTP has expired' });

        user.isVerified = true; 
        user.otp = undefined; 
        user.otpExpiry = undefined;
        await user.save();

        res.json({ user: { _id: user.id, name: user.name, email: user.email, role: user.role }, token: generateToken(user._id) });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/login', async (req, res) => {
    try {
        let { email, password } = req.body;
        email = email.trim().toLowerCase();
        
        const user = await User.findOne({ email });

        if (!user) return res.status(401).json({ message: 'Invalid email or password' });
        if (!user.isVerified) return res.status(401).json({ message: 'Please verify your account first.' });

        if (await bcrypt.compare(password, user.password)) {
            res.json({ user: { _id: user.id, name: user.name, email: user.email, role: user.role }, token: generateToken(user._id) });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/forgot-password', async (req, res) => {
    try {
        let { email } = req.body;
        email = email.trim().toLowerCase();
        
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User with this email does not exist' });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpiry = new Date(Date.now() + 10 * 60000);
        await user.save();

        console.log(`\n🚨 PASSWORD RESET OTP FOR ${email} IS: ${otp} 🚨\n`);

        // 🛑 FIXED: MUST AWAIT ON SERVERLESS ENVIRONMENTS
        try {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'PASSWORD RESET OTP',
                html: `<h2>Password Reset Request</h2><p>Your OTP to reset your password is: <strong style="font-size: 24px;">${otp}</strong></p>`
            });
             console.log("Password Reset Email sent successfully!");
        } catch (mailError) {
             console.error("Background Mail error:", mailError);
             return res.status(500).json({ message: 'Failed to send reset email.' });
        }
        
        res.json({ message: 'Password reset OTP sent to your email' });

    } catch (error) {
        console.error("Forgot Password Error:", error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/reset-password', async (req, res) => {
    try {
        let { email, otp, newPassword } = req.body;
        email = email.trim().toLowerCase();
        const cleanOtp = String(otp).trim();
        
        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ message: 'User not found' });
        if (user.otp !== cleanOtp) return res.status(400).json({ message: 'Invalid OTP' });
        if (user.otpExpiry < Date.now()) return res.status(400).json({ message: 'OTP has expired' });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        res.json({ message: 'Password has been reset successfully. You can now login.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;