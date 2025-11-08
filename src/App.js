import { useRoutes, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/authContext";




// Styles
import "./styles/students.css";
import "./styles-admin/admin.css";


// Auth components
import Login from "./components/auth/login";
import Register from "./components/auth/register";

// Layout and page components
import Header from "./components/header";
import AdminDashboard from "./speakup-frontend/admin-pages/admin-dashboard";

// Student Pages
import FileComplaint from "./speakup-frontend/student-pages/ComplaintForm";
import Notifications from "./speakup-frontend/student-pages/Notifications";
import ComplaintHistory from "./speakup-frontend/student-pages/ComplaintHistory";
import Dashboard from "./speakup-frontend/student-pages/Dashboard";


// Admin Pages
import UserManagementView from "./speakup-frontend/admin-pages/admin-userManage";
import AdminMonitorComplaints from "./speakup-frontend/admin-pages/admin-monitoring";
import Analytics from "./speakup-frontend/admin-pages/admin-analytics";

// PrivateRoute component to handle role-based route protection
const PrivateRoute = ({ element, requiredRole }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  
  // If the user is not logged in or doesn't have the required role, redirect to login
  if (!user || user.role !== requiredRole) {
    return <Navigate to="/login" replace />;
  }

  return element;
};

// Main App component
function App() {
  // Define your routes with path-to-component mappings
  const routesArray = [
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/register",
      element: <Register />,
    },
    {
      path: "/dashboard",
      element: (
        <PrivateRoute
          element={<Dashboard />}
          requiredRole="student" // Protect the route, only accessible by students
        />
      ),
    },
    {
      path: "/file-complaint",
      element: (
        <PrivateRoute
          element={<FileComplaint />}
          requiredRole="student" // Protect the route, only accessible by students
        />
      ),
    },
    {
      path: "/notifications",
      element: (
        <PrivateRoute
          element={<Notifications />}
          requiredRole="student" // Protect the route, only accessible by students
        />
      ),
    },
    {
      path: "/history",
      element: (
        <PrivateRoute
          element={<ComplaintHistory />}
          requiredRole="student" // Protect the route, only accessible by students
        />
      ),
    },
   {
  path: "/adashboard",
  element: (
    <PrivateRoute 
      element={<AdminDashboard />}
      requiredRole="admin" // Protect the route, only accessible by admins
    />
  ),
  },
  {
    path: "/amanageusers",
    element: (
      <PrivateRoute
        element={<UserManagementView />}
        requiredRole="admin" // Protect the route, only accessible by admins
      />
    ),
  },
  {
    path: "/aanalytics",
    element: (
      <PrivateRoute
        element={<Analytics />}
        requiredRole="admin" // Protect the route, only accessible by admins
      />
    ),
  },
  {
    path: "/amonitorcomplaints",
    element: (
      <PrivateRoute
        element={<AdminMonitorComplaints />}
        requiredRole="admin" // Protect the route, only accessible by admins
      />
    ),
  },
    {
      path: "*", // Catch-all route for undefined paths
      element: <Navigate to="/dashboard" replace />, // Redirect to login page
    },
  ];

  // Using useRoutes to render the appropriate component based on the URL
  const routesElement = useRoutes(routesArray);

  return (
    <AuthProvider>
      <Header /> {/* Always show header */}
      <div className="w-full h-screen flex flex-col">
        {routesElement} {/* Render the matched route */}
      </div>
    </AuthProvider>
  );
}

export default App;
