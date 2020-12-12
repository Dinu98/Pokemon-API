const pokemonSchema = require('../models/pokemon');
const axios = require('axios');
const customError = require('../utils/customError')

// here are all the implementations of the API

// responsible for populating database
module.exports.populateDatabase = async (req,res) => {

    // we first wait to see how many pokemons we have in our DB
    await pokemonSchema.countDocuments({}, async (err, count) => {
        console.log(count);
        if(count < 100){

            // if we have less than 100 we start requesting data
            const firstGeneration = await axios.get('https://pokeapi.co/api/v2/generation/1');
            for(let i = 0; i < 100 - count; i++){
                const pokemonSpecies = await axios.get(firstGeneration.data.pokemon_species[i].url);
                const pokemon = await axios.get(pokemonSpecies.data.varieties[0].pokemon.url);
                if(pokemon)
                {
                    const { data } = pokemon;
                    const {name, height, weight, abilities, held_items} = data;

                    // we need another restructured vector for abilities
                    // in order to easily pass it when we create the pokemon
                    const restructuredAbilities = []
                    for(let object of abilities){
                        restructuredAbilities.push({
                            name: object.ability.name, 
                            slot: object.slot, 
                            hidden: object.is_hidden
                        })
                    }
                    
                    // we get the first item from the array
                    const firstItem = held_items.shift();

                    // if we have an item we delete 
                    // unnecessary properties
                    if(firstItem) 
                        delete firstItem.version_details;
        
                    await new pokemonSchema({
                        name,
                        height,
                        weight,
                        abilities: restructuredAbilities,
                        firstItem
                    }).save()
                }
            }

            // We return the number of newly added pokemons
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ newPokemons: 100 - count })) 
        } else {
            // If we have atleast 100 pokemons in our DB
            // We don't need to populate it
            res.send("Database populated");
        }
    });
};

// responsible for getting all the pokemons
// and sorting them in descending order by weight
module.exports.getAllPokemons = async (req,res) => {
    const pokemons = await pokemonSchema.find({}).sort({weight: -1});

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ pokemons }))

};

// responsible for creating a pokemon
module.exports.createOnePokemon = async (req,res) => {

    if(req.body.pokemon){

        // if we have any images we associate them
        // with the pokemon
        if(req.files){
            pokemon.images = req.files.map( fl => ({url: fl.path, filename: fl.filename}));
        }
    
        const newPokemon = await new pokemonSchema(pokemon).save();

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ newPokemon}))
    } else {
        throw new customError("Invalid data", 400);
    }
};

// responsible for deleting all pokemons
module.exports.deleteAllPokemons = async(req,res) => {

    // in order to use the "pre" mongoose middleware
    // we need to first get all the pokemons
    const pokemons = await pokemonSchema.find({});

    // and delete them one by one
    for(let pokemon of pokemons){
        pokemon.deleteOne();
    }

    res.send("Successfully deleted all pokemons");
};

// responsible for getting one pokemon by a provided id
module.exports.getOnePokemon = async (req,res,next) =>{

    const pokemon = await pokemonSchema.findById(req.params.id);

    if(pokemon){
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ pokemon }))
    } else {
        throw new customError("Invalid id", 400);
    }
};

// responsible to edit one pokemon by a provided id
module.exports.editOnePokemon = async (req,res) => {
    if(req.body.pokemon){

        // if we have any new images 
        if(req.files){

            // we retrive the pokemon from DB
            const toUpdatePokemon = await pokemonSchema.findById(req.params.id);

            // we use this assign function in order to populate
            // properties of the pokemon with properties that are
            // in request.body
            Object.assign(toUpdatePokemon, req.body.pokemon);

            // then we push the images in the array associated with the pokemon
            const images = req.files.map( fl => ({url: fl.path, filename: fl.filename}))
            toUpdatePokemon.images.push(...images)
            await toUpdatePokemon.save();

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ updatedPokemon : toUpdatePokemon }))
        }

        //if we don't have any new image we can simply find and update
        const updatedPokemon = await pokemonSchema.findByIdAndUpdate(req.params.id, pokemon, {new: true});
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ updatedPokemon }))

    } else {
        throw new customError("Invalid data", 400);
    }
};

// responsible for deleting one pokemon by a provided id
module.exports.deleteOnePokemon = async(req,res,next) => {
    const { id } = req.params;

    // here we use the "post" mongoose middleware
    await pokemonSchema.findByIdAndDelete(id, (err,deleted) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ deleted }))
    });
};