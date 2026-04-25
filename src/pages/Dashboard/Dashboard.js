import React, { useState, useEffect } from "react";
import {
    User,
    UserList,
    UsersThree,
    IdentificationCard,
    VideoCamera,
    File,
    SignOut,
    List,
    CirclesFour,
    Palette,
} from "phosphor-react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Dashboard.css";
import Analysis from "../../Features/DashBoard/Analysis/Analysis.js";
import UserMainContent from "../../Features/DashBoard/User/UserMainContent";
import Position from "../../Features/DashBoard/Position/Position";
import GroupContent from "../../Features/DashBoard/GroupContent/GroupContent.js";
import Meeting from "../../Features/DashBoard/Meeting/Meeting.js";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import GroupMainContent from "../../Features/DashBoard/Group/GroupMainContent";
import GroupMembershipContent from "../../Features/DashBoard/GroupMembership/GroupMembershipContent";
import VideoDisplay from "../../Features/DashBoard/Videos/VideoDisplay";
import ResourcesPage from "../../Features/DashBoard/Resources/ResourcesPage";
import BrandingSettings from "../../Features/DashBoard/Branding/BrandingSettings";
import { useBranding } from "../../context/BrandingContext";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const UserDashboard = () => {
    const { user: currentUser, logoutUser } = useAuth();
    const { systemName, logoUrl } = useBranding();
    
    const userRole = (currentUser?.role || "").toString().trim().toLowerCase();
    const isSuperAdmin = userRole.includes("super_admin") || userRole.includes("super admin");
    const navigate = useNavigate();
    const [activeMenu, setActiveMenu] = useState("dashboard");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Close sidebar when route/content changes (e.g. on mobile after menu click)
    const handleMenuClick = (id) => {
        setActiveMenu(id);
        setSidebarOpen(false);
    };

    // Close sidebar on escape key
    useEffect(() => {
        const onEscape = (e) => {
            if (e.key === "Escape") setSidebarOpen(false);
        };
        window.addEventListener("keydown", onEscape);
        return () => window.removeEventListener("keydown", onEscape);
    }, []);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (sidebarOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [sidebarOpen]);

    // ---------- MENU ----------
    const menuItems = [
        { id: "dashboard", icon: CirclesFour, label: "Dashboard" },
        { id: "user", icon: User, label: "User" },
        { id: "position", icon: UserList, label: "Position" },
        { id: "group", icon: UsersThree, label: "Group" },
        { id: "membership", icon: IdentificationCard, label: "Group Membership" },
        { id: "content", icon: File, label: "Group Content" },
        { id: "resources", icon: File, label: "Resources" },
        { id: "meeting", icon: VideoCamera, label: "Meeting" },
        { id: "videos", icon: VideoCamera, label: "Videos" },
        ...(isSuperAdmin ? [{ id: "branding", icon: Palette, label: "Branding" }] : []),

        // { id: "likes", icon: Heart, label: "Likes" },
        // { id: "comments", icon: ChatCircleDots, label: "Comments" },
    ];

    const getMenuLabel = (id) => {
        const item = menuItems.find((m) => m.id === id);
        return item ? item.label : "";
    };

    const handleLogout = () => {
        logoutUser();
        navigate('/login', { replace: true });
    };

    return (
        <div className="dashboard-root">
            {/* Mobile menu toggle */}
            <button
                type="button"
                className="dashboard-menu-toggle"
                onClick={() => setSidebarOpen((o) => !o)}
                aria-label={sidebarOpen ? "Close menu" : "Open menu"}
                aria-expanded={sidebarOpen}
            >
                <List size={24} weight="bold" />
            </button>

            {/* Overlay when sidebar is open on small screens */}
            <div
                className={`dashboard-overlay ${sidebarOpen ? "is-open" : ""}`}
                onClick={() => setSidebarOpen(false)}
                onKeyDown={(e) => e.key === "Enter" && setSidebarOpen(false)}
                role="button"
                tabIndex={0}
                aria-label="Close menu"
            />

            {/* SIDEBAR */}
            <aside className={`dashboard-sidebar ${sidebarOpen ? "is-open" : ""}`}>
                <div className="dashboard-sidebar-logo">
                    <img src={logoUrl || "/assets/MeetzaLogo.png"} alt={systemName} style={{ maxHeight: '45px', objectFit: 'contain' }} />
                </div>

                <nav className="dashboard-sidebar-nav">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => handleMenuClick(item.id)}
                                className={`dashboard-sidebar-btn ${activeMenu === item.id ? "active" : ""}`}
                            >
                                <Icon size={24} aria-hidden />
                                <span className="fw-medium">{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                <div className="dashboard-sidebar-footer">
                    <button
                        type="button"
                        className="btn d-flex align-items-center rounded-5"
                        onClick={handleLogout}
                        aria-label="Log out"
                    >
                        <SignOut size={24} className="dashboard-sidebar-logout" />
                    </button>
                </div>
            </aside>

            {/* MAIN AREA */}
            <main className="dashboard-main">
                {activeMenu === "dashboard" && (
                    <Analysis currentUser={currentUser} />
                )}
                {activeMenu === "user" && (
                    <UserMainContent currentUser={currentUser} />
                )}
                {activeMenu === "position" && (
                    <Position />
                )}
                {activeMenu === "content" && (
                    <GroupContent />
                )}
                {activeMenu === "resources" && (
                    <ResourcesPage />
                )}
                {activeMenu === "meeting" && (
                    <Meeting />
                )}
                {activeMenu === "group" && (
                    <GroupMainContent currentUser={currentUser} />
                )}
                {activeMenu === "membership" && (
                    <GroupMembershipContent currentUser={currentUser} />
                )}
                {activeMenu === "videos" && (
                    <VideoDisplay currentUser={currentUser} />
                )}
                {activeMenu === "branding" && (
                    <BrandingSettings />
                )}

                {activeMenu !== "dashboard" && activeMenu !== "user" && activeMenu !== "position" && activeMenu !== "content" && activeMenu !== "resources" && activeMenu !== "meeting" && activeMenu !== "group" && activeMenu !== "membership" && activeMenu !== "videos" && activeMenu !== "branding" && (
                    <div className="d-flex flex-column justify-content-center align-items-center h-100 text-muted">
                        <h4 className="mb-2">{getMenuLabel(activeMenu)}</h4>
                        <p className="mb-0">Main component for {getMenuLabel(activeMenu)} goes here.</p>
                    </div>
                )}
                <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop
                    closeOnClick
                    pauseOnHover
                />
            </main>
        </div>
    );
};

export default UserDashboard;