const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const md5 = require("md5");
const nodemailer = require("nodemailer");
const otpGenerator = require('otp-generator');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/testUsersDB", { useNewUrlParser: true });

const userSchema = {
    name:String,
    username: String,
    email: String,
    password: String,
    isVerified: Boolean,
    otp: String
};

const User = mongoose.model("user", userSchema);

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'dheerajsharma5948@gmail.com',
        pass: 'hrvk yhkw iuzh ricy'
    }
});

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
    console.log(searchQuery);
  
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

  
function generateNumericOTP(length) {
    const characters = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        otp += characters.charAt(randomIndex);
    }
    return otp;
}

app.post("/signup", async function (req, res) {
    try {
        const name = req.body.name;
        const username = req.body.username;
        const email = req.body.email;

        const otp = generateNumericOTP(6);

        const newUser = new User({
            name:name,
            username: username,
            email: email,
            isVerified: false,
            otp: otp
        });

        const registeredUser = await User.findOne({ email: email });
        if (registeredUser) {
            res.render("signup",{errorMessage:"User already registered!"});
        } else {
            newUser.save();

            const mailOptions = {
                from: 'dheerajsharma5948@gmail.com',
                to: email,
                subject: 'OTP for Email Verification',
                text: `Your OTP is: ${otp}`
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });

            res.render("verify",{errorMessage:"", email:email});
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Error registering user.");
    }
});
app.get("/signup/verify",function(req,res) {
    res.render("verify",{errorMessage:"",email:email});
});
app.post("/verify-otp", async function (req, res) {
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

    res.render("pass",{errorMessage:"",email:email});
});
app.post("/create-password", async function (req, res) {
    try {
        const userEmail = req.body.email;
        const newPassword = md5(req.body.pass1);
        const confirmPassword = md5(req.body.pass2);
        

        if (newPassword !== confirmPassword) {
            res.render("pass", { errorMessage: "Passwords do not match.", email: email });
            return;
        }

        const user = await User.findOne({ email: userEmail });
        const name = user.name;
        const firstName = name.split(" ")[0];
        const username = user.username;
        if (!user) {
            res.send("User not found.");
            return;
        }

        user.password = newPassword;
        await user.save();

        res.render("home",{
            firstname: firstName,
            name: name,
            useremail:userEmail,
            username:username
        });
    } catch (error) {
        console.error("Error creating password:", error);
        res.status(500).send("Error creating password.");
    }
});


app.post("/signin", async function (req, res) {
    try {
        const userEmail = req.body.email;
        const userPass = md5(req.body.password);
        const user = await User.findOne({email:userEmail});
        const username = user.username;
        const name = user.name;
        const firstName = name.split(" ")[0];

        const registeredUser = await User.findOne({ email: userEmail });
        if (registeredUser) {
            if (registeredUser.isVerified && registeredUser.password === userPass) {
                res.render("home",{
                    firstname: firstName,
                    name:name,
                    useremail:userEmail,
                    username:username
                });
            } else {
                res.render("signin",{errorMessage:"Invalid email or password,please try again"});
            }
            
        } else {
            res.render("signin",{errorMessage:"No user exists with the provided credentials. Sign up to get started."});
        }
    } catch (error) {
        console.log("Error occurred while logging in:", error);
    }
});

app.listen(3000, function () {
    console.log("Server started on port 3000.");
});