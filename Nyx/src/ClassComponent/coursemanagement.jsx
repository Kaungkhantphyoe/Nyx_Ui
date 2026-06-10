import React, { useState, useEffect } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlined";
import CourseManagementDetail from "./coursenanagementdetail";
import "../classCss/coursemanagement.css";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LayersIcon from "@mui/icons-material/Layers";

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  // Edit Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState({
    id: null,
    course_name: "",
    main_program_banner_image_url: "",
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete Confirm Modal States
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    courseId: null,
    courseName: "",
  });

  // Success Confirmation Popup States
  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    title: "",
    message: "",
  });

  const fetchCourses = async () => {
    try {
      const res = await fetch(
        "http://38.60.216.25:5000/api/coursemanagement/showtraining",
      );

      const data = await res.json();
      console.log("GET DATA:", data);

      setCourses(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      console.log("Fetch error:", err);
      setCourses([]);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Handle back to list
  const handleBackToList = () => {
    setShowDetail(false);
    setSelectedCourseId(null);
  };

  // Handle course details
  const handleCourseDetails = (courseId) => {
    console.log("View details for course:", courseId);
    setSelectedCourseId(courseId);
    setShowDetail(true);
  };

  // Handle edit click - open modal with course data
  const handleEditClick = (course) => {
    setSelectedCourse({
      id: course.id,
      course_name: course.course_name,
      main_program_banner_image_url: course.main_program_banner_image_url,
    });
    setSelectedImage(null);
    setIsModalOpen(true);
  };

  // Handle update submit with FormData (matching Postman)
  const handleUpdateSubmit = async () => {
    if (!selectedCourse.id) {
      alert("Invalid course");
      return;
    }

    setIsUpdating(true);
    const formData = new FormData();

    // Add course name if changed
    if (selectedCourse.course_name) {
      formData.append("course_name", selectedCourse.course_name);
    }

    // Add image if a new one was selected
    if (selectedImage) {
      formData.append("main_program_image", selectedImage);
    }

    try {
      const response = await fetch(
        `http://38.60.216.25:5000/api/coursemanagement/updatecourse/${selectedCourse.id}`,
        {
          method: "PUT",
          body: formData,
        },
      );

      const result = await response.json();
      console.log("Update response:", result);

      if (response.ok && result.success) {
        setIsModalOpen(false);
        fetchCourses(); // Refresh the list

        setSuccessModal({
          isOpen: true,
          title: "Course Updated Successfully",
          message: "Your changes are now available",
        });

        // Reset form
        setSelectedCourse({
          id: null,
          course_name: "",
          main_program_banner_image_url: "",
        });
        setSelectedImage(null);
      } else {
        alert(result.message || "Action failed. Could not update the course.");
      }
    } catch (err) {
      console.error("Update error:", err);
      alert("Server communication error. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteTrigger = (id, name) => {
    setDeleteConfirm({
      isOpen: true,
      courseId: id,
      courseName: name,
    });
  };

  const handleConfirmDelete = async () => {
    const id = deleteConfirm.courseId;
    try {
      const response = await fetch(
        `http://38.60.216.25:5000/api/course/deletetraining/${id}`,
        {
          method: "DELETE",
        },
      );

      if (response.ok) {
        setCourses(
          courses.filter((course) => (course.id || course._id) !== id),
        );
        setDeleteConfirm({ isOpen: false, courseId: null, courseName: "" });

        setSuccessModal({
          isOpen: true,
          title: "Course Deleted",
          message: "Your course has been removed from the list",
        });
      } else {
        alert("Action failed. Could not delete the course.");
      }
    } catch (err) {
      alert("Server communication error.", err);
    }
  };

  // If showing detail, render the detail component
  if (showDetail) {
    return (
      <div>
        <CourseManagementDetail
          courseId={selectedCourseId}
          onBack={handleBackToList}
        />
      </div>
    );
  }

  if (loading)
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        Loading courses...
      </div>
    );
  if (error)
    return (
      <div style={{ padding: "40px", color: "red", textAlign: "center" }}>
        Error: {error}
      </div>
    );

  return (
    <div className="course-page">
      <div className="course-content">
        <div className="page-header">
          <LayersIcon className="menu-icon" style={{ fontSize: "40px" }} />
          <h1>Course Management</h1>
        </div>

        <div className="course-grid">
          {courses && courses.length > 0 ? (
            courses.map((course, index) => {
              const courseId = course.id || course._id || index;
              return (
                <div className="course-card" key={course.id}>
                  <img
                    src={course.main_program_banner_image_url}
                    alt={course.course_name}
                    className="course-image"
                  />
                  <div className="card-body">
                    <div className="card-title-row">
                      <h3>{course.course_name || "No Title"}</h3>
                      <div className="action-icons">
                        <EditIcon
                          className="edit-icon"
                          onClick={() => handleEditClick(course)}
                          style={{ cursor: "pointer" }}
                        />
                        <DeleteIcon
                          className="delete-icon"
                          onClick={() =>
                            handleDeleteTrigger(courseId, course.course_name)
                          }
                          style={{ cursor: "pointer" }}
                        />
                      </div>
                    </div>
                    <button
                      className="details-btn"
                      onClick={() => handleCourseDetails(courseId)}
                    >
                      COURSE DETAILS
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <p style={{ textAlign: "center", width: "100%" }}>
              No courses available.
            </p>
          )}
        </div>
      </div>

      {/* Edit Form Modal Layout - Updated to match API */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h2>Edit Course</h2>
              <CloseIcon
                className="modal-close-icon"
                onClick={() => setIsModalOpen(false)}
                style={{ cursor: "pointer" }}
              />
            </div>
            <div className="modal-body">
              <div className="input-group">
                <label>Course Name</label>
                <input
                  type="text"
                  value={selectedCourse.course_name || ""}
                  onChange={(e) =>
                    setSelectedCourse({
                      ...selectedCourse,
                      course_name: e.target.value,
                    })
                  }
                  placeholder="Enter course name"
                />
              </div>
              <div className="input-group">
                <label>Course Image</label>
                {selectedCourse.main_program_banner_image_url &&
                  !selectedImage && (
                    <div style={{ marginBottom: "10px" }}>
                      <img
                        src={selectedCourse.main_program_banner_image_url}
                        alt="Current"
                        style={{
                          width: "100px",
                          height: "100px",
                          objectFit: "cover",
                          borderRadius: "8px",
                        }}
                      />
                      <p style={{ fontSize: "12px", color: "#666" }}>
                        Current Image
                      </p>
                    </div>
                  )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedImage(e.target.files[0])}
                />
                {selectedImage && (
                  <p
                    style={{
                      fontSize: "12px",
                      color: "green",
                      marginTop: "5px",
                    }}
                  >
                    New image selected: {selectedImage.name}
                  </p>
                )}
              </div>
              <div className="modal-actions">
                <button
                  className="modal-btn-edit"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isUpdating}
                >
                  Cancel
                </button>
                <button
                  className="modal-btn-update"
                  onClick={handleUpdateSubmit}
                  disabled={isUpdating}
                >
                  {isUpdating ? "Updating..." : "Update"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.isOpen && (
        <div className="modal-overlay">
          <div className="delete-confirm-box-new">
            <CloseIcon
              className="new-modal-close"
              onClick={() =>
                setDeleteConfirm({
                  isOpen: false,
                  courseId: null,
                  courseName: "",
                })
              }
              style={{ cursor: "pointer" }}
            />

            <div className="warning-icon-wrapper">
              <ErrorOutlineIcon className="new-warning-icon" />
            </div>

            <h2 className="new-modal-title">Delete Course?</h2>
            <p className="new-modal-msg">
              Are you sure you want to delete{" "}
              <strong>"{deleteConfirm.courseName}"</strong>? This action cannot
              be undone.
            </p>

            <div className="new-confirm-actions">
              <button
                className="new-btn-cancel"
                onClick={() =>
                  setDeleteConfirm({
                    isOpen: false,
                    courseId: null,
                    courseName: "",
                  })
                }
              >
                Cancel
              </button>
              <button className="new-btn-delete" onClick={handleConfirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Summary Feedback Dialog */}
      {successModal.isOpen && (
        <div className="modal-overlay">
          <div className="success-box">
            <div className="success-icon-wrapper">
              <CheckCircleOutlineOutlinedIcon className="success-check-icon" />
            </div>
            <h2 className="success-title">{successModal.title}</h2>
            <p className="success-msg">{successModal.message}</p>
            <button
              className="success-btn"
              onClick={() =>
                setSuccessModal({ ...successModal, isOpen: false })
              }
            >
              Great, Thank!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManagement;
