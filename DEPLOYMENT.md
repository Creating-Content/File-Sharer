# EC2 Deployment Guide - Git Clone Method

## Prerequisites
- EC2 instance (Ubuntu 22.04, t2.medium or higher)
- Domain/subdomain (e.g., fileshare.yourdomain.com)
- S3 bucket created
- IAM user with S3 access
- GitHub repository

## Step 1: Prepare GitHub Repository

### On Local Machine - Before Pushing to GitHub

1. **Copy example config:**
```bash
cp src/main/resources/application.properties.example src/main/resources/application.properties
```

2. **Update application.properties with your LOCAL credentials** (for testing)

3. **Commit and push to GitHub:**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

**IMPORTANT:** `.gitignore` prevents `application.properties` from being committed!

## Step 2: EC2 Initial Setup

### Connect to EC2
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

### Install Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Java 21
sudo apt install -y openjdk-21-jdk

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
sudo apt install -y nginx

# Install Git
sudo apt install -y git

# Verify installations
java -version
node -v
npm -v
psql --version
nginx -v
```

## Step 3: PostgreSQL Setup

```bash
# Switch to postgres user
sudo -u postgres psql
```

Run these SQL commands:
```sql
CREATE DATABASE filesharerdb;
CREATE USER fileapp WITH PASSWORD 'YOUR_SECURE_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON DATABASE filesharerdb TO fileapp;
ALTER DATABASE filesharerdb OWNER TO fileapp;
\q
```

Configure PostgreSQL:
```bash
# Allow local connections
sudo nano /etc/postgresql/14/main/pg_hba.conf
```

Add this line before other rules:
```
host    filesharerdb    fileapp    127.0.0.1/32    md5
```

Restart PostgreSQL:
```bash
sudo systemctl restart postgresql
```

## Step 4: Clone Repository

```bash
cd /home/ubuntu
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME
```

## Step 5: Configure Application

### Create Production Config
```bash
cp src/main/resources/application.properties.example src/main/resources/application.properties
nano src/main/resources/application.properties
```

Update with production values:
```properties
spring.application.name=fileSharer
server.port=8080

# Database - Use EC2 PostgreSQL
spring.datasource.url=jdbc:postgresql://localhost:5432/filesharerdb?currentSchema=public
spring.datasource.username=fileapp
spring.datasource.password=YOUR_SECURE_PASSWORD_HERE
spring.datasource.driver-class-name=org.postgresql.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.open-in-view=false

# AWS S3 - Your credentials
cloud.aws.credentials.access-key=YOUR_AWS_ACCESS_KEY
cloud.aws.credentials.secret-key=YOUR_AWS_SECRET_KEY
cloud.aws.region.static=ap-south-1
cloud.aws.stack.auto=false
app.aws.s3.bucket-name=filesharer-new-25
```

### Update WebMvcConfig for Production
```bash
nano src/main/java/com/peerlink/fileSharer/config/WebMvcConfig.java
```

Change:
```java
private static final String FRONTEND_ORIGIN = "https://fileshare.yourdomain.com";
```

## Step 6: Build Application

### Build Backend
```bash
./mvnw clean package -DskipTests
```

### Build Frontend
```bash
cd ui
npm install
npm run build
cd ..
```

## Step 7: Create Systemd Services

### Backend Service
```bash
sudo nano /etc/systemd/system/filesharer-backend.service
```

```ini
[Unit]
Description=FileSharer Backend
After=network.target postgresql.service

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/YOUR_REPO_NAME
ExecStart=/usr/bin/java -jar target/fileSharer-0.0.1-SNAPSHOT.jar
Restart=always
RestartSec=10
Environment="SPRING_PROFILES_ACTIVE=prod"

[Install]
WantedBy=multi-user.target
```

### Frontend Service
```bash
sudo nano /etc/systemd/system/filesharer-frontend.service
```

```ini
[Unit]
Description=FileSharer Frontend
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/YOUR_REPO_NAME/ui
Environment="NODE_ENV=production"
Environment="PORT=3000"
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### Enable and Start Services
```bash
sudo systemctl daemon-reload
sudo systemctl enable filesharer-backend filesharer-frontend
sudo systemctl start filesharer-backend filesharer-frontend

# Check status
sudo systemctl status filesharer-backend
sudo systemctl status filesharer-frontend
```

## Step 8: Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/filesharer
```

```nginx
server {
    listen 80;
    server_name fileshare.yourdomain.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api/ {
        rewrite ^/api/(.*) /$1 break;
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Session cookies
        proxy_cookie_path / /;
        proxy_set_header Cookie $http_cookie;
    }

    # File upload size limit
    client_max_body_size 100M;
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/filesharer /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

## Step 9: DNS Configuration

In your domain provider (Cloudflare, GoDaddy, etc.):
- Type: **A Record**
- Name: **fileshare** (or your subdomain)
- Value: **YOUR_EC2_PUBLIC_IP**
- TTL: **300**

Wait 5-10 minutes for DNS propagation.

## Step 10: SSL Certificate (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d fileshare.yourdomain.com --email your@email.com --agree-tos --no-eff-email
```

Auto-renewal:
```bash
sudo systemctl status certbot.timer
```

## Step 11: Firewall Configuration

### EC2 Security Group
Allow these ports:
- **22** (SSH) - Your IP only
- **80** (HTTP) - 0.0.0.0/0
- **443** (HTTPS) - 0.0.0.0/0

### UFW (Optional)
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## Step 12: Verify Deployment

```bash
# Check services
sudo systemctl status filesharer-backend
sudo systemctl status filesharer-frontend
sudo systemctl status nginx

# Check logs
sudo journalctl -u filesharer-backend -f
sudo journalctl -u filesharer-frontend -f

# Test endpoints
curl http://localhost:8080/auth/check
curl http://localhost:3000
```

Visit: **https://fileshare.yourdomain.com**

## Updating Application

```bash
cd /home/ubuntu/YOUR_REPO_NAME
git pull origin main

# Rebuild backend
./mvnw clean package -DskipTests

# Rebuild frontend
cd ui
npm install
npm run build
cd ..

# Restart services
sudo systemctl restart filesharer-backend
sudo systemctl restart filesharer-frontend
```

## Monitoring & Logs

```bash
# Real-time logs
sudo journalctl -u filesharer-backend -f
sudo journalctl -u filesharer-frontend -f
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Check disk space
df -h

# Check memory
free -h

# Check processes
htop
```

## Backup Setup

```bash
mkdir -p /home/ubuntu/backups
nano /home/ubuntu/backup.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/ubuntu/backups"

# Backup database
PGPASSWORD='YOUR_DB_PASSWORD' pg_dump -U fileapp -h localhost filesharerdb > $BACKUP_DIR/db_$DATE.sql

# Compress
gzip $BACKUP_DIR/db_$DATE.sql

# Delete backups older than 7 days
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +7 -delete

echo "Backup completed: db_$DATE.sql.gz"
```

```bash
chmod +x /home/ubuntu/backup.sh

# Schedule daily backup at 2 AM
crontab -e
# Add: 0 2 * * * /home/ubuntu/backup.sh >> /home/ubuntu/backups/backup.log 2>&1
```

## Troubleshooting

### Backend won't start
```bash
sudo journalctl -u filesharer-backend -n 100
# Check application.properties
# Check PostgreSQL connection
```

### Frontend won't start
```bash
sudo journalctl -u filesharer-frontend -n 100
cd /home/ubuntu/YOUR_REPO_NAME/ui
npm run build
```

### 502 Bad Gateway
```bash
# Check if services are running
sudo systemctl status filesharer-backend filesharer-frontend
# Check ports
sudo netstat -tulpn | grep -E ':(3000|8080)'
```

### Database connection failed
```bash
# Test connection
psql -U fileapp -h localhost -d filesharerdb
# Check pg_hba.conf
sudo nano /etc/postgresql/14/main/pg_hba.conf
```

### SSL certificate issues
```bash
sudo certbot renew --dry-run
sudo certbot certificates
```

## Performance Optimization

### Increase Java heap size
Edit backend service:
```bash
sudo nano /etc/systemd/system/filesharer-backend.service
```
Change ExecStart:
```
ExecStart=/usr/bin/java -Xmx1024m -Xms512m -jar target/fileSharer-0.0.1-SNAPSHOT.jar
```

### Enable Nginx caching
```bash
sudo nano /etc/nginx/sites-available/filesharer
```
Add inside server block:
```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## Security Checklist

- ✅ SSH key-based authentication only
- ✅ Firewall configured (Security Group + UFW)
- ✅ SSL certificate installed
- ✅ Database password is strong
- ✅ AWS credentials secured
- ✅ Regular backups scheduled
- ✅ application.properties not in Git
- ✅ Nginx security headers enabled

## Cost Estimation

- EC2 t2.medium: ~$35/month
- S3 storage: ~$0.023/GB/month
- Data transfer: ~$0.09/GB
- Total: ~$40-50/month (depending on usage)

## Support

For issues:
1. Check logs: `sudo journalctl -u filesharer-backend -f`
2. Verify services: `sudo systemctl status filesharer-backend`
3. Test connectivity: `curl http://localhost:8080/auth/check`
