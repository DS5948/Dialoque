const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "dheerajsharma5948@gmail.com",
    pass: "hrvk yhkw iuzh ricy",
  },
});

router.get("/", function (req, res) {
  res.render("landing");
});

router.get("/signup", function (req, res) {
  res.render("signup", { errorMessage: "" });
});

function generateNumericOTP(length) {
  const characters = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    otp += characters.charAt(randomIndex);
  }
  return otp;
}

router.post("/signup", async function (req, res) {
  try {
    const name = req.body.name;
    const username = req.body.username;
    const email = req.body.email;
    const otp = generateNumericOTP(6);

    const newUser = new User({
      name: name,
      username: username,
      email: email,
      isVerified: false,
      otp: otp,
    });

    const registeredUser = await User.findOne({ email: email });
    if (registeredUser) {
      res.render("signup", { errorMessage: "User already registered!" });
    } else {
      newUser.save();

      const mailOptions = {
        from: "dheerajsharma5948@gmail.com",
        to: email,
        subject: "OTP for Email Verification",
        text: `Your OTP is: ${otp}`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });

      res.render("verify", { errorMessage: "", email: email });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error registering user.");
  }
});

router.post("/verify-otp", async function (req, res) {
  // ... (verification logic)
  const enteredOTP = req.body.otp;
  const email = req.body.email;

  const user = await User.findOne({ email: email, otp: enteredOTP });
  if (!user) {
    res.render("verify", { errorMessage: "Invalid OTP.", email: email });
    return;
  }

  user.isVerified = true;
  user.otp = null;
  await user.save();

  res.render("pass", { errorMessage: "", email: email });
});

// ... (create password logic)
router.post("/create-password", async function (req, res) {
  try {
    const userEmail = req.body.email;
    const newPassword = req.body.pass1;
    const confirmPassword = req.body.pass2;

    if (newPassword !== confirmPassword) {
      res.render("pass", {
        errorMessage: "Passwords do not match.",
        email: userEmail,
      });
    }

    const user = await User.findOne({ email: userEmail });
    const users = await User.find();
    if (!user) {
      res.send("User not found.");
    }
    else{
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      user.password = hashedPassword;
      await user.save();

      const name = user.name;
      const firstName = name.split(" ")[0];
      const username = user.username;
      
      
          res.render("home", {
            firstname: firstName,
            name: name,
            useremail: userEmail,
            username: username,
            friends: [" "]
          });
    }
  } catch (error) {
    console.error("Error creating password:", error);
    res.status(500).send("Error creating password.");
  }
});

module.exports = router;