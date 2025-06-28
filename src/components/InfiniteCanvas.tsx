'use client';

import { useEffect, useRef, useState } from 'react';
import { DOMCanvasManager, DOMPanZoomHandler, type DOMCanvasOptions, type ViewportState } from '@/packages/infinite-canvas';
import { cn } from '@/lib/utils';
import { Plus, Minus, RotateCcw, Search, Layers, Map } from 'lucide-react';

interface InfiniteCanvasProps extends DOMCanvasOptions {
  children?: React.ReactNode;
  className?: string;
  showDebug?: boolean;
  onViewportChange?: (viewport: ViewportState) => void;
}

export default function InfiniteCanvas({
  children,
  className = '',
  showDebug = false,
  onViewportChange,
  ...canvasOptions
}: InfiniteCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const managerRef = useRef<DOMCanvasManager | null>(null);
  const handlerRef = useRef<DOMPanZoomHandler | null>(null);
  const [viewport, setViewport] = useState<ViewportState>({ x: 0, y: 0, scale: 1 });

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize canvas manager
    const manager = new DOMCanvasManager(containerRef.current, {
      minScale: 0.1,
      maxScale: 5,
      scaleSensitivity: 0.001,
      enablePan: true,
      enableZoom: true,
      smoothTransitions: false,
      background: {
        type: 'dots',
        color: '#e5e7eb',
        size: 30,
        dotSize: 2
      },
      ...canvasOptions
    });

    // Initialize pan/zoom handler
    const handler = new DOMPanZoomHandler(manager);
    handler.attach();

    // Store refs for cleanup
    managerRef.current = manager;
    handlerRef.current = handler;

    // Setup viewport change tracking
    const updateViewport = () => {
      const currentViewport = manager.getViewport();
      setViewport(currentViewport);
      onViewportChange?.(currentViewport);
    };

    // Listen for viewport changes
    const interval = setInterval(updateViewport, 16); // 60fps

    // Cleanup function
    return () => {
      clearInterval(interval);
      handler.detach();
      manager.destroy();
      managerRef.current = null;
      handlerRef.current = null;
    };
  }, []);

  // Public API methods via refs
  const canvasAPI = {
    panBy: (deltaX: number, deltaY: number) => {
      managerRef.current?.panBy(deltaX, deltaY);
    },
    zoomTo: (scale: number, center?: { x: number; y: number }) => {
      managerRef.current?.zoomTo(scale, center);
    },
    zoomBy: (scaleDelta: number, center?: { x: number; y: number }) => {
      managerRef.current?.zoomBy(scaleDelta, center);
    },
    centerOn: (worldPoint: { x: number; y: number }) => {
      managerRef.current?.centerOn(worldPoint);
    },
    fit: (bounds: { minX: number; minY: number; maxX: number; maxY: number }, padding?: number) => {
      managerRef.current?.fit(bounds, padding);
    },
    reset: () => {
      managerRef.current?.reset();
    },
    getViewport: () => {
      return managerRef.current?.getViewport() || { x: 0, y: 0, scale: 1 };
    },
    screenToWorld: (screenPoint: { x: number; y: number }) => {
      return managerRef.current?.screenToWorld(screenPoint) || { x: 0, y: 0 };
    },
    worldToScreen: (worldPoint: { x: number; y: number }) => {
      return managerRef.current?.worldToScreen(worldPoint) || { x: 0, y: 0 };
    }
  };

  return (
    <div className={cn("infinite-canvas-root", className)}>
      {/* Apple-style Glass Header */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="glass-strong rounded-lg px-6 py-3 flex items-center gap-4">
          <Map className="w-5 h-5 text-accent" />
          <span className="text-sm font-medium text-foreground">Investigation Canvas</span>
          <div className="w-1 h-1 bg-accent rounded-full"></div>
        </div>
      </div>

      {/* Debug Panel - Apple Glass Style */}
      {showDebug && (
        <div className="absolute top-6 left-6 z-50 glass-card p-4 text-sm font-mono">
          <div className="flex items-center gap-2 mb-3">
            <Search className="w-4 h-4 text-accent" />
            <span className="font-medium text-foreground">Viewport</span>
          </div>
          <div className="space-y-2 text-muted">
            <div className="flex justify-between gap-4">
              <span>X:</span>
              <span className="text-foreground">{viewport.x.toFixed(1)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Y:</span>
              <span className="text-foreground">{viewport.y.toFixed(1)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Scale:</span>
              <span className="text-foreground">{viewport.scale.toFixed(2)}x</span>
            </div>
          </div>
        </div>
      )}

      {/* Floating Control Panel - Right Side */}
      <div className="absolute top-1/2 right-6 transform -translate-y-1/2 z-50 flex flex-col gap-3">
        <button
          onClick={() => canvasAPI.zoomBy(0.2)}
          className="glass-button w-12 h-12 flex items-center justify-center text-foreground hover:text-accent group"
          title="Zoom In"
        >
          <Plus className="w-5 h-5" />
        </button>
        <button
          onClick={() => canvasAPI.zoomBy(-0.2)}
          className="glass-button w-12 h-12 flex items-center justify-center text-foreground hover:text-accent group"
          title="Zoom Out"
        >
          <Minus className="w-5 h-5" />
        </button>
        <div className="w-px h-6 bg-border mx-auto"></div>
        <button
          onClick={() => canvasAPI.reset()}
          className="glass-button w-12 h-12 flex items-center justify-center text-foreground hover:text-accent group"
          title="Reset View"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
        <button
          className="glass-button w-12 h-12 flex items-center justify-center text-foreground hover:text-accent group"
          title="Layers"
        >
          <Layers className="w-5 h-5" />
        </button>
      </div>


      {/* Canvas Container */}
      <div 
        ref={containerRef}
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        style={{ touchAction: 'none' }}
      >
        {children}
      </div>
    </div>
  );
}