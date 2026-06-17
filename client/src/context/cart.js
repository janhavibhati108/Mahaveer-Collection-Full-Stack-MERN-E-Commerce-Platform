import { useState, useContext, createContext, useEffect } from "react";
import { useAuth } from "./auth";

const CartContext = createContext();

const CartProvider = ({ children }) => {
    const [cart, setCartState] = useState([]);
    const [auth] = useAuth();

    // Cart key is per-user — "cart_<userId>" or "cart_guest" if not logged in
    const cartKey = auth?.user?._id ? `cart_${auth.user._id}` : "cart_guest";

    // Load the correct cart whenever the user changes (login/logout)
    useEffect(() => {
        const saved = localStorage.getItem(cartKey);
        setCartState(saved ? JSON.parse(saved) : []);
    }, [cartKey]);

    // Wrap setCart so every update also saves to the right localStorage key
    const setCart = (newCart) => {
        const value = typeof newCart === "function" ? newCart(cart) : newCart;
        setCartState(value);
        localStorage.setItem(cartKey, JSON.stringify(value));
    };

    return (
        <CartContext.Provider value={[cart, setCart]}>
            {children}
        </CartContext.Provider>
    );
};

const useCart = () => useContext(CartContext);

export { useCart, CartProvider };