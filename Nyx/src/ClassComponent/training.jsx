import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import { useGetClassOverview } from "../ClassApi";
import GroupsIcon from "@mui/icons-material/Groups3Sharp";
import SchoolIcon from "@mui/icons-material/SchoolSharp";
import PaidIcon from "@mui/icons-material/PaidSharp";
import PersonAddIcon from "@mui/icons-material/PersonAddSharp";
import * as XLSX from "xlsx";

// Clean Modern StatCard Component
const StatCard = ({ title, value, change, icon, iconColor, isCurrent }) => (
  <div
    style={{
      background: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: "12px",
      padding: "20px 24px",
      flex: 1,
      minWidth: 0,
    }}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "8px",
      }}
    >
      <span style={{ fontSize: "13px", color: "#6b7280", fontWeight: 500 }}>
        {title}
      </span>
      {isCurrent ? (
        <span
          style={{
            fontSize: "12px",
            color: "#6b7280",
            background: "#f3f4f6",
            padding: "2px 8px",
            borderRadius: "4px",
          }}
        >
          Current
        </span>
      ) : (
        <span style={{ fontSize: "20px", color: iconColor || "#3b82f6" }}>
          {icon}
        </span>
      )}
    </div>
    <div
      style={{
        fontSize: "22px",
        fontWeight: 700,
        color: "#111827",
        marginBottom: "6px",
      }}
    >
      {value}
    </div>
    <div
      style={{
        fontSize: "12px",
        color: change.includes("-") ? "#ef4444" : "#16a34a",
        fontWeight: 500,
      }}
    >
      {change.includes("vs") || change.includes("-") || change.includes("+")
        ? `↗ ${change}`
        : change}
    </div>
  </div>
);

export default function ClassTrainingOverview() {
  // Hook ထံမှ classoverview (Array တိုက်ရိုက်ကျလာမည်) ကို ယူခြင်း
  const { classoverview, loading, error } = useGetClassOverview();

  const [overviewData, setOverviewData] = useState({
    totalClass: 0,
    totalStudent: 0,
    totalTrainer: 0,
    totalEarnings: 0,
  });

  const [classes, setClasses] = useState([]);
  const [chartDataList, setChartDataList] = useState([]);

  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    // API Response သည် Array ဖြစ်သောကြောင့် Array.isArray ဖြင့် တိုက်ရိုက်စစ်ဆေးသည်
    if (classoverview && Array.isArray(classoverview)) {
      setClasses(classoverview);

      // 1. စုစုပေါင်း အတန်းအရေအတွက် (Total Classes)
      const totalClassCount = classoverview.length;

      // 2. စုစုပေါင်း ကျောင်းသားအရေအတွက် (Total Students)
      const totalStudentsCount = classoverview.reduce(
        (sum, item) => sum + (Number(item.total_students) || 0),
        0,
      );

      // 3. စုစုပေါင်း ဆရာအရေအတွက် (Unique Trainers Count)
      const uniqueTrainers = new Set(
        classoverview.map((item) => item.trainer_name).filter(Boolean),
      );
      const totalTrainersCount = uniqueTrainers.size;

      // 4. စုစုပေါင်း ဝင်ငွေ (Total Earnings)
      const totalEarningsSum = classoverview.reduce(
        (sum, item) => sum + (Number(item.fees) || 0),
        0,
      );

      // State ထဲသို့ တွက်ချက်ပြီးသား data များ ထည့်သွင်းခြင်း
      setOverviewData({
        totalClass: totalClassCount,
        totalStudent: totalStudentsCount,
        totalTrainer: totalTrainersCount,
        totalEarnings: totalEarningsSum,
      });

      // 5. Chart Data Trend အတွက် Month အလိုက် ကျောင်းသားဦးရေကို Group ဖွဲ့ပေးခြင်း (Optional)
      // သို့မဟုတ် Default ChartData အား အသုံးပြုနိုင်သည်
      setChartDataList([
        { month: "Jan", enrollment: 20 },
        { month: "Feb", enrollment: 40 },
        { month: "Mar", enrollment: 50 },
        { month: "Apr", enrollment: 45 },
        {
          month: "May",
          enrollment: totalStudentsCount > 0 ? totalStudentsCount : 30,
        },
        { month: "June", enrollment: 80 },
        { month: "July", enrollment: 28 },
        { month: "Aug", enrollment: 72 },
      ]);
    }
  }, [classoverview]);

  // Filter Table Logic
  const filteredRows = classes.filter((item) => {
    const matchesSearch =
      (item.class_id &&
        String(item.class_id).toLowerCase().includes(search.toLowerCase())) ||
      (item.class_name &&
        item.class_name.toLowerCase().includes(search.toLowerCase())) ||
      (item.trainer_name &&
        item.trainer_name.toLowerCase().includes(search.toLowerCase()));

    let matchesStart = true;
    let matchesEnd = true;
    if (startDate && item.start_date)
      matchesStart = new Date(item.start_date) >= new Date(startDate);
    if (endDate && item.end_date)
      matchesEnd = new Date(item.end_date) <= new Date(endDate);

    return matchesSearch && matchesStart && matchesEnd;
  });

  // Pagination Calculations
  const totalPages = Math.ceil(filteredRows.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRows.slice(indexOfFirstItem, indexOfLastItem);

  const exportToExcel = () => {
    if (filteredRows.length === 0) {
      alert("Export ထုတ်ရန် ဒေတာမရှိသေးပါ!");
      return;
    }
    const ws = XLSX.utils.json_to_sheet(filteredRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Class Overview");
    XLSX.writeFile(wb, "Class_Overview.xlsx");
  };

  if (loading) {
    return (
      <div style={{ padding: "24px", textAlign: "center", color: "#6b7280" }}>
        Loading Dashboard Data...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "24px", textAlign: "center", color: "#ef4444" }}>
        Error loading data!
      </div>
    );
  }

  return (
    <div
      style={{
        fontFamily: "'Segoe UI', sans-serif",
        background: "#f3f4f6",
        minHeight: "100vh",
        padding: "24px",
        color: "#111827",
      }}
    >
      {/* Stat Cards Row */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
        <StatCard
          title="TOTAL CLASSES"
          value={`${overviewData.totalClass} Classes`}
          change="+12% vs yesterday"
          icon={<SchoolIcon sx={{ fontSize: "24px" }} />}
          iconColor="#3b82f6"
        />
        <StatCard
          title="TOTAL STUDENTS"
          value={`${overviewData.totalStudent} Students`}
          change="+5% vs yesterday"
          icon={<GroupsIcon sx={{ fontSize: "24px" }} />}
          iconColor="#10b981"
        />
        <StatCard
          title="TOTAL TRAINERS"
          value={`${overviewData.totalTrainer} Trainers`}
          change="-3% vs yesterday"
          icon={<PersonAddIcon sx={{ fontSize: "24px" }} />}
          iconColor="#6366f1"
        />
        <StatCard
          title="TOTAL EARNINGS"
          value={`${overviewData.totalEarnings.toLocaleString()} Ks`}
          change="+4% vs yesterday"
          icon={<PaidIcon sx={{ fontSize: "24px" }} />}
          iconColor="#f59e0b"
        />
      </div>

      {/* Chart Section */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          padding: "24px",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2 style={{ fontSize: "20px", fontWeight: 700, margin: 0 }}>
            Class Enrollment Trends
          </h2>
          <button
            onClick={exportToExcel}
            style={{
              background: "#1e293b",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "8px 18px",
              fontWeight: 600,
              fontSize: "14px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <SaveAltIcon sx={{ fontSize: "20px" }} />
            Export
          </button>
        </div>

        <div style={{ width: "100%", height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartDataList}
              margin={{ top: 10, right: 20, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="0"
                vertical={false}
                stroke="#e5e7eb"
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  fontSize: "13px",
                }}
              />
              <Line
                type="monotone"
                dataKey="enrollment"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Classes Table Section */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          padding: "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <h2 style={{ fontSize: "20px", fontWeight: 700, margin: 0 }}>
            Recent Active Classes
          </h2>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="Search Class, Trainer..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                style={{
                  background: "#1e293b",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 36px 8px 14px",
                  fontSize: "14px",
                  outline: "none",
                  width: "210px",
                }}
              />
              <span
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#94a3b8",
                  fontSize: "14px",
                }}
              >
                🔍
              </span>
            </div>
            <button
              onClick={exportToExcel}
              style={{
                background: "#1e293b",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "8px 18px",
                fontWeight: 600,
                fontSize: "14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <SaveAltIcon sx={{ fontSize: "20px" }} />
              Export
            </button>
          </div>
        </div>

        {/* Table Dates Filters */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "16px",
            gap: "8px",
          }}
        >
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              padding: "6px 12px",
              border: "1px solid #e5e7eb",
              borderRadius: "6px",
              fontSize: "14px",
            }}
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              padding: "6px 12px",
              border: "1px solid #e5e7eb",
              borderRadius: "6px",
              fontSize: "14px",
            }}
          />
        </div>

        {/* Table Rendering */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #f3f4f6" }}>
                {[
                  "CLASS ID",
                  "CLASS NAME",
                  "TRAINER NAME",
                  "STUDENTS",
                  "FEES",
                  "START DATE",
                  "STATUS",
                ].map((header) => (
                  <th
                    key={header}
                    style={{
                      textAlign: "left",
                      padding: "10px 12px",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#374151",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      textAlign: "center",
                      padding: "24px",
                      color: "#6b7280",
                    }}
                  >
                    No matching records found.
                  </td>
                </tr>
              ) : (
                currentItems.map((item, index) => (
                  <tr
                    key={index}
                    style={{
                      borderBottom: "1px solid #f3f4f6",
                      height: "53px",
                    }}
                  >
                    <td
                      style={{
                        padding: "14px 12px",
                        fontSize: "14px",
                        color: "#374151",
                      }}
                    >
                      #CL-0{item.class_id}
                    </td>
                    <td
                      style={{
                        padding: "14px 12px",
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "#111827",
                      }}
                    >
                      {item.class_name}
                    </td>
                    <td
                      style={{
                        padding: "14px 12px",
                        fontSize: "14px",
                        color: "#6b7280",
                      }}
                    >
                      {item.trainer_name}
                    </td>
                    <td
                      style={{
                        padding: "14px 12px",
                        fontSize: "14px",
                        color: "#374151",
                      }}
                    >
                      {item.total_students || 0} Students
                    </td>
                    <td
                      style={{
                        padding: "14px 12px",
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "#111827",
                      }}
                    >
                      {(Number(item.fees) || 0).toLocaleString()} Ks
                    </td>
                    <td
                      style={{
                        padding: "14px 12px",
                        fontSize: "14px",
                        color: "#374151",
                      }}
                    >
                      {item.start_date}
                    </td>
                    <td style={{ padding: "14px 12px" }}>
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: 600,
                          padding: "4px 8px",
                          borderRadius: "6px",
                          background:
                            item.status === "Active" ? "#e6f4ea" : "#feeeea",
                          color:
                            item.status === "Active" ? "#137333" : "#c5221f",
                        }}
                      >
                        {item.status || "Active"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "16px",
            paddingTop: "12px",
            borderTop: "1px solid #f3f4f6",
          }}
        >
          <span style={{ fontSize: "14px", color: "#4b5563", fontWeight: 500 }}>
            Showing Page {currentPage} of {totalPages}
          </span>
          <div style={{ display: "flex", gap: "6px" }}>
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "6px",
                border: "1.5px solid #e5e7eb",
                background: "#fff",
                color: currentPage === 1 ? "#9ca3af" : "#374151",
                fontWeight: 600,
                fontSize: "14px",
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ‹
            </button>

            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "6px",
                    border: "1.5px solid #e5e7eb",
                    background: currentPage === pageNum ? "#1e293b" : "#fff",
                    color: currentPage === pageNum ? "#fff" : "#374151",
                    fontWeight: 600,
                    fontSize: "14px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "6px",
                border: "1.5px solid #e5e7eb",
                background: "#fff",
                color: currentPage === totalPages ? "#9ca3af" : "#374151",
                fontWeight: 600,
                fontSize: "14px",
                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
