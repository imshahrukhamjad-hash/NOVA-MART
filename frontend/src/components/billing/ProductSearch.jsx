import React, { useState } from 'react';
import ProductCard from '../../components/ProductCard';
import { FiChevronDown, FiGrid, FiList, FiShoppingCart } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';

export default function ProductSearch({ filteredProducts, searchInput, setSearchInput, sortBy, setSortBy, fetchProducts, onAdd }) {
  const { theme } = useTheme();
  const [viewLayout, setViewLayout] = useState('grid');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  return (
    <div className={`rounded-2xl p-6 border ${
      theme === 'dark'
        ? 'bg-neutral-800 border-neutral-700'
        : 'bg-white border-gray-200 shadow-lg'
    }`}>
      <div className="flex items-center gap-3 mb-4">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search products..."
          className={`flex-1 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 border ${
            theme === 'dark'
              ? 'bg-neutral-700 border-neutral-600 text-white placeholder-neutral-400'
              : 'bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500'
          }`}
        />
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={`px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 border ${
              theme === 'dark'
                ? 'bg-neutral-700 border-neutral-600 text-white'
                : 'bg-gray-100 border-gray-300 text-gray-900'
            }`}
          >
            <option value="name">Sort: Name</option>
            <option value="priceAsc">Price: Low → High</option>
            <option value="priceDesc">Price: High → Low</option>
          </select>
          <FiChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none ${
            theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'
          }`} />
        </div>
        <div className="flex items-center gap-2 border rounded-lg p-1" style={{
          borderColor: theme === 'dark' ? '#404854' : '#e5e7eb'
        }}>
          <button
            onClick={() => setViewLayout('grid')}
            className={`p-2 rounded transition ${
              viewLayout === 'grid'
                ? theme === 'dark'
                  ? 'bg-neutral-700 text-white'
                  : 'bg-gray-200 text-gray-900'
                : theme === 'dark'
                  ? 'text-neutral-400 hover:text-white'
                  : 'text-gray-600 hover:text-gray-900'
            }`}
            title="Grid view"
          >
            <FiGrid size={18} />
          </button>
          <button
            onClick={() => setViewLayout('list')}
            className={`p-2 rounded transition ${
              viewLayout === 'list'
                ? theme === 'dark'
                  ? 'bg-neutral-700 text-white'
                  : 'bg-gray-200 text-gray-900'
                : theme === 'dark'
                  ? 'text-neutral-400 hover:text-white'
                  : 'text-gray-600 hover:text-gray-900'
            }`}
            title="List view"
          >
            <FiList size={18} />
          </button>
        </div>
        <button
          onClick={async () => {
            setIsRefreshing(true);
            await fetchProducts();
            setIsRefreshing(false);
          }}
          className={`px-3 py-2 rounded-lg font-medium transition ${
            theme === 'dark'
              ? 'bg-neutral-700 hover:bg-neutral-600 text-white'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
          } ${isRefreshing ? 'animate-spin' : ''}`}
          title="Refresh"
          disabled={isRefreshing}
        >
          ⟳
        </button>
      </div>

      <div className="max-h-[60vh] overflow-y-auto scrollbar-custom">
        {filteredProducts.length === 0 ? (
          <div className={`text-center py-8 ${
            theme === 'dark' ? 'text-neutral-400' : 'text-gray-600'
          }`}>
            <div className="text-3xl mb-2">🧾</div>
            <div className="mb-3">No products found.</div>
            <button onClick={() => fetchProducts()} className={`px-3 py-2 rounded-lg font-medium transition ${
              theme === 'dark'
                ? 'bg-neutral-700 hover:bg-neutral-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
            }`}>Reload</button>
          </div>
        ) : viewLayout === 'grid' ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((p) => (
              <ProductCard key={p._id} product={p} onAdd={() => onAdd(p)} layout="vertical" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredProducts.map((p) => {
              const img = p.image || p.images?.[0] || null;
              const imageUrl = img
                ? (typeof img === 'string' && (img.startsWith('http') || img.startsWith('//') || img.startsWith('/')) ? img : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/uploads/${img}`)
                : null;
              
              return (
              <div
                key={p._id}
                className={`flex items-center gap-4 p-4 rounded-lg border transition ${
                  theme === 'dark'
                    ? 'bg-neutral-700 border-neutral-600 hover:bg-neutral-600'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100 shadow-sm'
                }`}
              >
                <div className="shrink-0">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={p.name}
                      className="w-16 h-16 object-cover rounded-lg"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${
                      theme === 'dark' ? 'bg-neutral-600' : 'bg-gray-200'
                    }`}>
                      <span className="text-xs text-gray-500">No image</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`font-medium truncate ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {p.name}
                  </div>
                  <div className={`text-sm mt-1 ${
                    theme === 'dark' ? 'text-neutral-400' : 'text-gray-600'
                  }`}>
                    Stock: {p.quantity}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="text-amber-500 font-bold">RS {p.price}</div>
                    {p.discount && <div className={`text-xs line-through ${
                      theme === 'dark' ? 'text-neutral-500' : 'text-gray-500'
                    }`}>RS {p.originalPrice}</div>}
                  </div>
                  <button
                    onClick={() => onAdd(p)}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition transform hover:-translate-y-0.5 flex items-center gap-2 whitespace-nowrap"
                  >
                    <FiShoppingCart size={16} />
                    Add to Cart
                  </button>
                </div>
              </div>
            );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
