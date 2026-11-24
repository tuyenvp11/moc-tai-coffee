import { useEffect, useState } from 'react';
import { useReducedMotion } from '../hooks/useMotion';
export default function Hero({ store, slides }) {
  const reduced = useReducedMotion();
  const [slide, setSlide] = useState(0);
  const [manualPause, setManualPause] = useState(false);
  const [hidden, setHidden] = useState(document.hidden);
  const [hovered, setHovered] = useState(false);
  const paused = reduced || manualPause;
  useEffect(() => {
    const update = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);
  useEffect(() => {
    if (paused || hidden || hovered || slides.length < 2) return;
    const timer = setInterval(() => setSlide(value => (value + 1) % slides.length), 6500);
    return () => clearInterval(timer);
  }, [paused, hidden, hovered, slides.length, slide]);
  const change = step => setSlide(value => (value + step + slides.length) % slides.length);
  return <section id="home" className="hero">
    <div className="hero-heading"><div className="eyebrow"><span className="tiny-star" aria-hidden="true">✳</span> CÀ PHÊ NGON. NHỮNG NGÀY THẬT CHẬM.</div>
      <h1>Một chút cà phê.<br/>Một khoảng <em>bình yên.</em></h1>
      <div className="hero-side"><p>Để nhịp sống chậm lại một chút,<br/>và câu chuyện dài thêm một chút.</p><a className="text-link" href="#space">Khám phá {store.shortName}</a></div>
    </div>
    <div className="hero-photo" role="region" aria-roledescription="trình chiếu" aria-label="Không gian quán" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onFocusCapture={() => setHovered(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setHovered(false); }}>
      {slides.map((item, index) => <img key={item.id} className={`hero-img${index === slide ? ' current' : ''}`} src={item.image} alt={item.alt} aria-hidden={index !== slide} fetchPriority={index === 0 ? 'high' : 'auto'}/>)}
      <div className="photo-shade"/>
      <div className="photo-caption"><span className="image-kicker">MỘT GÓC NHỎ, NHIỀU THƯƠNG MẾN</span><h2>Chỗ quen cho<br/>những ngày rất riêng.</h2></div>
      <a className="round-label" href="#visit"><span>HẸN BẠN<br/>Ở {store.shortName.toUpperCase()}</span></a>
      <div className="slide-controls"><span aria-live={paused ? 'polite' : 'off'}>{String(slide + 1).padStart(2,'0')}</span><span className="track" aria-hidden="true"><i style={{ width: `${(slide + 1) / slides.length * 100}%` }}/></span><span className="slide-total">{String(slides.length).padStart(2,'0')}</span>
        <button onClick={() => change(-1)} aria-label="Ảnh trước"><svg viewBox="0 0 24 24"><path d="m14 6-6 6 6 6"/></svg></button>
        <button onClick={() => change(1)} aria-label="Ảnh tiếp theo"><svg viewBox="0 0 24 24"><path d="m10 6 6 6-6 6"/></svg></button>
        <button onClick={() => setManualPause(value => !value)} disabled={reduced} aria-label={paused ? 'Phát slideshow' : 'Tạm dừng slideshow'}>{paused ? <svg viewBox="0 0 24 24"><path d="m9 5 10 7-10 7Z"/></svg> : <svg viewBox="0 0 24 24"><path d="M9 5v14M15 5v14"/></svg>}</button>
      </div><div className="photo-footnote">KHÔNG GIAN CHO NHỮNG ĐIỀU GIẢN DỊ</div>
    </div><div className="hero-bottom"><span>CHẬM MỘT NHỊP. THÊM MỘT NIỀM VUI.</span><a href="#story">Cuộn để cảm nhận</a></div>
  </section>;
}
