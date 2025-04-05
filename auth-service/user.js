//DB model
const mongoose= require("mongoose");
const Schema= mongoose.Schema;

const UserSchema= new Schema({
    name: String,
    email: String,
    password: String,
    created_at:{
        type: Date,
        default: Date.now()
    }
});

const user= mongoose.model("User",UserSchema);
module.exports= user;