/* Chat Q&A Widget - 사내 문서 챗봇 임베드 스크립트
 * 사용법: <script src="https://your-domain.vercel.app/widget.js"></script>
 */
(function () {
  'use strict';

  // 중복 초기화 방지
  if (window.__ChatQnAWidget) return;
  window.__ChatQnAWidget = true;

  // 현재 스크립트의 origin 자동 감지 (URL 하드코딩 불필요)
  var currentScript = document.currentScript ||
    (function () {
      var scripts = document.getElementsByTagName('script');
      return scripts[scripts.length - 1];
    })();
  var scriptSrc = currentScript ? currentScript.src : '';
  var origin = scriptSrc ? scriptSrc.replace(/\/widget\.js.*$/, '') : window.location.origin;

  var isOpen = false;
  var WIDGET_WIDTH = '380px';
  var WIDGET_HEIGHT = '600px';
  var BUTTON_SIZE = '56px';
  var BOTTOM = '24px';
  var RIGHT = '24px';
  var PRIMARY_COLOR = '#2563eb';

  // ──────────────────────────────────────────────
  // 플로팅 버튼
  // ──────────────────────────────────────────────
  var button = document.createElement('button');
  button.setAttribute('aria-label', '채팅 열기');
  button.setAttribute('title', '사내 문서 도우미');
  button.style.cssText = [
    'position:fixed',
    'bottom:' + BOTTOM,
    'right:' + RIGHT,
    'width:' + BUTTON_SIZE,
    'height:' + BUTTON_SIZE,
    'border-radius:50%',
    'background:' + PRIMARY_COLOR,
    'color:#fff',
    'border:none',
    'cursor:pointer',
    'font-size:24px',
    'line-height:1',
    'display:flex',
    'align-items:center',
    'justify-content:center',
    'box-shadow:0 4px 16px rgba(0,0,0,0.22)',
    'z-index:2147483646',
    'transition:transform 0.2s ease,box-shadow 0.2s ease',
    'outline:none',
    'padding:0',
  ].join(';');

  // 채팅 버블 SVG 아이콘
  button.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
    '</svg>';

  button.onmouseenter = function () {
    button.style.transform = 'scale(1.08)';
    button.style.boxShadow = '0 6px 20px rgba(0,0,0,0.28)';
  };
  button.onmouseleave = function () {
    button.style.transform = 'scale(1)';
    button.style.boxShadow = '0 4px 16px rgba(0,0,0,0.22)';
  };

  // ──────────────────────────────────────────────
  // iframe 컨테이너
  // ──────────────────────────────────────────────
  var container = document.createElement('div');
  container.style.cssText = [
    'position:fixed',
    'bottom:calc(' + BOTTOM + ' + ' + BUTTON_SIZE + ' + 12px)',
    'right:' + RIGHT,
    'width:' + WIDGET_WIDTH,
    'height:' + WIDGET_HEIGHT,
    'border-radius:16px',
    'box-shadow:0 8px 40px rgba(0,0,0,0.18)',
    'overflow:hidden',
    'z-index:2147483647',
    'display:none',
    'border:1px solid rgba(0,0,0,0.08)',
    'opacity:0',
    'transform:translateY(12px) scale(0.97)',
    'transition:opacity 0.22s ease,transform 0.22s ease',
  ].join(';');

  var iframe = document.createElement('iframe');
  iframe.src = origin + '/widget';
  iframe.setAttribute('title', '사내 문서 도우미');
  iframe.setAttribute('allow', '');
  iframe.style.cssText = 'width:100%;height:100%;border:none;display:block;';
  container.appendChild(iframe);

  // ──────────────────────────────────────────────
  // 닫기 X 버튼 (컨테이너 상단)
  // ──────────────────────────────────────────────
  var closeBtn = document.createElement('button');
  closeBtn.setAttribute('aria-label', '채팅 닫기');
  closeBtn.innerHTML = '&times;';
  closeBtn.style.cssText = [
    'position:absolute',
    'top:10px',
    'right:12px',
    'width:28px',
    'height:28px',
    'border:none',
    'background:rgba(255,255,255,0.2)',
    'color:#fff',
    'font-size:18px',
    'line-height:1',
    'border-radius:50%',
    'cursor:pointer',
    'display:flex',
    'align-items:center',
    'justify-content:center',
    'z-index:1',
    'padding:0',
    'transition:background 0.15s',
  ].join(';');
  closeBtn.onmouseenter = function () { closeBtn.style.background = 'rgba(255,255,255,0.35)'; };
  closeBtn.onmouseleave = function () { closeBtn.style.background = 'rgba(255,255,255,0.2)'; };
  container.appendChild(closeBtn);

  // ──────────────────────────────────────────────
  // 열기/닫기 로직
  // ──────────────────────────────────────────────
  function openWidget() {
    isOpen = true;
    container.style.display = 'block';
    // 애니메이션을 위해 다음 프레임에 opacity/transform 변경
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        container.style.opacity = '1';
        container.style.transform = 'translateY(0) scale(1)';
      });
    });
    button.setAttribute('aria-label', '채팅 닫기');
    button.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/></svg>';
    setTimeout(function () { iframe.focus(); }, 250);
  }

  function closeWidget() {
    isOpen = false;
    container.style.opacity = '0';
    container.style.transform = 'translateY(12px) scale(0.97)';
    setTimeout(function () {
      if (!isOpen) container.style.display = 'none';
    }, 220);
    button.setAttribute('aria-label', '채팅 열기');
    button.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    button.focus();
  }

  button.addEventListener('click', function () {
    if (isOpen) closeWidget(); else openWidget();
  });
  closeBtn.addEventListener('click', closeWidget);

  // ESC 키로 닫기
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen) closeWidget();
  });

  // ──────────────────────────────────────────────
  // DOM 삽입
  // ──────────────────────────────────────────────
  function inject() {
    document.body.appendChild(container);
    document.body.appendChild(button);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
