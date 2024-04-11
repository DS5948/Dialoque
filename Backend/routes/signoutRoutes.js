const express = require('express');
const router = express.Router();
const { clearSessionData } = require("../utils/session"); // Import the session utility function

// Sign-out route
router.get('/signout', (req, res) => {
    // Clear user session data
    clearSessionData(req);

    // Redirect to a sign-in page or any other appropriate page
    res.redirect('/');
});

module.exports = router;