const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");

router.get("/signin", function (req, res) {
  res.render("signin", { errorMessage: "" });
});

router.post("/signin", async function (req, res) {
  try {
    const userEmail = req.body.email;
    const userPass = req.body.password;
    const registeredUser = await User.findOne({ email: userEmail });
    const friendsId = registeredUser.friends;
    const friends = await User.find({_id: friendsId});

    const users = await User.find();

    if (registeredUser) {
      if (registeredUser.isVerified) {
        const isPasswordValid = await bcrypt.compare(
          userPass,
          registeredUser.password
        );

        if (isPasswordValid === true) {
          const name = registeredUser.name;
          const  firstName = name.split(" ")[0];

          res.render("home", {
            firstname: firstName,
            name: name,
            useremail: userEmail,
            username: registeredUser.username,
            friends: friends
          });
        } else {
          res.render("signin", {
            errorMessage: "Invalid email or password, please try again",
          });
        }
      } else {
        res.render("signin", {
          errorMessage:
            "Account not verified. Please check your email for verification instructions.",
        });
      }
    } else {
      res.render("signin", {
        errorMessage:
          "No user exists with the provided credentials. Sign up to get started.",
      });
    }
  } catch (error) {
    console.error("Error occurred while logging in:", error);
    res.status(500).render("error-page"); // Render an error page with appropriate message
  }
});

module.exports = router;
