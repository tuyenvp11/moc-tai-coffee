import { useReveal } from '../hooks/useMotion';
export function Ticker() {
  return <div className="ticker" aria-hidden="true"><div>{[0,1].map(i => <span className="ticker-copy" key={i}>CÀ PHÊ THƠM <span>✳</span> CHUYỆN TRÒ LÂU <span>✳</span> NHỮNG KHOẢNG YÊN <span>✳</span></span>)}</div></div>;
}
export default function Story({ store }) {
  const photo = useReveal(), copy = useReveal();
  return <section className="story section" id="story">
    <div {...photo} className={`story-photo ${photo.className}`}><img src="/assets/coffee.jpg" alt="Nghệ thuật pha cà phê sữa" loading="lazy"/><div className="photo-note">Mỗi tách, một chút tận tâm.</div><span className="photo-stamp">made with<br/><em>love.</em></span></div>
    <div {...copy} className={`story-copy ${copy.className}`}><p className="eyebrow">CHUYỆN CỦA {store.shortName.toUpperCase()}</p><h2>Có những ngày,<br/>chỉ cần một<br/><em>chỗ ngồi quen.</em></h2><p>{store.shortName} được hình dung từ một điều thật giản dị: một nơi để bạn đặt xuống những vội vàng, nhấp một ngụm cà phê và thấy mình nhẹ tênh.</p><p>Một tách cà phê được chăm chút. Một góc nắng vừa đủ. Một bản nhạc khe khẽ. Những điều nhỏ xíu, cho một ngày dễ thương hơn.</p><a className="text-link" href="#visit">Tìm một góc cho mình</a></div>
  </section>;
}
