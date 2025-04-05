const express= require("express");
const app= express();
const port= 3000;
const mongoose= require("mongoose");
const user= require("./user.js");
const jwt= require("jsonwebtoken");
const secret="server123";
app.use(express.json());

try{
    mongoose.connect("mongodb://localhost:27017/auth-service");
    console.log("Succcessfully connected to the auth-db mongo db");
}
catch(err){
    console.log("Could not connect with the mongo database ",err);
}


app.post("/auth/register", async function(req,res){
    const {email,password,name}= req.body;
    //We first check if the user exists already with the same password
    const userexists= await user.findOne({
        email: email
    });
    if(userexists){
        res.status(200).json({
            msg:"User already exists with the same mail id"
        });
    }

    const newUser= user.insertOne({
        name: name,
        email: email,
        password: password
    });

    res.status(200).json({
        msg: "Successfully created a new user"
    });
})

app.post("/auth/login",async function(req,res){
    const {email,password}= req.body;
    //check if the mail exists or not
    const checker= await user.findOne({
        email:email
    });
    if(!checker){
        res.status(200).json({
            msg:"User not found in the DB"
        });
    }

    const payload={
        email:email,
        name: checker.name
    }

    const token= jwt.sign(payload,secret);
    res.status(200).json({
        msg:"Successfully logged in",
        token: token
    });
})


app.listen(port,function(){
    console.log("The server is listening on port ",port);
});