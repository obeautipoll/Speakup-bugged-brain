import React from 'react'; 
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/authContext';  // Import useAuth to get real user data
import "@fortawesome/fontawesome-free/css/all.min.css"; 
import "../../../styles/navbar.css"

const MainNavbar = () => {
    // Hooks for navigation and location tracking
    const location = useLocation();
    const navigate = useNavigate();

    // Get real user data from AuthContext
    const { currentUser, userRole } = useAuth();  // Access currentUser and userRole from AuthContext

    // Extract the part before '@' from email, or default to "Guest" if user is not logged in
    const userName = currentUser ? currentUser.displayName || currentUser.email.split('@')[0] : "Guest";
    
    // Extract initials as the part before '@' from email or fallback to "GU" for guest
    const userInitials = userName.split(' ')[0].toUpperCase(); // Use first name if available, otherwise just use the first part before '@'
    
    const unreadNotifications = 3;  // Mock count, replace with real data if available

    // --- Helper Functions ---

    // Determine the greeting based on time of day (Mock for display)
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        return "Good Evening";
    };

    // Determine the page title based on the current URL path
    const getPageTitle = (path) => {
        const normalizedPath = path.toLowerCase().replace(/^\/|\/$/g, '');
        
        switch (normalizedPath) {
            case "dashboard":
                return "Dashboard";
            case "file-complaint":
                return "File Complaint";
            case "history":
                return "Complaint History";
            case "notifications":
                return "Notifications";
            case "student/login":
            case "login":
                return "Login"; // Should typically not see the navbar here, but included for completeness
            default:
                if (normalizedPath.startsWith('history/')) {
                    return "Complaint Details"; 
                }
                return "";
        }
    };

    // Handler for the primary button click
    const handleFileComplaint = () => {
        navigate("/file-complaint"); 
    };

    // Handler for the notification bell
    const handleNotifications = () => {
        navigate("/notifications"); 
    };

    // --- Render ---
    return (
        <div className="main-navbar">
            
            {/* 1. PAGE TITLE GROUP (Greeting and Dynamic Title) */}
            <div className="page-title-group">
                <p className="welcome-greeting">{getGreeting()}, {userName}!</p> 
                <h1 className="page-title">{getPageTitle(location.pathname)}</h1>
            </div>

            {/* 2. HEADER ACTIONS (Button, Bell, User Info) */}
            <div className="header-actions">

                {/* Notification Bell/Indicator */}
                <button 
                    className="icon-button notification-bell" 
                    onClick={handleNotifications}
                    aria-label={`You have ${unreadNotifications} unread notifications`}
                >
                    <i className="fas fa-bell"></i>
                    {unreadNotifications > 0 && (
                        <span className="notification-badge">{unreadNotifications}</span>
                    )}
                </button>

                {/* Quick Action Button (Primary CTA) */}
                <button 
                    className="btn-primary" 
                    onClick={handleFileComplaint}
                >
                    <i className="fas fa-plus-circle"></i> File New Complaint
                </button>
                
                {/* User Info (Profile Pill) */}
                <div className="user-info">
                    <div className="user-details">
                        <span className="name">{userName}</span>
                        <span className="role">{userRole || ""}</span>
                    </div>
                    {/* CSS-styled initials badge */}
                    <div className="user-avatar-badge">
                        {userInitials}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MainNavbar;
