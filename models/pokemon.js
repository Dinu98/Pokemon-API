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

pokemonSchema.post("findOneAndDelete", async function(data) {
    if(data){
        for(let img of data.images){
            console.log(img);
            await cloudinary.uploader.destroy(img.filename);
        }
    }
});

pokemonSchema.pre("deleteOne",{ document: true }, async function (next) {
    for(let img of this.images){
        await cloudinary.uploader.destroy(img.filename);
    }
    next();
});

module.exports = mongoose.model("Pokemon", pokemonSchema);