if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

const express = require('express');
const mongoose = require('mongoose');
const pokemonSchema = require('./models/pokemon');
const axios = require('axios');

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

app.get("/populate-database", async (req,res) => {
    try{
    await pokemonSchema.countDocuments({}, async (err, count) => {
        console.log(count);
        if(count < 100){
            const firstGeneration = await axios.get('https://pokeapi.co/api/v2/generation/1');
            for(let i = 0; i < 100 - count; i++){
                const pokemonSpecies = await axios.get(firstGeneration.data.pokemon_species[i].url);
                const pokemon = await axios.get(pokemonSpecies.data.varieties[0].pokemon.url);
                if(pokemon)
                {
                    const { data } = pokemon;
                    const {name, height, weight, abilities, held_items} = data;

                    const restructuredAbilities = []
                    for(let object of abilities){
                        restructuredAbilities.push({
                            name: object.ability.name, 
                            slot: object.slot, 
                            hidden: object.is_hidden
                        })
                    }

                    const firstItem = held_items.shift();

                    if(firstItem) 
                        delete firstItem.version_details;
        
                    await new pokemonSchema({
                        name,
                        height,
                        weight,
                        abilities: restructuredAbilities,
                        firstItem
                    }).save().then( (newPokemon) => {
                        console.log(newPokemon);
                    });
                }
            }
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ newPokemons: 100 - count })) 
        } else {
            res.send("Database populated");
        }
    });
    } catch(e) {
        res.send(e);
    }
});

app.listen(3000, () => {
    console.log("Server has successfully started");
});