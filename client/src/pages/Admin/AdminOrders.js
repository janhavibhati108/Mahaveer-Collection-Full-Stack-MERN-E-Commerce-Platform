

import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminMenu from "../../components/Layout/AdminMenu";
import Layout from "../../components/Layout/Layout";
import { useAuth } from "../../context/auth";
import moment from "moment";
import { Select } from "antd";

const { Option } = Select;

const AdminOrders = () => {
    const [status] = useState([
        "Not Process",
        "Processing",
        "Shipped",
        "deliverd",
        "cancel",
    ]);

    const [orders, setOrders] = useState([]);
    const [auth] = useAuth();

    const getOrders = async () => {
        try {
            const { data } = await axios.get("/api/v1/auth/all-orders");
            setOrders(data);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        if (auth?.token) getOrders();
    }, [auth?.token]);

    const handleChange = async (orderId, value) => {
        try {
            await axios.put(`/api/v1/auth/order-status/${orderId}`, { status: value });
            getOrders();
        } catch (error) {
            console.log(error);
        }
    };

    // ✅ Sum quantity across all line items
    const totalItems = (products) =>
        products?.reduce((sum, p) => sum + (p.quantity || 1), 0) || 0;

    return (
        <Layout title="All Orders">
            <div className="row dashboard">
                <div className="col-md-3">
                    <AdminMenu />
                </div>

                <div className="col-md-9">
                    <h1 className="text-center mb-4">All Orders</h1>

                    {orders?.map((o, index) => (
                        <div key={o._id} className="border shadow mb-4">
                            <table className="table">
                                <thead>
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
                                        <td>{index + 1}</td>
                                        <td>
                                            <Select
                                                bordered={false}
                                                defaultValue={o?.status}
                                                onChange={(value) => handleChange(o._id, value)}
                                            >
                                                {/* ✅ status values match your orderModel enum exactly */}
                                                {status.map((s) => (
                                                    <Option key={s} value={s}>{s}</Option>
                                                ))}
                                            </Select>
                                        </td>
                                        <td>{o?.buyer?.name}</td>
                                        <td>{moment(o?.createdAt).fromNow()}</td>
                                        <td>{o?.payment?.success ? "Success" : "Failed"}</td>
                                        {/* ✅ total units, not line item count */}
                                        <td>{totalItems(o?.products)}</td>
                                    </tr>
                                </tbody>
                            </table>

                            <div className="p-3">
                                <p><strong>Address:</strong> {o?.buyer?.address}</p>
                                <p><strong>Email:</strong> {o?.buyer?.email}</p>
                                <p><strong>Phone:</strong> {o?.buyer?.phone}</p>
                            </div>

                            <div className="container">
                                {o?.products?.map((p, i) => (
                                    <div key={i} className="row mb-3 p-3 card flex-row">
                                        <div className="col-md-4 text-center">
                                            <img
                                                src={`/api/v1/product/product-photo/${p._id}`}
                                                alt={p?.name}
                                                style={{ width: "150px", height: "150px", objectFit: "contain" }}
                                            />
                                        </div>
                                        <div className="col-md-8">
                                            <h5>{p?.name}</h5>
                                            <p><strong>Price:</strong> ₹{p?.price}</p>
                                            {/* ✅ quantity now shown correctly */}
                                            <p><strong>Quantity:</strong> {p?.quantity || 1}</p>
                                            <p>
                                                <strong>Size:</strong>{" "}
                                                {p?.size ? (
                                                    <span style={{ color: "#16a34a", fontWeight: 600 }}>
                                                        {p.size}
                                                    </span>
                                                ) : (
                                                    <span style={{ color: "#999" }}>Not Selected</span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Layout>
    );
};

export default AdminOrders;