const mongoose= require("mongoose");
const Schema= mongoose.Schema;

const OrderSchema= new Schema({
    products:[
        {
            product_id: String
        }
    ],
    user: String,
    total_price: Number,
    created_at: {
        type: Date,
        default: Date.now()
    }
});

const order= mongoose.model("Order",OrderSchema);
module.exports= order;