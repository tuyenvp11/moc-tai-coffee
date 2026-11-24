import { useEffect, useState } from 'react';
export function Logo({ store }) {
  return <a className="logo" href="#home" aria-label={`${store.name} trang chủ`}>{store.wordmark}<span>COFFEE · SLOW LIVING</span></a>;
}
export default function Header({ store, onLogin }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('home');
  useEffect(() => {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) setActive(entry.target.id);
    }), { rootMargin: '-10% 0px -65% 0px' });
    document.querySelectorAll('main > section[id]').forEach(section => observer.observe(section));
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!open) return;
    const onKey = event => { if (event.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);
  const links = [['home','Trang chủ'],['story',`Chuyện của ${store.shortName}`],['menu','Thực đơn'],['space','Không gian']];
  return <header>
    <Logo store={store} />
    <nav id="main-navigation" className={open ? 'open' : ''} aria-label="Điều hướng chính">
      {links.map(([id,label]) => <a key={id} href={`#${id}`} className={active === id ? 'active' : ''} aria-current={active === id ? 'location' : undefined} onClick={() => setOpen(false)}>{label}</a>)}
    </nav>
    <div className="header-actions">
      <a className="map-link" href="#visit" aria-label={`Ghé ${store.shortName}`}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg><span>Ghé {store.shortName}</span></a>
      <button className="login-link" onClick={onLogin}>Đăng nhập</button>
      <button className="mobile-toggle" aria-label={open ? 'Đóng menu' : 'Mở menu'} aria-expanded={open} aria-controls="main-navigation" onClick={() => setOpen(value => !value)}>{open ? '×' : '☰'}</button>
    </div>
  </header>;
}
