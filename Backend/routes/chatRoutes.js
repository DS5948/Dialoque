// routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const { getChatMessages } = require('../controllers/chatController');

router.get('/chat/:userId/messages', getChatMessages);

const Message = require('../models/messageModel');
const Chat = require('../models/chatModel');

// Handle sending a message
router.post('/send-message', async (req, res) => {
    try {
        const { senderId, chatId, content } = req.body; // Extract sender ID, chat ID, and message content from the request body

        // Create a new message
        const newMessage = new Message({
            sender: senderId,
            content,
            chat: chatId,
        });

        await newMessage.save();

        // Update the latestMessage field in the associated chat
        await Chat.findByIdAndUpdate(chatId, { latestMessage: newMessage._id });

        res.status(200).json({ message: 'Message sent successfully' });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Handle fetching messages for a chat
router.get('/get-messages/:chatId', async (req, res) => {
    try {
        const chatId = req.params.chatId;

        // Retrieve messages for the specified chat
        const messages = await Message.find({ chat: chatId }).populate('sender');

        res.status(200).json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;