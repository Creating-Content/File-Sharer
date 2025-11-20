# How to Run the Application

## Prerequisites
- Java 21
- Node.js (v18+)
- PostgreSQL running on localhost:5432
- Maven

## Step 1: Start PostgreSQL Database
Ensure PostgreSQL is running with:
- Database: `filesharerdb`
- Username: `postgres`
- Password: `deep2345`
- Port: `5432`

## Step 2: Start Backend (Spring Boot)

Open terminal in project root:

```bash
cd d:\FileSharer\fileSharer\fileSharer
mvnw spring-boot:run
```

Or on Unix/Mac:
```bash
./mvnw spring-boot:run
```

Backend will start on: **http://localhost:8080**

## Step 3: Start Frontend (Next.js)

Open a NEW terminal:

```bash
cd d:\FileSharer\fileSharer\fileSharer\ui
npm install
npm run dev
```

Frontend will start on: **http://localhost:3000**

## Access the Application

Open browser: **http://localhost:3000**

## Quick Test
1. Click "Login / Signup" → Sign up with a username/password
2. Login with your credentials
3. Upload a file → Get a share code
4. Switch to "Receive a File" tab → Enter the share code → Download

## Troubleshooting

**Backend won't start:**
- Check PostgreSQL is running
- Verify database `filesharerdb` exists
- Check port 8080 is not in use

**Frontend won't start:**
- Run `npm install` first
- Check port 3000 is not in use
- Delete `.next` folder and retry

**Upload fails:**
- Verify you're logged in
- Check AWS credentials in application.properties
- Check S3 bucket exists and is accessible
