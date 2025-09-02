#!/bin/bash

# BiteBase Intelligence Firebase Setup Script
# Initial setup and configuration for Firebase services

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

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
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    # Check Node.js version
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        log_error "Node.js version 18+ is required. Current version: $(node --version)"
        exit 1
    fi
    
    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Function to install Firebase CLI
install_firebase_cli() {
    log_info "Installing Firebase CLI..."
    
    if command -v firebase &> /dev/null; then
        log_info "Firebase CLI already installed: $(firebase --version)"
    else
        npm install -g firebase-tools
        log_success "Firebase CLI installed successfully"
    fi
}

# Function to login to Firebase
firebase_login() {
    log_info "Checking Firebase authentication..."
    
    if firebase projects:list &> /dev/null; then
        log_info "Already logged in to Firebase"
    else
        log_info "Please log in to Firebase..."
        firebase login
        log_success "Logged in to Firebase successfully"
    fi
}

# Function to initialize Firebase project
init_firebase_project() {
    log_info "Initializing Firebase project..."
    
    cd "$PROJECT_ROOT"
    
    # Check if already initialized
    if [ -f "firebase.json" ]; then
        log_info "Firebase project already initialized"
        return
    fi
    
    # Initialize Firebase project
    log_info "Please select your Firebase project and configure services..."
    firebase init
    
    log_success "Firebase project initialized"
}

# Function to setup environment files
setup_environment_files() {
    log_info "Setting up environment files..."
    
    cd "$PROJECT_ROOT/frontend"
    
    # Create .env.local from example if it doesn't exist
    if [ ! -f ".env.local" ]; then
        if [ -f ".env.example" ]; then
            cp ".env.example" ".env.local"
            log_warning "Created .env.local from .env.example"
            log_warning "Please update .env.local with your Firebase configuration"
        else
            log_warning ".env.example not found. Please create .env.local manually"
        fi
    else
        log_info ".env.local already exists"
    fi
    
    log_success "Environment files setup completed"
}

# Function to install project dependencies
install_dependencies() {
    log_info "Installing project dependencies..."
    
    # Install root dependencies
    cd "$PROJECT_ROOT"
    if [ -f "package.json" ]; then
        npm install
        log_success "Root dependencies installed"
    fi
    
    # Install frontend dependencies
    cd "$PROJECT_ROOT/frontend"
    if [ -f "package.json" ]; then
        npm install
        log_success "Frontend dependencies installed"
    fi
    
    # Install functions dependencies
    cd "$PROJECT_ROOT/functions"
    if [ -f "package.json" ]; then
        npm install
        log_success "Functions dependencies installed"
    fi
    
    log_success "All dependencies installed"
}

# Function to setup Firebase emulators
setup_emulators() {
    log_info "Setting up Firebase emulators..."
    
    cd "$PROJECT_ROOT"
    
    # Install emulator dependencies
    firebase setup:emulators:firestore
    firebase setup:emulators:auth
    firebase setup:emulators:functions
    firebase setup:emulators:storage
    
    log_success "Firebase emulators setup completed"
}

# Function to create initial data
create_initial_data() {
    log_info "Creating initial data structure..."
    
    cd "$PROJECT_ROOT"
    
    # Create sample data directory
    mkdir -p data/samples
    
    # Create sample restaurant data
    cat > data/samples/restaurants.json << 'EOF'
[
  {
    "name": "Sample Restaurant",
    "description": "A sample restaurant for testing",
    "cuisineType": "American",
    "priceRange": "$$",
    "address": "123 Main St",
    "city": "San Francisco",
    "state": "CA",
    "zipCode": "94102",
    "latitude": 37.7749,
    "longitude": -122.4194,
    "phoneNumber": "(555) 123-4567",
    "website": "https://example.com",
    "rating": 4.2,
    "reviewCount": 150,
    "isOpen": true,
    "businessHours": {
      "monday": "11:00-22:00",
      "tuesday": "11:00-22:00",
      "wednesday": "11:00-22:00",
      "thursday": "11:00-22:00",
      "friday": "11:00-23:00",
      "saturday": "10:00-23:00",
      "sunday": "10:00-21:00"
    }
  }
]
EOF
    
    log_success "Initial data structure created"
}

# Function to test Firebase connection
test_firebase_connection() {
    log_info "Testing Firebase connection..."
    
    cd "$PROJECT_ROOT"
    
    # Test Firebase project access
    if firebase projects:list &> /dev/null; then
        log_success "Firebase connection test passed"
    else
        log_error "Firebase connection test failed"
        return 1
    fi
    
    # Test emulators (if available)
    log_info "Testing emulator configuration..."
    firebase emulators:exec --only auth,firestore,functions,storage "echo 'Emulators test passed'" || log_warning "Emulators test failed (this is normal if not configured yet)"
}

# Function to generate setup report
generate_setup_report() {
    log_info "Generating setup report..."
    
    TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    
    cat > "$PROJECT_ROOT/setup-report.md" << EOF
# Firebase Setup Report

**Timestamp:** $TIMESTAMP

## Setup Status

- ✅ Prerequisites checked
- ✅ Firebase CLI installed
- ✅ Firebase authentication completed
- ✅ Project initialized
- ✅ Dependencies installed
- ✅ Environment files configured
- ✅ Emulators setup
- ✅ Initial data created

## Next Steps

1. **Configure Environment Variables**
   - Update \`frontend/.env.local\` with your Firebase configuration
   - Get Firebase config from: https://console.firebase.google.com

2. **Start Development**
   \`\`\`bash
   # Start Firebase emulators
   firebase emulators:start
   
   # In another terminal, start frontend
   cd frontend
   npm run dev
   \`\`\`

3. **Deploy to Firebase**
   \`\`\`bash
   # Deploy all services
   ./scripts/firebase-deploy.sh development all
   \`\`\`

## Important Files

- \`firebase.json\` - Firebase configuration
- \`frontend/.env.local\` - Environment variables
- \`dataconnect/schema/schema.gql\` - Data Connect schema
- \`functions/src/index.ts\` - Cloud Functions

## Useful Commands

- \`firebase emulators:start\` - Start local emulators
- \`firebase deploy\` - Deploy to Firebase
- \`firebase serve\` - Serve locally
- \`firebase projects:list\` - List available projects

## Support

- Firebase Documentation: https://firebase.google.com/docs
- BiteBase Intelligence Docs: ./docs/
EOF
    
    log_success "Setup report generated: setup-report.md"
}

# Main setup function
main() {
    log_info "Starting BiteBase Intelligence Firebase setup..."
    
    # Execute setup steps
    check_prerequisites
    install_firebase_cli
    firebase_login
    init_firebase_project
    setup_environment_files
    install_dependencies
    setup_emulators
    create_initial_data
    test_firebase_connection
    generate_setup_report
    
    log_success "Firebase setup completed successfully!"
    
    echo ""
    log_info "Next steps:"
    echo "1. Update frontend/.env.local with your Firebase configuration"
    echo "2. Start development: firebase emulators:start"
    echo "3. Deploy: ./scripts/firebase-deploy.sh development all"
    echo ""
    echo "For detailed instructions, see: setup-report.md"
}

# Script usage
usage() {
    echo "Usage: $0"
    echo ""
    echo "This script sets up Firebase for the BiteBase Intelligence project."
    echo "It will install dependencies, configure Firebase, and prepare the development environment."
}

# Check if help is requested
if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
    usage
    exit 0
fi

# Run main setup
main
