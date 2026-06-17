import express from "express";
import {
    registerController,
    //loginController,
    testController,
    //forgotPasswordController,
    updateProfileController,
    getOrdersController,
    getAllOrdersController,
    orderStatusController,
    sendOtpController,
    verifyOtpController,
    loginStep1Controller,
    loginVerifyController,
    forgotPasswordOtpController,
} from "../controllers/authController.js";
import { isAdmin, requiredSignIn } from "../middlewares/authMiddleware.js";

//router object
const router = express.Router();

//routing
//REGISTER || METHOD POST
router.post("/register", registerController);
router.post("/send-otp", sendOtpController);

router.post("/verify-otp", verifyOtpController);

//LOGIN || POST
//router.post("/login", loginController);
router.post("/login-step1", loginStep1Controller);

router.post("/login-verify", loginVerifyController);

//Forgot Password || POST
//router.post("/forgot-password", forgotPasswordController);
router.post("/forgot-password-otp", forgotPasswordOtpController);

//test routes
router.get("/test", requiredSignIn, isAdmin, testController);

//protected User route auth
router.get("/user-auth", requiredSignIn, (req, res) => {
    res.status(200).send({ ok: true });
});
//protected Admin route auth
router.get("/admin-auth", requiredSignIn, isAdmin, (req, res) => {
    res.status(200).send({ ok: true });
});

//update profile
router.put("/profile", requiredSignIn, updateProfileController);

//orders
router.get("/orders", requiredSignIn, getOrdersController);

//all orders
router.get("/all-orders", requiredSignIn, isAdmin, getAllOrdersController);

// order status update
router.put(
    "/order-status/:orderId",
    requiredSignIn,
    isAdmin,
    orderStatusController
);

export default router;