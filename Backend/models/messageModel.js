const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
    content: { type: String, required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    timestamp: { type: Date, default: Date.now },
});

const Messages = mongoose.model("Message", messageSchema);

module.exports = Messages;