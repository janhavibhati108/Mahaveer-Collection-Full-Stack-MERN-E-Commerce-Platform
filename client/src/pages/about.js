import React from "react";
import Layout from "./../components/Layout/Layout";

const About = () => {
    return (
        <Layout title="About Us - Mahaveer Collection">

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
                    paddingRight: "20px",
                    paddingBottom: "50px"
                }}
            >
                <div
                    className="container"
                    style={{
                        maxWidth: "900px",
                        background: "rgba(255, 255, 255, 0.84)",
                        borderRadius: "25px",
                        padding: "40px",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                    }}
                >
                    <h1
                        className="text-center mb-4"
                        style={{
                            fontWeight: "800",
                            color: "#0425cd",
                            fontSize: "3rem",
                        }}
                    >
                        ✨ About Mahaveer Collection ✨
                    </h1>


                    <p
                        className="text-center mb-4"
                        style={{
                            fontSize: "1.2rem",
                            color: "#666",
                            fontStyle: "italic",
                            fontWeight: "500",
                        }}
                    >
                        Where Fashion Meets Confidence 💖
                    </p>
                    <div
                        style={{
                            fontWeight: "700",
                            color: "#210ce0",
                            fontSize: "1.15rem"
                        }}>

                        <p>
                            Every outfit tells a story, and at
                            Mahaveer Collection, we believe that
                            story should be uniquely yours.
                        </p>
                    </div>
                    <div
                        style={{
                            color: "#0b0000",
                            fontSize: "1.2rem",
                            lineHeight: "2",
                            fontWeight: "500",
                            //textShadow: "1px 1px 6px rgba(0,0,0,0.6)",
                        }}
                    >

                        <p>
                            Born from a passion for fashion and a commitment to
                            quality, Mahaveer Collection is more than just a clothing
                            store—it is a celebration of style, confidence, and
                            individuality. From timeless classics to modern trends,
                            we carefully curate collections that help our customers
                            express themselves effortlessly.
                        </p>

                        <p>
                            Fashion is not merely about what we wear; it is about
                            how we feel. A perfectly chosen outfit can inspire
                            confidence, create memories, and turn ordinary moments
                            into extraordinary ones.
                        </p>

                        <p>
                            Like threads woven together to create a beautiful fabric,
                            our journey is woven with the trust of our customers.
                            Every purchase, every review, and every returning visitor
                            motivates us to continue delivering the finest shopping
                            experience possible.
                        </p>

                        <p>
                            At Mahaveer Collection, we don't just sell fashion—we
                            help create moments, celebrate individuality, and inspire
                            confidence.
                        </p>
                    </div>

                    <div
                        style={{
                            background: "#d8f6fcc3",
                            borderRadius: "15px",
                            padding: "20px",
                            marginTop: "30px",
                            textAlign: "center",
                            border: "2px dashed #446fef",
                        }}
                    >
                        <h4 style={{ color: "#060aed" }}>
                            🌸 Our Promise 🌸
                        </h4>

                        <p className="mb-2">
                            ✨ Dress with confidence.
                        </p>

                        <p className="mb-2">
                            ✨ Shine with elegance.
                        </p>

                        <p className="mb-0">
                            ✨ Express yourself with Mahaveer Collection.
                        </p>
                    </div>

                    <div
                        className="text-center mt-5"
                        style={{
                            fontSize: "1.2rem",
                            color: "#210ce0",
                            fontStyle: "italic",
                            fontWeight: "500",
                        }}
                    >
                        “Fashion fades, but confidence never goes out of style.”
                    </div>

                    <div
                        className="text-center mt-4"
                        style={{
                            fontSize: "1.1rem",
                            fontWeight: "500",
                        }}
                    >
                        💖 Thank you for being a part of our story.
                        <br />
                        We look forward to being a part of yours. 💖
                    </div>
                </div>
            </div>

        </Layout >
    );
};

export default About;