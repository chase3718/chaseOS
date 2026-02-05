# ChaseOS

**🌐 Live Demo: [chasehw.com](https://chasehw.com)**

A personal operating system built for the web. ChaseOS is a fully-functional desktop environment running in your browser with a modular architecture, terminal emulator, file system, and customizable theme system.

## Features

- **Terminal Emulator**: Full-featured terminal with 19+ built-in commands
- **File System**: Virtual filesystem with persistent storage via IndexedDB
- **Application Launcher**: Modular app registry for easy extensibility
- **Theme Customization**: Fully customizable CSS variables in `/etc/theme.css`
- **File Manager**: Browse and manage files in the virtual filesystem
- **Text Editor & Viewer**: Create and edit text files
- **WASM Kernel**: High-performance Rust-based kernel compiled to WebAssembly
- **Responsive Design**: Works on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js (v16+)
- Rust toolchain
- wasm-pack (`curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh`)

### Installation

```bash
# Clone or navigate to the project
cd portfolio

# Install web dependencies
cd apps/web
npm install
cd ../..
```

### Development

```bash
# Start the dev server
cd apps/web
npm run dev
```

The app will be available at `http://localhost:5173`

## Building & Deployment

### Build Locally

```bash
./deploy.sh
```

This will:

1. Build the Rust WASM kernel
2. Build the web application
3. Output to `apps/web/dist`

### Deploy to Cloudflare Pages

```bash
# First time setup
wrangler login

# Deploy
./deploy.sh --deploy --project-name chaseos
```

## Project Structure

```
portfolio/
├── apps/
│   └── web/                    # React + TypeScript frontend
│       ├── src/
│       │   ├── applications/   # App implementations (terminal, editor, etc)
│       │   ├── components/     # Reusable UI components
│       │   ├── contexts/       # React contexts (Kernel, Config)
│       │   ├── hooks/          # Custom React hooks
│       │   ├── kernel/         # Kernel client & worker
│       │   ├── services/       # Application factory, utilities
│       │   ├── theme/          # CSS variables & theming
│       │   ├── types/          # TypeScript type definitions
│       │   └── App.tsx         # Main app component
│       └── vite.config.ts      # Vite configuration
├── crates/
│   └── kernel/                 # Rust WASM kernel
│       ├── src/
│       │   ├── lib.rs         # Virtual filesystem implementation
│       │   └── vfs.rs         # VFS logic
│       └── Cargo.toml
├── deploy.sh                   # Build & deploy automation script
└── README.md
```

## Terminal Commands

ChaseOS includes 19+ built-in commands:

- **File System**: `ls`, `cd`, `pwd`, `mkdir`, `rm`, `cp`, `mv`, `cat`, `echo`, `touch`
- **System**: `clear`, `help`
- **Applications**: `open`, `edit`

Type `help` in the terminal to see all available commands.

## Customization

### Theme Customization

Edit `/etc/theme.css` in the file browser to customize:

- Colors
- Typography
- Spacing
- Transitions
- Shadows

Changes apply immediately to the entire system.

### Adding Applications

Modify `src/services/applicationFactory.tsx` to register new applications. The app launcher supports modular extension through the application registry pattern.

## Technologies

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: CSS Variables with mobile-first responsive design
- **Kernel**: Rust compiled to WebAssembly with wasm-bindgen
- **Storage**: IndexedDB for persistent filesystem
- **Deployment**: Cloudflare Pages

## Philosophy

ChaseOS was created to explore:

- How much of an operating system can run in a browser
- The power of WebAssembly for high-performance computing
- User control and customization in web applications
- Privacy through local-first architecture

All computation happens in your browser. No data is sent to servers except during deployment.
