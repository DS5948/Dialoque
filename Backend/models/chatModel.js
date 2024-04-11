const mongoose = require('mongoose');


const messageSchema = mongoose.Schema({
    content: { type: String, required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    timestamp: { type: Date, default: Date.now },
});

const chatModel = mongoose.Schema({
    users: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    messages: [messageSchema],
    latestMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
    },
},
{
    timestamps: true,
});

const Chat = mongoose.model("Chat", chatModel);

module.exports = Chat;