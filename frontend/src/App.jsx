import { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Story, { Ticker } from './components/Story';
import Menu, { ApiMessage } from './components/Menu';
import Gallery from './components/Gallery';
import Footer, { Visit } from './components/Footer';
import Modal from './components/Modal';
import { useResource } from './hooks/useResource';
export default function App() {
  const home = useResource('/api/home');
  const [modal, setModal] = useState(null);
  if (home.loading) return <div className="boot-screen" role="status"><span className="logo">mộc tại<span>COFFEE · SLOW LIVING</span></span><p>Chờ một chút, cà phê đang được chuẩn bị…</p><div className="boot-bar"/></div>;
  if (home.error) return <div className="boot-screen"><span className="logo">mộc tại<span>COFFEE · SLOW LIVING</span></span><ApiMessage error="Mộc Tại chưa thể tải trang. Bạn thử lại sau một chút nhé." onRetry={home.retry}/></div>;
  const { store, categories, gallery, slides } = home.data.data;
  return <><a className="skip-link" href="#main-content">Đi đến nội dung</a><Header store={store} onLogin={() => setModal({ type:'login' })}/><main id="main-content"><Hero store={store} slides={slides}/><Ticker/><Story store={store}/><Menu categories={categories} isDemo={store.isDemo} onSelect={id => setModal({ type:'product',id })}/><Gallery gallery={gallery} store={store} onSelect={item => setModal({ type:'gallery',item })}/><Visit store={store}/></main><Footer store={store}/>{modal && <Modal key={modal.id || modal.item?.id || modal.type} content={modal} onClose={() => setModal(null)}/>}</>;
}
