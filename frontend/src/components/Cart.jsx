import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { orderAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, clearCart, cartTotal } = useAuth();
  const navigate = useNavigate();
  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAddressChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const orderData = {
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        shippingAddress: address,
      };

      await orderAPI.create(orderData);
      clearCart();
      navigate("/orders");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to place order.");
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="cart-container">
        <div className="cart-empty">
          <h2>Your cart is empty</h2>
          <p>Browse products and add items to get started.</p>
          <button
            className="btn-primary"
            style={{ maxWidth: "200px", margin: "1rem auto" }}
            onClick={() => navigate("/")}
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="page-header">
        <h1>Shopping Cart</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="cart-items">
        {cart.map((item) => (
          <div key={item.productId} className="cart-item">
            <img
              className="cart-item-image"
              src={item.imageUrl}
              alt={item.productName}
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/80x80?text=No+Image";
              }}
            />
            <div className="cart-item-details">
              <div className="cart-item-name">{item.productName}</div>
              <div className="cart-item-price">${item.price.toFixed(2)}</div>
            </div>
            <div className="cart-item-qty">
              <button
                className="qty-btn"
                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
              >
                −
              </button>
              <span>{item.quantity}</span>
              <button
                className="qty-btn"
                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
              >
                +
              </button>
            </div>
            <div style={{ fontWeight: 600, minWidth: "70px", textAlign: "right" }}>
              ${(item.price * item.quantity).toFixed(2)}
            </div>
            <button
              className="btn-remove"
              onClick={() => removeFromCart(item.productId)}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <h3>Order Summary</h3>
        <div className="cart-total">
          <span>Total</span>
          <span className="amount">${cartTotal.toFixed(2)}</span>
        </div>

        <form className="shipping-form" onSubmit={handleCheckout}>
          <h4>Shipping Address</h4>
          <div className="shipping-grid">
            <div className="form-group full-width">
              <input
                name="street"
                value={address.street}
                onChange={handleAddressChange}
                placeholder="Street Address"
                required
              />
            </div>
            <div className="form-group">
              <input
                name="city"
                value={address.city}
                onChange={handleAddressChange}
                placeholder="City"
                required
              />
            </div>
            <div className="form-group">
              <input
                name="state"
                value={address.state}
                onChange={handleAddressChange}
                placeholder="State"
                required
              />
            </div>
            <div className="form-group">
              <input
                name="zipCode"
                value={address.zipCode}
                onChange={handleAddressChange}
                placeholder="ZIP Code"
                required
              />
            </div>
            <div className="form-group">
              <input
                name="country"
                value={address.country}
                onChange={handleAddressChange}
                placeholder="Country"
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-checkout" disabled={loading}>
            {loading ? "Placing order…" : `Place Order — $${cartTotal.toFixed(2)}`}
          </button>
        </form>
      </div>
    </div>
  );
}
