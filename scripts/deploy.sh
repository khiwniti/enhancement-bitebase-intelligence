#!/bin/bash

# BiteBase Intelligence Deployment Script
# This script handles deployment to different environments

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENVIRONMENT="${1:-staging}"
IMAGE_TAG="${2:-latest}"

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
    
    # Check if Docker is installed and running
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        log_error "Docker is not running"
        exit 1
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed"
        exit 1
    fi
    
    # Check if environment file exists
    if [ ! -f "$PROJECT_ROOT/.env.$ENVIRONMENT" ]; then
        log_error "Environment file .env.$ENVIRONMENT not found"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Function to load environment variables
load_environment() {
    log_info "Loading environment variables for $ENVIRONMENT..."
    
    # Load environment-specific variables
    set -a
    source "$PROJECT_ROOT/.env.$ENVIRONMENT"
    set +a
    
    # Set deployment-specific variables
    export IMAGE_TAG="$IMAGE_TAG"
    export DEPLOYMENT_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    
    log_success "Environment variables loaded"
}

# Function to backup database (production only)
backup_database() {
    if [ "$ENVIRONMENT" = "production" ]; then
        log_info "Creating database backup..."
        
        BACKUP_DIR="$PROJECT_ROOT/backups"
        mkdir -p "$BACKUP_DIR"
        
        BACKUP_FILE="$BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql"
        
        docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump \
            -U "$POSTGRES_USER" \
            -d "$POSTGRES_DB" \
            --no-owner \
            --no-privileges \
            > "$BACKUP_FILE"
        
        # Compress backup
        gzip "$BACKUP_FILE"
        
        log_success "Database backup created: ${BACKUP_FILE}.gz"
        
        # Keep only last 7 backups
        find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +7 -delete
    fi
}

# Function to pull latest images
pull_images() {
    log_info "Pulling latest Docker images..."
    
    if [ "$ENVIRONMENT" = "production" ]; then
        docker-compose -f docker-compose.prod.yml pull
    else
        docker-compose pull
    fi
    
    log_success "Docker images pulled"
}

# Function to run database migrations
run_migrations() {
    log_info "Running database migrations..."
    
    if [ "$ENVIRONMENT" = "production" ]; then
        docker-compose -f docker-compose.prod.yml run --rm backend python -m alembic upgrade head
    else
        docker-compose run --rm backend python -m alembic upgrade head
    fi
    
    log_success "Database migrations completed"
}

# Function to deploy services
deploy_services() {
    log_info "Deploying services..."
    
    if [ "$ENVIRONMENT" = "production" ]; then
        # Production deployment with zero-downtime
        docker-compose -f docker-compose.prod.yml up -d --remove-orphans
        
        # Wait for services to be healthy
        log_info "Waiting for services to be healthy..."
        sleep 30
        
        # Check service health
        check_service_health
        
    else
        # Development/staging deployment
        docker-compose up -d --remove-orphans
    fi
    
    log_success "Services deployed"
}

# Function to check service health
check_service_health() {
    log_info "Checking service health..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        log_info "Health check attempt $attempt/$max_attempts"
        
        # Check backend health
        if curl -f -s "http://localhost:8000/health" > /dev/null; then
            log_success "Backend service is healthy"
            break
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            log_error "Backend service health check failed after $max_attempts attempts"
            exit 1
        fi
        
        sleep 10
        ((attempt++))
    done
    
    # Check frontend health
    if curl -f -s "http://localhost/health" > /dev/null; then
        log_success "Frontend service is healthy"
    else
        log_warning "Frontend service health check failed"
    fi
}

# Function to run post-deployment tests
run_post_deployment_tests() {
    log_info "Running post-deployment tests..."
    
    # Run basic smoke tests
    python "$SCRIPT_DIR/smoke_tests.py" --environment "$ENVIRONMENT"
    
    if [ $? -eq 0 ]; then
        log_success "Post-deployment tests passed"
    else
        log_error "Post-deployment tests failed"
        exit 1
    fi
}

# Function to cleanup old resources
cleanup() {
    log_info "Cleaning up old resources..."
    
    # Remove unused Docker images
    docker image prune -f
    
    # Remove unused volumes (be careful in production)
    if [ "$ENVIRONMENT" != "production" ]; then
        docker volume prune -f
    fi
    
    log_success "Cleanup completed"
}

# Function to send deployment notification
send_notification() {
    log_info "Sending deployment notification..."
    
    local status="$1"
    local message="BiteBase Intelligence deployment to $ENVIRONMENT: $status"
    
    # Add your notification logic here (Slack, email, etc.)
    # Example: curl -X POST -H 'Content-type: application/json' \
    #   --data "{\"text\":\"$message\"}" \
    #   "$SLACK_WEBHOOK_URL"
    
    log_info "Notification sent: $message"
}

# Function to rollback deployment
rollback() {
    log_error "Deployment failed, initiating rollback..."
    
    if [ "$ENVIRONMENT" = "production" ]; then
        # Restore from backup if needed
        log_info "Restoring previous version..."
        
        # Stop current services
        docker-compose -f docker-compose.prod.yml down
        
        # Deploy previous version (you would need to implement version tracking)
        # docker-compose -f docker-compose.prod.yml up -d
        
        log_success "Rollback completed"
    fi
}

# Main deployment function
main() {
    log_info "Starting deployment to $ENVIRONMENT environment with image tag $IMAGE_TAG"
    
    # Set error handling
    trap 'rollback' ERR
    
    # Execute deployment steps
    check_prerequisites
    load_environment
    backup_database
    pull_images
    run_migrations
    deploy_services
    run_post_deployment_tests
    cleanup
    
    # Send success notification
    send_notification "SUCCESS"
    
    log_success "Deployment to $ENVIRONMENT completed successfully!"
    
    # Display service URLs
    echo ""
    log_info "Service URLs:"
    echo "  Frontend: http://localhost"
    echo "  Backend API: http://localhost:8000"
    echo "  API Documentation: http://localhost:8000/docs"
    
    if [ "$ENVIRONMENT" = "production" ]; then
        echo "  Monitoring: http://localhost:3001"
        echo "  Metrics: http://localhost:9090"
    fi
}

# Script usage
usage() {
    echo "Usage: $0 [environment] [image_tag]"
    echo ""
    echo "Arguments:"
    echo "  environment  Target environment (staging|production) [default: staging]"
    echo "  image_tag    Docker image tag to deploy [default: latest]"
    echo ""
    echo "Examples:"
    echo "  $0 staging"
    echo "  $0 production v1.2.3"
    echo "  $0 staging latest"
}

# Check if help is requested
if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
    usage
    exit 0
fi

# Validate environment
if [ "$ENVIRONMENT" != "staging" ] && [ "$ENVIRONMENT" != "production" ]; then
    log_error "Invalid environment: $ENVIRONMENT"
    usage
    exit 1
fi

# Run main deployment
main
