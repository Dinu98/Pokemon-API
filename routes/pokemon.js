const express = require('express');
const pokemonController = require('../controllers/pokemon');
const catchAsync = require('../utils/catchAsync')
const middlewares = require('../middlewares');
const { storage } = require('../cloudinary');
const multer = require('multer');
const upload = multer({ storage })

const router = express.Router();

// route responsible for populating the database
router.get("/populate-database",catchAsync(pokemonController.populateDatabase));

// routes responsible for retrieving all the pokemons, deleting all the pokemons
// and creating a pokemon
router.route("/")
    .get(catchAsync(pokemonController.getAllPokemons))
    .post(upload.array("image"), middlewares.validatePokemon, catchAsync(pokemonController.createOnePokemon))
    .delete(catchAsync(pokemonController.deleteAllPokemons));

// routes responsible for geting a pokemon by id, deleting a pokemon by id
// and editing an existing pokemon by id
router.route("/:id")
    .get(catchAsync(pokemonController.getOnePokemon))
    .patch(upload.array("image"), middlewares.validatePokemon, catchAsync(pokemonController.editOnePokemon))
    .delete(catchAsync(pokemonController.deleteOnePokemon));

module.exports = router;
