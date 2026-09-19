# SOROCO HOUSE — COMPLETE FRONTEND BUILD PROMPT

## 1. OBJECTIVE

Build the **complete, production-quality frontend** for the Soroco House Restaurant Ordering System in the existing repository.

This is a **frontend-only implementation**.

The backend/API integration will be connected later.

For this phase:

* Use frontend/local/mock data.
* Build the complete UI and UX.
* Build all routes.
* Build all interactions.
* Build all navigation.
* Build all states.
* Build responsive behavior.
* Build the visual system.
* Keep the frontend architecture clean and API-ready.
* Do NOT implement backend functionality.
* Do NOT spend time building backend APIs.

The final result should feel like a **real premium restaurant ordering product**, not a prototype.

---

# 2. REPOSITORY

Repository:

`https://github.com/AI-Tech-Star/restaurant-order-management`

Branch:

`feature/ROM-11`

Frontend location:

```text
existing frontend folder
```

First inspect the repository completely.

Understand:

* Existing frontend structure
* React setup
* TypeScript setup
* Routing
* Components
* Styles
* Assets
* Dependencies
* Existing design system
* Existing conventions
* Existing reusable components

Then implement the frontend inside the existing architecture.

### DO NOT

* Create another repository
* Create another frontend project
* Move the frontend
* Replace the architecture unnecessarily
* Delete useful existing functionality
* Destroy working functionality
* Introduce unnecessary dependencies

Reuse and extend the existing architecture wherever practical.

---

# 3. DEVELOPMENT STANDARDS

I will provide a separate development standards/skills document.

Before implementation:

1. Read the standards document.
2. Treat it as mandatory.
3. Follow its frontend architecture requirements.
4. Follow its coding standards.
5. Follow its UX requirements.
6. Follow its accessibility requirements.
7. Follow its performance requirements.
8. Reuse existing project conventions where appropriate.

The standards document defines:

> HOW the frontend should be built.

This prompt defines:

> WHAT the frontend should contain.

---

# 4. PRIMARY VISUAL REFERENCE — SOROCO

Use the existing Soroco website as the **primary visual and branding reference**:

`https://www.soroco.coffee/`

Study its visual language before designing.

The new application should feel like it belongs to the same Soroco ecosystem.

Preserve the characteristics such as:

* Warm earthy colors
* Coffee-inspired tones
* Cream/off-white surfaces
* Warm neutral colors
* Elegant typography
* Premium café atmosphere
* Editorial layouts
* Large imagery
* Sophisticated whitespace
* Calm premium visual hierarchy
* Natural photography
* Strong typography
* Minimal but expressive design

However:

## DO NOT COPY THE SOROCO WEBSITE.

Do not simply reproduce its pages.

Instead create:

> **Soroco House visual identity + premium restaurant ordering UX + modern 2026 product experience.**

The functionality and interaction model must be **new and purpose-built for restaurant ordering**.

---

# 5. DESIGN PHILOSOPHY

The frontend should feel like:

> A premium restaurant website combined with a beautifully designed modern ordering application.

It should NOT feel like:

* Swiggy
* Zomato
* Generic food delivery software
* Generic Bootstrap website
* Generic AI-generated website
* Generic ecommerce template
* Generic admin dashboard
* Basic CRUD application

The customer experience should feel:

* Premium
* Warm
* Modern
* Immersive
* Fast
* Visual
* Sophisticated
* Easy
* Mobile-first
* Gen-Z friendly
* Restaurant-specific

---

# 6. IMPORTANT — VISUAL QUALITY

Do not stop after making the application technically functional.

The visual quality is extremely important.

Every page should look intentionally designed.

Pay attention to:

* Typography
* Font hierarchy
* Image composition
* Spacing
* Alignment
* Card proportions
* Border radius
* Shadows
* Background textures
* Section transitions
* Button shapes
* Icon placement
* Hover states
* Mobile spacing
* Visual rhythm

Avoid the typical:

> "AI-generated website" look.

Do not fill every section with cards.

Do not put rounded cards everywhere.

Do not use excessive gradients.

Do not use random colors.

Do not make every element animated.

Use strong editorial composition and whitespace.

---

# 7. MODERN 2026 INTERACTION DESIGN

The application should feel modern and polished.

Use appropriate:

* Smooth scrolling
* Scroll reveal
* Image reveal
* Subtle parallax
* Sticky navigation
* Sticky category navigation
* Horizontal category scrolling
* Animated cart
* Micro-interactions
* Hover effects
* Button feedback
* Page transitions
* Modal transitions
* Bottom sheets
* Quantity animations
* Add-to-cart feedback
* Success animations
* Progressive image loading

Animations must be:

> Smooth + subtle + intentional.

Avoid:

* Excessive bouncing
* Random spinning
* Long animations
* Heavy transitions
* Animating everything
* Distracting effects

Respect:

```text
prefers-reduced-motion
```

---

# 8. MOBILE-FIRST

This is a QR-based restaurant ordering application.

The customer will primarily open it on a phone after scanning a QR code.

Therefore:

> MOBILE UX IS THE HIGHEST PRIORITY.

Optimize carefully for:

```text
320px
375px
390px
430px
```

Then support:

```text
768px
1024px
1280px
1440px+
```

There must be:

* No horizontal overflow
* No clipped content
* No overlapping elements
* No tiny buttons
* No unusable forms
* No broken modals
* No awkward spacing
* No inaccessible controls

Touch targets should be comfortable.

---

# 9. MENU IMAGES — IMPORTANT

I will provide the **actual restaurant menu images**.

These are the source of truth for menu content.

Read the uploaded menu images and extract where available:

* Food name
* Drink name
* Category
* Description
* Price
* Size
* Variant
* Add-ons
* Veg/non-veg indicator
* Bestseller/special indicator
* Availability

Do NOT invent menu prices when the menu images contain the actual prices.

Do NOT invent menu items when the actual menu information is available.

If multiple menu images are provided:

* Treat them as one complete menu
* Avoid duplicates
* Preserve categories
* Preserve actual pricing
* Preserve actual names

---

# 10. FOOD IMAGE GENERATION

The menu images I provide may contain the menu information but may not contain suitable website-quality food photography.

For every menu item:

### If a suitable existing Soroco/Soroco House image exists

Reuse it.

### If a suitable image does not exist

Generate a suitable high-quality food image or use an appropriate visual asset.

The image must represent the **actual dish**.

Example:

```text
Menu:
Truffle Mushroom Pasta

Image:
Premium realistic photograph of truffle mushroom pasta.
```

Do NOT use an unrelated food image just because it looks attractive.

The image must correspond to the dish.

---

# 11. FOOD PHOTOGRAPHY STYLE

All food imagery should feel like it belongs to the same professional restaurant photoshoot.

Use:

* Realistic food
* Premium plating
* Warm natural lighting
* Editorial photography
* Sophisticated composition
* Natural shadows
* High detail
* Warm café atmosphere
* Premium restaurant presentation
* Consistent visual language

Avoid:

* Watermarks
* Text inside images
* Logos inside food images
* Obvious AI artifacts
* Unrealistic food
* Oversaturated colors
* Cheap stock-photo appearance

Food imagery should feel premium and believable.

---

# 12. BACKGROUND / ATMOSPHERE IMAGES

Use the existing Soroco assets where appropriate.

Inspect the repository for:

* Restaurant images
* Café interiors
* Food images
* Background images
* Brand imagery
* Videos
* Logos
* Icons
* Fonts

If an existing asset works well:

> Reuse it.

If a suitable asset does not exist:

> Generate/source a visually appropriate asset.

You may create:

* Restaurant atmosphere backgrounds
* Café interiors
* Food backgrounds
* Editorial textures
* Hero imagery
* Section imagery

Use your design judgment.

The goal is not to use as many images as possible.

The goal is:

> Use the right image in the right place.

---

# 13. IMAGE SYSTEM

All food images must be replaceable later.

Never hardcode image paths inside `FoodCard`.

Use centralized data.

Example:

```ts
{
  id: "dish-001",
  name: "Actual Food Name",
  price: 299,
  category: "Breakfast",
  image: "/images/food/dish-001.webp"
}
```

The component should consume:

```ts
item.image
```

Later I should be able to replace the image without modifying the component.

---

# 14. DATA-DRIVEN FRONTEND

Menu content must be data-driven.

Use:

```text
Menu Data
    ↓
Categories
    ↓
Menu Items
    ↓
FoodCard
```

Do not repeatedly hardcode menu items inside JSX.

The UI should dynamically render:

* Categories
* Food items
* Prices
* Images
* Descriptions
* Availability
* Variants
* Add-ons
* Badges

Keep all frontend/mock data centralized.

---

# 15. FRONTEND LOCAL DATA

Use clean frontend/local data for this phase.

Examples:

```text
menuData
ordersData
employeesData
usersData
```

Do not scatter mock objects throughout components.

Keep the data layer replaceable so backend APIs can later replace the local implementation.

---

# 16. API-READY ARCHITECTURE

Although this phase is frontend-only, structure the code so API integration later is easy.

Preferred architecture:

```text
Component
    ↓
Hook / State
    ↓
Service / Data Layer
    ↓
Local Mock Data
```

Examples:

```ts
getMenu()
getOrders()
getEmployees()
login()
signup()
updateOrder()
updateMenuItem()
deleteEmployee()
```

For now these can operate against local state/data.

Later they should be replaceable with API calls without rewriting the UI.

---

# 17. ROUTING — MANDATORY

Implement proper frontend routing.

Use the existing routing solution if available.

Required routes:

## Public

```text
/
/menu
/cart
/checkout
/payment
/payment/success
/payment/failed
/payment/cancelled
/login
/signup
/404
```

## Staff

```text
/orders
```

## Admin

```text
/admin
/admin/employee
/order-history
```

---

# 18. DIRECT URL ACCESS — CRITICAL

Every route must be directly accessible.

For example:

```text
http://localhost:5173/menu
```

must directly open the Menu page.

Likewise:

```text
/login
/signup
/orders
/admin
/admin/employee
/order-history
/cart
/checkout
/payment
```

must work directly.

Browser refresh must also work.

Do not make pages accessible only through buttons.

Deep-link navigation must work correctly.

---

# 19. NO DEAD BUTTONS

Every important button must perform a real frontend action.

Examples:

```text
Order Now
Explore Menu
View Menu
Login
Signup
Cart
Checkout
Continue
Back
Admin
Employees
Orders
Order History
Menu
Logout
View Order
Try Again
Return to Menu
```

Every button must either:

* Navigate
* Change state
* Open a modal
* Update local data
* Submit a form
* Perform a meaningful UI action

Never create decorative dead buttons.

---

# 20. NAVIGATION MAP

Implement:

| Action                | Destination                        |
| --------------------- | ---------------------------------- |
| Order Now             | `/menu`                            |
| Explore Menu          | `/menu`                            |
| View Menu             | `/menu`                            |
| Navbar Menu           | `/menu`                            |
| Navbar Cart           | `/cart`                            |
| Navbar Login          | `/login`                           |
| Login → Signup        | `/signup`                          |
| Signup → Login        | `/login`                           |
| Back to Menu          | `/menu`                            |
| Cart → Checkout       | `/checkout`                        |
| Checkout → Payment    | `/payment`                         |
| Payment Success       | `/payment/success`                 |
| Payment Failed        | `/payment/failed`                  |
| Payment Cancelled     | `/payment/cancelled`               |
| Try Again             | Appropriate payment/checkout route |
| Return to Cart        | `/cart`                            |
| Admin → Employees     | `/admin/employee`                  |
| Admin → Orders        | `/orders`                          |
| Admin → Order History | `/order-history`                   |
| Admin → Menu          | `/menu`                            |
| Employee → Orders     | `/orders`                          |
| Employee → Menu       | `/menu`                            |
| Logout                | `/login`                           |
| 404 → Menu            | `/menu`                            |

Verify all of them.

---

# 21. ICON SYSTEM

Use a consistent professional icon library.

If the repository already contains one, reuse it.

Otherwise use Lucide or the icon system specified by the development standards.

Do NOT use emojis as the primary UI icon system.

Examples:

```text
Menu              → Menu
Close             → X
Search            → Search
Cart              → ShoppingBag
Add               → Plus
Remove            → Minus
Delete            → Trash2
Edit              → Pencil
Login             → LogIn
Signup            → UserPlus
User              → User
Admin             → LayoutDashboard
Employees         → Users
Orders            → ClipboardList
Order History     → History
Kitchen           → ChefHat
Menu              → Utensils
Payment           → CreditCard
Success            → CheckCircle
Error              → CircleAlert
Back              → ArrowLeft
Next              → ArrowRight
Logout             → LogOut
Download           → Download
Calendar           → Calendar
Phone              → Phone
Email              → Mail
Location           → MapPin
Settings           → Settings
Notifications      → Bell
```

Maintain consistent:

* Icon size
* Stroke width
* Alignment
* Spacing
* Hover behavior

---

# 22. NAVBAR

Create a premium responsive navbar.

## Desktop

Include:

* Soroco logo
* Menu
* Order CTA
* Cart
* Login

## Mobile

Use:

* Soroco logo
* Menu icon
* Cart icon
* Sticky navigation
* Thumb-friendly controls

Do not overcrowd mobile navigation.

Navbar should transition smoothly when scrolling.

Consider a transparent/overlay state on the hero and a solid/styled state after scrolling if this fits the Soroco visual language.

---

# 23. HOMEPAGE

Create a visually impressive homepage.

The homepage should communicate:

> Soroco House + Food + Atmosphere + Ordering

Suggested structure:

```text
Navbar
↓
Hero
↓
Restaurant Story
↓
Featured Food
↓
Popular Categories
↓
Featured Dishes
↓
Restaurant Atmosphere
↓
Order CTA
↓
Footer
```

You may improve this structure if the Soroco visual language suggests a better editorial layout.

Do not make the homepage feel like a standard SaaS landing page.

It should feel like a premium restaurant experience.

---

# 24. HERO

The hero is extremely important.

Create a strong visual hero using:

* Restaurant imagery
* Food photography
* Large typography
* Elegant composition
* Supporting text
* Order CTA
* Explore Menu CTA

Both CTAs must work.

Use imagery intelligently.

Possible composition:

```text
Large immersive image
+
Editorial typography
+
Minimal CTA
```

Do not overcrowd the hero.

---

# 25. SCROLL EXPERIENCE

Scrolling should feel premium.

Use where appropriate:

* Image reveals
* Text reveals
* Sticky sections
* Subtle parallax
* Horizontal category scrolling
* Progressive image transitions
* Card entrance animation
* Section transitions

Avoid excessive animation.

The page should still feel fast.

---

# 26. MENU — `/menu`

This is the most important application page.

Customer journey:

```text
Open Menu
    ↓
Choose Category
    ↓
Browse Food
    ↓
Open Item
    ↓
Customize
    ↓
Add to Cart
```

No customer account should be required to browse the menu.

---

# 27. CATEGORY NAVIGATION

Create polished category navigation.

Support:

* Sticky category navigation
* Horizontal scrolling on mobile
* Active category
* Smooth transitions
* Large tap targets
* Scroll-to-category behavior

The active category should visually update while scrolling.

---

# 28. FOOD CARDS

Each FoodCard should support:

* Food image
* Food name
* Description
* Price
* Variant/size
* Veg/non-veg indicator
* Bestseller badge
* Special badge
* Availability
* Add button
* Quantity controls
* Customization indicator

## Desktop

Use:

* Image hover
* Subtle zoom
* Elevation
* CTA animation

## Mobile

Use:

* Large touch targets
* Quick add
* Bottom-sheet customization

Do not make food cards visually heavy.

Use editorial layouts where appropriate.

---

# 29. FOOD DETAIL / CUSTOMIZATION

When customization is required:

## Mobile

Open a bottom sheet.

## Desktop

Open a modal/drawer.

Support:

* Size
* Add-ons
* Toppings
* Quantity
* Special instructions
* Preferences

Show the updated price clearly.

Provide a strong:

```text
Add to Cart
```

CTA.

---

# 30. AVAILABILITY

Unavailable food items should remain visible.

Show:

```text
Unavailable
```

Use muted styling.

Disable Add.

Clearly differentiate:

```text
Available
Unavailable
```

---

# 31. CART — `/cart`

Create a complete cart experience.

Display:

* Item image
* Name
* Variant
* Quantity
* Unit price
* Line total
* Remove
* Grand total

Support:

* Add
* Remove
* Increment
* Decrement
* Quantity updates
* Empty cart

Make the cart visually consistent with the Soroco design language.

---

# 32. STICKY CART BAR

On `/menu`, show a premium sticky bottom cart bar when items exist.

Example:

```text
ShoppingBag   3 items   ₹850   →
```

Include:

* Cart icon
* Item count
* Total
* Arrow

Clicking it must navigate to:

```text
/cart
```

On mobile this should be particularly polished and thumb-friendly.

---

# 33. CHECKOUT — `/checkout`

Create a complete checkout UI.

Collect:

* Table name/number
* Customer name
* Phone
* Email

Display:

* Cart summary
* Selected items
* Quantities
* Total
* Payment method

Use frontend/local state.

No backend is required yet.

---

# 34. PAYMENT — `/payment`

Create the complete payment UI.

Payment options:

```text
PhonePe
Razorpay
```

This is UI-only.

No real payment transaction is required.

Include:

* Payment method selection
* Selected state
* Processing state
* Success state
* Failure state
* Cancellation state

---

# 35. PAYMENT CARDS

Each payment method should include:

* Appropriate logo/icon treatment
* Name
* Short description
* Selected state
* Hover state
* Selection indicator

Do not use fake payment functionality.

Clearly make it a frontend simulation.

---

# 36. PAYMENT SUCCESS

Create a polished success page:

```text
✓

Payment Successful

Order #ROM-001

Your order has been received.

Table T12

Total ₹850

[View Order]
[Back to Menu]
```

Buttons must work.

---

# 37. PAYMENT FAILURE

Create:

```text
Payment Failed

No amount was charged.

Your cart is still saved.

[Try Again]
[Back to Cart]
```

---

# 38. PAYMENT CANCELLATION

Create:

```text
Payment Cancelled

Your items are still in your cart.

[Try Again]
[Back to Cart]
```

---

# 39. LOGIN — `/login`

Create a premium staff login page.

Fields:

* Email
* Password

Actions:

```text
Login
Signup
Back to Menu
```

All must work.

Use frontend/local auth state.

---

# 40. SIGNUP — `/signup`

Fields:

* Email
* Password
* Confirm Password

Validation:

* Required
* Valid email
* Minimum 8 characters
* Password confirmation

Actions:

```text
Create Account
Back to Login
Back to Menu
```

All buttons must work.

---

# 41. FRONTEND AUTH STATE

Create a clean frontend authentication abstraction.

Support:

```text
Unauthenticated
Customer
Employee
Admin
```

Use local/frontend state.

Keep the architecture ready for future backend authentication.

---

# 42. PROTECTED ROUTES

Staff:

```text
/orders
```

Admin:

```text
/admin
/admin/employee
/order-history
```

Unauthenticated users attempting to access protected pages:

```text
→ /login
```

Employee accessing admin-only pages:

```text
→ Unauthorized UI
```

This is frontend routing behavior only.

---

# 43. ADMIN DASHBOARD — `/admin`

Create a polished admin dashboard.

It must work directly through:

```text
/admin
```

Navigation:

```text
Dashboard
Employees
Orders
Order History
Menu
Logout
```

Use an operational design language while still retaining Soroco branding.

Customer experience:

> Visual + immersive + food-focused

Admin experience:

> Clean + efficient + data-focused

---

# 44. ADMIN CARDS

Create polished dashboard cards.

### Employees

```text
Manage employees
→ /admin/employee
```

Icon:

```text
Users
```

### Orders

```text
Manage kitchen orders
→ /orders
```

Icon:

```text
ClipboardList
```

### Order History

```text
View previous orders
→ /order-history
```

Icon:

```text
History
```

### Menu

```text
Manage menu
→ /menu
```

Icon:

```text
Utensils
```

Every card must be clickable.

---

# 45. ADMIN SIDEBAR

Create a responsive sidebar.

Items:

```text
Dashboard
Employees
Orders
Order History
Menu
Logout
```

Each must have:

* Icon
* Active state
* Hover state
* Correct route

Mobile:

Convert into a drawer/mobile navigation.

---

# 46. EMPLOYEE MANAGEMENT — `/admin/employee`

Display mock employees:

* Name
* Email
* Role
* Created date
* Status

Actions:

* Search
* Add employee
* Edit
* Delete

Use:

```text
Plus
Pencil
Trash2
Search
```

### Add Employee

Open a polished modal.

Fields:

```text
Name
Email
Role
```

### Delete

Use confirmation dialog.

All actions must update local frontend state.

---

# 47. KITCHEN / ORDERS — `/orders`

Create a complete kitchen board.

Display:

* Order number
* Table
* Customer
* Phone
* Items
* Quantity
* Size
* Total
* Time
* Payment status
* Kitchen status
* Order status

Use a layout optimized for quick operational scanning.

---

# 48. KITCHEN STATUS

Support:

```text
In Queue
Preparing
Prepared
Delivered
```

Icons:

```text
In Queue  → Clock
Preparing → ChefHat
Prepared  → CheckCircle
Delivered → PackageCheck
```

Status controls must actually update local state.

---

# 49. ORDER HISTORY — `/order-history`

Display:

* Order number
* Date/time
* Table
* Customer
* Items
* Total
* Payment method
* Payment status
* Order status
* Kitchen status

Filters:

* Today
* Yesterday
* Custom date
* Order status
* Payment status

---

# 50. CSV EXPORT

Create:

```text
Export CSV
```

Use:

```text
Download
```

icon.

Export the current local order data as CSV.

---

# 51. MENU MANAGEMENT UI

Provide frontend UI for:

```text
Add Item
Edit Item
Delete Item
Toggle Availability
```

Icons:

```text
Plus
Pencil
Trash2
Eye
EyeOff
```

All actions should work against local state.

---

# 52. 404 PAGE

Create a custom premium 404 page.

Unknown routes should render it.

Example:

```text
404

Looks like this table is empty.

[Back to Menu]
```

Button:

```text
/menu
```

The 404 page should still feel like Soroco House.

---

# 53. FOOTER

Create a premium Soroco footer.

Include:

* Logo
* Restaurant information
* Menu
* Order
* Contact
* Relevant links
* Social links where appropriate

All internal links must work.

---

# 54. MICROINTERACTIONS

Add subtle interactions:

* Add-to-cart animation
* Cart count animation
* Button press feedback
* Hover
* Focus
* Modal entrance
* Bottom sheet entrance
* Page transitions
* Category selection
* Food card interaction
* Success animation

Keep them fast and subtle.

---

# 55. ACCESSIBILITY

Implement:

* Semantic HTML
* Keyboard navigation
* Visible focus states
* Accessible buttons
* Accessible forms
* Alt text
* Good contrast
* Accessible dialogs
* Escape-to-close
* Screen-reader labels
* Reduced-motion support

---

# 56. RESPONSIVE DESIGN

Test major pages at:

```text
320px
375px
390px
430px
768px
1024px
1280px
1440px
```

Especially test:

* Navbar
* Homepage
* Menu
* Food cards
* Category navigation
* Cart
* Checkout
* Payment
* Login
* Signup
* Admin
* Kitchen
* Order history

---

# 57. PERFORMANCE

Optimize:

* Images
* Lazy loading
* Rendering
* Animations
* Bundle size

Do not load huge images unnecessarily.

Use appropriate image formats such as WebP/AVIF where appropriate.

---

# 58. LOADING STATES

Create polished skeletons/loading states for:

* Menu
* Food cards
* Cart
* Checkout
* Payment
* Login
* Signup
* Admin
* Orders
* Order history

---

# 59. EMPTY STATES

Create polished empty states.

### Empty Cart

```text
Your cart is empty.

Discover something delicious.

[Explore Menu]
```

### No Orders

```text
No orders yet.
```

### No Employees

```text
No employees found.

[Add Employee]
```

### No Search Results

```text
No results found.
```

---

# 60. ERROR STATES

Handle:

* Empty menu
* Empty cart
* Invalid form
* Login error
* Payment failure
* Payment cancellation
* Unauthorized
* Unknown route
* Missing image
* Local state failure

Never expose technical stack traces.

---

# 61. STATE MANAGEMENT

Organize state for:

```text
Cart
Menu
Auth
Orders
Admin
Checkout
Payment UI
```

Do not put the entire application state inside one giant component.

Use the existing project architecture or the development standards.

---

# 62. COMPONENT ARCHITECTURE

Create reusable components where appropriate.

Examples:

```text
Navbar
Footer
FoodCard
CategoryNav
CartBar
CartItem
QuantityControl
FoodCustomization
Modal
BottomSheet
PaymentCard
OrderCard
StatusBadge
AdminSidebar
EmployeeTable
OrderTable
EmptyState
ErrorState
LoadingSkeleton
ConfirmDialog
```

Do not over-engineer.

Only create abstractions where they improve maintainability and consistency.

---

# 63. VISUAL COMPONENT QUALITY

Every reusable component should feel like part of one coherent design system.

Maintain:

* Consistent typography
* Consistent spacing
* Consistent radii
* Consistent shadows
* Consistent iconography
* Consistent interaction states
* Consistent button styling
* Consistent responsive behavior

Do not allow each page to look like a different website.

---

# 64. ADMIN DESIGN

The admin panel should still feel like Soroco House.

But it should prioritize:

* Information density
* Speed
* Clarity
* Operational usability
* Tables
* Filters
* Status badges
* Search
* Actions
* Modals

Do not make the admin panel look like a generic Tailwind dashboard template.

---

# 65. BACKGROUND / IMAGE USAGE

Use images intentionally throughout the experience.

Possible areas:

```text
Hero
Restaurant Story
Featured Food
Food Cards
Atmosphere Section
CTA
Footer
```

However:

> Do not turn every section into a giant image.

Balance imagery with typography and whitespace.

If the existing Soroco website contains imagery that fits the visual language, use it as inspiration/reference and reuse available project assets where appropriate.

If suitable imagery is missing, generate visually consistent imagery.

---

# 66. BRAND CONSISTENCY

The entire application should visually communicate:

```text
Soroco
+
House
+
Restaurant
+
Premium Food
+
Modern Ordering
```

Do not create a completely separate visual identity.

The user should immediately recognize the Soroco influence.

But the ordering product should still feel like a **new product**, not a website clone.

---

# 67. FINAL DO-NOT-DO LIST

Do NOT:

* Hardcode menu repeatedly inside JSX
* Invent actual menu prices
* Invent actual menu items when menu images provide them
* Use unrelated food images
* Use random stock images
* Use emojis as the UI icon system
* Create dead buttons
* Create fake navigation
* Make routes accessible only through buttons
* Break direct URLs
* Create a generic admin dashboard
* Create a generic restaurant template
* Over-animate
* Put everything in one component
* Destroy existing architecture
* Add unnecessary dependencies
* Ignore mobile UX
* Ignore accessibility
* Leave console errors
* Leave broken images
* Leave broken routes
* Leave placeholder-looking UI

---

# 68. IMPLEMENTATION ORDER

Follow this sequence.

## Phase 1 — Repository

Inspect existing repository and frontend.

## Phase 2 — Standards

Read development standards.

## Phase 3 — Assets

Inspect all existing Soroco assets.

## Phase 4 — Menu Images

Process the menu images I provide.

Extract actual menu information.

## Phase 5 — Foundation

Build/refine:

* Theme
* Global styles
* Typography
* Layout
* Routing
* Icons
* State
* Local data
* Image system

## Phase 6 — Homepage

Build:

* Navbar
* Hero
* Restaurant story
* Featured food
* Categories
* Atmosphere
* CTA
* Footer

## Phase 7 — Menu

Build:

* Category navigation
* Food cards
* Food details
* Customization
* Images
* Availability
* Add to cart

## Phase 8 — Cart

Build:

* Cart
* Sticky cart
* Quantity controls
* Checkout

## Phase 9 — Payment

Build:

* Payment
* Processing
* Success
* Failure
* Cancellation

## Phase 10 — Authentication

Build:

* Login
* Signup
* Auth state
* Protected routes

## Phase 11 — Kitchen

Build:

* Orders
* Kitchen board
* Status changes

## Phase 12 — Admin

Build:

* Dashboard
* Sidebar
* Employees
* Menu management
* Order history
* CSV export

## Phase 13 — UX

Add:

* Animations
* Micro-interactions
* Loading
* Empty states
* Error states

## Phase 14 — Responsive QA

Test all screen sizes.

## Phase 15 — Routing QA

Test every URL directly.

## Phase 16 — Button QA

Test every important action.

## Phase 17 — Visual QA

Check:

* Typography
* Spacing
* Images
* Alignment
* Colors
* Icons
* Animations
* Responsive behavior

## Phase 18 — Final Cleanup

Fix:

* Console errors
* Broken routes
* Broken images
* Responsive issues
* Accessibility issues
* Visual inconsistencies

---

# 69. FINAL ROUTES

Implement and verify:

```text
/
/menu
/cart
/checkout
/payment
/payment/success
/payment/failed
/payment/cancelled

/login
/signup

/orders

/admin
/admin/employee
/order-history

/404
```

Every route must work.

Every route must be directly accessible.

Browser refresh must work.

Unknown routes must render the custom 404 page.

---

# 70. ROUTING QA

Manually verify:

```text
/
 /menu
 /cart
 /checkout
 /payment
 /payment/success
 /payment/failed
 /payment/cancelled
 /login
 /signup
 /orders
 /admin
 /admin/employee
 /order-history
 /unknown-route
```

Expected:

```text
/unknown-route → 404
```

Also verify browser refresh on every route.

---

# 71. BUTTON QA

Verify every important button.

## Home

```text
Order Now
Explore Menu
```

## Navbar

```text
Menu
Cart
Login
```

## Login

```text
Login
Signup
Back to Menu
```

## Signup

```text
Create Account
Back to Login
Back to Menu
```

## Menu

```text
Add
View
Cart
```

## Cart

```text
Checkout
Continue Shopping
Remove
Increase
Decrease
```

## Checkout

```text
Continue to Payment
Back to Cart
```

## Payment

```text
Pay
Cancel
```

## Success

```text
View Order
Back to Menu
```

## Failure

```text
Try Again
Back to Cart
```

## Admin

```text
Employees
Orders
Order History
Menu
Logout
```

## Employee Management

```text
Add
Edit
Delete
Search
```

## Kitchen

```text
Preparing
Prepared
Delivered
```

Every button must have a meaningful frontend action.

---

# 72. ADMIN URL QA

These must work directly:

```text
/admin
/admin/employee
/orders
/order-history
```

Do not require the user to first navigate through `/admin`.

---

# 73. COMPLETE USER EXPERIENCE

## Customer

```text
Scan QR
    ↓
Beautiful Soroco House Experience
    ↓
Explore Menu
    ↓
Select Food
    ↓
Customize
    ↓
Add to Cart
    ↓
Checkout
    ↓
Payment UI
    ↓
Order Confirmation
```

## Employee

```text
Login
    ↓
Kitchen
    ↓
Orders
    ↓
Update Status
```

## Admin

```text
Login
    ↓
Admin Dashboard
    ↓
Employees
Orders
Order History
Menu
```

---

# 74. DEFINITION OF DONE

The frontend is complete only when:

## Homepage

* Premium Soroco visual identity
* Strong hero
* Restaurant atmosphere
* Smooth scrolling
* Working CTAs
* Responsive

## Menu

* Categories
* Food cards
* Actual menu information
* Appropriate food images
* Food details
* Customization
* Availability
* Add to cart
* Quantity controls
* Sticky cart

## Cart

* Items
* Quantities
* Remove
* Total
* Checkout

## Checkout

* Customer information
* Table information
* Payment selection
* Cart summary

## Payment

* PhonePe UI
* Razorpay UI
* Processing state
* Success
* Failure
* Cancellation

## Authentication

* Login
* Signup
* Logout UI
* Frontend auth state
* Protected route architecture

## Employee

* Orders
* Kitchen
* Status changes
* Menu controls

## Admin

* `/admin`
* `/admin/employee`
* `/order-history`
* Employee management
* Menu management
* Orders
* CSV export

## Routing

* Every route works
* Direct URL access works
* Browser refresh works
* Unknown routes show 404

## Navigation

* Every important button works
* No dead buttons
* Every navigation has a meaningful destination

## Icons

* Consistent icon system
* Appropriate icons
* No emoji-based UI

## Responsive

* Mobile works
* Tablet works
* Desktop works
* No overflow

## Accessibility

* Keyboard navigation
* Focus states
* Semantic HTML
* Accessible dialogs
* Accessible forms
* Reduced motion

## Quality

* No console errors
* No broken images
* No broken routes
* No obvious UI bugs
* Fast
* Smooth
* Production-quality visual consistency

---

# 75. FINAL PRIORITY

When making implementation decisions, prioritize in this order:

```text
UX
↓
Visual Quality
↓
Mobile Experience
↓
Responsive Design
↓
Routing
↓
Interactions
↓
Component Architecture
↓
Frontend State
↓
Accessibility
↓
Performance
```

---

# 76. FINAL INSTRUCTION TO CODEX

Build this as:

> **A complete frontend-only Soroco House restaurant ordering product.**

Do not build a backend.

Do not wait for API integration.

Use local/frontend state so the entire product is independently usable.

The most important requirement is the **quality of the actual experience**.

I want the final application to feel like someone professionally designed and built a real restaurant product in 2026.

It should have:

* Beautiful typography
* Excellent imagery
* Strong Soroco-inspired branding
* Premium restaurant atmosphere
* Smooth scrolling
* Excellent mobile UX
* Thoughtful interactions
* Fitting icons
* Working navigation
* Working buttons
* Working routes
* Working local state
* Beautiful food presentation
* Proper loading/empty/error states
* Responsive layouts
* Professional admin UI

The Soroco website is the **visual/branding inspiration**.

The restaurant ordering experience is **new and purpose-built**.

Use existing Soroco assets where they improve the result.

Use the menu images I provide as the source of truth for actual menu information.

Generate appropriate food/restaurant imagery when suitable existing imagery is unavailable.

Do not use random unrelated images.

Do not sacrifice visual quality for speed.

Do not stop at a functional prototype.

Build the **complete polished frontend experience**.

> **Every page must exist. Every important button must work. Every route must be directly accessible by URL. Every navigation must have a meaningful destination. Every important action must have a fitting icon. Every menu item must use appropriate imagery. The frontend must work independently using local data and must be ready for backend/API integration later.**
