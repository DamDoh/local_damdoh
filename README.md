# DamDoh: The Super App for Global Agri-Communities

> **DamDoh 2.0** - A comprehensive agricultural platform connecting farmers, buyers, suppliers, and stakeholders worldwide with modern web technologies and AI-powered insights.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Built%20with-Next.js-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

DamDoh is a modern, full-stack agricultural platform designed to empower farming communities worldwide. Built with cutting-edge technologies, it provides farmers, buyers, suppliers, and agricultural stakeholders with tools for farm management, marketplace trading, community engagement, and AI-powered insights.

## 🌟 Features

### 🏗️ **Core Platform Features**
- **Multi-Stakeholder Dashboard** - Role-based interfaces for Farmers, Buyers, Suppliers, Agronomists, and more
- **Real-time Community Feed** - AI-curated content with smart filtering and recommendations
- **Advanced Farm Management** - Crop tracking, soil analysis, irrigation monitoring, and yield optimization
- **Digital Marketplace** - Buy/sell agricultural products with integrated logistics and payments
- **AI-Powered Insights** - Crop disease detection, market price predictions, and farming recommendations
- **Offline-First Architecture** - Works seamlessly in areas with poor connectivity

### 🎯 **Stakeholder-Specific Features**
- **Farmers:** Crop monitoring, weather intelligence, farm analytics, and direct marketplace access
- **Buyers:** Procurement intelligence, supply chain visibility, and bulk purchasing tools
- **Suppliers:** Equipment rental, maintenance scheduling, and customer relationship management
- **Agronomists:** Client portfolio management, consultation scheduling, and knowledge sharing
- **Researchers:** Data access, collaborative projects, and publication management

### 🚀 **Technical Features**
- **Progressive Web App (PWA)** - Installable on mobile devices with offline capabilities
- **Voice Control** - Hands-free operation for farm management tasks
- **Gamification** - Achievement system to increase user engagement
- **Real-time Notifications** - WebSocket-based instant updates
- **Multi-language Support** - Internationalization with 6+ languages
- **Advanced Search** - AI-powered semantic search across all platform content

## 🛠️ Technology Stack

### **Frontend**
- **Framework:** [Next.js 15](https://nextjs.org/) - React-based full-stack framework
- **Language:** [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- **State Management:** [TanStack Query](https://tanstack.com/query) - Powerful data synchronization
- **UI Components:** [Radix UI](https://www.radix-ui.com/) - Accessible component primitives
- **Icons:** [Lucide React](https://lucide.dev/) - Beautiful icon library

### **Backend**
- **Runtime:** [Node.js](https://nodejs.org/) with [Express.js](https://expressjs.com/)
- **Language:** [TypeScript](https://www.typescriptlang.org/) - Full-stack type safety
- **Database:** [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/) ODM
- **Authentication:** JWT-based authentication with role-based access control
- **Real-time:** [Socket.IO](https://socket.io/) for real-time communication
- **Validation:** [Zod](https://zod.dev/) for runtime type validation

### **DevOps & Tools**
- **Containerization:** [Docker](https://www.docker.com/) & Docker Compose
- **Process Management:** [PM2](https://pm2.keymetrics.io/) for production
- **Testing:** [Jest](https://jestjs.io/) with React Testing Library
- **Linting:** [ESLint](https://eslint.org/) with TypeScript rules
- **Version Control:** [Git](https://git-scm.com/) with GitHub Actions CI/CD

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)
- **Docker** (recommended for MongoDB) - [Download here](https://www.docker.com/)
- **MongoDB** (alternative to Docker) - [Download here](https://www.mongodb.com/)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/DamDoh/local_damdoh.git
cd local_damdoh
```

### 2. Install Dependencies

**Frontend Dependencies:**
```bash
npm install
```

**Backend Dependencies:**
```bash
cd backend
npm install
cd ..
```

### 3. Set up Environment Variables
```bash
# Copy environment template
cp backend/.env.example backend/.env

# Edit with your configuration
nano backend/.env
```

**Required Environment Variables:**
```env
# Server Configuration
NODE_ENV=development
PORT=8000

# MongoDB Configuration
MONGODB_URI=mongodb://admin:password123@localhost:27017/damdoh?authSource=admin

# JWT Configuration
JWT_SECRET=your_secure_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=15m
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
CORS_ORIGIN=*

# Logging
LOG_LEVEL=info
```

### 4. Start MongoDB

**Option A: Using Docker (Recommended)**
```bash
docker-compose up -d mongodb
```

**Option B: Using Local MongoDB**
```bash
# Windows
net start MongoDB

# macOS
brew services start mongodb/brew/mongodb-community

# Linux
sudo systemctl start mongod
```

### 5. Start the Development Servers

**Terminal 1 - Backend Server:**
```bash
cd backend
npm run dev
```
*Expected output:*
```
Server is running on port 8000
MongoDB Connected: localhost
```

**Terminal 2 - Frontend Server:**
```bash
npm run dev
```
*Expected output:*
```
✓ Compiled in 2.9s (2357 modules)
Local: http://localhost:3000
```

### 6. Access the Application

Open your browser and navigate to:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Health Check:** http://localhost:8000/health

## 🏗️ Project Structure

```
DamDoh 2.0/
├── src/                          # Frontend Application
│   ├── app/                     # Next.js App Router
│   │   ├── [locale]/            # Internationalized routes
│   │   ├── api/                 # API routes
│   │   └── globals.css          # Global styles
│   ├── components/              # React Components
│   │   ├── ui/                  # Reusable UI components
│   │   ├── dashboard/           # Dashboard-specific components
│   │   └── layout/              # Layout components
│   ├── lib/                     # Utilities & Configurations
│   │   ├── api-utils.ts         # API client utilities
│   │   ├── auth-utils.ts        # Authentication helpers
│   │   └── types.ts             # TypeScript type definitions
│   ├── services/                # Business Logic Services
│   │   ├── dashboard/           # Dashboard services
│   │   └── ai/                  # AI service integrations
│   └── hooks/                   # Custom React Hooks
├── backend/                      # Backend Application
│   ├── src/
│   │   ├── controllers/         # Route controllers
│   │   ├── models/              # MongoDB data models
│   │   ├── routes/              # API route definitions
│   │   ├── services/            # Business logic services
│   │   ├── middleware/          # Express middleware
│   │   └── utils/               # Utility functions
│   ├── .env                     # Environment variables
│   └── package.json             # Backend dependencies
├── docs/                        # Documentation
├── scripts/                     # Utility scripts
├── docker-compose.yml           # Docker services
└── README.md                    # This file
```

## 🔧 Development Scripts

### Frontend Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript type checking
npm test            # Run Jest tests
```

### Backend Scripts
```bash
cd backend
npm run dev          # Start development server with nodemon
npm run build        # Build TypeScript to JavaScript
npm run start        # Start production server
npm test            # Run Jest tests
```

## 🐳 Docker Development

### Start All Services
```bash
docker-compose up -d
```

### View Logs
```bash
docker-compose logs -f
```

### Stop Services
```bash
docker-compose down
```

## 🔒 Environment Configuration

### Frontend Environment Variables
Create `.env.local` in the root directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_APP_ENV=development
```

### Backend Environment Variables
The `backend/.env` file should contain:
```env
NODE_ENV=development
PORT=8000
MONGODB_URI=mongodb://admin:password123@localhost:27017/damdoh?authSource=admin
JWT_SECRET=your_secure_jwt_secret_key_here
JWT_EXPIRES_IN=7d
RATE_LIMIT_WINDOW_MS=15m
RATE_LIMIT_MAX_REQUESTS=100
CORS_ORIGIN=*
LOG_LEVEL=info
```

## 🧪 Testing

### Run All Tests
```bash
# Frontend tests
npm test

# Backend tests
cd backend && npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

## 📚 Documentation

- **[Architecture Overview](docs/architecture-overview.md)** - System design and architecture decisions
- **[API Documentation](docs/api-documentation.md)** - Backend API endpoints and usage
- **[Development Guide](docs/development-workflow.md)** - Development best practices and workflows
- **[Deployment Guide](docs/deployment-guide.md)** - Production deployment instructions

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style and architecture patterns
- Write tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ for the global agricultural community
- Special thanks to all contributors and the open-source community
- Powered by modern web technologies and AI innovation

---

**DamDoh 2.0** - Empowering agriculture through technology 🌱🚀
