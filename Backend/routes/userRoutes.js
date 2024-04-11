const express = require('express');
const router = express.Router();
const { registerUser, authUser } = require("../controllers/userControllers");

const mongoose = require('mongoose');
const User = require('../models/userModel'); // Adjust the path based on your file structure

// Add the search-users route
router.get('/search-users', async (req, res) => {
    const searchQuery = req.query.query;  
    try {
        // Check if the search query matches a valid ObjectId (Assuming MongoDB's default _id)
        const isValidObjectId = mongoose.Types.ObjectId.isValid(searchQuery);
        
        // Use a regular expression to perform case-insensitive search
        let users;
        if (isValidObjectId) {
            users = await User.find({ _id: searchQuery }).select('name username profileImage');
        } else if (/^[a-zA-Z0-9]+$/.test(searchQuery)) { // If searchQuery matches username format
            users = await User.find({ username: { $regex: searchQuery, $options: 'i' } })
                               .select('name username profileImage');
        } else { // Search by name
            users = await User.find({ name: { $regex: searchQuery, $options: 'i' } })
                               .select('name username profileImage');
        }
  
        res.json(users);
    } catch (error) {
        console.error('Error searching users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add the register and login routes using the imported controllers
router.route('/').post(registerUser);
router.route('/login').post(authUser);

module.exports = router;