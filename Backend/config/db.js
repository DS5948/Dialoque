
const mongoose = require("mongoose");

const connectDb = async () => {
    let conn; // Define the variable here

    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/testUsersDB", { useNewUrlParser: true, useUnifiedTopology: true });
        conn = mongoose.connection; // Assign the connection to the variable
        console.log(`MongoDB Connected: ${conn.host}`);
    } catch (error) {
        console.log(`Error: ${error.message}`);
        process.exit();
    }
};

module.exports = connectDb;