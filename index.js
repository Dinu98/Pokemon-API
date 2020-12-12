if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

const express = require('express');
const mongoose = require('mongoose');
const pokemonRouter = require('./routes/pokemon');

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

app.use(express.urlencoded({extended: true}));

app.use("/pokemons", pokemonRouter);

app.all('*', (req,res,next) => {
    next(new expressError("Page not found", 404));
});

app.use((err,req,res,next) => {
    const {status = 500} = err;
    if(!err.message){
        err.message = "Something went wrong"
    }
    res.status(status).send(err.message);
});

app.listen(3000, () => {
    console.log("Server has successfully started");
});