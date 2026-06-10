import React, { useState, useEffect } from "react";
import "../classCss/coursemanagementdetail.css";

// Material UI Icons
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import PersonIcon from "@mui/icons-material/Person";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";

const API_BASE = "http://38.60.216.25:5000";

// Map level data from API to editable form
const mapLevelToEditableData = (level) => {
  return {
    title_level: level.title_level || "",
    price:
      level.price !== undefined && level.price !== null
        ? String(level.price)
        : "",
    description: level.description === "-" ? "" : level.description || "",
    learning_description:
      level.learning_description === "-"
        ? ""
        : level.learning_description || "",
    main_title: level.main_title === "-" ? "" : level.main_title || "",
    title: level.title === "-" ? "" : level.title || "",
    about_title: level.about_title === "-" ? "" : level.about_title || "",
    details: level.details === "-" ? "" : level.details || "",
    instructor_name: level.instructor_name || "",
    biography: level.biography === "-" ? "" : level.biography || "",
  };
};

const isDiscountActive = (level) => {
  if (!level) return true;
  const hasDiscount =
    level.main_title && level.main_title !== "-" && level.main_title !== "";
  return hasDiscount;
};

const decodeHtmlEntities = (text) => {
  if (!text) return "";
  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  return textarea.value.replace(/\s+/g, " ").trim();
};

const parseApiError = (responseText, responseData) => {
  if (responseData?.message) return responseData.message;
  const preMatch = responseText.match(/<pre>([\s\S]*?)<\/pre>/i);
  if (preMatch?.[1]) {
    return decodeHtmlEntities(preMatch[1].replace(/<[^>]+>/g, " "));
  }
  return "";
};

const CourseManagementDetail = ({ courseId, onBack }) => {
  const [training, setTraining] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeLevel, setActiveLevel] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  // Editable fields state
  const [editableData, setEditableData] = useState({
    title_level: "",
    price: "",
    description: "",
    learning_description: "",
    main_title: "",
    title: "",
    about_title: "",
    details: "",
    instructor_name: "",
    biography: "",
  });

  // Original data for comparison
  const [originalData, setOriginalData] = useState({});

  // Image states
  const [categoryCardImage, setCategoryCardImage] = useState(null);
  const [learningImage, setLearningImage] = useState(null);
  const [learningImagePreview, setLearningImagePreview] = useState(null);
  const [coachFile, setCoachFile] = useState(null);

  // UI States
  const [isDiscountEnabled, setIsDiscountEnabled] = useState(true);
  const [isAddScheduleOpen, setIsAddScheduleOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedDayId, setSelectedDayId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isAddingSchedule, setIsAddingSchedule] = useState(false);

  // Edit Time Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editStartTime, setEditStartTime] = useState("");
  const [editEndTime, setEditEndTime] = useState("");
  const [isUpdatingTime, setIsUpdatingTime] = useState(false);
  const [currentEditSlotId, setCurrentEditSlotId] = useState(null);

  // Delete Modal States
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleteType, setDeleteType] = useState("");

  const daysList = [
    { id: 1, name: "Monday" },
    { id: 2, name: "Tuesday" },
    { id: 3, name: "Wednesday" },
    { id: 4, name: "Thursday" },
    { id: 5, name: "Friday" },
    { id: 6, name: "Saturday" },
    { id: 7, name: "Sunday" },
  ];

  const applyLevelData = (
    level,
    { resetImages = true, resetFormState = true } = {},
  ) => {
    const newData = mapLevelToEditableData(level);
    setActiveLevel(level);
    if (resetFormState) {
      setEditableData(newData);
      setOriginalData(newData);
      setIsDiscountEnabled(isDiscountActive(level));
    }
    setLearningImagePreview(level.learning_image_url || "");
    if (resetImages) {
      setCategoryCardImage(null);
      setLearningImage(null);
      setCoachFile(null);
    }
  };

  // Fetch course data by ID
  const fetchCourseData = async (
    id,
    { silent = false, preserveLevelId = null, resetFormState = !silent } = {},
  ) => {
    if (!silent) {
      setLoading(true);
    }
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/api/course/showtraining/${id}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const courseList = Array.isArray(data?.data)
        ? data.data
        : data?.data
          ? [data.data]
          : [];

      if (courseList.length > 0) {
        const courseData = courseList[0];
        setTraining(courseData);

        if (courseData.levels?.length > 0) {
          const level =
            preserveLevelId != null
              ? courseData.levels.find((item) => item.id === preserveLevelId) ||
                courseData.levels[0]
              : courseData.levels[0];
          applyLevelData(level, {
            resetImages: !silent,
            resetFormState,
          });
        } else {
          setActiveLevel(null);
        }
      } else {
        setError("No training course found for this ID");
      }
    } catch (error) {
      console.error("Error fetching course data:", error);
      setError(error.message);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchCourseData(courseId);
    } else {
      setError("Invalid course ID");
      setLoading(false);
    }
  }, [courseId]);

  const handleLevelChange = (level) => {
    applyLevelData(level, { resetImages: true, resetFormState: true });
    setSaveMessage("");
  };

  const handleDiscardChanges = () => {
    setEditableData(originalData);
    setCategoryCardImage(null);
    setLearningImage(null);
    setLearningImagePreview(activeLevel?.learning_image_url || "");
    setCoachFile(null);
    setIsDiscountEnabled(isDiscountActive(activeLevel));
    setSaveMessage("");
  };

  const getSchedulesForActiveLevel = () => {
    if (!training || !training.schedules || !activeLevel) return [];
    return training.schedules.filter(
      (schedule) => schedule.training_level_id === activeLevel.id,
    );
  };

  const handleFieldChange = (field, value) => {
    setEditableData((prev) => ({ ...prev, [field]: value }));
  };

  const hasDataChanged = () => {
    return JSON.stringify(editableData) !== JSON.stringify(originalData);
  };

  // Handle learning image upload with preview
  const handleLearningImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setLearningImagePreview(previewUrl);
      setLearningImage(file);
    }
  };

  // Save coach information separately
  const handleSaveCoachInfo = async () => {
    if (!activeLevel?.id) {
      return false;
    }

    if (
      !editableData.instructor_name &&
      !editableData.biography &&
      !coachFile
    ) {
      return true; // Nothing to update
    }

    const formData = new FormData();

    if (
      editableData.instructor_name &&
      editableData.instructor_name.trim() !== ""
    ) {
      formData.append("instructor_name", editableData.instructor_name.trim());
    }

    if (editableData.biography && editableData.biography.trim() !== "") {
      formData.append("biography", editableData.biography.trim());
    }

    if (coachFile) {
      formData.append("coach_file", coachFile);
    }

    try {
      // Try to update coach info - if endpoint doesn't exist, just log and continue
      const response = await fetch(
        `${API_BASE}/api/coursemanagement/update_coach/${activeLevel.id}`,
        {
          method: "PUT",
          body: formData,
        },
      );

      if (response.ok) {
        const data = await response.json();
        return data.success === true;
      }
      // If endpoint doesn't exist, just return true (coach info will be handled by main endpoint if columns exist)
      return true;
    } catch (err) {
      console.log(
        "Coach endpoint not available, coach info will be saved via main endpoint if supported",
      );
      return true;
    }
  };

  // Save level data
  const handleSaveLevel = async () => {
    if (!activeLevel?.id) {
      alert("No training level selected");
      return;
    }

    if (
      !hasDataChanged() &&
      !categoryCardImage &&
      !learningImage &&
      !coachFile
    ) {
      setSaveMessage("No changes to save");
      setTimeout(() => setSaveMessage(""), 2000);
      return;
    }

    setIsSaving(true);
    setSaveMessage("");
    const formData = new FormData();

    // Add all text fields including coach fields if they exist in database
    if (editableData.title_level && editableData.title_level.trim() !== "") {
      formData.append("title_level", editableData.title_level.trim());
    }

    if (editableData.price && editableData.price.trim() !== "") {
      const priceNum = Number(editableData.price);
      if (!isNaN(priceNum)) {
        formData.append("price", priceNum);
      }
    }

    if (editableData.description && editableData.description.trim() !== "") {
      formData.append("description", editableData.description.trim());
    }

    if (
      editableData.learning_description &&
      editableData.learning_description.trim() !== ""
    ) {
      formData.append(
        "learning_description",
        editableData.learning_description.trim(),
      );
    }

    // Handle discount fields
    if (isDiscountEnabled) {
      if (editableData.main_title && editableData.main_title.trim() !== "") {
        formData.append("main_title", editableData.main_title.trim());
      }
      if (editableData.title && editableData.title.trim() !== "") {
        formData.append("title", editableData.title.trim());
      }
      if (editableData.about_title && editableData.about_title.trim() !== "") {
        formData.append("about_title", editableData.about_title.trim());
      }
      if (editableData.details && editableData.details.trim() !== "") {
        formData.append("details", editableData.details.trim());
      }
    }

    // Add coach fields - they will be ignored by backend if columns don't exist
    if (
      editableData.instructor_name &&
      editableData.instructor_name.trim() !== ""
    ) {
      formData.append("instructor_name", editableData.instructor_name.trim());
    }

    if (editableData.biography && editableData.biography.trim() !== "") {
      formData.append("biography", editableData.biography.trim());
    }

    // Add images if selected
    if (categoryCardImage)
      formData.append("category_card_image", categoryCardImage);
    if (learningImage) formData.append("learning_image", learningImage);
    if (coachFile) formData.append("coach_file", coachFile);

    try {
      const response = await fetch(
        `${API_BASE}/api/coursemanagement/update_training_level_and_coach/${activeLevel.id}`,
        {
          method: "PUT",
          body: formData,
        },
      );

      const contentType = response.headers.get("content-type") || "";
      const responseText = await response.text();
      let responseData = null;

      if (contentType.includes("application/json")) {
        try {
          responseData = JSON.parse(responseText);
        } catch {
          responseData = null;
        }
      }

      if (response.ok && responseData?.success) {
        // Also try to save coach info separately if the main endpoint didn't handle it
        await handleSaveCoachInfo();

        setCategoryCardImage(null);
        setLearningImage(null);
        setCoachFile(null);
        await fetchCourseData(courseId, {
          silent: true,
          preserveLevelId: activeLevel.id,
          resetFormState: true,
        });
        setSaveMessage(
          responseData.message || "Training level saved successfully!",
        );
        setTimeout(() => setSaveMessage(""), 3000);
      } else {
        const parsedError = parseApiError(responseText, responseData);
        const errorMessage =
          parsedError || `Save failed (status ${response.status})`;
        setSaveMessage(errorMessage);
        setTimeout(() => setSaveMessage(""), 8000);
        console.error("Server error response:", responseText);
      }
    } catch (err) {
      console.error("Error saving:", err);
      setSaveMessage("Network error. Please try again.");
      setTimeout(() => setSaveMessage(""), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle image uploads
  const handleCategoryImageUpload = (file) => {
    if (file) setCategoryCardImage(file);
  };

  const handleCoachImageUpload = (file) => {
    if (file) setCoachFile(file);
  };

  const openEditModal = (slotId, currentStartTime, currentEndTime) => {
    setCurrentEditSlotId(slotId);
    setEditStartTime(currentStartTime);
    setEditEndTime(currentEndTime);
    setIsEditModalOpen(true);
  };

  const handleUpdateTime = async () => {
    if (!editStartTime || !editEndTime) {
      alert("Please enter both start and end time");
      return;
    }
    if (!currentEditSlotId) return;

    setIsUpdatingTime(true);

    const requestData = {
      start_time: editStartTime,
      end_time: editEndTime,
    };

    try {
      const response = await fetch(
        `${API_BASE}/api/course/put_training_program_time_slot/${currentEditSlotId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestData),
        },
      );

      const data = await response.json();

      if (response.ok && data.success) {
        alert("Time slot updated successfully!");
        await fetchCourseData(courseId, {
          silent: true,
          preserveLevelId: activeLevel?.id,
        });
        setIsEditModalOpen(false);
        setCurrentEditSlotId(null);
      } else {
        alert(data.message || "Failed to update time slot");
      }
    } catch (err) {
      console.error("Error updating schedule:", err);
      alert("Network error. Please try again.");
    } finally {
      setIsUpdatingTime(false);
    }
  };

  const handleAddSchedule = async () => {
    if (!selectedDay || !startTime || !endTime) {
      alert("Please fill all fields");
      return;
    }
    if (!activeLevel?.id) {
      alert("No training level selected");
      return;
    }

    setIsAddingSchedule(true);

    const requestData = {
      training_program_id: training.id,
      training_schedule_days_id: parseInt(selectedDayId),
      training_level_id: activeLevel.id,
      start_time: startTime,
      end_time: endTime,
    };

    try {
      const response = await fetch(
        `${API_BASE}/api/course/adddaytimetraining`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestData),
        },
      );

      const data = await response.json();

      if (response.ok && data.success) {
        alert("Schedule added successfully!");
        await fetchCourseData(courseId, {
          silent: true,
          preserveLevelId: activeLevel?.id,
        });
        setSelectedDay("");
        setSelectedDayId("");
        setStartTime("");
        setEndTime("");
        setIsAddScheduleOpen(false);
      } else {
        alert(data.message || "Failed to add schedule");
      }
    } catch (err) {
      console.error("Error adding schedule:", err);
      alert("Network error. Please try again.");
    } finally {
      setIsAddingSchedule(false);
    }
  };

  const openLevelDeleteModal = (levelId) => {
    setDeleteTargetId(levelId);
    setDeleteType("level");
    setIsDeleteModalOpen(true);
  };

  const openScheduleDeleteModal = (slotId) => {
    setDeleteTargetId(slotId);
    setDeleteType("schedule");
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;

    const apiUrl =
      deleteType === "level"
        ? `${API_BASE}/api/course/deletetraininglevel/${deleteTargetId}`
        : `${API_BASE}/api/course/deletetrainingschedule/${deleteTargetId}`;

    try {
      const response = await fetch(apiUrl, { method: "DELETE" });
      const contentType = response.headers.get("content-type") || "";
      let data = {};

      if (contentType.includes("application/json")) {
        data = await response.json();
      }

      if (response.ok && data.success !== false) {
        await fetchCourseData(courseId, {
          silent: true,
          preserveLevelId: deleteType === "schedule" ? activeLevel?.id : null,
        });
        alert(`${deleteType} deleted successfully!`);
      } else {
        alert(data.message || `Failed to delete ${deleteType}`);
      }
    } catch (err) {
      console.error("Deletion Error:", err);
      alert("Network error. Please try again.");
    } finally {
      setIsDeleteModalOpen(false);
      setDeleteTargetId(null);
      setDeleteType("");
    }
  };

  const formatTime = (timeValue) => {
    if (!timeValue) return "";
    const timeString = String(timeValue);
    return timeString.includes(".")
      ? timeString.split(".")[0]
      : timeString.substring(0, 8);
  };

  const activeLevelSchedules = getSchedulesForActiveLevel();

  if (loading) {
    return (
      <div className="loading-screen">
        <h2>Loading Course Data...</h2>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="loading-screen">
        <h2>Error</h2>
        <p>{error}</p>
        {onBack && (
          <button className="back-btn-detail" onClick={onBack}>
            Go Back to Courses
          </button>
        )}
      </div>
    );
  }

  if (!training) {
    return (
      <div className="loading-screen">
        <h2>No Training Course Found</h2>
        {onBack && (
          <button className="back-btn-detail" onClick={onBack}>
            Go Back to Courses
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="class-management-container">
      {/* Top Navigation Dark Bar */}
      <div className="top-dark-bar">
        {onBack && (
          <button className="back-btn" onClick={onBack}>
            <ArrowBackIosNewIcon />
          </button>
        )}
        <span className="nav-title">
          {training.course_name || "Training Course"}
        </span>
      </div>

      {/* Tabs Navigation - Level Titles */}
      <div className="tabs-navigation">
        {training.levels &&
          training.levels.map((level) => (
            <button
              key={level.id}
              className={`tab-item ${activeLevel?.id === level.id ? "active" : ""}`}
              onClick={() => handleLevelChange(level)}
            >
              {level.title_level || "Level"}
            </button>
          ))}
      </div>

      {/* Main Container Wrapper */}
      <div className="main-content-wrapper">
        <h1 className="page-main-title">
          <MenuBookOutlinedIcon className="title-icon" /> Class Management
        </h1>

        <div className="two-column-layout">
          {/* LEFT SIDE AREA */}
          <div className="left-column">
            {/* CARD 1: Training Levels Card */}
            <div className="ui-card">
              <div className="card-header space-between">
                <h3>Training Levels</h3>
                <div
                  style={{ display: "flex", gap: "10px", alignItems: "center" }}
                >
                  {saveMessage && (
                    <span
                      style={{
                        fontSize: "12px",
                        color: saveMessage.includes("success")
                          ? "green"
                          : "orange",
                      }}
                    >
                      {saveMessage}
                    </span>
                  )}
                  <button
                    className="save-level-btn"
                    onClick={handleSaveLevel}
                    disabled={isSaving}
                    style={{
                      padding: "6px 12px",
                      background: "#0D1B2A",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "12px",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <SaveIcon style={{ fontSize: "16px" }} />
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
              <div className="levels-table">
                <div className="table-row header-row">
                  <span className="col-title">Level Title</span>
                  <span className="col-desc">Description</span>
                  <span className="col-price">Price</span>
                  <span className="col-action"></span>
                </div>

                {activeLevel && (
                  <div className="table-row body-row">
                    <div className="input-box col-title">
                      <input
                        type="text"
                        value={editableData.title_level}
                        onChange={(e) =>
                          handleFieldChange("title_level", e.target.value)
                        }
                        placeholder="Enter level title"
                      />
                    </div>
                    <div className="input-box col-desc">
                      <textarea
                        value={editableData.description}
                        onChange={(e) =>
                          handleFieldChange("description", e.target.value)
                        }
                        rows="2"
                        placeholder="Enter description"
                      />
                    </div>
                    <div className="input-box col-price">
                      <input
                        type="text"
                        value={editableData.price}
                        onChange={(e) =>
                          handleFieldChange("price", e.target.value)
                        }
                        placeholder="Enter price"
                      />
                    </div>
                    <div className="action-btn-cell col-action">
                      <DeleteIcon
                        className="icon-delete"
                        onClick={() => openLevelDeleteModal(activeLevel.id)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Training Schedule Card */}
            <div className="ui-card">
              <div className="card-header space-between">
                <h3>
                  <CalendarMonthOutlinedIcon className="header-inline-icon" />
                  Training Schedule
                </h3>
                <span
                  className="add-schedule-text"
                  onClick={() => setIsAddScheduleOpen(true)}
                >
                  <AddIcon />
                  Add Schedule
                </span>
              </div>

              {activeLevelSchedules.length > 0 ? (
                activeLevelSchedules.map((schedule) => (
                  <div className="schedule-form-row" key={schedule.slot_id}>
                    <div className="form-group flex-2">
                      <label>Date Selection</label>
                      <select defaultValue={schedule.day} disabled>
                        <option>{schedule.day}</option>
                      </select>
                    </div>
                    <div className="form-group flex-1">
                      <label>START TIME</label>
                      <div className="time-input-wrapper">
                        <AccessTimeIcon className="time-icon" />
                        <input
                          type="text"
                          value={formatTime(schedule.start_time)}
                          readOnly
                        />
                      </div>
                    </div>
                    <div className="form-group flex-1">
                      <label>END TIME</label>
                      <div className="time-input-wrapper">
                        <AccessTimeIcon className="time-icon" />
                        <input
                          type="text"
                          value={formatTime(schedule.end_time)}
                          readOnly
                        />
                      </div>
                    </div>
                    <div className="schedule-row-actions">
                      <EditIcon
                        className="icon-edit"
                        onClick={() =>
                          openEditModal(
                            schedule.slot_id,
                            formatTime(schedule.start_time),
                            formatTime(schedule.end_time),
                          )
                        }
                      />
                      <DeleteIcon
                        className="icon-delete"
                        onClick={() =>
                          openScheduleDeleteModal(schedule.slot_id)
                        }
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="schedule-form-row">
                  <div className="form-group">No schedules available</div>
                </div>
              )}
            </div>

            {/* Bottom 50/50 Row Split */}
            <div className="bottom-two-cards">
              {/* Special Discount Box */}
              <div className="ui-card flex-1">
                <div className="card-header space-between">
                  <h3>Special Discount</h3>
                  <div className="header-actions">
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={isDiscountEnabled}
                        onChange={() =>
                          setIsDiscountEnabled(!isDiscountEnabled)
                        }
                      />
                      <span className="slider round"></span>
                    </label>
                    <DeleteIcon className="icon-delete" />
                  </div>
                </div>
                <div className="vertical-form">
                  <div className="form-group">
                    <label>Main Discount Title</label>
                    <input
                      type="text"
                      value={editableData.main_title}
                      onChange={(e) =>
                        handleFieldChange("main_title", e.target.value)
                      }
                      placeholder="Enter main discount title"
                      disabled={!isDiscountEnabled}
                    />
                  </div>
                  <div className="form-group">
                    <label>Title</label>
                    <input
                      type="text"
                      value={editableData.title}
                      onChange={(e) =>
                        handleFieldChange("title", e.target.value)
                      }
                      placeholder="Enter title"
                      disabled={!isDiscountEnabled}
                    />
                  </div>
                  <div className="form-group">
                    <label>About Discount</label>
                    <input
                      type="text"
                      value={editableData.about_title}
                      onChange={(e) =>
                        handleFieldChange("about_title", e.target.value)
                      }
                      placeholder="Enter about discount"
                      disabled={!isDiscountEnabled}
                    />
                  </div>
                  <div className="form-group">
                    <label>Details</label>
                    <textarea
                      value={editableData.details}
                      onChange={(e) =>
                        handleFieldChange("details", e.target.value)
                      }
                      rows="3"
                      placeholder="Enter discount details"
                      disabled={!isDiscountEnabled}
                    />
                  </div>
                </div>
              </div>

              {/* What You'll Learn Box - WITH EDITABLE IMAGE */}
              <div className="ui-card flex-1">
                <div className="card-header">
                  <h3>What You'll Learn</h3>
                  <div className="image-edit-buttons">
                    <label className="image-upload-label-small">
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={handleLearningImageChange}
                      />
                      <EditIcon fontSize="small" style={{ fontSize: "16px" }} />
                      <span>Change</span>
                    </label>
                    {learningImage && (
                      <button
                        className="image-remove-btn"
                        onClick={() => {
                          setLearningImage(null);
                          setLearningImagePreview(
                            activeLevel?.learning_image_url || "",
                          );
                        }}
                        title="Remove uploaded image"
                      >
                        <CloseIcon fontSize="small" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="learning-box-content">
                  <div className="learning-img-container">
                    <img
                      src={
                        learningImagePreview ||
                        activeLevel?.learning_image_url ||
                        "https://via.placeholder.com/200x150?text=No+Image"
                      }
                      alt="Learning"
                    />
                    <label className="image-upload-label overlay-upload">
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={handleLearningImageChange}
                      />
                      <PhotoCameraIcon />
                      <span>Upload Image</span>
                    </label>
                  </div>
                  <div className="learning-text-details">
                    <textarea
                      value={editableData.learning_description}
                      onChange={(e) =>
                        handleFieldChange(
                          "learning_description",
                          e.target.value,
                        )
                      }
                      rows="4"
                      placeholder="Enter learning description"
                      className="learning-textarea"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE AREA */}
          <div className="right-column">
            {/* Banner Court Image */}
            <div className="ui-card banner-image-card">
              <div className="banner-img-wrapper">
                <img
                  src={
                    activeLevel?.category_card_image_url ||
                    training.category_card_image_url ||
                    "https://via.placeholder.com/400x200?text=No+Image"
                  }
                  alt="Banner"
                />
                <label className="edit-image-overlay-btn">
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      if (e.target.files[0]) {
                        handleCategoryImageUpload(e.target.files[0]);
                      }
                    }}
                  />
                  <EditIcon fontSize="small" /> Edit Image
                </label>
              </div>
            </div>

            {/* Meet Your Coach Card */}
            <div className="ui-card">
              <div className="card-header">
                <h3>
                  <PersonIcon className="header-inline-icon" /> Meet Your Coach
                </h3>
              </div>
              <div className="coach-profile-form">
                <div className="coach-avatar-wrapper">
                  <img
                    src={
                      activeLevel?.coach_image_url ||
                      "https://via.placeholder.com/100x100?text=No+Image"
                    }
                    alt="Coach"
                  />
                  <label className="camera-badge">
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        if (e.target.files[0]) {
                          handleCoachImageUpload(e.target.files[0]);
                        }
                      }}
                    />
                    <PhotoCameraIcon fontSize="inherit" />
                  </label>
                </div>
                <div className="form-group">
                  <label>Coach Name</label>
                  <input
                    type="text"
                    value={editableData.instructor_name}
                    onChange={(e) =>
                      handleFieldChange("instructor_name", e.target.value)
                    }
                    placeholder="Enter coach name"
                  />
                </div>
                <div className="form-group">
                  <label>Coach Biography</label>
                  <textarea
                    value={editableData.biography}
                    onChange={(e) =>
                      handleFieldChange("biography", e.target.value)
                    }
                    rows="5"
                    placeholder="Enter coach biography"
                    className="learning-textarea"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Form Action Buttons */}
            <div className="page-action-buttons">
              <button
                className="btn-save"
                onClick={handleSaveLevel}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
              <button
                className="btn-discard"
                onClick={handleDiscardChanges}
                disabled={isSaving}
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* EDIT TIME MODAL */}
      {isEditModalOpen && (
        <div className="modal-backdrop">
          <div className="edit-modal-card">
            <div className="edit-modal-header">
              <div className="edit-icon-badge">
                <AccessTimeIcon fontSize="small" />
              </div>
              <h2>Edit Time Slot</h2>
              <CloseIcon
                className="edit-modal-close"
                onClick={() => setIsEditModalOpen(false)}
              />
            </div>
            <div className="edit-modal-body">
              <div className="edit-form-group">
                <label>START TIME</label>
                <div className="edit-time-input">
                  <AccessTimeIcon className="edit-time-icon" />
                  <input
                    type="text"
                    placeholder="8:00:00"
                    value={editStartTime}
                    onChange={(e) => setEditStartTime(e.target.value)}
                  />
                </div>
              </div>
              <div className="edit-form-group">
                <label>END TIME</label>
                <div className="edit-time-input">
                  <AccessTimeIcon className="edit-time-icon" />
                  <input
                    type="text"
                    placeholder="9:00:00"
                    value={editEndTime}
                    onChange={(e) => setEditEndTime(e.target.value)}
                  />
                </div>
              </div>
              <div className="edit-modal-actions">
                <button
                  className="edit-btn-cancel"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="edit-btn-update"
                  onClick={handleUpdateTime}
                  disabled={isUpdatingTime}
                >
                  {isUpdatingTime ? "Updating..." : "Update"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && (
        <div className="modal-backdrop">
          <div className="delete-modal-card">
            <div className="modal-icon-circle">
              <DeleteIcon className="modal-trash-icon" />
            </div>
            <h2 className="modal-title">
              Delete {deleteType === "level" ? "Level" : "Schedule"}?
            </h2>
            <p className="modal-message">
              Are you sure you want to delete this {deleteType}?
            </p>
            <div className="modal-action-buttons">
              <button
                className="btn-modal-cancel"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="btn-modal-delete"
                onClick={handleDeleteConfirm}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD SCHEDULE MODAL */}
      {isAddScheduleOpen && (
        <div className="modal-backdrop">
          <div className="schedule-modal-card">
            <div className="schedule-modal-header">
              <div className="schedule-icon-badge">
                <CalendarMonthOutlinedIcon fontSize="small" />
              </div>
              <h2>Add Training Schedule</h2>
            </div>
            <div className="schedule-modal-form">
              <div className="modal-form-group">
                <label>DATE SELECTION</label>
                <select
                  className="day-select-dropdown"
                  value={selectedDayId}
                  onChange={(e) => {
                    const dayId = e.target.value;
                    const day = daysList.find((d) => d.id === parseInt(dayId));
                    setSelectedDayId(dayId);
                    setSelectedDay(day?.name || "");
                  }}
                >
                  <option value="">Select Day</option>
                  {daysList.map((day) => (
                    <option key={day.id} value={day.id}>
                      {day.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-time-inputs-row">
                <div className="modal-form-group flex-1">
                  <label>START TIME</label>
                  <div className="modal-input-with-icon">
                    <AccessTimeIcon className="input-inner-icon" />
                    <input
                      type="text"
                      placeholder="1:00:00"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                  </div>
                </div>
                <div className="modal-form-group flex-1">
                  <label>END TIME</label>
                  <div className="modal-input-with-icon">
                    <AccessTimeIcon className="input-inner-icon" />
                    <input
                      type="text"
                      placeholder="3:00:00"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="schedule-modal-actions">
                <button
                  className="btn-schedule-cancel"
                  onClick={() => {
                    setIsAddScheduleOpen(false);
                    setSelectedDay("");
                    setSelectedDayId("");
                    setStartTime("");
                    setEndTime("");
                  }}
                >
                  Cancel
                </button>
                <button
                  className="btn-schedule-create"
                  onClick={handleAddSchedule}
                  disabled={isAddingSchedule}
                >
                  {isAddingSchedule ? "Creating..." : "Create"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManagementDetail;
