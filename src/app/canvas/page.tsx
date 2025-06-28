"use client";

import InfiniteCanvas from '@/components/InfiniteCanvas';
import { useState } from 'react';
import type { ViewportState } from '@/packages/infinite-canvas';
import { cn } from '@/lib/utils';
import { User, Globe, Shield, Database, Link, Target, GripVertical, MoreVertical, Copy, Eye, Trash2 } from 'lucide-react';

// OSINT Entity Components
const EntityCard = ({ 
  icon: Icon, 
  title, 
  subtitle, 
  type, 
  confidence,
  style,
  className = "" 
}: {
  icon: any;
  title: string;
  subtitle: string;
  type: string;
  confidence: 'high' | 'medium' | 'low';
  style?: React.CSSProperties;
  className?: string;
}) => {
  const confidenceColors = {
    high: 'border-gray-800/60',
    medium: 'border-gray-600/50',
    low: 'border-gray-400/40'
  };

  return (
    <div 
      className={cn(
        "absolute glass-card min-w-48 max-w-64 group",
        "border-2",
        confidenceColors[confidence],
        className
      )}
      style={style}
    >
      {/* Container Header with Drag Handle and Actions */}
      <div className="p-1.5 border-b border-border-secondary flex items-center justify-between opacity-60 hover:opacity-100">
        <div className="flex items-center gap-1">
          <div className="cursor-move p-0.5 hover:bg-border-secondary rounded">
            <GripVertical className="w-3 h-3 text-muted" />
          </div>
          <span className="text-xs text-muted">{type}</span>
        </div>
        <div className="flex items-center">
          <button className="p-0.5 hover:bg-border-secondary rounded opacity-0 group-hover:opacity-100" title="View Details">
            <Eye className="w-3 h-3 text-muted" />
          </button>
          <button className="p-0.5 hover:bg-border-secondary rounded opacity-0 group-hover:opacity-100" title="Copy">
            <Copy className="w-3 h-3 text-muted" />
          </button>
          <button className="p-0.5 hover:bg-border-secondary rounded opacity-0 group-hover:opacity-100" title="More Actions">
            <MoreVertical className="w-3 h-3 text-muted" />
          </button>
        </div>
      </div>

      {/* Card Content */}
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
    </div>
  );
};

const ConnectionLine = ({ 
  from, 
  to, 
  viewport 
}: { 
  from: { x: number; y: number }; 
  to: { x: number; y: number }; 
  viewport: ViewportState;
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

export default function CanvasPage() {
  const [viewport, setViewport] = useState<ViewportState>({ x: 0, y: 0, scale: 1 });

  const handleViewportChange = (newViewport: ViewportState) => {
    setViewport(newViewport);
  };

  // Entity positions
  const entities = [
    { 
      id: 'person1',
      icon: User,
      title: 'John Doe',
      subtitle: 'Target Individual',
      type: 'Person',
      confidence: 'high' as const,
      position: { x: 200, y: 150 }
    },
    {
      id: 'domain1',
      icon: Globe,
      title: 'example.com',
      subtitle: 'Primary Domain',
      type: 'Domain',
      confidence: 'high' as const,
      position: { x: 500, y: 100 }
    },
    {
      id: 'cert1',
      icon: Shield,
      title: 'SSL Certificate',
      subtitle: 'Let\'s Encrypt Authority',
      type: 'Certificate',
      confidence: 'medium' as const,
      position: { x: 800, y: 200 }
    },
    {
      id: 'db1',
      icon: Database,
      title: 'Database Leak',
      subtitle: 'Breach from 2023',
      type: 'Data',
      confidence: 'low' as const,
      position: { x: 200, y: 400 }
    },
    {
      id: 'social1',
      icon: Target,
      title: '@johndoe',
      subtitle: 'Twitter Profile',
      type: 'Social',
      confidence: 'high' as const,
      position: { x: 600, y: 350 }
    }
  ];

  const connections = [
    { from: entities[0].position, to: entities[1].position },
    { from: entities[1].position, to: entities[2].position },
    { from: entities[0].position, to: entities[3].position },
    { from: entities[0].position, to: entities[4].position }
  ];

  return (
    <div className="min-h-screen">
      <div className="h-screen relative">
        <InfiniteCanvas
          className="w-full h-full"
          showDebug={true}
          onViewportChange={handleViewportChange}
          minScale={0.1}
          maxScale={5}
          scaleSensitivity={0.005}
          enablePan={true}
          enableZoom={true}
          background={{
            type: 'dots',
            color: 'rgba(107, 114, 128, 0.2)',
            size: 40,
            dotSize: 2
          }}
        >
          {/* Connection Lines */}
          {connections.map((connection, index) => (
            <ConnectionLine 
              key={index}
              from={connection.from}
              to={connection.to}
              viewport={viewport}
            />
          ))}

          {/* OSINT Entities */}
          {entities.map((entity, index) => (
            <EntityCard
              key={entity.id}
              icon={entity.icon}
              title={entity.title}
              subtitle={entity.subtitle}
              type={entity.type}
              confidence={entity.confidence}
              style={{
                left: entity.position.x,
                top: entity.position.y
              }}
            />
          ))}

          {/* Floating Info Panel */}
          <div 
            className="absolute glass-card p-6 w-80"
            style={{ left: '100px', top: '600px' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Link className="w-5 h-5 text-accent" />
              <h3 className="font-semibold text-foreground">Investigation Summary</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Total Entities:</span>
                <span className="text-foreground font-medium">{entities.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Connections:</span>
                <span className="text-foreground font-medium">{connections.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">High Confidence:</span>
                <span className="text-gray-800 font-medium">
                  {entities.filter(e => e.confidence === 'high').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Investigation ID:</span>
                <span className="text-foreground font-mono text-xs">INV-2025-001</span>
              </div>
            </div>
          </div>
        </InfiniteCanvas>
      </div>
    </div>
  );
}