const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String},
    isVerified: { type: Boolean, default: false },
    otp: String,
    friends: [{ type: mongoose.Schema.Types.ObjectId }]
}, {
    timestamps: true,
});

const User = mongoose.model("User", userSchema);

module.exports = User;
