const mongoose = require("mongoose");

function connectDatabase() {
    mongoose.    
        connect(process.env.MONGODB_URI)
    .then(() => console.log("MongoDB Atlas Connected!"))
    .catch((err) => console.log(`Error connecting to MongoDB Atlas: ${err}`));
}

module.exports = connectDatabase;