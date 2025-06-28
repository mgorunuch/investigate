import type { CanvasState, ViewportState, Point, DOMCanvasOptions, TransformMatrix } from './types';

/**
 * DOMCanvasManager handles the core viewport management and transformation logic
 * for an infinite canvas implementation using DOM elements.
 * 
 * Features:
 * - Viewport transformation with hardware-accelerated CSS transforms
 * - Event-driven viewport change notifications
 * - Automatic scale clamping within configured bounds
 * - Efficient background pattern rendering
 * - Proper cleanup and memory management
 * 
 * @example
 * ```ts
 * const manager = new DOMCanvasManager(containerElement, {
 *   minScale: 0.1,
 *   maxScale: 5,
 *   background: { type: 'dots', size: 30 }
 * });
 * 
 * // Subscribe to viewport changes
 * const unsubscribe = manager.onViewportChange(viewport => {
 *   console.log('Viewport changed:', viewport);
 * });
 * 
 * // Cleanup
 * manager.destroy();
 * unsubscribe();
 * ```
 */
export class DOMCanvasManager {
  private state: CanvasState;
  private options: Required<DOMCanvasOptions>;
  private resizeObserver: ResizeObserver | null = null;
  private backgroundElement: HTMLElement | null = null;
  private viewportChangeCallbacks: Set<(viewport: ViewportState) => void> = new Set();

  constructor(container: HTMLElement, options: DOMCanvasOptions = {}) {
    this.options = {
      minScale: 0.1,
      maxScale: 10,
      scaleSensitivity: 0.001,
      enablePan: true,
      enableZoom: true,
      smoothTransitions: false,
      transitionDuration: 150,
      viewportClass: 'infinite-canvas-viewport',
      containerClass: 'infinite-canvas-container',
      background: {
        type: 'none',
        color: '#e5e7eb',
        size: 30,
        dotSize: 2,
        className: 'infinite-canvas-background',
        ...options.background
      },
      ...options
    };

    this.state = {
      viewport: { x: 0, y: 0, scale: 1 },
      container,
      viewportElement: null,
      isDragging: false,
      lastMousePosition: null
    };

    this.setupDOM();
    this.setupResizeObserver();
  }

  private setupDOM(): void {
    if (!this.state.container) return;

    // Setup container styles
    this.state.container.style.position = 'relative';
    this.state.container.style.overflow = 'hidden';
    this.state.container.style.touchAction = 'none';
    this.state.container.style.userSelect = 'none';
    
    if (this.options.containerClass) {
      this.state.container.classList.add(this.options.containerClass);
    }

    // Create viewport element
    const viewport = document.createElement('div');
    viewport.style.position = 'absolute';
    viewport.style.top = '0';
    viewport.style.left = '0';
    viewport.style.width = '100%';
    viewport.style.height = '100%';
    viewport.style.transformOrigin = '0 0';
    viewport.style.willChange = 'transform';
    
    if (this.options.viewportClass) {
      viewport.classList.add(this.options.viewportClass);
    }

    // Create background if needed
    if (this.options.background.type !== 'none') {
      this.backgroundElement = this.createBackground();
      // Insert background as first child of container to avoid global DOM pollution
      this.state.container.insertBefore(this.backgroundElement, this.state.container.firstChild);
    }

    // Move existing children to viewport (excluding background)
    while (this.state.container.firstChild && this.state.container.firstChild !== this.backgroundElement) {
      viewport.appendChild(this.state.container.firstChild);
    }

    this.state.container.appendChild(viewport);
    this.state.viewportElement = viewport;

    this.applyTransform();
  }

  private createBackground(): HTMLElement {
    const bg = document.createElement('div');
    const { background } = this.options;
    
    // Position background to cover the entire container without global DOM pollution
    bg.style.position = 'absolute';
    bg.style.top = '0';
    bg.style.left = '0';
    bg.style.width = '100%';
    bg.style.height = '100%';
    bg.style.pointerEvents = 'none';
    bg.style.zIndex = '-1';
    bg.style.overflow = 'hidden';
    
    if (background.className) {
      bg.classList.add(background.className);
    }

    switch (background.type) {
      case 'dots':
        bg.style.backgroundColor = 'transparent';
        bg.style.backgroundImage = `radial-gradient(circle, ${background.color} ${background.dotSize}px, transparent ${background.dotSize}px)`;
        bg.style.backgroundSize = `${background.size}px ${background.size}px`;
        bg.style.backgroundPosition = '0 0';
        break;
      case 'grid':
        bg.style.backgroundColor = 'transparent';
        bg.style.backgroundImage = `
          linear-gradient(${background.color} 1px, transparent 1px),
          linear-gradient(90deg, ${background.color} 1px, transparent 1px)
        `;
        bg.style.backgroundSize = `${background.size}px ${background.size}px`;
        bg.style.backgroundPosition = '0 0';
        break;
    }

    return bg;
  }

  private setupResizeObserver(): void {
    if (!this.state.container) return;

    this.resizeObserver = new ResizeObserver(() => {
      this.applyTransform();
    });

    this.resizeObserver.observe(this.state.container);
  }

  public setViewport(viewport: Partial<ViewportState>): void {
    const oldViewport = { ...this.state.viewport };
    
    this.state.viewport = {
      ...this.state.viewport,
      ...viewport
    };
    
    // Clamp scale
    if (this.state.viewport.scale < this.options.minScale) {
      this.state.viewport.scale = this.options.minScale;
    }
    if (this.state.viewport.scale > this.options.maxScale) {
      this.state.viewport.scale = this.options.maxScale;
    }
    
    this.applyTransform();
    
    // Notify listeners only if viewport actually changed
    if (oldViewport.x !== this.state.viewport.x || 
        oldViewport.y !== this.state.viewport.y || 
        oldViewport.scale !== this.state.viewport.scale) {
      this.notifyViewportChange();
    }
  }

  public getViewport(): ViewportState {
    return { ...this.state.viewport };
  }

  public screenToWorld(screenPoint: Point): Point {
    const { x, y, scale } = this.state.viewport;
    return {
      x: (screenPoint.x - x) / scale,
      y: (screenPoint.y - y) / scale
    };
  }

  public worldToScreen(worldPoint: Point): Point {
    const { x, y, scale } = this.state.viewport;
    return {
      x: worldPoint.x * scale + x,
      y: worldPoint.y * scale + y
    };
  }

  public getTransformMatrix(): TransformMatrix {
    const { scale, x, y } = this.state.viewport;
    return {
      scaleX: scale,
      skewY: 0,
      skewX: 0,
      scaleY: scale,
      translateX: x,
      translateY: y
    };
  }

  private applyTransform(): void {
    if (!this.state.viewportElement) return;

    const { scale, x, y } = this.state.viewport;
    
    if (this.options.smoothTransitions && !this.state.isDragging) {
      this.state.viewportElement.style.transition = `transform ${this.options.transitionDuration}ms ease-out`;
    } else {
      this.state.viewportElement.style.transition = 'none';
    }
    
    // Use translate3d for hardware acceleration
    this.state.viewportElement.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;

    // Update background positioning if it exists
    if (this.backgroundElement && this.options.background.type !== 'none' && this.options.background.size) {
      const adjustedSize = this.options.background.size * scale;
      this.backgroundElement.style.backgroundSize = `${adjustedSize}px ${adjustedSize}px`;
      // Calculate background position to maintain infinite pattern alignment during zoom and pan
      const offsetX = (x % adjustedSize);
      const offsetY = (y % adjustedSize);
      this.backgroundElement.style.backgroundPosition = `${offsetX}px ${offsetY}px`;
    }
  }

  public panBy(deltaX: number, deltaY: number): void {
    this.setViewport({
      x: this.state.viewport.x + deltaX,
      y: this.state.viewport.y + deltaY
    });
  }

  public zoomTo(scale: number, center?: Point): void {
    if (!center && this.state.container) {
      const rect = this.state.container.getBoundingClientRect();
      center = {
        x: rect.width / 2,
        y: rect.height / 2
      };
    }

    if (center) {
      const worldPoint = this.screenToWorld(center);
      this.state.viewport.scale = scale;
      const newScreenPoint = this.worldToScreen(worldPoint);
      
      this.setViewport({
        scale,
        x: this.state.viewport.x + (center.x - newScreenPoint.x),
        y: this.state.viewport.y + (center.y - newScreenPoint.y)
      });
    } else {
      this.setViewport({ scale });
    }
  }

  public zoomBy(scaleDelta: number, center?: Point): void {
    const currentScale = this.state.viewport.scale;
    const newScale = currentScale * (1 + scaleDelta);
    
    // Exit early if we're already at limits and trying to go beyond
    if ((currentScale >= this.options.maxScale && scaleDelta > 0) ||
        (currentScale <= this.options.minScale && scaleDelta < 0)) {
      return;
    }
    
    this.zoomTo(newScale, center);
  }

  public centerOn(worldPoint: Point): void {
    if (!this.state.container) return;
    
    const rect = this.state.container.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const screenPoint = this.worldToScreen(worldPoint);
    
    this.setViewport({
      x: this.state.viewport.x + (centerX - screenPoint.x),
      y: this.state.viewport.y + (centerY - screenPoint.y)
    });
  }

  public fit(worldBounds: { minX: number; minY: number; maxX: number; maxY: number }, padding = 20): void {
    if (!this.state.container) return;
    
    const rect = this.state.container.getBoundingClientRect();
    const containerWidth = rect.width - 2 * padding;
    const containerHeight = rect.height - 2 * padding;
    
    const boundsWidth = worldBounds.maxX - worldBounds.minX;
    const boundsHeight = worldBounds.maxY - worldBounds.minY;
    
    const scaleX = containerWidth / boundsWidth;
    const scaleY = containerHeight / boundsHeight;
    const scale = Math.min(scaleX, scaleY);
    
    const centerX = (worldBounds.minX + worldBounds.maxX) / 2;
    const centerY = (worldBounds.minY + worldBounds.maxY) / 2;
    
    this.setViewport({ scale });
    this.centerOn({ x: centerX, y: centerY });
  }

  public reset(): void {
    this.setViewport({ x: 0, y: 0, scale: 1 });
  }

  public getContainer(): HTMLElement | null {
    return this.state.container;
  }

  public getViewportElement(): HTMLElement | null {
    return this.state.viewportElement;
  }

  public getState(): Readonly<CanvasState> {
    return { ...this.state };
  }

  public setDragging(isDragging: boolean): void {
    this.state.isDragging = isDragging;
    if (!isDragging) {
      this.state.lastMousePosition = null;
    }
  }

  public enableSmoothTransitions(enable: boolean): void {
    this.options.smoothTransitions = enable;
  }

  public getOptions(): Readonly<Required<DOMCanvasOptions>> {
    return { ...this.options };
  }

  public onViewportChange(callback: (viewport: ViewportState) => void): () => void {
    this.viewportChangeCallbacks.add(callback);
    return () => {
      this.viewportChangeCallbacks.delete(callback);
    };
  }

  private notifyViewportChange(): void {
    const currentViewport = this.getViewport();
    this.viewportChangeCallbacks.forEach(callback => {
      try {
        callback(currentViewport);
      } catch (error) {
        console.error('Error in viewport change callback:', error);
      }
    });
  }

  public destroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    // Clear all viewport change callbacks
    this.viewportChangeCallbacks.clear();

    if (this.state.viewportElement && this.state.container) {
      // Don't move React-managed children - React portal will handle cleanup
      // Just clear our own managed elements and remove the viewport
      
      // Remove background if it exists
      if (this.backgroundElement && this.backgroundElement.parentNode) {
        this.backgroundElement.parentNode.removeChild(this.backgroundElement);
        this.backgroundElement = null;
      }
      
      // Remove viewport element (React portal will clean up its children)
      if (this.state.viewportElement.parentNode) {
        this.state.viewportElement.parentNode.removeChild(this.state.viewportElement);
      }
    }

    this.state.container = null;
    this.state.viewportElement = null;
  }
}