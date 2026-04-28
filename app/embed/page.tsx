'use client';

import { useState } from 'react';
import ChatWidget from '@/components/ChatWidget';

const BJ_GRADIENT = 'linear-gradient(135deg, #D91F26 0%, #F5A000 100%)';

export default function EmbedPage() {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 2147483647 }}>
      {/* 채팅 팝업 */}
      {open && (
        <div style={{
          marginBottom: '16px',
          width: '384px',
          height: '520px',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        }}>
          <ChatWidget className="h-full" />
        </div>
      )}

      {/* 플로팅 버튼 */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={() => setOpen((v) => !v)}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: BJ_GRADIENT,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(217,31,38,0.4)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '13px',
            padding: 0,
            overflow: 'hidden',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 6px 24px rgba(217,31,38,0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(217,31,38,0.4)';
          }}
        >
          {open ? (
            <svg width="20" height="20" fill="none" stroke="white" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <img src="/bjbot.png" alt="BJ" style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '50%' }} />
          )}
        </button>
      </div>
    </div>
  );
}
