# Soroco House — Running Guide

> **Frontend-only build** · React 18 · Vite · TypeScript · Tailwind CSS · Redux · Framer Motion

---

## Prerequisites

| Tool | Minimum Version | Check |
|------|----------------|-------|
| Node.js | 18.x or higher | `node --version` |
| npm | 9.x or higher | `npm --version` |

> Download Node.js from [nodejs.org](https://nodejs.org) if not installed.

---

## Quick Start

Open a terminal and run these three commands:

```bash
# 1. Navigate to the frontend folder
cd "C:\Users\Syed Thameemuddin\Desktop\project-soroco\restaurant-order-management\frontend"

# 2. Install dependencies (first time only)
npm install

# 3. Start the development server
npm run dev
```

Then open your browser at:

```
http://localhost:5173
```

The app loads instantly. Any file you save hot-reloads the browser automatically.

---

## All Available Commands

```bash
# Start development server (hot reload)
npm run dev

# Build for production
npm run build

# Preview the production build locally
npm run preview

# Run linter
npm run lint
```

---

## All Routes — Test Directly in Browser

Every route is directly accessible by URL. No navigation required.

### Customer Routes (Public)

| URL | Page |
|-----|------|
| `http://localhost:5173/` | Homepage — Hero, Story, Menu, Atmosphere |
| `http://localhost:5173/menu` | Full Menu — Browse & Order |
| `http://localhost:5173/cart` | Cart — Review Items |
| `http://localhost:5173/checkout` | Checkout — Table & Customer Info |
| `http://localhost:5173/payment` | Payment — PhonePe / Razorpay UI |
| `http://localhost:5173/payment/success` | Payment Successful |
| `http://localhost:5173/payment/failed` | Payment Failed |
| `http://localhost:5173/payment/cancelled` | Payment Cancelled |

### Auth Routes

| URL | Page |
|-----|------|
| `http://localhost:5173/login` | Staff Login |
| `http://localhost:5173/signup` | Create Account |

### Staff Routes (Login Required)

| URL | Page | Access |
|-----|------|--------|
| `http://localhost:5173/orders` | Kitchen Board — Live Orders | Employee + Admin |
| `http://localhost:5173/admin` | Admin Dashboard | Admin only |
| `http://localhost:5173/admin/employee` | Employee Management | Admin only |
| `http://localhost:5173/order-history` | Order History + CSV Export | Admin only |

### Special

| URL | Page |
|-----|------|
| `http://localhost:5173/anything-else` | Custom 404 Page |

---

## Login Credentials

These are the built-in mock credentials for the frontend-only phase:

### Admin Account
```
Email:    admin@soroco.coffee
Password: admin123
```
Access: Admin Dashboard, Employees, Orders, Order History, Menu

### Employee Account
```
Email:    employee@soroco.coffee
Password: employee123
```
Access: Kitchen Orders Board, Menu

---

## Complete User Flow — Step by Step

### Customer Ordering Flow

```
1. Open  http://localhost:5173/
2. Click "Order Now" or "Explore Menu"
3. Browse categories — Hot Luxury Teas, Cold Brew, Frappe, etc.
4. Click any item → customize size, add-ons, quantity
5. Click "Add to Cart"
6. Sticky cart bar appears at bottom → click it or go to /cart
7. Review cart → "Proceed to Checkout"
8. Fill in table number, name, phone → select PhonePe or Razorpay
9. Click "Proceed to Payment"
10. Click "Pay" → see processing → Success page with order number
```

### Admin Flow

```
1. Go to  http://localhost:5173/login
2. Login with  admin@soroco.coffee / admin123
3. Redirects to  /admin  (Dashboard)
4. Click any dashboard card:
   - Employees  → manage staff
   - Orders     → kitchen board
   - History    → full order history + CSV export
   - Menu       → browse menu
```

### Kitchen Staff Flow

```
1. Go to  http://localhost:5173/login
2. Login with  employee@soroco.coffee / employee123
3. Redirects to  /orders  (Kitchen Board)
4. See all live orders grouped by status
5. Click "Start Preparing" → "Mark Prepared" → "Mark Delivered"
```

---

## Project Structure

```
frontend/
├── src/
│   ├── ui/
│   │   ├── navigations/        # Router.tsx — all 15 routes
│   │   ├── screens/            # One folder per page/screen
│   │   │   ├── HomeScreen/
│   │   │   ├── MenuScreen/
│   │   │   ├── CartScreen/
│   │   │   ├── CheckoutScreen/
│   │   │   ├── PaymentScreen/
│   │   │   ├── PaymentSuccessScreen/
│   │   │   ├── PaymentFailedScreen/
│   │   │   ├── PaymentCancelledScreen/
│   │   │   ├── LoginScreen/
│   │   │   ├── SignupScreen/
│   │   │   ├── OrdersScreen/
│   │   │   ├── AdminScreen/
│   │   │   ├── EmployeeScreen/
│   │   │   ├── OrderHistoryScreen/
│   │   │   └── NotFoundScreen/
│   │   └── reusables/          # Shared components
│   │       ├── Navbar/
│   │       ├── Footer/
│   │       ├── FoodCard/
│   │       ├── CartBar/
│   │       ├── Modal/
│   │       ├── BottomSheet/
│   │       ├── AdminLayout/
│   │       ├── StatusBadge/
│   │       ├── QuantityControl/
│   │       ├── EmptyState/
│   │       ├── LoadingSkeleton/
│   │       └── ConfirmDialog/
│   ├── store/
│   │   ├── store.ts            # Redux store
│   │   ├── hooks.ts            # Typed useAppSelector / useAppDispatch
│   │   └── slices/
│   │       ├── cartSlice.ts    # Cart state
│   │       └── authSlice.ts    # Auth state
│   ├── services/
│   │   ├── screens/            # Mock data services
│   │   │   ├── menuScreenService/    # 23 menu items across 6 categories
│   │   │   ├── orderScreenService/   # 5 sample orders
│   │   │   └── employeeScreenService/# 5 sample employees
│   │   └── platform/
│   │       └── authService/    # Mock login / signup
│   ├── types/                  # TypeScript types & enums
│   │   ├── menu/   MenuItemBO
│   │   ├── cart/   CartItemBO
│   │   ├── order/  OrderBO + all status enums
│   │   └── user/   UserBO + role/status enums
│   ├── index.css               # Tailwind + Soroco design tokens
│   └── main.tsx                # App entry point
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

---

## Design System — Key Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `soroco-cream` | `#FAF7F2` | Page background |
| `soroco-parchment` | `#F2EDE3` | Card background |
| `soroco-linen` | `#E8DFD0` | Borders, dividers |
| `soroco-amber` | `#C8956C` | Primary accent, CTAs |
| `soroco-espresso` | `#3D1F10` | Headings, dark elements |
| `soroco-charcoal` | `#1A0F0A` | Body text, hero bg |

---

## Troubleshooting

### Port already in use
If `5173` is taken, Vite picks the next available port automatically.
Or specify one manually:
```bash
npx vite --port 3000
```

### node_modules missing
```bash
npm install
```

### TypeScript `baseUrl` warning in VS Code
Already fixed — `baseUrl` was removed from `tsconfig.json`.
The `@/` path alias is handled by Vite's resolver, not TypeScript's `baseUrl`.

### Page not found on browser refresh
The dev server (`npm run dev`) handles this automatically via Vite's SPA fallback.
For the production build preview (`npm run preview`) it also works.

### White screen / blank page
Open browser DevTools → Console tab and check for errors.
Most common cause: running `npm run preview` without first running `npm run build`.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 |
| Build Tool | Vite 5 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3 |
| State Management | Redux Toolkit |
| Routing | React Router DOM 6 |
| Animations | Framer Motion 11 |
| Icons | Lucide React |
| Fonts | Playfair Display + Inter (Google Fonts) |

---

*Soroco House · Frontend Phase · Local / Mock Data Mode*
