import JWT from "jsonwebtoken";
import userModel from "../models/userModel.js";

export const requiredSignIn = async (req, res, next) => {
    try {
        const decoded = await JWT.verify(req.headers.authorization, process.env.JWT_SECRET);
        req.user = decoded;
        next();


    } catch (error) {
        console.error(error);
    }
};

//admin
export const isAdmin = async (req, res, next) => {
    try {
        const user = await userModel.findById(req.user._id);
        if (user.role !== 1) {
            return res.status(401).send({
                success: false,
                message: "Access denied. Admin only."
            });
        } else {
            next();
        }
    } catch (error) {
        console.error(error);
        res.status(401).send({
            success: false,
            message: "error in admin middleware",
            error
        });
    }
};
