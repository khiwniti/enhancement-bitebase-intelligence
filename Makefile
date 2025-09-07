# BiteBase Intelligence Development Makefile

.PHONY: install install-backend install-workers install-frontend run-backend run-workers run-frontend run-dev run-all stop dev help clear-ports

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
	@echo "  make install            - Install all dependencies (frontend + backend + workers)"
	@echo "  make install-backend    - Install FastAPI backend dependencies only"
	@echo "  make install-workers    - Install backend workers dependencies only"
	@echo "  make install-web        - Install web app dependencies only"
	@echo ""
	@echo "$(GREEN)Development:$(NC)"
	@echo "  make run-dev            - Start web app + FastAPI backend"
	@echo "  make run-all            - Start all services (web app, backend, workers)"
	@echo "  make run-backend        - Start FastAPI backend only"
	@echo "  make run-workers        - Start backend workers only"
	@echo "  make run-web            - Start web app only"
	@echo "  make dev                - Alias for run-dev"
	@echo ""
	@echo "$(GREEN)Management:$(NC)"
	@echo "  make stop               - Stop all running services"
	@echo "  make clear-ports        - Force kill processes on ports 8000, 8001, and 5000"
	@echo "  make clean              - Clean build artifacts"
	@echo "  make status             - Check service status"

# Installation targets
install-backend:
	@echo "$(BLUE)Installing FastAPI backend dependencies...$(NC)"
	@if [ -d "backend" ]; then \
		echo "$(YELLOW)Installing in backend...$(NC)"; \
		cd backend && pip install -r requirements.txt; \
	else \
		echo "$(YELLOW)Backend directory not found, skipping...$(NC)"; \
	fi

install-workers:
	@echo "$(BLUE)Installing backend workers dependencies...$(NC)"
	@if [ -d "backend-workers" ]; then \
		echo "$(YELLOW)Installing in backend-workers...$(NC)"; \
		cd backend-workers && pip install -r requirements.txt; \
	else \
		echo "$(YELLOW)Backend workers directory not found, skipping...$(NC)"; \
	fi

install-web:
	@echo "$(BLUE)Installing web app dependencies...$(NC)"
	@chmod +x frontend/install.sh 2>/dev/null || true
	@chmod +x frontend/run.sh 2>/dev/null || true
	@echo "$(YELLOW)Installing in frontend...$(NC)"
	@cd frontend && yarn install

install: install-backend install-workers install-web
	@echo "$(GREEN)✓ All dependencies installed successfully!$(NC)"

# Individual service targets
run-backend:
	@echo "$(BLUE)Starting FastAPI backend server...$(NC)"
	cd backend && python run_backend.py

run-workers:
	@echo "$(BLUE)Starting backend workers...$(NC)"
	cd backend-workers && python -m uvicorn main:app --reload --port 8001

run-web:
	@echo "$(BLUE)Starting web app server...$(NC)"
	cd frontend && yarn dev

# Development target - improved version
run-dev:
	@echo "$(BLUE)🚀 Starting BiteBase Intelligence Development Environment$(NC)"
	@echo ""
	@echo "$(YELLOW)Frontend will be available at: http://localhost:5000$(NC)"
	@echo "$(YELLOW)FastAPI Backend: http://localhost:8000$(NC)"
	@echo ""
	@echo "$(RED)Press Ctrl+C to stop all services$(NC)"
	@echo ""
	@trap 'echo "$(BLUE)Shutting down services...$(NC)"; pkill -f "run_backend" 2>/dev/null || true; pkill -f "next dev" 2>/dev/null || true; echo "$(GREEN)✓ Services stopped$(NC)"; exit 0' INT; \
	(cd backend && python run_backend.py) & \
	sleep 3 && \
	(cd frontend && yarn dev) & \
	wait

run-all:
	@echo "$(BLUE)🚀 Starting BiteBase Intelligence Development Environment (All Services)$(NC)"
	@echo ""
	@echo "$(YELLOW)Web App will be available at: http://localhost:5000$(NC)"
	@echo "$(YELLOW)FastAPI Backend: http://localhost:8000$(NC)"
	@echo "$(YELLOW)Backend Workers: http://localhost:8001$(NC)"
	@echo ""
	@echo "$(RED)Press Ctrl+C to stop all services$(NC)"
	@echo ""
	@trap 'echo "$(BLUE)Shutting down services...$(NC)"; pkill -f "run_backend" 2>/dev/null || true; pkill -f "uvicorn" 2>/dev/null || true; pkill -f "next dev" 2>/dev/null || true; echo "$(GREEN)✓ Services stopped$(NC)"; exit 0' INT; \
	(cd backend && python run_backend.py) & \
	(cd backend-workers && python -m uvicorn main:app --reload --port 8001) & \
	sleep 3 && \
	(cd frontend && yarn dev) & \
	wait

# Alias for run-dev
dev: run-dev

# Management targets
stop:
	@echo "$(BLUE)Stopping all services...$(NC)"
	@pkill -f "run_backend" 2>/dev/null || true
	@pkill -f "uvicorn" 2>/dev/null || true
	@pkill -f "next dev" 2>/dev/null || true
	@echo "$(GREEN)✓ All services stopped$(NC)"

clear-ports:
	@echo "$(BLUE)Clearing ports 8000, 8001, and 5000...$(NC)"
	@echo "$(YELLOW)Checking for processes on port 8000 (Backend)...$(NC)"
	@if lsof -ti :8000 > /dev/null 2>&1; then \
		echo "$(RED)Found processes on port 8000, killing them...$(NC)"; \
		lsof -ti :8000 | xargs kill -9 2>/dev/null || true; \
		sleep 1; \
	else \
		echo "$(GREEN)✓ Port 8000 is free$(NC)"; \
	fi
	@echo "$(YELLOW)Checking for processes on port 8001 (Workers)...$(NC)"
	@if lsof -ti :8001 > /dev/null 2>&1; then \
		echo "$(RED)Found processes on port 8001, killing them...$(NC)"; \
		lsof -ti :8001 | xargs kill -9 2>/dev/null || true; \
		sleep 1; \
	else \
		echo "$(GREEN)✓ Port 8001 is free$(NC)"; \
	fi
	@echo "$(YELLOW)Checking for processes on port 5000 (Frontend)...$(NC)"
	@if lsof -ti :5000 > /dev/null 2>&1; then \
		echo "$(RED)Found processes on port 5000, killing them...$(NC)"; \
		lsof -ti :5000 | xargs kill -9 2>/dev/null || true; \
		sleep 1; \
	else \
		echo "$(GREEN)✓ Port 5000 is free$(NC)"; \
	fi
	@echo "$(GREEN)✓ Port clearing completed$(NC)"
	@echo "$(BLUE)Final port status:$(NC)"
	@lsof -i :8000 -i :8001 -i :5000 2>/dev/null | grep LISTEN || echo "$(GREEN)No processes listening on ports 8000, 8001, or 5000$(NC)"

status:
	@echo "$(BLUE)Checking service status...$(NC)"
	@echo ""
	@if pgrep -f "run_backend" > /dev/null; then \
		echo "$(GREEN)✓ FastAPI backend is running$(NC)"; \
	else \
		echo "$(RED)✗ FastAPI backend is not running$(NC)"; \
	fi
	@if pgrep -f "uvicorn" > /dev/null; then \
		echo "$(GREEN)✓ Backend workers are running$(NC)"; \
	else \
		echo "$(RED)✗ Backend workers are not running$(NC)"; \
	fi
	@if pgrep -f "next dev" > /dev/null; then \
		echo "$(GREEN)✓ Web app is running$(NC)"; \
	else \
		echo "$(RED)✗ Web app is not running$(NC)"; \
	fi
	@echo ""
	@echo "Active ports:"
	@lsof -i :8000 -i :8001 -i :5000 2>/dev/null | grep LISTEN || echo "No services listening on ports 8000, 8001, or 5000"

clean:
	@echo "$(BLUE)Cleaning build artifacts...$(NC)"
	@cd frontend && rm -rf .next node_modules/.cache 2>/dev/null || true
	@echo "$(GREEN)✓ Clean completed$(NC)"