import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { productAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { isAuthenticated, isAdmin, addToCart } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await productAPI.getAll();
      setProducts(data.products);
    } catch (err) {
      setError("Failed to load products. Is the Product Service running?");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await productAPI.delete(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed.");
    }
  };

  const handleAddToCart = (product) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    addToCart(product);
  };

  if (loading) return <div className="loading">Loading products</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Products</h1>
        {isAdmin && (
          <button className="btn-add" onClick={() => navigate("/admin/products/new")}>
            + Add Product
          </button>
        )}
      </div>

      {products.length === 0 ? (
        <div className="empty-state">
          <h2>No products yet</h2>
          <p>Products will appear here once added by an admin.</p>
        </div>
      ) : (
        <div className="products-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <img
                className="product-image"
                src={product.imageUrl}
                alt={product.name}
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/300x200?text=No+Image";
                }}
              />
              <div className="product-info">
                <div className="product-category">{product.category}</div>
                <div className="product-name">{product.name}</div>
                <div className="product-description">{product.description}</div>
                <div className="product-footer">
                  <span className="product-price">${parseFloat(product.price).toFixed(2)}</span>
                  <span
                    className={`product-stock ${
                      product.stock === 0 ? "out" : product.stock < 10 ? "low" : ""
                    }`}
                  >
                    {product.stock === 0
                      ? "Out of stock"
                      : `${product.stock} in stock`}
                  </span>
                </div>
                <button
                  className="btn-cart"
                  onClick={() => handleAddToCart(product)}
                  disabled={product.stock === 0}
                >
                  {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                </button>
                {isAdmin && (
                  <button
                    className="btn-remove"
                    style={{ marginTop: "0.5rem" }}
                    onClick={() => handleDelete(product.id)}
                  >
                    🗑 Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
