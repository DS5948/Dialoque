// Get necessary elements from the DOM
const msgTextarea = document.querySelector(".msg-input textarea");
const sendButton = document.querySelector(
  ".msg-input .material-symbols-outlined"
);
const chatMsgList = document.querySelector(".chat-msg ul");
let selectedLatestMsg = null;
let selectedChatId = null;
let selectedChat = null;
let currentId = null;
let unreadMessageCounts = [];

// Function to add a new message to the chat and scroll
function addMessage(message, isSender, timestamp) {
  const messageList = document.getElementById("chat-messages");
  const msgListItem = document.createElement("li");
  if (!isSender) {
    msgListItem.classList.add("receiver");
  } else {
    msgListItem.classList.add("sender");
  }
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("msg");
  const timestampDiv = document.createElement("div");
  timestampDiv.classList.add("timestamp");

  msgDiv.textContent = message;
  // Assuming the timestamp is in ISO 8601 format
  const dateObject = new Date(timestamp);

  // Convert the timestamp to the local time zone (e.g., IST for India)
  dateObject.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });

  // Extract hours and minutes
  const hours = dateObject.getHours(); // Get the hours (0-23)
  const minutes = dateObject.getMinutes(); // Get the minutes (0-59)

  // Format the time as HH:MM
  const formattedTime = `${String(hours).padStart(2, "0")}:${String(
    minutes
  ).padStart(2, "0")}`;

  console.log(formattedTime); // Output: "03:41" (IST)

  timestampDiv.textContent = formattedTime;
  msgListItem.appendChild(msgDiv);
  msgListItem.appendChild(timestampDiv);
  messageList.appendChild(msgListItem); // Corrected line
  if (chatMsgList.scrollHeight > chatMsgList.clientHeight) {
    chatMsgList.scrollTop = chatMsgList.scrollHeight - chatMsgList.clientHeight;
  }

  // Clear input field and focus after adding a message
  msgTextarea.value = "";
  msgTextarea.focus();
}

msgTextarea.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    sendButton.click();
  }
});
msgTextarea.addEventListener("input", () => {
  // Emit a "typing" event to the server
  if (msgTextarea.value) {
    socket.emit("typing", { userId: selectedChatId, email: loggedInEmail });
  } else {
    socket.emit("notTyping", { userId: selectedChatId, email: loggedInEmail });
  }
});

const profileImg = document.querySelector(".profileImg");
const profileDropdown = document.getElementById("profile-dropdown");

var isActive = 0;
profileImg.addEventListener("click", () => {
  if (!isActive) {
    profileDropdown.style.height = "fit-content";
    isActive = 1;
  } else {
    profileDropdown.style.height = "0";
    isActive = 0;
  }
});
const crossBtn = document.querySelector(".cross lord-icon");
crossBtn.addEventListener("click", () => {
  profileDropdown.style.height = "0";
});

const chatList = document.getElementById("chat-list");
const searchInput = document.querySelector(".input-box");
const searchResultsList = document.querySelector("#search-results ul");
const searchResultsDiv = document.getElementById("search-results");
const loggedInEmail = document
  .getElementById("email")
  .textContent.split(" ")[1];

// Function to update the chat list with fetched users
function updateChatList(users) {
  searchResultsList.innerHTML = ""; // Clear the existing list

  users.forEach((user) => {
    const listItem = document.createElement("li");
    listItem.innerHTML = `
        <div class="name">
          <h2>${user.name}</h2>
          <p>${user.username}</p>
        </div>
        <div class="add-icon">
          <img src="Images/add-user_748137.png" class="add-user-btn">
        </div>
      `;
    searchResultsList.appendChild(listItem);

    const addUserButton = listItem.querySelector(".add-user-btn");
    addUserButton.addEventListener("click", () => {
      // Call a function to add the user to your friends
      addUserToFriends(user._id, loggedInEmail);
    });
  });
}

// Event listener for search input
searchInput.addEventListener("input", () => {
  const searchQuery = searchInput.value;
  if (searchQuery) {
    searchResultsDiv.style.display = "block";
    chatList.style.display = "none";
  } else {
    searchResultsDiv.style.display = "none";
    chatList.style.display = "block";
  }

  // Make an AJAX request to fetch users matching the search query
  fetch(`/search-users?query=${searchQuery}`)
    .then((response) => response.json())
    .then((users) => {
      updateChatList(users);
    })
    .catch((error) => {
      console.error("Error fetching users:", error);
    });
});

const profilePicInput = document.querySelector(".img-input");
const profilePicImage1 = document.querySelector(".profile img");
const profilePicImage2 = document.querySelector(".profileImg img");
const defaultImg1 = document.querySelector(".profileImg lord-icon");
const defaultImg2 = document.querySelector(".profile lord-icon");

profilePicInput.addEventListener("change", (event) => {
  const selectedFile = event.target.files[0];
  if (selectedFile) {
    const reader = new FileReader();
    reader.onload = (e) => {
      profilePicImage1.src = e.target.result;
      profilePicImage2.src = e.target.result;
      defaultImg1.style.display = "none";
      defaultImg2.style.display = "none";
      profilePicImage1.style.display = "inline";
      profilePicImage2.style.display = "inline";
    };
    reader.readAsDataURL(selectedFile);
  }
});

// Add friend
function addUserToFriends(userId, loggedInEmail) {
  const encodedEmail = encodeURIComponent(loggedInEmail);

  fetch(`/add-friend/${userId}?email=${encodedEmail}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        console.log("User added to friends successfully");
        // You can provide visual feedback to the user here
        updateFriendsList(data.currentFriends); // Assuming data.friends contains the updated friends list
        addChatClickEvents();
      } else {
        console.log("Failed to add user to friends");
        // Handle failure case
      }
    })
    .catch((error) => {
      console.error("Error adding user to friends:", error);
      // Handle error case
    });
}
function updateFriendsList(friends) {
  const chatList = document.querySelector("#chat-list ul");
  friends.forEach((friend) => {
    const listItem = document.createElement("li");
    listItem.setAttribute("data-userId", friend._id);
    listItem.innerHTML = `<img src="../Images/download.jpg"><p>${friend.name}</p>`;
    chatList.appendChild(listItem);
  });
}
fetch(`/get-friends/${loggedInEmail}`)
  .then((response) => response.json())
  .then(async (data) => {
    const chatList = document.querySelector("#chat-list ul");

    for (const friend of data.friends) {
      const listItem = document.createElement("li");

      const friendContainer = document.createElement("div");
      friendContainer.classList.add("friend");

      const friendLeftDiv = document.createElement("div");
      friendLeftDiv.classList.add("friendLeft");

      const friendImageDiv = document.createElement("div");
      friendImageDiv.classList.add("friendImg");
      const friendImage = document.createElement("img");
      friendImage.src = "../Images/download.jpg"; // Replace with the actual image URL
      friendImageDiv.appendChild(friendImage);

      const friendTextDiv = document.createElement("div");
      friendTextDiv.classList.add("friendTxt");
      const friendName = document.createElement("p");
      friendName.classList.add("friendName");
      friendName.textContent = friend.name;

      const latestMsg = document.createElement("p");
      latestMsg.classList.add("latestMsg");

      try {
        // Fetch the latest message and await the result
        const latestMessage = await getLatestMessage(friend._id);

        // Set the latest message content
        latestMsg.textContent = latestMessage;
      } catch (error) {
        console.error("Error fetching the latest message:", error);
      }

      friendTextDiv.appendChild(friendName);
      friendTextDiv.appendChild(latestMsg);

      friendLeftDiv.appendChild(friendImageDiv);
      friendLeftDiv.appendChild(friendTextDiv);

      const msgCountSpan = document.createElement("span");
      msgCountSpan.classList.add("msgCount");

      friendContainer.appendChild(friendLeftDiv);
      friendContainer.appendChild(msgCountSpan);

      listItem.appendChild(friendContainer);
      listItem.setAttribute("data-userId", friend._id);
      chatList.appendChild(listItem);
    }

    // Now that list items are created, attach event listeners
    addChatClickEvents();
  })
  .catch((error) => {
    console.error("Error loading friend list:", error);
  });
async function updateLatestMsg() {
  const chatList = document.querySelectorAll(".chats ul li");
  for (const chat of chatList) {
    let chatUserId = chat.getAttribute("data-userId");
    let latestMsg = await getLatestMessage(chatUserId);
    const chatLatestMsg = chat.querySelector(".latestMsg");
    chatLatestMsg.textContent = latestMsg;
  }
}

//Fetch Messages

function getMessages(friendId, loggedInEmail) {
  const messageList = document.getElementById("chat-messages");
  const encodedEmail = encodeURIComponent(loggedInEmail);
  messageList.innerHTML = "";

  fetch(`/get-messages/${friendId}?email=${encodedEmail}`)
    .then((response) => response.json())
    .then((data) => {
      data.chat.messages.forEach((message) => {
        const msgListItem = document.createElement("li");
        if (message.sender == selectedChatId) {
          msgListItem.classList.add("receiver");
        } else {
          msgListItem.classList.add("sender");
        }
        const msgDiv = document.createElement("div");
        msgDiv.classList.add("msg");
        const timestampDiv = document.createElement("div");
        timestampDiv.classList.add("timestamp");

        msgDiv.textContent = message.content;
        // Assuming the timestamp is in ISO 8601 format
        const timestamp = message.timestamp; // Assuming you have a valid timestamp
        const dateObject = new Date(timestamp);

        // Convert the timestamp to the local time zone (e.g., IST for India)
        dateObject.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });

        // Extract hours and minutes
        const hours = dateObject.getHours(); // Get the hours (0-23)
        const minutes = dateObject.getMinutes(); // Get the minutes (0-59)

        // Format the time as HH:MM
        const formattedTime = `${String(hours).padStart(2, "0")}:${String(
          minutes
        ).padStart(2, "0")}`;

        timestampDiv.textContent = formattedTime;
        msgListItem.appendChild(msgDiv);
        msgListItem.appendChild(timestampDiv);
        messageList.appendChild(msgListItem); // Corrected line
        if (chatMsgList.scrollHeight > chatMsgList.clientHeight) {
          chatMsgList.scrollTop =
            chatMsgList.scrollHeight - chatMsgList.clientHeight;
        }
      });
    });
}
async function getLatestMessage(friendId) {
  try {
    const response = await fetch(
      `/get-latest-message/${friendId}?email=${loggedInEmail}`
    );
    const data = await response.json();

    if (data.latestMessage) {
      const latestMessage = data.latestMessage;
      // Do something with the latestMessage (e.g., display it in the chat UI)
      console.log("Latest Message:", latestMessage);
      return latestMessage;
    } else {
      console.log("No latest message found for this chat.");
    }
  } catch (error) {
    console.error("Error fetching latest message:", error);
  }
}

function addChatClickEvents() {
  const chat = document.querySelectorAll(".chats ul li");
  const chatName = document.querySelectorAll(".friendName");
  const chatImg = document.querySelectorAll(".chats ul li img");
  const currentChatName = document.querySelector(".chat-name h1 span");
  const currentChatImg = document.querySelector(".chat-name img");
  const latestMsg = document.querySelectorAll(".latestMsg");

  for (let i = 0; i < chat.length; i++) {
    chat[i].addEventListener("click", () => {
      if (selectedChat) {
        selectedChat.classList.remove("selected-chat");
      }

      selectedChat = chat[i]; // Update the selected chat
      selectedChat.classList.add("selected-chat");

      currentChatName.textContent = chatName[i].textContent;
      currentChatImg.src = chatImg[i].src;

      selectedChatId = chat[i].getAttribute("data-userId");
      selectedLatestMsg = latestMsg[i];
      const msgCountSpan = selectedChat.querySelector(".msgCount");
      if (msgCountSpan) {
        msgCountSpan.textContent = "0"; // Reset the count to zero
        msgCountSpan.style.display = "none"; // Hide the count
      }

      getMessages(selectedChatId, loggedInEmail);
      getLatestMessage(selectedChatId);
    });
  }
}

//Send Messages
// Get necessary elements from the DOM

// Event listener for sending messages

// function sendMessage(message,selectedChatId,loggedInEmail) {
//   if (message !== "" && selectedChatId !== "" && loggedInEmail !== "") {
//       // Create an object with the message data
//       const messageData = {
//           content: message,
//           userId: selectedChatId,
//           email: loggedInEmail
//       };

//       // Send a POST request to the server
//       fetch('/send-message', {
//           method: 'POST',
//           headers: {
//               'Content-Type': 'application/json'
//           },
//           body: JSON.stringify(messageData)
//       })
//       .then(response => response.json())
//       .then(data => {
//           if (data.success) {
//               console.log('Message sent and saved successfully');
//               // You can provide feedback to the user or perform any other actions here
//           } else {
//               console.log('Failed to send or save the message');
//               // Handle failure case
//           }
//       })
//       .catch(error => {
//           console.error('Error sending message:', error);
//           // Handle error case
//       });
//   }
// }

const socket = io("http://localhost:3000"); // Replace with your server URL

// Event listener for Socket.io connection
socket.on("connect", () => {
  console.log("Connected to server");

  // Event listener for sending messages
  sendButton.addEventListener("click", () => {
    socket.emit("notTyping", { userId: selectedChatId, email: loggedInEmail });
    const message = msgTextarea.value.trim();
    if (message !== "") {
      // sendMessage(message, selectedChatId, loggedInEmail);
      // Emit the 'chatMessage' event with message data
      socket.emit("chatMessage", {
        content: message,
        userId: selectedChatId,
        email: loggedInEmail,
        currentId: null,
        friendEmail: null,
        timestamp: null,
      });
    }
  });

  // Event listener for receiving messages
  // Event listener for receiving messages
  socket.on("chatMessage", (messageData) => {
    const { content, userId, email, currentId, friendEmail, timestamp } =
      messageData;

    // Handle received messages only for the selected chat
    if (
      (selectedChatId === userId && loggedInEmail === email) ||
      (selectedChatId === currentId && loggedInEmail === friendEmail)
    ) {
      addMessage(content, selectedChatId === userId, timestamp);
      selectedLatestMsg.textContent = content;
    }
    if (loggedInEmail === friendEmail) {
      const friendsList = document.querySelectorAll(".chats ul li");
      const idToUpdateCount = currentId;
      for (let i = 0; i < friendsList.length; i++) {
        if (friendsList[i].getAttribute("data-userId") === idToUpdateCount) {
          const msgCountSpan = friendsList[i].querySelector(".msgCount");
          if (msgCountSpan.style.display === "none") {
            unreadMessageCounts[userId] = 0;
          }
          if (unreadMessageCounts[userId]) {
            unreadMessageCounts[userId]++;
          } else {
            unreadMessageCounts[userId] = 1;
          }
          // Update the corresponding msgCountSpan
          msgCountSpan.textContent = unreadMessageCounts[userId];
          msgCountSpan.style.display = "block"; // Show the unread count
        }
      }
    }

    // Update the latest message list for all chats
    updateLatestMsg();
  });

  socket.on("userTyping", (data) => {
    if (
      data.recieverEmail === loggedInEmail &&
      selectedChatId === data.senderId
    ) {
      const typingIndicator = document.getElementById("typingIndicator");
      typingIndicator.textContent = "Typing...";
    }
  });
  socket.on("userNotTyping", (data) => {
    if (
      data.recieverEmail === loggedInEmail &&
      selectedChatId === data.senderId
    ) {
      const typingIndicator = document.getElementById("typingIndicator");
      typingIndicator.textContent = "";
    }
  });
});
