import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Wallet, Users, Package, BarChart3,
  ShoppingCart, TrendingUp, DollarSign, Activity, CheckCircle, XCircle, RefreshCw
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, ReferenceLine,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { computeSalesData, hasSales } from '../utils/dashboardUtils';
import { useTheme } from '../context/ThemeContext';

const StatCard = ({ icon: Icon, title, value, trend, trendColor, iconBg, restricted = false }) => (
  <div className="bg-neutral-900 p-4 rounded-xl shadow-sm border border-neutral-800">
    <div className="flex justify-between items-start">
      <div className={`p-3 rounded-lg ${iconBg} text-white shadow-md`}>
        <Icon size={16} />
      </div>
      <div className="text-right">
        <p className="text-sm text-neutral-400 font-medium">{title}</p>
        {restricted ? (
          <h3 className="text-sm text-red-400 font-medium">Login as admin</h3>
        ) : (
          <>
            <h3 className="text-2xl font-bold text-white">{value}</h3>
            <div className="mt-4 pt-4 border-t border-neutral-700">
              <p className="text-sm">
                <span className={`${trendColor} font-bold`}>{trend}</span>
                <span className="text-neutral-500 ml-1 italic text-xs">than last month</span>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
    {!restricted && (
      <div className="mt-4 pt-4 border-t border-neutral-700">
        <p className="text-sm">
          <span className={`${trendColor} font-bold`}>{trend}</span>
          <span className="text-neutral-500 ml-1 italic text-xs">than last month</span>
        </p>
      </div>
    )}
  </div>
);

// Small inline spinner used for compact loading indicators
const SmallSpinner = () => (
  <div className="w-4 h-4 border-2 border-t-transparent border-neutral-400 rounded-full animate-spin" />
);

const Dashboard = () => {
  const { theme } = useTheme();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [ordersPerMonth, setOrdersPerMonth] = useState([]);
  const [ordersByPayment, setOrdersByPayment] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  // Per-section loading flags
  const [loadingSales, setLoadingSales] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingRecentOrders, setLoadingRecentOrders] = useState(true);
  const [loadingTopProducts, setLoadingTopProducts] = useState(true);
  const [loadingOrdersByPayment, setLoadingOrdersByPayment] = useState(true);
  const [ordersAccessDenied, setOrdersAccessDenied] = useState(false);
  const [userRole, setUserRole] = useState('user');

  useEffect(() => {
    fetchUserRole();
    fetchDashboardData();
  }, []);

  const fetchUserRole = async () => {
    try {
      const res = await axios.get('/auth/me', { withCredentials: true });
      setUserRole(res.data.role || 'user');
    } catch (err) {
      console.error('Failed to fetch user role:', err);
      setUserRole('user');
    }
  };

  const fetchDashboardData = async () => {
    // reset per-section loaders
    setLoading(true);
    setLoadingSales(true);
    setLoadingCategories(true);
    setLoadingRecentOrders(true);
    setLoadingTopProducts(true);
    setLoadingOrdersByPayment(true);

    try {
      const axiosOptions = { withCredentials: true };

      // Fetch products - always available
      let products = [];
      let users = [];
      let orders = [];

      try {
        // Try admin endpoint first, fallback to user endpoint
        let productsRes;
        try {
          productsRes = await axios.get('/products/all', axiosOptions);
        } catch (err) {
          // If admin endpoint fails, try user endpoint
          productsRes = await axios.get('/products', axiosOptions);
        }
        products = productsRes.data;
        console.log('Products fetched:', products);
        console.log('Total products count:', products.length);
      } catch (err) {
        console.error('Failed to fetch products:', err);
      }

      try {
        const usersRes = await axios.get('/users', axiosOptions);
        users = usersRes.data;
      } catch (err) {
        console.error('Failed to fetch users:', err);
      }

      try {
        const ordersRes = await axios.get('/orders', axiosOptions);
        orders = ordersRes.data || [];
        setOrdersAccessDenied(false);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        if (err && err.response && (err.response.status === 401 || err.response.status === 403)) {
          setOrdersAccessDenied(true);
        }
        orders = [];
      }

      // Calculate stats - Total Inventory is sum of all product quantities
      const totalProducts = products.reduce((sum, product) => sum + (product.quantity || 0), 0);
      const totalOrders = orders.length;
      const totalUsers = users.length;
      const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);

      console.log('Stats calculated:', { totalProducts, totalOrders, totalUsers, totalRevenue });

      setStats({
        totalProducts,
        totalOrders,
        totalUsers,
        totalRevenue: Math.round(totalRevenue)
      });

      // Get recent orders (last 5)
      const recent = orders.slice(-5).reverse();
      setRecentOrders(recent);
      setLoadingRecentOrders(false);

      // Set products (include all so we can show active/inactive and compute top products)
      setProducts(products);

      // --- Compute monthly sales (last 6 months) using helper ---
      const { salesData: salesDataComputed, ordersPerMonth: ordersPerMonthArr } = computeSalesData(orders, 6);
      setSalesData(salesDataComputed);
      console.debug('Dashboard salesDataComputed:', salesDataComputed);
      setLoadingSales(false);

      setOrdersPerMonth(ordersPerMonthArr);

      // compute payment totals (unchanged)
      const paymentTotals = {};
      orders.forEach(order => {
        const pm = (order.paymentMethod || 'Cash');
        paymentTotals[pm] = (paymentTotals[pm] || 0) + Number(order.total || 0);
      });

      const ordersByPaymentArr = Object.keys(paymentTotals).map((k) => ({ method: k, value: Math.round(paymentTotals[k]) }));
      setOrdersByPayment(ordersByPaymentArr);
      setLoadingOrdersByPayment(false);

      // --- Compute category distribution from product data (Active / In Stock / Out of Stock / Inactive) ---
      const catCounts = { 'Active - In Stock': 0, 'Active - Out of Stock': 0, 'Inactive': 0 };
      products.forEach(p => {
        if (!p.active) catCounts['Inactive']++;
        else if (p.quantity <= 0 || p.stockStatus === 'out-of-stock') catCounts['Active - Out of Stock']++;
        else catCounts['Active - In Stock']++;
      });
      const categoryDataComputed = [
        { name: 'Active - In Stock', value: catCounts['Active - In Stock'], color: '#82ca9d' },
        { name: 'Active - Out of Stock', value: catCounts['Active - Out of Stock'], color: '#ff7300' },
        { name: 'Inactive', value: catCounts['Inactive'], color: '#8884d8' },
      ].filter(c => c.value > 0);

      setCategoryData(categoryDataComputed);
      console.debug('Dashboard categoryDataComputed:', categoryDataComputed);
      setLoadingCategories(false);

      // --- Compute top products by units sold (fallback to stock quantity) ---
      const soldMap = {};
      orders.forEach(o => {
        (o.items || []).forEach(it => {
          const id = it.productId || it._id || it.product;
          soldMap[id] = (soldMap[id] || 0) + (it.quantity || 0);
        });
      });
      const topProductsComputed = products.map(p => ({ ...p, sold: soldMap[p._id] || 0 })).sort((a, b) => b.sold - a.sold || b.quantity - a.quantity).slice(0, 5);

      setTopProducts(topProductsComputed);
      setLoadingTopProducts(false);

      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      // make sure to unset per-section loaders
      setLoading(false);
      setLoadingSales(false);
      setLoadingCategories(false);
      setLoadingRecentOrders(false);
      setLoadingTopProducts(false);
      setLoadingOrdersByPayment(false);
    }
  };

  // Previously there were mock stats for charts; now we compute them from real project data

  if (loading) {
    return (
      <div className="bg-neutral-950 p-6 min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className={`${theme === 'dark' ? 'bg-neutral-950' : 'bg-gray-50'} p-6 min-h-screen font-sans ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>

      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>Dashboard</h1>
          <p className={theme === 'dark' ? 'text-neutral-400' : 'text-gray-600'}>Welcome back! Here's what's happening with your store today.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchDashboardData} disabled={loading} className="btn btn-ghost flex items-center gap-2">
            {loading ? <SmallSpinner /> : <RefreshCw size={16} />}
            <span className="ml-2 hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>



      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          icon={Package} 
          title="Total Inventory" 
          value={stats.totalProducts} 
          trend="+12%" 
          trendColor="text-green-500" 
          iconBg="bg-blue-600" 
        />
        <StatCard 
          icon={ShoppingCart} 
          title="Total Orders" 
          value={stats.totalOrders} 
          trend="+8%" 
          trendColor="text-green-500" 
          iconBg="bg-green-600" 
        />
        <StatCard 
          icon={Users} 
          title="Total Users" 
          value={stats.totalUsers} 
          trend="+15%" 
          trendColor="text-green-500" 
          iconBg="bg-purple-600"
          restricted={userRole !== 'admin'}
        />
        <StatCard 
          icon={DollarSign} 
          title="Total Revenue" 
          value={`Rs ${stats.totalRevenue}`} 
          trend="+20%" 
          trendColor="text-green-500" 
          iconBg="bg-amber-600"
          restricted={userRole !== 'admin'}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Sales Chart */}
        <div className={`${theme === 'dark' ? 'bg-gradient-to-br from-neutral-900 to-neutral-950 border-neutral-800/50' : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'} p-6 rounded-2xl shadow-lg border`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Monthly Sales</h3>
              {loadingSales && <SmallSpinner />}
            </div>
            <div className={`px-3 py-1 rounded-full ${theme === 'dark' ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-100 border-amber-300'} border`}>
              <span className={`text-xs font-semibold ${theme === 'dark' ? 'text-amber-400' : 'text-amber-700'}`}>Last 6 Months</span>
            </div>
          </div>
          <div className={`h-72 ${theme === 'dark' ? 'bg-neutral-950/50' : 'bg-white'} rounded-xl p-4`}>
            {loadingSales ? (
              <div className={`flex items-center justify-center h-full text-sm ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'}`}><SmallSpinner /> <span className="ml-2">Loading sales...</span></div>
            ) : salesData.length > 0 && hasSales(salesData) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    <linearGradient id="pieGradient1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={theme === 'dark' ? '#F59E0B' : '#b45309'} />
                      <stop offset="100%" stopColor={theme === 'dark' ? '#D97706' : '#92400e'} />
                    </linearGradient>
                  </defs>
                  <Pie
                    data={salesData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, sales }) => `${name}: Rs ${sales}`}
                    outerRadius={100}
                    fill="url(#pieGradient1)"
                    dataKey="sales"
                    animationDuration={800}
                    animationEasing="ease-in-out"
                  >
                    {salesData.map((entry, index) => {
                      const colors = theme === 'dark' 
                        ? ['#F59E0B', '#D97706', '#FBBF24', '#F97316', '#FB923C', '#FDBA74']
                        : ['#b45309', '#92400e', '#d97706', '#b5220b', '#a16207', '#78350f'];
                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                    })}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => `Rs ${value}`}
                    contentStyle={{ backgroundColor: theme === 'dark' ? '#1F2937' : '#ffffff', border: `1px solid ${theme === 'dark' ? '#404854' : '#e5e7eb'}`, borderRadius: '12px' }}
                    labelStyle={{ color: theme === 'dark' ? '#F9FAFB' : '#1f2937' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className={`flex items-center justify-center h-full text-sm ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'}`} role="status" aria-live="polite">
                <div className="text-center">
                  <div className="text-3xl mb-2">📉</div>
                  <div className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>No sales yet</div>
                  <div className={`text-xs ${theme === 'dark' ? 'text-neutral-500' : 'text-gray-500'} mt-1`}>Make your first sale to see monthly sales here.</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Category Distribution + Orders-by-Payment */}
        <div className="bg-neutral-900 p-6 rounded-xl shadow-sm border border-neutral-800">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-white">Product Categories</h3>
              {loadingCategories && <SmallSpinner />}
            </div>
            <div className="text-sm text-neutral-400">Status breakdown</div>
          </div>
          <div className="h-56" role="img" aria-label="Product category distribution">
            {loadingCategories ? (
              <div className="flex items-center justify-center h-full text-sm text-neutral-400"><SmallSpinner /> <span className="ml-2">Loading categories...</span></div>
            ) : categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `Rs ${value}`} contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }} />
                  <Legend verticalAlign="bottom" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-neutral-400">No products yet</div>
            )}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3">
            <div className="flex flex-wrap justify-center gap-4">
              {categoryData.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-neutral-400">{item.name}</span>
                </div>
              ))}
            </div>

            {/* Orders by Payment */}
            <div className="mt-2">
              <h4 className="text-sm text-neutral-300 font-semibold mb-2">Orders by Payment {loadingOrdersByPayment && <SmallSpinner />}</h4>
              {loadingOrdersByPayment ? (
                <div className="text-sm text-neutral-400">Loading...</div>
              ) : ordersByPayment.length > 0 ? (
                <div className="space-y-2">
                  {ordersByPayment.map((p, idx) => {
                    const total = ordersByPayment.reduce((s, it) => s + it.value, 0) || 1;
                    const pct = Math.round((p.value / total) * 100);
                    const color = p.method === 'Cash' ? '#10B981' : p.method === 'Stripe' ? '#60A5FA' : '#F97316';
                    return (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-24 text-sm text-neutral-400">{p.method}</div>
                        <div className="flex-1 bg-neutral-800 rounded overflow-hidden h-3">
                          <div style={{ width: `${pct}%`, backgroundColor: color }} className="h-3"></div>
                        </div>
                        <div className="w-20 text-right text-sm text-neutral-300">Rs {p.value}</div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-sm text-neutral-400">No payment info yet</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-neutral-900 rounded-xl shadow-sm border border-neutral-800 p-6">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-xl font-bold text-white">Recent Orders</h3>
            {loadingRecentOrders && <SmallSpinner />}
          </div>
          <div className="space-y-4">
            {loadingRecentOrders ? (
              <div className="text-neutral-400 text-center py-6"><SmallSpinner /> <div className="mt-2 text-sm">Loading recent orders...</div></div>
            ) : recentOrders.length > 0 ? recentOrders.map((order, index) => (
              <div key={order._id || index} className="flex justify-between items-center p-3 bg-neutral-800 rounded-lg">
                <div>
                  <p className="text-white font-medium">Order #{order.invoiceNumber}</p>
                  <p className="text-sm text-neutral-400">{order.customerName}</p>
                </div>
                <div className="text-right">
                  <p className="text-amber-400 font-bold">Rs {Math.round(order.total || 0)}</p>
                  <p className="text-xs text-neutral-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            )) : (
              <p className="text-neutral-400 text-center py-4">No orders yet</p>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-neutral-900 rounded-xl shadow-sm border border-neutral-800 p-6">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-xl font-bold text-white">Top Products</h3>
            {loadingTopProducts && <SmallSpinner />}
          </div>
          <div className="space-y-4">
            {loadingTopProducts ? (
              <div className="text-neutral-400 text-center py-6"><SmallSpinner /> <div className="mt-2 text-sm">Loading top products...</div></div>
            ) : topProducts.length > 0 ? topProducts.map((product, index) => (
              <div key={product._id || index} className="flex justify-between items-center p-3 bg-neutral-800 rounded-lg">
                <div>
                  <p className="text-white font-medium">{product.name}</p>
                  <p className="text-sm text-neutral-400">Stock: {product.quantity} • Sold: {product.sold}</p>
                </div>
                <div className="text-right">
                  <p className="text-amber-400 font-bold">Rs {product.price}</p>
                <span
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold shadow-sm transition-transform duration-150 ease-out hover:-translate-y-0.5 ${product.active ? 'bg-gradient-to-r from-green-500 to-green-600 text-white ring-1 ring-green-400/20' : 'bg-gradient-to-r from-red-500 to-red-600 text-white ring-1 ring-red-400/20'}`}
                  title={product.active ? 'Product is active' : 'Product is inactive'}
                  aria-label={product.active ? 'Active' : 'Inactive'}
                >
                  {product.active ? <CheckCircle size={14} /> : <XCircle size={14} />}
                    {product.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            )) : (
              <p className="text-neutral-400 text-center py-4">No products yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;