import React, { useState, useRef, useEffect } from "react";
import "./addstudent.css";
import PersonIcon from "@mui/icons-material/Person";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PaymentIcon from "@mui/icons-material/Payment";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useNavigate } from "react-router-dom";

const AddStudentForm = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    gender: "",
    phoneNumber: "",
    emailAddress: "",
    courseName: "",
    trainingLevel: "",
    paymentMethod: "",
  });

  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  // State for API data
  const [courses, setCourses] = useState([]);
  const [trainingLevels, setTrainingLevels] = useState([]);
  const [totalFee, setTotalFee] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentDetails, setSelectedPaymentDetails] = useState(null);
  const [trainingProgramId, setTrainingProgramId] = useState("");
  const [trainingLevelId, setTrainingLevelId] = useState("");
  const [paymentId, setPaymentId] = useState("");

  // Fetch courses and training levels on component mount
  useEffect(() => {
    fetchTrainingData();
    fetchPaymentData();
  }, []);

  const fetchTrainingData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "http://38.60.216.25:5000/api/course/get_training_level_and_class",
      );

      const result = await response.json();
      console.log("Training API Response:", result);

      if (result.success && result.data) {
        const courseMap = new Map();

        result.data.forEach((item) => {
          const courseName = item.course_name;
          const trainingProgramIdValue = item.training_program_id;

          const validLevels = item.levels.filter(
            (level) =>
              level.title_level !== null &&
              level.title_level !== "" &&
              level.training_level_id !== null,
          );

          if (!courseMap.has(courseName)) {
            courseMap.set(courseName, {
              training_program_id: trainingProgramIdValue,
              levels: validLevels,
            });
          }
        });

        const coursesArray = Array.from(courseMap.keys());
        setCourses(coursesArray);

        if (coursesArray.length > 0 && !formData.courseName) {
          const firstCourse = courseMap.get(coursesArray[0]);
          if (firstCourse && firstCourse.levels.length > 0) {
            setTrainingLevels(firstCourse.levels);
            setFormData((prev) => ({
              ...prev,
              courseName: coursesArray[0],
              trainingLevel: firstCourse.levels[0]?.title_level || "",
            }));
            setTrainingProgramId(firstCourse.training_program_id);
            setTrainingLevelId(firstCourse.levels[0]?.training_level_id || "");
            setTotalFee(firstCourse.levels[0]?.price || 0);
          }
        }

        window.courseDataMap = courseMap;
      }
    } catch (error) {
      console.error("Error fetching training data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPaymentData = async () => {
    try {
      const response = await fetch(
        "http://38.60.216.25:5000/api/payment/showpayment",
      );

      const result = await response.json();
      console.log("Payment API Response:", result);

      if (result.result && Array.isArray(result.result)) {
        setPaymentMethods(result.result);

        if (result.result.length > 0 && !formData.paymentMethod) {
          const firstPayment = result.result[0];
          setFormData((prev) => ({
            ...prev,
            paymentMethod: firstPayment.payment_method,
          }));
          setSelectedPaymentDetails(firstPayment);
          setPaymentId(firstPayment.id);
        }
      }
    } catch (error) {
      console.error("Error fetching payment data:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "courseName" && window.courseDataMap) {
      const selectedCourse = window.courseDataMap.get(value);
      if (selectedCourse) {
        setTrainingLevels(selectedCourse.levels);
        setFormData((prev) => ({
          ...prev,
          trainingLevel: selectedCourse.levels[0]?.title_level || "",
        }));
        setTrainingProgramId(selectedCourse.training_program_id);
        setTrainingLevelId(selectedCourse.levels[0]?.training_level_id || "");
        setTotalFee(selectedCourse.levels[0]?.price || 0);
      }
    }

    if (name === "trainingLevel") {
      const selectedLevel = trainingLevels.find(
        (level) => level.title_level === value,
      );
      if (selectedLevel) {
        setTotalFee(selectedLevel.price || 0);
        setTrainingLevelId(selectedLevel.training_level_id || "");
      }
    }

    if (name === "paymentMethod") {
      const selectedPayment = paymentMethods.find(
        (p) => p.payment_method === value,
      );
      if (selectedPayment) {
        setSelectedPaymentDetails(selectedPayment);
        setPaymentId(selectedPayment.id);
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
  };

  const handleSubmit = async () => {
    if (!formData.fullName) {
      alert("Please enter full name");
      return;
    }
    if (!formData.age) {
      alert("Please enter age");
      return;
    }
    if (!formData.gender) {
      alert("Please select gender");
      return;
    }
    if (!formData.phoneNumber) {
      alert("Please enter phone number");
      return;
    }
    if (!trainingProgramId) {
      alert("Please select a course");
      return;
    }
    if (!trainingLevelId) {
      alert("Please select training level");
      return;
    }
    if (!paymentId) {
      alert("Please select payment method");
      return;
    }
    if (!selectedFile) {
      alert("Please upload payment receipt");
      return;
    }

    const submitData = new FormData();
    submitData.append("name", formData.fullName);
    submitData.append("age", formData.age);
    submitData.append("gender", formData.gender.toLowerCase());
    submitData.append("phone", formData.phoneNumber);
    submitData.append("email", formData.emailAddress);
    submitData.append("payment_id", paymentId);
    submitData.append("training_program_id", trainingProgramId);
    submitData.append("training_level_id", trainingLevelId);
    submitData.append("payment_image", selectedFile);

    try {
      const response = await fetch(
        "http://38.60.216.25:5000/api/coursestudent/addtrainingstudent",
        {
          method: "POST",
          body: submitData,
        },
      );

      const result = await response.json();
      console.log("Response:", result);

      if (response.ok) {
        alert("Student added successfully!");
        setFormData({
          fullName: "",
          age: "",
          gender: "",
          phoneNumber: "",
          emailAddress: "",
          courseName: courses[0] || "",
          trainingLevel: trainingLevels[0]?.title_level || "",
          paymentMethod: paymentMethods[0]?.payment_method || "",
        });
        setSelectedFile(null);
        setTotalFee(trainingLevels[0]?.price || 0);
        setSelectedPaymentDetails(paymentMethods[0] || null);
        setTrainingProgramId(
          window.courseDataMap?.get(courses[0])?.training_program_id || "",
        );
        setTrainingLevelId(trainingLevels[0]?.training_level_id || "");
        setPaymentId(paymentMethods[0]?.id || "");
        navigate("/class/classstudent", { state: { refresh: true } });
      } else {
        alert(result.message || "Failed to add student");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Network error. Please try again.");
    }
  };

  return (
    <div className="form-wrapper">
      <div className="form-container">
        {/* Header with Back Button */}
        <div className="form-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowBackIcon />
          </button>
          <h2>Add New Student</h2>
        </div>

        <div className="form-content">
          {/* Left Side: Personal & Course Details */}
          <div className="left-section">
            <div className="card">
              {/* Personal Details Section */}
              <div className="section-title">
                <PersonIcon className="icon" />
                <h3>Personal Details</h3>
              </div>

              <div className="form-group">
                <label>FULL NAME</label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="e.g. Kaung"
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </div>

              <div className="row-group">
                <div className="form-group flex-2">
                  <label>AGE</label>
                  <input
                    type="text"
                    name="age"
                    placeholder="Years"
                    value={formData.age}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group flex-1">
                  <label>GENDER</label>
                  <div className="radio-group">
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="gender"
                        value="Male"
                        checked={formData.gender === "Male"}
                        onChange={handleChange}
                      />{" "}
                      Male
                    </label>
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="gender"
                        value="Female"
                        checked={formData.gender === "Female"}
                        onChange={handleChange}
                      />{" "}
                      Female
                    </label>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>PHONE NUMBER</label>
                <input
                  type="text"
                  name="phoneNumber"
                  placeholder="09 xxxxxxxxx"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>EMAIL ADDRESS</label>
                <input
                  type="email"
                  name="emailAddress"
                  placeholder="example@mail.com"
                  value={formData.emailAddress}
                  onChange={handleChange}
                />
              </div>

              {/* Course Enrollment Section */}
              <div className="section-title margin-top-lg">
                <SearchIcon className="icon" />
                <h3>Course Enrollment</h3>
              </div>
              <div className="row-group">
                <div className="form-group flex-1">
                  <label>COURSE NAME</label>
                  <select
                    name="courseName"
                    value={formData.courseName}
                    onChange={handleChange}
                  >
                    <option value="">Select Course</option>
                    {courses.map((course, index) => (
                      <option key={index} value={course}>
                        {course}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group flex-1">
                  <label>TRAINING LEVEL</label>
                  <select
                    name="trainingLevel"
                    value={formData.trainingLevel}
                    onChange={handleChange}
                  >
                    <option value="">Select Level</option>
                    {trainingLevels.map((level, index) => (
                      <option key={index} value={level.title_level}>
                        {level.title_level}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Fees & Payment */}
          <div className="right-section">
            {/* Total Fees Card */}
            <div className="card total-fees-card">
              <span className="fees-label">TOTAL FEES</span>
              <div className="fees-amount">
                {totalFee.toLocaleString()} <span className="currency">Ks</span>
              </div>
              <span className="fees-subtext">
                Standard monthly training rate
              </span>
            </div>

            {/* Payment Details Card */}
            <div className="card margin-top-md">
              <div className="section-title payment-title">
                <PaymentIcon className="icon-red" fontSize="small" />
                <h3>Payment Details</h3>
              </div>

              <div className="form-group">
                <label>PAYMENT METHOD</label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                >
                  <option value="">Select Payment Method</option>
                  {paymentMethods.map((payment) => (
                    <option key={payment.id} value={payment.payment_method}>
                      {payment.payment_method}
                    </option>
                  ))}
                </select>
              </div>

              {selectedPaymentDetails && (
                <div className="form-group">
                  <label>PAYMENT INFO</label>
                  <div className="info-box">
                    <div className="info-row">
                      <span className="info-label">Account Name</span>
                      <span className="info-value">
                        {selectedPaymentDetails.payment_name}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Account Number</span>
                      <span className="info-value text-muted">
                        {selectedPaymentDetails.payment_number}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Upload Area */}
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
              <div className="upload-zone" onClick={handleUploadClick}>
                <CloudUploadIcon className="upload-icon" />
                <span>
                  {selectedFile ? selectedFile.name : "Click to upload receipt"}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              <button
                className="btn-cancel"
                style={{
                  padding: "12px 37px",
                  border: "1px solid #cbd5e1",
                  backgroundColor: " #fff",
                  color: "#334155",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                className="btn-create"
                style={{
                  padding: "13px 100px",
                  border: "none",
                  backgroundColor: "#111e30",
                  color: "#fff",
                  borderRadius: "8px",
                  fontSize: "15px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
                onClick={handleSubmit}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddStudentForm;
