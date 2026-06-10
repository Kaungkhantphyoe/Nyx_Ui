import BoltIcon from "@mui/icons-material/Bolt";
import { NavLink, Outlet } from "react-router-dom";
import "../classCss/classoverview.css";
function ClassOverview() {
  return (
    <div className="comain">
      <div className="coswitch">
       {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "35px", fontWeight: 800, color: "#111827" }}>⚡ Services Overview</span>
        </div>
        <div style={{ display: "flex", gap: "4px",  borderRadius: "10px", padding: "4px" }}>
        </div>
      </div>

        <div className="coshwitchbtn">
          <NavLink to="classtrainingoverview">Training</NavLink>
          <NavLink to="classrentaloverview">Rental</NavLink>
          <NavLink to="classcanteenoverview">Canteen</NavLink>
        </div>
      </div>
      <div>
        <Outlet />
      </div>
    </div>                                              
  );
}
export default ClassOverview;
