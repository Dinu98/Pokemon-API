const pokemonSchema = require('../models/pokemon');
const axios = require('axios');
const customError = require('../utils/customError')


module.exports.populateDatabase = async (req,res) => {
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
};

module.exports.getAllPokemons = async (req,res) => {
    const pokemons = await pokemonSchema.find({}).sort({weight: -1});

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ pokemons }))

};

module.exports.createOnePokemon = async (req,res) => {
    const { pokemon } = req.body;
    if(pokemon){

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

module.exports.deleteAllPokemons = async(req,res) => {
    const pokemons = await pokemonSchema.find({});

    for(let pokemon of pokemons){
        pokemon.deleteOne();
    }

    res.send("Successfully deleted all pokemons");
};

module.exports.getOnePokemon = async (req,res,next) =>{

    const pokemon = await pokemonSchema.findById(req.params.id);

    if(pokemon){
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ pokemon }))
    } else {
        throw new customError("Invalid id", 400);
    }
};

module.exports.editOnePokemon = async (req,res) => {
    if(req.body.pokemon){
        if(req.files){
            const toUpdatePokemon = await pokemonSchema.findById(req.params.id);
            Object.assign(toUpdatePokemon, req.body.pokemon);
            const images = req.files.map( fl => ({url: fl.path, filename: fl.filename}))
            toUpdatePokemon.images.push(...images)
            await toUpdatePokemon.save();
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ updatedPokemon : toUpdatePokemon }))
        }

        const updatedPokemon = await pokemonSchema.findByIdAndUpdate(req.params.id, pokemon, {new: true});
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ updatedPokemon }))
    } else {
        throw new customError("Invalid data", 400);
    }
};

module.exports.deleteOnePokemon = async(req,res,next) => {
    const { id } = req.params;

    await pokemonSchema.findByIdAndDelete(id, (err,deleted) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ deleted }))
    });
};