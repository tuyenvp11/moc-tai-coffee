import { useEffect, useRef, useState } from 'react';
import { useResource } from '../hooks/useResource';
import { api } from '../services/api';
import { ApiMessage, money } from './Menu';
function ProductDetails({ id }) {
  const resource = useResource(`/api/menu/${encodeURIComponent(id)}`);
  if (resource.loading) return <p role="status">Đang tìm hương vị dành cho bạn…</p>;
  if (resource.error) return <ApiMessage error={resource.error} onRetry={resource.retry}/>;
  return <ProductQuote product={resource.data.data}/>;
}
function ProductQuote({ product }) {
  const [quantity, setQuantity] = useState(1);
  const [variantId, setVariantId] = useState('regular');
  const [attempt, setAttempt] = useState(0);
  const [quote, setQuote] = useState({ key:null, loading:true });
  const key = `${product.id}:${quantity}:${variantId}:${attempt}`;
  useEffect(() => {
    const controller = new AbortController();
    setQuote({ key, loading:true });
    api('/api/quotes', { method:'POST', signal:controller.signal, body:{ items:[{ productId:product.id,quantity,variantId }] } }).then(result => {
      if (!controller.signal.aborted) setQuote({ key, loading:false, total:result.data.total });
    }).catch(error => { if (!controller.signal.aborted) setQuote({ key, loading:false, error:error.message }); });
    return () => controller.abort();
  }, [key, product.id, quantity, variantId]);
  const pending = quote.key !== key || quote.loading;
  return <><span className="modal-eyebrow">HƯƠNG VỊ Ở MỘC TẠI</span><h2 id="modal-title">{product.name}</h2><p>{product.description}</p><p className="product-price">Từ {money(product.price)}</p>
    {product.variants.length > 1 && <label className="variant-label">Kích cỡ<select value={variantId} onChange={event => setVariantId(event.target.value)}>{product.variants.map(variant => <option value={variant.id} key={variant.id}>{variant.name}{variant.extraPrice > 0 ? ` (+${money(variant.extraPrice)})` : ''}</option>)}</select></label>}
    <div className="quantity-row"><span>Số lượng tham khảo</span><div className="quantity-stepper"><button aria-label="Giảm số lượng" disabled={quantity <= 1} onClick={() => setQuantity(value => value - 1)}>−</button><output aria-live="polite">{quantity}</output><button aria-label="Tăng số lượng" disabled={quantity >= 20} onClick={() => setQuantity(value => value + 1)}>+</button></div></div>
    <div className="quote-total" aria-live="polite"><span>Thành tiền tham khảo</span><strong>{pending ? 'Đang tính…' : quote.error ? 'Chưa có giá' : money(quote.total)}</strong></div>
    {!pending && quote.error && <ApiMessage error={quote.error} onRetry={() => setAttempt(value => value + 1)}/>}
    <p className="quote-note">Giá và thực đơn minh họa. Bạn chưa tạo đơn hàng.</p>
  </>;
}
export default function Modal({ content, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement;
    dialog.showModal();
    return () => { dialog.close(); if (previous?.isConnected) previous.focus({ preventScroll:true }); };
  }, []);
  const backdrop = event => {
    if (event.target !== ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose();
  };
  return <dialog ref={ref} className={content.type === 'gallery' ? 'gallery-modal' : ''} aria-label={content.type === 'gallery' ? content.item.caption : content.type === 'login' ? 'Thành viên Mộc Tại' : 'Chi tiết món'} onClick={backdrop} onCancel={event => { event.preventDefault(); onClose(); }}><button className="modal-close" aria-label="Đóng" onClick={onClose}>×</button><div>
    {content.type === 'product' && <ProductDetails id={content.id}/>}
    {content.type === 'gallery' && <><img src={content.item.image} alt={content.item.alt}/><p>{content.item.caption}</p></>}
    {content.type === 'login' && <><span className="modal-eyebrow">MỘC TẠI MEMBERS</span><h2>Chào bạn, người quen mới.</h2><p>Khu vực thành viên đang được chuẩn bị. Chức năng đăng nhập sẽ được kết nối khi hệ thống tài khoản của quán sẵn sàng.</p><button className="solid-button modal-action" onClick={onClose}>Tiếp tục khám phá Mộc Tại</button></>}
  </div></dialog>;
}
