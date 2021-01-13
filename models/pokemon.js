const mongoose = require('mongoose');
const { cloudinary } = require('../cloudinary')

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

const imageSchema = new  Schema({
    url: String,
    filename: String
});

// schema that structures our Pokemon
// it uses 3 more schemas defined above
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
    firstItem: itemSchema,
    images: [imageSchema]
});

// we use this mongoose middleware to ensure that 
// when we delete a pokemon by id, the image associated with it
// is deleted from cloudinary as well
pokemonSchema.post("findOneAndDelete", async function(data) {
    if(data){
        for(let img of data.images){
            console.log(img);
            await cloudinary.uploader.destroy(img.filename);
        }
    }
});

module.exports = mongoose.model("Pokemon", pokemonSchema);