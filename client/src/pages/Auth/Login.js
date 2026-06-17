import React, { useState } from "react";
import Layout from "./../../components/Layout/Layout";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import "../../styles/AuthStyles.css";
import { useAuth } from "../../context/auth";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [showOtp, setShowOtp] = useState(false);

    const [auth, setAuth] = useAuth();

    const navigate = useNavigate();
    const location = useLocation();

    // STEP 1 - Verify email/password and send OTP
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const { data } = await axios.post(
                "http://localhost:8080/api/v1/auth/login-step1",
                {
                    email,
                    password,
                }
            );

            if (data.success) {
                toast.success("OTP Sent To Your Email");
                setShowOtp(true);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error("Invalid Email or Password");
        }
    };

    // STEP 2 - Verify OTP and Login
    const verifyOtp = async () => {
        try {
            const { data } = await axios.post(
                "http://localhost:8080/api/v1/auth/login-verify",
                {
                    email,
                    otp,
                }
            );

            if (data.success) {
                toast.success("Login Successful");

                setAuth({
                    ...auth,
                    user: data.user,
                    token: data.token,
                });

                localStorage.setItem(
                    "auth",
                    JSON.stringify({
                        user: data.user,
                        token: data.token,
                    })
                );

                navigate(location.state || "/");
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error("Invalid OTP");
        }
    };

    return (
        <Layout title="Login">
            <div
                style={{
                    // minHeight: "100vh",
                    /*paddingTop: "190px",*/
                    backgroundImage:
                        'linear-gradient(rgba(255, 255, 255, 0.26), rgba(255, 240, 245, 0.3)), url("/images/BackDrop.png")',
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundAttachment: "fixed",
                    padding: "50px 20px",
                }}
            >
                <div className="form-container" style={{ minHeight: "90vh" }}>
                    <form onSubmit={handleSubmit}>
                        <h4 className="title">Login</h4>

                        {/* Email */}
                        <div className="mb-3">
                            <input
                                type="email"
                                autoFocus
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="form-control"
                                placeholder="Enter Your Email"
                                required
                            />
                        </div>

                        {/* Password */}
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

                        {/* Forgot Password */}
                        <div className="mb-3">
                            <button
                                type="button"
                                className="btn forgot-btn"
                                onClick={() => navigate("/forgot-password")}
                            >
                                Forgot Password
                            </button>
                        </div>

                        {/* Send OTP Button */}
                        {!showOtp && (
                            <button type="submit" className="btn btn-primary">
                                SEND OTP
                            </button>
                        )}

                        {/* OTP Section */}
                        {showOtp && (
                            <>
                                <div className="mb-3 mt-3">
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="form-control"
                                        placeholder="Enter OTP"
                                        required
                                    />
                                </div>

                                <button
                                    type="button"
                                    className="btn btn-success"
                                    onClick={verifyOtp}
                                >
                                    VERIFY OTP & LOGIN
                                </button>
                            </>
                        )}
                    </form>
                </div>
            </div>
        </Layout>
    );
};

export default Login;