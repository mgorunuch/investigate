'use client';

import { useEffect, useRef, useState, forwardRef, useImperativeHandle, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { DOMCanvasManager, DOMPanZoomHandler, type DOMCanvasOptions, type ViewportState } from '@/packages/infinite-canvas';
import { cn } from '@/lib/utils';
import { Plus, Minus, RotateCcw, Search, Layers, Map } from 'lucide-react';

/**
 * Props for the InfiniteCanvas component
 */
interface InfiniteCanvasProps extends DOMCanvasOptions {
  /** React children to render inside the canvas viewport */
  children?: React.ReactNode;
  /** Additional CSS classes to apply to the canvas container */
  className?: string;
  /** Whether to show the debug viewport information panel */
  showDebug?: boolean;
  /** Callback fired when the viewport state changes */
  onViewportChange?: (viewport: ViewportState) => void;
}

/**
 * Public API interface for the InfiniteCanvas component
 */
export interface InfiniteCanvasRef {
  /** Pan the viewport by the specified pixel deltas */
  panBy: (deltaX: number, deltaY: number) => void;
  /** Zoom to a specific scale level, optionally around a center point */
  zoomTo: (scale: number, center?: { x: number; y: number }) => void;
  /** Zoom by a relative scale delta, optionally around a center point */
  zoomBy: (scaleDelta: number, center?: { x: number; y: number }) => void;
  /** Center the viewport on a specific world coordinate */
  centerOn: (worldPoint: { x: number; y: number }) => void;
  /** Fit the viewport to contain the specified world bounds with optional padding */
  fit: (bounds: { minX: number; minY: number; maxX: number; maxY: number }, padding?: number) => void;
  /** Reset the viewport to its initial state (0,0,1) */
  reset: () => void;
  /** Get the current viewport state */
  getViewport: () => ViewportState;
  /** Convert screen coordinates to world coordinates */
  screenToWorld: (screenPoint: { x: number; y: number }) => { x: number; y: number };
  /** Convert world coordinates to screen coordinates */
  worldToScreen: (worldPoint: { x: number; y: number }) => { x: number; y: number };
}

/**
 * InfiniteCanvas component provides an infinite zoomable and pannable canvas
 * for rendering and interacting with elements in a virtual world space.
 * 
 * Features:
 * - Infinite pan and zoom with smooth transitions
 * - Event-driven viewport updates for performance
 * - Customizable backgrounds (dots, grid, or none)
 * - Touch and mouse input support
 * - Type-safe API with error handling
 * - Debug mode with viewport information
 * 
 * @example
 * ```tsx
 * const canvasRef = useRef<InfiniteCanvasRef>(null);
 * 
 * return (
 *   <InfiniteCanvas 
 *     ref={canvasRef}
 *     onViewportChange={(viewport) => console.log(viewport)}
 *     showDebug={true}
 *   >
 *     <div style={{ position: 'absolute', left: 100, top: 100 }}>
 *       Content in world space
 *     </div>
 *   </InfiniteCanvas>
 * );
 * ```
 */
const InfiniteCanvas = forwardRef<InfiniteCanvasRef, InfiniteCanvasProps>(({
  children,
  className = '',
  showDebug = false,
  onViewportChange,
  ...canvasOptions
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLElement>(null);
  const [isViewportReady, setIsViewportReady] = useState(false);
  const [viewportKey, setViewportKey] = useState(0);
  const managerRef = useRef<DOMCanvasManager | null>(null);
  const handlerRef = useRef<DOMPanZoomHandler | null>(null);
  const [viewport, setViewport] = useState<ViewportState>({ x: 0, y: 0, scale: 1 });

  // Use ref to avoid dependency issues with callback
  const onViewportChangeRef = useRef(onViewportChange);
  onViewportChangeRef.current = onViewportChange;

  // Memoize canvas options to prevent unnecessary effect re-runs
  const stableCanvasOptions = useMemo(() => ({
    minScale: 0.1,
    maxScale: 5,
    scaleSensitivity: 0.001,
    enablePan: true,
    enableZoom: true,
    smoothTransitions: false,
    background: {
      type: 'dots' as const,
      color: '#e5e7eb',
      size: 30,
      dotSize: 2
    },
    ...canvasOptions
  }), [
    JSON.stringify(canvasOptions)
  ]);

  useEffect(() => {
    if (!containerRef.current) return;

    try {
      // Initialize canvas manager
      const manager = new DOMCanvasManager(containerRef.current, stableCanvasOptions);

      // Get the viewport element that the manager created and store reference
      const viewportElement = manager.getViewportElement();
      if (viewportElement) {
        viewportRef.current = viewportElement;
        setViewportKey(Date.now()); // Force new portal creation
        setIsViewportReady(true);
      }

      // Initialize pan/zoom handler
      const handler = new DOMPanZoomHandler(manager);
      handler.attach();

      // Store refs for cleanup
      managerRef.current = manager;
      handlerRef.current = handler;

      // Setup event-driven viewport change tracking
      const updateViewport = (currentViewport: ViewportState) => {
        try {
          setViewport(currentViewport);
          onViewportChangeRef.current?.(currentViewport);
        } catch (error) {
          console.error('Error updating viewport:', error);
        }
      };

      // Subscribe to viewport changes instead of polling
      const unsubscribe = manager.onViewportChange(updateViewport);

      // Initial viewport update
      updateViewport(manager.getViewport());

      // Cleanup function
      return () => {
        try {
          // Clear viewport first to prevent portal from rendering
          setIsViewportReady(false);
          
          unsubscribe();
          handler.detach();
          manager.destroy();
        } catch (error) {
          console.error('Error during canvas cleanup:', error);
        } finally {
          managerRef.current = null;
          handlerRef.current = null;
          viewportRef.current = null;
        }
      };
    } catch (error) {
      console.error('Error initializing canvas:', error);
      // Fallback: Reset refs to null
      managerRef.current = null;
      handlerRef.current = null;
      viewportRef.current = null;
    }
  }, [stableCanvasOptions]);

  // Public API methods via refs - memoized to prevent re-creation
  const canvasAPI = useMemo(() => ({
    panBy: (deltaX: number, deltaY: number) => {
      try {
        managerRef.current?.panBy(deltaX, deltaY);
      } catch (error) {
        console.error('Error in panBy:', error);
      }
    },
    zoomTo: (scale: number, center?: { x: number; y: number }) => {
      try {
        managerRef.current?.zoomTo(scale, center);
      } catch (error) {
        console.error('Error in zoomTo:', error);
      }
    },
    zoomBy: (scaleDelta: number, center?: { x: number; y: number }) => {
      try {
        managerRef.current?.zoomBy(scaleDelta, center);
      } catch (error) {
        console.error('Error in zoomBy:', error);
      }
    },
    centerOn: (worldPoint: { x: number; y: number }) => {
      try {
        managerRef.current?.centerOn(worldPoint);
      } catch (error) {
        console.error('Error in centerOn:', error);
      }
    },
    fit: (bounds: { minX: number; minY: number; maxX: number; maxY: number }, padding?: number) => {
      try {
        managerRef.current?.fit(bounds, padding);
      } catch (error) {
        console.error('Error in fit:', error);
      }
    },
    reset: () => {
      try {
        managerRef.current?.reset();
      } catch (error) {
        console.error('Error in reset:', error);
      }
    },
    getViewport: () => {
      try {
        return managerRef.current?.getViewport() || { x: 0, y: 0, scale: 1 };
      } catch (error) {
        console.error('Error in getViewport:', error);
        return { x: 0, y: 0, scale: 1 };
      }
    },
    screenToWorld: (screenPoint: { x: number; y: number }) => {
      try {
        return managerRef.current?.screenToWorld(screenPoint) || { x: 0, y: 0 };
      } catch (error) {
        console.error('Error in screenToWorld:', error);
        return { x: 0, y: 0 };
      }
    },
    worldToScreen: (worldPoint: { x: number; y: number }) => {
      try {
        return managerRef.current?.worldToScreen(worldPoint) || { x: 0, y: 0 };
      } catch (error) {
        console.error('Error in worldToScreen:', error);
        return { x: 0, y: 0 };
      }
    }
  }), []);

  // Expose API via ref
  useImperativeHandle(ref, () => canvasAPI, [canvasAPI]);

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
        style={{ touchAction: 'none', userSelect: 'none' }}
      >
        {/* Children will be rendered into the viewport element created by DOMCanvasManager */}
      </div>
      
      {/* Render children into viewport element using portal */}
      {isViewportReady && viewportRef.current && (() => {
        try {
          // Additional safety checks
          if (!document.contains(viewportRef.current)) {
            return null;
          }
          return createPortal(
            <div key={viewportKey}>{children}</div>, 
            viewportRef.current
          );
        } catch (error) {
          console.warn('Portal render error:', error);
          return null;
        }
      })()}
    </div>
  );
});

InfiniteCanvas.displayName = 'InfiniteCanvas';

export default InfiniteCanvas;