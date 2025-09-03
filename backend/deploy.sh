#!/bin/bash

# BiteBase Intelligence - Deployment Script
# This script helps deploy the Python backend to various serverless platforms

set -e  # Exit on any error

echo "🚀 BiteBase Intelligence Backend Deployment"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check dependencies
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 is required but not installed."
        exit 1
    fi
    
    if ! command -v pip &> /dev/null; then
        print_error "pip is required but not installed."
        exit 1
    fi
    
    print_success "Dependencies check passed"
}

# Install Python dependencies
install_dependencies() {
    print_status "Installing Python dependencies..."
    pip install -r requirements.txt
    print_success "Dependencies installed"
}

# Run tests
run_tests() {
    print_status "Running tests..."
    if [ -f "pytest.ini" ] || [ -d "tests" ]; then
        python -m pytest
        print_success "Tests passed"
    else
        print_warning "No tests found, skipping..."
    fi
}

# Deploy to Vercel
deploy_vercel() {
    print_status "Deploying to Vercel..."
    
    if ! command -v vercel &> /dev/null; then
        print_error "Vercel CLI is required. Install it with: npm i -g vercel"
        exit 1
    fi
    
    print_status "Running Vercel deployment..."
    vercel --prod
    print_success "Deployed to Vercel successfully!"
}

# Deploy to AWS Lambda (using Serverless Framework)
deploy_aws() {
    print_status "Deploying to AWS Lambda..."
    
    if ! command -v serverless &> /dev/null; then
        print_error "Serverless Framework is required. Install it with: npm i -g serverless"
        exit 1
    fi
    
    print_status "Running Serverless deployment..."
    serverless deploy
    print_success "Deployed to AWS Lambda successfully!"
}

# Deploy to Google Cloud Functions
deploy_gcp() {
    print_status "Deploying to Google Cloud Functions..."
    
    if ! command -v gcloud &> /dev/null; then
        print_error "Google Cloud CLI is required."
        exit 1
    fi
    
    print_status "Running Google Cloud deployment..."
    gcloud functions deploy bitebase-api \
        --runtime python311 \
        --trigger-http \
        --allow-unauthenticated \
        --source .
    print_success "Deployed to Google Cloud Functions successfully!"
}

# Main deployment function
deploy() {
    local platform=$1
    
    print_status "Starting deployment to $platform..."
    
    # Common steps
    check_dependencies
    install_dependencies
    run_tests
    
    # Platform-specific deployment
    case $platform in
        "vercel")
            deploy_vercel
            ;;
        "aws")
            deploy_aws
            ;;
        "gcp")
            deploy_gcp
            ;;
        *)
            print_error "Unknown platform: $platform"
            echo "Available platforms: vercel, aws, gcp"
            exit 1
            ;;
    esac
    
    print_success "🎉 Deployment completed successfully!"
}

# Show help
show_help() {
    echo "Usage: $0 [PLATFORM]"
    echo ""
    echo "Platforms:"
    echo "  vercel    Deploy to Vercel (recommended)"
    echo "  aws       Deploy to AWS Lambda"
    echo "  gcp       Deploy to Google Cloud Functions"
    echo ""
    echo "Examples:"
    echo "  $0 vercel"
    echo "  $0 aws"
    echo ""
    echo "Environment Setup:"
    echo "  1. Copy .env.example to .env and fill in your values"
    echo "  2. Make sure you're logged into your chosen platform CLI"
    echo "  3. Run this script with your target platform"
}

# Main script logic
if [ $# -eq 0 ]; then
    show_help
    exit 0
fi

case $1 in
    "-h"|"--help"|"help")
        show_help
        ;;
    *)
        deploy $1
        ;;
esac