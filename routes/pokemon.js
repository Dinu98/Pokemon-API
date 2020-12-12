const express = require('express');
const pokemonSchema = require('../models/pokemon');
const axios = require('axios');

const router = express.Router();


router.get("/populate-database", async (req,res) => {
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

router.route("/")
    .get(async (req,res) => {
        const pokemons = await pokemonSchema.find({}).sort({weight: -1});

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ pokemons }))

    })
    .post(async (req,res) => {
        const { pokemon } = req.body;
    
        if(pokemon){
            const newPokemon = await new pokemonSchema(pokemon).save();
    
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ newPokemon}))
        } else {
            res.send("Invalid data");
        }
    })
    .delete(async(req,res) => {
        await pokemonSchema.deleteMany({});
    
        res.send("Successfully deleted all pokemons");
    });

router.route("/:id")
    .get(async (req,res) =>{

    const pokemon = await pokemonSchema.findById(req.params.id);

    if(pokemon){
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ pokemon }))
    } else {
        res.send("Could not find this pokemon");
    }
    })
    .patch(async (req,res) => {
        const { id } = req.params;
        const { pokemon } = req.body;
    
        if(pokemon){
            const updatedPokemon = await pokemonSchema.findByIdAndUpdate(id, pokemon, {new: true});
            console.log(updatedPokemon);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ updatedPokemon }))
        } else {
            console.log("Invalid data");
        }
    })
    .delete(async(req,res) => {
        const { id } = req.params;
    
        await pokemonSchema.findByIdAndDelete(id, (err,deleted) => {
            if(err){
                res.send(err);
            } else {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ deleted }))
            }
        });
    });

module.exports = router;
