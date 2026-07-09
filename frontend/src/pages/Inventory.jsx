import { useEffect, useState, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FiSearch, FiPlus, FiTrash2, FiEdit, FiX, FiGrid, FiList } from "react-icons/fi";

export default function Inventory() {
  const [userRole, setUserRole] = useState("");
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState({
    name: "",
    price: "",
    quantity: "",
    description: "",
    stockStatus: "in-stock"
  });
  const [imageFile, setImageFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [imageError, setImageError] = useState("");
  const fileInputRef = useRef(null);
  // view mode: 'list' or 'grid'. Persist in localStorage so preference is kept across reloads
  const [viewMode, setViewMode] = useState(localStorage.getItem('inventoryView') || 'list');

  const validateAndSetFile = (file) => {
    if (!file) return;
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      setImageError('Image too large — max 2MB');
      toast.error('Image too large — max 2MB');
      return;
    }
    if (!['image/png', 'image/jpeg', 'image/gif'].includes(file.type)) {
      setImageError('Unsupported format — use PNG/JPG/GIF');
      toast.error('Unsupported format — use PNG/JPG/GIF');
      return;
    }
    setImageError('');
    setImageFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) validateAndSetFile(file);
  };
  const handleDragOver = (e) => { e.preventDefault(); setDragActive(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setDragActive(false); };
  const handleFileChange = (e) => { const file = e.target.files?.[0]; if (file) validateAndSetFile(file); };
  const clearImage = () => { setImageFile(null); setImageError(''); if (fileInputRef.current) fileInputRef.current.value = null; };

  useEffect(() => {
    axios.get("/auth/me").then(res => setUserRole(res.data.role)).catch(() => setUserRole("user"));
    fetchProducts();
  }, []);

  useEffect(() => {
    const filtered = products.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [search, products]);

  useEffect(() => {
    // Prevent background scrolling while modal is open
    if (typeof window !== 'undefined') {
      document.body.style.overflow = showModal ? 'hidden' : '';
    }
    return () => { if (typeof window !== 'undefined') document.body.style.overflow = ''; };
  }, [showModal]);

  // Persist user's view preference for inventory (list or grid)
  useEffect(() => {
    try { localStorage.setItem('inventoryView', viewMode); } catch (e) { /* ignore */ }
  }, [viewMode]);

  const fetchProducts = async () => {
    try {
      const url = userRole === "admin" ? "/products/all" : "/products";
      const res = await axios.get(url);
      setProducts(res.data);
    } catch (err) {
      const res = await axios.get("/products");
      setProducts(res.data);
    }
  };

  const createProduct = async () => {
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('price', form.price);
      fd.append('quantity', form.quantity);
      fd.append('description', form.description);
      fd.append('stockStatus', form.stockStatus);
      if (imageFile) fd.append('image', imageFile);

      await axios.post('/products', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Product created');
      resetForm();
      fetchProducts();
    } catch (err) {
      toast.error('Create failed');
    }
  };

  const updateProduct = async () => {
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('price', form.price);
      fd.append('quantity', form.quantity);
      fd.append('description', form.description);
      fd.append('stockStatus', form.stockStatus);
      if (imageFile) fd.append('image', imageFile);

      await axios.put(`/products/${editingProduct._id}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Product updated');
      resetForm();
      fetchProducts();
    } catch (err) {
      toast.error('Update failed');
    }
  };

  const resetForm = () => {
    setForm({ name: "", price: "", quantity: "", description: "", stockStatus: "in-stock" });
    setImageFile(null);
    setEditingProduct(null);
    setShowModal(false);
    window.dispatchEvent(new CustomEvent('inventory-modal', { detail: { open: false } }));
  };

  const editProduct = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      price: product.price,
      quantity: product.quantity,
      description: product.description || "",
      stockStatus: product.stockStatus
    });
    setImageFile(null); // Reset file, user can upload new
    setShowModal(true);
    window.dispatchEvent(new CustomEvent('inventory-modal', { detail: { open: true } }));
  };

  const remove = async (id) => {
    try {
      await axios.delete(`/products/${id}`);
      setProducts(p => p.filter(x => x._id !== id));
      toast.success('Deleted');
    } catch { toast.error('Delete failed'); }
  };

  const purchase = async (id) => {
    try {
      await axios.post(`/products/${id}/purchase`, { quantity: 1 });
      toast.success('Purchase successful');
      fetchProducts();
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Purchase failed');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Top Navbar */}
      <div className="flex items-center justify-between mb-6 bg-neutral-900 p-4 rounded-2xl">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-amber-600"
            />
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('list')}
              aria-pressed={viewMode === 'list'}
              title="List view"
              className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-neutral-800' : 'bg-transparent'} text-neutral-300 hover:bg-neutral-800`}
            >
              <FiList />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              aria-pressed={viewMode === 'grid'}
              title="Grid view"
              className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-neutral-800' : 'bg-transparent'} text-neutral-300 hover:bg-neutral-800`}
            >
              <FiGrid />
            </button>
          </div>
        </div>
        {userRole === 'admin' && (
          <button
            onClick={() => {
              setShowModal(true);
              window.dispatchEvent(new CustomEvent('inventory-modal', { detail: { open: true } }));
            }}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition"
          >
            <FiPlus size={16} />
            Add Inventory
          </button>
        )}
      </div>

      {/* Products List/Grid */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-2'}>
        {filteredProducts.map(p => (
          viewMode === 'grid' ? (
            <div key={p._id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex flex-col">
              {p.image && (
                <img
                  src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/uploads/${p.image}`}
                  alt={p.name}
                  className="w-full h-40 rounded-lg object-cover mb-3"
                  onError={(e) => e.currentTarget.style.display = 'none'}
                />
              )}
              <h4 className="font-bold text-lg text-white">{p.name}</h4>
              <p className="text-sm text-neutral-300 mt-1 flex-1">{p.description}</p>
              <div className="text-sm text-amber-400 mt-2 font-semibold">Rs {p.price} • Stock: {p.quantity} • {p.stockStatus}</div>
              <div className="flex justify-between items-center mt-3">
                <div className="text-xs text-neutral-400">ID: {p._id}</div>
                <div className="flex gap-2">
                  {userRole === 'admin' && (
                    <>
                      <button onClick={() => editProduct(p)} className="text-blue-400 hover:text-blue-500 p-2 hover:bg-neutral-800 rounded-lg transition"><FiEdit size={18} /></button>
                      <button onClick={() => remove(p._id)} className="text-red-400 hover:text-red-500 p-2 hover:bg-neutral-800 rounded-lg transition"><FiTrash2 size={18} /></button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div key={p._id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-3">
              <div className="flex gap-3">
                {p.image && (
                  <img
                    src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/uploads/${p.image}`}
                    alt={p.name}
                    className="w-20 h-20 rounded-lg object-cover"
                    onError={(e) => e.currentTarget.style.display = 'none'}
                  />
                )}
                <div className="flex-1">
                  <h4 className="font-bold text-lg text-white">{p.name}</h4>
                  <p className="text-sm text-neutral-300 mt-1">{p.description}</p>
                  <div className="text-sm text-amber-400 mt-2 font-semibold">Rs {p.price} • Stock: {p.quantity} • {p.stockStatus}</div>
                </div>
              </div>
              <div className="flex justify-end mt-3">
                {userRole === 'admin' && (
                  <div className="flex gap-3">
                    <button onClick={() => editProduct(p)} className="text-blue-400 hover:text-blue-500 p-2 hover:bg-neutral-800 rounded-lg transition">
                      <FiEdit size={18} />
                    </button>
                    <button onClick={() => remove(p._id)} className="text-red-400 hover:text-red-500 p-2 hover:bg-neutral-800 rounded-lg transition">
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        ))}
      </div>

      {/* Add Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 w-full max-w-4xl mx-4 overflow-visible">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={resetForm} className="p-2 text-neutral-300 hover:text-white rounded-md hover:bg-neutral-800"><FiX size={18} /></button>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
              {/* Left: Image preview */}
              <div className="w-full md:w-1/3 flex-shrink-0">
                <div className="bg-neutral-800 rounded-lg border border-neutral-700 p-4 flex flex-col items-center">
                  <div>
                    <div
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      className={`w-44 h-44 bg-neutral-700 rounded-lg overflow-hidden flex items-center justify-center border-2 ${dragActive ? 'border-amber-500 ring-2 ring-amber-400' : 'border-neutral-700' } cursor-pointer`}
                      onClick={() => fileInputRef.current && fileInputRef.current.click()}
                    >
                      {imageFile ? (
                        <img src={URL.createObjectURL(imageFile)} alt="preview" className="w-full h-full object-cover" />
                      ) : editingProduct?.image ? (
                        <img src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/uploads/${editingProduct.image}`} alt="preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-neutral-400 text-sm text-center px-2">
                          <div className="font-medium">Drop image here</div>
                          <div className="text-xs text-neutral-500">or click to upload</div>
                        </div>
                      )}
                    </div>

                    <input ref={fileInputRef} id="image" type="file" accept="image/png,image/jpeg,image/gif" onChange={handleFileChange} className="hidden" />

                    <div className="mt-3 flex items-center gap-2">
                      <button onClick={() => fileInputRef.current && fileInputRef.current.click()} className="px-3 py-1 bg-neutral-800 border border-neutral-700 text-white rounded hover:bg-neutral-700">{imageFile || editingProduct?.image ? 'Change' : 'Upload'}</button>
                      {(imageFile || editingProduct?.image) && (
                        <button onClick={clearImage} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-500">Remove</button>
                      )}
                      <span className="text-xs text-neutral-500 ml-auto">PNG, JPG, GIF — max 2MB</span>
                    </div>

                    {imageError && <div className="text-xs text-red-400 mt-2">{imageError}</div>}

                    {imageFile && (
                      <div className="text-xs text-neutral-400 mt-2">Selected: {imageFile.name} — {(imageFile.size / 1024).toFixed(0)} KB</div>
                    )}
                  </div>

                  <div className="mt-4 w-full text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${form.stockStatus === 'in-stock' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>{form.stockStatus === 'in-stock' ? 'In Stock' : 'Out of Stock'}</span>
                  </div>
                </div>
              </div>

              {/* Right: Form */}
              <div className="flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm text-neutral-400 mb-1">Product Name</label>
                    <input id="name" placeholder="Product Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                  </div>

                  <div>
                    <label className="block text-sm text-neutral-400 mb-1">Price (Rs)</label>
                    <input id="price" placeholder="Price" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                  </div>

                  <div>
                    <label className="block text-sm text-neutral-400 mb-1">Quantity</label>
                    <input id="quantity" placeholder="Quantity" type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm text-neutral-400 mb-1">Stock Status</label>
                    <select id="stockStatus" value={form.stockStatus} onChange={e => setForm({ ...form, stockStatus: e.target.value })} className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500">
                      <option value="in-stock">In-Stock</option>
                      <option value="out-of-stock">Out-of-Stock</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm text-neutral-400 mb-1">Description</label>
                    <textarea id="description" placeholder="Short description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500" rows="4" />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 mt-6">
                  <button onClick={resetForm} className="px-4 py-2 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600">Cancel</button>
                  <button onClick={editingProduct ? updateProduct : createProduct} className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-500 shadow">{editingProduct ? 'Update Product' : 'Save Product'}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}