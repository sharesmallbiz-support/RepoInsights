# GitHub Repository Analytics Tool

## Overview

A comprehensive GitHub repository analysis tool that provides DORA metrics, contributor insights, and repository health assessments for development teams. The application allows users to analyze public GitHub repositories by entering a GitHub URL and generates detailed analytics including deployment frequency, lead time for changes, contributor statistics, work classification, and repository health metrics. Built as a full-stack web application with a React frontend and Express.js backend, it's designed to help development teams, project managers, and engineering leaders make data-driven decisions about development processes.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript in strict mode
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system inspired by GitHub, Linear, and Vercel
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation resolvers

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Validation**: Zod schemas for type-safe API contracts
- **Session Management**: Connect-pg-simple for PostgreSQL session storage

### Database Design
- **Primary Database**: PostgreSQL with Neon serverless driver
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Tables**: 
  - `users` table for authentication
  - `github_analysis` table storing repository analysis results as JSON
- **Data Storage**: Raw GitHub API responses and calculated metrics stored as JSON columns

### GitHub Integration
- **API Client**: Octokit REST API client for GitHub data fetching
- **Authentication**: Replit Connectors system for GitHub OAuth integration
- **Rate Limiting**: Built-in Octokit rate limiting and error handling
- **Data Processing**: Custom analyzer that processes commit history, contributors, and repository metadata

### Design System
- **Theme Support**: Dark/light mode with CSS custom properties
- **Color Palette**: GitHub-inspired blue primary, with success green and warning amber
- **Typography**: Inter font family with JetBrains Mono for code/metrics
- **Component Library**: Comprehensive set of reusable components following atomic design principles
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints

### Analysis Engine
- **DORA Metrics**: Automated calculation of deployment frequency, lead time, change failure rate, and recovery time
- **Health Metrics**: Repository activity, contributor diversity, code quality indicators
- **Work Classification**: AI-powered commit message analysis to categorize work as innovation, bug fixes, maintenance, or documentation
- **Timeline Analysis**: Daily commit activity visualization and trend analysis

### Development Workflow
- **Development**: Hot reload with Vite dev server and Express backend
- **Build Process**: Client-side Vite build with server-side esbuild bundling
- **Type Safety**: Shared TypeScript schemas between frontend and backend
- **Error Handling**: Comprehensive error boundaries and API error responses