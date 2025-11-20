#!/bin/bash
# Quick deployment script

set -e

echo "🚀 Building Backend..."
./mvnw clean package -DskipTests

echo "🎨 Building Frontend..."
cd ui
npm run build
cd ..

echo "📦 Creating deployment package..."
rm -rf deploy
mkdir -p deploy
cp target/fileSharer-0.0.1-SNAPSHOT.jar deploy/
cp -r ui/.next deploy/
cp -r ui/public deploy/
cp ui/package.json deploy/
cp ui/package-lock.json deploy/

echo "✅ Deployment package ready in ./deploy/"
echo ""
echo "Next steps:"
echo "1. Upload to EC2: scp -i your-key.pem -r deploy ubuntu@your-ec2-ip:/home/ubuntu/"
echo "2. SSH to EC2: ssh -i your-key.pem ubuntu@your-ec2-ip"
echo "3. Follow DEPLOYMENT.md instructions"
