# Message-Broker

This is an e-commerce backend application built using Node.js, Express.js, MongoDB, and RabbitMQ as the message broker. The primary focus of this project is to demonstrate the implementation of the `amqplib` library in Node.js.

## Services

The application comprises three main services:

1. **auth-service:**  
   Handles user registration and login.

2. **product-service:**  
   Manages product creation in the database and processes orders for purchasing products.

3. **order-service:**  
   Calculates the total price for purchased products and generates a bill containing the product details, total price, and the user's email.

## Message Queues

Two queues have been created using RabbitMQ:

- **PRODUCT Queue**
- **ORDER Queue**

## Workflow

1. **Order Placement:**  
   The user initiates an order to purchase products via the product-service.

2. **Publishing to the ORDER Queue:**  
   The product-service establishes a channel and asserts a queue named **"PRODUCT"**. It then publishes a message containing the user's email and product details to the **ORDER** queue.

3. **Order Processing:**  
   The order-service consumes the message from the **ORDER** queue. It processes the message by creating a JavaScript object that includes the products, the user's email, and the total price. The order is then updated in the order database.

4. **Responding with the Bill:**  
   After processing, the order-service pushes the generated object to the **PRODUCT** queue. The product-service then consumes the message from the **PRODUCT** queue and responds with the bill (the JavaScript object), which includes the order details.

## Technologies Used

- **Node.js & Express.js:** For server-side logic and API creation.
- **MongoDB:** For storing user, product, and order information.
- **RabbitMQ:** For inter-service communication using the `amqplib` library.

## Getting Started

1. **Clone the Repository:**  
   Clone this repository to your local machine.

2. **Install Dependencies:**  
   Run `npm install` in each service directory to install the necessary packages.

3. **Start RabbitMQ:**  
   Ensure RabbitMQ is running (e.g., via Docker) and accessible on the default port (5672).

4. **Run the Services:**  
   Start each service (auth-service, product-service, order-service) individually.

5. **Testing the API:**  
   Use an API client like Postman or curl to interact with the endpoints (e.g., placing an order via `/product/buy`).

## Conclusion

This application demonstrates how to integrate multiple microservices with RabbitMQ as a message broker. The focus on the `amqplib` library highlights the implementation of message-driven communication between services in a Node.js environment.

