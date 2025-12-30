#!/bin/bash

# ChaseOS Deployment Script
# Builds the WASM kernel and web application, optionally deploys to Cloudflare Pages

set -e  # Exit on error

echo "======================================"
echo "ChaseOS Deployment Script"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Parse command line arguments
DEPLOY=false
PROJECT_NAME="chaseos"

while [[ $# -gt 0 ]]; do
  case $1 in
    --deploy)
      DEPLOY=true
      shift
      ;;
    --project-name)
      PROJECT_NAME="$2"
      shift 2
      ;;
    --help)
      echo "Usage: ./deploy.sh [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  --deploy              Deploy to Cloudflare Pages after building"
      echo "  --project-name NAME   Cloudflare Pages project name (default: chaseos)"
      echo "  --help                Show this help message"
      echo ""
      echo "Examples:"
      echo "  ./deploy.sh                              # Build only"
      echo "  ./deploy.sh --deploy                     # Build and deploy"
      echo "  ./deploy.sh --deploy --project-name app  # Build and deploy to 'app' project"
      exit 0
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

# Step 1: Build WASM kernel
echo -e "${YELLOW}[1/3] Building WASM kernel...${NC}"
cd crates/kernel

if ! command -v wasm-pack &> /dev/null; then
    echo -e "${RED}Error: wasm-pack is not installed${NC}"
    echo "Install it with: curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh"
    exit 1
fi

wasm-pack build --target web --out-dir pkg

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ WASM kernel built successfully${NC}"
else
    echo -e "${RED}✗ WASM kernel build failed${NC}"
    exit 1
fi

cd ../..

# Step 2: Install dependencies and build web app
echo ""
echo -e "${YELLOW}[2/3] Building web application...${NC}"
cd apps/web

# Check if node_modules exists, if not run npm install
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Web application built successfully${NC}"
    echo -e "${GREEN}✓ Build output: apps/web/dist${NC}"
else
    echo -e "${RED}✗ Web application build failed${NC}"
    exit 1
fi

cd ../..

# Step 3: Deploy to Cloudflare Pages (if requested)
if [ "$DEPLOY" = true ]; then
    echo ""
    echo -e "${YELLOW}[3/3] Deploying to Cloudflare Pages...${NC}"
    
    if ! command -v wrangler &> /dev/null; then
        echo -e "${RED}Error: wrangler is not installed${NC}"
        echo "Install it with: npm install -g wrangler"
        exit 1
    fi
    
    cd apps/web
    wrangler pages deploy dist --project-name="$PROJECT_NAME"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Deployment successful!${NC}"
    else
        echo -e "${RED}✗ Deployment failed${NC}"
        exit 1
    fi
    
    cd ../..
else
    echo ""
    echo -e "${YELLOW}[3/3] Skipping deployment${NC}"
    echo "To deploy, run: ./deploy.sh --deploy"
fi

echo ""
echo "======================================"
echo -e "${GREEN}Build completed successfully!${NC}"
echo "======================================"
echo ""
echo "Build output: apps/web/dist"
echo ""
if [ "$DEPLOY" = false ]; then
    echo "To deploy to Cloudflare Pages:"
    echo "  ./deploy.sh --deploy"
    echo ""
    echo "Or manually deploy with wrangler:"
    echo "  cd apps/web && wrangler pages deploy dist --project-name=$PROJECT_NAME"
fi
