# PeerLink - Secure File Sharing Platform

A modern file sharing application with AWS S3 storage, built with Spring Boot and Next.js.

## Features

- 🚀 **Guest Upload**: Upload up to 2 files without registration
- 🔐 **User Authentication**: Signup/Login for unlimited uploads
- 📊 **File History**: Track your uploaded files
- 🔗 **Share Codes**: Simple 5-digit codes for file sharing
- ☁️ **AWS S3 Storage**: Secure cloud storage
- 📥 **Direct Download**: Pre-signed URLs for secure downloads

## Tech Stack

### Backend
- Java 21
- Spring Boot 3.5.7
- Spring Security
- PostgreSQL
- AWS S3 SDK
- Hibernate/JPA

### Frontend
- Next.js 16
- React 19
- TypeScript
- Axios
- Tailwind CSS

## Local Development

### Prerequisites
- Java 21
- Node.js 18+
- PostgreSQL
- Docker (optional)
- AWS Account with S3 bucket

### Setup

1. **Clone repository:**
```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
```

2. **Configure database:**
```bash
# Start PostgreSQL with Docker
docker-compose up -d

# Or use local PostgreSQL
createdb filesharerdb
```

3. **Configure application:**
```bash
cp src/main/resources/application.properties.example src/main/resources/application.properties
# Edit application.properties with your credentials
```

4. **Start backend:**
```bash
./mvnw spring-boot:run
```

5. **Start frontend:**
```bash
cd ui
npm install
npm run dev
```

6. **Access application:**
- Frontend: http://localhost:3000
- Backend: http://localhost:8080

## Production Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete EC2 deployment guide.

## Environment Variables

### Backend (application.properties)
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/filesharerdb
spring.datasource.username=YOUR_DB_USER
spring.datasource.password=YOUR_DB_PASSWORD
cloud.aws.credentials.access-key=YOUR_AWS_KEY
cloud.aws.credentials.secret-key=YOUR_AWS_SECRET
app.aws.s3.bucket-name=YOUR_BUCKET_NAME
```

### Frontend
No environment variables needed for development.

## API Endpoints

### Authentication
- `POST /auth/signup` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/check` - Check authentication status

### Files
- `POST /files/upload` - Upload file (guest or authenticated)
- `GET /files/download/{shareCode}` - Get download URL
- `GET /files/user/history` - Get user's file history (authenticated)
- `DELETE /files/user/delete/{shareCode}` - Delete file (authenticated)

## Project Structure

```
.
├── src/main/java/com/peerlink/fileSharer/
│   ├── config/          # Configuration classes
│   ├── controller/      # REST controllers
│   ├── model/           # JPA entities
│   ├── repository/      # Data repositories
│   ├── service/         # Business logic
│   └── security/        # Security configuration
├── ui/
│   ├── src/
│   │   ├── app/         # Next.js pages
│   │   ├── components/  # React components
│   │   └── utils/       # Utility functions
│   └── public/          # Static assets
└── docker-compose.yml   # PostgreSQL container
```

## Security

- ✅ Password hashing with BCrypt
- ✅ Session-based authentication
- ✅ CORS configuration
- ✅ SQL injection prevention (JPA)
- ✅ Pre-signed S3 URLs (10 min expiry)
- ✅ Input validation
- ⚠️ **Never commit** `application.properties` with real credentials

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

MIT License - See LICENSE file for details

## Support

For issues and questions:
- Create an issue on GitHub
- Check [DEPLOYMENT.md](DEPLOYMENT.md) for deployment help

## Acknowledgments

- Spring Boot Team
- Next.js Team
- AWS S3 Documentation
