
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Add Poppins font for the logo text
const poppinsFont = document.createElement('link');
poppinsFont.rel = 'stylesheet';
poppinsFont.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap';
document.head.appendChild(poppinsFont);

createRoot(document.getElementById("root")!).render(<App />);
