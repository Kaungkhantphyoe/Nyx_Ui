import React, { useEffect, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CloseIcon from "@mui/icons-material/Close";
import ListAltIcon from "@mui/icons-material/ListAlt";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import LogoutIcon from "@mui/icons-material/Logout";
import "../classCss/course.css";
import { Outlet, useNavigate } from "react-router-dom";

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [courseName, setCourseName] = useState("");
  const [image, setImage] = useState(null);

  const navigate = useNavigate();

  const fetchCourses = async () => {
    try {
      const res = await fetch(
        "http://38.60.216.25:5000/api/coursemanagement/showtraining",
      );
      const data = await res.json();
      setCourses(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      console.log("Fetch error:", err);
      setCourses([]);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleAddCourse = async () => {
    if (!courseName || !image) {
      alert("Fill all fields");
      return;
    }

    const formData = new FormData();
    formData.append("course_name", courseName);
    formData.append("main_program_image", image);

    try {
      const res = await fetch(
        "http://38.60.216.25:5000/api/coursemanagement/addcourse",
        {
          method: "POST",
          body: formData,
        },
      );

      const text = await res.text();
      try {
        JSON.parse(text);
        fetchCourses();
        setShowModal(false);
        setCourseName("");
        setImage(null);
        setShowSuccessModal(true);
      } catch (e) {
        console.log("Backend not JSON:", e);
      }
    } catch (err) {
      console.log("Add error:", err);
    }
  };

  return (
    <div className="dashboard-container">
      {/* 1. SIDEBAR NAVIGATION */}

      {/* 2. MAIN CONTENT AREA */}
      <main className="main-content">
        {/* HEADER SECTION */}
        <header className="content-header">
          <h1 className="page-title">
            <ListAltIcon className="title-icon" /> Courses
          </h1>
          <button className="add-course-btn" onClick={() => setShowModal(true)}>
            <AddIcon /> Add Course
          </button>
        </header>

        {/* COURSES GRID CARD LIST */}
        <div className="courses-grid">
          {courses.map((c) => (
            <div key={c.id} className="course-card">
              <img
                src={c.main_program_banner_image_url}
                alt={c.course_name || "Course Banner"}
                className="course-banner-img"
                onClick={() =>
                  navigate("add_courseclass", { state: { courseId: c.id } })
                }
              />
            </div>
          ))}
        </div>
      </main>
      <Outlet />
      {/* CREATE COURSE MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3>Create New Course</h3>
              <CloseIcon
                className="close-icon"
                onClick={() => setShowModal(false)}
              />
            </div>
            <div className="modal-body">
              <div className="input-group">
                <label>COURSE NAME</label>
                <input
                  className="cona"
                  type="text"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label>CATEGORY CARD THUMBNAIL</label>
                <div className="upload-box">
                  <input
                    type="file"
                    id="file-upload"
                    style={{ display: "none" }}
                    onChange={(e) => setImage(e.target.files[0])}
                  />

                  <label htmlFor="file-upload" className="upload-label">
                    <PhotoCameraIcon className="camera-icon" />
                    <span>{image ? image.name : "Upload Course Image"}</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-cancel"
                style={{
                  padding: "10px 25px",
                  border: "1px solid #cbd5e1",
                  backgroundColor: "white",
                  color: "#334155",
                  borderRadius: "6px",
                  fontSize: "15px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn-create"
                style={{
                  padding: "10px 35px",
                  border: "none",
                  backgroundColor: "#111e30",
                  color: "#fff",
                  borderRadius: "6px",
                  fontSize: "15px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
                onClick={handleAddCourse}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="success-modal-box">
            <div className="success-icon-wrapper">
              <CheckCircleOutlineIcon className="success-icon" />
            </div>
            <h3>Course Added to List</h3>
            <p>Your new course is now available</p>
            <button
              className="success-btn"
              onClick={() => setShowSuccessModal(false)}
            >
              Great,Thank!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;
