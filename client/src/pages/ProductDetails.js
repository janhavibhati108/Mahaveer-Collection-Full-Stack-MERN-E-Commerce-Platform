

import React, { useState, useEffect } from "react";
import Layout from "./../components/Layout/Layout";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/cart";
import toast from "react-hot-toast";
import "../styles/ProductDetailsStyles.css";

const ProductDetails = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [cart, setCart] = useCart();

  const [product, setProduct] = useState({});
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [availableStock, setAvailableStock] = useState(null);
  const [stockLoading, setStockLoading] = useState(false);

  // ── SIZE STATE ─────────────────────────────────────────────────────────────
  const [size, setSize] = useState("");
  const [sizeError, setSizeError] = useState("");

  // Per-product state for similar products { [pid]: { qty, stock, stockLoading, size, sizeError } }
  const [relatedState, setRelatedState] = useState({});

  // ── Related product state helpers ─────────────────────────────────────────
  const setRelQty = (pid, qty) =>
    setRelatedState((prev) => ({ ...prev, [pid]: { ...prev[pid], qty } }));

  const setRelStock = (pid, stock, stockLoading = false) =>
    setRelatedState((prev) => ({ ...prev, [pid]: { ...prev[pid], stock, stockLoading } }));

  // ── SIZE helpers for related products ────────────────────────────────────
  const setRelSize = (pid, size) =>
    setRelatedState((prev) => ({ ...prev, [pid]: { ...prev[pid], size, sizeError: "" } }));

  const setRelSizeError = (pid, sizeError) =>
    setRelatedState((prev) => ({ ...prev, [pid]: { ...prev[pid], sizeError } }));

  const getRelState = (pid) =>
    relatedState[pid] || { qty: 1, stock: null, stockLoading: true, size: "", sizeError: "" };

  // ── Fetch stock for all related products in parallel ──────────────────────
  const fetchRelatedStocks = async (products) => {
    setRelatedState((prev) => {
      const next = { ...prev };
      products.forEach((p) => {
        next[p._id] = {
          qty: prev[p._id]?.qty || 1,
          stock: null,
          stockLoading: true,
          size: prev[p._id]?.size || "",
          sizeError: "",
        };
      });
      return next;
    });
    await Promise.all(
      products.map(async (p) => {
        try {
          const { data } = await axios.get(`/api/v1/product/stock/${p._id}`);
          setRelStock(p._id, data.availableStock ?? 0);
        } catch {
          setRelStock(p._id, p.quantity ?? 0);
        }
      })
    );
  };

  // ── Load main product ─────────────────────────────────────────────────────
  useEffect(() => { if (params?.slug) getProduct(); }, [params?.slug]);
  useEffect(() => { setQuantity(1); setSize(""); setSizeError(""); }, [product._id]);
  useEffect(() => { if (!product._id) return; fetchStock(product._id); }, [product._id]);

  const getProduct = async () => {
    try {
      const { data } = await axios.get(`/api/v1/product/get-product/${params.slug}`);
      setProduct(data?.product);
      getSimilarProduct(data?.product._id, data?.product.category._id);
    } catch (error) { console.log(error); }
  };

  const getSimilarProduct = async (pid, cid) => {
    try {
      const { data } = await axios.get(`/api/v1/product/related-product/${pid}/${cid}`);
      setRelatedProducts(data?.products);
      if (data?.products?.length > 0) fetchRelatedStocks(data.products);
    } catch (error) { console.log(error); }
  };

  const fetchStock = async (pid) => {
    setStockLoading(true);
    try {
      const { data } = await axios.get(`/api/v1/product/stock/${pid}`);
      if (data.success) setAvailableStock(data.availableStock);
    } catch {
      setAvailableStock(product?.quantity || 0);
    } finally { setStockLoading(false); }
  };

  // ── Main product cart ─────────────────────────────────────────────────────
  const alreadyInCart = cart?.filter((i) => i._id === product._id && i.size === size).length || 0;
  const maxCanAdd = Math.max(0, (availableStock ?? 0) - alreadyInCart);

  const decrease = () => setQuantity((q) => Math.max(1, q - 1));
  const increase = () => setQuantity((q) => Math.min(maxCanAdd, q + 1));

  const addToCart = async () => {
    // Validate size
    if (!size.trim()) {
      setSizeError("Please enter your size before adding to cart.");
      return;
    }
    setSizeError("");
    setStockLoading(true);
    try {
      const { data } = await axios.get(`/api/v1/product/stock/${product._id}`);
      const freshStock = data.availableStock;
      const freshAlreadyInCart = cart?.filter((i) => i._id === product._id && i.size === size.trim()).length || 0;
      const freshMaxCanAdd = Math.max(0, freshStock - freshAlreadyInCart);
      setAvailableStock(freshStock);
      if (freshMaxCanAdd <= 0) { toast.error("Sorry! This item just went out of stock."); return; }
      if (quantity > freshMaxCanAdd) { toast.error(`Only ${freshMaxCanAdd} available now.`); setQuantity(freshMaxCanAdd); return; }
      // Attach size to each cart item
      const itemsToAdd = Array(quantity).fill({ ...product, size: size.trim() });
      setCart([...cart, ...itemsToAdd]);
      toast.success(`${quantity} item${quantity > 1 ? "s" : ""} (Size: ${size.trim()}) added to cart!`);
    } catch {
      toast.error("Could not verify stock. Please try again.");
    } finally { setStockLoading(false); }
  };

  // ── Related product cart ──────────────────────────────────────────────────
  const handleRelatedAddToCart = async (p) => {
    const { qty, size: relSize } = getRelState(p._id);

    // Validate size
    if (!relSize?.trim()) {
      setRelSizeError(p._id, "Please enter a size.");
      return;
    }
    setRelSizeError(p._id, "");

    const inCart = cart.filter((i) => i._id === p._id && i.size === relSize.trim()).length;
    try {
      const { data } = await axios.get(`/api/v1/product/stock/${p._id}`);
      const freshStock = data.availableStock ?? 0;
      setRelStock(p._id, freshStock);
      const maxCanAdd = Math.max(0, freshStock - inCart);
      if (freshStock <= 0 || maxCanAdd <= 0) { toast.error("Sorry, this item is out of stock!"); return; }
      if (qty > maxCanAdd) { toast.error(`Only ${maxCanAdd} available.`); setRelQty(p._id, maxCanAdd); return; }
      const itemsToAdd = Array(qty).fill({ ...p, size: relSize.trim() });
      setCart([...cart, ...itemsToAdd]);
      toast.success(`${qty} item${qty > 1 ? "s" : ""} (Size: ${relSize.trim()}) added to cart!`);
    } catch { toast.error("Could not verify stock."); }
  };

  // ── Stock display helpers ─────────────────────────────────────────────────
  const stockDisplay = () => {
    if (stockLoading || availableStock === null) return { text: "Checking stock…", color: "#888" };
    if (availableStock === 0) return { text: "❌ Out of Stock", color: "#dc2626" };
    if (availableStock <= 5) return { text: `⚠️ Only ${availableStock} left!`, color: "#d97706" };
    return { text: `✅ In Stock (${availableStock} available)`, color: "#16a34a" };
  };

  const relStockBadge = (pid) => {
    const { stock, stockLoading: rl } = getRelState(pid);
    if (rl || stock === null) return <span style={{ fontSize: 11, color: "#888" }}>Checking stock…</span>;
    if (stock === 0) return <span style={{ fontSize: 11, color: "#dc2626", fontWeight: 600 }}>❌ Out of Stock</span>;
    if (stock <= 5) return <span style={{ fontSize: 11, color: "#d97706", fontWeight: 600 }}>⚠️ Only {stock} left!</span>;
    return <span style={{ fontSize: 11, color: "#16a34a", fontWeight: 600 }}>✅ In Stock ({stock})</span>;
  };

  const { text: stockText, color: stockColor } = stockDisplay();

  // ── Reusable quantity selector UI ─────────────────────────────────────────
  const QtySelector = ({ qty, maxCanAdd, onDec, onInc }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
      <button onClick={onDec} disabled={qty <= 1}
        style={{
          width: 30, height: 30, border: "1.5px solid #dee2e6", borderRadius: 6,
          background: qty <= 1 ? "#f8f9fa" : "#fff", fontWeight: 700, fontSize: 16,
          cursor: qty <= 1 ? "not-allowed" : "pointer", color: qty <= 1 ? "#aaa" : "#333"
        }}>
        −
      </button>
      <span style={{
        minWidth: 28, textAlign: "center", fontWeight: 700, fontSize: 14,
        border: "1.5px solid #dee2e6", borderRadius: 6, padding: "2px 6px"
      }}>
        {qty}
      </span>
      <button onClick={onInc} disabled={qty >= maxCanAdd}
        style={{
          width: 30, height: 30, border: "1.5px solid #dee2e6", borderRadius: 6,
          background: qty >= maxCanAdd ? "#f8f9fa" : "#fff", fontWeight: 700, fontSize: 16,
          cursor: qty >= maxCanAdd ? "not-allowed" : "pointer", color: qty >= maxCanAdd ? "#aaa" : "#333"
        }}>
        +
      </button>
    </div>
  );

  // ── Reusable size input UI ────────────────────────────────────────────────
  const SizeInput = ({ value, onChange, error }) => (
    <div style={{ marginBottom: 12 }}>
      <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 4, color: "#444" }}>
        📐 Size <span style={{ color: "#dc2626" }}>*</span>
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. M, L, 42, 10, XL…"
        style={{
          width: "100%",
          maxWidth: 200,
          padding: "7px 12px",
          border: error ? "1.5px solid #dc2626" : "1.5px solid #dee2e6",
          borderRadius: 8,
          fontSize: 14,
          outline: "none",
          transition: "border 0.2s",
        }}
        onFocus={(e) => { if (!error) e.target.style.border = "1.5px solid #6366f1"; }}
        onBlur={(e) => { e.target.style.border = error ? "1.5px solid #dc2626" : "1.5px solid #dee2e6"; }}
      />
      {error && (
        <p style={{ color: "#dc2626", fontSize: 12, marginTop: 4, marginBottom: 0 }}>
          ⚠️ {error}
        </p>
      )}
    </div>
  );

  return (
    <Layout>
      {/* ── Main product ── */}
      <div className="row container product-details">
        <div className="col-md-6">
          <img
            src={`/api/v1/product/product-photo/${product._id}`}
            className="product-details-img"
            alt={product.name}
          />
        </div>
        <div className="col-md-6 product-details-info">
          <h1 className="text-center">Product Details</h1>
          <hr />
          <h6>Name : {product.name}</h6>
          <h6>Description : {product.description}</h6>
          <h6>Price : {product?.price?.toLocaleString("en-US", { style: "currency", currency: "INR" })}</h6>
          <h6>Category : {product?.category?.name}</h6>
          <h6 style={{ color: stockColor, marginTop: 8 }}>{stockText}</h6>

          {availableStock > 0 && maxCanAdd > 0 ? (
            <div style={{ marginTop: 16 }}>
              {/* ── SIZE INPUT ── */}
              <SizeInput
                value={size}
                onChange={(val) => { setSize(val); if (sizeError) setSizeError(""); }}
                error={sizeError}
              />

              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", border: "1.5px solid #dee2e6", borderRadius: 8, overflow: "hidden" }}>
                  <button onClick={decrease} disabled={quantity <= 1}
                    style={{
                      width: 36, height: 36, border: "none", background: quantity <= 1 ? "#f8f9fa" : "#fff",
                      fontSize: 18, fontWeight: 700, cursor: quantity <= 1 ? "not-allowed" : "pointer", color: quantity <= 1 ? "#aaa" : "#333"
                    }}>
                    −
                  </button>
                  <span style={{
                    minWidth: 36, textAlign: "center", fontWeight: 700, fontSize: 15, padding: "0 8px",
                    borderLeft: "1px solid #dee2e6", borderRight: "1px solid #dee2e6"
                  }}>
                    {quantity}
                  </span>
                  <button onClick={increase} disabled={quantity >= maxCanAdd}
                    style={{
                      width: 36, height: 36, border: "none", background: quantity >= maxCanAdd ? "#f8f9fa" : "#fff",
                      fontSize: 18, fontWeight: 700, cursor: quantity >= maxCanAdd ? "not-allowed" : "pointer", color: quantity >= maxCanAdd ? "#aaa" : "#333"
                    }}>
                    +
                  </button>
                </div>
                <button className="btn btn-secondary ms-1" onClick={addToCart} disabled={stockLoading}>
                  {stockLoading ? "Checking…" : "ADD TO CART"}
                </button>
                {alreadyInCart > 0 && (
                  <span style={{ fontSize: 12, color: "#7c3aed" }}>({alreadyInCart} already in your cart)</span>
                )}
              </div>
            </div>
          ) : (
            <button className="btn btn-secondary ms-1 mt-3" disabled>
              {availableStock === 0 ? "Out of Stock" : "Max stock reached"}
            </button>
          )}
        </div>
      </div>

      <hr />

      {/* ── Similar Products ── */}
      <div className="row container similar-products">
        <h4>Similar Products ➡️</h4>
        {relatedProducts.length < 1 && <p className="text-center">No Similar Products found</p>}
        <div className="d-flex flex-wrap">
          {relatedProducts?.map((p) => {
            const { qty, stock, stockLoading: rl, size: relSize, sizeError: relSizeErr } = getRelState(p._id);
            const inCart = cart.filter((i) => i._id === p._id && i.size === relSize?.trim()).length;
            const maxAdd = Math.max(0, (stock ?? 0) - inCart);
            const outOfStock = !rl && stock !== null && stock === 0;
            const maxReached = !rl && stock !== null && maxAdd === 0 && stock > 0;

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
                      {p.price.toLocaleString("en-US", { style: "currency", currency: "INR" })}
                    </h5>
                  </div>
                  <p className="card-text">{p.description.substring(0, 60)}...</p>

                  {/* Stock badge */}
                  <div style={{ marginBottom: 8 }}>
                    {relStockBadge(p._id)}
                    {inCart > 0 && (
                      <span style={{ fontSize: 11, color: "#7c3aed", marginLeft: 8 }}>({inCart} in cart)</span>
                    )}
                  </div>

                  {/* ── SIZE INPUT for related product ── */}
                  {!outOfStock && (
                    <SizeInput
                      value={relSize || ""}
                      onChange={(val) => setRelSize(p._id, val)}
                      error={relSizeErr}
                    />
                  )}

                  {/* Quantity selector */}
                  {!outOfStock && !maxReached && (
                    <QtySelector
                      qty={qty}
                      maxCanAdd={maxAdd}
                      onDec={() => setRelQty(p._id, Math.max(1, qty - 1))}
                      onInc={() => setRelQty(p._id, Math.min(maxAdd, qty + 1))}
                    />
                  )}

                  {/* Buttons */}
                  <div className="card-name-price">
                    <button className="btn btn-info ms-1" onClick={() => navigate(`/product/${p.slug}`)}>
                      More Details
                    </button>
                    <button
                      className="btn btn-dark ms-1"
                      disabled={outOfStock || maxReached || rl}
                      onClick={() => handleRelatedAddToCart(p)}
                      style={{ opacity: outOfStock || maxReached ? 0.5 : 1 }}
                    >
                      {outOfStock ? "Out of Stock" : maxReached ? "Max in Cart" : rl ? "Checking…" : "ADD TO CART"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetails;