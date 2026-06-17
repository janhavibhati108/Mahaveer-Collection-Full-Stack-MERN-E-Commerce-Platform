// controllers/stockController.js

import mongoose from "mongoose";
import orderModel from "../models/orderModel.js";
import productModel from "../models/productModel.js";

// GET /api/v1/product/stock/:pid
export const getProductStock = async (req, res) => {
    try {
        const { pid } = req.params;

        const product = await productModel
            .findById(pid)
            .select("quantity name");

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        const productObjectId = new mongoose.Types.ObjectId(pid);

        // Find all non-cancelled orders that contain this product
        const orders = await orderModel.find({
            "products._id": productObjectId,
            status: { $ne: "cancel" },   // matches your enum exactly
        });

        let orderedQty = 0;

        orders.forEach((order) => {
            order.products.forEach((item) => {
                if (item._id.equals(productObjectId)) {
                    // quantity is now correctly stored (grouped at payment time)
                    orderedQty += item.quantity || 1;
                }
            });
        });

        const availableStock = Math.max(0, product.quantity - orderedQty);

        console.log(
            `📦 [${product.name}] total=${product.quantity} | ordered=${orderedQty} | available=${availableStock}`
        );

        return res.status(200).json({
            success: true,
            totalStock: product.quantity,
            orderedQty,
            availableStock,
        });

    } catch (err) {
        console.error("Stock check error:", err);
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: err.message,
        });
    }
};