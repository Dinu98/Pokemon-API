const express = require('express');
const pokemonController = require('../controllers/pokemon');
const catchAsync = require('../utils/catchAsync')
const middlewares = require('../middlewares');
const { storage } = require('../cloudinary');
const multer = require('multer');
const upload = multer({ storage })

const router = express.Router();


router.get("/populate-database",catchAsync(pokemonController.populateDatabase));

router.route("/")
    .get(catchAsync(pokemonController.getAllPokemons))
    .post(upload.array("image"), middlewares.validatePokemon, catchAsync(pokemonController.createOnePokemon))
    .delete(catchAsync(pokemonController.deleteAllPokemons));

router.route("/:id")
    .get(catchAsync(pokemonController.getOnePokemon))
    .patch(upload.array("image"), middlewares.validatePokemon, catchAsync(pokemonController.editOnePokemon))
    .delete(catchAsync(pokemonController.deleteOnePokemon));

module.exports = router;
