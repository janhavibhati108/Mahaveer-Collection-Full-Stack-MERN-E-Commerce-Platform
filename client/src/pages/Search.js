import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "./../components/Layout/Layout";
import { useSearch } from "../context/search";
import { useCart } from "../context/cart";
import axios from "axios";
import toast from "react-hot-toast";

const Search = () => {
  const [values] = useSearch();
  const [cart, setCart] = useCart();
  const navigate = useNavigate();

  // Per-product state: { [productId]: { qty, stock, stockLoading } }
  const [productState, setProductState] = useState({});

  // ── helpers ──────────────────────────────────────────────────────────────
  const setQty = (pid, qty) =>
    setProductState((prev) => ({ ...prev, [pid]: { ...prev[pid], qty } }));

  const setStock = (pid, stock, stockLoading = false) =>
    setProductState((prev) => ({ ...prev, [pid]: { ...prev[pid], stock, stockLoading } }));

  const getState = (pid) =>
    productState[pid] || { qty: 1, stock: null, stockLoading: true };

  // ── Fetch stock for all results ───────────────────────────────────────────
  const fetchStocks = async (products) => {
    setProductState((prev) => {
      const next = { ...prev };
      products.forEach((p) => {
        next[p._id] = { qty: prev[p._id]?.qty || 1, stock: null, stockLoading: true };
      });
      return next;
    });

    await Promise.all(
      products.map(async (p) => {
        try {
          const { data } = await axios.get(`/api/v1/product/stock/${p._id}`);
          setStock(p._id, data.availableStock ?? 0);
        } catch {
          setStock(p._id, p.quantity ?? 0);
        }
      })
    );
  };

  // Fetch stock whenever search results change
  useEffect(() => {
    if (values?.results?.length > 0) fetchStocks(values.results);
  }, [values?.results]);

  // ── Add to cart with real-time stock check ────────────────────────────────
  const handleAddToCart = async (p) => {
    const alreadyInCart = cart.filter((i) => i._id === p._id).length;
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

  // ── Stock badge ───────────────────────────────────────────────────────────
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
    <Layout title={"Search Results"}>
      <div
        className="container"
        style={{
          paddingTop: "120px",
          minHeight: "100vh",
        }}
      >
        <div className="text-center">
          <h1>Search Results</h1>
          <h6>
            {values?.results?.length < 1
              ? "No Products Found"
              : `Found ${values?.results?.length} product${values?.results?.length > 1 ? "s" : ""}`}
          </h6>

          <div className="d-flex flex-wrap mt-4 justify-content-center">
            {values?.results?.map((p) => {
              const { qty, stock, stockLoading } = getState(p._id);
              const alreadyInCart = cart.filter((i) => i._id === p._id).length;
              const maxCanAdd = Math.max(0, (stock ?? 0) - alreadyInCart);
              const outOfStock = !stockLoading && stock !== null && stock === 0;
              const maxReached = !stockLoading && stock !== null && maxCanAdd === 0 && stock > 0;

              return (
                <div className="card m-2" style={{ width: "18rem" }} key={p._id}>
                  <img
                    src={`/api/v1/product/product-photo/${p._id}`}
                    className="card-img-top"
                    alt={p.name}
                  />
                  <div className="card-body">
                    <h5 className="card-title">{p.name}</h5>
                    <p className="card-text">{p.description.substring(0, 30)}...</p>
                    <p className="card-text">
                      {p.price.toLocaleString("en-US", {
                        style: "currency",
                        currency: "INR",
                      })}
                    </p>

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
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                        <button
                          onClick={() => setQty(p._id, Math.max(1, qty - 1))}
                          disabled={qty <= 1}
                          style={{
                            width: 30, height: 30, border: "1.5px solid #dee2e6",
                            borderRadius: 6, background: qty <= 1 ? "#f8f9fa" : "#fff",
                            fontWeight: 700, fontSize: 16,
                            cursor: qty <= 1 ? "not-allowed" : "pointer",
                            color: qty <= 1 ? "#aaa" : "#333",
                          }}
                        >−</button>
                        <span style={{
                          minWidth: 28, textAlign: "center", fontWeight: 700,
                          fontSize: 14, border: "1.5px solid #dee2e6",
                          borderRadius: 6, padding: "2px 6px",
                        }}>
                          {qty}
                        </span>
                        <button
                          onClick={() => setQty(p._id, Math.min(maxCanAdd, qty + 1))}
                          disabled={qty >= maxCanAdd}
                          style={{
                            width: 30, height: 30, border: "1.5px solid #dee2e6",
                            borderRadius: 6, background: qty >= maxCanAdd ? "#f8f9fa" : "#fff",
                            fontWeight: 700, fontSize: 16,
                            cursor: qty >= maxCanAdd ? "not-allowed" : "pointer",
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
        </div>
      </div>
    </Layout>
  );
};

export default Search;