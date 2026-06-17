import React from "react";
import Layout from "../../components/Layout/Layout";
import UserMenu from "../../components/Layout/UserMenu";
import { useAuth } from "../../context/auth";

const Dashboard = () => {
    const [auth] = useAuth();
    return (
        <Layout title={"Dashboard - Ecommerce App"}>
            <div className="container-fluid p-3 dashboard" style={{ marginTop: "70px" }}>
                <div className="row g-3">
                    {/* Sidebar */}
                    <div className="col-12 col-md-3">
                        <UserMenu />
                    </div>

                    {/* User Info Card */}
                    <div className="col-12 col-md-9">
                        <div
                            className="p-4"
                            style={{
                                background: "#fff",
                                borderRadius: "16px",
                                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                            }}
                        >
                            <h4
                                className="mb-4"
                                style={{ fontWeight: "bold", fontFamily: "Playfair Display, serif" }}
                            >
                                My Account
                            </h4>

                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                <div style={infoRow}>
                                    <span style={infoLabel}>👤 Name</span>
                                    <span style={infoValue}>{auth?.user?.name}</span>
                                </div>
                                <div style={infoRow}>
                                    <span style={infoLabel}>📧 Email</span>
                                    <span style={{ ...infoValue, wordBreak: "break-all" }}>{auth?.user?.email}</span>
                                </div>
                                <div style={infoRow}>
                                    <span style={infoLabel}>📍 Address</span>
                                    <span style={infoValue}>{auth?.user?.address}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

const infoRow = {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    padding: "12px 0",
    borderBottom: "1px solid #f0f0f0",
    alignItems: "flex-start",
};

const infoLabel = {
    fontWeight: "700",
    color: "#555",
    minWidth: "100px",
    fontSize: "14px",
};

const infoValue = {
    color: "#222",
    fontSize: "15px",
    flex: 1,
};

export default Dashboard;