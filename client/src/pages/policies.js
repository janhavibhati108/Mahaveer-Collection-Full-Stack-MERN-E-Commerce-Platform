import React from "react";
import Layout from "./../components/Layout/Layout";

const Policy = () => {
    return (
        <Layout title="Privacy Policy">
            <div
                style={{
                    minHeight: "100vh",
                    backgroundImage:
                        'linear-gradient(rgba(255,255,255,0.26), rgba(255,240,245,0.3)), url("/images/BackDrop.png")',
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundAttachment: "fixed",
                    padding: "120px 20px 50px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                {/* White Card */}
                <div
                    style={{
                        maxWidth: "850px",
                        width: "100%",
                        background: "rgba(255, 255, 255, 0.76)",
                        padding: "30px",
                        borderRadius: "12px",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                        backdropFilter: "blur(5px)",
                    }}
                >
                    <h1
                        style={{
                            textAlign: "center",
                            marginBottom: "20px",
                            fontSize: "32px",
                            fontWeight: "700",
                            color: "#222",
                        }}
                    >
                        Privacy Policy
                    </h1>

                    <p style={{ color: "#555", lineHeight: "1.6" }}>
                        At <b>Mahaveer Collection</b>, we value your trust and are committed
                        to protecting your personal information.
                    </p>

                    <h3 style={{ marginTop: "20px", color: "#333" }}>
                        1. Information We Collect
                    </h3>
                    <p style={{ color: "#555", fontWeight: "500", }}>
                        We collect name, phone number, email, and address when you place an
                        order.
                    </p>

                    <h3 style={{ marginTop: "20px", color: "#333" }}>
                        2. How We Use Your Information
                    </h3>
                    <p style={{ color: "#555", fontWeight: "500", }}>
                        We use your data only for order processing, delivery, and customer
                        support.
                    </p>

                    <h3 style={{ marginTop: "20px", color: "#333" }}>
                        3. Data Protection
                    </h3>
                    <p style={{ color: "#555", fontWeight: "500", }}>
                        Your personal information is kept secure and never sold or shared.
                    </p>

                    <h3 style={{ marginTop: "20px", color: "#333" }}>
                        4. Payment Security
                    </h3>
                    <p style={{ color: "#555", fontWeight: "500", }}>
                        All payments are processed through secure gateways. We do not store
                        card details.
                    </p>

                    <h3 style={{ marginTop: "20px", color: "#333" }}>5. Cookies</h3>
                    <p style={{ color: "#555", fontWeight: "500", }}>
                        Cookies are used to improve user experience and website performance.
                    </p>

                    <h3 style={{ marginTop: "20px", color: "#333" }}>
                        6. Policy Updates
                    </h3>
                    <p style={{ color: "#555", fontWeight: "500", }}>
                        We may update this policy anytime. Changes will be posted here.
                    </p>

                    <h3 style={{ marginTop: "20px", color: "#333" }}>7. Contact Us</h3>
                    <p style={{ color: "#555", fontWeight: "500", }}>
                        Email: <b>support@mahaveercollection.com</b>
                    </p>
                </div>
            </div>
        </Layout>
    );
};

export default Policy;