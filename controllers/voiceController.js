// controllers/voiceController.js
// controllers/voiceController.js
// Rule-based voice assistant — no API key needed, works offline

// ── Intent matching ───────────────────────────────────────────────────────────
// controllers/voiceController.js

function parseCommand(text) {
    const t = text.toLowerCase().trim();

    // ========================
    // GREETINGS
    // ========================
    if (/^(hi|hello|hey|hiya|howdy|good morning|good evening|good afternoon)/.test(t)) {
        return {
            reply:
                "Hello! Welcome to Mahaveer Collection. I can help you search products, find outfits, track orders, manage your cart, and discover discounts.",
            action: null,
        };
    }

    // ========================
    // PRODUCT SEARCH
    // ========================
    const searchPatterns = [
        /show me (.+)/,
        /find (.+)/,
        /search (.+)/,
        /look for (.+)/,
        /i want (.+)/,
        /i need (.+)/,
        /get me (.+)/,
        /display (.+)/,
    ];

    for (const pattern of searchPatterns) {
        const match = t.match(pattern);

        if (match) {
            return {
                reply: `Searching for ${match[1]}...`,
                action: {
                    type: "SEARCH",
                    query: match[1],
                },
            };
        }
    }

    // ========================
    // MEN
    // ========================
    if (/\b(men|mens|male|boys)\b/.test(t)) {
        return {
            reply: "Showing men's collection.",
            action: {
                type: "SEARCH",
                query: "men",
            },
        };
    }

    // ========================
    // WOMEN
    // ========================
    if (/\b(women|ladies|female|girls)\b/.test(t)) {
        return {
            reply: "Showing women's collection.",
            action: {
                type: "SEARCH",
                query: "women",
            },
        };
    }

    // ========================
    // KIDS
    // ========================
    if (/\b(kids|children|child|baby|babies)\b/.test(t)) {
        return {
            reply: "Showing kids collection.",
            action: {
                type: "SEARCH",
                query: "kids",
            },
        };
    }

    // ========================
    // SHIRTS
    // ========================
    if (/\b(shirt|shirts|top|tops|tshirt|t-shirt|blouse)\b/.test(t)) {
        return {
            reply: "Searching for shirts and tops.",
            action: {
                type: "SEARCH",
                query: "shirt",
            },
        };
    }

    // ========================
    // DRESSES
    // ========================
    if (/\b(dress|dresses|gown|frock)\b/.test(t)) {
        return {
            reply: "Searching for dresses.",
            action: {
                type: "SEARCH",
                query: "dress",
            },
        };
    }

    // ========================
    // JEANS
    // ========================
    if (/\b(jeans|jean|denim|pant|pants|trouser)\b/.test(t)) {
        return {
            reply: "Searching for jeans and trousers.",
            action: {
                type: "SEARCH",
                query: "jeans",
            },
        };
    }

    // ========================
    // JACKETS
    // ========================
    if (/\b(jacket|hoodie|coat|sweater|cardigan)\b/.test(t)) {
        return {
            reply: "Searching for jackets and hoodies.",
            action: {
                type: "SEARCH",
                query: "jacket",
            },
        };
    }

    // ========================
    // COLORS
    // ========================
    const colors = [
        "black",
        "white",
        "red",
        "blue",
        "green",
        "yellow",
        "pink",
        "purple",
        "orange",
        "grey",
        "gray",
        "brown",
        "navy",
    ];

    const foundColor = colors.find((c) => t.includes(c));

    if (foundColor) {
        return {
            reply: `Searching for ${foundColor} colored products.`,
            action: {
                type: "SEARCH",
                query: foundColor,
            },
        };
    }

    // ========================
    // SIZE
    // ========================
    const sizeMatch = t.match(/\b(xs|s|m|l|xl|xxl|xxxl)\b/);

    if (sizeMatch) {
        return {
            reply: `Showing size ${sizeMatch[1].toUpperCase()} products.`,
            action: {
                type: "SEARCH",
                query: sizeMatch[1],
            },
        };
    }

    // ========================
    // PRICE RANGE
    // ========================
    const priceMatch = t.match(/under\s+(\d+)/);

    if (priceMatch) {
        return {
            reply: `Searching products under ₹${priceMatch[1]}.`,
            action: {
                type: "PRICE_FILTER",
                maxPrice: Number(priceMatch[1]),
            },
        };
    }

    // ========================
    // ADD TO CART
    // ========================
    const addMatch = t.match(
        /(?:add|put)\s+(.+?)\s+(?:to|into)\s+(?:my\s+)?cart/
    );

    if (addMatch) {
        return {
            reply: `Adding ${addMatch[1]} to your cart.`,
            action: {
                type: "ADD_TO_CART",
                query: addMatch[1],
            },
        };
    }

    // ========================
    // CART
    // ========================
    if (/\b(cart|basket|bag|checkout)\b/.test(t)) {
        return {
            reply: "Opening your cart.",
            action: {
                type: "OPEN_CART",
            },
        };
    }

    // ========================
    // ORDERS
    // ========================
    if (
        /\b(order|orders|track|delivery|shipment|where is my order)\b/.test(t)
    ) {
        return {
            reply: "Opening your orders page.",
            action: {
                type: "NAVIGATE",
                path: "/dashboard/user/orders",
            },
        };
    }

    // ========================
    // DISCOUNT GAME
    // ========================
    if (/\b(game|discount|coupon|offer|reward)\b/.test(t)) {
        return {
            reply:
                "Let's play Fashion Match and earn a discount coupon.",
            action: {
                type: "OPEN_GAME",
            },
        };
    }

    // ========================
    // HOME
    // ========================
    if (/\b(home|homepage|main page)\b/.test(t)) {
        return {
            reply: "Taking you to the homepage.",
            action: {
                type: "NAVIGATE",
                path: "/",
            },
        };
    }

    // ========================
    // HELP
    // ========================
    if (/\b(help|commands|what can you do)\b/.test(t)) {
        return {
            reply:
                "You can ask me things like: Show black shirts, Find dresses under 1500 rupees, Open my cart, Track my order, Show men's collection, Play discount game.",
            action: null,
        };
    }

    // ========================
    // THANKS
    // ========================
    if (/\b(thanks|thank you|awesome|great)\b/.test(t)) {
        return {
            reply:
                "You're welcome. Happy shopping at Mahaveer Collection.",
            action: null,
        };
    }

    // ========================
    // FALLBACK
    // ========================
    return {
        reply:
            "Sorry, I didn't understand that. Try saying 'Show black shirts under 1000 rupees', 'Open my cart', 'Track my order', or 'Show women's dresses'.",
        action: null,
    };
}

export default parseCommand;
// ── POST /api/v1/voice/command ────────────────────────────────────────────────
export const handleVoiceCommand = async (req, res) => {
    try {
        const { command, userName } = req.body;

        if (!command?.trim()) {
            return res.json({ reply: "I didn't catch that. Could you try again?", action: null });
        }

        const result = parseCommand(command);

        res.json({
            success: true,
            reply: result.reply,
            action: result.action,
        });

    } catch (err) {
        console.error("Voice command error:", err.message);
        res.status(500).json({
            success: false,
            reply: "I'm having a moment! Please try again.",
            action: null,
        });
    }
};