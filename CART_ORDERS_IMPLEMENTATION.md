# Cart and Orders Database Implementation

## Overview
Cart and orders are now fully integrated with Supabase database. When users are authenticated, their cart items are stored in the database. When they checkout, orders are created automatically and the cart is cleared.

## Database Schema Changes

### 1. New Tables Created

#### `cart_items` Table
```sql
- id (UUID) - Primary key
- user_id (UUID) - Reference to user_profiles
- product_id (UUID) - Reference to products
- quantity (INTEGER) - Item quantity
- weight (VARCHAR) - Item weight/variant
- created_at - Timestamp
- updated_at - Timestamp
```

**Unique Constraint:** `(user_id, product_id, weight)` - Each user can have only one cart item per product with the same weight

### 2. Orders Table Extensions
Added tracking columns:
- `order_display_id` - Human-readable order number (e.g., MM1707253941234)
- `confirmed_at` - When order was confirmed
- `shipped_at` - When order was shipped
- `in_transit_at` - When order is in transit
- `delivered_at` - When order was delivered

## How the System Works

### For Authenticated Users

#### Adding to Cart
1. User clicks "Add to Cart" on a product
2. CartContext checks if user is authenticated
3. If authenticated:
   - Looks up product_id from products table using product name
   - Checks if item already exists in cart_items table
   - If exists: Updates quantity
   - If not exists: Creates new cart_item
4. Cart is synced from database on next access

#### Viewing Cart
1. Cart page loads
2. CartContext fetches all cart_items for the user from Supabase
3. Joins with products table to get product details (name, price, image)
4. Shows loading state during fetch
5. Displays formatted cart items with images and prices

#### Checkout Flow
1. User clicks "Checkout" from cart
2. Verified user is authenticated
3. Shows shipping form → payment form
4. On payment submission:
   - Creates new order in `orders` table
   - Creates order_items for each cart item
   - Clears cart_items from database
   - Redirects to my-orders page

#### My Orders Page
1. Fetches all orders for the user from `orders` table
2. Joins with `order_items` and `products` tables
3. Shows order history with:
   - Order number
   - Total amount
   - Order status (pending, confirmed, shipped, delivered)
   - Items in order
   - Tracking information

### For Guest Users

#### Adding to Cart
- Cart items stored in localStorage
- No database persistence
- Can continue shopping but cart is lost on logout/browser clear

#### Checkout
- Redirected to login page
- Must create account to complete purchase

## API Endpoints & Functions

### CartContext Methods

```typescript
// Add item to cart
addToCart(item: {
  productId: string;
  name: string;
  image: string;
  alt: string;
  price: number;
  quantity: number;
  weight: string;
  origin: string;
}): Promise<void>

// Remove item from cart
removeFromCart(id: string): Promise<void>

// Update item quantity
updateQuantity(id: string, quantity: number): Promise<void>

// Clear entire cart
clearCart(): Promise<void>
```

### Database Queries

#### Fetch User's Cart Items
```sql
SELECT 
  ci.id,
  ci.product_id,
  ci.quantity,
  ci.weight,
  p.name,
  p.price,
  p.image_url,
  p.category
FROM cart_items ci
JOIN products p ON ci.product_id = p.id
WHERE ci.user_id = $1
ORDER BY ci.created_at DESC
```

#### Create Order from Cart
```sql
-- 1. Insert order
INSERT INTO orders (user_id, order_display_id, total_amount, status, shipping_address)
VALUES ($1, $2, $3, 'pending', $4)
RETURNING id

-- 2. Insert order items
INSERT INTO order_items (order_id, product_id, quantity, price)
SELECT $1, ci.product_id, ci.quantity, p.price
FROM cart_items ci
JOIN products p ON ci.product_id = p.id
WHERE ci.user_id = $2

-- 3. Clear cart
DELETE FROM cart_items WHERE user_id = $3
```

## File Changes

### Modified Files

1. **src/contexts/CartContext.tsx**
   - Added Supabase integration
   - Conditional logic for authenticated vs guest users
   - Database sync for cart items
   - Added `isLoading` state

2. **src/app/checkout/page.tsx**
   - Removed hardcoded items
   - Uses cart items from context
   - Implements order creation logic
   - Handles cart clearing after successful order
   - Added redirects for unauthorized access

3. **src/app/checkout/components/PaymentForm.tsx**
   - Added `isSubmitting` prop
   - Shows loading state during order placement
   - Disabled form inputs during submission

4. **src/app/cart/page.tsx**
   - Added loading state
   - Shows spinner while fetching cart from database

### New Migration File

**supabase/migrations/20260206150000_create_cart_and_order_tracking.sql**
- Creates cart_items table
- Adds order tracking columns to orders table
- Sets up RLS policies for cart_items
- Adds indexes for performance

## How to Apply

### Option 1: Supabase Dashboard
1. Go to your Supabase project
2. Navigate to SQL Editor
3. Click "New Query"
4. Copy contents of `supabase/migrations/20260206150000_create_cart_and_order_tracking.sql`
5. Click "Run"

### Option 2: Supabase CLI
```bash
supabase migration up
```

### Option 3: Node.js Script
```bash
SUPABASE_SERVICE_ROLE_KEY=your_key node scripts/run-migration.js
```

## Testing Checklist

- [ ] Add product to cart (logged in)
- [ ] See cart item in database
- [ ] Update quantity in cart
- [ ] Remove item from cart
- [ ] Clear entire cart
- [ ] Go to checkout
- [ ] Place order
- [ ] Verify order created in `orders` table
- [ ] Verify order_items created
- [ ] Verify cart cleared
- [ ] View order in My Orders page
- [ ] Test as guest user (should use localStorage)
- [ ] Test migration without auth (should not sync to DB)

## Security

- All cart and order operations are protected by RLS (Row Level Security)
- Users can only see their own cart and orders
- Only authenticated users can create/modify carts and orders
- Product prices are fetched from products table (prevents price manipulation)

## Performance Optimization

- Indexes on:
  - `cart_items(user_id)`
  - `cart_items(product_id)`
  - `cart_items(user_id, product_id)` - For unique constraint
  - `orders(user_id)` - Already exists
  - `order_items(order_id)` - Already exists

## Future Enhancements

- Abandoned cart recovery
- Cart sharing/wishlists
- Guest checkout (create account post-purchase)
- Order notifications (email/SMS)
- Inventory tracking (reduce stock on order)
- Return & refund management
- Cart analytics
