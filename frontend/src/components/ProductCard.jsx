import React, { useState } from 'react';
import { FiShoppingCart, FiCheck } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';

export default function ProductCard({ product, onAdd, imageClass, layout = 'horizontal' }) {
  const { theme } = useTheme();
  const img = product.image || product.images?.[0] || null;
  // If image is a filename (no protocol or leading slash), assume backend uploads folder
  const imageUrl = img
    ? (typeof img === 'string' && (img.startsWith('http') || img.startsWith('//') || img.startsWith('/')) ? img : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/uploads/${img}`)
    : null;

  const subtitle = product.color ? `COLOR: ${product.color}` : (product.subtitle || product.variant || product.description?.slice(0, 60));

  // Local UI feedback state for small success animation after adding to cart
  const [justAdded, setJustAdded] = useState(false);

  const handleAddClick = async () => {
    try {
      // allow onAdd to be async if caller wants
      await onAdd?.();
    } catch (e) {
      // ignore errors here; keep UX feedback consistent
    } finally {
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1500);
    }
  }; 

  // Determine image sizing: allow override via imageClass; otherwise use sensible defaults per layout
  const effectiveImageClass = imageClass || (layout === 'vertical' ? 'w-full h-36' : 'w-16 h-16');

  if (layout === 'vertical') {
    return (
      <div className={`product-card w-full border rounded-xl p-3 flex flex-col hover:shadow-xl hover:-translate-y-0.5 transform transition-all duration-150 ${
        theme === 'dark'
          ? 'bg-neutral-900/30 border-neutral-700'
          : 'bg-white border-gray-300 shadow-md'
      }`}>
        {imageUrl ? (
          <img loading="lazy" src={imageUrl} alt={product.name} className={`${effectiveImageClass} object-cover rounded-md border ${theme === 'dark' ? 'border-neutral-800' : 'border-gray-300'}`} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.style.display = 'none'; }} />
        ) : (
          <div className={`${effectiveImageClass} rounded-md flex items-center justify-center ${
            theme === 'dark'
              ? 'bg-neutral-800 text-neutral-400'
              : 'bg-gray-300 text-gray-500'
          }`}>No Img</div>
        )}

        <div className="flex-1 text-left min-w-0 mt-3">
          <h4 className={`font-semibold mb-1 truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} title={product.name}>{product.name}</h4>

          {subtitle && <div className={`text-xs uppercase mb-2 truncate ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'}`}>{subtitle}</div>}

          <div className="flex items-center justify-between gap-3">
            <div className="text-amber-400 font-bold">Rs {product.price}</div>
            <div className={`text-xs ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'}`}>Stock: {product.quantity || '–'}</div>
          </div>

          <button
            onClick={handleAddClick}
            disabled={justAdded}
            aria-label={`Add ${product.name} to cart`}
            className={`mt-3 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-full shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-150 w-full focus:outline-none focus-visible:ring ${justAdded ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 focus-visible:ring-emerald-300' : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 focus-visible:ring-amber-300'}`}
          >
            {justAdded ? (
              <>
                <FiCheck className="text-lg text-white animate-pulse" />
                <span className="ml-2">Added</span>
              </>
            ) : (
              <>
                <FiShoppingCart className="text-lg" />
                <span className="ml-2">Add to cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full rounded-xl p-4 flex items-center gap-4 hover:shadow-xl hover:-translate-y-0.5 transform transition-all duration-150 border ${
      theme === 'dark'
        ? 'bg-neutral-900/30 border-neutral-700'
        : 'bg-white border-gray-300 shadow-md'
    }`}>
      {/* Left: small thumbnail */}
      {imageUrl ? (
        <img loading="lazy" src={imageUrl} alt={product.name} className={`${effectiveImageClass} object-cover rounded-md border ${theme === 'dark' ? 'border-neutral-800' : 'border-gray-300'}`} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.style.display = 'none'; }} />
      ) : (
        <div className={`${effectiveImageClass} rounded-md flex items-center justify-center ${
          theme === 'dark'
            ? 'bg-neutral-800 text-neutral-400'
            : 'bg-gray-300 text-gray-500'
        }`}>No Img</div>
      )}

      {/* Middle: stacked details */}
      <div className="flex-1 text-left min-w-0">
        <h4 className={`font-semibold mb-1 truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} title={product.name}>{product.name}</h4>

        {subtitle && <div className={`text-xs uppercase mb-1 truncate ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'}`}>{subtitle}</div>}

        <div className="flex items-center gap-3 mt-1">
          <div className="text-amber-400 font-bold">Rs {product.price}</div>
          <div className={`text-xs ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'}`}>• Stock: {product.quantity || '–'} • in-stock</div>
        </div>
      </div>

      {/* Right: compact Add button (modern) */}
      <div className="flex-shrink-0">
        <button
          onClick={handleAddClick}
          disabled={justAdded}
          aria-label={`Add ${product.name} to cart`}
          className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-full shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-150 focus:outline-none focus-visible:ring ${justAdded ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 focus-visible:ring-emerald-300' : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 focus-visible:ring-amber-300'}`}
        >
          {justAdded ? (
            <>
              <FiCheck className="text-lg text-white animate-pulse" />
              <span className="ml-2">Added</span>
            </>
          ) : (
            <>
              <FiShoppingCart className="text-lg" />
              <span className="ml-2">Add to cart</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
