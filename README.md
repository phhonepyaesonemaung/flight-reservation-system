# AEROLINK - Real-Time Flight Reservation Management System

A comprehensive web application for managing flight bookings, reservations, and airline operations with real-time updates.

## Project Overview

AEROLINK is a modern flight reservation management system designed to handle:
- Flight search and booking
- User authentication and authorization
- Real-time seat availability
- Payment processing
- Booking management
- Admin dashboard for flight and user management

## Technology Stack

### Frontend
- **React.js** with **Next.js** - Modern UI framework
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Redux Toolkit** - State management
- **React Query** - Data fetching and caching

### Backend
- **Node.js** with **Express.js** - RESTful API
- **PostgreSQL** - Primary database
- **Redis** - Caching and session management
- **Socket.io** - Real-time updates
- **JWT** - Authentication

### DevOps
- **Docker** - Containerization
- **GitHub Actions** - CI/CD
- **AWS/DigitalOcean** - Deployment

## Project Structure

```
flight-reservation-system/
├── frontend/                 # Next.js frontend application
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── app/            # Next.js 14+ app directory
│   │   ├── components/     # Reusable UI components
│   │   ├── features/       # Feature-based modules
│   │   ├── lib/           # Utility functions and configs
│   │   ├── hooks/         # Custom React hooks
│   │   ├── store/         # Redux store configuration
│   │   ├── types/         # TypeScript type definitions
│   │   └── styles/        # Global styles
│   └── package.json
│
├── backend/                 # Node.js backend API
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Express middleware
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Helper functions
│   │   ├── validators/     # Request validation
│   │   └── index.js        # Entry point
│   └── package.json
│
├── database/               # Database scripts
│   ├── migrations/        # DB migration files
│   ├── seeds/             # Seed data
│   └── schema.sql         # Database schema
│
├── docs/                   # Documentation
│   ├── api/               # API documentation
│   ├── architecture/      # System architecture
│   └── user-guide/        # User guides
│
├── docker/                # Docker configurations
│   ├── Dockerfile.frontend
│   ├── Dockerfile.backend
│   └── docker-compose.yml
│
└── .github/              # GitHub configurations
    └── workflows/        # CI/CD workflows

```

## Features

### User Features
- User registration and login
- Flight search with filters (date, destination, price)
- Real-time seat availability
- Booking and payment
- Booking history and management
- E-ticket generation
- Profile management

### Admin Features
- Flight management (CRUD operations)
- User management
- Booking analytics and reports
- Revenue tracking
- System configuration

### System Features
- Real-time updates using WebSocket
- Secure payment integration
- Email notifications
- Responsive design
- Role-based access control (RBAC)
- API rate limiting
- Comprehensive error handling

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/phhonepyaesonemaung/flight-reservation-system.git
cd flight-reservation-system
```

2. Install frontend dependencies
```bash
cd frontend
npm install
```

3. Install backend dependencies
```bash
cd ../backend
npm install
```

4. Set up environment variables (see `.env.example` files)

5. Run database migrations
```bash
cd backend
npm run migrate
```

6. Start development servers
```bash
# Terminal 1 - Frontend
cd frontend
npm run dev

# Terminal 2 - Backend
cd backend
npm run dev
```

## Development Roadmap

- [ ] Phase 1: Project Setup & Authentication
- [ ] Phase 2: Flight Search & Booking
- [ ] Phase 3: Payment Integration
- [ ] Phase 4: Admin Dashboard
- [ ] Phase 5: Real-time Features
- [ ] Phase 6: Testing & Deployment

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## License

MIT License - see LICENSE file for details

## Contact

Project Maintainer: [@phhonepyaesonemaung](https://github.com/phhonepyaesonemaung)
