const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// we config cloudinary with our credentials
cloudinary.config({
    cloud_name: process.env.Cloud_Name,
    api_key: process.env.API_Key,
    api_secret: process.env.API_Secret
});

// we configure the storage area of the cloud
const storage = new CloudinaryStorage({
    cloudinary,
    params:{
        folder: "PokemonAPI",
        allowedFormats: ["jpg","png","jpeg"]  
    }
});

module.exports = {
    cloudinary,
    storage
}