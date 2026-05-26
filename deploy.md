# Deploying Daylight Dashboard on Raspberry Pi

This guide provides step-by-step instructions for deploying the Daylight Dashboard in a Docker container on a Raspberry Pi.

## Prerequisites

### Hardware
- Raspberry Pi 4 (recommended) or Pi 3B+ (minimum)
- 2GB+ RAM recommended
- 16GB+ SD card with Raspberry Pi OS
- Network connection (Ethernet or WiFi)

### Software
- Raspberry Pi OS (64-bit recommended for better performance)
- Docker and Docker Compose installed
- Git (optional, for cloning the repository)

## Step 1: Prepare the Raspberry Pi

### Update the System

```bash
sudo apt update && sudo apt upgrade -y
```

### Install Docker (if not already installed)

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to the docker group (avoids needing sudo)
sudo usermod -aG docker $USER

# Log out and back in for group changes to take effect
# Or run: newgrp docker

# Verify installation
docker --version
```

### Install Docker Compose (if not already installed)

```bash
# Install Docker Compose plugin
sudo apt install docker-compose-plugin -y

# Verify installation
docker compose version
```

## Step 2: Transfer the Project to Raspberry Pi

### Option A: Clone from Git Repository

```bash
cd ~
git clone <your-repository-url> daylight-dashboard
cd daylight-dashboard
```

### Option B: Copy from Local Machine

From your local machine:
```bash
# Using rsync (recommended)
rsync -avz --exclude 'node_modules' --exclude '.next' \
  /path/to/daylight-2.0/ pi@<raspberry-pi-ip>:~/daylight-dashboard/

# Or using scp
scp -r /path/to/daylight-2.0/ pi@<raspberry-pi-ip>:~/daylight-dashboard/
```

## Step 3: Create Environment File

On the Raspberry Pi, create the environment file:

```bash
cd ~/daylight-dashboard
nano .env.production
```

Add your environment variables:

```bash
# Google OAuth2 Credentials
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REFRESH_TOKEN=your_google_refresh_token

# Google Data Sources
GOOGLE_SHEET_ID=your_google_sheet_id
GOOGLE_CALENDAR_ID_ANNIVERSARY=your_anniversary_calendar_id
GOOGLE_CALENDAR_ID_TRIPS=your_trips_calendar_id

# Weather API
NEXT_PUBLIC_WEATHER_KEY=your_openweathermap_api_key
```

Save and exit (Ctrl+X, Y, Enter).

Secure the file:
```bash
chmod 600 .env.production
```

## Step 4: Build the Docker Image

### Build for ARM Architecture

The Raspberry Pi uses ARM architecture. Build the image directly on the Pi:

```bash
cd ~/daylight-dashboard

# Build the image (this may take 10-20 minutes on Pi 4)
docker build -t daylight-dashboard:latest .
```

> **Note**: Building on the Pi ensures the image is compiled for the correct ARM architecture. If you encounter memory issues during build, see the Troubleshooting section.

### Alternative: Build with BuildKit (faster, if available)

```bash
DOCKER_BUILDKIT=1 docker build -t daylight-dashboard:latest .
```

## Step 5: Run the Container

### Option A: Using Docker Run

```bash
docker run -d \
  --name daylight-dashboard \
  --restart unless-stopped \
  -p 3000:3000 \
  --env-file .env.production \
  --memory="512m" \
  --cpus="1.0" \
  daylight-dashboard:latest
```

### Option B: Using Docker Compose (Recommended)

Create a `docker-compose.yml` file:

```bash
nano docker-compose.yml
```

Add the following content:

```yaml
version: '3.8'

services:
  daylight-dashboard:
    container_name: daylight-dashboard
    build:
      context: .
      dockerfile: Dockerfile
    image: daylight-dashboard:latest
    restart: unless-stopped
    ports:
      - "3000:3000"
    env_file:
      - .env.production
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '1.0'
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

Start with Docker Compose:

```bash
# Build and start
docker compose up -d --build

# Or if image is already built
docker compose up -d
```

## Step 6: Verify Deployment

### Check Container Status

```bash
# View running containers
docker ps

# Check container logs
docker logs daylight-dashboard

# Follow logs in real-time
docker logs -f daylight-dashboard
```

### Test the Application

From the Raspberry Pi:
```bash
curl http://localhost:3000
```

From another device on the network:
```bash
curl http://<raspberry-pi-ip>:3000
```

Open in a browser: `http://<raspberry-pi-ip>:3000`

## Step 7: Configure Auto-Start on Boot

Docker containers with `--restart unless-stopped` or `restart: unless-stopped` will automatically restart when the Pi boots.

Ensure Docker starts on boot:
```bash
sudo systemctl enable docker
```

## Managing the Container

### Common Commands

```bash
# Stop the container
docker stop daylight-dashboard

# Start the container
docker start daylight-dashboard

# Restart the container
docker restart daylight-dashboard

# View logs
docker logs daylight-dashboard
docker logs -f daylight-dashboard  # Follow mode

# Check resource usage
docker stats daylight-dashboard

# Enter container shell (for debugging)
docker exec -it daylight-dashboard /bin/sh

# Remove container (to rebuild)
docker stop daylight-dashboard
docker rm daylight-dashboard
```

### Using Docker Compose

```bash
# Start
docker compose up -d

# Stop
docker compose down

# Restart
docker compose restart

# View logs
docker compose logs -f

# Rebuild and restart
docker compose up -d --build

# Check status
docker compose ps
```

## Updating the Application

### Manual Update

```bash
cd ~/daylight-dashboard

# Pull latest code (if using git)
git pull

# Rebuild and restart
docker compose down
docker compose up -d --build

# Or with docker run
docker stop daylight-dashboard
docker rm daylight-dashboard
docker build -t daylight-dashboard:latest .
docker run -d \
  --name daylight-dashboard \
  --restart unless-stopped \
  -p 3000:3000 \
  --env-file .env.production \
  daylight-dashboard:latest
```

### Clean Up Old Images

```bash
# Remove unused images
docker image prune -a

# Remove all unused Docker resources
docker system prune -a
```

## Network Configuration

### Finding Your Raspberry Pi IP

```bash
# On the Pi
hostname -I

# Or
ip addr show | grep inet
```

### Static IP (Recommended for Dashboard)

Edit dhcpcd configuration:
```bash
sudo nano /etc/dhcpcd.conf
```

Add at the end:
```
interface eth0  # or wlan0 for WiFi
static ip_address=192.168.1.100/24
static routers=192.168.1.1
static domain_name_servers=192.168.1.1 8.8.8.8
```

Restart networking:
```bash
sudo systemctl restart dhcpcd
```

### Port Conflicts

If port 3000 is already in use by another container:

```bash
# Check what's using port 3000
sudo netstat -tlnp | grep 3000
# or
docker ps --format "table {{.Names}}\t{{.Ports}}"
```

To use a different port, modify the port mapping:
```bash
# Map external port 3001 to internal port 3000
docker run -d -p 3001:3000 ...
```

Or in docker-compose.yml:
```yaml
ports:
  - "3001:3000"
```

## Integrating with Other Containers

### View All Running Containers

```bash
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

### Create a Shared Network (Optional)

If your containers need to communicate:

```bash
# Create a network
docker network create home-apps

# Run container on the network
docker run -d \
  --name daylight-dashboard \
  --network home-apps \
  --restart unless-stopped \
  -p 3000:3000 \
  --env-file .env.production \
  daylight-dashboard:latest
```

Or in docker-compose.yml:
```yaml
networks:
  home-apps:
    external: true

services:
  daylight-dashboard:
    networks:
      - home-apps
    # ... rest of config
```

## Reverse Proxy Setup (Optional)

If you're running multiple web apps and want a single entry point with subdomains or paths.

### Using Nginx Proxy Manager (Docker)

If you have Nginx Proxy Manager running:

1. Add a new Proxy Host
2. Domain: `dashboard.local` or your domain
3. Forward Hostname/IP: `daylight-dashboard` (container name) or Pi IP
4. Forward Port: `3000`
5. Enable WebSocket support

### Using Traefik

Add labels to docker-compose.yml:
```yaml
services:
  daylight-dashboard:
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.dashboard.rule=Host(`dashboard.local`)"
      - "traefik.http.services.dashboard.loadbalancer.server.port=3000"
```

## Performance Optimization

### Raspberry Pi Specific

```bash
# Increase swap (helps during builds)
sudo dphys-swapfile swapoff
sudo nano /etc/dphys-swapfile
# Set CONF_SWAPSIZE=2048
sudo dphys-swapfile setup
sudo dphys-swapfile swapon

# Reduce GPU memory (headless server)
sudo raspi-config
# Performance Options > GPU Memory > Set to 16
```

### Container Resource Limits

Adjust based on your Pi's available resources:

```yaml
deploy:
  resources:
    limits:
      memory: 512M  # Adjust based on available RAM
      cpus: '1.0'   # Adjust based on CPU cores
```

### Monitoring Resource Usage

```bash
# Container stats
docker stats

# System resources
htop

# Disk usage
df -h
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs for errors
docker logs daylight-dashboard

# Check if port is in use
sudo lsof -i :3000

# Verify environment file exists and is readable
cat .env.production
```

### Build Fails (Out of Memory)

```bash
# Increase swap space
sudo dphys-swapfile swapoff
sudo sed -i 's/CONF_SWAPSIZE=.*/CONF_SWAPSIZE=2048/' /etc/dphys-swapfile
sudo dphys-swapfile setup
sudo dphys-swapfile swapon

# Build with memory limit
docker build --memory=1g -t daylight-dashboard:latest .
```

### Application Crashes / Restarts

```bash
# Check container health
docker inspect daylight-dashboard | grep -A 10 "State"

# View recent logs
docker logs --tail 100 daylight-dashboard

# Check for OOM (Out of Memory) kills
dmesg | grep -i "killed process"
```

### Cannot Access from Network

```bash
# Check if container is running
docker ps

# Check port binding
docker port daylight-dashboard

# Check firewall (if enabled)
sudo ufw status
sudo ufw allow 3000/tcp

# Test locally first
curl http://localhost:3000
```

### Google API Errors

```bash
# Verify environment variables are set
docker exec daylight-dashboard env | grep GOOGLE

# Check if refresh token is valid
# Tokens may expire - regenerate if needed
```

### Memory Limit Warning

If you see: `Your kernel does not support memory soft limit capabilities or the cgroup is not mounted`

This is a warning (not an error) - the container will still run. To enable memory limits:

```bash
# Edit boot config
sudo nano /boot/firmware/cmdline.txt
# Or on older Pi OS: sudo nano /boot/cmdline.txt

# Add to the END of the existing line (don't create a new line):
cgroup_enable=memory cgroup_memory=1

# Reboot
sudo reboot
```

After reboot, Docker memory limits will work. This is optional - your container runs fine without it.

### Slow Performance

```bash
# Check container resource usage
docker stats daylight-dashboard

# Consider increasing memory limit
docker update --memory=768m daylight-dashboard

# Check SD card speed (slow cards impact performance)
sudo hdparm -t /dev/mmcblk0
```

## Backup and Recovery

### Backup Environment File

```bash
cp .env.production .env.production.backup
```

### Export Container (for migration)

```bash
# Save image to file
docker save daylight-dashboard:latest | gzip > daylight-dashboard.tar.gz

# Load on another Pi
gunzip -c daylight-dashboard.tar.gz | docker load
```

## Quick Reference

| Task | Command |
|------|---------|
| Start | `docker compose up -d` |
| Stop | `docker compose down` |
| Restart | `docker compose restart` |
| Logs | `docker compose logs -f` |
| Rebuild | `docker compose up -d --build` |
| Status | `docker ps` |
| Stats | `docker stats` |
| Shell | `docker exec -it daylight-dashboard /bin/sh` |

## Access URLs

- **Local**: http://localhost:3000
- **Network**: http://<raspberry-pi-ip>:3000

Replace `<raspberry-pi-ip>` with your Pi's actual IP address (e.g., `192.168.1.100`).
