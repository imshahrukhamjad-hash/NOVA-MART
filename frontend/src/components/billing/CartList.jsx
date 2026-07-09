import React from 'react';
import { FiMinus, FiPlus, FiPrinter, FiCreditCard } from 'react-icons/fi';
import { SiStripe } from 'react-icons/si';
import { useTheme } from '../../context/ThemeContext';

export default function CartList({
  cart,
  products,
  updateQuantity,
  removeFromCart,
  clearCart,
  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,
  taxPercent,
  setTaxPercent,
  discount,
  setDiscount,
  paymentMethod,
  setPaymentMethod,
  jazzCashNumber,
  setJazzCashNumber,
  setShowPreview,
  // New props
  itemDiscounts,
  setItemDiscount,
  recentCustomers = [],
  onSaveCustomer,
  onPickRecent,
  onRequestClear,
  // Invoice / payment props
  invoiceNumber,
  subtotal,
  taxAmount,
  total,
  copyInvoiceNumber,
  initiatePayment,
  quickPay,
  printBill,
}) {
  const { theme } = useTheme();
  
  return (
    <div className={`rounded-xl p-6 flex flex-col border ${
      theme === 'dark'
        ? 'bg-neutral-800 border-neutral-700'
        : 'bg-white border-gray-200 shadow-lg'
    }`} role="region" aria-label="Cart">
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Cart</h3>
        <div className={`text-sm ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-600'}`}>{cart.length} item{cart.length !== 1 ? 's' : ''}</div>
      </div>
      <div className="mb-4">
        <div className="flex gap-3 items-start flex-wrap">
          <div className="flex-1 min-w-[220px]">
            <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-700'}`}>Customer Name</label>
            <input
              aria-label="Customer name"
              className={`w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 border ${
                theme === 'dark'
                  ? 'bg-neutral-700 border-neutral-600 text-white placeholder-neutral-400'
                  : 'bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              placeholder="Customer Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>

          <div className="w-40 min-w-[140px]">
            <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-700'}`}>Phone (optional)</label>
            <input
              aria-label="Customer phone"
              className={`w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 border ${
                theme === 'dark'
                  ? 'bg-neutral-700 border-neutral-600 text-white placeholder-neutral-400'
                  : 'bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              placeholder="Phone (optional)"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
            />
          </div>

          <div className="w-28 min-w-[100px]">
            <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-700'}`}>Tax %</label>
            <input
              type="number"
              aria-label="Tax percent"
              className={`w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 border ${
                theme === 'dark'
                  ? 'bg-neutral-700 border-neutral-600 text-white placeholder-neutral-400'
                  : 'bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              placeholder="Tax %"
              value={taxPercent}
              onChange={(e) => setTaxPercent(Number(e.target.value))}
            />
          </div>

          <div className="w-32 min-w-[110px]">
            <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-700'}`}>Discount (RS)</label>
            <input
              type="number"
              aria-label="Discount amount"
              className={`w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 border ${
                theme === 'dark'
                  ? 'bg-neutral-700 border-neutral-600 text-white placeholder-neutral-400'
                  : 'bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              placeholder="Discount (RS)"
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="mt-3">
          <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-700'}`}>Payment Method</label>
          <div className="flex items-center gap-2">
            <button onClick={() => setPaymentMethod('cash')} className={`px-3 py-1.5 rounded-lg font-medium transition ${paymentMethod === 'cash' ? 'bg-amber-600 text-white' : theme === 'dark' ? 'bg-neutral-700 text-neutral-400 hover:bg-neutral-600' : 'bg-gray-200 text-gray-900 hover:bg-gray-300'}`}>Cash</button>
            <button onClick={() => setPaymentMethod('jazzcash')} className={`px-3 py-1.5 rounded-lg font-medium transition ${paymentMethod === 'jazzcash' ? 'bg-amber-600 text-white' : theme === 'dark' ? 'bg-neutral-700 text-neutral-400 hover:bg-neutral-600' : 'bg-gray-200 text-gray-900 hover:bg-gray-300'}`}>JazzCash</button>
            <button onClick={() => setPaymentMethod('stripe')} className={`px-3 py-1.5 rounded-lg font-medium transition ${paymentMethod === 'stripe' ? 'bg-amber-600 text-white' : theme === 'dark' ? 'bg-neutral-700 text-neutral-400 hover:bg-neutral-600' : 'bg-gray-200 text-gray-900 hover:bg-gray-300'}`}>Stripe</button>

            {paymentMethod === 'jazzcash' && (
              <div className="ml-auto w-64">
                <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-700'}`}>JazzCash Number</label>
                <input
                  aria-label="JazzCash number"
                  className={`w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 border ${
                    theme === 'dark'
                      ? 'bg-neutral-700 border-neutral-600 text-white placeholder-neutral-400'
                      : 'bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="11-digit JazzCash number"
                  value={jazzCashNumber}
                  maxLength={11}
                  onChange={(e) => setJazzCashNumber(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto mb-4 scrollbar-custom">
        {cart.length === 0 ? (
          <div className={`text-center py-8 ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-600'}`}>
            <div className="text-3xl mb-2">🛒</div>
            <div className="mb-3">Cart is empty — add products to begin billing.</div>
          </div>
        ) : (
          cart.map((item) => {
            const prod = products.find(p => p._id === item._id) || {};
            const imgSrc = prod.image || (prod.images && prod.images[0]) || '';
            const imageUrl = imgSrc && !imgSrc.startsWith('http') ? `/uploads/${imgSrc}` : imgSrc;
            const maxQty = prod.quantity || item.quantity;
            const discountAmt = (itemDiscounts && itemDiscounts[item._id]) || 0;
            const unitPrice = Math.max(0, item.price - discountAmt);
            const lineTotal = Math.round(unitPrice * item.quantity);

            return (
              <div key={item._id} className={`flex items-center justify-between p-3 rounded-lg mb-2 hover:shadow-md transition border ${
                theme === 'dark'
                  ? 'bg-neutral-900/20 border-neutral-800'
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center gap-3">
                  {imageUrl ? (
                    <img src={imageUrl} alt={item.name} className="w-12 h-12 object-cover rounded" onError={(e)=>{e.target.style.display='none';}} />
                  ) : (
                    <div className={`w-12 h-12 rounded flex items-center justify-center ${
                      theme === 'dark'
                        ? 'bg-neutral-800 text-neutral-400'
                        : 'bg-gray-300 text-gray-500'
                    }`}>🧾</div>
                  )}

                  <div>
                    <div className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.name}</div>
                    <div className={`text-xs ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-600'}`}>Unit: RS {item.price} · {maxQty} in stock</div>
                    <div className={`text-xs ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-600'}`}>After discount: RS {unitPrice}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`flex items-center rounded overflow-hidden border ${
                    theme === 'dark'
                      ? 'border-neutral-800'
                      : 'border-gray-300'
                  }`}>
                    <button aria-label={`Decrease ${item.name}`} onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))} className={`px-2 py-1 ${theme === 'dark' ? 'hover:bg-neutral-800 text-white' : 'hover:bg-gray-200 text-gray-900'}`}>
                      <FiMinus />
                    </button>
                    <div className={`w-12 text-center px-2 py-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.quantity}</div>
                    <button aria-label={`Increase ${item.name}`} onClick={() => updateQuantity(item._id, Math.min(maxQty, item.quantity + 1))} className={`px-2 py-1 ${theme === 'dark' ? 'hover:bg-neutral-800 text-white' : 'hover:bg-gray-200 text-gray-900'}`}>
                      <FiPlus />
                    </button>
                  </div>

                  <div className="flex flex-col items-center mr-2">
                    <label className={`text-xs mb-1 ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-700'}`}>Discount</label>
                    <input aria-label={`Discount for ${item.name}`} type="number" className={`w-24 px-2 py-1 rounded border text-center ${
                      theme === 'dark'
                        ? 'bg-neutral-700 border-neutral-600 text-white'
                        : 'bg-gray-100 border-gray-300 text-gray-900'
                    }`} value={discountAmt} onChange={(e) => setItemDiscount(item._id, Number(e.target.value) || 0)} />
                  </div>

                  <div className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>RS {lineTotal}</div>

                  <button
                    onClick={() => removeFromCart(item._id)}
                    className={`ml-3 px-3 py-1 rounded text-rose-400 hover:text-white transition ${
                      theme === 'dark'
                        ? 'hover:bg-neutral-800'
                        : 'hover:bg-gray-200'
                    }`}
                    aria-label={`Remove ${item.name}`}
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className={`border-t pt-4 ${theme === 'dark' ? 'border-neutral-800' : 'border-gray-200'}`}>
        <div className="flex justify-between items-center mb-3">
          <div>
            <div className={`text-sm ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-600'}`}>Subtotal</div>
          </div>
          <div>
            <div className={`text-sm ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-600'}`}>Total</div>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button onClick={() => setShowPreview(true)} className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-lg font-medium">Preview</button>
          <button onClick={() => onRequestClear ? onRequestClear() : clearCart()} className={`px-4 py-2 rounded-lg font-medium transition ${
            theme === 'dark'
              ? 'bg-neutral-700 hover:bg-neutral-600 text-white'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
          }`}>Clear</button>
        </div>
        {/* Merged Invoice / Order Summary (moved from Billing aside) */}
        <div className={`mt-4 border-t pt-4 ${theme === 'dark' ? 'border-neutral-800' : 'border-gray-200'}`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className={`text-sm ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-600'}`}>Invoice</div>
              <div className="flex items-center gap-3 mt-1">
                <div className={`invoice-id font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{invoiceNumber}</div>
                <button onClick={() => copyInvoiceNumber && copyInvoiceNumber()} className={`px-2 py-1 rounded font-medium transition ${
                  theme === 'dark'
                    ? 'bg-neutral-700 hover:bg-neutral-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                }`}>Copy</button>
              </div>
              <div className={`text-sm mt-1 ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-600'}`}>{cart.length} items · RS {Math.round(subtotal || 0)}</div>
              <div className={`text-sm mt-2 ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-600'}`}>Tax {taxPercent}% • RS {Math.round(taxAmount || 0)}</div>
              <div className={`text-sm mt-1 ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-600'}`}>Discount • RS {Math.round(discount || 0)}</div>
            </div>

            <div className="flex flex-col items-stretch w-full sm:w-auto sm:items-end gap-2">
              <div className="text-amber-400 font-bold text-2xl">RS {Math.round(total || 0)}</div>
              <div className="flex gap-2 mt-2 w-full sm:w-auto">
                <button onClick={() => { setPaymentMethod('cash'); initiatePayment && initiatePayment(); }} className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-4 py-2 rounded-lg font-medium w-full flex items-center justify-center gap-2"><FiPrinter size={16} /> Pay & Print</button>
                <button onClick={() => { quickPay && quickPay('jazzcash'); }} className={`px-4 py-2 rounded-lg font-medium w-full transition flex items-center justify-center gap-2 ${
                  theme === 'dark'
                    ? 'bg-neutral-700 hover:bg-neutral-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                }`}><FiCreditCard size={16} /> JazzCash</button>
                <button onClick={() => { quickPay && quickPay('stripe'); }} className={`px-4 py-2 rounded-lg font-medium w-full transition flex items-center justify-center gap-2 ${
                  theme === 'dark'
                    ? 'bg-neutral-700 hover:bg-neutral-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                }`}><SiStripe size={16} /> Stripe</button>
              </div>
              <div className="flex gap-2 mt-2 w-full sm:w-auto">
                <button onClick={() => { printBill && printBill(); }} className={`px-4 py-2 rounded-lg font-medium w-full transition flex items-center justify-center gap-2 ${
                  theme === 'dark'
                    ? 'bg-neutral-700 hover:bg-neutral-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                }`}><FiPrinter size={16} /> Print</button>
              </div>
            </div>
          </div>
        </div>      </div>
    </div>
  );
}
