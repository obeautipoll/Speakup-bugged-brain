import React, { useState } from "react";
import "../../styles/styles-admin/notifs-admin.css";
import StaffSideBar from './components/StaffSideBar';
import StaffNavBar from './components/StaffNavBar';



const StaffNotifications = () => {
  const [activeTab, setActiveTab] = useState("all");
  


  // Dummy notifications (you can later fetch from backend)
  const notifications = [
    {
      id: 1,
      message: "Your complaint about room air conditioning has been resolved.",
      status: "read",
      date: "Oct 12, 2025",
    },
    {
      id: 2,
      message: "Your complaint regarding Wi-Fi connection is in progress.",
      status: "unread",
      date: "Oct 14, 2025",
    },
  ];

  const filtered = activeTab === "unread"
    ? notifications.filter((n) => n.status === "unread")
    : notifications;


  return (
    <div id="notificationsPage" className="container">
      <StaffSideBar />
      <StaffNavBar />

      {/* Main Content */}
      <div className="main-content">

        {/* Tabs */}
        <div className="tabs">
          <div
            className={`tab ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            All
          </div>
          <div
            className={`tab ${activeTab === "unread" ? "active" : ""}`}
            onClick={() => setActiveTab("unread")}
          >
            Unread
          </div>
        </div>

        {/* Notification List */}
        <div className="notification-container">
          {filtered.map((notif) => (
            <div
              key={notif.id}
              className={`notification-item ${
                notif.status === "unread" ? "unread" : ""
              }`}
            >
              <p>{notif.message}</p>
              <small>{notif.date}</small>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StaffNotifications;
