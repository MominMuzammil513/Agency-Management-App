// lib/realtime-connections.ts - Shared connection storage for SSE
// This file ensures all modules share the same connections Map instance
// Important: This works because Next.js API routes use Node.js runtime by default

// Store active SSE connections (shared across all imports)
// Key format: "agencyId:userId"
// Value: Array of ReadableStreamDefaultController instances
export const connections = new Map<string, ReadableStreamDefaultController[]>();
