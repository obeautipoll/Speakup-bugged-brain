import React, { useState, useEffect } from "react";
import "../../styles/styles-student/complaintHistory.css";
import { useNavigate } from "react-router-dom";
import SideBar from "./components/SideBar";
import MainNavbar from "./components/MainNavbar";
import { db, auth } from "../../firebase/firebase";
import { collection, getDocs, query, where, doc, deleteDoc } from "firebase/firestore";

const ComplaintHistory = () => {
  const navigate = useNavigate();
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load jsPDF library
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    const fetchComplaints = async () => {
      setLoading(true);
      try {
        const user = auth.currentUser;
        
        if (!user) {
          console.log("❌ No user logged in");
          setLoading(false);
          return;
        }

        console.log("🔍 Fetching complaints for user:", user.uid);

        // Fetch ALL complaints for this user
        const complaintsRef = collection(db, "complaints");
        const q = query(complaintsRef, where("userId", "==", user.uid));

        const querySnapshot = await getDocs(q);
        
        console.log("📊 === FETCH RESULTS ===");
        console.log("✅ Total complaints found:", querySnapshot.size);
        console.log("📝 Query snapshot empty?", querySnapshot.empty);
        console.log("📄 Docs array length:", querySnapshot.docs.length);

        if (querySnapshot.empty) {
          console.warn("⚠️ No complaints found for this user!");
          setComplaints([]);
          setLoading(false);
          return;
        }

        const complaintList = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          console.log(`📌 Processing complaint ID: ${doc.id}`, {
            category: data.category,
            status: data.status,
            submissionDate: data.submissionDate ? data.submissionDate.toDate().toLocaleString() : 'No date',
            userId: data.userId
          });
          
          complaintList.push({
            id: doc.id,
            ...data,
          });
        });

        console.log("📋 === BEFORE SORTING ===");
        console.log("Count:", complaintList.length);
        console.log("All IDs:", complaintList.map(c => c.id));

        // Sort complaints by submission date - most recent first
        const sortedComplaints = complaintList.sort((a, b) => {
          const dateA = a.submissionDate ? a.submissionDate.toDate() : new Date(0);
          const dateB = b.submissionDate ? b.submissionDate.toDate() : new Date(0);
          return dateB - dateA; // Descending order (newest first)
        });

        console.log("🔄 === AFTER SORTING ===");
        console.log("Count:", sortedComplaints.length);
        console.log("Sorted IDs:", sortedComplaints.map(c => c.id));
        console.log("Full sorted data:", sortedComplaints);

        setComplaints(sortedComplaints);
        
        console.log("✅ === COMPLAINTS SET TO STATE ===");
        console.log("State updated with", sortedComplaints.length, "complaints");
        
        setLoading(false);
        
      } catch (error) {
        console.error("❌ === ERROR FETCHING COMPLAINTS ===");
        console.error("Error:", error);
        console.error("Error message:", error.message);
        console.error("Error code:", error.code);
        alert("Error loading complaints: " + error.message);
        setLoading(false);
      }
    };

    // Wait for auth to be ready
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        console.log("🔐 Auth state changed - User authenticated:", user.uid);
        fetchComplaints();
      } else {
        console.log("🚫 Auth state changed - No user authenticated");
        setComplaints([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Get the description from complaint object
  const getDescription = (complaint) => {
    return (
      complaint.concernDescription ||
      complaint.otherDescription ||
      complaint.incidentDescription ||
      complaint.facilityDescription ||
      complaint.concernFeedback ||
      "No description provided"
    );
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return "—";
    try {
      return date.toDate().toLocaleDateString();
    } catch {
      return "—";
    }
  };

  // Check if complaint can be deleted based on status
  const canDelete = (status) => {
    const allowedStatuses = ["closed", "resolved", "completed", "rejected", "cancelled", "done"];
    return allowedStatuses.includes((status || "").toLowerCase());
  };

  // Delete complaint
  const handleDelete = async (complaintId) => {
    // Find the complaint to check its status
    const complaint = complaints.find(c => c.id === complaintId);
    
    if (!complaint) {
      alert("Complaint not found");
      return;
    }

    // Check if status allows deletion
    if (!canDelete(complaint.status)) {
      alert("Cannot delete complaint. Only complaints with status 'Closed', 'Resolved', 'Completed', 'Rejected', 'Cancelled', or 'Done' can be deleted.");
      return;
    }

    // Proceed with deletion if status is allowed
    if (window.confirm("Are you sure you want to delete this complaint? This action cannot be undone.")) {
      try {
        await deleteDoc(doc(db, "complaints", complaintId));
        
        setComplaints(complaints.filter(c => c.id !== complaintId));
        alert("Complaint deleted successfully");
      } catch (error) {
        console.error("Error deleting complaint:", error);
        alert("Failed to delete complaint: " + error.message);
      }
    }
  };

  // Generate PDF using jsPDF
  const generatePDF = (complaint, shouldDownload = true) => {
    try {
      const { jsPDF } = window.jspdf || {};
      
      if (!jsPDF) {
        alert('PDF library is loading. Please try again in a moment.');
        return null;
      }

      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      let yPos = margin;

      // Header
      doc.setFillColor(128, 0, 32);
      doc.rect(0, 0, pageWidth, 35, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('MSU-IIT SpeakUp', pageWidth / 2, 15, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Complaint Management System', pageWidth / 2, 25, { align: 'center' });

      // Document Title
      yPos = 50;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('COMPLAINT REPORT', pageWidth / 2, yPos, { align: 'center' });

      // Info Grid Background
      yPos = 65;
      doc.setFillColor(249, 249, 249);
      doc.rect(margin, yPos, contentWidth, 60, 'F');
      doc.setDrawColor(221, 221, 221);
      doc.rect(margin, yPos, contentWidth, 60, 'S');

      // Info Grid Content
      yPos += 10;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(128, 0, 32);

      // Left Column
      doc.text('DOCUMENT ID', margin + 5, yPos);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.text(complaint.id, margin + 5, yPos + 5);

      yPos += 15;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(128, 0, 32);
      doc.text('COMPLAINT CATEGORY', margin + 5, yPos);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.text(complaint.category || '—', margin + 5, yPos + 5);

      yPos += 15;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(128, 0, 32);
      doc.text('CURRENT STATUS', margin + 5, yPos);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.text(complaint.status || 'Pending', margin + 5, yPos + 5);

      // Right Column
      yPos = 75;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(128, 0, 32);
      doc.text('DATE GENERATED', pageWidth / 2 + 5, yPos);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.text(new Date().toLocaleDateString(), pageWidth / 2 + 5, yPos + 5);

      yPos += 15;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(128, 0, 32);
      doc.text('DATE FILED', pageWidth / 2 + 5, yPos);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.text(formatDate(complaint.submissionDate), pageWidth / 2 + 5, yPos + 5);

      yPos += 15;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(128, 0, 32);
      doc.text('DATE RESOLVED', pageWidth / 2 + 5, yPos);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.text(formatDate(complaint.dateResolved) || '—', pageWidth / 2 + 5, yPos + 5);

      // Complaint Description Section
      yPos = 135;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(128, 0, 32);
      doc.text('COMPLAINT DESCRIPTION', margin, yPos);
      
      doc.setDrawColor(128, 0, 32);
      doc.setLineWidth(0.5);
      doc.line(margin, yPos + 2, pageWidth - margin, yPos + 2);

      yPos += 10;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      
      const description = getDescription(complaint);
      const splitDescription = doc.splitTextToSize(description, contentWidth - 10);
      doc.text(splitDescription, margin + 5, yPos);

      // File info if exists
      if (complaint.file) {
        yPos += (splitDescription.length * 5) + 15;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(128, 0, 32);
        doc.text('ATTACHED DOCUMENTS', margin, yPos);
        
        doc.setDrawColor(128, 0, 32);
        doc.line(margin, yPos + 2, pageWidth - margin, yPos + 2);
        
        yPos += 8;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text(`File: ${complaint.file}`, margin + 5, yPos);
      }

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('This is an official document generated from MSU-IIT SpeakUp Complaint Management System.', pageWidth / 2, pageHeight - 20, { align: 'center' });
      doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, pageHeight - 15, { align: 'center' });

      return doc;
      
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Failed to generate PDF. Please try again.');
      return null;
    }
  };

  // Print complaint details using jsPDF
  const handlePrint = () => {
    if (!selectedComplaint) return;
    
    const doc = generatePDF(selectedComplaint, false);
    if (doc) {
      // Open PDF in new window for printing
      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const printWindow = window.open(pdfUrl);
      
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    }
  };

  // Download complaint details as PDF
  const handleDownload = () => {
    if (!selectedComplaint) return;
    
    const doc = generatePDF(selectedComplaint, true);
    if (doc) {
      doc.save(`complaint_${selectedComplaint.id}_${Date.now()}.pdf`);
    }
  };

  return (
    <div id="historyPage" className="container">
      <SideBar />

      {/* Main Content */}
      <div className="main-content">
        <MainNavbar />
        <div className="card">
          <div className="card-header">
            <div className="card-title">All Submitted Complaints</div>
          </div>

          <table className="complain-table">
            <thead>
              <tr>
                <th style={{ width: "45%" }}>Complaint</th>
                <th style={{ width: "20%" }}>Category</th>
                <th style={{ width: "15%" }}>Date Filed</th>
                <th style={{ width: "12%" }}>Status</th>
                <th style={{ width: "8%" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="empty-state">
                    Loading complaints...
                  </td>
                </tr>
              ) : complaints.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-state">
                    No complaints found
                  </td>
                </tr>
              ) : (
                complaints.map((c, index) => {
                  console.log(`🎨 Rendering row ${index + 1}:`, c.id);
                  return (
                    <tr key={c.id}>
                      {/* Complaint Description */}
                      <td className="complaint-desc">{getDescription(c)}</td>

                      {/* Category */}
                      <td>{c.category || "—"}</td>

                      {/* Date Filed */}
                      <td>{formatDate(c.submissionDate)}</td>

                      {/* Status */}
                      <td>
                        <span className={`status ${(c.status || "pending").toLowerCase()}`}>
                          {c.status || "Pending"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="action-buttons">
                          <button
                            className="icon-btn btn-view"
                            onClick={() => setSelectedComplaint(c)}
                            title="View Details"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button
                            className={`icon-btn btn-delete ${!canDelete(c.status) ? "disabled" : ""}`}
                            onClick={() => handleDelete(c.id)}
                            title={
                              canDelete(c.status)
                                ? "Delete Complaint"
                                : "Cannot delete - complaint is still active"
                            }
                            disabled={!canDelete(c.status)}
                          >
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {selectedComplaint && (
          <div className="modal" onClick={() => setSelectedComplaint(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Complaint Details</h2>
                <div className="modal-actions">
                  <button className="action-btn" onClick={handleDownload}>
                    <i className="fas fa-download"></i>
                    Download
                  </button>
                  <button className="action-btn" onClick={handlePrint}>
                    <i className="fas fa-print"></i>
                    Print
                  </button>
                  <button
                    className="close-btn"
                    onClick={() => setSelectedComplaint(null)}
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="modal-body">
                <div className="complaint-details-grid">
                  <div className="detail-item">
                    <div className="detail-label">Complaint Category</div>
                    <div className="detail-value">{selectedComplaint.category || "—"}</div>
                  </div>
                  
                  <div className="detail-item">
                    <div className="detail-label">Date Filed</div>
                    <div className="detail-value">{formatDate(selectedComplaint.submissionDate)}</div>
                  </div>
                  
                  <div className="detail-item">
                    <div className="detail-label">Complaint Status</div>
                    <div className="detail-value">
                      <span
                        className={`status ${(selectedComplaint.status || "pending").toLowerCase()}`}
                      >
                        {selectedComplaint.status || "Pending"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="detail-item">
                    <div className="detail-label">Date Resolved</div>
                    <div className="detail-value">{formatDate(selectedComplaint.dateResolved) || "—"}</div>
                  </div>
                </div>

                <div className="complaint-description">
                  <h3>Complaint Description</h3>
                  <p>{getDescription(selectedComplaint)}</p>
                </div>

                {selectedComplaint.file && (
                  <div>
                    <h3 style={{ 
                      fontSize: '13px', 
                      fontWeight: 600, 
                      color: 'var(--gray-900)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      marginBottom: '12px'
                    }}>Attached File</h3>
                    <div className="file-attachment">
                      <i className="fas fa-file-pdf file-icon"></i>
                      <div>
                        <div style={{ fontWeight: 500, color: 'var(--gray-900)' }}>
                          {selectedComplaint.file}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--gray-600)', marginTop: '4px' }}>
                          2.4 MB
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplaintHistory;