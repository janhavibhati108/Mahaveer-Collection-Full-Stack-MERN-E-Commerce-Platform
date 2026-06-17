import React from "react";
import Layout from "./../components/Layout/Layout";
import { BiMailSend, BiPhoneCall, BiSupport } from "react-icons/bi";

const Contact = () => {
    return (
        <Layout title="Contact Us - Mahaveer Collection">
            <div
                style={{
                    minHeight: "100vh",
                    paddingTop: "100px",
                    backgroundImage:
                        'linear-gradient(rgba(255, 255, 255, 0.26), rgba(255, 240, 245, 0.3)), url("/images/BackDrop.png")',
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundAttachment: "fixed",
                    padding: "100px 16px 50px 16px", // ✅ small padding on mobile
                }}
            >
                <div
                    className="container"
                    style={{
                        maxWidth: "900px",
                        background: "rgba(255, 255, 255, 0.92)",
                        borderRadius: "25px",
                        padding: "30px 24px",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                    }}
                >
                    <h1
                        className="text-center mb-4"
                        style={{
                            background: "#212529",
                            color: "white",
                            padding: "15px",
                            borderRadius: "10px",
                            fontWeight: "700",
                            fontSize: "clamp(20px, 4vw, 32px)", // ✅ shrinks on mobile
                        }}
                    >
                        📞 CONTACT US
                    </h1>

                    <p style={{ fontSize: "clamp(15px, 2vw, 18px)", lineHeight: "1.8", fontWeight: "500" }}>
                        We'd love to hear from you! Whether you have questions
                        about our products, need assistance with an order, or
                        simply want fashion advice, our team is always ready to help.
                    </p>

                    <p style={{ fontSize: "clamp(15px, 2vw, 18px)", lineHeight: "1.8", fontWeight: "500" }}>
                        Feel free to reach out to us anytime. We are committed
                        to providing excellent customer service and ensuring
                        your shopping experience with Mahaveer Collection is smooth
                        and enjoyable.
                    </p>

                    <hr />

                    <div style={{ fontSize: "clamp(14px, 2vw, 18px)", lineHeight: "2.5", fontWeight: "500" }}>
                        <p style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            flexWrap: "wrap",        // ✅ wraps on small screens
                            wordBreak: "break-all",  // ✅ breaks long email
                        }}>
                            <BiMailSend size={25} />
                            <strong>Email:</strong>
                            <span>support@mahaveercollection.com</span>
                        </p>

                        <p style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                            <BiPhoneCall size={25} />
                            <strong>Phone:</strong>
                            <span>+91 **********</span>
                        </p>

                        <p style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                            <BiSupport size={25} />
                            <strong>Customer Support:</strong>
                            <span>**** **** **** (Toll Free)</span>
                        </p>
                    </div>

                    <div
                        className="mt-4"
                        style={{
                            fontStyle: "italic",
                            color: "#666",
                            fontWeight: "500",
                            fontSize: "clamp(13px, 1.8vw, 16px)",
                        }}
                    >
                        ✨ We're here to help you dress with confidence and shop with ease.
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Contact;