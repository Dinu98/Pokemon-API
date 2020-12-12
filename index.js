if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

const express = require('express');
const mongoose = require('mongoose');

const app = express();

const databaseUrl = process.env.MONGO_DB_URL || 'mongodb://localhost:27017/pokeManager'

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

app.get("/", (req,res) => {
    res.send("Basic setup");
});

app.listen(3000, () => {
    console.log("Server has successfully started");
});