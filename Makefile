# BiteBase Intelligence Development Makefile

.PHONY: install install-backend install-frontend run-backend run-frontend run-dev run-all stop dev help clear-ports

# Colors for output
BLUE=\033[0;34m
GREEN=\033[0;32m
YELLOW=\033[1;33m
RED=\033[0;31m
NC=\033[0m

# Default target
.DEFAULT_GOAL := help

# Help target
help:
	@echo "$(BLUE)BiteBase Intelligence Development Commands$(NC)"
	@echo ""
	@echo "$(GREEN)Setup:$(NC)"
	@echo "  make install          - Install both backend and frontend dependencies"
	@echo "  make install-backend  - Install backend dependencies only"
	@echo "  make install-frontend - Install frontend dependencies only"
	@echo ""
	@echo "$(GREEN)Development:$(NC)"
	@echo "  make run-dev          - Start both backend and frontend in development mode"
	@echo "  make run-backend      - Start backend only"
	@echo "  make run-frontend     - Start frontend only"
	@echo "  make dev              - Alias for run-dev"
	@echo ""
	@echo "$(GREEN)Management:$(NC)"
	@echo "  make stop             - Stop all running services"
	@echo "  make clear-ports      - Force kill processes on ports 8000 and 5000"
	@echo "  make clean            - Clean build artifacts"
	@echo "  make status           - Check service status"

# Installation targets
install-backend:
	@echo "$(BLUE)Installing backend dependencies...$(NC)"
	chmod +x backend/install.sh
	chmod +x backend/run.sh
	cd backend && ./install.sh

install-frontend:
	@echo "$(BLUE)Installing frontend dependencies...$(NC)"
	chmod +x frontend/install.sh
	chmod +x frontend/run.sh
	cd frontend && ./install.sh

install: install-backend install-frontend
	@echo "$(GREEN)✓ All dependencies installed successfully!$(NC)"

# Individual service targets
run-backend:
	@echo "$(BLUE)Starting backend server...$(NC)"
	cd backend && ./run.sh

run-frontend:
	@echo "$(BLUE)Starting frontend server...$(NC)"
	cd frontend && ./run.sh

# Development target - improved version
run-dev:
	@echo "$(BLUE)🚀 Starting BiteBase Intelligence Development Environment$(NC)"
	@echo ""
	@echo "$(YELLOW)Backend will be available at: http://localhost:8000$(NC)"
	@echo "$(YELLOW)Frontend will be available at: http://localhost:5000$(NC)"
	@echo "$(YELLOW)API Documentation: http://localhost:8000/docs$(NC)"
	@echo ""
	@echo "$(RED)Press Ctrl+C to stop all services$(NC)"
	@echo ""
	@trap 'echo "$(BLUE)Shutting down services...$(NC)"; pkill -f "uvicorn app.main:app" 2>/dev/null || true; pkill -f "yarn dev" 2>/dev/null || true; pkill -f "next dev" 2>/dev/null || true; echo "$(GREEN)✓ Services stopped$(NC)"; exit 0' INT; \
	(cd backend && ./run.sh) & \
	sleep 3 && \
	(cd frontend && ./run.sh) & \
	wait

# Alias for run-dev
dev: run-dev

# Legacy target (kept for compatibility)
run-all: run-dev

# Management targets
stop:
	@echo "$(BLUE)Stopping all services...$(NC)"
	@pkill -f "uvicorn app.main:app" 2>/dev/null || true
	@pkill -f "yarn dev" 2>/dev/null || true
	@pkill -f "next dev" 2>/dev/null || true
	@echo "$(GREEN)✓ All services stopped$(NC)"

clear-ports:
	@echo "$(BLUE)Clearing ports 8000 and 5000...$(NC)"
	@echo "$(YELLOW)Checking for processes on port 8000...$(NC)"
	@if lsof -ti :8000 > /dev/null 2>&1; then \
		echo "$(RED)Found processes on port 8000, killing them...$(NC)"; \
		lsof -ti :8000 | xargs kill -9 2>/dev/null || true; \
		sleep 1; \
	else \
		echo "$(GREEN)✓ Port 8000 is free$(NC)"; \
	fi
	@echo "$(YELLOW)Checking for processes on port 5000...$(NC)"
	@if lsof -ti :5000 > /dev/null 2>&1; then \
		echo "$(RED)Found processes on port 5000, killing them...$(NC)"; \
		lsof -ti :5000 | xargs kill -9 2>/dev/null || true; \
		sleep 1; \
	else \
		echo "$(GREEN)✓ Port 5000 is free$(NC)"; \
	fi
	@echo "$(GREEN)✓ Port clearing completed$(NC)"
	@echo "$(BLUE)Final port status:$(NC)"
	@lsof -i :8000 -i :5000 2>/dev/null | grep LISTEN || echo "$(GREEN)No processes listening on ports 8000 or 5000$(NC)"

status:
	@echo "$(BLUE)Checking service status...$(NC)"
	@echo ""
	@if pgrep -f "uvicorn app.main:app" > /dev/null; then \
		echo "$(GREEN)✓ Backend is running$(NC)"; \
	else \
		echo "$(RED)✗ Backend is not running$(NC)"; \
	fi
	@if pgrep -f "yarn dev\|next dev" > /dev/null; then \
		echo "$(GREEN)✓ Frontend is running$(NC)"; \
	else \
		echo "$(RED)✗ Frontend is not running$(NC)"; \
	fi
	@echo ""
	@echo "Active ports:"
	@lsof -i :8000 -i :5000 2>/dev/null | grep LISTEN || echo "No services listening on ports 8000 or 5000"

clean:
	@echo "$(BLUE)Cleaning build artifacts...$(NC)"
	@cd frontend && rm -rf .next node_modules/.cache 2>/dev/null || true
	@cd backend && rm -rf __pycache__ .pytest_cache 2>/dev/null || true
	@echo "$(GREEN)✓ Clean completed$(NC)"
