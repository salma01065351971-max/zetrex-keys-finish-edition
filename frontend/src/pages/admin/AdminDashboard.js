import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

// مكون الكارت الصغير للإحصائيات
const StatCard = ({ label, value, icon, sub }) => (
  <div className="glass rounded-2xl p-6 border border-white/5 bg-black/40 hover:border-white/20 transition-all">
    <div className="flex items-center justify-between mb-4">
      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-xl">{icon}</div>
      {sub && <span className="text-[10px] text-green-400 font-mono bg-green-400/10 px-2 py-0.5 rounded-full">{sub}</span>}
    </div>
    <p className="font-display font-bold text-3xl text-white mb-1">{value}</p>
    <p className="text-gray-500 text-xs uppercase tracking-wider font-medium">{label}</p>
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMaintenance, setIsMaintenance] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getDashboard();
      setStats(res.data.stats);
      // ضبط حالة الصيانة بناءً على القيمة القادمة من السيرفر
      setIsMaintenance(res.data.stats.maintenanceMode || false);
    } catch (err) {
      toast.error('خطأ في جلب بيانات اللوحة');
    } finally {
      setLoading(false);
    }
  };

  const toggleMaintenance = async () => {
    const newStatus = !isMaintenance;
    try {
      await adminAPI.updateSettings({ maintenanceMode: newStatus });
      setIsMaintenance(newStatus);
      toast.success(newStatus ? 'وضع الصيانة مفعّل الآن' : 'الموقع متاح للزوار الآن', {
        style: { background: '#000', color: '#fff', border: '1px solid #333' }
      });
    } catch (error) {
      toast.error('فشل تحديث وضع الصيانة');
    }
  };

  const navItems = [
    { to: '/admin/products', label: 'Products', icon: '📦', desc: 'إدارة المنتجات' },
    { to: '/admin/codes', label: 'Codes', icon: '🔑', desc: 'الأكواد الرقمية' },
    { to: '/admin/orders', label: 'Orders', icon: '🛒', desc: 'الطلبات والمبيعات' },
    { to: '/admin/users', label: 'Users', icon: '👥', desc: 'إدارة الأعضاء' },
    { to: '/admin/financials', label: 'Financials', icon: '💰', desc: 'النظام المالي' },
    { to: '/admin/settings', label: 'Settings', icon: '⚙️', desc: 'إعدادات الموقع' },
  ];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="pt-24 pb-16 min-h-screen bg-[#050505] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Admin Terminal</h1>
            <p className="text-gray-500 mt-1">مرحباً بك في لوحة التحكم - نظام المبيعات الرقمية</p>
          </div>
          
          {/* Quick Maintenance Toggle */}
          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-4">
            <div>
              <p className="text-[10px] uppercase text-gray-500 font-bold tracking-[0.2em]">Maintenance Mode</p>
              <p className={`text-sm font-mono ${isMaintenance ? 'text-white' : 'text-gray-400'}`}>
                {isMaintenance ? 'ACTIVE (Private)' : 'INACTIVE (Live)'}
              </p>
            </div>
            <button 
              onClick={toggleMaintenance}
              className={`w-12 h-6 rounded-full transition-all relative ${isMaintenance ? 'bg-white' : 'bg-gray-800'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${isMaintenance ? 'right-1 bg-black' : 'left-1 bg-gray-500'}`} />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard label="Total Revenue" value={`$${stats?.totalRevenue?.toFixed(2)}`} icon="💵" sub="+12%" />
          <StatCard label="Total Orders" value={stats?.totalOrders} icon="🛒" />
          <StatCard label="Digital Products" value={stats?.totalProducts} icon="📦" />
          <StatCard label="Active Users" value={stats?.totalUsers} icon="👥" />
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          {navItems.map(item => (
            <Link key={item.to} to={item.to} className="group p-6 glass border border-white/5 rounded-3xl hover:bg-white hover:text-black transition-all duration-500 text-center">
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{item.icon}</div>
              <p className="font-bold text-sm tracking-tight">{item.label}</p>
            </Link>
          ))}
        </div>

        {/* Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders Table */}
          <div className="glass border border-white/5 rounded-3xl p-8 bg-black/20">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold uppercase tracking-widest text-gray-400">Recent Sales</h2>
              <Link to="/admin/orders" className="text-xs border-b border-white pb-1 hover:text-gray-400 hover:border-gray-400 transition-all">View All Orders</Link>
            </div>
            <div className="space-y-4">
              {stats?.recentOrders?.map(order => (
                <div key={order._id} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/5 group hover:bg-white/5 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="text-xs font-mono text-gray-500">#{order.orderNumber.slice(-5)}</div>
                    <div>
                      <p className="text-sm font-bold">{order.user?.name || 'Guest'}</p>
                      <p className="text-[10px] text-gray-500 uppercase">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono font-bold">${order.totalAmount.toFixed(2)}</p>
                    <p className={`text-[10px] font-bold uppercase ${order.status === 'completed' ? 'text-white' : 'text-gray-500'}`}>{order.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Low Stock Section */}
          <div className="glass border border-white/5 rounded-3xl p-8 bg-black/20">
            <h2 className="text-xl font-bold uppercase tracking-widest text-gray-400 mb-8">Inventory Alerts</h2>
            <div className="space-y-4">
              {stats?.lowStockProducts?.map(product => (
                <div key={product._id} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full ${product.stock === 0 ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'bg-gray-700'}`} />
                    <p className="text-sm font-medium">{product.name}</p>
                  </div>
                  <span className={`text-xs font-mono px-3 py-1 rounded-full ${product.stock === 0 ? 'bg-white text-black' : 'bg-white/10'}`}>
                    {product.stock} left
                  </span>
                </div>
              ))}
              {stats?.lowStockProducts?.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-gray-600 text-sm italic">All items are well stocked</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}