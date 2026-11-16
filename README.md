# UniqueRosejay Platform

This repository contains the MVP foundation for an integrated fashion, hotel and apartment platform built around the requirements in `Masterplan.md`.

## Stack

- Frontend: Next.js + React + TypeScript + Tailwind CSS
- Backend: Node.js + Express + TypeScript
- Database: PostgreSQL (configured for future schema work)
- Auth: JWT-based foundation with protected routes planned

## Getting started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```
3. Start development servers:
   ```bash
   npm run dev
   ```
4. Open the web app at http://localhost:3000 and the API at http://localhost:4000/health

## Workspace structure

- `apps/web`: Next.js storefront and shared experience shell
- `apps/server`: Express API foundation, validation and database configuration
- `docs/`: project documentation and phase tracking

## Current stage

This repository is in Phase 1: foundation and project structure. The app is intentionally scaffolded with working baseline configuration and documentation, not completed business modules.
