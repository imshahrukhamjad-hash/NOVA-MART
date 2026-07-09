import React from 'react';

export default function InvoicePreview({ previewOrder, onClose, onPrint, onConfirm, isProcessingPayment, paymentMethod }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="card p-4 sm:p-6 w-full mx-4 sm:mx-auto max-w-3xl max-h-[90vh] overflow-y-auto scrollbar-custom">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-primary flex items-center gap-3">
            <span className="text-amber-400">Preview</span>
            <span className="text-sm text-muted">Invoice</span>
          </h3>
          <div className="flex items-center gap-2">
            <button onClick={() => navigator.clipboard?.writeText(previewOrder.invoiceNumber)} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-primary" title="Copy Invoice Number">⧉</button>
            <button onClick={() => onPrint(previewOrder)} className="w-full sm:w-auto px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded flex items-center gap-2 shadow-sm">Print</button>
            <button onClick={onClose} className="text-muted hover:text-primary px-3 py-2">✕</button>
          </div>
        </div>

        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-primary">NOVA MART</h1>
          <p className="text-muted">Invoice Preview</p>
        </div>

        <div className="mb-4 border rounded p-4 card-note">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-muted text-sm">Invoice</p>
              <p className="text-primary font-semibold">{previewOrder.invoiceNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-muted text-sm">Date</p>
              <p className="text-primary font-semibold">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
          <div className="mt-3">
            <p className="text-muted text-sm">Customer</p>
            <p className="text-primary font-semibold">{previewOrder.customerName || 'Walk-in'}</p>
            {previewOrder.customerPhone && <p className="text-muted text-sm">{previewOrder.customerPhone}</p>}
          </div>
        </div>

        <div className="overflow-x-auto mb-4">
          <table className="w-full min-w-[640px] text-left border-collapse">
            <thead>
              <tr className="bg-card-header">
                <th className="p-2 text-neutral-300 font-medium">Item</th>
                <th className="p-2 text-neutral-300 font-medium">Qty</th>
                <th className="p-2 text-neutral-300 font-medium">Price</th>
                <th className="p-2 text-neutral-300 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {previewOrder.items.map((item, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="p-2 text-primary">{item.name}</td>
                  <td className="p-2 text-primary">{item.quantity}</td>
                  <td className="p-2 text-primary">
                    {`RS ${item.unitPrice} `}
                    {item.discount > 0 && <div className="text-xs text-muted">(-RS {item.discount} off)</div>}
                  </td>
                  <td className="p-2 text-primary">{`RS ${Math.round(item.unitPrice * item.quantity)}`}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="3" className="p-2 text-right text-primary">Subtotal</td>
                <td className="p-2 text-primary">{`RS ${Math.round(previewOrder.subtotal)}`}</td>
              </tr>
              {previewOrder.taxPercent > 0 && (
                <tr>
                  <td colSpan="3" className="p-2 text-right text-primary">Tax ({previewOrder.taxPercent}%)</td>
                  <td className="p-2 text-primary">{`RS ${Math.round(previewOrder.taxAmount)}`}</td>
                </tr>
              )}
              {previewOrder.discount > 0 && (
                <tr>
                  <td colSpan="3" className="p-2 text-right text-primary">Discount</td>
                  <td className="p-2 text-primary">-{`RS ${Math.round(previewOrder.discount)}`}</td>
                </tr>
              )}
              <tr className="bg-card-header">
                <td colSpan="3" className="p-2 text-right text-primary font-bold">Total</td>
                <td className="p-2 text-amber-400 font-bold">{`RS ${Math.round(previewOrder.total)}`}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={() => { onClose(); onConfirm(); }} disabled={isProcessingPayment} className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg shadow-sm">
            {isProcessingPayment ? 'Processing...' : paymentMethod === 'cash' ? 'Confirm & Print' : paymentMethod === 'jazzcash' ? 'Pay with JazzCash' : 'Pay with Stripe'}
          </button>
        </div>
      </div>
    </div>
  );
}
