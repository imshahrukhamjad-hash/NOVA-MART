import React from 'react';

export default function ConfirmationModal({ open, title, message, onConfirm, onCancel, loading }) {
  if (!open) return null;

  const disabled = loading;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-neutral-800 border border-neutral-700 rounded-2xl p-4 sm:p-6 w-full mx-4 sm:mx-auto max-w-md">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <p className="text-neutral-400 text-sm mt-1">{message}</p>
          </div>
          <button onClick={onCancel} className="text-neutral-400 hover:text-white">✕</button>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => onConfirm()}
            disabled={disabled}
            className="w-full px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-lg shadow-sm transform hover:-translate-y-0.5 transition-all disabled:opacity-60"
          >
            {loading ? 'Processing...' : 'Confirm'}
          </button>
          <button
            onClick={onCancel}
            className="w-full px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
