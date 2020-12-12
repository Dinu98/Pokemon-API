const validatePokemonSchema = require('./validateSchemas/pokemonValidateSchema');
const customError = require('./utils/customError');

module.exports.validatePokemon = (req,res,next) => {

    const { error } = validatePokemonSchema.validate(req.body);

    console.log("Middleware validation");

    if(error){
        const message = error.details.map(el => el.message).join(",");
        throw new customError (message, 400);
    } else {
        return next();
    }
};