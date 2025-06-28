export interface Point {
  x: number;
  y: number;
}

export interface ViewportState {
  x: number;
  y: number;
  scale: number;
}

export interface CanvasOptions {
  minScale?: number;
  maxScale?: number;
  scaleSensitivity?: number;
  enablePan?: boolean;
  enableZoom?: boolean;
  smoothTransitions?: boolean;
  transitionDuration?: number;
}

export interface CanvasState {
  viewport: ViewportState;
  container: HTMLElement | null;
  viewportElement: HTMLElement | null;
  isDragging: boolean;
  lastMousePosition: Point | null;
}

export type CanvasEventHandler = (event: MouseEvent | WheelEvent | TouchEvent) => void;

export interface TransformMatrix {
  scaleX: number;
  skewY: number;
  skewX: number;
  scaleY: number;
  translateX: number;
  translateY: number;
}

export interface BackgroundOptions {
  type?: 'dots' | 'grid' | 'none';
  color?: string;
  size?: number;
  dotSize?: number;
  className?: string;
}

export interface DOMCanvasOptions extends CanvasOptions {
  viewportClass?: string;
  containerClass?: string;
  background?: BackgroundOptions;
}