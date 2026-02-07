
import AppImage from '@/components/ui/AppImage';

interface OrderSummaryProps {
  items: Array<{
    id: string;
    name: string;
    image: string;
    alt: string;
    price: number;
    quantity: number;
  }>;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

export default function OrderSummary({ items, subtotal, shipping, tax, total }: OrderSummaryProps) {
  return (
    <div className="bg-card rounded-xl-organic border border-border p-6 sticky top-24">
      <h2 className="text-xl font-bold text-foreground mb-6">Order Summary</h2>

      {/* Items */}
      <div className="space-y-4 mb-6 pb-6 border-b border-border">
        {items.map((item) => (
          <div key={item.id} className="flex gap-3">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
              <AppImage
                src={item.image}
                alt={item.alt}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground line-clamp-1">
                {item.name}
              </p>
              <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
              <p className="text-sm font-bold text-primary mt-1">₹{item.price * item.quantity}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Price Breakdown */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span>₹{subtotal}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Shipping</span>
          <span className={shipping === 0 ? 'text-success font-semibold' : ''}>
            {shipping === 0 ? 'FREE' : `₹${shipping}`}
          </span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Tax</span>
          <span>₹{tax}</span>
        </div>
      </div>

      {/* Total */}
      <div className="flex justify-between text-xl font-bold text-foreground pt-4 border-t border-border">
        <span>Total</span>
        <span>₹{total}</span>
      </div>
    </div>
  );
}