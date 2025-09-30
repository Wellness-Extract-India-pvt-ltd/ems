# EMS Docker Management Makefile

.PHONY: help dev prod build clean logs shell restart test-biometrics

# Default target
help:
	@echo "Available commands:"
	@echo "  dev            - Start development environment"
	@echo "  prod           - Start production environment"
	@echo "  build          - Build backend Docker image"
	@echo "  clean          - Stop and remove all containers and volumes"
	@echo "  logs           - Show logs from all services"
	@echo "  shell          - Open shell in backend container"
	@echo "  restart        - Restart all services"
	@echo "  test-biometrics - Test BioMetrics Docker integration"

# Development environment
dev:
	@echo "Starting development environment..."
	docker-compose up -d
	@echo "Services started:"
	@echo "  - Frontend: http://localhost:5173"
	@echo "  - Backend: http://localhost:5000"
	@echo "  - MySQL: localhost:3306"
	@echo "  - phpMyAdmin: http://localhost:8080"

# Production environment
prod:
	@echo "Starting production environment..."
	docker-compose -f docker-compose.prod.yml up -d
	@echo "Production services started:"
	@echo "  - Frontend: http://localhost:80"
	@echo "  - Backend: http://localhost:5000"
	@echo "  - MySQL: localhost:3306"
	@echo "  - phpMyAdmin: http://localhost:8080"

# Build all images
build:
	@echo "Building all Docker images..."
	docker-compose build

# Build backend image only
build-backend:
	@echo "Building backend Docker image..."
	docker-compose build backend

# Build frontend image only
build-frontend:
	@echo "Building frontend Docker image..."
	docker-compose build frontend

# Clean up
clean:
	@echo "Stopping and removing all containers and volumes..."
	docker-compose down -v
	docker-compose -f docker-compose.prod.yml down -v
	docker system prune -f

# Show logs
logs:
	docker-compose logs -f

# Open shell in backend container
shell:
	docker-compose exec backend sh

# Open shell in frontend container
shell-frontend:
	docker-compose exec frontend sh

# Restart services
restart:
	@echo "Restarting all services..."
	docker-compose restart

# Development with rebuild
dev-rebuild:
	@echo "Rebuilding and starting development environment..."
	docker-compose up -d --build

# Production with rebuild
prod-rebuild:
	@echo "Rebuilding and starting production environment..."
	docker-compose -f docker-compose.prod.yml up -d --build

# Test BioMetrics integration
test-biometrics:
	@echo "Testing BioMetrics Docker integration..."
	@if [ -f "scripts/test-biometrics-docker.sh" ]; then \
		chmod +x scripts/test-biometrics-docker.sh && \
		./scripts/test-biometrics-docker.sh; \
	else \
		echo "BioMetrics test script not found. Please run manually:"; \
		echo "  PowerShell: .\scripts\test-biometrics-docker.ps1"; \
		echo "  Bash: ./scripts/test-biometrics-docker.sh"; \
	fi
