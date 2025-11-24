# Brainhub School Management System

A modern React-based school management system with a responsive design.

## Features

- **User Authentication**: Login with role selection (Administrator, Teacher/Staff, Parent/Student)
- **Dashboard**: Overview of students, staff, and financial statistics
- **Student Management**: Add, view, and manage student records
- **Staff Management**: Add, view, and manage staff records
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Sidebar Navigation**: Collapsible sidebar with expandable submenus

## Tech Stack

- React 18.2.0
- React Router DOM 6.20.0
- Font Awesome Icons
- CSS3 with CSS Variables

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
```

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── Header.js       # Top navigation header
│   ├── Layout.js       # Main layout wrapper
│   ├── PrivateRoute.js # Route protection
│   └── Sidebar.js      # Sidebar navigation
├── hooks/              # Custom React hooks
│   └── useResponsive.js # Responsive utilities
├── pages/              # Page components
│   ├── Dashboard.js    # Main dashboard
│   ├── Login.js        # Login page
│   ├── students/       # Student management pages
│   └── staff/          # Staff management pages
├── App.js              # Main app component with routing
├── index.js            # Entry point
├── index.css           # Global styles import
└── styles.css          # Main stylesheet
```

## Available Routes

- `/login` - Login page
- `/` - Dashboard
- `/students/add` - Add new student
- `/students/all` - All students list
- `/students/active` - Active students
- `/students/inactive` - Inactive students
- `/students/fresh` - Fresh students
- `/students/classes` - Class list
- `/students/parents` - Parents list
- `/staff/add` - Add new staff
- `/staff/all` - All staff list
- `/staff/active` - Active staff
- `/staff/new` - New staff
- `/staff/inactive` - Inactive staff
- `/staff/restriction` - Staff restrictions

## Features

### Responsive Design
- Mobile-first approach
- Sidebar collapses on mobile
- Touch-friendly interactions
- Swipe gestures for mobile sidebar

### Authentication
- Session-based authentication
- Role-based access
- Protected routes

### State Management
- LocalStorage for sidebar state
- SessionStorage for authentication
- React hooks for component state

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Private - Brainhub School Management System

