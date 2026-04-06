# SmartWinnr Admin Dashboard 🚀

A premium MEAN stack (MongoDB, Express, Angular, Node) Admin Dashboard featuring real-time analytics, role-based access control (RBAC), and full-stack content management.

---

## 🛠️ Technology Stack & Versions

### Frontend (Angular)
- **Angular Version**: 21.2.x
- **CLI**: 21.2.x
- **Key Modules**: Chart.js 4.5+, Socket.io-client 4.8+, jsPDF 4.2+, File-Saver 2.0+
- **Styling**: Vanilla CSS (Glassmorphism design system)

### Backend (Node.js/Express)
- **Node.js**: v18.x or v20.x (LTS recommended)
- **Express**: 4.19.x
- **Database**: MongoDB (via Mongoose 8.3+)
- **Security**: JWT (jsonwebtoken 9.0+), Password hashing (bcryptjs 2.4+)
- **Real-time**: Socket.io 4.7+

---

## 💻 Local Setup Instructions

### 1. Prerequisites
Ensure you have the following installed on your machine:
- **Node.js** (v18.0.0 or higher)
- **npm** (v10.0.0 or higher)
- **MongoDB** (Local instance or MongoDB Atlas cloud connection)

### 2. Backend Configuration
1.  Navigate to the server directory:
    ```bash
    cd server
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the `server` root:
    ```env
    PORT=5000
    MONGO_URI=mongodb://localhost:27017/admin_dashboard
    JWT_SECRET=your_super_secure_random_string_here
    NODE_ENV=development
    ```
4.  **Seed the Database** (Initial users & analytics data):
    ```bash
    npm run seed
    ```
5.  Start the backend server:
    ```bash
    npm start
    ```
    *Server should be running at: http://localhost:5000*

### 3. Frontend Configuration
1.  Navigate to the client directory:
    ```bash
    cd client
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the Angular development server:
    ```bash
    npm start
    ```
    *App should be running at: http://localhost:4200*

---

## 🔑 Default Login Credentials
Use these to access the dashboard after seeding:
- **Email**: `admin@dashboard.com`
- **Password**: `admin123`
- **Role**: Admin (Full CRUD permissions)

---

## 📦 Project Architecture
- **`/client`**: Angular workspace containing the sophisticated dashboard UI, components for charts, user management, and settings.
- **`/server`**: Node.js backend providing RESTful APIs, JWT authentication middleware, and MongoDB schemas.
- **`/utils`**: Contains the database seeder (`seed.js`) to get you up and running instantly.

---

## 🌟 Features Implemented
- **Glassmorphism UI**: High-end modern design with blurred surfaces and vibrant accents.
- **Real-time Sync**: Socket.io integration for instant data updates.
- **Role-Based Access**: Specialized views for Admins, Managers, and Viewers.
- **Reporting & Exports**: Export any data table to **CSV** or **PDF** with one click.
- **Advanced Filtering**: Global search and status-based filtering for all records.
- **Theme Support**: Persistent Light/Dark mode toggling.

---

## ⚓ Deployment
For production deployment, ensure the `apiUrl` in `client/src/environments/environment.prod.ts` points to your deployed backend URL.

1.  **Build Frontend**: `npm run build` inside the `/client` folder.
2.  **Server Hosting**: Deploy the `/server` folder to Heroku, DigitalOcean, or AWS App Runner.
3.  **Static Hosting**: Deploy the `/client/dist/client/browser` contents to Vercel, Netlify, or AWS S3.
