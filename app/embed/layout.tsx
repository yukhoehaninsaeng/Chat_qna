import type { Metadata } from 'next';
import '../globals.css';

export const metadata: Metadata = {
  title: '사내 문서 도우미',
};

export default function EmbedLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body style={{ margin: 0, padding: 0, overflow: 'hidden', background: 'transparent' }}>
        {children}
      </body>
    </html>
  );
}
