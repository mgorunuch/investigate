import type { Point, CanvasEventHandler } from './types';
import { DOMCanvasManager } from './dom-canvas-manager';

export class DOMPanZoomHandler {
  private manager: DOMCanvasManager;
  private listeners: Map<string, CanvasEventHandler> = new Map();
  private lastTouchDistance: number | null = null;
  private lastPointerPosition: Point | null = null;
  private pointerId: number | null = null;

  constructor(manager: DOMCanvasManager) {
    this.manager = manager;
  }

  public attach(): void {
    const container = this.manager.getContainer();
    if (!container) return;

    // Mouse events
    const handleMouseDown = this.handlePointerDown.bind(this);
    const handleMouseMove = this.handlePointerMove.bind(this);
    const handleMouseUp = this.handlePointerUp.bind(this);
    const handleWheel = this.handleWheel.bind(this);

    // Touch events
    const handleTouchStart = this.handleTouchStart.bind(this);
    const handleTouchMove = this.handleTouchMove.bind(this);
    const handleTouchEnd = this.handleTouchEnd.bind(this);

    // Pointer events (for better cross-device support)
    container.addEventListener('pointerdown', handleMouseDown);
    container.addEventListener('pointermove', handleMouseMove);
    container.addEventListener('pointerup', handleMouseUp);
    container.addEventListener('pointercancel', handleMouseUp);
    container.addEventListener('wheel', handleWheel, { passive: false });

    // Touch events for pinch zoom
    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);
    container.addEventListener('touchcancel', handleTouchEnd);

    // Prevent context menu
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    container.addEventListener('contextmenu', handleContextMenu);

    // Store listeners for cleanup
    this.listeners.set('pointerdown', handleMouseDown);
    this.listeners.set('pointermove', handleMouseMove);
    this.listeners.set('pointerup', handleMouseUp);
    this.listeners.set('pointercancel', handleMouseUp);
    this.listeners.set('wheel', handleWheel as CanvasEventHandler);
    this.listeners.set('touchstart', handleTouchStart as CanvasEventHandler);
    this.listeners.set('touchmove', handleTouchMove as CanvasEventHandler);
    this.listeners.set('touchend', handleTouchEnd as CanvasEventHandler);
    this.listeners.set('touchcancel', handleTouchEnd as CanvasEventHandler);
    this.listeners.set('contextmenu', handleContextMenu as CanvasEventHandler);
  }

  public detach(): void {
    const container = this.manager.getContainer();
    if (!container) return;

    this.listeners.forEach((handler, event) => {
      container.removeEventListener(event, handler as EventListener);
    });

    this.listeners.clear();
  }

  private handlePointerDown(event: PointerEvent): void {
    const state = this.manager.getState();
    const options = (this.manager as any).options;
    
    if (!options.enablePan || event.button !== 0) return;

    // Only track primary pointer
    if (this.pointerId !== null) return;
    
    this.pointerId = event.pointerId;
    this.lastPointerPosition = { x: event.clientX, y: event.clientY };
    this.manager.setDragging(true);

    // Capture pointer for better tracking
    const container = this.manager.getContainer();
    if (container) {
      container.setPointerCapture(event.pointerId);
    }

    event.preventDefault();
  }

  private handlePointerMove(event: PointerEvent): void {
    if (event.pointerId !== this.pointerId || !this.lastPointerPosition) return;

    const state = this.manager.getState();
    if (!state.isDragging) return;

    const deltaX = event.clientX - this.lastPointerPosition.x;
    const deltaY = event.clientY - this.lastPointerPosition.y;

    this.manager.panBy(deltaX, deltaY);

    this.lastPointerPosition = { x: event.clientX, y: event.clientY };
    event.preventDefault();
  }

  private handlePointerUp(event: PointerEvent): void {
    if (event.pointerId !== this.pointerId) return;

    this.manager.setDragging(false);
    this.lastPointerPosition = null;
    this.pointerId = null;

    // Release pointer capture
    const container = this.manager.getContainer();
    if (container) {
      container.releasePointerCapture(event.pointerId);
    }
  }

  private handleWheel(event: WheelEvent): void {
    const options = (this.manager as any).options;
    if (!options.enableZoom) return;

    // Always prevent default to stop any scrolling
    event.preventDefault();
    event.stopPropagation();

    const container = this.manager.getContainer();
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const center: Point = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };

    // Normalize wheel delta - only use deltaY for zoom
    // Ignore deltaX completely to prevent horizontal scrolling
    let normalizedDelta = event.deltaY;
    
    // Handle different wheel modes (pixel, line, page)
    if (event.deltaMode === 1) { // Line mode
      normalizedDelta *= 16; // Convert lines to pixels
    } else if (event.deltaMode === 2) { // Page mode
      normalizedDelta *= 400; // Convert pages to pixels
    }
    
    // Apply sensitivity and clamp the delta to prevent extreme jumps
    const delta = Math.sign(normalizedDelta) * Math.min(Math.abs(normalizedDelta) * options.scaleSensitivity, 0.1);
    
    // Only zoom if there's a vertical scroll
    if (Math.abs(event.deltaY) > 0) {
      this.manager.zoomBy(-delta, center);
    }
  }

  private handleTouchStart(event: TouchEvent): void {
    if (event.touches.length === 2) {
      event.preventDefault();
      this.lastTouchDistance = this.getTouchDistance(event.touches);
    }
  }

  private handleTouchMove(event: TouchEvent): void {
    if (event.touches.length === 2 && this.lastTouchDistance !== null) {
      event.preventDefault();

      const distance = this.getTouchDistance(event.touches);
      const scale = distance / this.lastTouchDistance;
      
      const center = this.getTouchCenter(event.touches);
      const container = this.manager.getContainer();
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const relativeCenter: Point = {
        x: center.x - rect.left,
        y: center.y - rect.top
      };

      const viewport = this.manager.getViewport();
      this.manager.zoomTo(viewport.scale * scale, relativeCenter);

      this.lastTouchDistance = distance;
    }
  }

  private handleTouchEnd(event: TouchEvent): void {
    if (event.touches.length < 2) {
      this.lastTouchDistance = null;
    }
  }

  private getTouchDistance(touches: TouchList): number {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private getTouchCenter(touches: TouchList): Point {
    return {
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2
    };
  }
}