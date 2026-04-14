import React, { useState, useEffect } from 'react';
import { productAPI } from '../../services/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['roblox', 'minecraft', 'steam', 'discord', 'chatgpt', 'movies', 'gift-cards', 'ebooks', 'games', 'general'];

const EMPTY_FORM = { 
  name: '', 
  description: '', 
  shortDescription: '', 
  category: 'general', 
  platform: '', 
  region: 'Global', 
  price: '', 
  originalPrice: '', 
  image: null, // نغيرها لـ null لأنها ستستقبل ملفاً
  tags: '', 
  isFeatured: false, 
  extraInfo: '', 
  youtubeUrl: '' 
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await productAPI.getAll({ limit: 100 });
      setProducts(res.data.products);
    } catch (err) { 
      toast.error('Failed to load products'); 
    } finally { 
      setLoading(false); 
    }
  };

  const openCreate = () => { setForm(EMPTY_FORM); setEditing(null); setModal(true); };
  
  const openEdit = (p) => {
    setForm({ 
      ...p, 
      tags: p.tags?.join(', ') || '', 
      price: p.price.toString(), 
      originalPrice: (p.originalPrice || '').toString(),
      image: null // عند التعديل نتركها null إلا لو أراد المستخدم تغيير الصورة
    });
    setEditing(p._id);
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // 📝 تحويل البيانات إلى FormData لدعم رفع الملفات
      const formData = new FormData();
      
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('shortDescription', form.shortDescription);
      formData.append('category', form.category);
      formData.append('platform', form.platform);
      formData.append('region', form.region);
      formData.append('price', parseFloat(form.price));
      if (form.originalPrice) formData.append('originalPrice', parseFloat(form.originalPrice));
      formData.append('isFeatured', form.isFeatured);
      formData.append('extraInfo', form.extraInfo);
      formData.append('youtubeUrl', form.youtubeUrl);
      
      // معالجة الـ Tags
      const tagsArray = form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
      formData.append('tags', JSON.stringify(tagsArray));

      // 🖼️ إضافة الصورة إذا تم اختيار ملف جديد
      if (form.image) {
        formData.append('image', form.image);
      }

      if (editing) {
        await productAPI.update(editing, formData);
        toast.success('Product updated!');
      } else {
        await productAPI.create(formData);
        toast.success('Product created!');
      }
      setModal(false);
      loadProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus, name) => {
    const action = currentStatus ? 'Deactivate' : 'Activate';
    if (!window.confirm(`Are you sure you want to ${action} "${name}"?`)) return;
    
    try {
      await productAPI.update(id, { isActive: !currentStatus });
      toast.success(`Product ${action}d!`);
      loadProducts();
    } catch { 
      toast.error('Operation failed'); 
    }
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.includes(search.toLowerCase())
  );

  return (
    <div className="page-enter pt-20 pb-16 min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <h1 className="font-display font-bold text-3xl">Products</h1>
          <button onClick={openCreate} className="px-6 py-2 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-all">
            + Add Product
          </button>
        </div>

        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full max-w-sm px-4 py-2 bg-zinc-900 border border-white/10 rounded-xl focus:border-white outline-none mb-6 transition-all"
        />

        <div className="bg-zinc-900/50 rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 font-semibold uppercase">Product</th>
                  <th className="px-6 py-4 font-semibold uppercase">Category</th>
                  <th className="px-6 py-4 font-semibold uppercase">Price</th>
                  <th className="px-6 py-4 font-semibold uppercase">Status</th>
                  <th className="px-6 py-4 font-semibold uppercase text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}><td colSpan="5" className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
                  ))
                ) : filtered.map(p => (
                  <tr key={p._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <img src={p.image} className="w-10 h-10 rounded-lg object-cover border border-white/10" alt="" />
                      <div>
                        <p className="font-medium">{p.name}</p>
                        <p className="text-[10px] text-gray-500">{p.platform}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-400">{p.category}</td>
                    <td className="px-6 py-4 font-bold">${p.price}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.isActive ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-500'}`}>
                        {p.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => openEdit(p)} className="px-3 py-1 border border-white/10 rounded hover:bg-white hover:text-black transition-all">Edit</button>
                        <button 
                          onClick={() => handleToggleStatus(p._id, p.isActive, p.name)} 
                          className={`px-3 py-1 rounded transition-all ${p.isActive ? 'text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white' : 'text-green-500 border border-green-500/20 hover:bg-green-500 hover:text-white'}`}
                        >
                          {p.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-zinc-950 border border-white/10 rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">{editing ? 'Edit Product' : 'Add New Product'}</h2>
                <button onClick={() => setModal(false)} className="text-2xl hover:text-gray-400">×</button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-xs text-gray-500 mb-1 block">Product Name *</label>
                    <input required value={form.name} onChange={e => setForm(f=>({...f, name: e.target.value}))} className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 outline-none focus:border-white transition-all" />
                  </div>
                  
                  {/* 📂 حقل رفع الصورة الجديد من الجهاز */}
                  <div className="sm:col-span-2">
                    <label className="text-xs text-gray-500 mb-1 block">Product Image (Upload from device)</label>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={e => setForm(f => ({ ...f, image: e.target.files[0] }))} 
                      className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-white file:text-black hover:file:bg-gray-200 cursor-pointer" 
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Category *</label>
                    <select value={form.category} onChange={e => setForm(f=>({...f, category: e.target.value}))} className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 outline-none focus:border-white transition-all">
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Platform</label>
                    <input value={form.platform} onChange={e => setForm(f=>({...f, platform: e.target.value}))} className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 outline-none focus:border-white transition-all" />
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Price ($) *</label>
                    <input required type="number" step="0.01" value={form.price} onChange={e => setForm(f=>({...f, price: e.target.value}))} className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 outline-none focus:border-white transition-all" />
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Original Price (Discount)</label>
                    <input type="number" step="0.01" value={form.originalPrice} onChange={e => setForm(f=>({...f, originalPrice: e.target.value}))} className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 outline-none focus:border-white transition-all" />
                  </div>

                  {/* 🎥 حقل رابط اليوتيوب */}
                  <div className="sm:col-span-2">
                    <label className="text-xs text-gray-500 mb-1 block">YouTube Video URL</label>
                    <input value={form.youtubeUrl} onChange={e => setForm(f=>({...f, youtubeUrl: e.target.value}))} placeholder="https://youtube.com/watch?v=..." className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 outline-none focus:border-white transition-all" />
                  </div>

                  {/* 📝 حقل معلومات إضافية للعميل */}
                  <div className="sm:col-span-2">
                    <label className="text-xs text-gray-500 mb-1 block">Extra Info (Instructions for customer)</label>
                    <textarea value={form.extraInfo} onChange={e => setForm(f=>({...f, extraInfo: e.target.value}))} rows={2} className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 outline-none focus:border-white transition-all resize-none" placeholder="Add steps on how to redeem the code..." />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs text-gray-500 mb-1 block">Full Description *</label>
                    <textarea required value={form.description} onChange={e => setForm(f=>({...f, description: e.target.value}))} rows={3} className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 outline-none focus:border-white transition-all resize-none" />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs text-gray-500 mb-1 block">Tags (comma separated)</label>
                    <input value={form.tags} onChange={e => setForm(f=>({...f, tags: e.target.value}))} className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 outline-none focus:border-white transition-all" placeholder="gaming, roblox, giftcard" />
                  </div>
                </div>
                
                <div className="flex gap-4 mt-8">
                  <button type="submit" disabled={saving} className="flex-1 bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition-all">
                    {saving ? 'Saving...' : editing ? 'Update Product' : 'Create Product'}
                  </button>
                  <button type="button" onClick={() => setModal(false)} className="px-8 border border-white/10 rounded-xl hover:bg-zinc-800 transition-all">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}