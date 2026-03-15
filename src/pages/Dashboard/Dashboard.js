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
} from "phosphor-react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Dashboard.css";
import UserMainContent from "../../components/DashBoard/User/UserMainContent";
import Position from "../../components/DashBoard/Position/Position";
import GroupContent from "../../components/DashBoard/GroupContent/GroupContent.js";
import Meeting from "../../components/DashBoard/Meeting/Meeting.js";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import GroupMainContent from "../../components/DashBoard/Group/GroupMainContent";
import GroupMembershipContent from "../../components/DashBoard/GroupMembership/GroupMembershipContent";
import VideoDisplay from "../../components/DashBoard/Videos/VideoDisplay";
import ResourcesPage from "../../components/DashBoard/Resources/ResourcesPage";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const UserDashboard = () => {
    const { user: currentUser, logoutUser } = useAuth();
    const navigate = useNavigate();
    const [activeMenu, setActiveMenu] = useState("user");
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
        { id: "user", icon: User, label: "User" },
        { id: "position", icon: UserList, label: "Position" },
        { id: "group", icon: UsersThree, label: "Group" },
        { id: "membership", icon: IdentificationCard, label: "Group Membership" },
        { id: "content", icon: File, label: "Group Content" },
        { id: "resources", icon: File, label: "Resources" },
        { id: "meeting", icon: VideoCamera, label: "Meeting" },
        { id: "videos", icon: VideoCamera, label: "Videos" },
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
                    <img src="/assets/MeetzaLogo.png" alt="Meetza Logo" />
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

                {activeMenu !== "user" && activeMenu !== "position" && activeMenu !== "content" && activeMenu !== "resources" && activeMenu !== "meeting" && activeMenu !== "group" && activeMenu !== "membership" && activeMenu !== "videos" && (
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