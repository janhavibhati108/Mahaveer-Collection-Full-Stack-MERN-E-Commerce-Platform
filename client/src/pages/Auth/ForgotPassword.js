import React, { useState } from "react";
import Layout from "./../../components/Layout/Layout";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "../../styles/AuthStyles.css";

const ForgotPasssword = () => {
    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [answer, setAnswer] = useState("");

    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);

    const navigate = useNavigate();

    // Send OTP
    const sendOtp = async () => {
        try {
            if (!email) {
                return toast.error("Please enter email first");
            }

            const { data } = await axios.post(
                "/api/v1/auth/send-otp",
                { email }
            );

            if (data.success) {
                setOtpSent(true);
                toast.success("OTP Sent Successfully");
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error("Failed To Send OTP");
        }
    };

    // Reset Password
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await axios.post(
                "/api/v1/auth/forgot-password-otp",
                {
                    email,
                    answer,
                    otp,
                    newPassword,
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
            toast.error("Invalid OTP or Details");
        }
    };

    return (
        <Layout title={"Forgot Password - Ecommerce APP"}>
            <div
                style={{
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
                        <h4 className="title">RESET PASSWORD</h4>

                        {/* Email */}
                        <div className="mb-3">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="form-control"
                                placeholder="Enter Your Email"
                                required
                            />
                        </div>

                        {/* Send OTP Button */}
                        <div className="mb-3">
                            <button
                                type="button"
                                className="btn btn-warning w-100"
                                onClick={sendOtp}
                            >
                                Send OTP
                            </button>
                        </div>

                        {/* OTP Field */}
                        {otpSent && (
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
                        )}

                        {/* Security Question */}
                        <div className="mb-3">
                            <input
                                type="text"
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                className="form-control"
                                placeholder="Enter Your Favorite Sport Name"
                                required
                            />
                        </div>

                        {/* New Password */}
                        <div className="mb-3">
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="form-control"
                                placeholder="Enter New Password"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary w-100"
                            disabled={!otpSent}
                        >
                            RESET PASSWORD
                        </button>
                    </form>
                </div>
            </div>
        </Layout>
    );
};

export default ForgotPasssword;