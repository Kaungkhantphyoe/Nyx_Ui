import React, { useState } from "react";
import Swal from "sweetalert2";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AddIcon from "@mui/icons-material/Add";
import "../classCss/courseaddclass.css";

const AddClassForm = ({ courseId, onBack }) => {
  const [selectedDays, setSelectedDays] = useState("");
  const [classImage, setClassImage] = useState(null);
  const [learningImage, setLearningImage] = useState(null);
  const [coachImage, setCoachImage] = useState(null);
  const [level, setLevel] = useState("");
  const [endTime, setEndTime] = useState("");
  const [mainTitle, setMainTitle] = useState("");
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [aboutTitle, setAboutTitle] = useState("");
  const [biography, setBiography] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [learningDescription, setLearningDescription] = useState("");
  const [coachName, setCoachName] = useState("");
  const [startTime, setStartTime] = useState("");
  const [isOptionalEnabled, setIsOptionalEnabled] = useState(true);

  const toggleDay = (day) => {
    setSelectedDays(day);
  };

  const handleImageChange = (e, setImage) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  const days = {
    M: 1,
    TU: 2,
    W: 3,
    TH: 4,
    F: 5,
    SA: 6,
    SU: 7,
  };

  const BASE_URL = "http://38.60.216.25:5000";

  const handleCreate = async () => {
    // Validation
    if (!level) {
      Swal.fire({
        icon: "warning",
        title: "Missing Field",
        text: "Please enter Level Title",
      });
      return;
    }
    if (!price) {
      Swal.fire({
        icon: "warning",
        title: "Missing Field",
        text: "Please enter Price",
      });
      return;
    }
    if (!selectedDays) {
      Swal.fire({
        icon: "warning",
        title: "Missing Field",
        text: "Please select a training day",
      });
      return;
    }
    if (!startTime) {
      Swal.fire({
        icon: "warning",
        title: "Missing Field",
        text: "Please enter Start Time",
      });
      return;
    }
    if (!endTime) {
      Swal.fire({
        icon: "warning",
        title: "Missing Field",
        text: "Please enter End Time",
      });
      return;
    }
    if (!classImage) {
      Swal.fire({
        icon: "warning",
        title: "Missing Field",
        text: "Please upload a Class Image",
      });
      return;
    }
    if (!courseId) {
      Swal.fire({
        icon: "warning",
        title: "Missing Course",
        text: "Please select a course first",
      });
      return;
    }

    const formData = new FormData();

    // Files
    formData.append("category_card_image", classImage);
    if (learningImage) formData.append("learning_image", learningImage);
    if (coachImage) formData.append("coach_file", coachImage);

    // Required text fields (ALWAYS sent, NOT controlled by toggle)
    formData.append("learning_description", learningDescription || "");
    formData.append("title_level", level);
    formData.append("price", price);
    formData.append("start_time", startTime);
    formData.append("end_time", endTime);
    formData.append("instructor_name", coachName || "");
    formData.append("biography", biography || "");
    formData.append("course_id", courseId);
    formData.append("day_id", days[selectedDays]);
    formData.append("about_level", description || ""); // Description field - ALWAYS sent

    // Optional Selection fields - ONLY these 4 are controlled by toggle
    if (isOptionalEnabled) {
      // Toggle ON: Send actual values
      formData.append("main_title", mainTitle || "");
      formData.append("title", title || "");
      formData.append("details", details || "");
      formData.append("about_title", aboutTitle || "");
    } else {
      // Toggle OFF: Send "-"
      formData.append("main_title", "-");
      formData.append("title", "-");
      formData.append("details", "-");
      formData.append("about_title", "-");
    }

    console.log("=== SENDING FORM DATA ===");
    console.log("Toggle is:", isOptionalEnabled ? "ON" : "OFF");
    console.log("about_level (Description):", description);
    for (let pair of formData.entries()) {
      console.log(
        pair[0] + ":",
        pair[0].includes("image") ? "FILE" : `"${pair[1]}"`,
      );
    }

    try {
      const res = await fetch(`${BASE_URL}/api/course/trainingprogram`, {
        method: "POST",
        body: formData,
      });

      const responseText = await res.text();
      console.log("Response status:", res.status);
      console.log("Response:", responseText);

      if (res.status === 200 || res.status === 201) {
        let responseData;
        try {
          responseData = JSON.parse(responseText);
        } catch (e) {
          responseData = { success: true };
        }

        if (responseData.success) {
          Swal.fire({
            icon: "success",
            title: "Success!",
            text: "Training program created successfully!",
          }).then(() => {
            // Reset form
            setSelectedDays("");
            setClassImage(null);
            setLearningImage(null);
            setCoachImage(null);
            setLevel("");
            setEndTime("");
            setMainTitle("");
            setTitle("");
            setDetails("");
            setAboutTitle("");
            setBiography("");
            setPrice("");
            setDescription("");
            setLearningDescription("");
            setCoachName("");
            setStartTime("");
            setIsOptionalEnabled(true);
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error!",
            text: responseData.message || "Failed to create class",
          });
        }
      } else {
        if (responseText.includes("AppError")) {
          Swal.fire({
            icon: "error",
            title: "Backend Error",
            text: "Server configuration error. Please contact backend developer to fix AppError in course.controller.js line 37",
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error!",
            text: `Server error: ${res.status}`,
          });
        }
      }
    } catch (err) {
      console.error("Network error:", err);
      Swal.fire({
        icon: "error",
        title: "Network Error!",
        text: "Unable to connect to the server",
      });
    }
  };

  return (
    <div className="custom-admin-container">
      <header className="custom-header">
        <div className="custom-header-title">
          {onBack && (
            <button className="custom-back-btn" onClick={onBack}>
              <ChevronLeftIcon />
            </button>
          )}
          <span>Badminton Pro Training Center</span>
        </div>
        <div className="custom-tabs-container">
          <div className="custom-tab custom-active-tab">
            <AddIcon /> Add Class
          </div>
        </div>
      </header>

      <main className="custom-form-grid">
        {/* Left Column */}
        <div className="custom-form-column">
          <section className="custom-form-card">
            <div className="custom-section-title">Main Class Photo</div>
            <label
              className="custom-upload-box main-photo-box"
              style={{
                backgroundImage: classImage
                  ? `url(${URL.createObjectURL(classImage)})`
                  : "none",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e, setClassImage)}
                hidden
              />
              {!classImage && (
                <>
                  <PhotoCameraIcon className="custom-upload-icon-mui" />
                  <p className="custom-upload-text">Upload Class Image</p>
                </>
              )}
            </label>
          </section>

          <section className="custom-form-card">
            <div className="custom-section-title">Training Levels</div>
            <div className="custom-input-row">
              <div className="custom-input-group">
                <label>Level Title</label>
                <input
                  type="text"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                />
              </div>
              <div className="custom-input-group">
                <label>Price</label>
                <input
                  type="text"
                  placeholder="50,000 MMk"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
            </div>
            <div className="custom-input-group custom-mt-3">
              <label>Description</label>
              <textarea
                placeholder="Establish a strong foundation with core footwork, grip techniques, and basic stroke play designed for new players entering the competitive arena."
                rows="4"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </section>

          <section className="custom-form-card">
            <div className="custom-section-title">Training Schedule</div>
            <div className="custom-schedule-row">
              <span className="custom-days-label">Days:</span>
              <div>
                {["M", "TU", "W", "TH", "F", "SA", "SU"].map((day, idx) => {
                  const dayNames = [
                    "MON",
                    "TUE",
                    "WED",
                    "THU",
                    "FRI",
                    "SAT",
                    "SUN",
                  ];
                  const isSelected = selectedDays === day;
                  return (
                    <div key={idx} className="custom-day-item">
                      <button
                        type="button"
                        className={`custom-day-btn ${isSelected ? "custom-day-selected" : ""}`}
                        onClick={() => toggleDay(day)}
                      >
                        {day}
                      </button>
                      <span className="custom-days-subtext">
                        {dayNames[idx]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="custom-input-row custom-mt-3">
              <div className="custom-input-group">
                <label>Start Time</label>
                <div className="custom-icon--input-wrapper">
                  <input
                    type="text"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                  <AccessTimeIcon className="custom-input-icon-mui" />
                </div>
              </div>
              <div className="custom-input-group">
                <label>End Time</label>
                <div className="custom-icon--input-wrapper">
                  <input
                    type="text"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                  <AccessTimeIcon className="custom-input-icon-mui" />
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="custom-form-column">
          <section className="custom-form-card">
            <div className="custom-section-title">What You'll Learn</div>
            <div className="custom-flex-row">
              <label
                className="custom-upload-box small-photo-box"
                style={{
                  backgroundImage: learningImage
                    ? `url(${URL.createObjectURL(learningImage)})`
                    : "none",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, setLearningImage)}
                  hidden
                />
                {!learningImage && (
                  <>
                    <PhotoCameraIcon className="custom-upload-icon-small-mui" />
                    <span className="custom-small-upload-text">
                      Upload Asset
                    </span>
                  </>
                )}
              </label>
              <div className="custom-input-group custom-flex-1">
                <label>Learning Description</label>
                <textarea
                  placeholder="Outline the key curriculum milestones and student outcomes..."
                  rows="4"
                  value={learningDescription}
                  onChange={(e) => setLearningDescription(e.target.value)}
                />
              </div>
            </div>
          </section>

          <section className="custom-form-card">
            <div className="custom-section-title">Meet Your Coach</div>
            <div className="custom-flex-row">
              <label
                className="custom-upload-box small-photo-box coach-box"
                style={{
                  backgroundImage: coachImage
                    ? `url(${URL.createObjectURL(coachImage)})`
                    : "none",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, setCoachImage)}
                  hidden
                />
                {!coachImage && (
                  <>
                    <PhotoCameraIcon className="custom-upload-icon-small-mui" />
                    <span className="custom-small-upload-text">
                      Upload Coach Asset
                    </span>
                  </>
                )}
              </label>
              <div className="custom-flex-1">
                <div className="custom-input-group">
                  <label>Coach Name</label>
                  <input
                    type="text"
                    value={coachName}
                    onChange={(e) => setCoachName(e.target.value)}
                  />
                </div>
                <div className="custom-input-group custom-mt-2">
                  <label>Biography</label>
                  <textarea
                    placeholder="Describe the instructor's background and experience..."
                    rows="3"
                    value={biography}
                    onChange={(e) => setBiography(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="custom-form-card">
            <div className="custom-toggle-header">
              <div className="custom-section-title">Optional Selection</div>
              <label className="custom-switch">
                <input
                  type="checkbox"
                  checked={isOptionalEnabled}
                  onChange={(e) => setIsOptionalEnabled(e.target.checked)}
                />
                <span className="custom-slider"></span>
              </label>
            </div>
            <div className="custom-input-group custom-mt-2">
              <label>Main Title</label>
              <input
                type="text"
                placeholder="Exclusive Opening Offer"
                value={mainTitle}
                onChange={(e) => setMainTitle(e.target.value)}
                disabled={!isOptionalEnabled}
                style={{ opacity: !isOptionalEnabled ? 0.6 : 1 }}
              />
            </div>
            <div className="custom-input-row custom-mt-2">
              <div className="custom-input-group">
                <label>Title</label>
                <input
                  type="text"
                  placeholder="Early Bird Special"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={!isOptionalEnabled}
                  style={{ opacity: !isOptionalEnabled ? 0.6 : 1 }}
                />
              </div>
              <div className="custom-input-group">
                <label>Details</label>
                <textarea
                  placeholder="Get a massive 50% discount on your first month's registration!&#10;&#10;Limited to the first 20 applicants this season. Don't miss out on this opportunity."
                  rows="3"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  disabled={!isOptionalEnabled}
                  style={{ opacity: !isOptionalEnabled ? 0.6 : 1 }}
                />
              </div>
            </div>
            <div className="custom-input-group custom-mt-2 custom-half-width">
              <label>About Title</label>
              <input
                type="text"
                placeholder="50% off"
                value={aboutTitle}
                onChange={(e) => setAboutTitle(e.target.value)}
                disabled={!isOptionalEnabled}
                style={{ opacity: !isOptionalEnabled ? 0.6 : 1 }}
              />
            </div>
          </section>
        </div>
      </main>

      <footer className="custom-form-footer">
        {onBack && (
          <button className="custom-btn-cancel" onClick={onBack}>
            Cancel
          </button>
        )}
        <button className="custom-btn-create" onClick={handleCreate}>
          Create
        </button>
      </footer>
    </div>
  );
};

export default AddClassForm;
