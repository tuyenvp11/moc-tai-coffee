import { Logo } from './Header';
import { useReveal } from '../hooks/useMotion';
export function Visit({ store }) {
  const heading = useReveal(), info = useReveal();
  return <section className="visit section" id="visit"><div {...heading}><p className="eyebrow">HẸN GẶP BẠN Ở {store.shortName.toUpperCase()}</p><h2>Để một ngày đẹp trời,<br/>mình <em>gặp nhau.</em> <span aria-hidden="true">✳</span></h2></div><div {...info} className={`visit-info ${info.className}`}><p>Một chiếc bàn trống, một tách cà phê thơm.<br/>{store.shortName} chờ câu chuyện của bạn.</p>{store.address && <p>{store.address}</p>}{store.openingHours && <p>{store.openingHours}</p>}{store.notice && <p className="placeholder-note">{store.notice}</p>}<a className="solid-button" href={store.mapUrl} target="_blank" rel="noopener noreferrer">Mở Google Maps</a></div></section>;
}
export default function Footer({ store }) {
  return <footer><Logo store={store}/><p>{store.tagline}</p><a href="#home">Về đầu trang</a><div className="footer-bottom"><span>© {new Date().getFullYear()} {store.name.toUpperCase()}{store.isDemo ? ' · WEBSITE CONCEPT' : ''}</span><span>Được làm với một chút thương.</span></div></footer>;
}
