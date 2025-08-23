import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { CartSkeleton } from "@/components/ui/skeletons";

export default function CartPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const update = () => {
      const stored = localStorage.getItem('cart');
      setCart(stored ? JSON.parse(stored) : []);
      setLoading(false);
    };
    
    // Add a small delay to show skeleton
    setTimeout(update, 500);
    
    window.addEventListener('cart-updated', update);
    window.addEventListener('storage', update);
    return () => {
      window.removeEventListener('cart-updated', update);
      window.removeEventListener('storage', update);
    };
  }, []);

  const updateQuantity = (idx: number, delta: number) => {
    setCart(prev => {
      const updated = [...prev];
      updated[idx].quantity = Math.max(1, updated[idx].quantity + delta);
      localStorage.setItem('cart', JSON.stringify(updated));
      window.dispatchEvent(new Event('cart-updated'));
      return updated;
    });
  };

  const removeItem = (idx: number) => {
    setCart(prev => {
      const updated = prev.filter((_, i) => i !== idx);
      localStorage.setItem('cart', JSON.stringify(updated));
      window.dispatchEvent(new Event('cart-updated'));
      return updated;
    });
  };

  const total = cart.reduce((sum, item) => {
    const price = typeof item.price === 'string' ? parseFloat(item.price.replace('€', '')) : item.price;
    return sum + (price || 0) * item.quantity;
  }, 0);

  if (loading) {
    return <CartSkeleton />;
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">{t('cart.title')}</h1>
      {cart.length === 0 ? (
        <div className="text-gray-500">{t('cart.empty')}</div>
      ) : (
        <div className="space-y-6">
          {cart.map((item, idx) => (
            <div key={item.id + '-' + (item.size || 'default')} className="flex items-center gap-4 border-b pb-4">
              <img src={item.image || item.imageUrl || '/placeholder.svg'} alt={item.name} className="w-20 h-20 object-contain bg-gray-50 rounded" />
              <div className="flex-1">
                <div className="font-semibold text-lg">{item.name}</div>
                <div className="text-gray-500">{item.brand}</div>
                <div className="text-sm">{t('cart.size')}: {item.size}</div>
                <div className="flex items-center gap-2 mt-2">
                  <button onClick={() => updateQuantity(idx, -1)} className="px-2 py-1 bg-gray-200 rounded">-</button>
                  <span className="px-2">{item.quantity}</span>
                  <button onClick={() => updateQuantity(idx, 1)} className="px-2 py-1 bg-gray-200 rounded">+</button>
                </div>
                <button onClick={() => removeItem(idx)} className="text-xs text-red-500 mt-2">{t('cart.remove')}</button>
              </div>
              <div className="font-bold text-xl">€{((typeof item.price === 'string' ? parseFloat(item.price.replace('€', '')) : item.price || 0) * item.quantity).toFixed(2)}</div>
            </div>
          ))}
          <div className="flex justify-between items-center pt-6 border-t mt-6">
            <span className="font-semibold text-lg">{t('cart.total')}</span>
            <span className="font-bold text-2xl">€{total.toFixed(2)}</span>
          </div>
          <button
            className="w-full py-4 bg-black text-white rounded-xl font-semibold mt-4 hover:bg-gray-900 transition"
            onClick={() => navigate('/checkout')}
          >
            {t('cart.checkout')}
          </button>
        </div>
      )}
    </div>
  );
}
