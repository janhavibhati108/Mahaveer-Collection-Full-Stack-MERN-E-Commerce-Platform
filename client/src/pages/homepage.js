import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Checkbox, Radio } from "antd";
import { Prices } from "../components/Prices";
import { useCart } from "../context/cart";
import axios from "axios";
import toast from "react-hot-toast";
import Layout from "./../components/Layout/Layout";
import { AiOutlineReload } from "react-icons/ai";
import "../styles/Homepage.css";

const HomePage = () => {
    const navigate = useNavigate();
    const [cart, setCart] = useCart();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [checked, setChecked] = useState([]);
    const [radio, setRadio] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);

    // Per-product state: { [productId]: { qty: 1, stock: null, stockLoading: true } }
    const [productState, setProductState] = useState({});

    // ── helpers to update per-product state ──────────────────────────────────
    const setQty = (pid, qty) =>
        setProductState((prev) => ({
            ...prev,
            [pid]: { ...prev[pid], qty },
        }));

    const setStock = (pid, stock, stockLoading = false) =>
        setProductState((prev) => ({
            ...prev,
            [pid]: { ...prev[pid], stock, stockLoading },
        }));

    const getState = (pid) =>
        productState[pid] || { qty: 1, stock: null, stockLoading: true };

    // ── Fetch real-time stock for a list of products ──────────────────────────
    const fetchStocks = async (prods) => {
        // Mark all as loading
        setProductState((prev) => {
            const next = { ...prev };
            prods.forEach((p) => {
                next[p._id] = { qty: prev[p._id]?.qty || 1, stock: null, stockLoading: true };
            });
            return next;
        });

        // Fetch in parallel
        await Promise.all(
            prods.map(async (p) => {
                try {
                    const { data } = await axios.get(`/api/v1/product/stock/${p._id}`);
                    setStock(p._id, data.availableStock ?? 0);
                } catch {
                    setStock(p._id, p.quantity ?? 0); // fallback to DB quantity
                }
            })
        );
    };

    // ── Data fetching ─────────────────────────────────────────────────────────
    const getAllCategory = async () => {
        try {
            const { data } = await axios.get("/api/v1/category/get-category");
            if (data?.success) setCategories(data?.category);
        } catch (error) { console.log(error); }
    };

    const getAllProducts = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`/api/v1/product/product-list/${page}`);
            setLoading(false);
            setProducts(data.products);
            fetchStocks(data.products);
        } catch (error) {
            setLoading(false);
            console.log(error);
        }
    };

    const getTotal = async () => {
        try {
            const { data } = await axios.get("/api/v1/product/product-count");
            setTotal(data?.total);
        } catch (error) { console.log(error); }
    };

    const loadMore = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`/api/v1/product/product-list/${page}`);
            setLoading(false);
            const newProducts = [...products, ...data?.products];
            setProducts(newProducts);
            fetchStocks(data?.products); // only fetch stock for new ones
        } catch (error) {
            console.log(error);
            setLoading(false);
        }
    };

    const filterProduct = async () => {
        try {
            const { data } = await axios.post("/api/v1/product/product-filters", { checked, radio });
            setProducts(data?.products);
            fetchStocks(data?.products);
        } catch (error) { console.log(error); }
    };

    useEffect(() => { getAllCategory(); getTotal(); }, []);
    useEffect(() => { if (page === 1) return; loadMore(); }, [page]);
    useEffect(() => { if (!checked.length || !radio.length) getAllProducts(); }, [checked.length, radio.length]);
    useEffect(() => { if (checked.length || radio.length) filterProduct(); }, [checked, radio]);

    const handleFilter = (value, id) => {
        let all = [...checked];
        if (value) all.push(id);
        else all = all.filter((c) => c !== id);
        setChecked(all);
    };

    // ── Add to cart with stock check ──────────────────────────────────────────
    const handleAddToCart = async (p) => {
        const alreadyInCart = cart.filter((i) => i._id === p._id).length;

        // Re-fetch stock right before adding
        try {
            const { data } = await axios.get(`/api/v1/product/stock/${p._id}`);
            const freshStock = data.availableStock ?? 0;
            setStock(p._id, freshStock);

            const { qty } = getState(p._id);
            const maxCanAdd = Math.max(0, freshStock - alreadyInCart);

            if (freshStock <= 0 || maxCanAdd <= 0) {
                toast.error("Sorry, this item is out of stock!");
                return;
            }
            if (qty > maxCanAdd) {
                toast.error(`Only ${maxCanAdd} available. Adjusting quantity.`);
                setQty(p._id, maxCanAdd);
                return;
            }

            const itemsToAdd = Array(qty).fill(p);
            setCart([...cart, ...itemsToAdd]);
            toast.success(`${qty} item${qty > 1 ? "s" : ""} added to cart!`);
        } catch {
            toast.error("Could not verify stock. Please try again.");
        }
    };

    // ── Stock display helper ───────────────────────────────────────────────────
    const stockBadge = (pid) => {
        const { stock, stockLoading } = getState(pid);
        if (stockLoading || stock === null)
            return <span style={{ fontSize: 11, color: "#888" }}>Checking stock…</span>;
        if (stock === 0)
            return <span style={{ fontSize: 11, color: "#dc2626", fontWeight: 600 }}>❌ Out of Stock</span>;
        if (stock <= 5)
            return <span style={{ fontSize: 11, color: "#d97706", fontWeight: 600 }}>⚠️ Only {stock} left!</span>;
        return <span style={{ fontSize: 11, color: "#16a34a", fontWeight: 600 }}>✅ In Stock ({stock})</span>;
    };

    return (
        <Layout title={"All Products - Best offers"}>
            <img src="/images/FinalBanner.png" className="banner-img" alt="bannerimage" width={"100%"} />

            <div className="container-fluid row mt-3 home-page">
                {/* ── Filters ── */}
                <div className="col-md-3 filters">
                    <h4 className="text-center">Filter By Category</h4>
                    <div className="d-flex flex-column">
                        {categories?.map((c) => (
                            <Checkbox key={c._id} onChange={(e) => handleFilter(e.target.checked, c._id)}>
                                {c.name}
                            </Checkbox>
                        ))}
                    </div>
                    <h4 className="text-center mt-4">Filter By Price</h4>
                    <div className="d-flex flex-column">
                        <Radio.Group onChange={(e) => setRadio(e.target.value)}>
                            {Prices?.map((p) => (
                                <div key={p._id}><Radio value={p.array}>{p.name}</Radio></div>
                            ))}
                        </Radio.Group>
                    </div>
                    <div className="d-flex flex-column">
                        <button className="btn btn-danger" onClick={() => window.location.reload()}>
                            RESET FILTERS
                        </button>
                    </div>
                </div>

                {/* ── Products ── */}
                <div className="col-md-9">
                    <h1 className="text-center">All Products</h1>
                    <div className="d-flex flex-wrap">
                        {products?.map((p) => {
                            const { qty, stock, stockLoading } = getState(p._id);
                            const alreadyInCart = cart.filter((i) => i._id === p._id).length;
                            const maxCanAdd = Math.max(0, (stock ?? 0) - alreadyInCart);
                            const outOfStock = !stockLoading && stock !== null && stock === 0;
                            const maxReached = !stockLoading && stock !== null && maxCanAdd === 0 && stock > 0;

                            return (
                                <div className="card m-2" key={p._id}>
                                    <img
                                        src={`/api/v1/product/product-photo/${p._id}`}
                                        className="card-img-top"
                                        alt={p.name}
                                    />
                                    <div className="card-body">
                                        <div className="card-name-price">
                                            <h5 className="card-title">{p.name}</h5>
                                            <h5 className="card-title card-price">
                                                {p.price.toLocaleString("en-US", {
                                                    style: "currency",
                                                    currency: "INR",
                                                })}
                                            </h5>
                                        </div>
                                        <p className="card-text">{p.description.substring(0, 60)}...</p>

                                        {/* Stock badge */}
                                        <div style={{ marginBottom: 8 }}>
                                            {stockBadge(p._id)}
                                            {alreadyInCart > 0 && (
                                                <span style={{ fontSize: 11, color: "#7c3aed", marginLeft: 8 }}>
                                                    ({alreadyInCart} in cart)
                                                </span>
                                            )}
                                        </div>

                                        {/* Quantity selector */}
                                        {!outOfStock && !maxReached && (
                                            <div style={{
                                                display: "flex", alignItems: "center",
                                                gap: 6, marginBottom: 10
                                            }}>
                                                <button
                                                    onClick={() => setQty(p._id, Math.max(1, qty - 1))}
                                                    disabled={qty <= 1}
                                                    style={{
                                                        width: 30, height: 30, border: "1.5px solid #dee2e6",
                                                        borderRadius: 6, background: qty <= 1 ? "#f8f9fa" : "#fff",
                                                        fontWeight: 700, fontSize: 16, cursor: qty <= 1 ? "not-allowed" : "pointer",
                                                        color: qty <= 1 ? "#aaa" : "#333",
                                                    }}
                                                >−</button>
                                                <span style={{
                                                    minWidth: 28, textAlign: "center", fontWeight: 700,
                                                    fontSize: 14, border: "1.5px solid #dee2e6",
                                                    borderRadius: 6, padding: "2px 6px"
                                                }}>
                                                    {qty}
                                                </span>
                                                <button
                                                    onClick={() => setQty(p._id, Math.min(maxCanAdd, qty + 1))}
                                                    disabled={qty >= maxCanAdd}
                                                    style={{
                                                        width: 30, height: 30, border: "1.5px solid #dee2e6",
                                                        borderRadius: 6, background: qty >= maxCanAdd ? "#f8f9fa" : "#fff",
                                                        fontWeight: 700, fontSize: 16, cursor: qty >= maxCanAdd ? "not-allowed" : "pointer",
                                                        color: qty >= maxCanAdd ? "#aaa" : "#333",
                                                    }}
                                                >+</button>
                                            </div>
                                        )}

                                        {/* Buttons */}
                                        <div className="card-name-price">
                                            <button
                                                className="btn btn-info ms-1"
                                                onClick={() => navigate(`/product/${p.slug}`)}
                                            >
                                                More Details
                                            </button>
                                            <button
                                                className="btn btn-dark ms-1"
                                                disabled={outOfStock || maxReached || stockLoading}
                                                onClick={() => handleAddToCart(p)}
                                                style={{ opacity: outOfStock || maxReached ? 0.5 : 1 }}
                                            >
                                                {outOfStock
                                                    ? "Out of Stock"
                                                    : maxReached
                                                        ? "Max in Cart"
                                                        : "ADD TO CART"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="m-2 p-3">
                        {products && products.length < total && (
                            <button
                                className="btn loadmore"
                                onClick={(e) => { e.preventDefault(); setPage(page + 1); }}
                            >
                                {loading ? "Loading ..." : <> Loadmore <AiOutlineReload /></>}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default HomePage;