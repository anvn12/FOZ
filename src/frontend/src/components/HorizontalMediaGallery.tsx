import React, { useRef, useState, useEffect } from "react";

export interface Attachment {
  fileUrl: string;
  fileType: string;
  fileSize?: number;
}

export const HorizontalMediaGallery: React.FC<{ attachments: Attachment[] }> = ({
  attachments,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Drag-scroll physics refs
  const stateRef = useRef({
    isMouseDown: false,
    startX: 0,
    scrollLeft: 0,
    velocity: 0,
    lastX: 0,
    lastTime: 0,
    animId: 0,
  });

  if (!attachments || attachments.length === 0) return null;

  const isSingle = attachments.length === 1;

  const stopMomentum = () => {
    if (stateRef.current.animId) {
      cancelAnimationFrame(stateRef.current.animId);
      stateRef.current.animId = 0;
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isSingle || !containerRef.current) return;
    stopMomentum();

    stateRef.current.isMouseDown = true;
    stateRef.current.startX = e.pageX - containerRef.current.offsetLeft;
    stateRef.current.scrollLeft = containerRef.current.scrollLeft;
    stateRef.current.lastX = e.pageX;
    stateRef.current.lastTime = performance.now();
    stateRef.current.velocity = 0;

    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!stateRef.current.isMouseDown || !containerRef.current) return;
    e.preventDefault();

    const now = performance.now();
    const dt = Math.max(1, now - stateRef.current.lastTime);
    const dx = e.pageX - stateRef.current.lastX;

    stateRef.current.velocity = dx / dt;
    stateRef.current.lastX = e.pageX;
    stateRef.current.lastTime = now;

    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - stateRef.current.startX) * 1.2;
    containerRef.current.scrollLeft = stateRef.current.scrollLeft - walk;
  };

  const handleMouseUpOrLeave = () => {
    if (!stateRef.current.isMouseDown) return;
    stateRef.current.isMouseDown = false;
    setIsDragging(false);

    // Apply smooth momentum scroll coasting
    if (!containerRef.current || Math.abs(stateRef.current.velocity) < 0.1) return;

    let currentVelocity = stateRef.current.velocity * 14;

    const step = () => {
      if (!containerRef.current || Math.abs(currentVelocity) < 0.5) {
        stopMomentum();
        return;
      }
      containerRef.current.scrollLeft -= currentVelocity;
      currentVelocity *= 0.92; // friction decay
      stateRef.current.animId = requestAnimationFrame(step);
    };

    stopMomentum();
    stateRef.current.animId = requestAnimationFrame(step);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (isSingle || !containerRef.current) return;
    stopMomentum();
    if (e.deltaY !== 0) {
      containerRef.current.scrollBy({
        left: e.deltaY * 1.2,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    return () => {
      stopMomentum();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseUpOrLeave}
      onMouseUp={handleMouseUpOrLeave}
      onMouseMove={handleMouseMove}
      onWheel={handleWheel}
      className={`mt-3 flex flex-row gap-3 overflow-x-auto select-none rounded-2xl scroll-smooth ${
        isDragging ? "cursor-grabbing" : isSingle ? "" : "cursor-grab"
      } scrollbar-none`}
      style={{
        scrollbarWidth: "none",
        msOverflowStyle: "none",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {attachments.map((att, idx) => (
        <div
          key={idx}
          className={`relative overflow-hidden rounded-2xl border border-outline-variant bg-surface-container shrink-0 ${
            isSingle
              ? "w-full max-h-[420px]"
              : "h-[280px] sm:h-[360px] max-w-[85vw] flex items-center justify-center"
          }`}
        >
          {att.fileType.startsWith("image/") ? (
            <img
              src={att.fileUrl}
              alt="attachment"
              draggable={false}
              className={`${
                isSingle
                  ? "w-full h-full object-cover"
                  : "h-full w-auto max-w-[85vw] object-cover rounded-2xl"
              } pointer-events-none transition-transform duration-200`}
            />
          ) : (
            <video
              src={att.fileUrl}
              controls
              className="h-full w-auto max-w-[85vw] object-cover rounded-2xl"
            />
          )}
        </div>
      ))}
    </div>
  );
};
