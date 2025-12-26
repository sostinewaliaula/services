# Service Hub Deployment Guide (Ubuntu)

This guide walks you through deploying the Service Hub application to an Ubuntu server using **Nginx**, **MariaDB/MySQL**, and **PM2**.

## 1. Prerequisites

Update your system and install necessary dependencies:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y nginx mariadb-server nodejs npm git
```

Install PM2 globally for background process management:
```bash
sudo npm install -g pm2
```

## 2. Project Setup

Clone your repository to the server:
```bash
cd /var/www
sudo git clone <your-repo-url> services
sudo chown -R $USER:$USER /var/www/services
```

## 3. Backend Setup

### Environment Variables
Create a `.env` file in the `server` directory:
```bash
cd /var/www/services/server
cp .env.example .env # Or create one manually
nano .env
```
Ensure `DB_HOST`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` are correct.

### Install & Build
```bash
npm install
npm run build
```

### Database Migration
Ensure your database is created in MariaDB, then run:
```bash
npm run migrate
```

### Start Backend with PM2
```bash
pm2 start dist/index.js --name "services-api"
pm2 save
pm2 startup
```

## 4. Frontend Setup

### Environment Variables
Create a `.env` file in the root directory:
```bash
cd /var/www/services
nano .env
```
Add your backend URL:
```env
VITE_API_BASE_URL=http://<your-server-ip>:5000/api
```

### Build
```bash
npm install
npm run build
```
This generates a `dist` folder.

## 5. Nginx Configuration

Copy the provided `nginx.conf` to the Nginx sites-available directory:
```bash
sudo cp /var/www/services/deployment/nginx.conf /etc/nginx/sites-available/services
sudo ln -s /etc/nginx/sites-available/services /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default # Optional: remove default site
```

Test and restart Nginx:
```bash
sudo nginx -t
sudo systemctl restart nginx
```

## 6. Permissions
Ensure Nginx can read your files:
```bash
sudo chmod -R 755 /var/www/services
```

## 7. Troubleshooting
- **Check Backend Logs**: `pm2 logs services-api`
- **Check Nginx Error Logs**: `sudo tail -f /var/log/nginx/error.log`
- **Verify Port 5000**: `sudo netstat -tulpn | grep 5000`
