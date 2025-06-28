"use client";

import InfiniteCanvas, { type InfiniteCanvasRef } from '@/components/InfiniteCanvas';
import { useRef, useEffect, useCallback, useMemo, useState } from 'react';
import { signal } from '@preact/signals-react';
import type { ViewportState } from '@/packages/infinite-canvas';
import { cn } from '@/lib/utils';
import { User, Globe, Shield, Database, Target, GripVertical, MoreVertical, Copy, Eye } from 'lucide-react';
import { useDragSystem, type Entity as BaseEntity } from '@/hooks/useDragSystem';

// Extended Entity interface for OSINT entities
interface OSINTEntity extends BaseEntity {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  type: string;
  confidence: 'high' | 'medium' | 'low';
  isVisible: boolean;
}

// OSINT Entity Components
const EntityCard = ({
  icon: Icon,
  title,
  subtitle,
  type,
  confidence,
  isVisible,
  onToggleVisibility,
  style,
  className = "",
  dragHandlers,
  isDragging: _isDragging = false, // eslint-disable-line @typescript-eslint/no-unused-vars
  isBeingDragged = false
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  type: string;
  confidence: 'high' | 'medium' | 'low';
  isVisible: boolean;
  onToggleVisibility: () => void;
  style?: React.CSSProperties;
  className?: string;
  dragHandlers?: {
    onMouseDown: (event: React.MouseEvent) => void;
    onTouchStart: (event: React.TouchEvent) => void;
  };
  isDragging?: boolean;
  isBeingDragged?: boolean;
}) => {
  const confidenceColors = {
    high: 'border-gray-800/60',
    medium: 'border-gray-600/50',
    low: 'border-gray-400/40'
  };

  return (
    <div
      className={cn(
        "absolute glass-card min-w-48 max-w-64 group transition-all duration-300",
        "border-2",
        confidenceColors[confidence],
        isBeingDragged && "shadow-2xl z-50",
        className
      )}
      style={{
        ...style
      }}
    >
      {/* Container Header with Drag Handle and Actions */}
      <div
        className={cn(
          "p-1.5 border-b border-border-secondary flex items-center justify-between opacity-60 hover:opacity-100 select-none transition-all duration-150",
          isBeingDragged ? "cursor-grabbing bg-accent/10" : "cursor-grab hover:bg-accent/5"
        )}
        data-draggable="true"
        onMouseDown={dragHandlers?.onMouseDown}
        onTouchStart={dragHandlers?.onTouchStart}
        style={{ touchAction: 'none' }}
      >
        <div className="flex items-center gap-1.5 pointer-events-none">
          <div className="p-0.5 rounded hover:bg-accent/20 transition-colors">
            <GripVertical className="w-3 h-3 text-muted group-hover:text-accent" />
          </div>
          <div className="glass-button p-1 rounded">
            <Icon className="w-3 h-3 text-accent" />
          </div>
          <span className="text-xs text-muted font-medium">{title}</span>
        </div>
        <div className="flex items-center pointer-events-auto">
          <button
            className="p-0.5 hover:bg-border-secondary rounded opacity-0 group-hover:opacity-100 transition-all"
            title={isVisible ? "Hide entity" : "Show entity"}
            onClick={onToggleVisibility}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            <Eye className={cn(
              "w-3 h-3 transition-all",
              isVisible ? "text-accent" : "text-muted"
            )} />
          </button>
          <button
            className="p-0.5 hover:bg-border-secondary rounded opacity-0 group-hover:opacity-100"
            title="Copy"
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            <Copy className="w-3 h-3 text-muted" />
          </button>
          <button
            className="p-0.5 hover:bg-border-secondary rounded opacity-0 group-hover:opacity-100"
            title="More Actions"
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            <MoreVertical className="w-3 h-3 text-muted" />
          </button>
        </div>
      </div>

      {/* Card Content - Only show when visible */}
      {isVisible && (
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="glass-button p-2 rounded-md">
              <Icon className="w-5 h-5 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-sm truncate">{title}</h3>
              <p className="text-xs text-muted mt-1 truncate">{subtitle}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs px-2 py-1 glass rounded-full text-muted">
                  Entity
                </span>
                <div className="flex items-center gap-1">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    confidence === 'high' ? 'bg-gray-800' :
                    confidence === 'medium' ? 'bg-gray-600' : 'bg-gray-400'
                  )}></div>
                  <span className="text-xs text-muted capitalize">{confidence}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ConnectionLine = ({
  from,
  to
}: {
  from: { x: number; y: number };
  to: { x: number; y: number };
}) => {
  const startX = from.x + 120; // Center of card
  const startY = from.y + 60;
  const endX = to.x + 120;
  const endY = to.y + 60;

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: startX,
        top: startY,
        width: Math.abs(endX - startX),
        height: Math.abs(endY - startY),
      }}
    >
      <svg
        className="absolute pointer-events-none"
        style={{
          width: '100%',
          height: '100%',
          overflow: 'visible'
        }}
      >
        <defs>
          <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#374151" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#6b7280" stopOpacity="0.6" />
          </linearGradient>
        </defs>
        <line
          x1={startX < endX ? 0 : Math.abs(endX - startX)}
          y1={startY < endY ? 0 : Math.abs(endY - startY)}
          x2={startX < endX ? Math.abs(endX - startX) : 0}
          y2={startY < endY ? Math.abs(endY - startY) : 0}
          stroke="url(#connectionGradient)"
          strokeWidth="2"
          strokeDasharray="5,5"
        />
      </svg>
    </div>
  );
};

// Initial data
const initialEntities: OSINTEntity[] = [
  {
    id: 'person1',
    icon: User,
    title: 'John Doe',
    subtitle: 'Target Individual',
    type: 'Person',
    confidence: 'high' as const,
    isVisible: true,
    position: { x: 200, y: 150 }
  },
  {
    id: 'domain1',
    icon: Globe,
    title: 'example.com',
    subtitle: 'Primary Domain',
    type: 'Domain',
    confidence: 'high' as const,
    isVisible: true,
    position: { x: 500, y: 100 }
  },
  {
    id: 'cert1',
    icon: Shield,
    title: 'SSL Certificate',
    subtitle: 'Let\'s Encrypt Authority',
    type: 'Certificate',
    confidence: 'medium' as const,
    isVisible: true,
    position: { x: 800, y: 200 }
  },
  {
    id: 'db1',
    icon: Database,
    title: 'Database Leak',
    subtitle: 'Breach from 2023',
    type: 'Data',
    confidence: 'low' as const,
    isVisible: true,
    position: { x: 200, y: 400 }
  },
  {
    id: 'social1',
    icon: Target,
    title: '@johndoe',
    subtitle: 'Twitter Profile',
    type: 'Social',
    confidence: 'high' as const,
    isVisible: true,
    position: { x: 600, y: 350 }
  }
];

// Global signals
const viewport = signal<ViewportState>({ x: 0, y: 0, scale: 1 });

export default function CanvasPage() {
  const canvasRef = useRef<InfiniteCanvasRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Use local state for viewport to avoid signal re-render issues with InfiniteCanvas
  const [localViewport, setLocalViewport] = useState<ViewportState>({ x: 0, y: 0, scale: 1 });

  // Use React state for entities to ensure proper re-renders
  const [entities, setEntities] = useState<OSINTEntity[]>(initialEntities);

  // Memoize background object to prevent re-renders
  const backgroundConfig = useMemo(() => ({
    type: 'dots' as const,
    color: 'rgba(107, 114, 128, 0.2)',
    size: 40,
    dotSize: 2
  }), []);

  const handleViewportChange = useCallback((newViewport: ViewportState) => {
    setLocalViewport(newViewport);
    // Update signal for other components that might need it
    viewport.value = newViewport;
  }, []);

  // Handle entity position updates - use functional update for better performance
  const handleEntityMove = useCallback((entityId: string, newPosition: { x: number; y: number }) => {
    setEntities(prev => {
      const entityIndex = prev.findIndex(entity => entity.id === entityId);
      if (entityIndex === -1) return prev;

      const entity = prev[entityIndex];
      // Only update if position actually changed to avoid unnecessary re-renders
      if (entity.position.x === newPosition.x && entity.position.y === newPosition.y) {
        return prev;
      }

      const newEntities = [...prev];
      newEntities[entityIndex] = { ...entity, position: newPosition };
      return newEntities;
    });
  }, []);

  // Handle entity visibility toggle
  const handleToggleVisibility = useCallback((entityId: string) => {
    setEntities(prev => {
      const entityIndex = prev.findIndex(entity => entity.id === entityId);
      if (entityIndex === -1) return prev;

      const newEntities = [...prev];
      newEntities[entityIndex] = {
        ...newEntities[entityIndex],
        isVisible: !newEntities[entityIndex].isVisible
      };
      return newEntities;
    });
  }, []);

  // Initialize drag system with local viewport to prevent re-renders
  const {
    // dragState - available for future use
    getDragHandlers,
    globalDragHandlers,
    isDragging,
    draggedEntityId
  } = useDragSystem({
    entities: entities,
    onEntityMove: handleEntityMove,
    viewport: localViewport
  });

  // Create stable event handler references
  const dragHandlersRef = useRef(globalDragHandlers);
  dragHandlersRef.current = globalDragHandlers;

  const isDraggingRef = useRef(isDragging);
  isDraggingRef.current = isDragging;

  // Stable event handlers that don't change
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingRef.current) return;
    const syntheticEvent = {
      preventDefault: () => e.preventDefault(),
      stopPropagation: () => e.stopPropagation(),
      clientX: e.clientX,
      clientY: e.clientY,
      target: e.target,
      currentTarget: e.currentTarget
    } as React.MouseEvent;
    dragHandlersRef.current.onMouseMove(syntheticEvent);
  }, []);

  const handleMouseUp = useCallback(() => {
    if (!isDraggingRef.current) return;
    dragHandlersRef.current.onMouseUp();
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDraggingRef.current || e.touches.length === 0) return;
    e.preventDefault();
    const touch = e.touches[0];
    const syntheticEvent = {
      preventDefault: () => {},
      stopPropagation: () => {},
      touches: [{
        clientX: touch.clientX,
        clientY: touch.clientY
      }],
      target: e.target,
      currentTarget: e.currentTarget
    } as unknown as React.TouchEvent;
    dragHandlersRef.current.onTouchMove(syntheticEvent);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!isDraggingRef.current) return;
    dragHandlersRef.current.onTouchEnd();
  }, []);

  useEffect(() => {
    if (isDragging) {
      // Use capture phase to ensure entity drag events are handled before canvas events
      document.addEventListener('mousemove', handleMouseMove, { capture: true });
      document.addEventListener('mouseup', handleMouseUp, { capture: true });
      document.addEventListener('touchmove', handleTouchMove, { passive: false, capture: true });
      document.addEventListener('touchend', handleTouchEnd, { capture: true });
      document.addEventListener('touchcancel', handleTouchEnd, { capture: true });

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
        document.removeEventListener('touchcancel', handleTouchEnd);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  const connections = [
    { from: entities[0].position, to: entities[1].position },
    { from: entities[1].position, to: entities[2].position },
    { from: entities[0].position, to: entities[3].position },
    { from: entities[0].position, to: entities[4].position }
  ];

  return (
    <div className="min-h-screen" ref={containerRef}>
      <div className="h-screen relative">
        <InfiniteCanvas
          ref={canvasRef}
          className="w-full h-full"
          showDebug={true}
          onViewportChange={handleViewportChange}
          minScale={0.1}
          maxScale={5}
          scaleSensitivity={0.005}
          enablePan={true}
          enableZoom={true}
          background={backgroundConfig}
        >
          {/* Connection Lines */}
          {connections.map((connection, index) => (
            <ConnectionLine
              key={index}
              from={connection.from}
              to={connection.to}
            />
          ))}

          {/* OSINT Entities */}
          {entities.map((entity) => (
            <EntityCard
              key={entity.id}
              icon={entity.icon}
              title={entity.title}
              subtitle={entity.subtitle}
              type={entity.type}
              confidence={entity.confidence}
              isVisible={entity.isVisible}
              onToggleVisibility={() => handleToggleVisibility(entity.id)}
              style={{
                left: entity.position.x,
                top: entity.position.y
              }}
              dragHandlers={getDragHandlers(entity.id)}
              isDragging={isDragging}
              isBeingDragged={draggedEntityId === entity.id}
            />
          ))}

        </InfiniteCanvas>
      </div>
    </div>
  );
}
