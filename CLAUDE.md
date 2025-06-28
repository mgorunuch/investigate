# Project: Investigate - OSINT Intelligence Platform
*Last updated: 2025-06-28*

## Project Purpose
OSINT (Open Source Intelligence) investigation platform for security researchers and analysts to organize, analyze, and visualize intelligence data from multiple sources.

## Primary Objective
Streamline OSINT workflows by providing unified data collection, analysis, and reporting capabilities for cybersecurity investigations and threat intelligence research.

## User Flow
- Step 1: Analyst creates investigation case and defines targets
- Step 2: Import data from various OSINT sources (domains, certificates, social media, etc.)
- Step 3: Analyze collected data with correlation tools and visualization
- Step 4: Generate reports and export findings for further analysis

## Technical Requirements
### Platform
Next.js web application with modern React architecture

### Priority Features (MVP)
1. **Investigation Management** - Create cases, manage targets, track progress
2. **Data Import System** - Integrate with CT logs, domain tools, social media APIs
3. **Entity Management** - People, organizations, domains, IPs, certificates
4. **Timeline Analysis** - Chronological view of intelligence data
5. **Relationship Mapping** - Visualize connections between entities
6. **Export & Reporting** - Generate reports in multiple formats (PDF, CSV, JSON)
7. **Search & Filtering** - Advanced search across all collected intelligence

### OSINT Integration Targets
- **Certificate Transparency**: CT log analysis and monitoring
- **Domain Intelligence**: Subdomain enumeration, DNS analysis
- **Social Media**: Profile analysis, digital footprint mapping
- **Infrastructure**: IP analysis, hosting relationships
- **Document Intelligence**: Metadata extraction, content analysis

## New Capabilities
- Unified investigation dashboard
- Cross-source data correlation
- Advanced visualization and reporting
- Case management workflow
- Multi-analyst collaboration

# Project Configuration
- Package Manager: Bun
- Framework: Next.js 15 with App Router
- Database: PostgreSQL (future implementation)
- Styling: Tailwind CSS v4
- Authentication: NextAuth.js (future implementation)
- Charts/Visualization: Recharts, D3.js
- File Processing: For document intelligence features

# Development Commands
- Start development server: `bun run dev`
- Build production: `bun run build`
- Run linting: `bun run lint`
- Type checking: `bun run type-check`

# System Architecture

## Investigation-Centric Design
This platform is designed around **investigation cases** where analysts collect, organize, and analyze intelligence data.

### Key Architectural Decisions:
1. **Cases vs Projects**:
   - Cases = Individual investigations with specific targets and objectives
   - Projects = Long-term intelligence collection efforts spanning multiple cases
   - Each case has defined scope, timeline, and deliverables

2. **Entity-Relationship Model**:
   - All intelligence data is organized around entities (people, domains, IPs, etc.)
   - Relationships between entities are first-class objects
   - Timeline events link entities across different time periods

3. **Source Attribution**:
   - Every piece of intelligence is tagged with its source
   - Source reliability scoring for data quality assessment
   - Audit trail for all data modifications and analysis steps

4. **Collaborative Analysis**:
   - Multiple analysts can work on the same case
   - Version control for intelligence assessments
   - Comment and annotation system for collaborative review

### Data Flow Patterns:
- **Import**: Automated data ingestion from OSINT tools and APIs
- **Enrich**: Cross-reference data across multiple sources for validation
- **Analyze**: Apply analytical models and correlation algorithms
- **Export**: Generate reports and data exports for external systems

# API Development Standards

## PRIMARY API Structure (MANDATORY)

**EVERY API endpoint MUST follow this exact 3-file structure:**

### File Structure:
```
/src/app/api/[endpoint]/
  ├── route.ts      # Server-side API handler
  ├── contracts.ts  # Zod schemas & TypeScript types  
  └── clients.ts    # Client-side functions (FRONTEND ONLY)
```

### File Responsibilities:

1. **`route.ts`** - API Route Handler
   - Contains HTTP method handlers (GET, POST, PUT, DELETE)
   - Implements authentication and authorization checks
   - Handles business logic and data processing
   - Imports validation from `contracts.ts`

2. **`contracts.ts`** - Validation & Types
   - Zod validation schemas for all requests/responses
   - TypeScript type exports derived from schemas
   - Helper functions for validation and response creation
   - OSINT-specific data models (entities, relationships, sources)

3. **`clients.ts`** - Client Functions (Frontend Interface)
   - **FRONTEND MUST USE ONLY THIS FILE**
   - Exported functions (NOT classes) for all API calls
   - Type-safe using contracts from `contracts.ts`
   - Handles error cases and response validation
   - OSINT utility functions (data formatting, export helpers)

### Critical Rules:
- ✅ **ALWAYS 3 FILES** - Never deviate from this structure
- ✅ **Frontend uses ONLY clients.ts** - No direct fetch calls or route imports
- ✅ **Functions not classes** - All clients.ts exports must be functions
- ✅ **Full type safety** - Complete TypeScript typing throughout
- ✅ **Zod validation** - All intelligence data must be validated with schemas

# OSINT-Specific Development Patterns

## Intelligence Data Standards
1. **Source Attribution**: Every data point MUST include source metadata
2. **Entity Management**: All intelligence entities follow standardized schemas
3. **Relationship Modeling**: Connections between entities are explicit

## Security & Privacy Considerations
1. **Data Sanitization**: All imported intelligence data must be sanitized
2. **Access Control**: Role-based access to sensitive investigations
3. **Audit Logging**: Complete audit trail for all intelligence operations
4. **Data Retention**: Configurable retention policies for different data types

## Error Prevention
1. **Data Validation**: Strict validation for all OSINT data imports
2. **Source Verification**: Automated checks for source authenticity
3. **Duplicate Detection**: Prevent duplicate entity creation across sources
4. **Confidence Scoring**: All intelligence assessments include confidence levels

## Styling Patterns with Tailwind CSS v4

### Component Organization
```typescript
// ✅ CORRECT - Investigation-specific component styling
const InvestigationCard = 'bg-white border border-gray-200 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow';
const EntityBadge = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
const TimelineLine = 'absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200';

// Intelligence-specific color coding
const ConfidenceColors = {
  high: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
  low: 'bg-red-100 text-red-800 border-red-200'
};
```

### OSINT UI Patterns
- **Timeline Views**: Chronological intelligence visualization
- **Entity Cards**: Standardized entity information display
- **Relationship Graphs**: Interactive network visualization
- **Source Attribution**: Clear source labeling for all data
- **Confidence Indicators**: Visual confidence level representation