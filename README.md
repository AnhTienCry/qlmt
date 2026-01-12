# 🖥️ QLMT - Hệ Thống Quản Lý Máy Tính

Hệ thống quản lý thiết bị máy tính, kho hàng và yêu cầu đề xuất cho doanh nghiệp.

## 📋 Mục lục

- [Tính năng](#-tính-năng)
- [Yêu cầu hệ thống](#-yêu-cầu-hệ-thống)
- [Cài đặt Local](#-cài-đặt-local)
- [Deploy Production](#-deploy-production)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [API Documentation](#-api-documentation)
- [Tài khoản mặc định](#-tài-khoản-mặc-định)

---

## ✨ Tính năng

### 👤 Phân quyền người dùng
- **Admin**: Quản lý toàn bộ hệ thống, users, kho, thiết bị
- **IT**: Xử lý yêu cầu đề xuất, quản lý thiết bị
- **Director (Giám đốc)**: Phê duyệt yêu cầu đề xuất
- **User**: Tạo yêu cầu đề xuất

### 📦 Quản lý kho
- Quản lý kho hàng
- Nhập/Xuất hàng
- Điều chuyển thiết bị giữa các kho
- Theo dõi lịch sử giao dịch

### 💻 Quản lý thiết bị
- Quản lý máy tính, màn hình, phím, chuột, v.v.
- Theo dõi trạng thái thiết bị
- Gán thiết bị cho nhân viên

### 📝 Quản lý yêu cầu đề xuất
- Tạo yêu cầu (nâng cấp, sửa chữa, mua mới, thay thế)
- Workflow: User → IT xử lý → Giám đốc duyệt

---

## 💻 Yêu cầu hệ thống

| Thành phần | Phiên bản |
|------------|-----------|
| Node.js | >= 18.x |
| SQL Server | 2019+ hoặc Azure SQL |
| npm hoặc yarn | Phiên bản mới nhất |

---

## 🚀 Cài đặt Local

### Bước 1: Clone repository

```bash
git clone <repository-url>
cd qlmt
```

### Bước 2: Cài đặt Database

1. **Mở SQL Server Management Studio (SSMS)** hoặc Azure Data Studio

2. **Chạy script khởi tạo database:**
   ```
   Mở file: backend/src/database/init.sql
   Chạy toàn bộ script trong SSMS
   ```

3. **Xác nhận database đã được tạo:**
   - Database: `QuanLyMayTinhDB`
   - 11 bảng sẽ được tạo tự động

### Bước 3: Cấu hình Backend

1. **Tạo file môi trường:**
   ```bash
   cd backend
   copy .env.example .env    # Windows
   # hoặc
   cp .env.example .env      # Linux/Mac
   ```

2. **Chỉnh sửa file `.env`:**
   ```env
   # Server
   PORT=5000
   NODE_ENV=development

   # Database - CẬP NHẬT THÔNG TIN KẾT NỐI CỦA BẠN
   DB_SERVER=localhost
   DB_PORT=1433
   DB_DATABASE=QuanLyMayTinhDB
   DB_USER=sa
   DB_PASSWORD=your_password_here
   DB_ENCRYPT=false
   DB_TRUST_SERVER_CERTIFICATE=true

   # JWT - THAY ĐỔI SECRET KEY
   JWT_SECRET=your_super_secret_key_here
   JWT_EXPIRES_IN=7d
   ```

3. **Cài đặt dependencies và chạy:**
   ```bash
   npm install
   npm run dev
   ```

   ✅ Backend sẽ chạy tại: `http://localhost:5000`

### Bước 4: Cấu hình Frontend

1. **Mở terminal mới, di chuyển đến thư mục frontend:**
   ```bash
   cd frontend
   ```

2. **Tạo file môi trường (tùy chọn):**
   ```bash
   copy .env.example .env    # Windows
   # hoặc
   cp .env.example .env      # Linux/Mac
   ```

3. **Cài đặt dependencies và chạy:**
   ```bash
   npm install
   npm run dev
   ```

   ✅ Frontend sẽ chạy tại: `http://localhost:5173`

### Bước 5: Truy cập ứng dụng

1. Mở trình duyệt: `http://localhost:5173`
2. Đăng nhập với tài khoản admin (xem phần [Tài khoản mặc định](#-tài-khoản-mặc-định))

---

## 🌐 Deploy Production

### Option 1: Deploy trên VPS/Server

#### 1. Chuẩn bị Server

```bash
# Cài đặt Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Cài đặt PM2 (Process Manager)
npm install -g pm2
```

#### 2. Build và Deploy Backend

```bash
cd backend

# Tạo file .env production
nano .env
# Cập nhật các biến môi trường cho production

# Cài đặt và build
npm install
npm run build

# Chạy với PM2
pm2 start dist/index.js --name "qlmt-backend"
pm2 save
pm2 startup
```

#### 3. Build và Deploy Frontend

```bash
cd frontend

# Tạo file .env production
nano .env
# VITE_API_URL=https://your-api-domain.com/api

# Build
npm install
npm run build

# Serve với nginx hoặc PM2
npm install -g serve
pm2 start "serve -s dist -l 3000" --name "qlmt-frontend"
```

#### 4. Cấu hình Nginx (Khuyến nghị)

```nginx
# /etc/nginx/sites-available/qlmt

# Frontend
server {
    listen 80;
    server_name your-domain.com;
    
    root /path/to/frontend/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Option 2: Deploy với Docker

#### 1. Tạo file `docker-compose.yml` ở thư mục gốc:

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - PORT=5000
      - DB_SERVER=host.docker.internal
      - DB_PORT=1433
      - DB_DATABASE=QuanLyMayTinhDB
      - DB_USER=sa
      - DB_PASSWORD=${DB_PASSWORD}
      - DB_ENCRYPT=false
      - DB_TRUST_SERVER_CERTIFICATE=true
      - JWT_SECRET=${JWT_SECRET}
      - JWT_EXPIRES_IN=7d
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped
```

#### 2. Tạo file `backend/Dockerfile`:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 5000

CMD ["node", "dist/index.js"]
```

#### 3. Tạo file `frontend/Dockerfile`:

```dockerfile
FROM node:20-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### 4. Tạo file `frontend/nginx.conf`:

```nginx
server {
    listen 80;
    
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://backend:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

#### 5. Chạy với Docker:

```bash
# Tạo file .env cho docker-compose
echo "DB_PASSWORD=your_password" > .env
echo "JWT_SECRET=your_jwt_secret" >> .env

# Build và chạy
docker-compose up -d --build
```

### Option 3: Deploy với Azure/AWS/GCP

#### Azure App Service

```bash
# Cài đặt Azure CLI
az login

# Tạo resource group
az group create --name qlmt-rg --location southeastasia

# Tạo App Service Plan
az appservice plan create --name qlmt-plan --resource-group qlmt-rg --sku B1 --is-linux

# Deploy Backend
az webapp create --resource-group qlmt-rg --plan qlmt-plan --name qlmt-backend --runtime "NODE:20-lts"
cd backend && az webapp up --name qlmt-backend

# Deploy Frontend (Static Web App)
az staticwebapp create --name qlmt-frontend --resource-group qlmt-rg --location southeastasia --source ./frontend --branch main
```

---

## 📁 Cấu trúc dự án

```
qlmt/
├── 📁 backend/                 # Node.js + Express + TypeScript
│   ├── 📁 src/
│   │   ├── 📁 config/          # Cấu hình database, env
│   │   ├── 📁 database/        # SQL scripts
│   │   │   └── init.sql        # Script khởi tạo database
│   │   ├── 📁 modules/         # Các module chức năng
│   │   │   ├── auth/           # Xác thực
│   │   │   ├── employee/       # Nhân viên
│   │   │   ├── department/     # Phòng ban
│   │   │   ├── warehouse/      # Kho
│   │   │   ├── hanghoa/        # Hàng hóa
│   │   │   ├── ncc/            # Nhà cung cấp
│   │   │   ├── stock/          # Nhập/Xuất kho
│   │   │   ├── transfer/       # Điều chuyển
│   │   │   └── proposal/       # Yêu cầu đề xuất
│   │   ├── 📁 shared/          # Middleware, utils
│   │   ├── index.ts            # Entry point
│   │   └── routes.ts           # Route definitions
│   ├── .env.example            # Template biến môi trường
│   ├── package.json
│   └── tsconfig.json
│
├── 📁 frontend/                # React + Vite + TypeScript + Tailwind
│   ├── 📁 src/
│   │   ├── 📁 components/      # React components
│   │   ├── 📁 pages/           # Các trang
│   │   ├── 📁 hooks/           # Custom hooks
│   │   ├── 📁 libs/            # API clients
│   │   └── 📁 types/           # TypeScript types
│   ├── .env.example            # Template biến môi trường
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

---

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication
```
POST /api/auth/login     - Đăng nhập
POST /api/auth/register  - Đăng ký
PUT  /api/auth/password  - Đổi mật khẩu
```

### Quản lý chung
```
GET/POST/PUT/DELETE /api/warehouses    - Kho
GET/POST/PUT/DELETE /api/departments   - Phòng ban
GET/POST/PUT/DELETE /api/employees     - Nhân viên
GET/POST/PUT/DELETE /api/ncc           - Nhà cung cấp
GET/POST/PUT/DELETE /api/hanghoa       - Hàng hóa
```

### Nhập/Xuất/Điều chuyển
```
GET/POST    /api/stock/in       - Nhập kho
GET/POST    /api/stock/out      - Xuất kho
GET/POST    /api/transfers      - Điều chuyển
```

### Yêu cầu đề xuất
```
GET/POST    /api/proposals           - Danh sách/Tạo yêu cầu
PUT         /api/proposals/:id       - Cập nhật yêu cầu
POST        /api/proposals/:id/process   - IT xử lý
POST        /api/proposals/:id/approve   - GĐ duyệt
```

---

## 🔐 Tài khoản mặc định

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |

> ⚠️ **Quan trọng:** Hãy đổi mật khẩu admin ngay sau khi đăng nhập lần đầu!

---

## 🛠️ Các lệnh hữu ích

### Backend
```bash
npm run dev      # Chạy development mode
npm run build    # Build production
npm start        # Chạy production build
```

### Frontend
```bash
npm run dev      # Chạy development mode (http://localhost:5173)
npm run build    # Build production
npm run preview  # Preview production build
```

---

## ❓ Xử lý sự cố

### Không kết nối được database

1. Kiểm tra SQL Server đang chạy
2. Xác nhận thông tin kết nối trong `.env`
3. Nếu dùng Windows Authentication, cần cấu hình thêm

### CORS Error

Đảm bảo backend đã cấu hình CORS cho frontend URL:
```typescript
// backend/src/index.ts
app.use(cors({
  origin: ['http://localhost:5173', 'https://your-domain.com'],
  credentials: true
}))
```

### Port đã được sử dụng

```bash
# Windows - Tìm process đang dùng port
netstat -ano | findstr :5000

# Kill process
taskkill /PID <PID> /F
```

---

## 📝 License

MIT License

---

## 👨‍💻 Tác giả

Developed with ❤️ for QLMT Project

---

## Tech Stack

### Frontend
- React 18
- Vite
- TypeScript
- Tailwind CSS
- React Router DOM
- Axios

### Backend
- Node.js
- Express.js
- TypeScript
- SQL Server (mssql)
- JWT Authentication
- bcryptjs
