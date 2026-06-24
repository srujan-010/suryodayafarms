import React, { useState, useRef, useEffect } from 'react';
import { FiZoomIn, FiCheck, FiX, FiMove } from 'react-icons/fi';

export default function ImageCropper({ imageSrc, onCropComplete, onCancel, targetAspect = 4 / 3 }) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const [imgDimensions, setImgDimensions] = useState({ width: 0, height: 0 });
  const [viewportSize, setViewportSize] = useState({ width: 400, height: 300 });
  const containerRef = useRef(null);
  const imageRef = useRef(null);

  // Crop Box State
  const [cropBox, setCropBox] = useState({ x: 0, y: 0, width: 100, height: 100 });
  const [activeHandle, setActiveHandle] = useState(null); // 'move', 'tl', 'tr', 'bl', 'br', 't', 'b', 'l', 'r'
  const dragStartBox = useRef({ x: 0, y: 0, width: 100, height: 100 });
  const dragStartPointer = useRef({ x: 0, y: 0 });

  // Resize listener for responsive viewport scaling
  useEffect(() => {
    if (containerRef.current) {
      const width = Math.min(containerRef.current.clientWidth, 500);
      const height = width / targetAspect;
      setViewportSize({ width, height });
    }
  }, [targetAspect]);

  const handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    setImgDimensions({ width: naturalWidth, height: naturalHeight });
    setPan({ x: 0, y: 0 });
    setZoom(1);
  };

  // Helper math for calculations
  const getRenderDetails = () => {
    if (!imgDimensions.width || !viewportSize.width || !cropBox.width) return null;

    // Calculate baseScale to fit the entire image inside the crop area by default
    const baseScale = Math.min(
      cropBox.width / imgDimensions.width,
      cropBox.height / imgDimensions.height
    );

    const baseWidth = imgDimensions.width * baseScale;
    const baseHeight = imgDimensions.height * baseScale;

    const zoomedWidth = baseWidth * zoom;
    const zoomedHeight = baseHeight * zoom;

    // Bounds for clamping pan (allow dragging even when zoomed out below 100%)
    const maxPanX = Math.max(viewportSize.width, zoomedWidth) / 2;
    const maxPanY = Math.max(viewportSize.height, zoomedHeight) / 2;

    return {
      baseScale,
      zoomedWidth,
      zoomedHeight,
      maxPanX,
      maxPanY,
      totalScale: baseScale * zoom
    };
  };

  const renderDetails = getRenderDetails();

  // Initialize crop box size and position centered in viewport
  useEffect(() => {
    if (viewportSize.width) {
      const w = viewportSize.width * 0.85;
      const h = w / targetAspect;
      const x = (viewportSize.width - w) / 2;
      const y = (viewportSize.height - h) / 2;
      setCropBox({ x, y, width: w, height: h });
    }
  }, [viewportSize, targetAspect]);

  // Clamp crop box within viewport when container size or aspect ratio changes
  useEffect(() => {
    if (viewportSize.width && cropBox.width > 0) {
      setCropBox((prev) => {
        let { x, y, width, height } = prev;
        width = Math.min(width, viewportSize.width);
        height = width / targetAspect;
        if (height > viewportSize.height) {
          height = viewportSize.height;
          width = height * targetAspect;
        }
        x = Math.max(0, Math.min(x, viewportSize.width - width));
        y = Math.max(0, Math.min(y, viewportSize.height - height));
        return { x, y, width, height };
      });
    }
  }, [viewportSize, targetAspect]);

  // Clamp pan function (for panning the image underneath)
  const clampPan = (x, y, details) => {
    if (!details) return { x, y };
    return {
      x: Math.min(Math.max(x, -details.maxPanX), details.maxPanX),
      y: Math.min(Math.max(y, -details.maxPanY), details.maxPanY)
    };
  };

  // Viewport Background Drag (Pans the image underneath)
  const handleViewportStart = (clientX, clientY) => {
    setIsDragging(true);
    dragStart.current = { x: clientX - pan.x, y: clientY - pan.y };
  };

  const handleViewportMove = (clientX, clientY) => {
    if (!isDragging || !renderDetails) return;
    const rawX = clientX - dragStart.current.x;
    const rawY = clientY - dragStart.current.y;
    setPan(clampPan(rawX, rawY, renderDetails));
  };

  // Crop Box Drag & Resize Handlers
  const handleCropBoxStart = (e, handle) => {
    e.preventDefault();
    e.stopPropagation();

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    setActiveHandle(handle);
    dragStartPointer.current = { x: clientX, y: clientY };
    dragStartBox.current = { ...cropBox };
  };

  // Global Mouse/Touch Move effect for Crop Box resize/drag
  useEffect(() => {
    if (!activeHandle) return;

    const handlePointerMove = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      const dx = clientX - dragStartPointer.current.x;
      const dy = clientY - dragStartPointer.current.y;
      const start = dragStartBox.current;

      const minW = 60;
      const minH = minW / targetAspect;

      let nextBox = { ...start };

      if (activeHandle === 'move') {
        let newX = start.x + dx;
        let newY = start.y + dy;

        // Clamp to viewport borders
        newX = Math.max(0, Math.min(newX, viewportSize.width - start.width));
        newY = Math.max(0, Math.min(newY, viewportSize.height - start.height));

        nextBox = { ...start, x: newX, y: newY };
      } else {
        // Resizing corners & edges (locked aspect ratio)
        if (activeHandle === 'br' || activeHandle === 'r' || activeHandle === 'b') {
          // Bottom-Right or Side Bottom/Right
          let w = start.width + (activeHandle === 'b' ? dy * targetAspect : dx);
          let h = w / targetAspect;

          const maxW = viewportSize.width - start.x;
          const maxH = viewportSize.height - start.y;

          if (w > maxW) { w = maxW; h = w / targetAspect; }
          if (h > maxH) { h = maxH; w = h * targetAspect; }
          if (w < minW) { w = minW; h = minH; }

          nextBox = { ...start, width: w, height: h };
        } else if (activeHandle === 'tl' || activeHandle === 't' || activeHandle === 'l') {
          // Top-Left or Side Top/Left
          const factor = activeHandle === 't' ? -dy : -dx;
          let w = start.width + (activeHandle === 't' ? factor * targetAspect : factor);
          let h = w / targetAspect;

          const maxW = start.x + start.width;
          const maxH = start.y + start.height;

          if (w > maxW) { w = maxW; h = w / targetAspect; }
          if (h > maxH) { h = maxH; w = h * targetAspect; }
          if (w < minW) { w = minW; h = minH; }

          const fixedRight = start.x + start.width;
          const fixedBottom = start.y + start.height;

          nextBox = {
            x: fixedRight - w,
            y: fixedBottom - h,
            width: w,
            height: h
          };
        } else if (activeHandle === 'tr') {
          // Top-Right
          let w = start.width + dx;
          let h = w / targetAspect;

          const maxW = viewportSize.width - start.x;
          const maxH = start.y + start.height;

          if (w > maxW) { w = maxW; h = w / targetAspect; }
          if (h > maxH) { h = maxH; w = h * targetAspect; }
          if (w < minW) { w = minW; h = minH; }

          const fixedBottom = start.y + start.height;

          nextBox = {
            x: start.x,
            y: fixedBottom - h,
            width: w,
            height: h
          };
        } else if (activeHandle === 'bl') {
          // Bottom-Left
          let w = start.width - dx;
          let h = w / targetAspect;

          const maxW = start.x + start.width;
          const maxH = viewportSize.height - start.y;

          if (w > maxW) { w = maxW; h = w / targetAspect; }
          if (h > maxH) { h = maxH; w = h * targetAspect; }
          if (w < minW) { w = minW; h = minH; }

          const fixedRight = start.x + start.width;

          nextBox = {
            x: fixedRight - w,
            y: start.y,
            width: w,
            height: h
          };
        }
      }

      setCropBox(nextBox);
    };

    const handlePointerUp = () => {
      setActiveHandle(null);
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchmove', handlePointerMove, { passive: false });
    window.addEventListener('touchend', handlePointerUp);

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [activeHandle, zoom, pan, viewportSize, targetAspect, renderDetails]);

  // Handle Apply button
  const handleApply = () => {
    if (!renderDetails || !imgDimensions.width) return;

    const { totalScale } = renderDetails;

    // Image top-left relative to viewport
    const baseWidth = imgDimensions.width * renderDetails.baseScale;
    const baseHeight = imgDimensions.height * renderDetails.baseScale;
    const imgWidth = baseWidth * zoom;
    const imgHeight = baseHeight * zoom;
    const imgLeft = (viewportSize.width - imgWidth) / 2 + pan.x;
    const imgTop = (viewportSize.height - imgHeight) / 2 + pan.y;

    // Crop box coordinates relative to panned/zoomed image
    const relativeLeft = cropBox.x - imgLeft;
    const relativeTop = cropBox.y - imgTop;

    // Convert screen coordinates to original image coordinates
    const cropX = Math.max(0, Math.round(relativeLeft / totalScale));
    const cropY = Math.max(0, Math.round(relativeTop / totalScale));
    const cropWidth = Math.min(imgDimensions.width - cropX, Math.round(cropBox.width / totalScale));
    const cropHeight = Math.min(imgDimensions.height - cropY, Math.round(cropBox.height / totalScale));

    const cropData = {
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      zoom,
      aspectRatio: `${Math.round(targetAspect * 10) / 10}:1`
    };

    // Perform client-side cropping using Canvas
    const imgElement = imageRef.current;
    if (imgElement) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = cropWidth;
        canvas.height = cropHeight;

        ctx.drawImage(
          imgElement,
          cropX,
          cropY,
          cropWidth,
          cropHeight,
          0,
          0,
          cropWidth,
          cropHeight
        );

        try {
          const croppedBase64 = canvas.toDataURL('image/jpeg', 0.9);
          onCropComplete({
            ...cropData,
            croppedImage: croppedBase64
          });
          return;
        } catch (canvasErr) {
          console.error('[Canvas Cropping Error] Fallback to raw crop details:', canvasErr);
        }
      }
    }

    onCropComplete(cropData);
  };

  // Helper to generate simulator styling in real time
  const getPreviewStyle = (simWidth, simHeight) => {
    if (!renderDetails || !imgDimensions.width) return {};

    const { totalScale } = renderDetails;

    // Image top-left relative to viewport
    const baseWidth = imgDimensions.width * renderDetails.baseScale;
    const baseHeight = imgDimensions.height * renderDetails.baseScale;
    const imgWidth = baseWidth * zoom;
    const imgHeight = baseHeight * zoom;
    const imgLeft = (viewportSize.width - imgWidth) / 2 + pan.x;
    const imgTop = (viewportSize.height - imgHeight) / 2 + pan.y;

    const relativeLeft = cropBox.x - imgLeft;
    const relativeTop = cropBox.y - imgTop;
    const scaleFactor = simWidth / cropBox.width;

    return {
      width: `${imgWidth * scaleFactor}px`,
      height: `${imgHeight * scaleFactor}px`,
      left: `${-relativeLeft * scaleFactor}px`,
      top: `${-relativeTop * scaleFactor}px`,
      position: 'absolute',
      maxWidth: 'none',
      maxHeight: 'none',
      transform: 'none'
    };
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0E1204]/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-[#EDE7D9] rounded-[28px] max-w-4xl w-full p-6 md:p-8 shadow-2xl flex flex-col gap-6 max-h-[95vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-stone-100 pb-3">
          <div>
            <h3 className="font-serif text-lg md:text-xl font-bold text-[#2F3B0C]">Crop & Adjust Image</h3>
            <p className="text-[10px] text-stone-450 uppercase font-bold tracking-wider mt-0.5">Position Your Image • Zoom & Crop framing</p>
          </div>
          <button 
            onClick={onCancel}
            className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-50 rounded-full transition cursor-pointer border-none bg-transparent"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Workspace Body */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          {/* Main Cropping Canvas Area */}
          <div className="md:col-span-7 flex flex-col items-center gap-4">
            <div 
              ref={containerRef}
              className="w-full flex justify-center items-center"
            >
              <div 
                className="relative overflow-hidden border border-[#EDE7D9] bg-stone-100 shadow-md select-none rounded-2xl cursor-grab active:cursor-grabbing touch-none"
                style={{
                  width: `${viewportSize.width}px`,
                  height: `${viewportSize.height}px`
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleViewportStart(e.clientX, e.clientY);
                }}
                onMouseMove={(e) => {
                  handleViewportMove(e.clientX, e.clientY);
                }}
                onMouseUp={() => setIsDragging(false)}
                onMouseLeave={() => setIsDragging(false)}
                onTouchStart={(e) => {
                  if (e.touches.length === 1) {
                    handleViewportStart(e.touches[0].clientX, e.touches[0].clientY);
                  }
                }}
                onTouchMove={(e) => {
                  if (e.touches.length === 1) {
                    handleViewportMove(e.touches[0].clientX, e.touches[0].clientY);
                  }
                }}
                onTouchEnd={() => setIsDragging(false)}
              >
                {/* Image under test */}
                <img
                  ref={imageRef}
                  src={imageSrc}
                  alt="Uploader preview"
                  onLoad={handleImageLoad}
                  draggable={false}
                  className="absolute origin-center max-w-none select-none pointer-events-none"
                  style={{
                    width: renderDetails ? `${renderDetails.zoomedWidth}px` : 'auto',
                    height: renderDetails ? `${renderDetails.zoomedHeight}px` : 'auto',
                    left: '50%',
                    top: '50%',
                    transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px))`,
                    transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                  }}
                />

                {/* 4 dark surrounding overlay panels */}
                <div 
                  className="absolute bg-black/35 pointer-events-none z-20"
                  style={{ left: 0, top: 0, width: '100%', height: `${Math.max(0, cropBox.y)}px` }}
                />
                <div 
                  className="absolute bg-black/35 pointer-events-none z-20"
                  style={{ left: 0, top: `${cropBox.y + cropBox.height}px`, width: '100%', height: `${Math.max(0, viewportSize.height - (cropBox.y + cropBox.height))}px` }}
                />
                <div 
                  className="absolute bg-black/35 pointer-events-none z-20"
                  style={{ left: 0, top: `${cropBox.y}px`, width: `${Math.max(0, cropBox.x)}px`, height: `${cropBox.height}px` }}
                />
                <div 
                  className="absolute bg-black/35 pointer-events-none z-20"
                  style={{ left: `${cropBox.x + cropBox.width}px`, top: `${cropBox.y}px`, width: `${Math.max(0, viewportSize.width - (cropBox.x + cropBox.width))}px`, height: `${cropBox.height}px` }}
                />

                {/* Crop boundary rectangle */}
                <div 
                  className="absolute border-2 border-white rounded-lg shadow-md z-30 cursor-move select-none"
                  style={{
                    left: `${cropBox.x}px`,
                    top: `${cropBox.y}px`,
                    width: `${cropBox.width}px`,
                    height: `${cropBox.height}px`,
                    boxShadow: '0 0 0 1px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(0,0,0,0.1)'
                  }}
                  onMouseDown={(e) => handleCropBoxStart(e, 'move')}
                  onTouchStart={(e) => handleCropBoxStart(e, 'move')}
                >
                  {/* Grid Lines inside crop box (standard crop grid overlay) */}
                  <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 border border-white/20 pointer-events-none">
                    <div className="border-r border-b border-white/20"></div>
                    <div className="border-r border-b border-white/20"></div>
                    <div className="border-b border-white/20"></div>
                    <div className="border-r border-b border-white/20"></div>
                    <div className="border-r border-b border-white/20"></div>
                    <div className="border-b border-white/20"></div>
                    <div className="border-r border-white/20"></div>
                    <div className="border-r border-white/20"></div>
                    <div></div>
                  </div>

                  {/* Corner Handles */}
                  {/* Top-Left */}
                  <div 
                    className="absolute w-3.5 h-3.5 bg-white border border-stone-400 rounded-full shadow-sm cursor-nwse-resize -left-1.5 -top-1.5 z-40 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
                    onMouseDown={(e) => handleCropBoxStart(e, 'tl')}
                    onTouchStart={(e) => handleCropBoxStart(e, 'tl')}
                  />
                  {/* Top-Right */}
                  <div 
                    className="absolute w-3.5 h-3.5 bg-white border border-stone-400 rounded-full shadow-sm cursor-nesw-resize -right-1.5 -top-1.5 z-40 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
                    onMouseDown={(e) => handleCropBoxStart(e, 'tr')}
                    onTouchStart={(e) => handleCropBoxStart(e, 'tr')}
                  />
                  {/* Bottom-Left */}
                  <div 
                    className="absolute w-3.5 h-3.5 bg-white border border-stone-400 rounded-full shadow-sm cursor-nesw-resize -left-1.5 -bottom-1.5 z-40 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
                    onMouseDown={(e) => handleCropBoxStart(e, 'bl')}
                    onTouchStart={(e) => handleCropBoxStart(e, 'bl')}
                  />
                  {/* Bottom-Right */}
                  <div 
                    className="absolute w-3.5 h-3.5 bg-white border border-stone-400 rounded-full shadow-sm cursor-nwse-resize -right-1.5 -bottom-1.5 z-40 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
                    onMouseDown={(e) => handleCropBoxStart(e, 'br')}
                    onTouchStart={(e) => handleCropBoxStart(e, 'br')}
                  />

                  {/* Side Edge Handles */}
                  {/* Top */}
                  <div 
                    className="absolute w-5 h-2 bg-white border border-stone-400 rounded-full shadow-sm cursor-ns-resize left-1/2 -translate-x-1/2 -top-1.2 z-40 hover:scale-110 active:scale-95 transition-transform"
                    onMouseDown={(e) => handleCropBoxStart(e, 't')}
                    onTouchStart={(e) => handleCropBoxStart(e, 't')}
                  />
                  {/* Bottom */}
                  <div 
                    className="absolute w-5 h-2 bg-white border border-stone-400 rounded-full shadow-sm cursor-ns-resize left-1/2 -translate-x-1/2 -bottom-1.2 z-40 hover:scale-110 active:scale-95 transition-transform"
                    onMouseDown={(e) => handleCropBoxStart(e, 'b')}
                    onTouchStart={(e) => handleCropBoxStart(e, 'b')}
                  />
                  {/* Left */}
                  <div 
                    className="absolute w-2 h-5 bg-white border border-stone-400 rounded-full shadow-sm cursor-ew-resize -left-1 top-1/2 -translate-y-1/2 z-40 hover:scale-110 active:scale-95 transition-transform"
                    onMouseDown={(e) => handleCropBoxStart(e, 'l')}
                    onTouchStart={(e) => handleCropBoxStart(e, 'l')}
                  />
                  {/* Right */}
                  <div 
                    className="absolute w-2 h-5 bg-white border border-stone-400 rounded-full shadow-sm cursor-ew-resize -right-1 top-1/2 -translate-y-1/2 z-40 hover:scale-110 active:scale-95 transition-transform"
                    onMouseDown={(e) => handleCropBoxStart(e, 'r')}
                    onTouchStart={(e) => handleCropBoxStart(e, 'r')}
                  />
                </div>

                <div className="absolute bottom-2 left-2 bg-[#2F3B0C]/80 text-white text-[7px] px-2 py-1 rounded backdrop-blur-xs flex items-center gap-1 z-20 pointer-events-none">
                  <FiMove size={8} /> Position frame/Drag background to pan
                </div>
              </div>
            </div>

            {/* Slider zoom */}
            <div className="w-full max-w-sm flex items-center gap-3">
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">Zoom</span>
              <input
                type="range"
                min="0.3"
                max="4"
                step="0.01"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="flex-1 accent-[#4E641A] cursor-pointer h-1.5 bg-stone-100 rounded-lg appearance-none"
              />
              <span className="text-[10px] font-bold text-[#4E641A] min-w-[30px]">{Math.round(zoom * 100)}%</span>
            </div>
          </div>

          {/* Right Live Device Simulator Previews */}
          <div className="md:col-span-5 space-y-4 border-l border-stone-100 pl-0 md:pl-6 text-left">
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#C68A2B]">Dynamic Simulator Previews</span>
            
            <div className="space-y-3">
              {/* Desktop Sim */}
              <div className="space-y-1">
                <span className="text-[8px] font-bold text-stone-400 uppercase tracking-wider">Desktop Showcase Simulator (Horizontal)</span>
                <div 
                  className="border border-stone-100 rounded-xl overflow-hidden shadow-xxs relative bg-stone-50"
                  style={{ height: '80px', width: `${80 * targetAspect}px` }}
                >
                  <div className="absolute inset-0 overflow-hidden">
                    {imgDimensions.width > 0 && renderDetails && (
                      <img
                        src={imageSrc}
                        alt="Desktop Sim"
                        style={getPreviewStyle(80 * targetAspect, 80)}
                      />
                    )}
                  </div>
                  <div className="absolute bottom-1.5 left-2 bg-[#2F3B0C]/80 text-white text-[6px] px-1.5 py-0.5 rounded font-medium z-10 pointer-events-none">Desktop Hero Card</div>
                </div>
              </div>

              {/* Mobile Sim */}
              <div className="space-y-1">
                <span className="text-[8px] font-bold text-stone-400 uppercase tracking-wider">Mobile Card Showcase Simulator (Narrow aspect)</span>
                <div className="flex gap-4 items-center">
                  <div 
                    className="border border-stone-100 rounded-xl overflow-hidden shadow-xxs relative bg-stone-50 shrink-0"
                    style={{ height: '96px', width: '96px' }}
                  >
                    <div className="absolute inset-0 overflow-hidden">
                      {imgDimensions.width > 0 && renderDetails && (
                        <img
                          src={imageSrc}
                          alt="Mobile Sim"
                          style={getPreviewStyle(96, 96)}
                        />
                      )}
                    </div>
                    <div className="absolute bottom-1 left-1.5 bg-[#C68A2B]/90 text-white text-[5px] px-1 py-0.2 rounded font-bold uppercase z-10 pointer-events-none">Mobile fit</div>
                  </div>
                  <div className="text-[9px] text-stone-500 leading-relaxed font-medium">
                    <p className="font-bold text-[#2F3B0C]">Autofit Responsive Layout</p>
                    Ensure core product branding or packaging labels are centered in the mobile preview box without clipping edges.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="flex justify-end gap-3 border-t border-stone-100 pt-4 mt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl border border-stone-200 text-stone-500 hover:bg-stone-50 uppercase font-bold text-xxs tracking-wider cursor-pointer"
          >
            Discard
          </button>
          <button
            type="button"
            onClick={() => onCropComplete({ croppedImage: imageSrc, useOriginal: true })}
            className="px-5 py-2.5 rounded-xl border border-[#4E641A] text-[#4E641A] hover:bg-[#4E641A]/5 uppercase font-bold text-xxs tracking-wider cursor-pointer bg-transparent"
          >
            Use Original (No Crop)
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-6 py-2.5 bg-[#4E641A] hover:bg-[#37411A] text-white rounded-xl uppercase font-bold text-xxs tracking-wider cursor-pointer flex items-center gap-1.5 border-none"
          >
            <FiCheck /> Crop & Adjust Image
          </button>
        </div>

      </div>
    </div>
  );
}
