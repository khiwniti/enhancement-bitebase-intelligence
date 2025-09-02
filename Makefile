# BiteBase Intelligence Development Makefile

.PHONY: install install-functions install-frontend run-functions run-frontend run-dev run-all stop dev help clear-ports install-firebase

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
	@echo "  make install            - Install all dependencies (frontend + functions + Firebase)"
	@echo "  make install-functions  - Install Firebase functions dependencies only"
	@echo "  make install-web        - Install web app dependencies only"
	@echo "  make install-firebase   - Install Firebase CLI and setup project"
	@echo ""
	@echo "$(GREEN)Development:$(NC)"
	@echo "  make run-dev            - Start web app + Firebase emulators"
	@echo "  make run-all            - Start all services (web app, Firebase)"
	@echo "  make run-functions      - Start Firebase functions emulator only"
	@echo "  make run-web            - Start web app only"
	@echo "  make dev                - Alias for run-dev"
	@echo ""
	@echo "$(GREEN)Management:$(NC)"
	@echo "  make stop               - Stop all running services"
	@echo "  make clear-ports        - Force kill processes on ports 5001, 5000, and 4000"
	@echo "  make clean              - Clean build artifacts"
	@echo "  make status             - Check service status"

# Installation targets
install-firebase:
	@echo "$(BLUE)Installing Firebase CLI...$(NC)"
	@if ! command -v firebase &> /dev/null; then \
		npm install -g firebase-tools; \
	else \
		echo "$(GREEN)✓ Firebase CLI already installed$(NC)"; \
	fi

install-functions:
	@echo "$(BLUE)Installing Firebase functions dependencies...$(NC)"
	@if [ -d "apps/functions" ]; then \
		echo "$(YELLOW)Installing in apps/functions...$(NC)"; \
		cd apps/functions && npm install --no-workspaces; \
	else \
		echo "$(YELLOW)Functions directory not found, skipping...$(NC)"; \
	fi

install-web:
	@echo "$(BLUE)Installing web app dependencies...$(NC)"
	@chmod +x apps/web/install.sh 2>/dev/null || true
	@chmod +x apps/web/run.sh 2>/dev/null || true
	@echo "$(YELLOW)Installing in apps/web...$(NC)"
	@cd apps/web && npm install --no-workspaces

install: install-firebase install-functions install-web
	@echo "$(GREEN)✓ All dependencies installed successfully!$(NC)"

# Individual service targets
run-functions:
	@echo "$(BLUE)Starting Firebase functions emulator...$(NC)"
	firebase emulators:start --only functions

run-web:
	@echo "$(BLUE)Starting web app server...$(NC)"
	cd apps/web && npm run dev

# Development target - improved version
run-dev:
	@echo "$(BLUE)🚀 Starting BiteBase Intelligence Development Environment$(NC)"
	@echo ""
	@echo "$(YELLOW)Frontend will be available at: http://localhost:5000$(NC)"
	@echo "$(YELLOW)Firebase Functions: http://localhost:5001$(NC)"
	@echo "$(YELLOW)Firebase Emulator UI: http://localhost:4001$(NC)"
	@echo ""
	@echo "$(RED)Press Ctrl+C to stop all services$(NC)"
	@echo ""
	@trap 'echo "$(BLUE)Shutting down services...$(NC)"; pkill -f "firebase emulators" 2>/dev/null || true; pkill -f "next dev" 2>/dev/null || true; echo "$(GREEN)✓ Services stopped$(NC)"; exit 0' INT; \
	firebase emulators:start --config firebase.json & \
	sleep 3 && \
	(cd apps/web && npm run dev) & \
	wait

run-all:
	@echo "$(BLUE)🚀 Starting BiteBase Intelligence Development Environment (All Services)$(NC)"
	@echo ""
	@echo "$(YELLOW)Web App will be available at: http://localhost:5000$(NC)"
	@echo "$(YELLOW)Firebase Functions: http://localhost:5001$(NC)"
	@echo "$(YELLOW)Firebase Emulator UI: http://localhost:4001$(NC)"
	@echo ""
	@echo "$(RED)Press Ctrl+C to stop all services$(NC)"
	@echo ""
	@trap 'echo "$(BLUE)Shutting down services...$(NC)"; pkill -f "firebase emulators" 2>/dev/null || true; pkill -f "next dev" 2>/dev/null || true; echo "$(GREEN)✓ Services stopped$(NC)"; exit 0' INT; \
	firebase emulators:start --config firebase.json & \
	sleep 3 && \
	(cd apps/web && npm run dev) & \
	wait


# Alias for run-dev
dev: run-dev

# Management targets
stop:
	@echo "$(BLUE)Stopping all services...$(NC)"
	@pkill -f "firebase emulators" 2>/dev/null || true
	@pkill -f "next dev" 2>/dev/null || true
	@echo "$(GREEN)✓ All services stopped$(NC)"

clear-ports:
	@echo "$(BLUE)Clearing ports 5001, 5000, and 4000...$(NC)"
	@echo "$(YELLOW)Checking for processes on port 5001 (Functions)...$(NC)"
	@if lsof -ti :5001 > /dev/null 2>&1; then \
		echo "$(RED)Found processes on port 5001, killing them...$(NC)"; \
		lsof -ti :5001 | xargs kill -9 2>/dev/null || true; \
		sleep 1; \
	else \
		echo "$(GREEN)✓ Port 5001 is free$(NC)"; \
	fi
	@echo "$(YELLOW)Checking for processes on port 5000 (Frontend)...$(NC)"
	@if lsof -ti :5000 > /dev/null 2>&1; then \
		echo "$(RED)Found processes on port 5000, killing them...$(NC)"; \
		lsof -ti :5000 | xargs kill -9 2>/dev/null || true; \
		sleep 1; \
	else \
		echo "$(GREEN)✓ Port 5000 is free$(NC)"; \
	fi
	@echo "$(YELLOW)Checking for processes on port 4000 (Firebase UI)...$(NC)"
	@if lsof -ti :4000 > /dev/null 2>&1; then \
		echo "$(RED)Found processes on port 4000, killing them...$(NC)"; \
		lsof -ti :4000 | xargs kill -9 2>/dev/null || true; \
		sleep 1; \
	else \
		echo "$(GREEN)✓ Port 4000 is free$(NC)"; \
	fi
	@echo "$(GREEN)✓ Port clearing completed$(NC)"
	@echo "$(BLUE)Final port status:$(NC)"
	@lsof -i :5001 -i :5000 -i :4000 2>/dev/null | grep LISTEN || echo "$(GREEN)No processes listening on ports 5001, 5000, or 4000$(NC)"

status:
	@echo "$(BLUE)Checking service status...$(NC)"
	@echo ""
	@if pgrep -f "firebase emulators" > /dev/null; then \
		echo "$(GREEN)✓ Firebase emulators are running$(NC)"; \
	else \
		echo "$(RED)✗ Firebase emulators are not running$(NC)"; \
	fi
	@if pgrep -f "next dev" > /dev/null; then \
		echo "$(GREEN)✓ Web app is running$(NC)"; \
	else \
		echo "$(RED)✗ Web app is not running$(NC)"; \
	fi
	@echo ""
	@echo "Active ports:"
	@lsof -i :5001 -i :5000 -i :4000 2>/dev/null | grep LISTEN || echo "No services listening on ports 5001, 5000, or 4000"

clean:
	@echo "$(BLUE)Cleaning build artifacts...$(NC)"
	@cd apps/web && rm -rf .next node_modules/.cache 2>/dev/null || true
	@cd apps/functions && rm -rf lib node_modules/.cache 2>/dev/null || true
	@echo "$(GREEN)✓ Clean completed$(NC)"
