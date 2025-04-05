//Only product service and ordeer service will be interacting with the rabbitmq
const express= require("express");
const app= express();
const port= 3002;
const mongoose= require("mongoose");
const jwt= require("jsonwebtoken");
const secret="server123";
const amqp= require("amqplib");  //created an instance of amqplib(RabbitMQ library in Node.js)
const order= require("./order.js");
const isAuthenticated= require("../isAuthenticated.js");
const { json } = require("body-parser");
app.use(express.json());

var channel,connection;

try{
    mongoose.connect("mongodb://localhost:27017/order-service");
    console.log("Succcessfully connected to the order-db mongo db");
}
catch(err){
    console.log("Could not connect with the mongo database ",err);
}

async function createOrder(products,userEmail){
    let total= 0;
    for(let i=0;i<products.length;i++){
        total+=products[i].price;
    }
    const newOrder= await order.insertOne({
        products,
        user: userEmail,
        total_price: total
    });
    
    return newOrder;
}

async function connect(){
    try{
        const amqpServer= "amqp://localhost:5672";  //5672 is the default port that RabbitMQ runs on. I have pulled rabbitmq image from docker and mapped its port on my local port (5672). So while running this, ensure that docker daemon is on.
        connection= await amqp.connect(amqpServer); //We are connecting with the rabbitmq server
        channel= await connection.createChannel(); //Once connected, we create a channel. Think of channel as the place where we publish and consume the messages
        await channel.assertQueue("ORDER");  //This checks if a queue named "ORDER" exists in our channel. If not, it creates one.
        console.log("Connected to RabbitMQ");  //Logs if we have successfully connected to RabbitMQ
    }
    catch(err){
        console.log("Could not connect with RabbitMQ ",err);  //Logs if we havent connected to RabbitMQ
    }
}

//Now order service must wait and consume whatever is coming in its queue

async function startConsuming(){
    try{
        await connect();   //This ensures that rabbitmq connection is set before moving forward

        //Now we consume messages from the "ORDER" queue
        //while consuming from queue, we need to pass the name of the queue, and a callback function with parameter data (which is the message in the queue) which parses through data, and then acknowledges it.
        channel.consume("ORDER", function(data){
            console.log("Consuming order service");
            const {products,userEmail}= JSON.parse(data.content);  //Parsed through the data in the queue
            const newOrder= createOrder(products,userEmail); //updated the products to buy in the Order DB

            //Acknowledged the consumed message
            channel.ack(data);

            //Send a message to the "PRODUCT" queue with new order details
            channel.sendToQueue("PRODUCT",Buffer.from(JSON.stringify({newOrder})))
        });
    }
    catch(err){
        console.log("Error connecting to RabbitMQ")
    }
}

startConsuming();



app.listen(port,function(){
    console.log("The server is listening on port ",port);
});

//json.parse() Converts a JSON-formatted string into a JavaScript object.
//json.stringify() Converts a JavaScript object or value into a JSON-formatted string.
//In Node.js, buffer.from() helps to convert a string or an array to binary for efficient file operations or network coommunications(like sending messages to a queue)
//So as we can see, the user is not directly interacting with the order-service, but the product to buy gets updated in the order-service DB because of the RabbitMQ interaction between order-service and db-service