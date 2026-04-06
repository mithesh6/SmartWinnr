# SmartWinnr Backend 🚀

Node.js REST API providing secure data management and real-time updates.

## 🚀 Version Requirements
- **Node.js**: v18.x / v20.x (v18.17.x+ recommended)
- **Express**: 4.19.2
- **MongoDB**: 6.0+ (Local or Cloud Atlas)
- **Mongoose**: 8.3.x

## 🔧 Core Dependencies
- **bcryptjs**: Secure password hashing.
- **jsonwebtoken**: Bearer token authentication.
- **dotenv**: Environment variable management.
- **socket.io**: Real-time websocket server.
- **cors**: Cross-Origin Resource Sharing.

## 🛠️ Local Setup
1.  **npm install**
2.  **Environment Setup**: Create `.env` in the root (see `.env.example`).
3.  **Database Seeding**:
    ```bash
    npm run seed
    ```
4.  **Start Dev Server**:
    ```bash
    npm run dev
    ```
    *Server runs at http://localhost:5000*

## 📦 API Endpoints
- **GET /api/auth/users**: List all users.
- **POST /api/auth/login**: Obtain JWT.
- **GET /api/analytics**: Fetch dashboard metrics.
- **GET /api/content**: List content entries.
