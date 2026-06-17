import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/cart";
import { useAuth } from "../../context/auth";
import axios from "axios";
import toast from "react-hot-toast";
import "./VoiceAssistant.css";

// ── T-Shirt SVG Mascot ────────────────────────────────────────────────────────
const TShirtMascot = ({ state }) => {
    // state: idle | listening | thinking | speaking
    const isListening = state === "listening";
    const isThinking = state === "thinking";
    const isSpeaking = state === "speaking";

    return (
        <svg viewBox="0 0 120 130" xmlns="http://www.w3.org/2000/svg" className="va-mascot-svg">
            {/* ── Shirt body ── */}
            <defs>
                <linearGradient id="shirtGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6d28d9" />
                    <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
                <linearGradient id="shirtGradActive" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#7c3aed" />
                    <stop offset="100%" stopColor="#c084fc" />
                </linearGradient>
            </defs>

            {/* Shirt shape */}
            <path
                d="M15,30 L5,55 L25,58 L25,118 L95,118 L95,58 L115,55 L105,30 L80,20 Q60,35 40,20 Z"
                fill={isListening || isSpeaking ? "url(#shirtGradActive)" : "url(#shirtGrad)"}
                className={`va-shirt-body ${isListening ? "va-pulse" : ""}`}
            />

            {/* Collar */}
            <path
                d="M40,20 Q50,38 60,36 Q70,38 80,20 Q70,28 60,27 Q50,28 40,20 Z"
                fill="#4c1d95"
            />

            {/* Left sleeve */}
            <path
                d="M15,30 L5,55 L25,58 L30,35 Z"
                fill={isListening || isSpeaking ? "#9333ea" : "#5b21b6"}
            />

            {/* Right sleeve */}
            <path
                d="M105,30 L115,55 L95,58 L90,35 Z"
                fill={isListening || isSpeaking ? "#9333ea" : "#5b21b6"}
            />

            {/* ── Left arm (hand waving when speaking) ── */}
            <g className={isSpeaking ? "va-wave-left" : ""} style={{ transformOrigin: "25px 58px" }}>
                <ellipse cx="16" cy="72" rx="7" ry="5" fill="#5b21b6" transform="rotate(-20,16,72)" />
                {/* Hand */}
                <circle cx="10" cy="80" r="7" fill="#fbbf24" />
                <line x1="6" y1="75" x2="4" y2="70" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
                <line x1="10" y1="74" x2="9" y2="68" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
                <line x1="14" y1="75" x2="14" y2="69" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
            </g>

            {/* ── Right arm ── */}
            <g className={isSpeaking ? "va-wave-right" : ""} style={{ transformOrigin: "95px 58px" }}>
                <ellipse cx="104" cy="72" rx="7" ry="5" fill="#5b21b6" transform="rotate(20,104,72)" />
                {/* Hand */}
                <circle cx="110" cy="80" r="7" fill="#fbbf24" />
                <line x1="106" y1="75" x2="104" y2="70" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
                <line x1="110" y1="74" x2="110" y2="68" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
                <line x1="114" y1="75" x2="116" y2="70" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
            </g>

            {/* ── Face on shirt ── */}
            {/* Eyes */}
            <ellipse cx="46" cy="68" rx="7" ry={isThinking ? 4 : 7} fill="white" />
            <ellipse cx="74" cy="68" rx="7" ry={isThinking ? 4 : 7} fill="white" />

            {/* Pupils */}
            <circle cx={isThinking ? 48 : 46} cy="68" r="3.5"
                fill="#1e1b4b"
                className={isListening ? "va-pupil-grow" : ""}
            />
            <circle cx={isThinking ? 76 : 74} cy="68" r="3.5"
                fill="#1e1b4b"
                className={isListening ? "va-pupil-grow" : ""}
            />

            {/* Eye shine */}
            <circle cx="44" cy="66" r="1.2" fill="white" opacity="0.8" />
            <circle cx="72" cy="66" r="1.2" fill="white" opacity="0.8" />

            {/* Eyebrows */}
            <path
                d={isThinking ? "M40,59 Q46,56 52,59" : isListening ? "M40,57 Q46,53 52,57" : "M40,60 Q46,57 52,60"}
                stroke="#1e1b4b" strokeWidth="2.5" fill="none" strokeLinecap="round"
                style={{ transition: "d 0.3s" }}
            />
            <path
                d={isThinking ? "M68,59 Q74,56 80,59" : isListening ? "M68,57 Q74,53 80,57" : "M68,60 Q74,57 80,60"}
                stroke="#1e1b4b" strokeWidth="2.5" fill="none" strokeLinecap="round"
            />

            {/* Mouth */}
            {isSpeaking ? (
                // Talking mouth — animated open/close
                <ellipse cx="60" cy="90" rx="10" ry="5" fill="#1e1b4b" className="va-mouth-talk" />
            ) : isListening ? (
                // Big smile when listening
                <path d="M47,88 Q60,102 73,88" stroke="#1e1b4b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            ) : isThinking ? (
                // Wavy thinking mouth
                <path d="M48,90 Q54,86 60,90 Q66,94 72,90" stroke="#1e1b4b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            ) : (
                // Neutral smile
                <path d="M49,89 Q60,98 71,89" stroke="#1e1b4b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            )}

            {/* Blush when listening */}
            {isListening && (
                <>
                    <ellipse cx="37" cy="76" rx="6" ry="3.5" fill="#f9a8d4" opacity="0.5" />
                    <ellipse cx="83" cy="76" rx="6" ry="3.5" fill="#f9a8d4" opacity="0.5" />
                </>
            )}

            {/* Thinking dots */}
            {isThinking && (
                <g className="va-think-dots">
                    <circle cx="50" cy="108" r="3" fill="white" opacity="0.6" className="va-dot1" />
                    <circle cx="60" cy="108" r="3" fill="white" opacity="0.6" className="va-dot2" />
                    <circle cx="70" cy="108" r="3" fill="white" opacity="0.6" className="va-dot3" />
                </g>
            )}

            {/* Mic icon on shirt when idle */}
            {state === "idle" && (
                <g opacity="0.35">
                    <rect x="55" y="96" width="10" height="14" rx="5" fill="white" />
                    <path d="M50,106 Q50,116 60,116 Q70,116 70,106" stroke="white" strokeWidth="2" fill="none" />
                    <line x1="60" y1="116" x2="60" y2="120" stroke="white" strokeWidth="2" />
                </g>
            )}
        </svg>
    );
};

// ── Speech bubble ─────────────────────────────────────────────────────────────
const SpeechBubble = ({ text, isUser }) => (
    <div className={`va-bubble ${isUser ? "va-bubble-user" : "va-bubble-bot"}`}>
        {text}
    </div>
);

// ── Main component ────────────────────────────────────────────────────────────
export default function VoiceAssistant() {
    const [open, setOpen] = useState(false);
    const [mascotState, setMascot] = useState("idle"); // idle|listening|thinking|speaking
    const [transcript, setTranscript] = useState("");
    const [messages, setMessages] = useState([
        { role: "bot", text: "Hi! I'm Threads, your fashion assistant! 👗 Try saying 'show me dresses' or 'add to cart'!" }
    ]);
    const [isListening, setIsListening] = useState(false);

    const navigate = useNavigate();
    const [cart, setCart] = useCart();
    const [auth] = useAuth();
    const recognizerRef = useRef(null);
    const synthRef = useRef(window.speechSynthesis);
    const msgEndRef = useRef(null);

    // Auto scroll messages
    useEffect(() => {
        msgEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Speak text aloud
    const speak = useCallback((text) => {
        synthRef.current?.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.rate = 1.05;
        utter.pitch = 1.1;
        utter.onstart = () => setMascot("speaking");
        utter.onend = () => setMascot("idle");
        synthRef.current?.speak(utter);
    }, []);

    // Add message to chat
    const addMessage = useCallback((role, text) => {
        setMessages((prev) => [...prev, { role, text }]);
    }, []);

    // Send transcript to AI backend
    const processCommand = useCallback(async (text) => {
        setMascot("thinking");
        addMessage("user", text);

        try {
            const { data } = await axios.post(
                "/api/v1/voice/command",
                {
                    command: text,
                    cartCount: cart?.length || 0,
                    isLoggedIn: !!auth?.token,
                    userName: auth?.user?.name || "there",
                },
                auth?.token ? { headers: { Authorization: auth.token } } : {}
            );

            const { reply, action } = data;

            // Execute action returned by AI
            if (action) {
                switch (action.type) {
                    case "NAVIGATE":
                        navigate(action.path);
                        break;
                    case "SEARCH":
                        navigate(`/search?q=${encodeURIComponent(action.query)}`);
                        break;
                    case "ADD_TO_CART":
                        // fetch product and add
                        try {
                            const res = await axios.get(`/api/v1/product/search/${action.query}`);
                            const product = res.data?.[0];
                            if (product) {
                                const updatedCart = [...(cart || []), product];
                                setCart(updatedCart);
                                localStorage.setItem("cart", JSON.stringify(updatedCart));
                                toast.success(`${product.name} added to cart!`);
                            }
                        } catch { }
                        break;
                    case "OPEN_CART":
                        navigate("/cart");
                        break;
                    case "OPEN_GAME":
                        navigate("/game");
                        break;
                    default:
                        break;
                }
            }

            addMessage("bot", reply);
            speak(reply);
        } catch (err) {
            const fallback = "Sorry, I had trouble understanding that. Please try again!";
            addMessage("bot", fallback);
            speak(fallback);
            setMascot("idle");
        }
    }, [cart, auth, navigate, addMessage, speak, setCart]);

    // Start listening
    const startListening = useCallback(() => {
        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            toast.error("Your browser doesn't support voice input. Try Chrome!");
            return;
        }

        const recognizer = new SpeechRecognition();
        recognizer.lang = "en-IN"; // Indian English
        recognizer.continuous = false;
        recognizer.interimResults = true;

        recognizer.onstart = () => {
            setIsListening(true);
            setMascot("listening");
            setTranscript("");
        };

        recognizer.onresult = (e) => {
            const interim = Array.from(e.results)
                .map((r) => r[0].transcript)
                .join("");
            setTranscript(interim);
            if (e.results[e.results.length - 1].isFinal) {
                processCommand(interim.trim());
                setTranscript("");
            }
        };

        recognizer.onerror = () => {
            setIsListening(false);
            setMascot("idle");
            setTranscript("");
        };

        recognizer.onend = () => {
            setIsListening(false);
            if (mascotState === "listening") setMascot("idle");
        };

        recognizerRef.current = recognizer;
        recognizer.start();
    }, [processCommand, mascotState]);

    // Stop listening
    const stopListening = () => {
        recognizerRef.current?.stop();
        setIsListening(false);
        setMascot("idle");
    };

    // Toggle mic
    const toggleMic = () => {
        if (isListening) stopListening();
        else startListening();
    };

    // Close panel
    const closePanel = () => {
        stopListening();
        synthRef.current?.cancel();
        setOpen(false);
        setMascot("idle");
    };

    return (
        <>
            {/* ── Floating mascot button ── */}
            <div
                className={`va-float ${open ? "va-float-open" : ""}`}
                onClick={() => !open && setOpen(true)}
                title="Talk to Threads!"
            >
                <TShirtMascot state={open ? mascotState : "idle"} />
                {!open && <div className="va-float-label">Ask me!</div>}
            </div>

            {/* ── Expanded panel ── */}
            {open && (
                <div className="va-panel">
                    {/* Header */}
                    <div className="va-panel-header">
                        <div className="va-panel-title">
                            <span className="va-panel-name">Threads</span>
                            <span className="va-panel-sub">Fashion Voice Assistant</span>
                        </div>
                        <button className="va-close-btn" onClick={closePanel} aria-label="Close">✕</button>
                    </div>

                    {/* Messages */}
                    <div className="va-messages">
                        {messages.map((m, i) => (
                            <SpeechBubble key={i} text={m.text} isUser={m.role === "user"} />
                        ))}
                        {transcript && (
                            <div className="va-interim">🎙 {transcript}</div>
                        )}
                        <div ref={msgEndRef} />
                    </div>

                    {/* Mascot + mic in panel */}
                    <div className="va-panel-mascot-row">
                        <div className="va-panel-mascot">
                            <TShirtMascot state={mascotState} />
                        </div>
                        <div className="va-panel-controls">
                            <p className="va-status-text">
                                {mascotState === "idle" && "Tap the mic to talk"}
                                {mascotState === "listening" && "Listening…"}
                                {mascotState === "thinking" && "Thinking…"}
                                {mascotState === "speaking" && "Speaking…"}
                            </p>
                            <button
                                className={`va-mic-btn ${isListening ? "va-mic-active" : ""}`}
                                onClick={toggleMic}
                                aria-label={isListening ? "Stop listening" : "Start listening"}
                            >
                                {isListening ? "⏹" : "🎙"}
                            </button>
                            <p className="va-hint">Try: "Show me shirts" · "Go to cart" · "My orders"</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}