import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        products: [
            {
                _id: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },
                name: String,
                price: Number,
                size: String,
                quantity: {
                    type: Number,
                    default: 1,
                    min: 1,
                },
            }
        ],
        payment: {},
        buyer: {
            type: mongoose.ObjectId,
            ref: "users",
        },
        status: {
            type: String,
            default: "Not Process",
            enum: ["Not Process", "Processing", "Shipped", "deliverd", "cancel"],
        },
    },
    { timestamps: true }
);

export default mongoose.model("Order", orderSchema);