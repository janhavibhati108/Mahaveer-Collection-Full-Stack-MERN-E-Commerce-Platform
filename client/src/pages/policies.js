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
                    padding: "100px 16px 50px 16px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "flex-start",
                }}
            >
                <div
                    style={{
                        maxWidth: "850px",
                        width: "100%",
                        background: "rgba(255, 255, 255, 0.76)",
                        padding: "24px",
                        borderRadius: "12px",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                        backdropFilter: "blur(5px)",
                    }}
                >
                    <h1
                        style={{
                            textAlign: "center",
                            marginBottom: "20px",
                            fontSize: "clamp(22px, 5vw, 32px)",
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

                    {[
                        { title: "1. Information We Collect", text: "We collect name, phone number, email, and address when you place an order." },
                        { title: "2. How We Use Your Information", text: "We use your data only for order processing, delivery, and customer support." },
                        { title: "3. Data Protection", text: "Your personal information is kept secure and never sold or shared." },
                        { title: "4. Payment Security", text: "All payments are processed through secure gateways. We do not store card details." },
                        { title: "5. Cookies", text: "Cookies are used to improve user experience and website performance." },
                        { title: "6. Policy Updates", text: "We may update this policy anytime. Changes will be posted here." },
                    ].map((item) => (
                        <div key={item.title}>
                            <h3 style={{ marginTop: "20px", color: "#333", fontSize: "clamp(16px, 3vw, 22px)" }}>
                                {item.title}
                            </h3>
                            <p style={{ color: "#555", fontWeight: "500" }}>{item.text}</p>
                        </div>
                    ))}

                    <h3 style={{ marginTop: "20px", color: "#333", fontSize: "clamp(16px, 3vw, 22px)" }}>
                        7. Contact Us
                    </h3>
                    <p style={{ color: "#555", fontWeight: "500", wordBreak: "break-all" }}>
                        Email: <b>support@mahaveercollection.com</b>
                    </p>
                </div>
            </div>
        </Layout>
    );
};

export default Policy;