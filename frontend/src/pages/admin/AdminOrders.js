import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI } from '../../services/api';
import toast from 'react-hot-toast';

// تعريف حالات الطلب والألوان (أسود وأبيض مع تدرجات الرمادي)
const STATUSES = ['', 'paid_unconfirmed', 'pending', 'paid', 'processing', 'completed', 'failed', 'refunded', 'cancelled'];
const STATUS_STYLES = {
    paid_unconfirmed: 'bg-white/10 text-white border border-white/20', // تنبيه مميز للأبيض
    pending: 'bg-gray-800 text-gray-400',
    paid: 'bg-gray-700 text-gray-200',
    processing: 'bg-gray-600 text-gray-100',
    completed: 'bg-white text-black font-bold', // مكتمل بلون أبيض صريح
    failed: 'bg-red-900/20 text-red-500',
    refunded: 'bg-gray-800 text-gray-500',
    cancelled: 'bg-gray-900 text-gray-600',
};

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    useEffect(() => { loadOrders(); }, [status, page]);

    const loadOrders = async () => {
        setLoading(true);
        try {
            const params = { page, limit: 20 };
            if (status) params.status = status;
            const res = await orderAPI.getAll(params);
            setOrders(res.data.orders);
            setTotal(res.data.total);
            
            // محاكاة إشعار عند وجود طلبات جديدة غير مؤكدة (مشروع حقيقي)
            const unconfirmed = res.data.orders.filter(o => o.status === 'paid_unconfirmed');
            if (unconfirmed.length > 0) {
                toast(`يوجد ${unconfirmed.length} طلبات جديدة بانتظار التأكيد`, {
                    icon: '🔔',
                    style: { background: '#fff', color: '#000' }
                });
            }
        } catch { 
            toast.error('فشل في تحميل الطلبات', { style: { background: '#000', color: '#fff' } }); 
        } finally { 
            setLoading(false); 
        }
    };

    const handleStatusChange = async (orderId, newStatus, currentStatus) => {
        if (newStatus === 'completed' && currentStatus === 'paid_unconfirmed') {
            return handleConfirm(orderId);
        }
        try {
            await orderAPI.updateStatus(orderId, newStatus);
            toast.success('تم تحديث حالة الطلب');
            loadOrders();
        } catch { toast.error('فشل التحديث'); }
    };

    // الدالة المسؤولة عن تأكيد الطلب وإرسال الأكواد للعميل
    const handleConfirm = async (orderId) => {
        const loadingToast = toast.loading('جاري تأكيد الطلب وإرسال الأكواد للعميل...', {
            style: { background: '#000', color: '#fff' }
        });

        try {
            await orderAPI.confirmAndSend(orderId);
            toast.success('تم التأكيد! الأكواد أصبحت جاهزة في حساب العميل الآن 📧', {
                id: loadingToast,
                style: { background: '#fff', color: '#000', fontWeight: 'bold' },
                duration: 5000
            });
            loadOrders();
        } catch (err) {
            toast.error(err.response?.data?.message || 'فشل في إرسال الأكواد', { id: loadingToast });
        }
    };

    return (
        <div className="page-enter pt-24 pb-16 min-h-screen bg-[#050505] text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight">Orders Management</h1>
                        <p className="text-gray-500 mt-1">إدارة عمليات الشراء وتأكيد الأكواد الرقمية</p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-mono text-gray-500">Filter Status:</span>
                        <select 
                            value={status} 
                            onChange={e => { setStatus(e.target.value); setPage(1); }} 
                            className="bg-black border border-white/10 text-white rounded-xl px-4 py-2 text-sm focus:border-white outline-none transition-all"
                        >
                            {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ').toUpperCase() || 'ALL ORDERS'}</option>)}
                        </select>
                    </div>
                </div>

                {/* Orders Table Container */}
                <div className="glass border border-white/5 rounded-3xl overflow-hidden bg-black/20">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/5">
                                    {['ID / Number', 'Customer', 'Amount', 'Status', 'Date', 'Action'].map(h => (
                                        <th key={h} className="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            {[...Array(6)].map((_, j) => (
                                                <td key={j} className="px-6 py-6"><div className="h-4 bg-white/5 rounded w-24" /></td>
                                            ))}
                                        </tr>
                                    ))
                                ) : orders.map(order => (
                                    <tr key={order._id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-6 py-6 font-mono text-sm">
                                            <span className="text-gray-500">#</span>
                                            {order.orderNumber.slice(-6)}
                                        </td>
                                        <td className="px-6 py-6">
                                            <p className="text-sm font-bold text-white">{order.user?.name}</p>
                                            <p className="text-[10px] text-gray-500 font-mono">{order.user?.email}</p>
                                        </td>
                                        <td className="px-6 py-6 font-bold text-white text-sm">
                                            ${order.totalAmount?.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-6">
                                            <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full ${STATUS_STYLES[order.status]}`}>
                                                {order.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6 text-[11px] text-gray-500 font-medium">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-3">
                                                {order.status === 'paid_unconfirmed' && (
                                                    <button
                                                        onClick={() => handleConfirm(order._id)}
                                                        className="bg-white text-black text-[10px] font-black uppercase px-4 py-2 rounded-lg hover:bg-gray-200 transition-all active:scale-95 shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                                                    >
                                                        Confirm & Send
                                                    </button>
                                                )}
                                                <Link 
                                                    to={`/orders/${order._id}`} 
                                                    className="text-gray-400 hover:text-white transition-colors"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {!loading && orders.length === 0 && (
                            <div className="text-center py-20">
                                <p className="text-gray-600 italic tracking-widest text-sm uppercase">No transaction records found</p>
                            </div>
                        )}
                    </div>

                    {/* Black & White Pagination */}
                    {total > 20 && (
                        <div className="px-8 py-6 border-t border-white/5 flex items-center justify-between bg-black/40">
                            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                                Showing {orders.length} of {total} results
                            </span>
                            <div className="flex gap-4">
                                <button 
                                    disabled={page === 1} 
                                    onClick={() => setPage(p => p - 1)} 
                                    className="px-4 py-2 border border-white/10 rounded-xl text-xs hover:bg-white hover:text-black transition-all disabled:opacity-20"
                                >
                                    Previous
                                </button>
                                <button 
                                    disabled={page * 20 >= total} 
                                    onClick={() => setPage(p => p + 1)} 
                                    className="px-4 py-2 border border-white/10 rounded-xl text-xs hover:bg-white hover:text-black transition-all disabled:opacity-20"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}