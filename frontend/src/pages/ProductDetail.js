import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

// دالة لتحويل روابط يوتيوب العادية إلى روابط Embed
const getEmbedUrl = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) 
    ? `https://www.youtube.com/embed/${match[2]}` 
    : null;
};

const API_BASE_URL = 'https://zertexkey-production.up.railway.app';

const categoryLabels = {
  'roblox': 'Roblox',
  'minecraft': 'Minecraft',
  'steam': 'Steam',
  'discord': 'Discord',
  'chatgpt': 'ChatGPT',
  'movies': 'Streaming',
  'gift-cards': 'Gift Card',
  'ebooks': 'eBook',
  'games': 'Games',
  'general': 'General'
};

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Rajdhani:wght@400;500;600;700&family=Outfit:wght@300;400;500;600;700;800&display=swap');

  .pd-root {
    background: #182512;
    min-height: 100vh;
    font-family: 'Outfit', sans-serif;
    color: #e8f0e0;
  }
  .pd-glass {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 18px;
  }
  .pd-badge {
    display: inline-flex;
    align-items: center;
    padding: 3px 12px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 700;
  }
  .pd-btn-primary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: #22c55e;
    color: #fff;
    border: none;
    border-radius: 12px;
    padding: 13px 28px;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    transition: all .2s;
    text-decoration: none;
  }
  .pd-btn-primary:hover { background: #16a34a; transform: translateY(-1px); }
  .pd-qty-btn {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    color: rgba(255,255,255,0.5);
    font-size: 20px;
    cursor: pointer;
  }
  .pd-thumb-btn {
    flex-shrink: 0;
    width: 64px;
    height: 64px;
    border-radius: 10px;
    overflow: hidden;
    border: 2px solid transparent;
    cursor: pointer;
    background: none;
    padding: 0;
  }
  .pd-thumb-btn.active { border-color: #22c55e; }
  .pd-review-item {
    display: flex;
    gap: 14px;
    padding: 16px;
    background: rgba(255,255,255,0.03);
    border-radius: 14px;
    border: 1px solid rgba(255,255,255,0.05);
  }
  .pd-avatar {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: linear-gradient(135deg, #22c55e, #15803d);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-weight: 700;
  }

  /* SwAl Popup Styles */
  .swal2-popup.pd-swal-custom {
    border: 1px solid rgba(34, 197, 94, 0.3) !important;
    border-radius: 24px !important;
    padding: 20px !important;
  }
  .pd-info-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 15px;
    text-align: left;
  }
  .pd-info-video-container {
    position: relative;
    width: 100%;
    padding-top: 56.25%;
    border-radius: 15px;
    overflow: hidden;
    background: #000;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    margin-top: 10px;
  }
  .pd-info-video-container iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: none;
  }
`;

export default function ProductDetail() {
  const { id } = useParams();
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    productAPI.getOne(id)
      .then(res => {
        setProduct(res.data.product);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const getImageUrl = (img) => {
    if (!img) return `https://placehold.co/600x600/182512/22c55e?text=No+Image`;
    if (img.startsWith('http')) return img;
    return `${API_BASE_URL}${img}`;
  };

  const handleAddToCart = () => {
    if (!product) return;
    for (let i = 0; i < quantity; i++) addItem(product);
    toast.success(`${quantity}x ${product.name} added to cart`);
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return toast.error('Please log in to leave a review');
    setSubmitting(true);
    try {
      await productAPI.addReview(product._id, review);
      toast.success('Review submitted!');
      const res = await productAPI.getOne(id);
      setProduct(res.data.product);
      setReview({ rating: 5, comment: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInfoClick = () => {
    if (!product) return;
    const currentImageUrl = getImageUrl(images[activeImg]);
    const embedUrl = getEmbedUrl(product.youtubeUrl);

    Swal.fire({
      title: `<span style="font-family:'Rajdhani'; font-weight:800; color:#e8f0e0;">Product Details</span>`,
      background: '#14210f',
      showCloseButton: true,
      showConfirmButton: false,
      width: '700px',
      customClass: {
        popup: 'pd-swal-custom'
      },
      html: `
        <div class="pd-info-grid">
          <div style="display: flex; gap: 20px; align-items: start;">
             <img src="${currentImageUrl}" style="width: 150px; height: 150px; object-fit: cover; border-radius: 12px; border: 1px solid rgba(34,197,94,0.3);" />
             <div style="flex: 1;">
                <h3 style="margin: 0 0 8px 0; color: #22c55e; font-family: 'Rajdhani'; font-size: 22px;">${product.name}</h3>
                <div style="margin-bottom: 10px;">
                  <span style="background:rgba(34,197,94,0.15); color:#22c55e; padding:3px 10px; border-radius:8px; font-size:11px; font-weight:700; text-transform: uppercase;">
                    ${categoryLabels[product.category] || 'Category'}
                  </span>
                </div>
                <p style="color:rgba(232,240,224,0.7); font-size:14px; line-height:1.5; margin:0;">${product.description}</p>
             </div>
          </div>
          
          ${product.extraInfo ? `
            <div style="background:rgba(34,197,94,0.05); padding:15px; border-radius:12px; border-left:4px solid #22c55e;">
              <p style="margin:0; font-size:13px; color:rgba(255,255,255,0.6); font-style: italic;">"${product.extraInfo}"</p>
            </div>
          ` : ''}

          ${embedUrl ? `
            <div style="margin-top:15px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 15px;">
              <h4 style="margin:0 0 12px 0; font-size:16px; color:#e8f0e0; font-family:'Rajdhani'; letter-spacing: 1px;">VIDEO PREVIEW</h4>
              <div class="pd-info-video-container">
                <iframe src="${embedUrl}?autoplay=1&mute=1" allow="autoplay; encrypted-media" allowfullscreen></iframe>
              </div>
            </div>
          ` : ''}
        </div>
      `
    });
  };

  if (loading) return <div className="pd-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
  if (!product) return <div className="pd-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Product not found</div>;

  const images = [product.image, ...(product.images || [])].filter(Boolean);

  return (
    <div className="pd-root" style={{ paddingTop: 80, paddingBottom: 64 }}>
      <style>{STYLES}</style>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
        
        {/* Breadcrumb */}
        <nav style={{ display: 'flex', gap: 8, fontSize: 13, color: 'rgba(255,255,255,0.3)', marginBottom: 20 }}>
          <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
          <span>/</span>
          <Link to="/products" style={{ color: 'inherit', textDecoration: 'none' }}>Shop</Link>
          <span>/</span>
          <span style={{ color: '#22c55e' }}>{product.name}</span>
        </nav>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 50 }}>
          
          {/* Left: Media Area */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
            <div className="pd-glass" style={{ position: 'relative', overflow: 'hidden', aspectRatio: '1', borderRadius: 24 }}>
              <img src={getImageUrl(images[activeImg])} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={product.name} />
              
              {/* زر المعلومات (الذي يفتح البوب اب) */}
              <button 
                onClick={handleInfoClick} 
                title="View Video & Info"
                style={{ position: 'absolute', top: 15, right: 15, width: 42, height: 42, borderRadius: '50%', background: '#22c55e', color: '#fff', border: 'none', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize: '20px', fontWeight:'bold' }}
              >
                i
              </button>
            </div>
            
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 5 }}>
              {images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)} className={`pd-thumb-btn ${activeImg === i ? 'active' : ''}`}>
                  <img src={getImageUrl(img)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Info Area */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 25 }}>
            <div>
              <span className="pd-badge" style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}>
                {categoryLabels[product.category] || product.category}
              </span>
              <h1 style={{ fontSize: 42, fontWeight: 800, color: '#e8f0e0', marginTop: 15, fontFamily: 'Rajdhani' }}>{product.name}</h1>
            </div>

            <div className="pd-glass" style={{ padding: '25px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 15 }}>
                <span style={{ fontSize: 48, fontWeight: 800, color: '#22c55e' }}>${product.price.toFixed(2)}</span>
                {product.originalPrice > product.price && (
                  <span style={{ fontSize: 22, color: 'rgba(255,255,255,0.2)', textDecoration: 'line-through' }}>
                    ${product.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: product.availableStock > 0 ? '#22c55e' : '#ff4444' }}></div>
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>
                  {product.availableStock > 0 ? `${product.availableStock} Units in Stock` : 'Out of Stock'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 15 }}>
              <div className="pd-glass" style={{ display: 'flex', alignItems: 'center', borderRadius: 15 }}>
                <button className="pd-qty-btn" onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                <span style={{ width: 40, textAlign: 'center', fontWeight: 'bold' }}>{quantity}</span>
                <button className="pd-qty-btn" onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
              <button onClick={handleAddToCart} className="pd-btn-primary" style={{ flex: 1 }}>Add to Cart</button>
            </div>

            <div>
              <h3 style={{ fontSize: 18, color: '#e8f0e0', marginBottom: 10, fontFamily: 'Rajdhani' }}>About this product</h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, fontSize: 15 }}>{product.description}</p>
            </div>
            
            {/* لاحظي: تم حذف قسم الفيديو من هنا ليبقى في البوب اب فقط بناءً على طلبك */}
          </div>
        </div>

        {/* Reviews */}
        <div className="pd-glass" style={{ marginTop: 60, padding: 40 }}>
          <h2 style={{ fontSize: 28, fontFamily: 'Rajdhani', marginBottom: 30 }}>Product Reviews</h2>
          {isAuthenticated ? (
            <form onSubmit={handleReview} style={{ marginBottom: 40, display: 'grid', gap: 15 }}>
              <textarea 
                className="pd-input" 
                rows="3" 
                placeholder="Share your thoughts about this product..."
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '15px', color: '#fff' }}
                value={review.comment}
                onChange={(e) => setReview({...review, comment: e.target.value})}
              />
              <button type="submit" className="pd-btn-primary" style={{ width: 'fit-content' }}>
                {submitting ? 'Sending...' : 'Submit Review'}
              </button>
            </form>
          ) : (
            <p style={{ color: 'rgba(255,255,255,0.3)', marginBottom: 30 }}>Sign in to write a review.</p>
          )}

          <div style={{ display: 'grid', gap: 15 }}>
            {product.reviews?.length > 0 ? product.reviews.map((r, i) => (
              <div key={i} className="pd-review-item">
                <div className="pd-avatar">{r.user?.name?.charAt(0) || 'U'}</div>
                <div>
                  <h4 style={{ margin: 0, fontSize: 15, color: '#22c55e' }}>{r.user?.name || 'Customer'}</h4>
                  <p style={{ margin: '5px 0 0 0', color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>{r.comment}</p>
                </div>
              </div>
            )) : <p style={{ color: 'rgba(255,255,255,0.2)' }}>Be the first to review this product!</p>}
          </div>
        </div>

      </div>
    </div>
  );
}