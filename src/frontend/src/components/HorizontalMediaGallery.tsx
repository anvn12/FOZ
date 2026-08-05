import React, { useRef, useState, useEffect } from "react";
import { ImageViewerModal } from "./ImageViewerModal";

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
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  // Drag-scroll physics refs
  const stateRef = useRef({
    isMouseDown: false,
    startX: 0,
    startY: 0,
    scrollLeft: 0,
    velocity: 0,
    lastX: 0,
    lastTime: 0,
    animId: 0,
    hasMoved: false,
  });

  if (!attachments || attachments.length === 0) return null;

  const imageAttachments = attachments.filter((a) => a.fileType.startsWith("image/"));
  const imageFiles = imageAttachments.map((a) => a.fileUrl);
  const isSingle = attachments.length === 1;

  const stopMomentum = () => {
    if (stateRef.current.animId) {
      cancelAnimationFrame(stateRef.current.animId);
      stateRef.current.animId = 0;
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    stopMomentum();

    stateRef.current.isMouseDown = true;
    stateRef.current.startX = e.pageX;
    stateRef.current.startY = e.pageY;
    stateRef.current.scrollLeft = containerRef.current?.scrollLeft || 0;
    stateRef.current.lastX = e.pageX;
    stateRef.current.lastTime = performance.now();
    stateRef.current.velocity = 0;
    stateRef.current.hasMoved = false;

    if (!isSingle) {
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!stateRef.current.isMouseDown || !containerRef.current) return;

    const dx = Math.abs(e.pageX - stateRef.current.startX);
    const dy = Math.abs(e.pageY - stateRef.current.startY);

    if (dx > 5 || dy > 5) {
      stateRef.current.hasMoved = true;
    }

    if (isSingle) return;
    e.preventDefault();

    const now = performance.now();
    const dt = Math.max(1, now - stateRef.current.lastTime);
    const deltaX = e.pageX - stateRef.current.lastX;

    stateRef.current.velocity = deltaX / dt;
    stateRef.current.lastX = e.pageX;
    stateRef.current.lastTime = now;

    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - (stateRef.current.startX - containerRef.current.offsetLeft)) * 1.2;
    containerRef.current.scrollLeft = stateRef.current.scrollLeft - walk;
  };

  const handleMouseUpOrLeave = () => {
    if (!stateRef.current.isMouseDown) return;
    stateRef.current.isMouseDown = false;
    setIsDragging(false);

    if (isSingle) return;

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
    if (e.shiftKey && e.deltaY !== 0) {
      containerRef.current.scrollLeft += e.deltaY;
    }
  };

  const handleImageClick = (e: React.MouseEvent, fileUrl: string) => {
    e.stopPropagation();
    if (stateRef.current.hasMoved) return;

    const idx = imageFiles.indexOf(fileUrl);
    if (idx !== -1) {
      setViewerIndex(idx);
    }
  };

  useEffect(() => {
    return () => {
      stopMomentum();
    };
  }, []);

  return (
    <>
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseUpOrLeave}
        onMouseUp={handleMouseUpOrLeave}
        onMouseMove={handleMouseMove}
        onWheel={handleWheel}
        className={`mt-3 flex flex-row gap-3 overflow-x-auto select-none rounded-2xl scroll-smooth no-card-click ${
          isDragging ? "cursor-grabbing" : isSingle ? "" : "cursor-grab"
        } scrollbar-none`}
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {attachments.map((att, idx) => {
          const isImage = att.fileType.startsWith("image/");
          return (
            <div
              key={idx}
              onClick={(e) => isImage && handleImageClick(e, att.fileUrl)}
              className={`relative overflow-hidden rounded-2xl border border-outline-variant bg-surface-container shrink-0 no-card-click ${
                isSingle
                  ? "w-full max-h-[420px]"
                  : "h-[280px] sm:h-[360px] max-w-[85vw] flex items-center justify-center"
              } ${isImage ? "cursor-pointer group" : ""}`}
            >
              {isImage ? (
                <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                  <img
                    src={att.fileUrl}
                    alt="attachment"
                    draggable={false}
                    className={`${
                      isSingle
                        ? "w-full h-full object-cover"
                        : "h-full w-auto max-w-[85vw] object-cover rounded-2xl"
                    } pointer-events-none transition-transform duration-200 group-hover:scale-[1.02]`}
                  />
                  {/* Subtle expand icon overlay on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center pointer-events-none">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 p-2.5 rounded-full text-white backdrop-blur-sm">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ) : (
                <video
                  src={att.fileUrl}
                  controls
                  onClick={(e) => e.stopPropagation()}
                  className="h-full w-auto max-w-[85vw] object-cover rounded-2xl"
                />
              )}
            </div>
          );
        })}
      </div>

      {viewerIndex !== null && (
        <ImageViewerModal
          images={imageFiles}
          initialIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
        />
      )}
    </>
  );
};

