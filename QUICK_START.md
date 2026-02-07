# Quick Start Guide - Cart & Categories System

## 🎯 What Was Implemented

### Part 1: Categories (Already Done)
- Categories stored in database
- Dynamic loading in category filter sidebar
- Product filtering by category

### Part 2: Cart & Orders (Just Completed)
- Database-backed cart for authenticated users
- Automatic order creation from cart
- Cart cleanup after checkout
- My Orders page integration

## ⚡ Apply Migrations (Choose ONE)

### Method 1: Supabase Dashboard (Easiest ✅)
```
1. Open: https://supabase.com
2. Select your project
3. Go to: SQL Editor → New Query
4. Copy the SQL from BOTH migration files:
   - supabase/migrations/20260206145000_create_categories.sql
   - supabase/migrations/20260206150000_create_cart_and_order_tracking.sql
5. Paste and click "Run" for each
```

### Method 2: Supabase CLI
```bash
cd d:\mountainmade
supabase link --project-ref your-project-ref
supabase migration up
```

### Method 3: Programmatic (Advanced)
```bash
# Set your service key in .env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Run migration script (to be created)
node scripts/run-migration.js
```

## ✅ Verify Installation

### In Supabase Dashboard:
1. Go to **Table Editor**
2. Check for new tables:
   - ✅ `categories` table with 6 rows
   - ✅ `cart_items` table (empty, creates on use)
3. Check `orders` table has these new columns:
   - ✅ `order_display_id`
   - ✅ `confirmed_at`
   - ✅ `shipped_at`
   - ✅ `in_transit_at`
   - ✅ `delivered_at`

### In Your App:
1. **Test Categories:**
   - Go to `/categories`
   - See category list loading from database ✅
   - Filter products by category ✅

2. **Test Cart:**
   - Login to account
   - Add product to cart
   - Go to `/cart`
   - See item in cart ✅
   - Update quantity ✅
   - Remove item ✅

3. **Test Checkout:**
   - Add item to cart
   - Click "Checkout"
   - Fill shipping info
   - Choose payment method
   - Click "Place Order"
   - See success message ✅
   - Redirected to `/my-orders` ✅

4. **Test My Orders:**
   - Go to `/my-orders`
   - See created order ✅
   - See order items ✅
   - See order status ✅

## 🐛 Troubleshooting

### Categories Not Showing
```
❌ Problem: Categories sidebar shows "Loading..."
✅ Solution: Run categories migration
```

### Cart Not Persisting
```
❌ Problem: Cart items disappear when logged out
✅ Solution: Run cart migration and check user is logged in
⚠️  Note: Guest users use localStorage (localStorage is cleared on browser clear)
```

### Order Not Created
```
❌ Problem: Payment submit doesn't create order
✅ Solution: Check migration was applied, verify user is logged in
```

### Product Not in Cart
```
❌ Problem: Can't add to cart / "Product not found"
✅ Solution: Ensure product name matches exactly (case-sensitive)
```

## 📱 Testing Flow

1. **Open App in Incognito/Private Mode**
```
- Browse products
- Add to cart (stored in localStorage)
- Verify cart items show
```

2. **Login**
```
- Account page (if not logged in, redirected)
- Cart items should persist from localStorage
- Add new item to cart
- Verify in database
```

3. **Checkout**
```
- Click checkout from `/cart`
- Fill shipping form
- Choose payment method
- Place order
- Check `/my-orders`
- Verify order shows with items
```

4. **Refresh/Reopen**
```
- Close and reopen browser
- Login again
- Go to `/my-orders`
- Verify order still there ✅
- Go to `/cart`
- Verify cart is empty ✅
```

## 📊 Database Tables Overview

### Categories Table
```sql
SELECT * FROM categories;
-- Should show 6 rows:
-- Honey, Grains, Spices, Herbs, Dry Fruits, Oils
```

### Cart Items Table
```sql
SELECT * FROM cart_items
WHERE user_id = auth.uid();
-- Shows items in user's cart
```

### Orders Table
```sql
SELECT * FROM orders
WHERE user_id = auth.uid()
ORDER BY created_at DESC;
-- Shows all user orders
```

### Order Items Table
```sql
SELECT oi.*, p.name
FROM order_items oi
JOIN products p ON oi.product_id = p.id
WHERE oi.order_id = 'order-uuid';
-- Shows items in specific order
```

## 🔗 Key Routes

| Route | Purpose | Auth Required |
|-------|---------|---------------|
| `/categories` | Browse products by category | ❌ No |
| `/cart` | View shopping cart | ❌ No |
| `/checkout` | Proceed to payment | ✅ Yes |
| `/my-orders` | View order history | ✅ Yes |
| `/product-details` | Product information | ❌ No |
| `/user-login` | User authentication | ❌ No |

## 📚 Documentation Files

- `CATEGORIES_MIGRATION.md` - Categories system details
- `CART_ORDERS_IMPLEMENTATION.md` - Full technical docs
- `CART_ORDERS_SETUP.md` - This setup guide

## 🆘 Need Help?

1. Check TypeScript errors: `npm run type-check`
2. Check Supabase status: https://status.supabase.com
3. Review browser console for errors
4. Check network tab in DevTools for API calls
5. Review RLS policies in Supabase dashboard

## ✨ Next Steps

After verifying everything works:

1. **Optional: Add inventory management**
   - Track stock levels
   - Prevent overselling
   - Email notifications

2. **Optional: Order notifications**
   - Email confirmation
   - SMS updates
   - Status changes

3. **Optional: Admin features**
   - Order management dashboard
   - Status updates
   - Refund processing

---

**Last Updated**: February 6, 2026
**Status**: Ready to Deploy ✅
