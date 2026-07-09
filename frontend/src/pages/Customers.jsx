import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';

export default function Customers() {
  const { theme } = useTheme();
  const [customers, setCustomers] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/customers', { params: { q } });
      setCustomers(res.data);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [q]);

  const create = async () => {
    if (!name.trim()) { toast.error('Name is required'); return; }
    if (phone && !/^[0-9+\- ]{7,15}$/.test(phone.trim())) { toast.error('Enter a valid phone number'); return; }
    setCreating(true);
    try {
      const payload = { name: name.trim(), phone: phone.trim(), email: email.trim() || undefined, address: address.trim() || undefined };
      const res = await axios.post('/customers', payload);
      const c = res.data;
      setCustomers(prev => [c, ...prev]);

      // sync to localStorage recent customers (used by Billing quick pick)
      try {
        const rc = JSON.parse(localStorage.getItem('pos_recent_customers') || '[]');
        const list = [{ _id: c._id, name: c.name, phone: c.phone }, ...rc];
        const uniq = list.filter((v, i, a) => i === a.findIndex(e => (e.name === v.name && e.phone === v.phone)));
        localStorage.setItem('pos_recent_customers', JSON.stringify(uniq.slice(0, 8)));
      } catch (e) { /* ignore */ }

      setName(''); setPhone(''); setEmail(''); setAddress('');
      toast.success('Customer added');
    } catch (err) {
      console.error('Failed to create customer', err);
      toast.error('Failed to add customer');
    } finally {
      setCreating(false);
    }
  }; 

  const removeCustomer = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    try {
      await axios.delete(`/customers/${id}`);
      setCustomers(prev => prev.filter(c => c._id !== id));
      toast.success('Customer deleted');
    } catch (err) {
      console.error('Failed to delete customer', err);
      toast.error('Delete failed');
    }
  };


  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div>
          <h3 className={`text-2xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Customers</h3>
          <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-600'}`}>Add and manage customers for POS and support</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <input
            placeholder="Search customers by name or phone"
            value={q}
            onChange={e => setQ(e.target.value)}
            className={`w-full md:w-64 p-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
              theme === 'dark'
                ? 'bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500'
                : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
          />
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-700'}`}>Name</label>
          <input 
            id="name" 
            placeholder="Full name" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            className={`w-full p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
              theme === 'dark'
                ? 'bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-400'
                : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
          />
        </div>

        <div>
          <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-700'}`}>Phone</label>
          <input 
            placeholder="Phone" 
            value={phone} 
            onChange={e => setPhone(e.target.value)} 
            className={`w-full p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
              theme === 'dark'
                ? 'bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-400'
                : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
          />
        </div>

        <div>
          <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-700'}`}>Email (optional)</label>
          <input 
            placeholder="Email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            className={`w-full p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
              theme === 'dark'
                ? 'bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-400'
                : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
          />
        </div>

        <div className="md:col-span-3">
          <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-700'}`}>Address (optional)</label>
          <input 
            placeholder="Address" 
            value={address} 
            onChange={e => setAddress(e.target.value)} 
            className={`w-full p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
              theme === 'dark'
                ? 'bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-400'
                : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
          />
        </div>

        <div className="md:col-span-3 flex justify-end">
          <button 
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-black rounded-lg shadow" 
            onClick={create} 
            disabled={creating || !name.trim()}
          >
            <FiPlus />
            <span>{creating ? 'Adding...' : 'Add customer'}</span>
          </button>
        </div>
      </div>

      <div>
        {loading ? (
          <div className={theme === 'dark' ? 'text-neutral-400' : 'text-gray-600'}>Loading customers...</div>
        ) : customers.length === 0 ? (
          <div className={theme === 'dark' ? 'text-neutral-400' : 'text-gray-600'}>No customers found. Use the form above to add one.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className={`text-sm ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-700'}`}>
                  <th className="pb-3 pr-6">Name</th>
                  <th className="pb-3 pr-6">Phone</th>
                  <th className="pb-3 pr-6">Last active</th>
                  <th className="pb-3 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(c => (
                  <tr 
                    key={c._id} 
                    className={`border-t transition ${
                      theme === 'dark'
                        ? 'border-neutral-800 hover:bg-neutral-900'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <td className={`py-3 pr-6 ${theme === 'dark' ? '' : 'text-gray-900'}`}>
                      <div className="font-semibold">{c.name}</div>
                      <div className={`text-sm ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-600'}`}>{c.email || c.phone}</div>
                    </td>
                    <td className={`py-3 pr-6 ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-600'}`}>{c.phone}</td>
                    <td className={`py-3 pr-6 ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-600'}`}>{new Date(c.updatedAt).toLocaleString()}</td>
                    <td className={`py-3 pr-6 text-right`}>
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          to={`/dashboard/customers/${c._id}`} 
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-md ${
                            theme === 'dark'
                              ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                              : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                          }`}
                        >
                          Details
                        </Link>
                        <button 
                          onClick={() => removeCustomer(c._id)} 
                          className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-red-600 hover:bg-red-500 text-white"
                        > 
                          <FiTrash2 /> 
                          <span className="sr-only">Delete customer</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
