# Development Setup Guide

This guide will help you set up the Collaborative Code Review Platform for local development.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **Python** (v3.9 or higher)
- **Docker** and **Docker Compose**
- **Git**

### Optional but Recommended
- **VS Code** with extensions:
  - TypeScript and JavaScript Language Features
  - Tailwind CSS IntelliSense
  - Python
  - Docker
  - GitLens

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd collaborative
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..

# Install backend dependencies
cd backend
npm install
cd ..

# Install WebSocket server dependencies
cd websocket-server
npm install
cd ..

# Install AI service dependencies
cd ai-service
pip install -r requirements.txt
cd ..
```

### 3. Environment Configuration

Create environment files for each service:

#### Frontend (.env)
```bash
cd frontend
cp .env.example .env
```

#### Backend (.env)
```bash
cd backend
cp .env.example .env
```

#### AI Service (.env)
```bash
cd ai-service
cp .env.example .env
```

#### WebSocket Server (.env)
```bash
cd websocket-server
cp .env.example .env
```

### 4. Start Development Environment

```bash
# Start infrastructure services (databases, Redis, etc.)
docker-compose up -d postgres redis mongodb clickhouse grafana prometheus

# Start all development servers
npm run dev
```

This will start:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- WebSocket Server: http://localhost:4001
- AI Service: http://localhost:5000
- Grafana: http://localhost:3001
- Prometheus: http://localhost:9090

## Detailed Setup

### Frontend Development

The frontend is built with React, TypeScript, and Vite.

#### Key Commands
```bash
cd frontend

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Lint code
npm run lint
```

#### Development Features
- Hot module replacement (HMR)
- TypeScript compilation
- Tailwind CSS with JIT compilation
- ESLint and Prettier integration
- Proxy configuration for API calls

#### Project Structure
```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Page components
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utilities and API client
│   ├── stores/        # Zustand state stores
│   └── types/         # TypeScript definitions
├── public/            # Static assets
└── dist/              # Build output
```

### Backend Development

The backend uses NestJS with TypeORM and PostgreSQL.

#### Key Commands
```bash
cd backend

# Start development server with hot reload
npm run start:dev

# Build the application
npm run build

# Run tests
npm run test

# Run e2e tests
npm run test:e2e
```

#### Development Features
- Hot reload with file watching
- TypeORM synchronization
- Swagger API documentation
- Comprehensive logging
- Database migrations

#### Project Structure
```
backend/
├── src/
│   ├── auth/          # Authentication module
│   ├── users/         # User management
│   ├── projects/      # Project management
│   ├── review-sessions/ # Review sessions
│   ├── dashboard/     # Analytics
│   ├── ai/           # AI service integration
│   └── common/       # Shared utilities
├── test/             # Test files
└── dist/             # Build output
```

### WebSocket Server Development

The WebSocket server handles real-time collaboration.

#### Key Commands
```bash
cd websocket-server

# Start development server
npm run dev

# Build the application
npm run build

# Run tests
npm run test
```

#### Development Features
- Socket.IO for real-time communication
- Yjs integration for collaborative editing
- Redis pub/sub for cross-server communication
- Session management

### AI Service Development

The AI service provides code analysis and suggestions.

#### Key Commands
```bash
cd ai-service

# Start development server
python -m uvicorn main:app --reload --port 5000

# Run tests
pytest

# Install dependencies
pip install -r requirements.txt
```

#### Development Features
- FastAPI with automatic API documentation
- OpenAI and Anthropic integration
- Code syntax highlighting
- Caching with Redis

## Database Setup

### PostgreSQL (Primary Database)

The application uses PostgreSQL for user data, projects, and review sessions.

#### Connection Details
- Host: localhost
- Port: 5432
- Database: collaborative_review
- Username: postgres
- Password: postgres

#### Schema Management
```bash
# The schema is automatically created when the backend starts
# You can also run the init script manually:
docker exec -i collaborative-postgres psql -U postgres -d collaborative_review < infrastructure/postgres/init.sql
```

### ClickHouse (Analytics Database)

ClickHouse is used for high-performance analytics.

#### Connection Details
- Host: localhost
- Port: 8123 (HTTP) / 9000 (Native)
- Database: analytics
- Username: default
- Password: password

#### Schema Management
```bash
# Initialize ClickHouse schema
docker exec -i collaborative-clickhouse clickhouse-client --password password < infrastructure/clickhouse/init.sql
```

### MongoDB (Document Store)

MongoDB stores chat logs and unstructured data.

#### Connection Details
- Host: localhost
- Port: 27017
- Database: collaborative
- Username: admin
- Password: password

### Redis (Cache & Pub/Sub)

Redis is used for caching and real-time messaging.

#### Connection Details
- Host: localhost
- Port: 6379
- No authentication required in development

## Environment Variables

### Frontend (.env)
```env
VITE_API_URL=http://localhost:4000/api
VITE_WS_URL=ws://localhost:4001
VITE_AI_SERVICE_URL=http://localhost:5000
```

### Backend (.env)
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=collaborative_review

# JWT
JWT_SECRET=your-secret-key-here

# OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITLAB_CLIENT_ID=your-gitlab-client-id
GITLAB_CLIENT_SECRET=your-gitlab-client-secret

# Redis
REDIS_URL=redis://localhost:6379

# AI Service
AI_SERVICE_URL=http://localhost:5000
```

### AI Service (.env)
```env
# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Anthropic
ANTHROPIC_API_KEY=your-anthropic-api-key

# Redis
REDIS_URL=redis://localhost:6379
```

### WebSocket Server (.env)
```env
PORT=4001
REDIS_URL=redis://localhost:6379
FRONTEND_URL=http://localhost:3000
```

## Development Workflow

### 1. Feature Development

1. Create a feature branch from `main`
2. Make your changes
3. Write tests for new functionality
4. Ensure all tests pass
5. Update documentation if needed
6. Create a pull request

### 2. Testing

#### Frontend Testing
```bash
cd frontend
npm run test          # Run unit tests
npm run test:ui       # Run tests with UI
npm run test:coverage # Run tests with coverage
```

#### Backend Testing
```bash
cd backend
npm run test          # Run unit tests
npm run test:e2e      # Run end-to-end tests
npm run test:cov      # Run tests with coverage
```

#### AI Service Testing
```bash
cd ai-service
pytest               # Run all tests
pytest -v           # Run with verbose output
pytest --cov        # Run with coverage
```

### 3. Code Quality

#### Linting
```bash
# Frontend
cd frontend
npm run lint
npm run lint:fix

# Backend
cd backend
npm run lint
npm run lint:fix
```

#### Formatting
```bash
# Backend
cd backend
npm run format
```

### 4. Database Migrations

When making database schema changes:

1. Create a new migration:
```bash
cd backend
npm run migration:generate -- -n MigrationName
```

2. Run migrations:
```bash
npm run migration:run
```

3. Revert migrations if needed:
```bash
npm run migration:revert
```

## Debugging

### Frontend Debugging

1. Use browser developer tools
2. React Developer Tools extension
3. Console logging with `console.log()`
4. React Query DevTools for API debugging

### Backend Debugging

1. Use VS Code debugger
2. Add breakpoints in your code
3. Use `console.log()` or NestJS logger
4. Check application logs

### Database Debugging

1. Connect to PostgreSQL:
```bash
docker exec -it collaborative-postgres psql -U postgres -d collaborative_review
```

2. Connect to ClickHouse:
```bash
docker exec -it collaborative-clickhouse clickhouse-client --password password
```

3. Connect to MongoDB:
```bash
docker exec -it collaborative-mongodb mongosh -u admin -p password
```

### WebSocket Debugging

1. Use browser WebSocket inspector
2. Check server logs for connection issues
3. Use Socket.IO client debugging

## Performance Monitoring

### Grafana Dashboards

Access Grafana at http://localhost:3001
- Username: admin
- Password: admin

### Prometheus Metrics

Access Prometheus at http://localhost:9090

### Application Metrics

- Backend metrics: http://localhost:4000/metrics
- AI service metrics: http://localhost:5000/metrics

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>
```

#### Database Connection Issues
```bash
# Check if containers are running
docker ps

# Restart containers
docker-compose restart postgres redis mongodb clickhouse
```

#### Node Modules Issues
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Python Dependencies Issues
```bash
# Recreate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Getting Help

1. Check the logs for error messages
2. Review the documentation
3. Search existing issues
4. Create a new issue with detailed information

## Contributing

### Code Style

- Follow the existing code style
- Use TypeScript for type safety
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

### Pull Request Process

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Ensure all checks pass
6. Update documentation
7. Submit a pull request

### Commit Message Format

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation changes
- style: Code style changes
- refactor: Code refactoring
- test: Test changes
- chore: Build or tool changes 