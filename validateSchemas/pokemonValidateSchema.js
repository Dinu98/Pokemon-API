const joi = require('joi');

// schema that structures how we want the data to look like
pokemonSchema = joi.object({
    pokemon: joi.object({
        name: joi.string().required(),
        height: joi.number().min(0).required(),
        weight: joi.number().min(0).required(),
        abilities: joi.array(),
        firstItem: joi.object(),
    }).required()
});

module.exports = pokemonSchema;