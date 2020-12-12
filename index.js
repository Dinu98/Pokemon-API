if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

const express = require('express');
const pokemonRouter = require('./routes/pokemon');
const customError = require('./utils/customError')
const database = require('./database');

const app = express();

// we hold the link to local host just as a plan B
const databaseUrl = process.env.MONGO_DB_URL || 'mongodb://localhost:27017/pokeManager'

database.connect(databaseUrl);

app.use(express.urlencoded({extended: true}));

app.use("/pokemons", pokemonRouter);

app.all('*', (req,res,next) => {
    next(new customError("Page not found", 404));
});

// custom error handler that assumes something is wrong with the server 
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