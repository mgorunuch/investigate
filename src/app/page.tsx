"use client";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Canvas Visualization Platform
              </h1>
              <p className="text-accent">
                Interactive canvas for data visualization and mapping
              </p>
            </div>
          </div>
        </header>

        <div className="bg-surface border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Interactive Canvas
          </h2>
          <div className="text-center py-8">
            <div className="text-accent-secondary mb-4">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V6a2 2 0 012-2h2M4 16v2a2 2 0 002 2h2M16 4h2a2 2 0 012 2v2M16 20h2a2 2 0 002-2v-2M8 12h8M12 8v8" />
              </svg>
            </div>
            <p className="text-accent mb-6">
              Experience infinite canvas visualization with pan, zoom, and interactive controls.
            </p>
            <button 
              onClick={() => window.location.href = "/canvas"} 
              className="bg-accent text-surface hover:bg-accent-secondary py-3 px-6 rounded-md text-base font-medium"
            >
              Open Canvas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}