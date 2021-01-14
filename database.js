const mongoose = require('mongoose');

// class responsible for connecting to the DB
class Database {
    connect(databaseUrl) {
        mongoose.connect(databaseUrl,{
            useUnifiedTopology: true,
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: false
        });
        
        mongoose.connection.on("error", console.error.bind(console, "Error while trying to connect to DB"));
        mongoose.connection.once("open", () => {
            console.log("Successfully connected to DB");
        });
    }
}
// exporting singletone
module.exports = new Database();