import type { Metadata } from 'next';
import '../globals.css';

export const metadata: Metadata = {
  title: '사내 문서 도우미',
};

// 위젯은 iframe 안에서 동작 — 루트 레이아웃과 독립된 레이아웃 사용
export default function WidgetLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body style={{ margin: 0, padding: 0, overflow: 'hidden' }}>{children}</body>
    </html>
  );
}
