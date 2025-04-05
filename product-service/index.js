//Only product service and ordeer service will be interacting with the rabbitmq
const express= require("express");
const app= express();
const port= 3001;
const mongoose= require("mongoose");
const jwt= require("jsonwebtoken");
const secret="server123";
const amqp= require("amqplib");  //created an instance of amqplib(RabbitMQ library in Node.js)
const product= require("./product.js");
const isAuthenticated= require("../isAuthenticated.js");
app.use(express.json());

var channel,connection;

try{
    mongoose.connect("mongodb://localhost:27017/product-service");
    console.log("Succcessfully connected to the product-db mongo db");
}
catch(err){
    console.log("Could not connect with the mongo database ",err);
}

async function connect(){
    try{
        const amqpServer= "amqp://localhost:5672";  //5672 is the default port that RabbitMQ runs on. I have pulled rabbitmq image from docker and mapped its port on my local port (5672). So while running this, ensure that docker daemon is on.
        connection= await amqp.connect(amqpServer); //We are connecting with the rabbitmq server
        channel= await connection.createChannel(); //Once connected, we create a channel. Think of channel as the place where we publish and consume the messages
        await channel.assertQueue("PRODUCT");  //This checks if a queue named "PRODUCT" exists in our channel. If not, it creates one.
        console.log("Connected to RabbitMQ");  //Logs if we have successfully connected to RabbitMQ
    }
    catch(err){
        console.log("Could not connect with RabbitMQ ",err);  //Logs if we havent connected to RabbitMQ
    }
}

connect();

//API to create a new product
app.post("/product/create", isAuthenticated, async function(req,res){
    const {name,descrption,price}= req.body;
    const newpdt= await product.insertOne({
        name: name,
        descrption: descrption,
        price: price
    });
    
    res.status(200).json({
        msg:"Successfully entered the new product",
        product: newpdt
    });
})

app.post("/product/buy", isAuthenticated, async function(req,res){
    const {ids}= req.body;
    const products= await product.find({_id:{$in: ids}});  //This will return and array of documents which have id in the ids

    //Now we want to send the product from the product service to the order service. So we will be using the channel variable for that.
    //while sending message to queue in a particular channel, we need to pass the name of the queue and the content of message in the arguements.
    channel.sendToQueue("ORDER",Buffer.from(JSON.stringify({
        products,
        userEmail: req.user_email
    })))  //This sends this object containing products and userEmail to order service
    
    let order;
    channel.consume("PRODUCT",function(data){
        order= JSON.stringify(data.content);
    });

    res.status(200).json({
        msg:"The order has been confirmed",
        order: order
    });
})


app.listen(port,function(){
    console.log("The server is listening on port ",port);
});

/*
So the user places a order to buy products in product.js. So product-service creates a channel, and creates a queue in the channel 'PRODUCT'. 
Now it publishes a message containing the user's mail and product details in the ORDER queue. Now in order.js it consumes the message from the 
ORDER queue, and generates a javascript-object containing the products, user's email and total price of the product. It updates this in the order db, 
and then pushes this object in the 'PRODUCT' queue. Now 'PRODUCT' queue consumes the message, and responds with the bill(the javascript object).
*/