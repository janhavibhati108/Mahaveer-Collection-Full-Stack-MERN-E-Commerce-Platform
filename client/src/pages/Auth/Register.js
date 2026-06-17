import React, { useState } from "react";
import Layout from "./../../components/Layout/Layout";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "../../styles/AuthStyles.css";

const Register = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [answer, setAnswer] = useState("");

    const [otp, setOtp] = useState("");
    const [otpVerified, setOtpVerified] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    // Send OTP
    const sendOtp = async () => {
        try {
            if (!email) {
                return toast.error("Please enter email first");
            }

            setLoading(true);

            const { data } = await axios.post(
                "/api/v1/auth/send-otp",
                { email }
            );

            if (data.success) {
                setOtpSent(true);
                toast.success("OTP sent successfully");
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error("Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    // Verify OTP
    const verifyOtp = async () => {
        try {
            const { data } = await axios.post(
                "/api/v1/auth/verify-otp",
                {
                    email,
                    otp,
                }
            );

            if (data.success) {
                setOtpVerified(true);
                toast.success("OTP Verified Successfully");
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error("Invalid OTP");
        }
    };

    // Register
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!otpVerified) {
            return toast.error("Please verify OTP first");
        }

        try {
            const res = await axios.post(
                "/api/v1/auth/register",
                {
                    name,
                    email,
                    password,
                    phone,
                    address,
                    answer,
                }
            );

            if (res && res.data.success) {
                toast.success(res.data.message);
                navigate("/login");
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error("Something went wrong");
        }
    };

    return (

        <Layout title="Register">
            <div
                style={{
                    // minHeight: "100vh",
                    paddingTop: "150px",
                    paddingLeft: "20px",
                    paddingRight: "20px",
                    paddingBottom: "50px",
                    backgroundImage:
                        'linear-gradient(rgba(255, 255, 255, 0.26), rgba(255, 240, 245, 0.3)), url("/images/BackDrop.png")',
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundAttachment: "fixed",

                }}
            >
                <div className="form-container" style={{ minHeight: "90vh" }}>
                    <form onSubmit={handleSubmit}>
                        {/* ALL YOUR EXISTING FORM CODE STAYS EXACTLY SAME HERE */}

                        <h4 className="title">Create Account</h4>

                        <div className="mb-3">
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="form-control"
                                placeholder="Enter Your Name"
                                required
                                autoFocus
                            />
                        </div>

                        <div className="mb-3">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setOtpVerified(false);
                                }}
                                className="form-control"
                                placeholder="Enter Your Email"
                                required
                            />
                        </div>

                        {/* Send OTP */}
                        <div className="mb-3">
                            <button
                                type="button"
                                className="btn btn-warning w-100"
                                onClick={sendOtp}
                                disabled={loading}

                            >
                                {loading ? "Sending OTP..." : "Send OTP"}
                            </button>
                        </div>

                        {/* OTP Input */}
                        {otpSent && (
                            <>
                                <div className="mb-3">
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="form-control"
                                        placeholder="Enter OTP"
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <button
                                        type="button"
                                        className="btn btn-success w-100"
                                        onClick={verifyOtp}
                                    >
                                        Verify OTP
                                    </button>
                                </div>
                            </>
                        )}

                        {otpVerified && (
                            <div className="alert alert-success">
                                ✓ Email Verified Successfully
                            </div>
                        )}

                        <div className="mb-3">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="form-control"
                                placeholder="Enter Your Password"
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <input
                                type="text"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="form-control"
                                placeholder="Enter Your Phone"
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <input
                                type="text"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="form-control"
                                placeholder="Enter Your Address"
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <input
                                type="text"
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                className="form-control"
                                placeholder="What is Your Favorite Sports?"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary w-100"
                            disabled={!otpVerified}
                        >
                            REGISTER
                        </button>
                    </form>
                </div>
            </div>
        </Layout>
    );
};

export default Register;