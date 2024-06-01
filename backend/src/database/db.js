const mongoose = require("mongoose");

function connectDatabase() {
    mongoose.    
        connect(process.env.MONGODB_URI)
    .then(() => console.log("Conectado ao banco MongoDB Atlas!"))
    .catch((err) => console.log(`Erro ao conectar com o MongoDB Atlas: ${err}`));
}

module.exports = connectDatabase;