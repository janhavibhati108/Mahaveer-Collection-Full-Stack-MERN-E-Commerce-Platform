import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";
import otpModel from "../models/otpModel.js";
import { sendOtpEmail } from "../helpers/sendOtp.js";

import { comparePassword, hashPassword } from "./../helpers/authHelper.js";
import JWT from "jsonwebtoken";

export const registerController = async (req, res) => {
    try {
        const { name, email, password, phone, address, answer } = req.body;
        //validations
        if (!name) {
            return res.send({ error: "Name is Required" });
        }
        if (!email) {
            return res.send({ message: "Email is Required" });
        }
        if (!password) {
            return res.send({ message: "Password is Required" });
        }
        if (!phone) {
            return res.send({ message: "Phone no is Required" });
        }
        if (!address) {
            return res.send({ message: "Address is Required" });
        }
        if (!answer) {
            return res.send({ message: "Answer is Required" });
        }
        //check user
        const exisitingUser = await userModel.findOne({ email });
        //exisiting user
        if (exisitingUser) {
            return res.status(200).send({
                success: false,
                message: "Already Register please login",
            });
        }
        //register user
        const hashedPassword = await hashPassword(password);
        //save
        const user = await new userModel({
            name,
            email,
            phone,
            address,
            password: hashedPassword,
            answer,
        }).save();

        res.status(201).send({
            success: true,
            message: "User Register Successfully",
            user,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Errro in Registeration",
            error,
        });
    }
};
export const sendOtpController = async (req, res) => {
    try {
        const { email } = req.body;

        const otp = Math.floor(
            100000 + Math.random() * 900000
        ).toString();

        await otpModel.deleteMany({ email });

        await otpModel.create({
            email,
            otp,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        });

        await sendOtpEmail(email, otp);

        res.status(200).send({
            success: true,
            message: "OTP Sent Successfully",
        });
    } catch (error) {
        console.log(error);

        res.status(500).send({
            success: false,
            message: "Error Sending OTP",
        });
    }
};
export const verifyOtpController = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const record = await otpModel.findOne({ email });

        if (!record) {
            return res.status(400).send({
                success: false,
                message: "OTP Not Found",
            });
        }

        if (record.expiresAt < new Date()) {
            return res.status(400).send({
                success: false,
                message: "OTP Expired",
            });
        }

        if (record.otp !== otp) {
            return res.status(400).send({
                success: false,
                message: "Invalid OTP",
            });
        }

        res.status(200).send({
            success: true,
            message: "OTP Verified",
        });
    } catch (error) {
        console.log(error);
    }
};
//POST LOGIN
/*export const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;
        //validation
        if (!email || !password) {
            return res.status(404).send({
                success: false,
                message: "Invalid email or password",
            });
        }
        //check user
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).send({
                success: false,
                message: "Email is not registerd",
            });
        }
        const match = await comparePassword(password, user.password);
        if (!match) {
            return res.status(200).send({
                success: false,
                message: "Invalid Password",
            });
        }
        //token
        const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });
        res.status(200).send({
            success: true,
            message: "login successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
                role: user.role,
            },
            token,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in login",
            error,
        });
    }
};*/
export const loginStep1Controller = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(404).send({
                success: false,
                message: "Email not registered",
            });
        }

        const match = await comparePassword(
            password,
            user.password
        );

        if (!match) {
            return res.status(401).send({
                success: false,
                message: "Invalid Password",
            });
        }

        const otp = Math.floor(
            100000 + Math.random() * 900000
        ).toString();

        await otpModel.deleteMany({ email });

        await otpModel.create({
            email,
            otp,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        });

        await sendOtpEmail(email, otp);

        res.status(200).send({
            success: true,
            message: "OTP sent successfully",
        });

    } catch (error) {
        console.log(error);

        res.status(500).send({
            success: false,
            message: "Error in Login Step 1",
        });
    }
};
export const loginVerifyController = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const record = await otpModel.findOne({ email });

        if (!record) {
            return res.status(400).send({
                success: false,
                message: "OTP Not Found",
            });
        }

        if (record.expiresAt < new Date()) {
            return res.status(400).send({
                success: false,
                message: "OTP Expired",
            });
        }

        if (record.otp !== otp) {
            return res.status(400).send({
                success: false,
                message: "Invalid OTP",
            });
        }

        const user = await userModel.findOne({ email });

        const token = JWT.sign(
            { _id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(200).send({
            success: true,
            message: "Login Successful",
            user,
            token,
        });

    } catch (error) {
        console.log(error);

        res.status(500).send({
            success: false,
            message: "OTP Verification Failed",
        });
    }
};


//forgotPasswordController

/*export const forgotPasswordController = async (req, res) => {
    try {
        const { email, answer, newPassword } = req.body;
        if (!email) {
            res.status(400).send({ message: "Emai is required" });
        }
        if (!answer) {
            res.status(400).send({ message: "answer is required" });
        }
        if (!newPassword) {
            res.status(400).send({ message: "New Password is required" });
        }
        //check
        const user = await userModel.findOne({ email, answer });
        //validation
        if (!user) {
            return res.status(404).send({
                success: false,
                message: "Wrong Email Or Answer",
            });
        }
        const hashed = await hashPassword(newPassword);
        await userModel.findByIdAndUpdate(user._id, { password: hashed });
        res.status(200).send({
            success: true,
            message: "Password Reset Successfully",
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Something went wrong",
            error,
        });
    }
};*/

export const forgotPasswordOtpController = async (req, res) => {
    try {

        const { email, otp, newPassword } = req.body;

        const otpRecord = await otpModel.findOne({ email });

        if (!otpRecord) {
            return res.status(400).send({
                success: false,
                message: "OTP Not Found",
            });
        }

        if (otpRecord.expiresAt < new Date()) {
            return res.status(400).send({
                success: false,
                message: "OTP Expired",
            });
        }

        if (otpRecord.otp !== otp) {
            return res.status(400).send({
                success: false,
                message: "Invalid OTP",
            });
        }

        const hashedPassword = await hashPassword(newPassword);

        await userModel.findOneAndUpdate(
            { email },
            { password: hashedPassword }
        );

        await otpModel.deleteMany({ email });

        res.status(200).send({
            success: true,
            message: "Password Reset Successfully",
        });

    } catch (error) {
        console.log(error);

        res.status(500).send({
            success: false,
            message: "Password Reset Failed",
        });
    }
};

//test controller
export const testController = (req, res) => {
    try {
        res.send("Protected Routes");
    } catch (error) {
        console.log(error);
        res.send({ error });
    }
};

//update prfole
export const updateProfileController = async (req, res) => {
    try {
        const { name, email, password, address, phone } = req.body;
        const user = await userModel.findById(req.user._id);
        //password
        if (password && password.length < 6) {
            return res.json({ error: "Passsword is required and 6 character long" });
        }
        const hashedPassword = password ? await hashPassword(password) : undefined;
        const updatedUser = await userModel.findByIdAndUpdate(
            req.user._id,
            {
                name: name || user.name,
                password: hashedPassword || user.password,
                phone: phone || user.phone,
                address: address || user.address,
            },
            { new: true }
        );
        res.status(200).send({
            success: true,
            message: "Profile Updated SUccessfully",
            updatedUser,
        });
    } catch (error) {
        console.log(error);
        res.status(400).send({
            success: false,
            message: "Error WHile Update profile",
            error,
        });
    }
};

export const getOrdersController = async (req, res) => {
    try {
        const orders = await orderModel
            .find({ buyer: req.user._id })   // ✅ only this user's orders
            .populate("buyer", "name email address phone")
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error while getting orders",
            error,
        });
    }
};

// For admin — all orders
export const getAllOrdersController = async (req, res) => {
    try {
        const orders = await orderModel
            .find({})
            .populate("buyer", "name email address phone")
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error while getting orders",
            error,
        });
    }
};
//order status
export const orderStatusController = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;
        const orders = await orderModel.findByIdAndUpdate(
            orderId,
            { status },
            { new: true }
        );
        res.json(orders);
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error While Updateing Order",
            error,
        });
    }
};