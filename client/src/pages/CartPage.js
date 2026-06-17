import React, { useState, useEffect } from "react";
import Layout from "./../components/Layout/Layout";
import { useCart } from "../context/cart";
import { useAuth } from "../context/auth";
import { useNavigate } from "react-router-dom";
import DropIn from "braintree-web-drop-in-react";
import axios from "axios";
import toast from "react-hot-toast";
import "../styles/CartStyles.css";

const CartPage = () => {
  const [auth] = useAuth();
  const [cart, setCart] = useCart();
  const [clientToken, setClientToken] = useState("");
  const [instance, setInstance] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ── Coupon state ──────────────────────────────────────────────────────────
  const [couponInput, setCouponInput] = useState("");
  const [couponApplied, setCouponApplied] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");

  // ── Stock map { [pid]: availableStock } ───────────────────────────────────
  const [stockMap, setStockMap] = useState({});

  const uniqueIds = [...new Set(cart?.map((i) => i._id) || [])];

  const fetchCartStocks = async () => {
    await Promise.all(
      uniqueIds.map(async (pid) => {
        try {
          const { data } = await axios.get(`/api/v1/product/stock/${pid}`);
          setStockMap((prev) => ({ ...prev, [pid]: data.availableStock ?? 0 }));
        } catch { }
      })
    );
  };

  useEffect(() => { if (cart?.length > 0) fetchCartStocks(); }, [cart?.length]);

  // ── Totals ────────────────────────────────────────────────────────────────
  const rawTotal = () => cart?.reduce((sum, item) => sum + item.price, 0) || 0;
  const discountedTotal = () => {
    const total = rawTotal();
    if (!couponApplied) return total;
    return total - (total * couponApplied.discount) / 100;
  };
  const fmt = (amount) =>
    amount.toLocaleString("en-IN", { style: "currency", currency: "INR" });

  // ── Cart item controls ────────────────────────────────────────────────────
  // Remove one item matching pid + size
  const removeOneItem = (pid, size) => {
    const idx = [...cart].findIndex((item) => item._id === pid && item.size === size);
    if (idx === -1) return;
    const newCart = [...cart];
    newCart.splice(idx, 1);
    setCart(newCart);
  };

  // Remove all items matching pid + size
  const removeAllOfItem = (pid, size) =>
    setCart(cart.filter((item) => !(item._id === pid && item.size === size)));

  const addOneMore = async (p) => {
    const currentInCart = cart.filter((i) => i._id === p._id).length;
    try {
      const { data } = await axios.get(`/api/v1/product/stock/${p._id}`);
      const fresh = data.availableStock ?? 0;
      setStockMap((prev) => ({ ...prev, [p._id]: fresh }));
      if (currentInCart >= fresh) { toast.error(`Only ${fresh} in stock — can't add more!`); return; }
      // Keep the same size when adding one more
      setCart([...cart, { ...p }]);
    } catch { toast.error("Could not verify stock."); }
  };

  // ── Coupon ────────────────────────────────────────────────────────────────
  const applyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setCouponLoading(true);
    setCouponError("");
    try {
      const { data } = await axios.post(
        "/api/v1/game/apply-coupon",
        { couponCode: code },
        { headers: { Authorization: auth?.token } }
      );
      if (data.success) { setCouponApplied({ code, discount: data.discount }); toast.success(`Coupon applied! ${data.discount}% off`); }
      else { setCouponError(data.message || "Invalid coupon code."); setCouponApplied(null); }
    } catch (err) {
      setCouponError(err?.response?.data?.message || "Invalid or already used coupon.");
      setCouponApplied(null);
    } finally { setCouponLoading(false); }
  };

  const removeCoupon = () => { setCouponApplied(null); setCouponInput(""); setCouponError(""); };

  // ── Payment ───────────────────────────────────────────────────────────────
  const getToken = async () => {
    try {
      const { data } = await axios.get("/api/v1/product/braintree/token");
      setClientToken(data?.clientToken);
    } catch (error) { console.log(error); }
  };
  useEffect(() => { getToken(); }, [auth?.token]);

  const handlePayment = async () => {
    try {
      setLoading(true);
      const { nonce } = await instance.requestPaymentMethod();
      await axios.post("/api/v1/product/braintree/payment", {
        nonce,
        cart,
        couponCode: couponApplied?.code || null,
        finalAmount: discountedTotal(),
      });
      setLoading(false);
      setCart([]);
      navigate("/dashboard/user/orders");
      toast.success("Payment Completed Successfully");
    } catch (error) { console.log(error); setLoading(false); }
  };

  // ── Group cart by product _id + size (each unique combination = one row) ──
  const groupedCart = () => {
    const map = {};
    cart?.forEach((item) => {
      // Key is productId + size so same product in different sizes stays separate
      const key = `${item._id}__${item.size || ""}`;
      if (map[key]) map[key].count++;
      else map[key] = { ...item, count: 1 };
    });
    return Object.values(map);
  };

  return (
    <Layout title="Cart">
      <div className="cart-page">
        <div className="row">
          <div className="col-md-12">
            <h1 className="text-center bg-light p-2 mb-1">
              {!auth?.user ? "👋 Hello Guest" : `👋 Hello ${auth?.token && auth?.user?.name}`}
              <p className="text-center">
                {cart?.length
                  ? `🛒 You Have ${cart.length} item${cart.length > 1 ? "s" : ""} in your cart ${auth?.token ? "" : "— please login to checkout!"}`
                  : "🛒 Your Cart Is Empty"}
              </p>
            </h1>
          </div>
        </div>

        <div className="container">
          <div className="row">
            {/* ── Cart items ── */}
            <div className="col-md-7 p-0 m-0">
              {groupedCart().map((p) => {
                const inCart = p.count;
                const stock = stockMap[p._id];
                const maxCanAdd = stock !== undefined ? Math.max(0, stock - inCart) : null;

                return (
                  <div
                    className="row card flex-row mb-2"
                    key={`${p._id}__${p.size || ""}`}
                    style={{ overflow: "hidden", alignItems: "stretch", minHeight: 150 }}
                  >
                    {/* Image */}
                    <div className="col-md-3 p-0" style={{ overflow: "hidden", maxWidth: 130, flexShrink: 0 }}>
                      <img
                        src={`/api/v1/product/product-photo/${p._id}`}
                        alt={p.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", display: "block" }}
                      />
                    </div>

                    {/* Info */}
                    <div className="col p-2 d-flex flex-column justify-content-center">
                      <p style={{ fontWeight: 600, margin: "0 0 4px" }}>{p.name}</p>
                      <p style={{ fontSize: 12, color: "#888", margin: "0 0 4px" }}>
                        {p.description.substring(0, 40)}...
                      </p>

                      {/* ── SIZE BADGE ── */}
                      {p.size && (
                        <p style={{ margin: "0 0 4px" }}>
                          <span style={{
                            display: "inline-block",
                            background: "#f3f0ff",
                            color: "#7c3aed",
                            border: "1px solid #ddd6fe",
                            borderRadius: 6,
                            padding: "2px 10px",
                            fontWeight: 700,
                            fontSize: 13,
                            letterSpacing: 0.5,
                          }}>
                            📐 Size: {p.size}
                          </span>
                        </p>
                      )}

                      <p style={{ margin: "0 0 4px" }}>
                        Price: <strong>{fmt(p.price)}</strong>
                      </p>
                      {inCart > 1 && (
                        <p style={{ margin: 0, fontSize: 12, color: "#7c3aed" }}>
                          Subtotal: <strong>{fmt(p.price * inCart)}</strong>
                        </p>
                      )}
                      {/* Stock badge */}
                      {stock !== undefined && (
                        <span style={{
                          fontSize: 11, fontWeight: 600, marginTop: 4,
                          color: stock === 0 ? "#dc2626" : stock <= 5 ? "#d97706" : "#16a34a"
                        }}>
                          {stock === 0 ? "❌ Out of Stock" : stock <= 5 ? `⚠️ Only ${stock} left` : `✅ ${stock} in stock`}
                        </span>
                      )}
                    </div>

                    {/* Controls */}
                    <div className="col-auto p-2 d-flex flex-column align-items-center justify-content-center gap-2"
                      style={{ minWidth: 130 }}>

                      {/* + / qty / - */}
                      <div style={{ display: "flex", alignItems: "center", border: "1.5px solid #dee2e6", borderRadius: 8, overflow: "hidden" }}>
                        <button
                          onClick={() => removeOneItem(p._id, p.size)}
                          style={{ width: 32, height: 32, border: "none", background: "#fff", fontSize: 18, fontWeight: 700, cursor: "pointer", color: "#333" }}
                        >−</button>
                        <span style={{ minWidth: 32, textAlign: "center", fontWeight: 700, fontSize: 14, padding: "0 6px", borderLeft: "1px solid #dee2e6", borderRight: "1px solid #dee2e6" }}>
                          {inCart}
                        </span>
                        <button
                          onClick={() => addOneMore(p)}
                          disabled={maxCanAdd === 0}
                          style={{ width: 32, height: 32, border: "none", background: maxCanAdd === 0 ? "#f8f9fa" : "#fff", fontSize: 18, fontWeight: 700, cursor: maxCanAdd === 0 ? "not-allowed" : "pointer", color: maxCanAdd === 0 ? "#aaa" : "#333" }}
                        >+</button>
                      </div>

                      {/* More Details */}
                      <button
                        className="btn btn-info btn-sm w-100"
                        onClick={() => navigate(`/product/${p.slug}`)}
                      >
                        More Details
                      </button>

                      {/* Remove all of this size */}
                      <button
                        className="btn btn-danger btn-sm w-100"
                        onClick={() => removeAllOfItem(p._id, p.size)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Cart Summary ── */}
            <div className="col-md-5 cart-summary">
              <h2>Cart Summary</h2>
              <p>Total | Checkout | Payment</p>
              <hr />

              <h4>Total: {fmt(rawTotal())}</h4>
              {couponApplied && (
                <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 14px", marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#15803d" }}>
                    <span>Discount ({couponApplied.discount}% off)</span>
                    <span>- {fmt(rawTotal() * couponApplied.discount / 100)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, marginTop: 6 }}>
                    <span>Final Total</span>
                    <span style={{ color: "#15803d" }}>{fmt(discountedTotal())}</span>
                  </div>
                </div>
              )}

              {/* Coupon */}
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontWeight: 600, marginBottom: 6, fontSize: 14 }}>🎮 Have a game coupon?</p>
                {!couponApplied ? (
                  <>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input type="text" className="form-control" placeholder="Enter coupon code"
                        value={couponInput}
                        onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError(""); }}
                        onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                        style={{ flex: 1, fontSize: 13, letterSpacing: 1 }}
                      />
                      <button className="btn btn-outline-success" onClick={applyCoupon}
                        disabled={couponLoading || !couponInput.trim()} style={{ whiteSpace: "nowrap" }}>
                        {couponLoading ? "..." : "Apply"}
                      </button>
                    </div>
                    {couponError && <p style={{ color: "#dc2626", fontSize: 13, marginTop: 6 }}>✗ {couponError}</p>}
                  </>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ background: "#f0fdf4", border: "1px dashed #16a34a", borderRadius: 6, padding: "4px 12px", fontFamily: "monospace", fontWeight: 700, fontSize: 15, color: "#15803d", letterSpacing: 2 }}>
                      {couponApplied.code}
                    </span>
                    <span style={{ fontSize: 13, color: "#16a34a" }}>✓ {couponApplied.discount}% off</span>
                    <button className="btn btn-sm btn-outline-danger" onClick={removeCoupon} style={{ fontSize: 12 }}>Remove</button>
                  </div>
                )}
              </div>

              {/* Address */}
              {auth?.user?.address ? (
                <div className="mb-3">
                  <h4>Current Address</h4>
                  <h5>{auth?.user?.address}</h5>
                  <button className="btn btn-outline-warning" onClick={() => navigate("/dashboard/user/profile")}>
                    Update Address
                  </button>
                </div>
              ) : (
                <div className="mb-3">
                  {auth?.token ? (
                    <button className="btn btn-outline-warning" onClick={() => navigate("/dashboard/user/profile")}>Update Address</button>
                  ) : (
                    <button className="btn btn-outline-warning" onClick={() => navigate("/login", { state: "/cart" })}>Please Login to checkout</button>
                  )}
                </div>
              )}

              {/* Payment */}
              <div className="mt-2">
                {!clientToken || !auth?.token || !cart?.length ? "" : (
                  <>
                    <DropIn
                      options={{
                        authorization: clientToken,
                        card: {
                          cardholderName: { required: true },
                        },
                      }}
                      onInstance={(instance) => setInstance(instance)}
                    />
                    <button
                      className="btn btn-primary w-100 mt-2"
                      onClick={handlePayment}
                      disabled={loading || !instance || !auth?.user?.address}
                    >
                      {loading ? "Processing..." : `Pay ${fmt(discountedTotal())}`}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CartPage;