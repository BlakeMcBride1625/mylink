# 🗄️ Database Port Configuration

**PostgreSQL Port Mapping**: External Port `1800` → Internal Port `5432`

---

## 🔧 **Why Custom Port 1800?**

The default PostgreSQL port `5432` is already in use on your VPS, so we're using port `1800` externally while keeping `5432` internally within Docker.

---

## 📊 **Port Mapping Explained**

```
┌─────────────────────────────────────────────┐
│  Your VPS                                   │
│                                             │
│  Port 1800 (External) ──────┐              │
│                              │              │
│  ┌───────────────────────────▼───────────┐ │
│  │  Docker Container (myhub-postgres)    │ │
│  │                                       │ │
│  │  Port 5432 (Internal)                │ │
│  │  PostgreSQL Database                 │ │
│  └───────────────────────────────────────┘ │
│                                             │
└─────────────────────────────────────────────┘
```

**How it works:**

- **External access**: Connect to `localhost:1800` from your VPS
- **Internal Docker**: App connects to `postgres:5432` (Docker network)
- **No conflict**: Port 1800 is free on your VPS

---

## ⚙️ **Configuration**

### **1. docker-compose.yml**

```yaml
postgres:
  image: postgres:15-alpine
  ports:
    - '${POSTGRES_PORT:-1800}:5432' # External:Internal
```

**Translation:**

- `1800` = Port on your VPS (host machine)
- `5432` = Port inside Docker container
- Traffic to `localhost:1800` → forwarded to → container port `5432`

---

### **2. Environment Variables**

#### **For Docker Deployment (Inside Container)**

Your `.env` file should use:

```env
POSTGRES_HOST=postgres      # Docker service name
POSTGRES_PORT=5432          # Internal Docker port
```

#### **For Local Development (Outside Docker)**

If connecting from your VPS directly:

```env
POSTGRES_HOST=localhost
POSTGRES_PORT=1800          # External mapped port
```

---

## 🐳 **Docker Networking**

### **Inside Docker Network**

When your app runs in Docker (`docker-compose up`):

```env
# App container connects to postgres container via Docker network
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
```

**Why `postgres`?**  
It's the service name in `docker-compose.yml`. Docker's internal DNS resolves it.

**Why `5432`?**  
Containers communicate via internal Docker network, not mapped ports.

---

### **From VPS Host (Outside Docker)**

If you want to connect from your VPS command line:

```bash
# Example: psql connection from VPS
psql -h localhost -p 1800 -U admin -d myhub_db
```

**Why `localhost:1800`?**  
You're connecting from outside Docker, so you use the external mapped port.

---

## 🔍 **Verify Port Mapping**

### **Check if port 1800 is listening:**

```bash
# On your VPS
sudo netstat -tulpn | grep 1800

# Or
sudo lsof -i :1800
```

**Expected output:**

```
docker-proxy    *:1800 (LISTEN)
```

---

### **Check if port 5432 is in use:**

```bash
# Check existing PostgreSQL
sudo netstat -tulpn | grep 5432
```

If this shows an existing process, that's why we use 1800!

---

## 📝 **Connection Examples**

### **From Node.js App (Inside Docker)**

```javascript
// server/db.ts
const pool = new Pool({
  host: 'postgres', // Docker service name
  port: 5432, // Internal port
  user: 'admin',
  password: 'your_password',
  database: 'myhub_db',
});
```

---

### **From VPS Command Line**

```bash
# psql
psql -h localhost -p 1800 -U admin -d myhub_db

# pg_dump (backup)
pg_dump -h localhost -p 1800 -U admin myhub_db > backup.sql

# pg_restore
psql -h localhost -p 1800 -U admin myhub_db < backup.sql
```

---

### **From External Tools (e.g., pgAdmin)**

If you want to connect from your local machine to the VPS database:

```
Host: YOUR_VPS_IP
Port: 1800
Username: admin
Password: your_password
Database: myhub_db
```

⚠️ **Security Note**: Make sure port 1800 is not exposed to the internet unless necessary!

---

## 🔐 **Firewall Configuration**

### **If Using UFW (Ubuntu Firewall)**

```bash
# Only allow port 1800 from localhost (recommended)
sudo ufw allow from 127.0.0.1 to any port 1800

# Or allow from specific IP
sudo ufw allow from YOUR_IP to any port 1800

# Check status
sudo ufw status
```

### **If Using iptables**

```bash
# Allow localhost only
sudo iptables -A INPUT -p tcp -s 127.0.0.1 --dport 1800 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 1800 -j DROP
```

---

## 🧪 **Testing**

### **1. Start Containers**

```bash
docker-compose up -d
```

### **2. Check PostgreSQL is Running**

```bash
# Check container
docker ps | grep postgres

# Check logs
docker-compose logs postgres
```

### **3. Test Connection from VPS**

```bash
# Install psql if needed
sudo apt install postgresql-client

# Connect
psql -h localhost -p 1800 -U admin -d myhub_db
```

### **4. Test from App Container**

```bash
# Enter app container
docker exec -it myhub-app sh

# Test connection (if psql available)
psql -h postgres -p 5432 -U admin -d myhub_db
```

---

## 🐛 **Troubleshooting**

### **"Connection refused" on port 1800**

**Cause**: Docker not running or port mapping failed

**Fix**:

```bash
# Restart Docker
docker-compose down
docker-compose up -d

# Check port mapping
docker port myhub-postgres
```

---

### **"Port 1800 already in use"**

**Cause**: Another service using port 1800

**Fix**: Choose a different port

```bash
# In .env
POSTGRES_PORT=1801

# Or directly in docker-compose.yml
ports:
  - "1801:5432"
```

---

### **App can't connect to database**

**Symptoms**: `ECONNREFUSED` or timeout errors

**Cause**: Wrong host/port in app config

**Fix**: Verify `.env` inside Docker:

```env
POSTGRES_HOST=postgres    # NOT localhost!
POSTGRES_PORT=5432        # NOT 1800!
```

---

## 📊 **Quick Reference**

| Scenario           | Host        | Port   | Usage                                    |
| ------------------ | ----------- | ------ | ---------------------------------------- |
| **App (Docker)**   | `postgres`  | `5432` | Production runtime                       |
| **VPS CLI**        | `localhost` | `1800` | Manual operations                        |
| **External Tools** | `VPS_IP`    | `1800` | Remote management                        |
| **Existing DB**    | N/A         | `5432` | Already in use (that's why we use 1800!) |

---

## 🎯 **Summary**

✅ **External Port**: `1800` (your VPS)  
✅ **Internal Port**: `5432` (Docker container)  
✅ **App connects via**: `postgres:5432` (Docker network)  
✅ **You connect via**: `localhost:1800` (from VPS)  
✅ **No conflict**: With existing PostgreSQL on `5432`

---

**Your database is accessible at port 1800 without conflicts!** 🎉
