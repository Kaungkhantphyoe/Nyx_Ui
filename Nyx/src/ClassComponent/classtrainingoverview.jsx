import { useState, useEffect } from "react";
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
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import PersonAddIcon from "@mui/icons-material/PersonAddSharp";
import * as XLSX from "xlsx";
import html2canvas from "html2canvas";
import { Dialog } from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import PrintIcon from "@mui/icons-material/Print";
import CloseIcon from "@mui/icons-material/Close";

// Chart standard data
const chartData = [
  { month: "Jan", enrollment: 20 },
  { month: "Feb", enrollment: 40 },
  { month: "Mar", enrollment: 50 },
  { month: "Apr", enrollment: 40 },
  { month: "May", enrollment: 30 },
  { month: "June", enrollment: 80 },
  { month: "July", enrollment: 28 },
  { month: "Aug", enrollment: 72 },
];

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
      {change.includes("vs") ? `↗ ${change}` : change}
    </div>
  </div>
);

const formatDateToDMY = (dateStr) => {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  const [year, month, day] = parts;
  return `${day}-${month}-${year}`; // ရက်-လ-နှစ် ပုံစံ ပြောင်းလဲခြင်း
};

export default function ClassTrainingOverview() {
  const { training, GetTrainingOverview } = useGetClassOverview();

  // State များကို စနစ်တကျ တစ်ခါစီသာ ကြေညာထားပါသည်
  const [selectedTransaction, setSelectedTransaction] = useState(null); // ကလစ်နှိပ်လိုက်တဲ့ row data သိမ်းရန်
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal ဖွင့်/ပိတ် ထိန်းရန်
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  // တခြား state များအောက်တွင် ထည့်ရန်
  const [paymentMode, setPaymentMode] = useState("Local"); // Default ကို Local ဟု ထားထားပါသည်

  const itemsPerPage = 5; // တစ်မျက်နှာလျှင် Row ၅ ခု ပုံသေပြသရန်

  useEffect(() => {
    GetTrainingOverview();
  }, []);

  // Fake Mock Data (၁၂ ခု) - သပ်ရပ်အောင် ပြန်လည်ပြင်ဆင်ထားပါသည်
  const dummyTransactions = [
    {
      id: "#T-1001",
      studentName: "Msh",
      trainingName: "Badminton Pro",
      className: "Beginner Class",
      amount: "50,000Ks",
      courtFee: "50,000 ks",
      rentalFee: "0 ks",
      discount: "0 ks",
      total: "54,000 ks",
      date: "2026-05-12",
      paymentMethod: "KBZ Pay",
      proof: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=150",
      mode: "Local",
    },
    {
      id: "#T-1002",
      studentName: "Thit Sar",
      trainingName: "Futsal Pro",
      className: "Beginner Class",
      amount: "20,000Ks",
      courtFee: "20,000 ks",
      rentalFee: "4,000 ks",
      discount: "0 ks",
      total: "24,000 ks",
      date: "2026-05-12",
      paymentMethod: "KBZ Pay",
      proof: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=150",
      mode: "Local",
    },
    {
      id: "#T-1003",
      studentName: "Hein Min Aung",
      trainingName: "Tennis Pro",
      className: "Beginner Class",
      amount: "70,000Ks",
      courtFee: "70,000 ks",
      rentalFee: "0 ks",
      discount: "0 ks",
      total: "70,000 ks",
      date: "2026-05-12",
      paymentMethod: "KBZ Pay",
      proof: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=150",
      mode: "Mobile",
    },
    {
      id: "#T-1004",
      studentName: "Ma Gyi Nan",
      trainingName: "Futsal Pro",
      className: "Beginner Class",
      amount: "25,000Ks",
      courtFee: "25,000 ks",
      rentalFee: "2,000 ks",
      discount: "0 ks",
      total: "27,000 ks",
      date: "2026-05-13",
      paymentMethod: "WavePay",
      proof: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=150",
      mode: "Mobile",
    },
    {
      id: "#T-1005",
      studentName: "Zwe",
      trainingName: "Badminton Pro",
      className: "Intermediate Class",
      amount: "55,000Ks",
      courtFee: "55,000 ks",
      rentalFee: "0 ks",
      discount: "0 ks",
      total: "55,000 ks",
      date: "2026-06-13",
      paymentMethod: "KBZ Pay",
      proof: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=150",
      mode: "Local",
    },
    {
      id: "#T-1006",
      studentName: "Pwint",
      trainingName: "Tennis Pro",
      className: "Beginner Class",
      amount: "70,000Ks",
      courtFee: "70,000 ks",
      rentalFee: "0 ks",
      discount: "0 ks",
      total: "70,000 ks",
      date: "2026-07-01",
      paymentMethod: "KBZ Pay",
      proof: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=150",
      mode: "Mobile",
    },
    {
      id: "#T-1007",
      studentName: "Kyaw Zayar",
      trainingName: "Futsal Pro",
      className: "Beginner Class",
      amount: "25,000Ks",
      courtFee: "25,000 ks",
      rentalFee: "2,000 ks",
      discount: "0 ks",
      total: "27,000 ks",
      date: "2026-07-23",
      paymentMethod: "WavePay",
      proof: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=150",
      mode: "Local",
    },
    {
      id: "#T-1008",
      studentName: "Kyaw Zin",
      trainingName: "Badminton Pro",
      className: "Intermediate Class",
      amount: "55,000Ks",
      courtFee: "55,000 ks",
      rentalFee: "0 ks",
      discount: "0 ks",
      total: "55,000 ks",
      date: "2026-08-10",
      paymentMethod: "KBZ Pay",
      proof: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=150",
      mode: "Mobile",
    },
  ];

  const filteredTransactions = dummyTransactions.filter((t) => {
    if (t.mode !== paymentMode) return false;
    const matchesSearch =
      search === "" ||
      t.studentName.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase());

    if (!t.date) return matchesSearch;

    // ဒေတာအသစ်၏ format "2026-05-12" ကို တိုက်ရိုက် Date Object ပြောင်းခြင်း
    const itemDate = new Date(t.date);

    const startTarget = startDate ? new Date(startDate) : null;
    const endTarget = endDate ? new Date(endDate) : null;

    if (startTarget && itemDate < startTarget) return false;
    if (endTarget && itemDate > endTarget) return false;

    return matchesSearch;
  });
  // Excel Export Function
  const handleExportToExcel = () => {
    if (filteredTransactions.length === 0) {
      alert("Export ထုတ်ရန် ဒေတာ မရှိသေးပါ!");
      return;
    }

    const excelData = filteredTransactions.map((t) => ({
      "STUDENT ID": t.id,
      "STUDENT NAME": t.studentName,
      "TRAINING NAME": t.trainingName,
      "CLASS NAME": t.className,
      AMOUNT: t.amount,
      DATE: t.date,
      "PAYMENT METHOD": t.paymentMethod,
      "PAYMENT PROOF": t.proof,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payments");
    XLSX.writeFile(workbook, "filtered_training_payments.xlsx");
  };

  // Pagination အတွက် တွက်ချက်မှုများ
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTransactions.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const emptyRows = itemsPerPage - currentItems.length;

  // ၄။ Download (PNG) နှင့် Print ထုတ်မည့် လုပ်ဆောင်ချက် Functions များ
  const handleDownloadPNG = () => {
    const modalElement = document.getElementById("invoice-modal-content");
    if (!modalElement) return;

    html2canvas(modalElement, { useCORS: true }).then((canvas) => {
      const link = document.createElement("a");
      link.download = `Invoice_${selectedTransaction?.id || "receipt"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
  };

  const handlePrintReceipt = () => {
    window.print(); // Browser standard print စနစ်ကို ခေါ်ယူခြင်း
  };

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
          title="TOTAL STUDENTS"
          value="120 students"
          change="+5%"
          icon={<GroupsIcon sx={{ fontSize: "24px" }} />}
          iconColor="#3b82f6"
        />
        <StatCard
          title="ACTIVE TRAINING"
          value="8 active classes"
          change="Active Status"
          icon={<SchoolIcon sx={{ fontSize: "24px" }} />}
          iconColor="#6366f1"
          isCurrent={true}
        />
        <StatCard
          title="MONTHLY REVENUE"
          value="1,500,000 Ks"
          change="+10%"
          icon={<PaidIcon sx={{ fontSize: "24px" }} />}
          iconColor="#10b981"
        />
        <StatCard
          title="NEW ENROLLMENT"
          value="15 students"
          change="This week"
          icon={<PersonAddIcon sx={{ fontSize: "24px" }} />}
          iconColor="#ec4899"
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
            Enrollment Trends
          </h2>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <input
              type="date"
              style={{
                padding: "6px 12px",
                border: "1px solid #e5e7eb",
                borderRadius: "6px",
                fontSize: "14px",
              }}
            />
            <input
              type="date"
              style={{
                padding: "6px 12px",
                border: "1px solid #e5e7eb",
                borderRadius: "6px",
                fontSize: "14px",
              }}
            />
            <button
              onClick={handleExportToExcel}
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

        <ResponsiveContainer width="100%" height={260}>
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
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
              domain={[0, 100]}
              ticks={[0, 20, 40, 60, 80, 100]}
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

      {/* Recent Training Payments Table Section */}
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
            marginBottom: "14px",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <h2 style={{ fontSize: "20px", fontWeight: 700, margin: 0 }}>
            Recent Training Payments
          </h2>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="Search Name or ID..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1); // ရှာဖွေလျှင် စာမျက်နှာ ၁ သို့ ပြန်ပို့ရန်
                }}
                style={{
                  background: "#1e293b",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 36px 8px 14px",
                  fontSize: "14px",
                  outline: "none",
                  width: "190px",
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
              onClick={handleExportToExcel}
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

        {/* Date Filter Row for Table */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "8px",
            marginBottom: "16px",
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

        {/* Table Section */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #f3f4f6" }}>
                {[
                  "STUDENT ID",
                  "STUDENT NAME",
                  "TRAINING NAME",
                  "CLASS NAME",
                  "AMOUNT",
                  "DATE",
                  "PAYMENT METHOD",
                  "PAYMENT PROOF",
                  "ACTION",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      padding: "10px 12px",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#374151",
                      letterSpacing: "0.5px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentItems.map((t, i) => (
                <tr
                  key={i}
                  style={{ borderBottom: "1px solid #f3f4f6", height: "53px" }}
                >
                  <td
                    style={{
                      padding: "14px 12px",
                      fontSize: "14px",
                      color: "#374151",
                    }}
                  >
                    {t.id}
                  </td>
                  <td
                    style={{
                      padding: "14px 12px",
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#111827",
                    }}
                  >
                    {t.studentName}
                  </td>
                  <td
                    style={{
                      padding: "14px 12px",
                      fontSize: "14px",
                      color: "#6b7280",
                    }}
                  >
                    {t.trainingName}
                  </td>
                  <td
                    style={{
                      padding: "14px 12px",
                      fontSize: "14px",
                      color: "#374151",
                    }}
                  >
                    {t.className}
                  </td>
                  <td
                    style={{
                      padding: "14px 12px",
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#111827",
                    }}
                  >
                    {t.amount}
                  </td>
                  <td
                    style={{
                      padding: "14px 12px",
                      fontSize: "14px",
                      color: "#374151",
                    }}
                  >
                    {formatDateToDMY(t.date)}
                  </td>
                  <td
                    style={{
                      padding: "14px 12px",
                      fontSize: "14px",
                      color: "#374151",
                    }}
                  >
                    {t.paymentMethod}
                  </td>

                  {/* Payment Proof ကို စာသားအစား Image ပြောင်းလဲထားသည့်အပိုင်း */}
                  <td style={{ padding: "14px 12px" }}>
                    <img
                      src={t.proof}
                      alt="Proof"
                      onClick={() => {
                        setSelectedTransaction(t);
                        setIsModalOpen(true);
                      }}
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "4px",
                        objectFit: "cover",
                        cursor: "pointer",
                        border: "1px solid #e5e7eb",
                      }}
                      onError={(e) => {
                        e.target.src = "https://placehold.co/40x40?text=No+Img"; // ပုံမပွင့်ပါက Placeholder အစားထိုးရန်
                      }}
                    />
                  </td>

                  {/* View Button နှိပ်လျှင် သက်ဆိုင်ရာ Data နှင့်အတူ Modal ပွင့်မည့်အပိုင်း */}
                  <td style={{ padding: "14px 12px" }}>
                    <button
                      onClick={() => {
                        setSelectedTransaction(t);
                        setIsModalOpen(true);
                      }}
                      style={{
                        border: "1.5px solid #16a34a",
                        background: "transparent",
                        color: "#16a34a",
                        borderRadius: "6px",
                        padding: "4px 14px",
                        fontSize: "13px",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}

              {emptyRows > 0 &&
                Array.from({ length: emptyRows }).map((_, index) => (
                  <tr
                    key={`empty-${index}`}
                    style={{
                      borderBottom: "1px solid #f3f4f6",
                      height: "53px",
                    }}
                  >
                    <td
                      colSpan={9}
                      style={{
                        padding: "14px 12px",
                        color: "#9ca3af",
                        fontSize: "14px",
                        textAlign: "center",
                      }}
                    >
                      {currentItems.length === 0 && index === 0
                        ? "No data found matching filters"
                        : ""}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Receipt Dialog Modal Box */}
        <Dialog
          open={isModalOpen && Boolean(selectedTransaction)}
          onClose={() => setIsModalOpen(false)}
          maxWidth="xs"
          fullWidth
        >
          {selectedTransaction && (
            <div
              style={{
                background: "#fff",
                borderRadius: "12px",
                padding: "24px",
                position: "relative",
                fontFamily: "Inter, sans-serif",
              }}
            >
              {/* Top Right Close Button */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginBottom: "8px",
                }}
              >
                <button
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: "#6b7280",
                  }}
                >
                  <CloseIcon fontSize="small" />
                </button>
              </div>

              {/* Printable Section */}
              <div id="invoice-modal-content" style={{ padding: "10px" }}>
                <div style={{ textAlign: "center", marginBottom: "20px" }}>
                  <h1
                    style={{
                      fontSize: "20px",
                      fontWeight: 700,
                      margin: "0 0 4px 0",
                      color: "#111827",
                    }}
                  >
                    Registration Successfully!
                  </h1>
                  <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>
                    Thank you for shopping with us
                  </p>
                </div>

                <div
                  style={{
                    borderBottom: "1px dashed #e5e7eb",
                    marginBottom: "16px",
                  }}
                ></div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    fontSize: "14px",
                  }}
                >
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span style={{ color: "#6b7280", fontWeight: 500 }}>
                      REGISTRATION ID
                    </span>
                    <span style={{ fontWeight: 700, color: "#111827" }}>
                      {selectedTransaction.id || "—"}
                    </span>
                  </div>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span style={{ color: "#6b7280", fontWeight: 500 }}>
                      DATE
                    </span>
                    <span style={{ color: "#111827" }}>
                      {formatDateToDMY(selectedTransaction.date)}
                    </span>
                  </div>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span style={{ color: "#6b7280", fontWeight: 500 }}>
                      PAYMENT
                    </span>
                    <span
                      style={{ color: "#111827", textTransform: "uppercase" }}
                    >
                      {selectedTransaction.paymentMethod}
                    </span>
                  </div>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span style={{ color: "#6b7280", fontWeight: 500 }}>
                      TIME
                    </span>
                    <span style={{ color: "#111827" }}>
                      {selectedTransaction.time || "12:25 AM"}
                    </span>
                  </div>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span style={{ color: "#6b7280", fontWeight: 500 }}>
                      STUDENT NAME
                    </span>
                    <span style={{ color: "#111827", fontWeight: 500 }}>
                      {selectedTransaction.studentName}
                    </span>
                  </div>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span style={{ color: "#6b7280", fontWeight: 500 }}>
                      TRAINING NAME
                    </span>
                    <span style={{ color: "#2563eb", fontWeight: 600 }}>
                      {selectedTransaction.trainingName}
                    </span>
                  </div>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span style={{ color: "#6b7280", fontWeight: 500 }}>
                      TRAINING LEVEL
                    </span>
                    <span style={{ color: "#2563eb", fontWeight: 600 }}>
                      {selectedTransaction.className || "Beginner Class"}
                    </span>
                  </div>

                  {/* Amount Section */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: "8px",
                      paddingTop: "8px",
                      borderTop: "1px solid #f3f4f6",
                    }}
                  >
                    <span style={{ color: "#111827", fontWeight: 700 }}>
                      AMOUNT
                    </span>
                    <span
                      style={{
                        fontSize: "16px",
                        fontWeight: 700,
                        color: "#111827",
                      }}
                    >
                      {selectedTransaction.amount}
                    </span>
                  </div>

                  <div
                    style={{
                      borderBottom: "1px dashed #e5e7eb",
                      margin: "16px 0",
                    }}
                  ></div>

                  {/* Payment Proof Image Section */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                    }}
                  >
                    <span
                      style={{
                        color: "#6b7280",
                        fontWeight: 500,
                        fontSize: "12px",
                      }}
                    >
                      PAYMENT PROOF IMAGE
                    </span>
                    {selectedTransaction.proof ? (
                      <div
                        style={{
                          border: "1px solid #e5e7eb",
                          borderRadius: "6px",
                          overflow: "hidden",
                          background: "#f9fafb",
                        }}
                      >
                        <img
                          src={selectedTransaction.proof}
                          alt="View Modal Proof"
                          style={{
                            width: "100%",
                            maxHeight: "180px",
                            objectFit: "contain",
                            display: "block",
                          }}
                        />
                      </div>
                    ) : (
                      <span style={{ color: "#9ca3af" }}>—</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Actions Footer */}
              <div
                className="modal-actions-hide-on-print"
                style={{ display: "flex", gap: "8px", marginTop: "24px" }}
              >
                {/* Download Button (Icon သီးသန့်) */}
                {selectedTransaction.proof && (
                  <button
                    onClick={handleDownloadPNG}
                    style={{
                      background: "#f3f4f6",
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                      padding: "8px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    title="Download Payment Proof"
                  >
                    <FileDownloadIcon fontSize="small" />
                  </button>
                )}

                {/* Print Button (စာသားသီးသန့်) */}
                <button
                  onClick={handlePrintReceipt}
                  style={{
                    flex: 1,
                    background: "#2563eb",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    fontWeight: 600,
                    fontSize: "14px",
                    cursor: "pointer",
                  }}
                >
                  Print
                </button>

                {/* Cancel Button (စာသားသီးသန့်) */}
                <button
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    background: "#fff",
                    border: "1px solid #d1d5db",
                    color: "#4b5563",
                    borderRadius: "6px",
                    padding: "8px 16px",
                    fontWeight: 500,
                    fontSize: "14px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </Dialog>

        {/* Pagination Section */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "16px",
          }}
        >
          <span style={{ fontSize: "13px", color: "#6b7280" }}>
            Showing{" "}
            {filteredTransactions.length === 0 ? 0 : indexOfFirstItem + 1} to{" "}
            {Math.min(indexOfLastItem, filteredTransactions.length)} of{" "}
            {filteredTransactions.length} transactions
          </span>
          <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
            {/* Previous Button */}
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

            {/* Dynamic Page Buttons */}
            {Array.from({ length: totalPages }).map((_, index) => {
              const pageNum = index + 1;
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

            {/* Next Button */}
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
