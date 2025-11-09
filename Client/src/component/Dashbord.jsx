import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import { addUser, fetchUsers, updateUser, deleteUser } from "../api/auth";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import showToast from "./Aleart";
import { isTokenValid } from "../isTokenValid";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg"];
const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2 MB

function AdminDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [profileImage, setProfileImage] = useState("https://via.placeholder.com/40");
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    mobile: "",
    designation: "",
    courses: [],
    gender: "",
    profileImage: null,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;
  const navigate = useNavigate();

  // Token validation on mount
  useEffect(() => {
    if (!isTokenValid()) navigate("/login");
    showToast("Welcome to the Admin Dashboard!", "info");
  }, []);

  // Fetch users
  useEffect(() => {
    const fetchAndValidateUsers = async () => {
      try {
        setLoading(true);
        const response = await fetchUsers();
        if (response && response.employees) {
          const validatedUsers = await Promise.all(
            response.employees.map(async (user) => {
              const isValid = await checkImageUrl(user.profileImage);
              return { ...user, isValidProfileImage: isValid };
            })
          );
          setUsers(validatedUsers);
        } else {
          setUsers([]);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch users. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchAndValidateUsers();
  }, []);

  // Check image URL
  const checkImageUrl = async (url) => {
    if (!url) return false;
    try {
      const res = await fetch(url);
      return res.ok;
    } catch {
      return false;
    }
  };

  // Logout
  const handleLogout = () => navigate("/login");

  // Search filter
  const filteredEmployees = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  // Pagination
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredEmployees.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredEmployees.length / rowsPerPage);
  const handlePageChange = (page) => setCurrentPage(page);

  // Modal handling
  const handleAddUserClick = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    resetNewUserForm();
  };
  const resetNewUserForm = () =>
    setNewUser({
      name: "",
      email: "",
      mobile: "",
      designation: "",
      courses: [],
      gender: "",
      profileImage: null,
    });

  // Form handling
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleCourseChange = (e) => {
    const { value, checked } = e.target;
    setNewUser((prev) => ({
      ...prev,
      courses: checked
        ? [...prev.courses, value]
        : prev.courses.filter((course) => course !== value),
    }));
  };

  const handleGenderChange = (e) => setNewUser((prev) => ({ ...prev, gender: e.target.value }));

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      showToast("Only JPG, JPEG, PNG allowed.", "error");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      showToast("File size should not exceed 2 MB.", "error");
      return;
    }
    setNewUser((prev) => ({ ...prev, profileImage: file }));
  };

  // Add user
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await addUser(newUser);
      if (res.status === 409) {
        showToast(res.data.error, "error");
      } else {
        showToast("User created successfully!", "success");
        setUsers((prev) => [...prev, res.data]);
        handleCloseModal();
      }
    } catch {
      showToast("Failed to add user. Please try again.", "error");
    }
  };

  // Update user
  const handleUpdateUser = async (userId) => {
    try {
      const updatedUser = await updateUser(userId, newUser);
      setUsers((prev) =>
        prev.map((user) => (user._id === userId ? updatedUser : user))
      );
      showToast("User updated successfully!", "success");
    } catch {
      showToast("Failed to update user.", "error");
    }
  };

  // Delete user
  const openDeleteModal = (userId) => {
    setSelectedUserId(userId);
    setShowDeleteModal(true);
  };
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedUserId(null);
  };
  const confirmDeleteUser = async () => {
    if (!selectedUserId) {
      showToast("No user selected.", "error");
      return;
    }
    try {
      const res = await deleteUser(selectedUserId);
      if (res) {
        setUsers((prev) => prev.filter((user) => user._id !== selectedUserId));
        showToast("User deleted successfully.", "success");
      } else {
        showToast("Failed to delete user.", "error");
      }
    } catch {
      showToast("Failed to delete user.", "error");
    } finally {
      closeDeleteModal();
    }
  };

  return (
    <div className="dashboard-container">
      <ToastContainer />

      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-left">
          <div className="logo">Admin Dashboard</div>
        </div>
        <div className="navbar-right">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="profile-icon">
            <img src={profileImage} alt="Profile" />
          </div>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </nav>

      {/* Add User Button */}
      <div className="add-user-button-container">
        <button className="add-user-btn" onClick={handleAddUserClick}>
          Add User
        </button>
      </div>

      {/* Employee Table */}
      <div className="employee-list">
        <h2>Employees</h2>
        {loading && <p>Loading...</p>}
        {error && <p className="error-text">{error}</p>}
        {!loading && !error && (
          <>
            <table className="employee-table">
              <thead>
                <tr>
                  <th>Profile</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>Courses</th>
                  <th>Designation</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.length > 0 ? (
                  currentRows.map((user) => (
                    <tr key={user._id}>
                      <td>
                        {user.isValidProfileImage ? (
                          <img
                            src={user.profileImage}
                            alt="Profile"
                            className="profile-image"
                          />
                        ) : (
                          <div className="fallback-profile">
                            {user.name[0].toUpperCase()}
                          </div>
                        )}
                      </td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.mobile}</td>
                      <td>{Array.isArray(user.courses) ? user.courses.join(", ") : ""}</td>
                      <td>{user.designation}</td>
                      <td>
                        <button className="update-btn" onClick={() => handleUpdateUser(user._id)}>Update</button>
                        <button className="delete-btn" onClick={() => openDeleteModal(user._id)}>Delete</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center" }}>
                      No employees found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="pagination">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={page === currentPage ? "active-page" : ""}
                >
                  {page}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Add / Update Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add New User</h2>
            <form onSubmit={handleFormSubmit} className="user-form">
              <input type="text" name="name" placeholder="Name" value={newUser.name} onChange={handleInputChange} required />
              <input type="email" name="email" placeholder="Email" value={newUser.email} onChange={handleInputChange} required />
              <input type="tel" name="mobile" placeholder="Mobile" pattern="[0-9]{10}" value={newUser.mobile} onChange={handleInputChange} required />
              <div className="input-courses">
                <label>Courses</label>
                {["React", "Node", "MongoDB"].map((course) => (
                  <div key={course}>
                    <input type="checkbox" id={course} value={course} checked={newUser.courses.includes(course)} onChange={handleCourseChange} />
                    <label htmlFor={course}>{course}</label>
                  </div>
                ))}
              </div>
              <select name="designation" value={newUser.designation} onChange={handleInputChange} required>
                <option value="">Select Designation</option>
                <option value="HR">HR</option>
                <option value="Manager">Manager</option>
                <option value="Sales">Sales</option>
              </select>
              <div className="gender-section">
                <label>Gender</label>
                <div>
                  <input type="radio" id="male" name="gender" value="male" checked={newUser.gender === "male"} onChange={handleGenderChange} />
                  <label htmlFor="male">Male</label>
                </div>
                <div>
                  <input type="radio" id="female" name="gender" value="female" checked={newUser.gender === "female"} onChange={handleGenderChange} />
                  <label htmlFor="female">Female</label>
                </div>
              </div>
              <input type="file" name="profileImage" accept="image/*" onChange={handleFileChange} />
              <div className="modal-actions">
                <button type="submit" className="submit-btn">Submit</button>
                <button type="button" className="cancel-btn" onClick={handleCloseModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete this user? This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="delete-btn" onClick={confirmDeleteUser}>Confirm</button>
              <button className="cancel-btn" onClick={closeDeleteModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
