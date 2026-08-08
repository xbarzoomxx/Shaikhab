"use client";

import { useRef, useState, useCallback, useEffect } from "react";

const MIN_SCALE = 0.15;
const MAX_SCALE = 2.5;

export default function PanZoom({ children, contentWidth, contentHeight, className = "" }) {
  const viewportRef = useRef(null);
  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
  const pointers = useRef(new Map());
  const dragState = useRef(null);
  const pinchState = useRef(null);

  // Auto-fit the whole tree in the viewport on first mount / size change.
  useEffect(() => {
    const el = viewportRef.current;
    if (!el || !contentWidth || !contentHeight) return;
    const fit = () => {
      const vw = el.clientWidth;
      const vh = el.clientHeight;
      const scale = Math.min(vw / (contentWidth + 80), vh / (contentHeight + 80), 1);
      const clamped = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale));
      setTransform({
        scale: clamped,
        x: (vw - contentWidth * clamped) / 2,
        y: 40,
      });
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentWidth, contentHeight]);

  const zoomAt = useCallback((clientX, clientY, factor) => {
    const el = viewportRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = clientX - rect.left;
    const py = clientY - rect.top;
    setTransform((t) => {
      const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, t.scale * factor));
      const ratio = newScale / t.scale;
      return {
        scale: newScale,
        x: px - (px - t.x) * ratio,
        y: py - (py - t.y) * ratio,
      };
    });
  }, []);

  const onWheel = useCallback(
    (e) => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.1 : 0.9;
      zoomAt(e.clientX, e.clientY, factor);
    },
    [zoomAt]
  );

  const onPointerDown = useCallback((e) => {
    viewportRef.current?.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size === 1) {
      dragState.current = { startX: e.clientX, startY: e.clientY };
    } else if (pointers.current.size === 2) {
      dragState.current = null;
      const pts = Array.from(pointers.current.values());
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const mid = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
      pinchState.current = { dist, mid };
    }
  }, []);

  const onPointerMove = useCallback((e) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size === 1 && dragState.current) {
      setTransform((t) => ({
        ...t,
        x: t.x + (e.clientX - dragState.current.startX),
        y: t.y + (e.clientY - dragState.current.startY),
      }));
      dragState.current = { startX: e.clientX, startY: e.clientY };
    } else if (pointers.current.size === 2 && pinchState.current) {
      const pts = Array.from(pointers.current.values());
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const factor = dist / pinchState.current.dist;
      zoomAt(pinchState.current.mid.x, pinchState.current.mid.y, factor);
      pinchState.current = { dist, mid: pinchState.current.mid };
    }
  }, [zoomAt]);

  const endPointer = useCallback((e) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size === 0) dragState.current = null;
    if (pointers.current.size < 2) pinchState.current = null;
  }, []);

  return (
    <div className={`relative ${className}`}>
      <div
        ref={viewportRef}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPointer}
        onPointerCancel={endPointer}
        onPointerLeave={endPointer}
        className="w-full h-full overflow-hidden touch-none cursor-grab active:cursor-grabbing"
      >
        <div
          style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
            transformOrigin: "0 0",
            width: contentWidth,
            height: contentHeight,
          }}
        >
          {children}
        </div>
      </div>

      <div className="absolute bottom-3 left-3 flex flex-col gap-1 bg-surface border border-line rounded-lg shadow-sm overflow-hidden">
        <button
          onClick={(e) => zoomAt(e.currentTarget.getBoundingClientRect().left, e.currentTarget.getBoundingClientRect().top, 1.25)}
          className="focus-ring w-9 h-9 flex items-center justify-center hover:bg-primary-light text-lg"
          aria-label="تكبير"
        >
          +
        </button>
        <button
          onClick={(e) => zoomAt(e.currentTarget.getBoundingClientRect().left, e.currentTarget.getBoundingClientRect().top, 0.8)}
          className="focus-ring w-9 h-9 flex items-center justify-center hover:bg-primary-light text-lg border-t border-line"
          aria-label="تصغير"
        >
          −
        </button>
      </div>
    </div>
  );
}
