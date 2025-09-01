#!/bin/sh

# Docker entrypoint script for frontend container
set -e

# Function to log messages
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Function to substitute environment variables in nginx config
substitute_env_vars() {
    log "Substituting environment variables in nginx configuration..."
    
    # Create a temporary config file with environment variable substitution
    envsubst '${BACKEND_URL}' < /etc/nginx/nginx.conf > /tmp/nginx.conf
    
    # Move the substituted config back
    mv /tmp/nginx.conf /etc/nginx/nginx.conf
}

# Function to validate nginx configuration
validate_nginx_config() {
    log "Validating nginx configuration..."
    nginx -t
    if [ $? -eq 0 ]; then
        log "Nginx configuration is valid"
    else
        log "ERROR: Nginx configuration is invalid"
        exit 1
    fi
}

# Function to create health check endpoint
create_health_check() {
    log "Creating health check endpoint..."
    cat > /usr/share/nginx/html/health <<EOF
{
    "status": "healthy",
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "version": "${APP_VERSION:-unknown}",
    "environment": "${ENVIRONMENT:-production}"
}
EOF
}

# Function to set proper permissions
set_permissions() {
    log "Setting proper file permissions..."
    
    # Ensure nginx can read the files
    find /usr/share/nginx/html -type f -exec chmod 644 {} \;
    find /usr/share/nginx/html -type d -exec chmod 755 {} \;
    
    # Ensure nginx can write to log directories
    touch /var/log/nginx/access.log /var/log/nginx/error.log
    chmod 644 /var/log/nginx/access.log /var/log/nginx/error.log
}

# Function to optimize for production
optimize_for_production() {
    log "Applying production optimizations..."
    
    # Remove source maps in production
    if [ "${ENVIRONMENT}" = "production" ]; then
        log "Removing source maps for production..."
        find /usr/share/nginx/html -name "*.map" -delete
    fi
    
    # Set cache headers based on environment
    if [ "${ENVIRONMENT}" = "development" ]; then
        log "Setting development cache headers..."
        sed -i 's/expires 1y;/expires -1;/g' /etc/nginx/nginx.conf
    fi
}

# Function to handle graceful shutdown
graceful_shutdown() {
    log "Received shutdown signal, stopping nginx gracefully..."
    nginx -s quit
    wait $!
    log "Nginx stopped gracefully"
    exit 0
}

# Set up signal handlers
trap graceful_shutdown SIGTERM SIGINT

# Main execution
main() {
    log "Starting BiteBase Intelligence Frontend container..."
    log "Environment: ${ENVIRONMENT:-production}"
    log "Backend URL: ${BACKEND_URL:-http://backend:8000}"
    log "App Version: ${APP_VERSION:-unknown}"
    
    # Perform initialization steps
    substitute_env_vars
    validate_nginx_config
    create_health_check
    set_permissions
    optimize_for_production
    
    log "Initialization complete, starting nginx..."
    
    # Start nginx in the foreground
    exec "$@"
}

# Run main function with all arguments
main "$@"
