# Docker Deployment Guide

This guide covers how to deploy the Sportzy backend using Docker and Docker Compose.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+

## Quick Start

### 1. Setup Environment Variables

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` and set your values, especially:

- `POSTGRES_PASSWORD` - Change from default
- `ARCJET_KEY` - If using Arcjet security features
- `CORS_ORIGIN` - Set to your frontend URL

### 2. Start the Services

```bash
# Start all services (database + backend)
docker-compose up -d

# View logs
docker-compose logs -f

# Check service status
docker-compose ps
```

The backend will be available at `http://localhost:8000`

### 3. Run Database Migrations

Migrations are automatically run by the `migration` service, but you can run them manually:

```bash
docker-compose run --rm migration
```

### 4. Seed the Database (Optional)

```bash
docker-compose exec backend npm run seed
```

## Development Mode

To run in development mode with hot-reloading:

```bash
docker-compose -f docker-compose.dev.yml up
```

Or modify the docker-compose.yml to use `target: development` in the backend service.

## Useful Commands

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f db
```

### Execute Commands in Containers

```bash
# Access backend shell
docker-compose exec backend sh

# Access database
docker-compose exec db psql -U sportzy_user -d sportzy

# Run npm commands
docker-compose exec backend npm run seed
```

### Rebuild Services

```bash
# Rebuild and restart
docker-compose up -d --build

# Rebuild specific service
docker-compose build backend
```

### Stop and Clean Up

```bash
# Stop services
docker-compose stop

# Stop and remove containers
docker-compose down

# Remove containers, networks, and volumes
docker-compose down -v
```

## Production Deployment

### Using Docker Only

Build the production image:

```bash
docker build -t sportzy-backend:latest .
```

Run with environment variables:

```bash
docker run -d \
  --name sportzy-backend \
  -p 8000:8000 \
  -e DATABASE_URL=postgresql://user:pass@host:5432/db \
  -e CORS_ORIGIN=https://yourdomain.com \
  sportzy-backend:latest
```

### Using Docker Compose (Recommended)

```bash
# Production deployment
docker-compose -f docker-compose.yml up -d

# Scale backend if needed
docker-compose up -d --scale backend=3
```

## Environment Variables

| Variable            | Description                  | Default               |
| ------------------- | ---------------------------- | --------------------- |
| `DATABASE_URL`      | PostgreSQL connection string | Required              |
| `PORT`              | Server port                  | 8000                  |
| `HOST`              | Server host                  | 0.0.0.0               |
| `CORS_ORIGIN`       | Allowed CORS origin          | http://localhost:3000 |
| `ARCJET_KEY`        | Arcjet API key               | -                     |
| `ARCJET_MODE`       | Security mode (LIVE/DRY_RUN) | LIVE                  |
| `POSTGRES_DB`       | Database name                | sportzy               |
| `POSTGRES_USER`     | Database user                | sportzy_user          |
| `POSTGRES_PASSWORD` | Database password            | changeme              |

## Security Notes

1. **Change default passwords** in production
2. **Use secrets management** for sensitive data in production
3. **Enable HTTPS** with a reverse proxy (nginx, traefik)
4. **Limit exposed ports** - only expose what's necessary
5. **Keep images updated** - regularly rebuild with latest base images

## Networking

The stack creates a `sportzy-network` bridge network for service communication.

Services can communicate using service names:

- Backend to DB: `postgresql://user:pass@db:5432/sportzy`
- External access uses exposed ports

## Volumes

- `postgres_data` - Persists PostgreSQL data between container restarts

## Health Checks

Both services have health checks configured:

- **Database**: Checks PostgreSQL readiness
- **Backend**: Checks HTTP endpoint response

## Troubleshooting

### Backend can't connect to database

- Ensure database is healthy: `docker-compose ps`
- Check DATABASE_URL format
- Verify network connectivity: `docker-compose exec backend ping db`

### Port already in use

```bash
# Change port in .env
PORT=8001
```

### Database connection refused

```bash
# Check database logs
docker-compose logs db

# Restart database
docker-compose restart db
```

### Clear everything and start fresh

```bash
docker-compose down -v
docker-compose up -d
```

## Monitoring

Add monitoring tools in docker-compose.yml:

```yaml
# Example: Prometheus monitoring
prometheus:
  image: prom/prometheus
  volumes:
    - ./prometheus.yml:/etc/prometheus/prometheus.yml
  ports:
    - "9090:9090"
```

## CI/CD Integration

Example GitHub Actions workflow snippet:

```yaml
- name: Build and push Docker image
  run: |
    docker build -t sportzy-backend:${{ github.sha }} .
    docker push sportzy-backend:${{ github.sha }}
```
