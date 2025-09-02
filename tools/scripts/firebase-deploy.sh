#!/bin/bash

# BiteBase Intelligence Firebase Deployment Script
# Automated deployment for Firebase services

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENVIRONMENT="${1:-development}"
DEPLOY_TARGET="${2:-all}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if Firebase CLI is installed
    if ! command -v firebase &> /dev/null; then
        log_error "Firebase CLI is not installed. Please install it first:"
        echo "npm install -g firebase-tools"
        exit 1
    fi
    
    # Check if logged in to Firebase
    if ! firebase projects:list &> /dev/null; then
        log_error "Not logged in to Firebase. Please run:"
        echo "firebase login"
        exit 1
    fi
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi
    
    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Function to set Firebase project
set_firebase_project() {
    log_info "Setting Firebase project for $ENVIRONMENT..."
    
    case $ENVIRONMENT in
        "development")
            firebase use development 2>/dev/null || firebase use default
            ;;
        "staging")
            firebase use staging 2>/dev/null || firebase use default
            ;;
        "production")
            firebase use production 2>/dev/null || firebase use default
            ;;
        *)
            firebase use default
            ;;
    esac
    
    log_success "Firebase project set for $ENVIRONMENT"
}

# Function to install dependencies
install_dependencies() {
    log_info "Installing dependencies..."
    
    # Install root dependencies
    cd "$PROJECT_ROOT"
    npm install
    
    # Install frontend dependencies
    cd "$PROJECT_ROOT/frontend"
    npm install
    
    # Install functions dependencies
    cd "$PROJECT_ROOT/functions"
    npm install
    
    log_success "Dependencies installed"
}

# Function to build frontend
build_frontend() {
    log_info "Building frontend..."
    
    cd "$PROJECT_ROOT/frontend"
    
    # Set environment variables
    case $ENVIRONMENT in
        "production")
            export NODE_ENV=production
            ;;
        "staging")
            export NODE_ENV=staging
            ;;
        *)
            export NODE_ENV=development
            ;;
    esac
    
    # Build the application
    npm run build
    
    log_success "Frontend built successfully"
}

# Function to build functions
build_functions() {
    log_info "Building Firebase Functions..."
    
    cd "$PROJECT_ROOT/functions"
    npm run build
    
    log_success "Functions built successfully"
}

# Function to deploy Data Connect
deploy_dataconnect() {
    log_info "Deploying Firebase Data Connect..."
    
    cd "$PROJECT_ROOT"
    
    # Deploy Data Connect schema and connectors
    firebase deploy --only dataconnect
    
    log_success "Data Connect deployed successfully"
}

# Function to deploy Functions
deploy_functions() {
    log_info "Deploying Firebase Functions..."
    
    cd "$PROJECT_ROOT"
    
    # Deploy functions
    firebase deploy --only functions
    
    log_success "Functions deployed successfully"
}

# Function to deploy Hosting
deploy_hosting() {
    log_info "Deploying Firebase Hosting..."
    
    cd "$PROJECT_ROOT"
    
    # Deploy hosting
    firebase deploy --only hosting
    
    log_success "Hosting deployed successfully"
}

# Function to deploy Firestore rules
deploy_firestore() {
    log_info "Deploying Firestore rules and indexes..."
    
    cd "$PROJECT_ROOT"
    
    # Deploy Firestore rules and indexes
    firebase deploy --only firestore
    
    log_success "Firestore rules and indexes deployed successfully"
}

# Function to deploy Storage rules
deploy_storage() {
    log_info "Deploying Storage rules..."
    
    cd "$PROJECT_ROOT"
    
    # Deploy Storage rules
    firebase deploy --only storage
    
    log_success "Storage rules deployed successfully"
}

# Function to run post-deployment tests
run_post_deployment_tests() {
    log_info "Running post-deployment tests..."
    
    # Get the deployed URL
    PROJECT_ID=$(firebase use | grep "Now using project" | awk '{print $4}' | tr -d '()')
    DEPLOYED_URL="https://${PROJECT_ID}.web.app"
    
    # Basic health check
    if command -v curl &> /dev/null; then
        if curl -f -s "$DEPLOYED_URL" > /dev/null; then
            log_success "Health check passed: $DEPLOYED_URL"
        else
            log_warning "Health check failed for: $DEPLOYED_URL"
        fi
    fi
    
    log_success "Post-deployment tests completed"
}

# Function to generate deployment report
generate_deployment_report() {
    log_info "Generating deployment report..."
    
    PROJECT_ID=$(firebase use | grep "Now using project" | awk '{print $4}' | tr -d '()')
    TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    
    cat > "$PROJECT_ROOT/deployment-report.md" << EOF
# Deployment Report

**Environment:** $ENVIRONMENT  
**Target:** $DEPLOY_TARGET  
**Timestamp:** $TIMESTAMP  
**Project ID:** $PROJECT_ID  

## Deployed Services

- **Frontend:** https://${PROJECT_ID}.web.app
- **Functions:** https://us-central1-${PROJECT_ID}.cloudfunctions.net
- **Data Connect:** https://dataconnect.googleapis.com/v1beta/projects/${PROJECT_ID}/locations/us-central1/services/enhancement-bitebase-intelligence

## Next Steps

1. Verify all services are working correctly
2. Run integration tests
3. Monitor performance and errors
4. Update documentation if needed

## Rollback Instructions

If issues are detected, rollback using:
\`\`\`bash
firebase hosting:rollback
\`\`\`
EOF
    
    log_success "Deployment report generated: deployment-report.md"
}

# Main deployment function
main() {
    log_info "Starting Firebase deployment for $ENVIRONMENT environment"
    log_info "Deploy target: $DEPLOY_TARGET"
    
    # Execute deployment steps
    check_prerequisites
    set_firebase_project
    install_dependencies
    
    case $DEPLOY_TARGET in
        "frontend"|"hosting")
            build_frontend
            deploy_hosting
            ;;
        "functions")
            build_functions
            deploy_functions
            ;;
        "dataconnect")
            deploy_dataconnect
            ;;
        "rules")
            deploy_firestore
            deploy_storage
            ;;
        "all")
            build_frontend
            build_functions
            deploy_dataconnect
            deploy_functions
            deploy_hosting
            deploy_firestore
            deploy_storage
            ;;
        *)
            log_error "Invalid deploy target: $DEPLOY_TARGET"
            echo "Valid targets: frontend, functions, dataconnect, rules, all"
            exit 1
            ;;
    esac
    
    run_post_deployment_tests
    generate_deployment_report
    
    log_success "Firebase deployment completed successfully!"
    
    # Display service URLs
    PROJECT_ID=$(firebase use | grep "Now using project" | awk '{print $4}' | tr -d '()')
    echo ""
    log_info "Service URLs:"
    echo "  Frontend: https://${PROJECT_ID}.web.app"
    echo "  Functions: https://us-central1-${PROJECT_ID}.cloudfunctions.net"
    echo "  Console: https://console.firebase.google.com/project/${PROJECT_ID}"
}

# Script usage
usage() {
    echo "Usage: $0 [environment] [target]"
    echo ""
    echo "Arguments:"
    echo "  environment  Target environment (development|staging|production) [default: development]"
    echo "  target       Deploy target (frontend|functions|dataconnect|rules|all) [default: all]"
    echo ""
    echo "Examples:"
    echo "  $0 development all"
    echo "  $0 production frontend"
    echo "  $0 staging functions"
}

# Check if help is requested
if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
    usage
    exit 0
fi

# Validate environment
if [ "$ENVIRONMENT" != "development" ] && [ "$ENVIRONMENT" != "staging" ] && [ "$ENVIRONMENT" != "production" ]; then
    log_error "Invalid environment: $ENVIRONMENT"
    usage
    exit 1
fi

# Run main deployment
main
