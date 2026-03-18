# ⚡ ShopZone — Microservices E-Commerce Platform

A full-stack e-commerce application built with a **microservices architecture**. The project includes 3 independent backend services, a React frontend, and uses 3 different data stores — ideal for learning DevOps practices like containerization, orchestration, and CI/CD.

---

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Reference](#api-reference)
- [Key Concepts Demonstrated](#key-concepts-demonstrated)
- [DevOps Notes](#devops-notes)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                        │
│                    http://localhost:5173                     │
└───────┬─────────────────┬─────────────────┬─────────────────┘
        │                 │                 │
        ▼                 ▼                 ▼
┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│  Auth Service │ │Product Service│ │ Order Service  │
│  Port: 5001   │ │  Port: 5002   │ │  Port: 5003   │
│               │ │               │ │               │
│  MongoDB      │ │  PostgreSQL   │ │  MongoDB      │
│               │ │  + Redis      │ │               │
└───────────────┘ └───────────────┘ └──────┬────────┘
                                           │
                            Calls Product Service
                            via HTTP (inter-service)
```

Each service is a completely independent Node.js application with its own:
- Package.json & dependencies
- Database connection
- Environment configuration
- REST API endpoints

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, React Router 6, Axios |
| **Backend** | Node.js, Express.js |
| **Auth DB** | MongoDB (via Mongoose ODM) |
| **Product DB** | PostgreSQL (via Sequelize ORM) |
| **Caching** | Redis (via ioredis) |
| **Order DB** | MongoDB (via Mongoose ODM) |
| **Authentication** | JWT (JSON Web Tokens) |
| **Password Hashing** | bcryptjs |
| **Inter-service Comm** | HTTP/REST (via Axios) |

---

## Project Structure

```
Microservices/
├── auth-service/           # Authentication & Authorization
│   ├── config/
│   │   └── db.js           # MongoDB connection
│   ├── middleware/
│   │   └── auth.js         # JWT verify + role-based access
│   ├── models/
│   │   └── User.js         # User schema (name, email, password, role)
│   ├── routes/
│   │   └── auth.js         # /register, /login, /profile
│   ├── .env
│   ├── package.json
│   └── server.js
│
├── product-service/        # Product Catalog + Caching
│   ├── config/
│   │   ├── db.js           # PostgreSQL (Sequelize) connection
│   │   └── redis.js        # Redis client
│   ├── middleware/
│   │   └── auth.js         # JWT verify + role check
│   ├── models/
│   │   └── Product.js      # Product model (Sequelize)
│   ├── routes/
│   │   └── products.js     # CRUD + cache-aside pattern
│   ├── .env
│   ├── package.json
│   └── server.js           # Auto-seeds sample products
│
├── order-service/          # Order Management
│   ├── config/
│   │   └── db.js           # MongoDB connection
│   ├── middleware/
│   │   └── auth.js         # JWT verify + role check
│   ├── models/
│   │   └── Order.js        # Order schema (items, status, address)
│   ├── routes/
│   │   └── orders.js       # Create/list/update orders
│   ├── .env
│   ├── package.json
│   └── server.js
│
├── frontend/               # React SPA
│   ├── src/
│   │   ├── components/     # UI components
│   │   │   ├── Cart.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Orders.jsx
│   │   │   ├── ProductForm.jsx
│   │   │   ├── Products.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── Register.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Auth + Cart state
│   │   ├── services/
│   │   │   └── api.js      # Axios API clients
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── README.md               # ← You are here
```

---

## Prerequisites

Install the following on your machine before starting:

| Software | Version | Purpose |
|----------|---------|---------|
| **Node.js** | v18+ | Runtime for all services |
| **npm** | v9+ | Package manager |
| **MongoDB** | v6+ | Database for auth-service & order-service |
| **PostgreSQL** | v14+ | Database for product-service |
| **Redis** | v7+ | Caching for product-service |

> **Tip:** You can install MongoDB, PostgreSQL, and Redis as native services, **or** run them via Docker (e.g., `docker run -d -p 27017:27017 mongo`, `docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres`, `docker run -d -p 6379:6379 redis`).

---

## Setup & Installation

### 1. Create the PostgreSQL database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create the database
CREATE DATABASE products_db;

# Exit
\q
```

> MongoDB databases (`auth_db` and `orders_db`) are created automatically when each service first connects.

### 2. Install dependencies for each service

Open **4 separate terminal windows** and run:

```bash
# Terminal 1 — Auth Service
cd auth-service
npm install

# Terminal 2 — Product Service
cd product-service
npm install

# Terminal 3 — Order Service
cd order-service
npm install

# Terminal 4 — Frontend
cd frontend
npm install
```

---

## Environment Variables

Each service has a `.env` file already created. Update values as needed:

### auth-service/.env
```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/auth_db
JWT_SECRET=super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d
```

### product-service/.env
```env
PORT=5002
DB_HOST=localhost
DB_PORT=5432
DB_NAME=products_db
DB_USER=postgres
DB_PASSWORD=postgres
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=super_secret_jwt_key_change_in_production
```

### order-service/.env
```env
PORT=5003
MONGO_URI=mongodb://localhost:27017/orders_db
JWT_SECRET=super_secret_jwt_key_change_in_production
PRODUCT_SERVICE_URL=http://localhost:5002
```

### frontend/.env
```env
VITE_AUTH_SERVICE_URL=http://localhost:5001
VITE_PRODUCT_SERVICE_URL=http://localhost:5002
VITE_ORDER_SERVICE_URL=http://localhost:5003
```

> ⚠️ **Important:** The `JWT_SECRET` must be **identical** across all 3 backend services so tokens issued by auth-service can be verified by product-service and order-service.

---

## Running the Application

Start all 4 services in separate terminals:

```bash
# Terminal 1 — Auth Service
cd auth-service
npm run dev
# Output: [Auth Service] MongoDB connected → Running on port 5001

# Terminal 2 — Product Service
cd product-service
npm run dev
# Output: [Product Service] PostgreSQL connected → Redis connected → Running on port 5002

# Terminal 3 — Order Service
cd order-service
npm run dev
# Output: [Order Service] MongoDB connected → Running on port 5003

# Terminal 4 — Frontend
cd frontend
npm run dev
# Output: VITE ready → http://localhost:5173
```

Open your browser at **http://localhost:5173** 🎉

### Quick Smoke Test (Health Checks)

```bash
curl http://localhost:5001/health   # {"status":"OK","service":"auth-service"}
curl http://localhost:5002/health   # {"status":"OK","service":"product-service"}
curl http://localhost:5003/health   # {"status":"OK","service":"order-service"}
```

---

## API Reference

### Auth Service (`:5001`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ✗ | Register a new user |
| POST | `/api/auth/login` | ✗ | Login, returns JWT token |
| GET | `/api/auth/profile` | ✓ Bearer | Get current user profile |

**Register body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}
```

**Login body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

---

### Product Service (`:5002`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/products` | ✗ | List all products (cached) |
| GET | `/api/products/:id` | ✗ | Get single product (cached) |
| POST | `/api/products` | ✓ Admin | Create product |
| PUT | `/api/products/:id` | ✓ Admin | Update product |
| DELETE | `/api/products/:id` | ✓ Admin | Delete product |

**Create product body:**
```json
{
  "name": "Wireless Mouse",
  "description": "Ergonomic wireless mouse",
  "price": 29.99,
  "category": "Electronics",
  "stock": 100,
  "imageUrl": "https://example.com/mouse.jpg"
}
```

> **Caching:** GET responses include a `source` field (`"cache"` or `"database"`) so you can observe Redis caching in action. Cache TTL = 60 seconds.

---

### Order Service (`:5003`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/orders` | ✓ Bearer | Create order |
| GET | `/api/orders` | ✓ Bearer | List user's orders (admin sees all) |
| GET | `/api/orders/:id` | ✓ Bearer | Get single order |
| PATCH | `/api/orders/:id/status` | ✓ Admin | Update order status |

**Create order body:**
```json
{
  "items": [
    { "productId": "<uuid>", "quantity": 2 },
    { "productId": "<uuid>", "quantity": 1 }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  }
}
```

**Update status body:**
```json
{ "status": "shipped" }
```
Valid statuses: `pending`, `confirmed`, `shipped`, `delivered`, `cancelled`

---

## Key Concepts Demonstrated

| Concept | Where |
|---------|-------|
| **JWT Authentication** | Auth service issues tokens; all services verify them |
| **Password Hashing** | bcrypt with salt rounds in User model |
| **Role-Based Authorization** | `authorize("admin")` middleware on protected routes |
| **Redis Caching** | Cache-aside pattern in product-service (GET reads cache → fallback to DB → populate cache) |
| **Cache Invalidation** | Product writes (POST/PUT/DELETE) invalidate relevant cache keys |
| **Graceful Degradation** | Redis client handles connection failures without crashing |
| **Inter-Service Communication** | Order service calls product service via HTTP to validate products/stock |
| **Multiple Databases** | MongoDB (auth + orders) + PostgreSQL (products) |
| **ORM / ODM** | Sequelize (PostgreSQL) and Mongoose (MongoDB) |
| **Data Seeding** | Product service auto-seeds 6 sample products on first run |
| **Health Checks** | Each service exposes `/health` endpoint |
| **Protected Routes (Frontend)** | ProtectedRoute component redirects unauthenticated users |
| **Client-Side State** | React Context API for auth state + cart (persisted to localStorage) |

---

## DevOps Notes

This project is designed for DevOps practice. Here are some hints for your containerization and orchestration work:

### Services to containerize
1. **auth-service** — Node.js app → needs MongoDB
2. **product-service** — Node.js app → needs PostgreSQL + Redis
3. **order-service** — Node.js app → needs MongoDB + network access to product-service
4. **frontend** — React app → build with `npm run build`, serve static files (e.g., Nginx)

### Databases to run as containers
- **MongoDB** (shared by auth-service and order-service, or separate instances)
- **PostgreSQL** (product-service)
- **Redis** (product-service caching)

### Networking considerations
- Services communicate via HTTP — update the `.env` URLs when deploying to containers
- `PRODUCT_SERVICE_URL` in order-service must point to the product-service container
- `VITE_*` vars in frontend are build-time values (baked into the JS bundle at `npm run build`)

### Health checks
All services expose `GET /health` — useful for container health checks and readiness probes.

### Environment variables
All config is externalized via `.env` files — easy to convert to Docker env vars, ConfigMaps, or secrets.

### Build commands
```bash
# Backend services (no build step needed — run directly with Node.js)
node server.js

# Frontend (build for production)
cd frontend
npm run build
# Output: dist/ directory with static files
```

---

## Testing the Full Flow

1. **Register** — Go to `/register`, create an account (try both "Customer" and "Admin" roles)
2. **Login** — Sign in to get your JWT token (stored in localStorage)
3. **Browse Products** — View the 6 pre-seeded products on the home page
4. **Add to Cart** — Click "Add to Cart" on any product
5. **Checkout** — Go to `/cart`, fill in shipping address, and place the order
6. **View Orders** — Go to `/orders` to see your order history
7. **Admin Actions** — Login as admin to add/delete products and update order statuses

---

## License

This project is for educational and DevOps practice purposes.
