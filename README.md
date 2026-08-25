# S.O.L.V.E.R. — 3D On-Chain Forensics Tool for Solana (with W3C WebMCP)

S.O.L.V.E.R. (*Solana On-Chain Live Visualization & Exploration Engine*) is a client-side 3D web application designed for on-chain forensics and real-time transaction analysis on the Solana network.

![S.O.L.V.E.R. 3D Banner](./public/banner.jpg)

## Features
- **Live Solana Mainnet Data:** Connects directly via `@solana/web3.js` to inspect real wallet transactions.
- **Client-Side DuckDB-Wasm:** Ingests live block data into an in-memory SQL database, enabling zero-latency custom SQL queries in the browser.
- **Interactive 3D Canvas:** Renders transaction graphs in 3D using React Three Fiber with glowing emissive nodes in signature Solana colors (`#9945FF` Purple, `#14F195` Green, `#FED700` Gold).
- **W3C WebMCP Standard:** Implements `document.modelContext.registerTool()` for native AI agent interaction (`filter_transactions`, `highlight_node`, `reset_view`).

## Tech Stack
- **Framework:** React 18, TypeScript, Vite, Tailwind CSS
- **3D Engine:** Three.js, `@react-three/fiber`, `@react-three/drei`
- **Data Engine:** `@duckdb/duckdb-wasm`, `@solana/web3.js`
- **AI Agent Protocol:** W3C WebMCP (`@mcp-b/webmcp-types`)
- **Deployment:** Docker, Caddy, Railway

## Local Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Production build
npm run build
```

## Railway Deployment
Containerized using a multi-stage `Dockerfile` and `Caddyfile`.

Live Production URL: [https://solana-3d-forensics-production.up.railway.app](https://solana-3d-forensics-production.up.railway.app)
