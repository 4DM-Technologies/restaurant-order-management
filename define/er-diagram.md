# Restaurant Order Management ER

Matches the SQLAlchemy ORM in `backend/src/repositories/schema/`
(`account.py`, `menu_item.py`, `order.py`, `order_item.py`, `enums.py`).

- Every PK is a UUID4 (`*_uuid`).
- Every table also carries a small integer surrogate id (`*_id`) that is
  `INTEGER UNIQUE NOT NULL`.
- All ENUMs are stored as portable `VARCHAR` (`native_enum=False`).
- `created_at` defaults to `datetime.now(UTC)`; `updated_at` is set by
  SQLAlchemy `onupdate`. `created_by` defaults to `SYSTEM`.
- Mermaid version: [`er-diagram.mmd`](./er-diagram.mmd).

## Tables

### accounts

Automatically created for the ordering flow (table order number) — staff only
(no customer accounts).

| column | constraints |
| :---: | :---: |
| account_uuid | pk, uuid, NOT NULL |
| account_id | INT, UNIQUE, NOT NULL |
| account_name | VARCHAR(255), NOT NULL |
| account_email | VARCHAR(255), UNIQUE, NOT NULL |
| account_password | TEXT, NULL (NULL until the employee completes /signup) |
| account_role | ENUM('employee', 'admin'), NOT NULL |
| created_at | TIMESTAMP, NOT NULL |
| created_by | VARCHAR(255), NOT NULL, DEFAULT 'SYSTEM' |
| updated_at | TIMESTAMP, NULL |
| updated_by | VARCHAR(255), NULL |

### menu

| column | constraints |
| :---: | :---: |
| menu_uuid | pk, uuid, NOT NULL |
| menu_id | INT, UNIQUE, NOT NULL |
| category | VARCHAR(100), NOT NULL (free-form string; display order fixed in `menu_service.CATEGORY_ORDER`) |
| item_name | VARCHAR(255), NOT NULL |
| item_description | TEXT, NULL |
| standard_price | DECIMAL(10,2), NULL |
| small_price | DECIMAL(10,2), NULL |
| large_price | DECIMAL(10,2), NULL |
| image_url | VARCHAR(500), NULL |
| is_available | BOOLEAN, NOT NULL, DEFAULT TRUE |
| created_at | TIMESTAMP, NOT NULL |
| created_by | VARCHAR(255), NOT NULL, DEFAULT 'SYSTEM' |
| updated_at | TIMESTAMP, NULL |
| updated_by | VARCHAR(255), NULL |

> At least one price column should be set; `payment_service` falls back to
> `standard_price` when the selected size is unpriced.

### orders

| column | constraints |
| :---: | :---: |
| order_uuid | pk, uuid, NOT NULL |
| order_id | INT, UNIQUE, NOT NULL |
| order_number | INT, UNIQUE, NOT NULL (customer-facing order number) |
| order_ref | VARCHAR(255), UNIQUE, NULL (client-generated payment reference → idempotency key) |
| table_name | VARCHAR(255), NOT NULL |
| customer_name | VARCHAR(255), NOT NULL |
| phone_number | VARCHAR(50), NOT NULL |
| payment_method | ENUM('phonepay', 'razorpay'), NOT NULL |
| payment_status | ENUM('success', 'failed', 'cancelled'), NOT NULL |
| payment_transaction_id | VARCHAR(255), NULL |
| kitchen_status | ENUM('in_queue', 'preparing', 'prepared', 'delivered'), NOT NULL, DEFAULT 'in_queue' |
| order_status | ENUM('ordered', 'delivered'), NOT NULL, DEFAULT 'ordered' |
| total_price | DECIMAL(10,2), NOT NULL (subtotal + tax) |
| tax | DECIMAL(10,2), NOT NULL, DEFAULT 0 (5% GST, `TAX_RATE = 0.05`) |
| created_at | TIMESTAMP, NOT NULL |
| created_by | VARCHAR(255), NOT NULL, DEFAULT 'SYSTEM' |
| updated_at | TIMESTAMP, NULL |
| updated_by | VARCHAR(255), NULL |

### order_items

| column | constraints |
| :---: | :---: |
| order_item_uuid | pk, uuid, NOT NULL |
| order_item_id | INT, UNIQUE, NOT NULL |
| order_uuid | FK → orders.order_uuid, ON DELETE CASCADE, NOT NULL |
| menu_uuid | FK → menu.menu_uuid, NOT NULL |
| selected_size | ENUM('standard', 'small', 'large'), NULL |
| quantity | INT, NOT NULL |
| unit_price | DECIMAL(10,2), NOT NULL (price snapshot at order time) |
| line_total | DECIMAL(10,2), NOT NULL (unit_price × quantity) |

---

## Relationships

- `orders` 1 ── N `order_items` — one order has many line items; deleting an
  order cascades to its items (`cascade="all, delete-orphan"`,
  `ondelete="CASCADE"`).
- `menu` 1 ── N `order_items` — one menu item appears in many line items across
  orders.
- `orders` N ── M `menu` — resolved through `order_items`.
- `accounts` has no FK relationships (staff identity only).

---

## Sample Data

### accounts Data (from `backend/seed_data/accounts.json`)

| account_id | account_name | account_email | account_role | account_password | created_by |
| :---: | :---: | :---: | :---: | :---: | :---: |
| 1 | Thameem | thameem@test.com | admin | bcrypt hash | SEED |
| 2 | Soroco Employee | employee@test.com | employee | NULL (set via /signup) | SEED |

### menu Data (subset of `backend/seed_data/menu_items.json`)

| menu_id | category | item_name | standard_price | small_price | large_price | is_available |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 1 | Hot Luxury Teas | Darjeeling First Flush | 280.00 | NULL | NULL | TRUE |
| 6 | Hot Luxury Teas | Exotic Spice Chai | 200.00 | NULL | NULL | TRUE |
| 9 | Cold Brew | Signature Cold Brew | 220.00 | 220.00 | 320.00 | TRUE |
| 12 | Filter Coffee | The Brewing Edge | 180.00 | 180.00 | 220.00 | TRUE |

### orders Data

| order_id | order_number | order_ref | table_name | customer_name | payment_method | payment_status | kitchen_status | order_status | total_price | tax |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 1 | 1 | seed-ord-0001 | A1 | Alex | phonepay | success | delivered | delivered | 320.00 | 0.00 |
| 2 | 2 | seed-ord-0002 | B2 | Sam | razorpay | success | in_queue | ordered | 180.00 | 0.00 |

### order_items Data

| order_item_id | order_uuid | menu_uuid | selected_size | quantity | unit_price | line_total |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 1 | (order 1) | (menu 1) | NULL | 2 | 140.00 | 280.00 |
| 2 | (order 1) | (menu 13) | NULL | 1 | 40.00 | 40.00 |
| 3 | (order 2) | (menu 9) | large | 1 | 180.00 | 180.00 |

*(Live-seed order rows come from `backend/seed_data/orders.json` +
`order_items.json` and are inserted only when the matching `order_number` is
absent.)*