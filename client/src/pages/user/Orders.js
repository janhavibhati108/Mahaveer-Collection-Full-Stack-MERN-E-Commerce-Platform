import React, { useState, useEffect } from "react";
import UserMenu from "../../components/Layout/UserMenu";
import Layout from "./../../components/Layout/Layout";
import axios from "axios";
import { useAuth } from "../../context/auth";
import moment from "moment";

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [auth] = useAuth();

    const getOrders = async () => {
        try {
            const { data } = await axios.get("/api/v1/auth/orders");
            setOrders(data);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        if (auth?.token) getOrders();
    }, [auth?.token]);

    const totalItems = (products) =>
        products?.reduce((sum, p) => sum + (p.quantity || 1), 0) || 0;

    return (
        <Layout title={"Your Orders"}>
            <div className="container-fluid p-3 dashboard" style={{ marginTop: "70px" }}>
                <div className="row g-3">
                    {/* Sidebar */}
                    <div className="col-12 col-md-3">
                        <UserMenu />
                    </div>

                    {/* Orders Section */}
                    <div className="col-12 col-md-9">
                        <h1 className="text-center mb-3" style={{ fontSize: "clamp(20px, 4vw, 32px)" }}>
                            All Orders
                        </h1>

                        {orders?.length === 0 && (
                            <p className="text-center text-muted">No orders yet.</p>
                        )}

                        {orders?.map((o, i) => (
                            <div className="border shadow mb-4 rounded" key={o._id || i}>

                                {/* ✅ Scrollable table on mobile */}
                                <div style={{ overflowX: "auto" }}>
                                    <table className="table mb-0" style={{ minWidth: "500px" }}>
                                        <thead className="table-light">
                                            <tr>
                                                <th>#</th>
                                                <th>Status</th>
                                                <th>Buyer</th>
                                                <th>Date</th>
                                                <th>Payment</th>
                                                <th>Items</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>{i + 1}</td>
                                                <td>
                                                    <span style={{
                                                        background: "#f3f0ff",
                                                        color: "#7c3aed",
                                                        padding: "2px 10px",
                                                        borderRadius: "20px",
                                                        fontSize: "13px",
                                                        fontWeight: 600,
                                                    }}>
                                                        {o?.status}
                                                    </span>
                                                </td>
                                                <td>{o?.buyer?.name}</td>
                                                <td style={{ whiteSpace: "nowrap" }}>
                                                    {moment(o?.createdAt).fromNow()}
                                                </td>
                                                <td>
                                                    <span style={{
                                                        color: o?.payment?.success ? "#16a34a" : "#dc2626",
                                                        fontWeight: 600,
                                                        fontSize: "13px",
                                                    }}>
                                                        {o?.payment?.success ? "✅ Success" : "❌ Failed"}
                                                    </span>
                                                </td>
                                                <td>{totalItems(o?.products)}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* Products List */}
                                <div className="p-2">
                                    {o?.products?.map((p, idx) => (
                                        <div
                                            className="card mb-2 p-2"
                                            key={p._id + idx}
                                            style={{ border: "1px solid #f0f0f0" }}
                                        >
                                            <div className="d-flex gap-3 align-items-center flex-wrap">
                                                {/* Product Image */}
                                                <img
                                                    src={`/api/v1/product/product-photo/${p._id}`}
                                                    alt={p.name}
                                                    style={{
                                                        width: "80px",
                                                        height: "80px",
                                                        objectFit: "cover",
                                                        borderRadius: "10px",
                                                        flexShrink: 0,
                                                    }}
                                                />

                                                {/* Product Details */}
                                                <div style={{ flex: 1, minWidth: "150px" }}>
                                                    <p className="mb-1" style={{ fontWeight: 600, fontSize: "14px" }}>
                                                        {p.name}
                                                    </p>
                                                    <p className="mb-1" style={{ fontSize: "13px", color: "#555" }}>
                                                        <b>Price:</b> ₹{p.price}
                                                    </p>
                                                    <p className="mb-1" style={{ fontSize: "13px", color: "#555" }}>
                                                        <b>Qty:</b> {p.quantity || 1}
                                                    </p>
                                                    <p className="mb-0" style={{ fontSize: "13px" }}>
                                                        <b>Size:</b>{" "}
                                                        {p.size ? (
                                                            <span style={{ color: "#16a34a", fontWeight: 600 }}>
                                                                {p.size}
                                                            </span>
                                                        ) : (
                                                            <span style={{ color: "#999" }}>N/A</span>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Orders;