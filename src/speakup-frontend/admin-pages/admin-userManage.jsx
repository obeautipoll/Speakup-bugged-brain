import React, { useCallback, useState } from "react";
import "../../styles-admin/userManage.css";
import SideBar from "./components/SideBar";
import AdminNavbar from "./components/NavBar";
import ApprovedAccountsTable from "./components/ApprovedTable";

// --- CONSTANTS ---
const ADMIN_ROLES = {
  OSDS: "OSDS Admin",
  OSDSLow: "OSDS-low",
  KASAMA: "KASAMA", 
  DEPARTMENT: "Department",
  UNASSIGNED: "Unassigned",
};

// --- DUMMY DATA FOR FRONTEND DEMO ---
const initialPendingUsers = [
  {
    id: "usr_9876",
    email: "kasama.pres@university.edu",
    office: "KASAMA",
    status: "pending",
    assignedRole: ADMIN_ROLES.UNASSIGNED,
  },
  {
    id: "usr_6543",
    email: "hr.manager@university.edu",
    office: "Human Resources Department",
    status: "pending",
    assignedRole: ADMIN_ROLES.UNASSIGNED,
  },
  {
    id: "usr_3210",
    email: "facilities.staff@university.edu",
    office: "Facilities Office",
    status: "pending",
    assignedRole: ADMIN_ROLES.UNASSIGNED,
  },
];
// ------------------------------------

const UserManagementView = ({
  pendingUsers = initialPendingUsers,
  setPendingUsers,
  userId,
}) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionType, setActionType] = useState("");
  const [users, setUsers] = useState(pendingUsers);

  const handleRoleChange = (userId, newRole) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId ? { ...user, assignedRole: newRole } : user
      )
    );
  };

  const openConfirmModal = (user, action) => {
    setSelectedUser(user);
    setActionType(action);
    setShowConfirmModal(true);
  };

  const handleConfirmAction = useCallback(() => {
    if (!selectedUser) return;

    const action = actionType;
    const finalRole =
      action === "approve" ? selectedUser.assignedRole : "N/A (Rejected)";

    console.log(
      `Action: ${action.toUpperCase()} | User: ${selectedUser.id} | Final Status: ${action} | Assigned Role: ${finalRole} | Processed By: ${userId}`
    );

    setUsers((prevUsers) =>
      prevUsers.filter((user) => user.id !== selectedUser.id)
    );

    setShowConfirmModal(false);
    alert(
      `User ${selectedUser.email} has been ${action === "approve" ? "approved" : "rejected"}.`
    );
  }, [selectedUser, actionType, userId]);

  return (
    <div className="user-management-container">
      <SideBar />
      <AdminNavbar />

      <div className="content-area">
        <h3 className="page-title">Admin User Approvals</h3>

        <p className="page-description">
          You are currently viewing {users.length} pending account requests
          requiring action.
        </p>

        {users.length === 0 ? (
          <div className="no-pending-message">
            No pending admin account registrations. All accounts are approved or
            awaiting registration.
          </div>
        ) : (
          <div className="approval-table-wrapper">
            <table className="approval-table">
              <thead>
                <tr className="table-header-row">
                  <th className="table-header-cell">User ID</th>
                  <th className="table-header-cell">Email / Name</th>
                  <th className="table-header-cell">Organization/Office</th>
                  <th className="table-header-cell">Status</th>
                  <th className="table-header-cell role">Assigned Role</th>
                  <th className="table-header-cell actions-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="table-row">
                    <td
                      className="table-cell table-cell-id"
                      title={user.id}
                    >
                      {user.id.substring(0, 8)}...
                    </td>
                    <td className="table-cell table-cell-email">
                      {user.email || "N/A"}
                    </td>
                    <td className="table-cell">{user.office || "Unknown"}</td>
                    <td className="table-cell table-cell-status">
                      <span
                        className={`status-badge ${
                          user.status === "pending" ? "pending" : "approved"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="table-cell table-cell-role">
                      <select
                        value={user.assignedRole}
                        onChange={(e) =>
                          handleRoleChange(user.id, e.target.value)
                        }
                        className="role-dropdown"
                      >
                        <option value={ADMIN_ROLES.OSDS}>
                          OSDS Admin
                        </option>
                        <option value={ADMIN_ROLES.OSDSLow

                        }>
                          OSDS-lowlevel
                        </option>
                        <option value={ADMIN_ROLES.KASAMA}>
                          KASAMA Admin
                        </option>
                        <option value={ADMIN_ROLES.DEPARTMENT}>
                          Department Admin
                        </option>
                      </select>
                    </td>
                    <td className="table-cell table-cell-actions">
                      <div className="actions-container">
                        <button
                          onClick={() => openConfirmModal(user, "approve")}
                          className="btn btn-approve"
                        >
                          <i className="fas fa-check"></i> Approve
                        </button>
                        <button
                          onClick={() => openConfirmModal(user, "reject")}
                          className="btn btn-reject"
                        >
                          <i className="fas fa-times"></i> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

         <ApprovedAccountsTable/>
         
      </div>


     {/* <ApprovedAccountsTable/> */}

      {/* --- Confirmation Modal --- */}
      {showConfirmModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h4>
              Confirm {actionType === "approve" ? "Approval" : "Rejection"}
            </h4>
            <p>
              Are you sure you want to{" "}
              <strong>{actionType.toUpperCase()}</strong> this user?
            </p>
            <p>
              <em>{selectedUser.email}</em>
            </p>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </button>
              <button
                className={`btn btn-${actionType === "approve" ? "approve" : "reject"}`}
                onClick={handleConfirmAction}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      
           

    </div>

    
  );
};

export default UserManagementView;
