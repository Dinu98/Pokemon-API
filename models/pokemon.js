const mongoose = require('mongoose');

const { Schema } = mongoose;

const abilitySchema = new  Schema({
    name: String,
    hidden: Boolean,
    slot: Number,
});

const itemSchema = new  Schema({
    name: String,
    url: String
});

const pokemonSchema = new  Schema({
    name:{
        type: String,
        required: [true, "Name is missing"]
    },
    height:{
        type: Number,
        required: [true, "Height is missing"]
    },
    weight:{
        type:String,
        required: [true, "Weight is missing"]
    },
    abilities:[abilitySchema],
    firstItem: itemSchema
});

module.exports = mongoose.model("Pokemon", pokemonSchema);