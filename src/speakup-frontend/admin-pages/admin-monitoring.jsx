import React, { useState, useEffect } from "react";
import "../../styles-admin/monitor-admin.css";
import SideBar from "./components/SideBar";
import AdminNavbar from "./components/NavBar";
import { db } from "../../firebase/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

const AdminMonitorComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [activeTab, setActiveTab] = useState("details");
  const [showModal, setShowModal] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    category: "all",
    status: "all",
    search: "",
  });

  // Form states
  const [feedback, setFeedback] = useState("");
  const [feedbackFiles, setFeedbackFiles] = useState([]);
  const [notes, setNotes] = useState("");
  const [assignTo, setAssignTo] = useState("");
  const [assignMessage, setAssignMessage] = useState("");
  const [newStatus, setNewStatus] = useState("");

  // 🔥 Fetch complaints from Firestore
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const q = query(collection(db, "complaints"), orderBy("submissionDate", "desc"));
        const snapshot = await getDocs(q);

        const fetchedComplaints = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setComplaints(fetchedComplaints);
        setFilteredComplaints(fetchedComplaints);
      } catch (error) {
        console.error("❌ Error fetching complaints:", error);
      }
    };

    fetchComplaints();
  }, []);

  // 🔎 Filtering logic
  useEffect(() => {
    let filtered = complaints;

    if (filters.category !== "all") {
      filtered = filtered.filter((c) => c.category === filters.category);
    }

    if (filters.status !== "all") {
      filtered = filtered.filter((c) => c.status === filters.status);
    }

    if (filters.search) {
      filtered = filtered.filter(
        (c) =>
          (c.id && c.id.toLowerCase().includes(filters.search.toLowerCase())) ||
          (c.category && c.category.toLowerCase().includes(filters.search.toLowerCase())) ||
          (c.college && c.college.toLowerCase().includes(filters.search.toLowerCase()))
      );
    }

    setFilteredComplaints(filtered);
  }, [filters, complaints]);

  // 📄 Modal logic
  const openModal = (complaint) => {
    setSelectedComplaint(complaint);
    setShowModal(true);
    setActiveTab("details");
    setNotes("");
    setFeedback("");
    setFeedbackFiles([]);
    setAssignTo(complaint.assignedTo || "");
    setAssignMessage("");
    setNewStatus(complaint.status || "pending");
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedComplaint(null);
    setActiveTab("details");
  };

  // 💬 Feedback & Admin actions (same as before)
  const handleAddNote = () => {
    if (!notes.trim()) {
      alert("Please enter a note");
      return;
    }

    const newNote = {
      note: notes,
      admin: "Current Admin",
      date: new Date().toISOString(),
    };

    const updated = complaints.map((c) =>
      c.id === selectedComplaint.id
        ? { ...c, adminNotes: [...(c.adminNotes || []), newNote] }
        : c
    );

    setComplaints(updated);
    setSelectedComplaint({
      ...selectedComplaint,
      adminNotes: [...(selectedComplaint.adminNotes || []), newNote],
    });
    setNotes("");
  };

  const handleSendFeedback = () => {
    if (!feedback.trim()) {
      alert("Please enter feedback");
      return;
    }

    const newFeedback = {
      feedback,
      admin: "Current Admin",
      date: new Date().toISOString(),
      files: feedbackFiles.map((f) => f.name),
    };

    const updated = complaints.map((c) =>
      c.id === selectedComplaint.id
        ? { ...c, feedbackHistory: [...(c.feedbackHistory || []), newFeedback] }
        : c
    );

    setComplaints(updated);
    setSelectedComplaint({
      ...selectedComplaint,
      feedbackHistory: [...(selectedComplaint.feedbackHistory || []), newFeedback],
    });

    setFeedback("");
    setFeedbackFiles([]);
  };

  const handleAssignComplaint = () => {
    if (!assignTo) {
      alert("Please select who to assign to");
      return;
    }

    const updated = complaints.map((c) =>
      c.id === selectedComplaint.id
        ? { ...c, assignedTo: assignTo }
        : c
    );

    setComplaints(updated);
    setSelectedComplaint({ ...selectedComplaint, assignedTo: assignTo });
  };

  const handleUpdateStatus = () => {
    if (!newStatus || newStatus === selectedComplaint.status) return;

    const updated = complaints.map((c) =>
      c.id === selectedComplaint.id ? { ...c, status: newStatus } : c
    );

    setComplaints(updated);
    setSelectedComplaint({ ...selectedComplaint, status: newStatus });
  };

  // 🧹 Utility helpers
  const formatDateTime = (date) => {
    if (!date) return "—";
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleString();
  };

  const getCategoryLabel = (category) => {
    const labels = {
      academic: "Academic",
      "faculty-conduct": "Faculty Conduct",
      facilities: "Facilities",
      "administrative-student-services": "Admin/Student Services",
      other: "Other",
    };
    return labels[category] || "—";
  };

  return (
    <div className="monitor-complaints-page">
      <SideBar />
      <AdminNavbar />

      <div className="main-content">
        <div className="page-header">
          <div>
            <h2>Monitor Student Complaints</h2>
            <p>View and manage all student complaints</p>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="filter-group">
            <label>Search:</label>
            <input
              type="text"
              placeholder="Search by ID or College..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <div className="filter-group">
            <label>Category:</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            >
              <option value="all">All</option>
              <option value="academic">Academic</option>
              <option value="faculty-conduct">Faculty Conduct</option>
              <option value="facilities">Facilities</option>
              <option value="administrative-student-services">Admin/Student Services</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Status:</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="table-container">
          <table className="complaints-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>College</th>
                <th>Category</th>
                <th>Status</th>
                <th>Date</th>
                <th>Assigned To</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-data">
                    No complaints found
                  </td>
                </tr>
              ) : (
                filteredComplaints.map((c) => (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td>{c.college || "—"}</td>
                    <td>{getCategoryLabel(c.category)}</td>
                    <td>
                      <span className={`status-badge ${c.status?.toLowerCase() || "pending"}`}>
                        {c.status || "Pending"}
                      </span>
                    </td>
                    <td>{formatDateTime(c.submissionDate)}</td>
                    <td>{c.assignedTo || "Unassigned"}</td>
                    <td>
                      <button className="btn-view" onClick={() => openModal(c)}>
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {showModal && selectedComplaint && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Complaint #{selectedComplaint.id}</h3>
                <button className="btn-close" onClick={closeModal}>
                  ×
                </button>
              </div>
              <div className="modal-body">
                <p><strong>Category:</strong> {getCategoryLabel(selectedComplaint.category)}</p>
                <p><strong>Status:</strong> {selectedComplaint.status}</p>
                <p><strong>Description:</strong></p>
                <p>
                  {selectedComplaint.concernDescription ||
                    selectedComplaint.incidentDescription ||
                    selectedComplaint.facilityDescription ||
                    selectedComplaint.otherDescription ||
                    "No description provided"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMonitorComplaints;
