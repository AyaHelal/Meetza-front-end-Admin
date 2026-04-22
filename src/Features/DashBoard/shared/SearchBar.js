import { MagnifyingGlass } from "phosphor-react";

export const SearchBar = ({ value, onChange, placeholder = "Search by position name...", className = "" }) => (
  <div className={`position-relative search-bar-wrap ${className}`}>
    <input
      type="text"
      className="form-control rounded-4 pe-5 search-input"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        fontSize: "16px",
        border: "2px solid #E9ECEF",
        paddingTop: "0.75rem",
        paddingBottom: "0.75rem",
        paddingLeft: "1rem",
        backgroundColor: "#FFFFFF",
      }}
    />
    <MagnifyingGlass
      size={20}
      weight="bold"
      className="position-absolute search-bar-icon"
      style={{
        right: 15,
        top: "50%",
        transform: "translateY(-50%)",
        color: "#000000",
      }}
    />
  </div>
);

