import { useState, useCallback, useRef } from 'react';
import type { ViewportState } from '@/packages/infinite-canvas';

export interface DragState {
  isDragging: boolean;
  draggedEntityId: string | null;
  dragOffset: { x: number; y: number };
  startPosition: { x: number; y: number };
}

export interface Entity {
  id: string;
  position: { x: number; y: number };
  [key: string]: unknown;
}

export interface UseDragSystemProps {
  entities: Entity[];
  onEntityMove: (entityId: string, newPosition: { x: number; y: number }) => void;
  viewport: ViewportState;
}

export function useDragSystem({
  entities,
  onEntityMove,
  viewport
}: UseDragSystemProps) {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedEntityId: null,
    dragOffset: { x: 0, y: 0 },
    startPosition: { x: 0, y: 0 }
  });

  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

  // Convert screen coordinates to world coordinates using canvas transforms
  const screenToWorld = useCallback((screenPoint: { x: number; y: number }) => {
    // Transform from screen coordinates to world coordinates
    // Account for canvas viewport transform: screenPoint = (worldPoint * scale) + offset
    // Therefore: worldPoint = (screenPoint - offset) / scale
    return {
      x: (screenPoint.x - viewport.x) / viewport.scale,
      y: (screenPoint.y - viewport.y) / viewport.scale
    };
  }, [viewport]);

  // Get mouse/touch position from event
  const getEventPosition = useCallback((event: React.MouseEvent | React.TouchEvent): { x: number; y: number } => {
    if ('touches' in event && event.touches.length > 0) {
      return {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY
      };
    }
    
    if ('clientX' in event) {
      return {
        x: event.clientX,
        y: event.clientY
      };
    }
    
    return { x: 0, y: 0 };
  }, []);

  // Start dragging an entity
  const handleDragStart = useCallback((
    entityId: string,
    event: React.MouseEvent | React.TouchEvent
  ) => {
    const entity = entities.find(e => e.id === entityId);
    if (!entity) return;

    // Only prevent default and stop propagation AFTER we confirm this is a valid drag
    event.preventDefault();
    event.stopPropagation();

    const mousePos = getEventPosition(event);
    dragStartRef.current = mousePos;

    // Calculate offset from mouse to entity position in screen coordinates
    const entityScreenPos = {
      x: entity.position.x * viewport.scale + viewport.x,
      y: entity.position.y * viewport.scale + viewport.y
    };

    const offset = {
      x: mousePos.x - entityScreenPos.x,
      y: mousePos.y - entityScreenPos.y
    };

    setDragState({
      isDragging: true,
      draggedEntityId: entityId,
      dragOffset: offset,
      startPosition: entity.position
    });

    // Prevent text selection and canvas interaction during drag
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    document.body.style.cursor = 'grabbing';
  }, [entities, getEventPosition, viewport]);

  // Handle drag movement
  const handleDragMove = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    if (!dragState.isDragging || !dragState.draggedEntityId) return;

    // Prevent defaults and propagation only when we're actively dragging an entity
    event.preventDefault();
    event.stopPropagation();
    
    const mousePos = getEventPosition(event);
    
    // Calculate new position accounting for the initial offset
    const newScreenPos = {
      x: mousePos.x - dragState.dragOffset.x,
      y: mousePos.y - dragState.dragOffset.y
    };

    // Convert to world coordinates
    const newWorldPos = screenToWorld(newScreenPos);

    // Update entity position immediately
    onEntityMove(dragState.draggedEntityId, newWorldPos);
  }, [dragState, getEventPosition, screenToWorld, onEntityMove]);

  // Stop dragging
  const handleDragEnd = useCallback(() => {
    if (!dragState.isDragging) return;

    // Restore document styles
    document.body.style.userSelect = '';
    document.body.style.webkitUserSelect = '';
    document.body.style.cursor = '';

    setDragState({
      isDragging: false,
      draggedEntityId: null,
      dragOffset: { x: 0, y: 0 },
      startPosition: { x: 0, y: 0 }
    });

    dragStartRef.current = null;
  }, [dragState.isDragging]);

  // Get drag handlers for an entity
  const getDragHandlers = useCallback((entityId: string) => {
    return {
      onMouseDown: (event: React.MouseEvent) => handleDragStart(entityId, event),
      onTouchStart: (event: React.TouchEvent) => handleDragStart(entityId, event),
    };
  }, [handleDragStart]);

  // Global event handlers to attach to document or canvas
  const globalDragHandlers = {
    onMouseMove: handleDragMove,
    onMouseUp: handleDragEnd,
    onTouchMove: handleDragMove,
    onTouchEnd: handleDragEnd,
    onTouchCancel: handleDragEnd
  };

  return {
    dragState,
    getDragHandlers,
    globalDragHandlers,
    isDragging: dragState.isDragging,
    draggedEntityId: dragState.draggedEntityId
  };
}