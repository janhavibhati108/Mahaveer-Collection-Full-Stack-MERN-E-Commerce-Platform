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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post("/api/v1/auth/login-step1", { email, password });
            if (data.success) { toast.success("OTP Sent To Your Email"); setShowOtp(true); }
            else toast.error(data.message);
        } catch (error) {
            console.log(error);
            toast.error("Invalid Email or Password");
        }
    };

    const verifyOtp = async () => {
        try {
            const { data } = await axios.post("/api/v1/auth/login-verify", { email, otp });
            if (data.success) {
                toast.success("Login Successful");
                setAuth({ ...auth, user: data.user, token: data.token });
                localStorage.setItem("auth", JSON.stringify({ user: data.user, token: data.token }));
                navigate(location.state || "/");
            } else toast.error(data.message);
        } catch (error) {
            console.log(error);
            toast.error("Invalid OTP");
        }
    };

    return (
        <Layout title="Login">
            <div
                style={{
                    padding: "100px 16px 50px 16px",
                    backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.26), rgba(255, 240, 245, 0.3)), url("/images/BackDrop.png")',
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundAttachment: "fixed",
                    minHeight: "100vh",
                }}
            >
                <div className="form-container">
                    <form onSubmit={handleSubmit}>
                        <h4 className="title">Login</h4>

                        <div className="mb-3">
                            <input type="email" autoFocus value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="form-control" placeholder="Enter Your Email" required />
                        </div>

                        <div className="mb-3">
                            <input type="password" value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="form-control" placeholder="Enter Your Password" required />
                        </div>

                        <div className="mb-3">
                            <button type="button" className="btn forgot-btn w-100"
                                onClick={() => navigate("/forgot-password")}>
                                Forgot Password
                            </button>
                        </div>

                        {!showOtp && (
                            <button type="submit" className="btn btn-primary w-100">
                                SEND OTP
                            </button>
                        )}

                        {showOtp && (
                            <>
                                <div className="mb-3 mt-3">
                                    <input type="text" value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="form-control" placeholder="Enter OTP" required />
                                </div>
                                <button type="button" className="btn btn-success w-100" onClick={verifyOtp}>
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