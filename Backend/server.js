const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const ejs = require('ejs');
const connectDb = require("./config/db");
const signupRoutes = require('./routes/signupRoutes');
const signinRoutes = require('./routes/signinRoutes');  // Import the signinRoutes
const signoutRoutes = require('./routes/signoutRoutes');
const userRoutes = require('./routes/userRoutes');
const crypto = require("crypto");
const secretKey = crypto.randomBytes(32).toString("hex");
const User = require("./models/userModel");
const Chat = require("./models/chatModel");
const Messages = require("./models/messageModel");
const app = express();
const http = require('http');
const socketIo = require('socket.io');
const cors = require("cors"); // Import the cors package


// Create an HTTP server
const server = http.createServer(app);

// Create a Socket.io instance attached to the HTTP server
const io = socketIo(server);

connectDb();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json()); // Parse JSON requests
app.use(express.static("public"));
app.use(cors());


app.use(session({
  secret: secretKey,
  resave: false,
  saveUninitialized: true
}));


// ... (other app configurations)
app.get("/", function (req, res) {
    res.render("landing");
});
app.get("/signup",function(req,res) {
    res.render("signup",{errorMessage:""});
});
app.get("/signin",function(req,res) {
    res.render("signin",{errorMessage:""});
});
app.get("/contact-us",function(req,res) {
    res.render("contact");
});

app.get('/search-users', async (req, res) => {
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

//Endpoint to add a friend

app.get('/add-friend/:userId', async (req, res) => {
  const userId = req.params.userId;
  const email = (req.query.email); // Get the email from the query parameter
  try {
    // Find the user by their email
    const currentUser = await User.findOne({ email:email });

    if (!currentUser) {
      return res.json({ success: false, message: 'User not found' });
    }

    // Find the friend by their ID
    const friend = await User.findOne({ _id: userId });

    if (!friend) {
      return res.json({ success: false, message: 'Friend not found' });
    }

    // Add the friend's ID to the currentUser's friends array
    currentUser.friends.push(friend._id);
    friend.friends.push(currentUser._id);

    // Save the updated currentUser
    await currentUser.save();
    await friend.save();

    const newChat = new Chat({
      users:[currentUser._id,friend._id]
    })
  
  await newChat.save();

    const currentFriends = await User.find({_id:currentUser.friends});
    
    res.json({ success: true, currentFriends: currentFriends});
  } catch (error) {
    console.error('Error adding friend:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.get('/get-friends/:userEmail', async (req, res) => {
  const userEmail = req.params.userEmail;
  try {
    const user = await User.findOne({ email: userEmail }); // Use findOne instead of find
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const friendsIds = user.friends;
    const friends = await User.find({ _id: friendsIds }); 
    res.json({ friends });
  } catch (error) {
    console.error('Error fetching friends:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/get-messages/:userId', async(req,res) => {
  const friendId = req.params.userId;
  const currentUserEmail = req.query.email;
  try {
   const currentUser = await User.findOne({email: currentUserEmail});
   const friend = await User.findOne({_id: friendId});

   const userIds = [currentUser._id, friend._id];
   const chat = await Chat.findOne({
     users: { $all: userIds, $size: userIds.length }
   });
      res.json({chat});
  } catch (error) {
    console.error("Error fetching messages data: ",error);
    res.status(500).json({error: 'server error'});
  }
});

app.get('/get-latest-message/:friendId', async (req, res) => {
  try {
    const friendId = req.params.friendId;
    const userEmail = req.query.email;
    const user = await User.findOne({email: userEmail});

    const userIds = [user._id, friendId];
    const chat = await Chat.findOne({
      users: { $all: userIds, $size: userIds.length }
    });

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    const latestMsgId = chat.latestMessage;
    const latestMessage = await Messages.findOne({_id: latestMsgId});
    res.status(200).json({ latestMessage: latestMessage.content });
  } catch (error) {
    console.error('Error fetching latest message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle chat messages
  socket.on('chatMessage', async (messageData) => {
    try {

      let { content, userId, email,currentId,friendEmail,timestamp } = messageData;
      const currentUser = await User.findOne({ email: email });
      const friend = await User.findOne({ _id: userId });
      friendEmail = friend.email;
      currentId = currentUser._id;

      const newMessage = new Messages({
        content: content,
        sender: currentUser._id,
      });

      messageData = {
        content:content,
        userId:userId,
        email: email,
        currentId: currentId,
        friendEmail: friendEmail,
        timestamp: newMessage.timestamp
      }

      const userIds = [currentUser._id, friend._id];
      const chat = await Chat.findOne({
        users: { $all: userIds, $size: userIds.length }
      });

      chat.messages.push(newMessage);
      chat.latestMessage = newMessage._id;

      await newMessage.save();
      await chat.save();

      console.log('Message saved to the database:', content, userId, email);

      // Broadcast the message to all connected clients, including sender and receiver
      io.emit('chatMessage', messageData);

    } catch (error) {
      console.error('Error saving and broadcasting message:', error);
      // You can handle the error as needed
    }
  });
  socket.on('typing', async (data) => {
    // Broadcast the "typing" event to other users in the chat room
    const recieverId = data.userId;
    const senderEmail = data.email;
    const sender = await User.findOne({email: senderEmail});
    const senderId = sender._id;
    const reciever = await User.findOne({_id: recieverId});
    const recieverEmail = reciever.email; 
    const recieverData = {recieverEmail:recieverEmail,senderId:senderId};  
    socket.broadcast.emit('userTyping', recieverData);
  });
  socket.on('notTyping', async (data) => {
    // Broadcast the "typing" event to other users in the chat room
    const recieverId = data.userId;
    const senderEmail = data.email;
    const sender = await User.findOne({email: senderEmail});
    const senderId = sender._id;
    const reciever = await User.findOne({_id: recieverId});
    const recieverEmail = reciever.email; 
    const recieverData = {recieverEmail:recieverEmail,senderId:senderId};  
    socket.broadcast.emit('userNotTyping', recieverData);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

const port = 3003
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
});
app.use('/', signupRoutes);
app.use('/', signinRoutes);
app.use('/', signoutRoutes);
app.use('/user', userRoutes);
