const express = require('express');
const pokemonController = require('../controllers/pokemon');

const router = express.Router();


router.get("/populate-database",pokemonController.populateDatabase);

router.route("/")
    .get(pokemonController.getAllPokemons)
    .post(pokemonController.createOnePokemon)
    .delete(pokemonController.deleteAllPokemons);

router.route("/:id")
    .get(pokemonController.getOnePokemon)
    .patch(pokemonController.editOnePokemon)
    .delete(pokemonController.deleteOnePokemon);

module.exports = router;
