# Investigate - OSINT Intelligence Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC)](https://tailwindcss.com/)

A comprehensive OSINT (Open Source Intelligence) investigation platform designed for security researchers and analysts to organize, analyze, and visualize intelligence data from multiple sources.

## 🎯 Purpose

Streamline OSINT workflows by providing unified data collection, analysis, and reporting capabilities for cybersecurity investigations and threat intelligence research.

## ✨ Key Features

### Investigation Management
- Create and manage investigation cases with defined targets and objectives
- Track investigation progress and timelines
- Multi-analyst collaboration with role-based access control

### Data Collection & Integration
- **Certificate Transparency**: CT log analysis and monitoring
- **Domain Intelligence**: Subdomain enumeration, DNS analysis  
- **Social Media**: Profile analysis, digital footprint mapping
- **Infrastructure**: IP analysis, hosting relationships
- **Document Intelligence**: Metadata extraction, content analysis

### Analysis & Visualization
- Entity relationship mapping with interactive network graphs
- Timeline analysis for chronological intelligence visualization
- Cross-source data correlation and validation
- Confidence scoring for intelligence assessments

### Reporting & Export
- Generate comprehensive investigation reports
- Export data in multiple formats (PDF, CSV, JSON)
- Source attribution and audit trails
- Advanced search and filtering capabilities

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Bun runtime
- PostgreSQL 14+ (for production)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mgorunuch/investigate.git
   cd investigate
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Start development server**
   ```bash
   bun run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠 Development Commands

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development server |
| `bun run build` | Build for production |
| `bun run start` | Start production server |
| `bun run lint` | Run ESLint |
| `bun run type-check` | Run TypeScript type checking |

## 🏗 Architecture

### Investigation-Centric Design
The platform is built around **investigation cases** where analysts collect, organize, and analyze intelligence data.

### API Structure
Every API endpoint follows a strict 3-file structure:
```
/src/app/api/[endpoint]/
├── route.ts      # Server-side API handler
├── contracts.ts  # Zod schemas & TypeScript types  
└── clients.ts    # Client-side functions
```

### Key Components
- **Cases**: Individual investigations with specific targets and objectives
- **Entities**: People, organizations, domains, IPs, certificates
- **Relationships**: Connections between entities with source attribution
- **Timeline Events**: Chronological intelligence data points
- **Sources**: OSINT data sources with reliability scoring

## 🔧 Technology Stack

- **Framework**: Next.js 15 with App Router
- **Runtime**: Bun
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: PostgreSQL (production)
- **Validation**: Zod
- **Charts**: Recharts, D3.js
- **Authentication**: NextAuth.js (future)

## 🚀 Production Deployment

### Standard Deployment
```bash
# Build for production
bun run build

# Start production server
bun run start
```

## 🔐 Security Features

- **Data Sanitization**: All imported intelligence data is sanitized
- **Source Verification**: Automated checks for source authenticity
- **Audit Logging**: Complete audit trail for all operations
- **Access Control**: Role-based access to sensitive investigations
- **Data Retention**: Configurable retention policies

## 📊 OSINT Integration

### Supported Sources
- Certificate Transparency logs
- Domain registration data
- Social media platforms
- Infrastructure databases
- Public document repositories

### Data Standards
- **Source Attribution**: Every data point includes source metadata
- **Entity Management**: Standardized schemas for all intelligence entities
- **Relationship Modeling**: Explicit connections between entities
- **Confidence Scoring**: All assessments include confidence levels

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow the established API structure (route.ts, contracts.ts, clients.ts)
- Include comprehensive type definitions
- Add Zod validation for all data inputs
- Write tests for new functionality
- Follow security best practices

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for the OSINT community
- Inspired by modern threat intelligence platforms
- Designed with security researchers in mind

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/mgorunuch/investigate/issues)
- **Discussions**: [GitHub Discussions](https://github.com/mgorunuch/investigate/discussions)
- **Documentation**: [Wiki](https://github.com/mgorunuch/investigate/wiki)

---

**⚠️ Disclaimer**: This tool is intended for legitimate security research and investigation purposes only. Users are responsible for complying with applicable laws and regulations when conducting OSINT activities.
