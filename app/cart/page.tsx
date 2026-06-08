"use client";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { cart, removeItem, changeQty, cartTotal, cartCount } = useCart();
  const router = useRouter();
  const shipping = cartTotal >= 150 ? 0 : 12;
  const total = cartTotal + shipping;

  return (
    <main style={{ background: "#fafaf8", minHeight: "100vh" }}>
      <Navbar />
      <div style={{ height: "72px", background: "#0a0a0a" }} />

      <style>{`
        .cart-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }
        @media (min-width: 1024px) {
          .cart-layout {
            grid-template-columns: 1fr 360px;
            gap: 64px;
            align-items: start;
          }
        }
        .cart-item {
          display: grid;
          grid-template-columns: 80px 1fr auto;
          gap: 12px;
          padding: 16px 0;
          border-bottom: 1px solid rgba(0,0,0,0.07);
        }
        @media (min-width: 640px) {
          .cart-item {
            grid-template-columns: 110px 1fr auto;
            gap: 20px;
            padding: 24px 0;
          }
        }
        .item-img {
          width: 80px;
          height: 96px;
          border-radius: 10px;
          overflow: hidden;
          background: #f0ebe3;
          flex-shrink: 0;
        }
        @media (min-width: 640px) {
          .item-img {
            width: 110px;
            height: 132px;
          }
        }
        .item-name {
          font-size: 16px;
        }
        @media (min-width: 640px) {
          .item-name {
            font-size: 20px;
          }
        }
        .item-price {
          font-size: 15px;
        }
        @media (min-width: 640px) {
          .item-price {
            font-size: 20px;
          }
        }
        .summary-box {
          background: #f5f2ec;
          border-radius: 18px;
          padding: 24px;
        }
        @media (min-width: 1024px) {
          .summary-box {
            position: sticky;
            top: 96px;
            padding: 36px;
          }
        }
        .qty-btn {
          width: 32px;
          height: 32px;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 18px;
          color: #0a0a0a;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          transition: background 0.15s;
        }
        .qty-btn:hover { background: rgba(0,0,0,0.06); }
        .checkout-btn {
          width: 100%;
          background: #0a0a0a;
          color: #fafaf8;
          border: none;
          padding: 16px;
          font-size: 11px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          cursor: pointer;
          border-radius: 12px;
          font-family: DM Sans, sans-serif;
          transition: background 0.2s;
          margin-bottom: 12px;
        }
        .checkout-btn:hover { background: #222; }
        .remove-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #bbb;
          font-size: 13px;
          padding: 0;
          transition: color 0.15s;
          display: flex;
          align-items: center;
          gap: 3px;
        }
        .remove-btn:hover { color: #c0392b; }
      `}</style>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 16px 80px" }}>

        {/* Header */}
        <div style={{ marginBottom: "36px" }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", color: "#c9a96e", marginBottom: "10px" }}>
            Your Selection
          </p>
          <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 300, color: "#0a0a0a", margin: 0, lineHeight: 1.1 }}>
            Shopping <em>Cart</em>
            {cartCount > 0 && (
              <span style={{ fontSize: "16px", color: "#aaa", marginLeft: "14px", fontFamily: "DM Sans, sans-serif", fontStyle: "normal" }}>
                ({cartCount} {cartCount === 1 ? "item" : "items"})
              </span>
            )}
          </h1>
        </div>

        {/* Empty State */}
        {cart.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: "center", padding: "80px 0" }}
          >
            <div style={{ fontSize: "56px", marginBottom: "20px" }}>🛍️</div>
            <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "28px", fontWeight: 300, color: "#0a0a0a", marginBottom: "12px" }}>
              Your cart is empty
            </h2>
            <p style={{ color: "#8a8680", marginBottom: "32px", fontSize: "14px" }}>
              Browse our collection and add items you love.
            </p>
            <Link
              href="/shop"
              style={{
                display: "inline-block",
                background: "#0a0a0a",
                color: "#fafaf8",
                padding: "14px 40px",
                fontSize: "11px",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                textDecoration: "none",
                borderRadius: "10px",
              }}
            >
              Browse Shop
            </Link>
          </motion.div>
        ) : (
          <div className="cart-layout">

            {/* ── Cart Items ── */}
            <div>
              <AnimatePresence>
                {cart.map((item, i) => (
                  <motion.div
                    key={`${item.id}-${item.size}-${item.color}`}
                    className="cart-item"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0, overflow: "hidden" }}
                    transition={{ delay: i * 0.04 }}
                  >
                    {/* Thumbnail */}
                    <div className="item-img" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {item.image && (item.image.includes("http") || item.image.startsWith("/")) ? (
                        <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <span style={{ fontSize: "32px" }}>{item.image ?? "🛍️"}</span>
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", minWidth: 0 }}>
                      <div>
                        <p style={{ fontSize: "9px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#c9a96e", margin: "0 0 4px" }}>
                          {item.category}
                        </p>
                        <h3
                          className="item-name"
                          style={{ fontFamily: "Cormorant Garamond, serif", fontWeight: 400, color: "#0a0a0a", margin: "0 0 6px", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                        >
                          {item.name}
                        </h3>
                        <p style={{ fontSize: "11px", color: "#aaa", margin: 0 }}>
                          {item.size} · {item.color}
                        </p>
                      </div>

                      {/* Qty controls */}
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "14px" }}>
                        <div style={{ display: "flex", alignItems: "center", border: "1px solid rgba(0,0,0,0.12)", borderRadius: "8px", overflow: "hidden" }}>
                          <button
                            className="qty-btn"
                            onClick={() => changeQty(item.id, item.size, item.color, item.qty - 1)}
                            aria-label="Decrease"
                          >
                            −
                          </button>
                          <span style={{ minWidth: "28px", textAlign: "center", fontSize: "13px", fontFamily: "DM Sans, sans-serif" }}>
                            {item.qty}
                          </span>
                          <button
                            className="qty-btn"
                            onClick={() => changeQty(item.id, item.size, item.color, item.qty + 1)}
                            aria-label="Increase"
                          >
                            +
                          </button>
                        </div>
                        <button
                          className="remove-btn"
                          onClick={() => removeItem(item.id, item.size, item.color)}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Line Price */}
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div
                        className="item-price"
                        style={{ fontFamily: "Cormorant Garamond, serif", color: "#0a0a0a", whiteSpace: "nowrap" }}
                      >
                        ৳{(item.price * item.qty).toFixed(0)}
                      </div>
                      {item.qty > 1 && (
                        <div style={{ fontSize: "11px", color: "#aaa", marginTop: "3px" }}>
                          ৳{item.price} ea.
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              <div style={{ marginTop: "20px" }}>
                <Link href="/shop" style={{ fontSize: "12px", color: "#8a8680", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="19 12 5 12"/><polyline points="11 18 5 12 11 6"/></svg>
                  Continue Shopping
                </Link>
              </div>
            </div>

            {/* ── Order Summary ── */}
            <motion.div
              className="summary-box"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <p style={{ fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#8a8680", marginBottom: "24px" }}>
                Order Summary
              </p>

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "14px", color: "#3a3835" }}>
                <span>Subtotal</span>
                <span>৳{cartTotal.toFixed(0)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px", color: "#3a3835" }}>
                <span>Shipping</span>
                <span style={{ color: shipping === 0 ? "#c9a96e" : "#3a3835" }}>
                  {shipping === 0 ? "Free" : `৳${shipping}`}
                </span>
              </div>

              {shipping > 0 && (
                <p style={{ fontSize: "11px", color: "#c9a96e", marginBottom: "12px" }}>
                  Add ৳{(150 - cartTotal).toFixed(0)} more for free shipping!
                </p>
              )}

              <div style={{ height: "1px", background: "rgba(0,0,0,0.1)", margin: "16px 0" }} />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
                <span style={{ fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#8a8680" }}>Total</span>
                <span style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "30px", color: "#0a0a0a" }}>
                  ৳{total.toFixed(0)}
                </span>
              </div>

              <button className="checkout-btn" onClick={() => router.push("/checkout")}>
                Proceed to Checkout
              </button>

              <div style={{ textAlign: "center", fontSize: "11px", color: "#aaa", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                Secure checkout · Free shipping over ৳150
              </div>
            </motion.div>

          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
