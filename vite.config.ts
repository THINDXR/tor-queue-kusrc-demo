import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // เปิด host ไว้เพื่อให้ทดสอบจากมือถือในวง Wi-Fi เดียวกันได้
  server: { host: true, port: 5173 },
});
