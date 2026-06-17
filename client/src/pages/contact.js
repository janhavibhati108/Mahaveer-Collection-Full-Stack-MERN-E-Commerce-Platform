import React from "react";
import Layout from "./../components/Layout/Layout";
import { BiMailSend, BiPhoneCall, BiSupport } from "react-icons/bi";

const Contact = () => {
    return (
        <Layout title="Contact Us - Mahaveer Collection">
            <div
                style={{
                    minHeight: "100vh",
                    paddingTop: "150px",
                    backgroundImage:
                        'linear-gradient(rgba(255, 255, 255, 0.26), rgba(255, 240, 245, 0.3)), url("/images/BackDrop.png")',
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundAttachment: "fixed",
                    paddingLeft: "50px",
                    paddingRight: "50px",
                    paddingBottom: "50px",
                }}
            >
                <div
                    className="container"
                    style={{
                        minHeight: "80vh",
                        paddingTop: "40px",
                        paddingBottom: "40px",
                        maxWidth: "900px",
                        background: "rgba(255, 255, 255, 0.72)",
                        borderRadius: "25px",
                        padding: "40px",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.1)",

                    }}
                >
                    <div
                        style={{
                            maxWidth: "900px",
                            margin: "0 auto",
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
                            }}
                        >
                            📞 CONTACT US
                        </h1>

                        <p
                            style={{
                                fontSize: "18px",
                                lineHeight: "1.8",
                                textAlign: "left",
                                fontWeight: "500",
                            }}
                        >
                            We'd love to hear from you! Whether you have questions
                            about our products, need assistance with an order, or
                            simply want fashion advice, our team is always ready to help.
                        </p>

                        <p
                            style={{
                                fontSize: "18px",
                                lineHeight: "1.8",
                                textAlign: "left",
                                fontWeight: "500",
                            }}
                        >
                            Feel free to reach out to us anytime. We are committed
                            to providing excellent customer service and ensuring
                            your shopping experience with Mahaveer Collection is smooth
                            and enjoyable.
                        </p>

                        <hr />

                        <div
                            style={{
                                fontSize: "18px",
                                textAlign: "left",
                                lineHeight: "2.5",
                                fontWeight: "500",
                            }}
                        >
                            <p>
                                <BiMailSend size={25} />{" "}
                                <strong>Email:</strong> support@mahaveercollection.com
                            </p>

                            <p>
                                <BiPhoneCall size={25} />{" "}
                                <strong>Phone:</strong> +91 **********
                            </p>

                            <p>
                                <BiSupport size={25} />{" "}
                                <strong>Customer Support:</strong> **** **** ****
                                (Toll Free)
                            </p>
                        </div>

                        <div
                            className="mt-4"
                            style={{
                                textAlign: "left",
                                fontStyle: "italic",
                                color: "#666",
                                fontWeight: "500",
                            }}
                        >
                            ✨ We're here to help you dress with confidence and shop
                            with ease.
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Contact;