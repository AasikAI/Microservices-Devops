import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { isAuthenticated, isAdmin, user, logout, cartCount } = useAuth();
  const location = useLocation();

  const isActive = (path) => (location.pathname === path ? "nav-link active" : "nav-link");

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          ⚡ ShopZone
        </Link>

        <div className="navbar-links">
          <Link to="/" className={isActive("/")}>
            Products
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/cart" className={isActive("/cart")}>
                Cart
                {cartCount > 0 && <span className="nav-badge">{cartCount}</span>}
              </Link>
              <Link to="/orders" className={isActive("/orders")}>
                Orders
              </Link>
              {isAdmin && (
                <Link to="/admin/products/new" className={isActive("/admin/products/new")}>
                  + Add Product
                </Link>
              )}
              <div className="nav-user">
                {isAdmin && <span className="nav-role">Admin</span>}
                <span className="nav-link" style={{ cursor: "default" }}>
                  {user?.email}
                </span>
                <button className="btn-logout" onClick={logout}>
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className={isActive("/login")}>
                Login
              </Link>
              <Link to="/register" className={isActive("/register")}>
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
