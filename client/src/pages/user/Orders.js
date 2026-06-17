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

    // ✅ Sum quantity across all line items (grouped products)
    const totalItems = (products) =>
        products?.reduce((sum, p) => sum + (p.quantity || 1), 0) || 0;

    return (
        <Layout title={"Your Orders"}>
            <div className="container-flui p-3 m-3 dashboard">
                <div className="row">
                    {/* Sidebar */}
                    <div className="col-md-3">
                        <UserMenu />
                    </div>

                    {/* Orders Section */}
                    <div className="col-md-9">
                        <h1 className="text-center">All Orders</h1>

                        {orders?.map((o, i) => (
                            <div className="border shadow mb-4 p-2" key={o._id || i}>
                                {/* Order Summary Table */}
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
                                            <td>{i + 1}</td>
                                            <td>{o?.status}</td>
                                            <td>{o?.buyer?.name}</td>
                                            <td>{moment(o?.createdAt).fromNow()}</td>
                                            <td>{o?.payment?.success ? "Success" : "Failed"}</td>
                                            {/* ✅ shows total units e.g. 3, not number of line items */}
                                            <td>{totalItems(o?.products)}</td>
                                        </tr>
                                    </tbody>
                                </table>

                                {/* Products List */}
                                <div className="container">
                                    {o?.products?.map((p, idx) => (
                                        <div
                                            className="row mb-2 p-3 card flex-row"
                                            key={p._id + idx}
                                        >
                                            {/* Product Image */}
                                            <div className="col-md-4">
                                                <img
                                                    src={`/api/v1/product/product-photo/${p._id}`}
                                                    alt={p.name}
                                                    className="order-product-img"
                                                />
                                            </div>

                                            {/* Product Details */}
                                            <div className="col-md-8">
                                                <p><b>Name:</b> {p.name}</p>
                                                <p><b>Price:</b> ₹{p.price}</p>
                                                {/* ✅ show quantity per line item */}
                                                <p><b>Quantity:</b> {p.quantity || 1}</p>
                                                <p>
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