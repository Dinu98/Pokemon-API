const pokemonSchema = require('../models/pokemon');
const axios = require('axios');
const customError = require('../utils/customError');

// here are all the implementations of the API

// responsible for populating database
module.exports.populateDatabase =  async (req,res) => {

    // we first wait to see how many pokemons we have in our DB
    await pokemonSchema.countDocuments({}, async (err, count) => {
        if(count < 100){

            // if we have less than 100 we start requesting data
            const firstGeneration = await axios.get('https://pokeapi.co/api/v2/generation/1');

            // we store promises of specific pokemons 
            const promises = [];
            for(let i = 0; i < 100 - count; i++){
                promises.push(new Promise((resolve, reject) => {
                    // we don't need await here because we await Promise.all
                    const pokemon = axios.get(`https://pokeapi.co/api/v2/pokemon/${firstGeneration.data.pokemon_species[i].name}`);

                    if(pokemon){
                        resolve(pokemon);
                    }
                    reject("Bad request");
                }));
            }

            // we store pokemons data
            let pokemons = [];
            await Promise.all(promises).then( (values) => {
                pokemons = values;
            });

            if(pokemons){
                for(let pokemon of pokemons){

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

                // We return the number of newly added pokemons
                res.json({ newPokemons: 100 - count });

            } else {
                return null;
            }    
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

    res.json({ pokemons });

};

// responsible for creating a pokemon
module.exports.createOnePokemon = async (req,res) => {

    if(req.body.pokemon){

        const { pokemon } = req.body;
        // if we have any images we associate them
        // with the pokemon
        if(req.files){
            pokemon.images = req.files.map( fl => ({url: fl.path, filename: fl.filename}));
        }
    
        const newPokemon = await new pokemonSchema(pokemon).save();

        res.json({ newPokemon });
    } else {
        throw new customError("Invalid data", 400);
    }
};

// responsible for deleting all pokemons
module.exports.deleteAllPokemons = async(req,res) => {

    await axios.delete(`https://${process.env.API_Key}:${process.env.API_Secret}@api.cloudinary.com/v1_1/${process.env.Cloud_Name}/resources/image/upload?prefix=PokemonAPI`);

    await pokemonSchema.deleteMany({});

    res.send("Successfully deleted all pokemons");
};

// responsible for getting one pokemon by a provided id
module.exports.getOnePokemon = async (req,res,next) =>{

    const pokemon = await pokemonSchema.findById(req.params.id);

    if(pokemon){
        res.json({ pokemon });
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

            res.json({ updatedPokemon: toUpdatePokemon });
        }

        //if we don't have any new image we can simply find and update
        const updatedPokemon = await pokemonSchema.findByIdAndUpdate(req.params.id, pokemon, {new: true});
        res.json({ updatedPokemon });

    } else {
        throw new customError("Invalid data", 400);
    }
};

// responsible for deleting one pokemon by a provided id
module.exports.deleteOnePokemon = async(req,res,next) => {
    const { id } = req.params;

    // here we use the "post" mongoose middleware
    await pokemonSchema.findByIdAndDelete(id, (err,deleted) => {

        res.json({ deleted });
    });
};