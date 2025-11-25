import React, { useState, useEffect } from "react";
import {
    User,
    UserList,
    UsersThree,
    IdentificationCard,
    VideoCamera,
    File,
    SignOut,
} from "phosphor-react";
import "bootstrap/dist/css/bootstrap.min.css";
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

const UserDashboard = () => {
    // ---------- STATE ----------
    const [currentUser, setCurrentUser] = useState({});
    const [activeMenu, setActiveMenu] = useState("user");

    // Modals and user actions are now handled inside UserMainContent

    // ---------- INIT ----------
    useEffect(() => {
        try {
            const storedUserJson = localStorage.getItem("user");
            const storedUserName = localStorage.getItem("userName");
            if (storedUserJson) {
                const parsed = JSON.parse(storedUserJson);
                if (parsed && (parsed.name || parsed.fullName)) {
                    setCurrentUser((prev) => ({ ...prev, name: parsed.name || parsed.fullName }));
                }
                if (parsed && parsed.role) {
                    setCurrentUser((prev) => ({ ...prev, role: parsed.role }));
                }
            } else if (storedUserName) {
                setCurrentUser((prev) => ({ ...prev, name: storedUserName }));
            }
        } catch (e) {
            // ignore parsing errors
        }
    }, []);

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

    const handleMenuClick = (id) => {
        setActiveMenu(id);
    };

    const getMenuLabel = (id) => {
        const item = menuItems.find((m) => m.id === id);
        return item ? item.label : "";
    };

    const handleLogout = () => {
        try {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            localStorage.removeItem('userName');
            localStorage.removeItem('userRole');
            localStorage.removeItem('remember');
            sessionStorage.removeItem('authToken');
            sessionStorage.removeItem('user');
            sessionStorage.removeItem('userName');
            sessionStorage.removeItem('userRole');
        } catch (_) { /* ignore */ }
        window.location.href = '/login';
    };

    return (
        <div className="d-flex min-vh-100 bg-light">
            <style>{`
                .responsive-aside {
                    height: 936px;
                }
                @media (max-height: 1024px) {
                    .responsive-aside {
                        height: calc(100vh - 80px);
                    }
                }
            `}</style>
            {/* SIDEBAR */}
            <aside
                className="bg-white rounded-3 p-2 m-4 mt-5 responsive-aside d-flex flex-column"
                style={{ width: 230, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
            >
                <div className="px-2 pb-5">
                    <img src="/assets/MeetzaLogo.png" alt="Meetza Logo" />
                </div>

                <nav className="px-2 flex-grow-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.id}
                                onClick={() => handleMenuClick(item.id)}
                                className={`btn w-100 text-start d-flex align-items-center gap-2 mb-3 ${activeMenu === item.id ? "text-white" : "text-secondary"
                                    }`}
                                style={{
                                    borderRadius: 8,
                                    backgroundColor: activeMenu === item.id ? "#00DC85" : "white",
                                }}
                            >
                                <Icon size={24} />
                                <span className="fw-medium" style={{ fontSize: "14px" }}>
                                    {item.label}
                                </span>
                            </button>
                        );
                    })}
                </nav>

                <div className="d-flex flex-row gap-2 px-1 pb-md-4 pb-lg-2">
                    {/* <button className="btn btn-light d-flex align-items-center rounded-5"
                        style={{ width: "fit-content", backgroundColor: "#F4F6F8" }}>
                        <Bell size={24} />
                    </button>
                    <button className="btn btn-light d-flex align-items-center rounded-5"
                        style={{ width: "fit-content", backgroundColor: "#F4F6F8" }}>
                        <Gear size={24} />
                    </button> */}
                    <button className="btn btn-light d-flex align-items-center rounded-5"
                        style={{ width: "fit-content", backgroundColor: "#F4F6F8" }}
                        onClick={handleLogout}>
                        <SignOut size={24} style={{ color: "#EB4335" }} />
                    </button>
                </div>
            </aside>

            {/* MAIN AREA */}
            <div className="flex-fill">
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
            </div>
        </div>
    );
};

export default UserDashboard;