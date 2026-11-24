import { useRef } from 'react';
import { useReducedMotion, useReveal } from '../hooks/useMotion';
export default function Gallery({ gallery, store, onSelect }) {
  const ref = useRef(null), reveal = useReveal(), reduced = useReducedMotion();
  const scroll = direction => ref.current?.scrollBy({ left: ref.current.clientWidth * 0.65 * direction, behavior: reduced ? 'instant' : 'smooth' });
  return <section className="space-section section" id="space">
    <div {...reveal} className={`section-heading ${reveal.className}`}><div><p className="eyebrow">NHỮNG GÓC NHỎ Ở {store.shortName.toUpperCase()}</p><h2>Góc nào cũng là <em>góc thương.</em></h2></div><div className="gallery-arrows"><button onClick={() => scroll(-1)} aria-label="Cuộn ảnh về trước"><svg viewBox="0 0 24 24"><path d="m14 6-6 6 6 6"/></svg></button><button onClick={() => scroll(1)} aria-label="Cuộn ảnh tiếp theo"><svg viewBox="0 0 24 24"><path d="m10 6 6 6-6 6"/></svg></button></div></div>
    <div className="gallery" ref={ref}>{gallery.map(item => <button key={item.id} onClick={() => onSelect(item)} aria-label={`Mở ảnh: ${item.caption}`}><img src={item.image} alt={item.alt} loading="lazy"/><span>{item.caption}<b aria-hidden="true">+</b></span></button>)}</div>
  </section>;
}
