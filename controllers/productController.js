import fs from "fs";
import slugify from "slugify";
import braintree from "braintree";
import dotenv from "dotenv";
import mongoose from "mongoose";
import productModel from "../models/productModel.js";
import categoryModel from "../models/categoryModel.js";
import orderModel from "../models/orderModel.js";
import { markCouponUsed } from "./gameController.js";

dotenv.config();

var gateway = new braintree.BraintreeGateway({
    environment: braintree.Environment.Sandbox,
    merchantId: process.env.BRAINTREE_MERCHANT_ID,
    publicKey: process.env.BRAINTREE_PUBLIC_KEY,
    privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});

export const createProductController = async (req, res) => {
    try {
        const { name, description, price, category, quantity, shipping } = req.fields;
        const { photo } = req.files;
        switch (true) {
            case !name: return res.status(500).send({ error: "Name is Required" });
            case !description: return res.status(500).send({ error: "Description is Required" });
            case !price: return res.status(500).send({ error: "Price is Required" });
            case !category: return res.status(500).send({ error: "Category is Required" });
            case !quantity: return res.status(500).send({ error: "Quantity is Required" });
            case photo && photo.size > 1000000: return res.status(500).send({ error: "photo is Required and should be less then 1mb" });
        }
        const products = new productModel({ ...req.fields, slug: slugify(name) });
        if (photo) {
            products.photo.data = fs.readFileSync(photo.path);
            products.photo.contentType = photo.type;
        }
        await products.save();
        res.status(201).send({ success: true, message: "Product Created Successfully", products });
    } catch (error) {
        console.log(error);
        res.status(500).send({ success: false, error, message: "Error in crearing product" });
    }
};

export const getProductController = async (req, res) => {
    try {
        const products = await productModel.find({}).populate("category").select("-photo").limit(12).sort({ createdAt: -1 });
        res.status(200).send({ success: true, counTotal: products.length, message: "ALlProducts ", products });
    } catch (error) {
        console.log(error);
        res.status(500).send({ success: false, message: "Erorr in getting products", error: error.message });
    }
};

export const getSingleProductController = async (req, res) => {
    try {
        const product = await productModel.findOne({ slug: req.params.slug }).select("-photo").populate("category");
        res.status(200).send({ success: true, message: "Single Product Fetched", product });
    } catch (error) {
        console.log(error);
        res.status(500).send({ success: false, message: "Eror while getitng single product", error });
    }
};

export const productPhotoController = async (req, res) => {
    try {
        const product = await productModel.findById(req.params.pid).select("photo");
        if (product.photo.data) {
            res.set("Content-type", product.photo.contentType);
            return res.status(200).send(product.photo.data);
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({ success: false, message: "Erorr while getting photo", error });
    }
};

export const deleteProductController = async (req, res) => {
    try {
        await productModel.findByIdAndDelete(req.params.pid).select("-photo");
        res.status(200).send({ success: true, message: "Product Deleted successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).send({ success: false, message: "Error while deleting product", error });
    }
};

export const updateProductController = async (req, res) => {
    try {
        const { name, description, price, category, quantity, shipping } = req.fields;
        const { photo } = req.files;
        switch (true) {
            case !name: return res.status(500).send({ error: "Name is Required" });
            case !description: return res.status(500).send({ error: "Description is Required" });
            case !price: return res.status(500).send({ error: "Price is Required" });
            case !category: return res.status(500).send({ error: "Category is Required" });
            case !quantity: return res.status(500).send({ error: "Quantity is Required" });
            case photo && photo.size > 1000000: return res.status(500).send({ error: "photo is Required and should be less then 1mb" });
        }
        const products = await productModel.findByIdAndUpdate(req.params.pid, { ...req.fields, slug: slugify(name) }, { new: true });
        if (photo) {
            products.photo.data = fs.readFileSync(photo.path);
            products.photo.contentType = photo.type;
        }
        await products.save();
        res.status(201).send({ success: true, message: "Product Updated Successfully", products });
    } catch (error) {
        console.log(error);
        res.status(500).send({ success: false, error, message: "Error in Updte product" });
    }
};

export const productFiltersController = async (req, res) => {
    try {
        const { checked, radio } = req.body;
        let args = {};
        if (checked.length > 0) args.category = checked;
        if (radio.length) args.price = { $gte: radio[0], $lte: radio[1] };
        const products = await productModel.find(args);
        res.status(200).send({ success: true, products });
    } catch (error) {
        console.log(error);
        res.status(400).send({ success: false, message: "Error WHile Filtering Products", error });
    }
};

export const productCountController = async (req, res) => {
    try {
        const total = await productModel.find({}).estimatedDocumentCount();
        res.status(200).send({ success: true, total });
    } catch (error) {
        console.log(error);
        res.status(400).send({ message: "Error in product count", error, success: false });
    }
};

export const productListController = async (req, res) => {
    try {
        const perPage = 6;
        const page = req.params.page ? req.params.page : 1;
        const products = await productModel.find({}).select("-photo").skip((page - 1) * perPage).limit(perPage).sort({ createdAt: -1 });
        res.status(200).send({ success: true, products });
    } catch (error) {
        console.log(error);
        res.status(400).send({ success: false, message: "error in per page ctrl", error });
    }
};

export const searchProductController = async (req, res) => {
    try {
        const { keyword } = req.params;
        const resutls = await productModel.find({
            $or: [
                { name: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } },
            ],
        }).select("-photo");
        res.json(resutls);
    } catch (error) {
        console.log(error);
        res.status(400).send({ success: false, message: "Error In Search Product API", error });
    }
};

export const realtedProductController = async (req, res) => {
    try {
        const { pid, cid } = req.params;
        const products = await productModel.find({ category: cid, _id: { $ne: pid } }).select("-photo").limit(3).populate("category");
        res.status(200).send({ success: true, products });
    } catch (error) {
        console.log(error);
        res.status(400).send({ success: false, message: "error while geting related product", error });
    }
};

export const productCategoryController = async (req, res) => {
    try {
        const category = await categoryModel.findOne({ slug: req.params.slug });
        const products = await productModel.find({ category }).populate("category");
        res.status(200).send({ success: true, category, products });
    } catch (error) {
        console.log(error);
        res.status(400).send({ success: false, error, message: "Error While Getting products" });
    }
};

export const braintreeTokenController = async (req, res) => {
    try {
        gateway.clientToken.generate({}, function (err, response) {
            if (err) res.status(500).send(err);
            else res.send(response);
        });
    } catch (error) {
        console.log(error);
    }
};

// ── Helper: group flat cart array → [{_id, name, price, size, quantity}] ──────
// Cart comes in as repeated items e.g. [{_id:"abc", size:"M"}, {_id:"abc", size:"M"}, {_id:"abc", size:"L"}]
// We group by _id + size so stock deduction is accurate
const groupCartItems = (cart) => {
    const map = {};
    cart.forEach((item) => {
        const key = `${item._id}__${item.size || ""}`;
        if (map[key]) {
            map[key].quantity += 1;
        } else {
            map[key] = {
                _id: new mongoose.Types.ObjectId(item._id),
                name: item.name || "",
                price: item.price || 0,
                size: item.size || "",
                quantity: 1,
            };
        }
    });
    return Object.values(map);
};

export const brainTreePaymentController = async (req, res) => {
    try {
        const { nonce, cart, couponCode, finalAmount } = req.body;

        // Calculate raw total from flat cart
        let rawTotal = 0;
        cart.forEach((i) => { rawTotal += i.price; });

        // Decide final charge amount
        let chargeAmount;
        if (finalAmount && !isNaN(parseFloat(finalAmount)) && parseFloat(finalAmount) > 0) {
            chargeAmount = parseFloat(finalAmount).toFixed(2);
        } else {
            chargeAmount = rawTotal.toFixed(2);
        }

        console.log("💳 Payment charge amount:", chargeAmount, "| Coupon:", couponCode || "none");

        gateway.transaction.sale(
            {
                amount: chargeAmount,
                paymentMethodNonce: nonce,
                options: { submitForSettlement: true },
            },
            async (error, result) => {
                try {
                    if (error) {
                        console.error("Braintree error:", error);
                        return res.status(500).send(error);
                    }

                    if (result && result.success) {

                        // ✅ Group flat cart into proper line items with quantity
                        const formattedProducts = groupCartItems(cart);

                        console.log("🛒 Order products:", JSON.stringify(formattedProducts, null, 2));

                        const order = new orderModel({
                            products: formattedProducts,
                            payment: result,
                            buyer: req.user._id,
                        });

                        await order.save();

                        if (couponCode) {
                            await markCouponUsed(couponCode);
                        }

                        return res.json({ ok: true });
                    } else {
                        console.error("Payment failed:", result?.transaction?.processorResponseText);
                        return res.status(500).send(result);
                    }
                } catch (err) {
                    console.log("Unexpected error:", err);
                    return res.status(500).send({ success: false, message: "Payment processing failed" });
                }
            }
        );

    } catch (error) {
        console.log("Payment error:", error);
        res.status(500).send({ success: false, message: "Payment failed" });
    }
};