const mongoose= require("mongoose");
const Schema= mongoose.Schema;

const ProductSchema= new Schema({
    name: String,
    description: String,
    price: Number,
    created_at:{
        type: Date,
        default: Date.now()
    }
});

const product= mongoose.model("Product",ProductSchema);
module.exports= product;