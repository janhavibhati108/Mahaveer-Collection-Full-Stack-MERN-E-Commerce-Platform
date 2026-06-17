import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/auth";
import "./FashionMatch.css";

const FALLBACK_ITEMS = [
    { _id: "f1", name: "Summer Dress", emoji: "👗" },
    { _id: "f2", name: "Denim Jacket", emoji: "🧥" },
    { _id: "f3", name: "Sneakers", emoji: "👟" },
    { _id: "f4", name: "Handbag", emoji: "👜" },
    { _id: "f5", name: "Sunglasses", emoji: "🕶️" },
    { _id: "f6", name: "Floral Top", emoji: "👚" },
    { _id: "f7", name: "Trousers", emoji: "👖" },
    { _id: "f8", name: "Ankle Boots", emoji: "👢" },
];

const TIERS = [
    { pairs: 8, discount: 15, label: "15% OFF 🎉" },
    { pairs: 5, discount: 10, label: "10% OFF 🥈" },
    { pairs: 3, discount: 5, label: "5% OFF 🥉" },
];

const TIME_LIMIT = 30;

function getDiscount(pairs) {
    for (const t of TIERS) if (pairs >= t.pairs) return t;
    return null;
}

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function buildDeck(items) {
    const pool = items.slice(0, 8);
    return shuffle(
        pool.flatMap((item, idx) => [
            { ...item, uid: `${idx}-a`, matched: false, flipped: false },
            { ...item, uid: `${idx}-b`, matched: false, flipped: false },
        ])
    );
}

export default function FashionMatch() {
    const [auth] = useAuth();
    const navigate = useNavigate();

    const [deck, setDeck] = useState([]);
    const [flipped, setFlipped] = useState([]);
    const [matched, setMatched] = useState(0);
    const [moves, setMoves] = useState(0);
    const [locked, setLocked] = useState(false);
    const [gameState, setGameState] = useState("idle"); // idle | playing | done | timeout | won | locked | guest-claim
    const [coupon, setCoupon] = useState(null);
    const [savingCoupon, setSavingCoupon] = useState(false);
    const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
    const [alreadyWon, setAlreadyWon] = useState(false);

    const isGuest = !auth?.token;

    // ── Check if logged-in user already won a coupon today ────────────────────
    useEffect(() => {
        if (!auth?.token) return;
        axios
            .post("/api/v1/game/check-status", {}, { headers: { Authorization: auth.token } })
            .then(({ data }) => {
                if (data.hasUnusedCoupon) {
                    setAlreadyWon(true);
                    setCoupon({ code: data.couponCode, discount: data.discount });
                    setGameState("locked");
                }
            })
            .catch(() => { });
    }, [auth?.token]);

    // ── Countdown timer ───────────────────────────────────────────────────────
    useEffect(() => {
        if (gameState !== "playing") return;
        if (timeLeft <= 0) { setGameState("timeout"); return; }
        const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
        return () => clearInterval(id);
    }, [gameState, timeLeft]);

    // ── Start game (guests allowed) ───────────────────────────────────────────
    const startGame = useCallback(() => {
        if (alreadyWon) return;
        setDeck(buildDeck(FALLBACK_ITEMS));
        setFlipped([]);
        setMatched(0);
        setMoves(0);
        setTimeLeft(TIME_LIMIT);
        setCoupon(null);
        setGameState("playing");
    }, [alreadyWon]);

    // ── Flip a card ───────────────────────────────────────────────────────────
    const flipCard = (idx) => {
        if (locked) return;
        if (deck[idx].matched || deck[idx].flipped) return;
        if (flipped.length === 1 && flipped[0] === idx) return;

        const newDeck = deck.map((c, i) => i === idx ? { ...c, flipped: true } : c);
        setDeck(newDeck);

        if (flipped.length === 0) { setFlipped([idx]); return; }

        const [firstIdx] = flipped;
        setMoves((m) => m + 1);
        setFlipped([]);

        if (newDeck[firstIdx]._id === newDeck[idx]._id) {
            const matched2 = newDeck.map((c, i) =>
                i === firstIdx || i === idx ? { ...c, matched: true } : c
            );
            setDeck(matched2);
            const newMatched = matched + 1;
            setMatched(newMatched);
            if (newMatched === 8) setTimeout(() => setGameState("done"), 400);
        } else {
            setLocked(true);
            setTimeout(() => {
                setDeck((d) => d.map((c, i) =>
                    i === firstIdx || i === idx ? { ...c, flipped: false } : c
                ));
                setLocked(false);
            }, 900);
        }
    };

    // ── Claim coupon ──────────────────────────────────────────────────────────
    const claimCoupon = async () => {
        // Guest → show login prompt instead
        if (isGuest) {
            setGameState("guest-claim");
            return;
        }

        const tier = getDiscount(matched);
        if (!tier) return;
        setSavingCoupon(true);
        try {
            const { data } = await axios.post(
                "/api/v1/game/save-score",
                { score: matched, moves, timeTaken: TIME_LIMIT - timeLeft },
                { headers: { Authorization: auth?.token } }
            );
            if (data.coupon) {
                setCoupon(data.coupon);
                setAlreadyWon(true);
                setGameState("won");
            }
        } catch (err) {
            const existingCoupon = err?.response?.data?.coupon;
            if (existingCoupon) {
                setCoupon(existingCoupon);
                setAlreadyWon(true);
                setGameState("locked");
            } else {
                toast.error("Could not save coupon. Please try again.");
                setGameState("idle");
            }
        } finally {
            setSavingCoupon(false);
        }
    };

    const tier = getDiscount(matched);
    const timerColor = timeLeft > 15 ? "#16a34a" : timeLeft > 8 ? "#d97706" : "#dc2626";
    const timeTakenSecs = TIME_LIMIT - timeLeft;
    const fmtStatic = (s) =>
        `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

    return (
        <div className="fm-wrapper">

            {/* Back button */}
            <button className="fm-back-btn" onClick={() => navigate(-1)}>← Back</button>

            {/* Header */}
            <div className="fm-header">
                <div style={{
                    backgroundColor: "white", padding: "14px 18px", borderRadius: "14px",
                    boxShadow: "0 6px 18px rgba(0,0,0,0.08)", textAlign: "center",
                    width: "fit-content", margin: "0 auto 20px auto"
                }}>
                    <div style={{ fontSize: "22px", marginBottom: "10px" }}>✨👗👜💄👠🕶️⌚💍✨</div>
                    <h1 style={{ margin: 0, fontSize: "36px", color: "#1e1b4b" }}>Fashion Match</h1>
                    <p style={{ marginTop: "8px", fontSize: "16px", color: "#4f46e5" }}>
                        Match stylish pairs before time runs out! 💖
                    </p>
                </div>

                <div className="fm-title-block">
                    <div className="fm-stat">
                        <span className="fm-stat-icon">🎯</span>
                        <span className="fm-stat-label">Moves</span>
                        <span className="fm-stat-value">{moves}</span>
                    </div>
                    <div className="fm-stat">
                        <span className="fm-stat-icon">🏆</span>
                        <span className="fm-stat-label">Pairs</span>
                        <span className="fm-stat-value">{matched}/8</span>
                    </div>
                </div>
            </div>

            {/* Discount tiers */}
            <div className="fm-tiers">
                {TIERS.map((t) => (
                    <div key={t.pairs} className={`fm-tier-pill ${matched >= t.pairs ? "fm-tier-active" : ""}`}>
                        {t.pairs} pairs → {t.label}
                    </div>
                ))}
            </div>

            {/* Countdown timer bar */}
            {gameState === "playing" && (
                <div className="fm-timer-wrap">
                    <div className="fm-timer-row">
                        <span className="fm-timer-label">Time left</span>
                        <span className="fm-timer-num" style={{ color: timerColor }}>{timeLeft}s</span>
                    </div>
                    <div className="fm-timer-track">
                        <div className="fm-timer-bar" style={{ width: `${(timeLeft / TIME_LIMIT) * 100}%`, background: timerColor }} />
                    </div>
                </div>
            )}

            {/* ── LOCKED — already won today, coupon unused ── */}
            {(gameState === "locked" || gameState === "won") && coupon && (
                <div className="fm-result fm-result-locked">
                    <div style={{ fontSize: 48, marginBottom: 8 }}>🎫</div>
                    <h2 className="fm-result-heading">You have an unused coupon!</h2>
                    <p className="fm-result-stats">
                        Use your coupon at checkout first — then come back and play again to win more!
                    </p>
                    <div className="fm-coupon">
                        <p className="fm-coupon-label">Your active discount code</p>
                        <p className="fm-coupon-code">{coupon.code}</p>
                        <p className="fm-coupon-sub">{coupon.discount}% off · apply at checkout</p>
                    </div>
                    <button className="fm-btn-primary" onClick={() => navigate("/cart")} style={{ marginTop: 16 }}>
                        🛒 Go to Cart & Use Coupon
                    </button>
                    <p style={{ fontSize: 12, color: "#7a4f08", marginTop: 12 }}>
                        Once you use the coupon, you can play again and win more discounts — any time!
                    </p>
                </div>
            )}

            {/* ── IDLE splash ── */}
            {gameState === "idle" && (
                <div className="fm-splash">
                    <div className="fm-splash-icon" style={{ fontSize: "40px" }}>🛍️</div>
                    <h2 className="fm-splash-heading">Win discounts by playing!</h2>
                    <p className="fm-splash-body">
                        Flip cards to find matching fashion pairs.<br />
                        You have just <strong>30 seconds</strong> — match more, save more!
                    </p>
                    <div className="fm-tiers-info">
                        <span>3 pairs = 5% off | </span>
                        <span>5 pairs = 10% off | </span>
                        <span>8 pairs = 15% off</span>
                    </div>
                    {isGuest && (
                        <p style={{
                            fontSize: 13, color: "#7c3aed", background: "#f3f0ff",
                            border: "1px solid #ddd6fe", borderRadius: 8,
                            padding: "8px 14px", marginBottom: 12
                        }}>
                            🎮 Playing as guest — you'll need to <strong>log in</strong> to claim your coupon!
                        </p>
                    )}
                    <button className="fm-btn-primary" onClick={startGame}>Start game</button>
                </div>
            )}

            {/* ── Game board ── */}
            {(gameState === "playing" || gameState === "done" || gameState === "timeout") && (
                <div className={`fm-board ${gameState !== "playing" ? "fm-board-done" : ""}`}>
                    {deck.map((card, idx) => (
                        <div
                            key={card.uid}
                            className={`fm-card ${card.flipped || card.matched ? "fm-card-face" : ""} ${card.matched ? "fm-card-matched" : ""}`}
                            onClick={() => gameState === "playing" && flipCard(idx)}
                            role="button"
                            aria-label={card.flipped || card.matched ? card.name : "Hidden card"}
                        >
                            <div className="fm-card-inner">
                                <div className="fm-card-back"><span className="fm-card-back-icon">✦</span></div>
                                <div className="fm-card-front">
                                    <span className="fm-card-emoji">{card.emoji}</span>
                                    <span className="fm-card-name">{card.name}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── GUEST CLAIM — show login prompt ── */}
            {gameState === "guest-claim" && (
                <div className="fm-result" style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 52, marginBottom: 8 }}>🔐</div>
                    <h2 className="fm-result-heading">Login to claim your discount!</h2>
                    <p className="fm-result-stats">
                        You matched <strong>{matched}</strong> pair{matched !== 1 ? "s" : ""} and earned{" "}
                        <strong>{tier?.label}</strong> — great job! 🎉
                    </p>
                    <p style={{ fontSize: 14, color: "#555", marginBottom: 20 }}>
                        Create a free account or log in to save your coupon and use it at checkout.
                    </p>
                    <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                        <button
                            className="fm-btn-primary"
                            onClick={() => navigate("/login", { state: "/game" })}
                        >
                            🔑 Login
                        </button>
                        <button
                            className="fm-btn-secondary"
                            onClick={() => navigate("/register", { state: "/game" })}
                            style={{
                                background: "#fff", color: "#4f46e5",
                                border: "2px solid #4f46e5", borderRadius: 10,
                                padding: "10px 24px", fontWeight: 700, fontSize: 15, cursor: "pointer"
                            }}
                        >
                            ✨ Create Account
                        </button>
                    </div>
                    <button
                        onClick={startGame}
                        style={{
                            marginTop: 16, background: "none", border: "none",
                            color: "#888", fontSize: 13, cursor: "pointer", textDecoration: "underline"
                        }}
                    >
                        Play again as guest
                    </button>
                </div>
            )}

            {/* ── TIME'S UP — no coupon won ── */}
            {gameState === "timeout" && !tier && (
                <div className="fm-result fm-result-timeout">
                    <div className="fm-timeout-icon" style={{ fontSize: "40px" }}>⏰</div>
                    <h2 className="fm-result-heading">Time's up!</h2>
                    <p className="fm-result-stats">
                        You matched <strong>{matched}</strong> pair{matched !== 1 ? "s" : ""} — need 3+ to win.
                    </p>
                    <p className="fm-result-noreward">Match at least 3 pairs to earn a discount!</p>
                    <button className="fm-btn-primary" onClick={startGame} style={{ marginTop: 12 }}>
                        Try again
                    </button>
                </div>
            )}

            {/* ── TIME'S UP — coupon earned ── */}
            {gameState === "timeout" && tier && !coupon && gameState !== "guest-claim" && (
                <div className="fm-result fm-result-timeout">
                    <div className="fm-timeout-icon" style={{ fontSize: "40px" }}>⏰</div>
                    <h2 className="fm-result-heading">Time's up — but you earned {tier.label}!</h2>
                    <p className="fm-result-stats">
                        Matched <strong>{matched}</strong> pairs in {moves} moves
                    </p>
                    <button className="fm-btn-primary" onClick={claimCoupon} disabled={savingCoupon}>
                        {savingCoupon ? "Generating…" : isGuest ? "Claim your coupon 🔐" : "Claim your coupon"}
                    </button>
                </div>
            )}

            {/* ── DONE — all 8 matched ── */}
            {gameState === "done" && !coupon && (
                <div className="fm-result">
                    <h2 className="fm-result-heading">You unlocked {tier?.label} 🎉</h2>
                    <p className="fm-result-stats">
                        All 8 pairs in {moves} moves · {fmtStatic(timeTakenSecs)} left on clock
                    </p>
                    <button className="fm-btn-primary" onClick={claimCoupon} disabled={savingCoupon}>
                        {savingCoupon ? "Generating…" : isGuest ? "Claim your coupon 🔐" : "Claim your coupon"}
                    </button>
                </div>
            )}

        </div>
    );
}