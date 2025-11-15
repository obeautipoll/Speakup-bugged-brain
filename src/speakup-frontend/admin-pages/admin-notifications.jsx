import React, { useState, useEffect } from "react";
import "../../styles/styles-admin/notifs-admin.css";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import AdminSideBar from "./components/AdminSideBar";
import AdminNavBar from "./components/AdminNavBar";

const AdminNotifications = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const notifRef = collection(db, "notifications");
    const q = query(notifRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotifications(fetched);
    });

    return () => unsubscribe();
  }, []);

  const filtered =
    activeTab === "unread"
      ? notifications.filter((n) => n.read === false)
      : notifications;

  return (
    <div id="notificationsPage" className="flex">
      <AdminSideBar />
      <AdminNavBar />
      <div className="flex-1 p-6">
        <h2 className="text-2xl font-semibold mb-4 mt-4">Notifications</h2>

        <div className="tabs mb-4 flex gap-4">
          <button
            className={`tab ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            All
          </button>
          <button
            className={`tab ${activeTab === "unread" ? "active" : ""}`}
            onClick={() => setActiveTab("unread")}
          >
            Unread
          </button>
        </div>

        <div className="notification-container space-y-3 ml-[200px]">
          {filtered.length === 0 ? (
            <p className="text-gray-500">No notifications found.</p>
          ) : (
            filtered.map((notif) => (
              <div
                key={notif.id}
                className={`notification-item p-4 rounded-lg border ${
                  notif.read
                    ? "bg-gray-50 border-gray-200"
                    : "bg-orange-50 border-orange-300"
                }`}
              >
                <p className="font-medium">{notif.message}</p>
                <small className="text-gray-500">
                  {notif.createdAt?.toDate
                    ? notif.createdAt.toDate().toLocaleString()
                    : ""}
                </small>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminNotifications;
