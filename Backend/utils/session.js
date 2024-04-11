// utils/session.js
function clearSessionData(req) {
    // Example: If you're using Express sessions
    req.session.destroy(err => {
        if (err) {
            console.error('Error clearing session:', err);
        }
    });

    // Example: If you're using JWT tokens, you might need to implement token invalidation
    // This could involve managing a blacklist of invalidated tokens
}

module.exports = { clearSessionData };