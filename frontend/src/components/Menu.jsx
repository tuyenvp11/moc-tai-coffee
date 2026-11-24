import { useState } from 'react';
import { useResource } from '../hooks/useResource';
import { useReveal } from '../hooks/useMotion';
export const money = value => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
function ProductCard({ product, onSelect }) {
  const reveal = useReveal();
  return <article {...reveal} className={`drink ${reveal.className}`}>
    <button className="drink-image" onClick={() => onSelect(product.id)} aria-label={`Xem ${product.name}`}><img src={product.image} alt={product.name} loading="lazy"/>{product.featured && <span>MỘC TẠI YÊU THÍCH</span>}<b aria-hidden="true">+</b></button>
    <div className="drink-title"><h3>{product.name}</h3><span>{money(product.price)}</span></div><p>{product.tagline}</p>
  </article>;
}
export function ApiMessage({ error, onRetry }) {
  return <div className="api-message" role="alert"><p>{error || 'Không thể kết nối. Vui lòng thử lại.'}</p><button className="outline-button" onClick={onRetry}>Thử lại</button></div>;
}
export default function Menu({ categories, onSelect, isDemo }) {
  const [category, setCategory] = useState('all');
  const [expanded, setExpanded] = useState(false);
  const heading = useReveal();
  const limit = category === 'all' && !expanded ? 3 : 24;
  const resource = useResource(`/api/menu?category=${encodeURIComponent(category)}&limit=${limit}`);
  const total = categories.reduce((sum, item) => sum + item.count, 0);
  const select = id => { setCategory(id); setExpanded(false); };
  return <section className="menu-section section" id="menu">
    <div {...heading} className={`section-heading ${heading.className}`}><div><p className="eyebrow">MỘT CHÚT HƯƠNG VỊ</p><h2>Hôm nay, bạn <em>uống gì?</em></h2></div><p>Một thức uống hợp gu.<br/>Một tâm trạng thật dễ chịu.</p></div>
    <div className="filters" role="group" aria-label="Nhóm đồ uống">
      {[{ id:'all', name:'Tất cả' }, ...categories].map(item => <button key={item.id} className={category === item.id ? 'selected' : ''} aria-pressed={category === item.id} onClick={() => select(item.id)}>{item.name}{item.id === 'all' && <sup>{total}</sup>}</button>)}
      {isDemo && <span>THỰC ĐƠN MINH HỌA</span>}
    </div>
    <div aria-busy={resource.loading}>
      {resource.loading ? <div className="menu-grid" role="status" aria-label="Đang tải thực đơn">{[0,1,2].map(i => <div key={i} className="menu-skeleton"/>)}</div> : resource.error ? <ApiMessage error={resource.error} onRetry={resource.retry}/> : <><p className="sr-only" role="status">Có {resource.data.meta.total} món trong nhóm đã chọn.</p><div className="menu-grid">{resource.data.data.map(product => <ProductCard key={product.id} product={product} onSelect={onSelect}/>)}</div>{!resource.data.data.length && <p className="empty-state">Mộc Tại sẽ sớm thêm món mới vào nhóm này.</p>}</>}
    </div>
    {category === 'all' && !resource.loading && !resource.error && total > 3 && <button className="outline-button" onClick={() => setExpanded(value => !value)}>{expanded ? 'Thu gọn thực đơn' : 'Xem thêm thực đơn'}</button>}
  </section>;
}
