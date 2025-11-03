import React, { useState, useEffect } from "react";
import {
    User,
    UserList,
    UsersThree,
    IdentificationCard,
    VideoCamera,
    File,
    Heart,
    ChatCircleDots,
    Bell,
    Gear,
    SignOut,
} from "phosphor-react";
import "bootstrap/dist/css/bootstrap.min.css";
import UserMainContent from "../../components/DashBoard/UserMainContent";

const UserDashboard = () => {
    // ---------- STATE ----------
    const [currentUser, setCurrentUser] = useState({});
    const [users, setUsers] = useState([]);
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
        { id: "meeting", icon: VideoCamera, label: "Meeting" },
        { id: "content", icon: File, label: "Meeting Content" },
        { id: "videos", icon: VideoCamera, label: "Videos" },
        { id: "likes", icon: Heart, label: "Likes" },
        { id: "comments", icon: ChatCircleDots, label: "Comments" },
    ];


    const handleMenuClick = (id) => {
        setActiveMenu(id);
    };

    const getMenuLabel = (id) => {
        const item = menuItems.find((m) => m.id === id);
        return item ? item.label : "";
    };

    return (
        <div className="d-flex min-vh-100 bg-light">
            {/* SIDEBAR */}
            <aside
                className="bg-white rounded-3 p-2 m-4 mt-5"
                style={{ width: 230, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", height: "936px" }}
            >
                <div className="px-2 pb-5">
                    <img src="/assets/MeetzaLogo.png" alt="Meetza Logo" />
                </div>

                <nav className="px-2 ">
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

                <div className="d-flex flex-column gap-2" style={{ marginTop: "100%" }}>
                    <button className="btn btn-light d-flex align-items-center rounded-5"
                        style={{ width: "fit-content", backgroundColor: "#F4F6F8" }}>
                        <Bell size={24} />
                    </button>
                    <button className="btn btn-light d-flex align-items-center rounded-5"
                        style={{ width: "fit-content", backgroundColor: "#F4F6F8" }}>
                        <Gear size={24} />
                    </button>
                    <button className="btn btn-light d-flex align-items-center rounded-5"
                        style={{ width: "fit-content", backgroundColor: "#F4F6F8" }}>
                        <SignOut size={24} style={{ color: "#EB4335" }} />
                    </button>
                </div>
            </aside>

            {/* MAIN AREA */}
            <div className="flex-fill">
                {activeMenu === "user" ? (
                    <UserMainContent currentUser={currentUser} users={users} setUsers={setUsers} />
                ) : (
                    <div className="d-flex flex-column justify-content-center align-items-center h-100 text-muted">
                        <h4 className="mb-2">{getMenuLabel(activeMenu)}</h4>
                        <p className="mb-0">Main component for {getMenuLabel(activeMenu)} goes here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserDashboard;
