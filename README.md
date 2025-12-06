# ![Meetza Logo](public/assets/meetzalogo.png) ![Meetza Logo](public/assets/MeetzaWord.png) Dashboard

A comprehensive React-based admin dashboard for managing the Meetza platform. This application provides administrators with powerful tools to manage users, groups, meetings, videos, resources, and more through an intuitive and responsive interface.

## 🚀 Live Demo

Access the live application: [https://meetza-front-end-admin.vercel.app/](https://meetza-front-end-admin.vercel.app/)

## 🎨 Design

View the Figma design: [https://www.figma.com/design/BCnIDNN5fdPOiVv5tXTYXE/Farida-Meetza?node-id=0-1&p=f&t=ehzpvGrgs7fbkPe3-0](https://www.figma.com/design/BCnIDNN5fdPOiVv5tXTYXE/Farida-Meetza?node-id=0-1&p=f&t=ehzpvGrgs7fbkPe3-0)

## ✨ Features

- **User Management**: Create, read, update, and delete user accounts with role-based access control
- **Group Management**: Organize users into groups with hierarchical structures
- **Group Membership**: Manage user memberships within groups
- **Group Content**: Handle content associated with specific groups
- **Meeting Management**: Schedule and manage virtual meetings
- **Video Management**: Upload, organize, and manage video content
- **Resource Management**: Manage platform resources and assets
- **Position Management**: Define and assign user positions/roles
- **Authentication**: Secure login/logout with token-based authentication
- **Responsive Design**: Optimized for both desktop and mobile devices
- **Real-time Notifications**: Toast notifications for user feedback
- **Form Validation**: Comprehensive client-side validation
- **API Integration**: Seamless integration with Meetza backend API

## 🛠 Tech Stack

### Frontend
- **React 19.2.0**: Modern JavaScript library for building user interfaces
- **React Router DOM 7.9.4**: Declarative routing for React applications
- **Bootstrap 5.3.8**: Responsive CSS framework
- **React Bootstrap 2.10.10**: Bootstrap components for React
- **Framer Motion 12.23.22**: Animation library for React
- **Axios 1.13.2**: HTTP client for API requests
- **React Toastify 11.0.5**: Toast notifications
- **Phosphor React 1.4.1**: Icon library
- **Lottie React 2.4.1**: Lottie animations for React

### Development Tools
- **Create React App**: Build setup and development server
- **ESLint**: Code linting
- **Cross-env**: Cross-platform environment variable setting

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd meetza-admin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory and add your environment variables:
   ```env
   REACT_APP_API_BASE=https://meetza-backend.vercel.app/api
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

   The application will open at [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `npm start` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm run eject` - Ejects from Create React App (irreversible)

## 🔧 Configuration

### API Configuration

The application uses Axios for API communication. The base URL is configured in `src/utils/api.js`:

```javascript
const API_BASE = process.env.REACT_APP_API_BASE || "https://meetza-backend.vercel.app/api";
```

### Authentication

The app uses JWT tokens for authentication, stored in localStorage. Automatic token refresh and logout on token expiration are handled via Axios interceptors.

### Routing

Protected routes are implemented using React Router with a `ProtectedRoute` component that checks for authentication tokens.

## 📱 Usage

1. **Login**: Access the admin dashboard using your credentials
2. **Dashboard Navigation**: Use the sidebar to navigate between different management sections
3. **CRUD Operations**: Perform create, read, update, and delete operations on various entities
4. **Search and Filter**: Use search bars and filters to find specific data
5. **Responsive Design**: The interface adapts to different screen sizes

## 🔒 Security Features

- JWT-based authentication
- Protected routes
- Automatic logout on token expiration
- Secure API communication with Axios interceptors
- Client-side form validation

## 🎯 Key Components

### Dashboard Layout
- Responsive sidebar navigation
- Main content area with dynamic components
- Toast notifications for user feedback

### Data Management
- Custom hooks for API data fetching (`useUserData`, `useGroupData`, etc.)
- Modal components for create/edit operations
- Table components with pagination and search

### Forms and Validation
- Reusable form input components
- Custom validation hooks
- Password visibility toggles

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is private and proprietary to Meetza.

## 📞 Support

For support or questions, please contact the development team.

---

**Meetza Admin Dashboard** - Empowering administrators to efficiently manage the Meetza platform.
