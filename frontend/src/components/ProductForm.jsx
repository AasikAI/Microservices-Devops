import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { productAPI } from "../services/api";

export default function ProductForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    imageUrl: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await productAPI.create({
        ...form,
        price: parseFloat(form.price),
        stock: parseInt(form.stock, 10),
      });
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-form-container">
      <div className="auth-card">
        <h2>Add New Product</h2>
        <p>Fill in the details to add a product to the catalog</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="pname">Product Name</label>
            <input
              id="pname"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Wireless Headphones"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="pdesc">Description</label>
            <textarea
              id="pdesc"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Product description…"
              rows={3}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="pprice">Price ($)</label>
            <input
              id="pprice"
              name="price"
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={handleChange}
              placeholder="29.99"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="pcategory">Category</label>
            <input
              id="pcategory"
              name="category"
              value={form.category}
              onChange={handleChange}
              placeholder="e.g. Electronics, Clothing"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="pstock">Stock</label>
            <input
              id="pstock"
              name="stock"
              type="number"
              min="0"
              value={form.stock}
              onChange={handleChange}
              placeholder="50"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="pimage">Image URL (optional)</label>
            <input
              id="pimage"
              name="imageUrl"
              value={form.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Creating…" : "Create Product"}
          </button>
        </form>
      </div>
    </div>
  );
}
