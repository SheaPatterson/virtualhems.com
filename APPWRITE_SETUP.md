# Appwrite Setup Guide

## Quick Start

1. **Start Appwrite stack:**
```bash
docker-compose -f docker-compose.appwrite.yml up -d
```

2. **Access Appwrite Console:**
- Open: http://localhost:8080 (or your server IP:8080)
- Create your admin account
- Create a new project called "virtualhems"

3. **Get your Project ID:**
- In the Appwrite console, go to your project settings
- Copy the Project ID
- Update `.env` file with: `VITE_APPWRITE_PROJECT_ID=your-project-id`

4. **Create API Key (for backend):**
- In Appwrite console, go to Settings > API Keys
- Create new API key with these scopes:
  - users.read
  - users.write
  - databases.read
  - databases.write
- Copy the key and update `.env`: `APPWRITE_API_KEY=your-api-key`

5. **Update your domain (production):**
- In Appwrite console, go to Settings > Platforms
- Add Web platform with your domain
- Update `.env`: `VITE_APPWRITE_ENDPOINT=https://yourdomain.com:8080/v1`

## What's Included

- **Appwrite**: Main service (port 8080)
- **MariaDB**: Database for Appwrite
- **Redis**: Caching layer

## Storage

All data is persisted in Docker volumes:
- `appwrite-mariadb` - Database
- `appwrite-redis` - Cache
- `appwrite-uploads` - User uploads
- `appwrite-cache` - File cache
- `appwrite-config` - Configuration
- `appwrite-certificates` - SSL certs
- `appwrite-functions` - Cloud functions

## Commands

Start: `docker-compose -f docker-compose.appwrite.yml up -d`
Stop: `docker-compose -f docker-compose.appwrite.yml down`
Logs: `docker-compose -f docker-compose.appwrite.yml logs -f`
Restart: `docker-compose -f docker-compose.appwrite.yml restart`

## Email Setup (Optional)

To enable email verification/password reset, add to docker-compose.appwrite.yml:

```yaml
- _APP_SMTP_HOST=smtp.gmail.com
- _APP_SMTP_PORT=587
- _APP_SMTP_SECURE=tls
- _APP_SMTP_USERNAME=your-email@gmail.com
- _APP_SMTP_PASSWORD=your-app-password
```

## Notes

- Appwrite runs on its own network, separate from your main app
- No S3/Garage needed - Appwrite uses local storage by default
- For production, consider setting up SSL/reverse proxy
