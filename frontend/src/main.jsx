import { Component, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';
class ErrorBoundary extends Component {
  state = { failed:false };
  static getDerivedStateFromError() { return { failed:true }; }
  componentDidCatch(error, info) { console.error('Page render error:',error,info); }
  render() {
    if (this.state.failed) return <div className="boot-screen"><h1>Mộc Tại Coffee</h1><p>Trang gặp sự cố. Bạn vui lòng tải lại nhé.</p><button className="outline-button" onClick={() => window.location.reload()}>Tải lại trang</button></div>;
    return this.props.children;
  }
}
createRoot(document.getElementById('root')).render(<StrictMode><ErrorBoundary><App/></ErrorBoundary></StrictMode>);
