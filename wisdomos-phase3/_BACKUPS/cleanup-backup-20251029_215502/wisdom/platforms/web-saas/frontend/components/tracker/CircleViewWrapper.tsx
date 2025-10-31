// CircleViewWrapper.tsx
import React from 'react';

export type PersonClick = (personId: string) => void;

// React version - if you have a React circle component
export function CircleViewWrapper({
  data,
  onPersonClick,
}: {
  data: any;
  onPersonClick: PersonClick;
}) {
  // Replace with your actual CircleView component
  // For now, showing a placeholder with mock interaction
  return (
    <div className="circle__wrap">
      <div className="placeholder">
        <h3>Circle View</h3>
        <p>Interactive relationship map will mount here</p>
        {/* Mock person nodes for testing */}
        <div style={{ display: 'flex', gap: '20px', marginTop: '20px', justifyContent: 'center' }}>
          <button 
            onClick={() => onPersonClick('p-anna')}
            style={{ padding: '10px', background: '#333', color: '#fff', border: '1px solid #555', borderRadius: '8px' }}
          >
            Anna Z.
          </button>
          <button 
            onClick={() => onPersonClick('p-john')}
            style={{ padding: '10px', background: '#333', color: '#fff', border: '1px solid #555', borderRadius: '8px' }}
          >
            John D.
          </button>
          <button 
            onClick={() => onPersonClick('p-sarah')}
            style={{ padding: '10px', background: '#333', color: '#fff', border: '1px solid #555', borderRadius: '8px' }}
          >
            Sarah M.
          </button>
        </div>
      </div>
    </div>
  );
}

// Iframe version - for external HTML (e.g., interactive_relationship_map.html)
export function CircleViewWrapperIframe({
  src,
  onPersonClick,
  dataForCircle,
}: {
  src: string;                   // e.g., '/interactive_relationship_map.html'
  onPersonClick: (personId: string) => void;
  dataForCircle?: any;           // optional: initial payload for the iframe
}) {
  const ref = React.useRef<HTMLIFrameElement>(null);

  // Listen for messages from the iframe
  React.useEffect(() => {
    function onMsg(ev: MessageEvent) {
      // Expect messages like: { type: 'person:click', id: 'person-123' }
      if (typeof ev.data !== 'object' || !ev.data) return;
      if (ev.data.type === 'person:click' && ev.data.id) {
        onPersonClick(String(ev.data.id));
      }
    }
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [onPersonClick]);

  // Send initial data to iframe once loaded
  React.useEffect(() => {
    const frame = ref.current;
    if (!frame) return;
    function onLoad() {
      if (dataForCircle) {
        frame.contentWindow?.postMessage({ type: 'hydrate', payload: dataForCircle }, '*');
      }
    }
    frame.addEventListener('load', onLoad);
    return () => frame.removeEventListener('load', onLoad);
  }, [dataForCircle]);

  return (
    <div className="circle__wrap">
      <iframe ref={ref} title="Circle View" src={src} className="circle__iframe" />
    </div>
  );
}