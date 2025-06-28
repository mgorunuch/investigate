/**
 * Represents a 2D point with x and y coordinates
 */
export interface Point {
  /** The x coordinate */
  x: number;
  /** The y coordinate */
  y: number;
}

/**
 * Represents the current state of the viewport transformation
 */
export interface ViewportState {
  /** The x offset of the viewport in pixels */
  x: number;
  /** The y offset of the viewport in pixels */
  y: number;
  /** The current zoom scale factor (1.0 = 100%) */
  scale: number;
}

/**
 * Base configuration options for canvas behavior
 */
export interface CanvasOptions {
  /** Minimum allowed zoom scale factor (default: 0.1) */
  minScale?: number;
  /** Maximum allowed zoom scale factor (default: 10) */
  maxScale?: number;
  /** Mouse wheel sensitivity for zooming (default: 0.001) */
  scaleSensitivity?: number;
  /** Whether panning is enabled (default: true) */
  enablePan?: boolean;
  /** Whether zooming is enabled (default: true) */
  enableZoom?: boolean;
  /** Whether to use smooth CSS transitions (default: false) */
  smoothTransitions?: boolean;
  /** Duration of smooth transitions in milliseconds (default: 150) */
  transitionDuration?: number;
}

/**
 * Internal state of the canvas manager
 */
export interface CanvasState {
  /** Current viewport transformation state */
  viewport: ViewportState;
  /** The DOM container element */
  container: HTMLElement | null;
  /** The viewport transformation element */
  viewportElement: HTMLElement | null;
  /** Whether the canvas is currently being dragged */
  isDragging: boolean;
  /** Last recorded mouse/pointer position during drag */
  lastMousePosition: Point | null;
}

/**
 * Type for canvas event handler functions
 */
export type CanvasEventHandler = (event: MouseEvent | WheelEvent | TouchEvent | PointerEvent) => void;

/**
 * CSS Transform matrix representation
 */
export interface TransformMatrix {
  /** X-axis scaling factor */
  scaleX: number;
  /** Y-axis skew transformation */
  skewY: number;
  /** X-axis skew transformation */
  skewX: number;
  /** Y-axis scaling factor */
  scaleY: number;
  /** X-axis translation in pixels */
  translateX: number;
  /** Y-axis translation in pixels */
  translateY: number;
}

/**
 * Background pattern configuration options
 */
export interface BackgroundOptions {
  /** Type of background pattern to render */
  type?: 'dots' | 'grid' | 'none';
  /** Color of the background pattern (CSS color string) */
  color?: string;
  /** Size of pattern repetition in pixels */
  size?: number;
  /** Size of individual dots in pixels (for 'dots' type) */
  dotSize?: number;
  /** Additional CSS class name to apply to background element */
  className?: string;
}

/**
 * Extended canvas options specific to DOM implementation
 */
export interface DOMCanvasOptions extends CanvasOptions {
  /** CSS class name to apply to the viewport element */
  viewportClass?: string;
  /** CSS class name to apply to the container element */
  containerClass?: string;
  /** Background pattern configuration */
  background?: BackgroundOptions;
}