import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');

if (rootElement) {
  try {
    const root = createRoot(rootElement);
    root.render(<App />);
  } catch (err) {
    console.error('Fatal initialization error:', err);
    rootElement.innerHTML = `
      <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background-color: #fff1f2; padding: 20px; font-family: system-ui, sans-serif;">
        <div style="background: white; padding: 32px; border-radius: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); max-width: 420px; text-align: center; border: 1px solid #fecdd3;">
          <div style="font-size: 40px; margin-bottom: 12px;">🌸</div>
          <h2 style="font-size: 18px; font-weight: bold; color: #1e293b; margin: 0 0 8px 0;">LunaPeri - Pelacak Siklus</h2>
          <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin-bottom: 20px;">
            Aplikasi sedang memuat ulang komponen. Silakan tekan tombol di bawah untuk menyegarkan tampilan.
          </p>
          <button onclick="window.location.reload()" style="background-color: #f43f5e; color: white; border: none; padding: 10px 20px; border-radius: 12px; font-weight: 600; cursor: pointer;">
            Muat Ulang Halaman
          </button>
        </div>
      </div>
    `;
  }
}
