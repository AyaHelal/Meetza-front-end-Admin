import { MagnifyingGlass } from "phosphor-react";

export const SearchBar = ({ value, onChange, placeholder = "Search by position name..." }) => (
  <div className="position-relative" style={{ width: 260 }}>
    <input
      type="text"
      className="form-control rounded-4 ps-5 search-input"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        fontSize: "16px",
        border: "2px solid #E9ECEF",
        paddingTop: "0.75rem",
        paddingBottom: "0.75rem",
        background: "linear-gradient(to right, #0076EA, #00DC85)",
      }}
    />
    <MagnifyingGlass
      size={20}
      weight="bold"
      className="position-absolute"
      style={{
        left: 15,
        top: "50%",
        transform: "translateY(-50%)",
        color: "white",
      }}
    />
  </div>
);

