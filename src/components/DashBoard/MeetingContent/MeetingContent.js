import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import useMeetingContentData from "./hooks/useMeetingContentData";
import { MeetingContentTable } from "./components/MeetingContentTable";
import UserWelcomeHeader from "../shared/UserWelcomeHeader";
import "../../DashBoard/UserMainComponent.css";

export default function MeetingContent() {
    const [currentUser, setCurrentUser] = useState({});
    const [meetings, setMeetings] = useState([]);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user) {
            setCurrentUser({
                name: user.name || user.fullName || "User",
                role: user.role || ""
            });
        }
    }, []);

    const { contents, loading, error, addContent, updateContent, deleteContent, fetchData } = useMeetingContentData();

    const fetchMeetings = useCallback(async () => {
        try {
            const token = localStorage.getItem("authToken");
            const response = await axios.get(
                "https://meetza-backend.vercel.app/api/meeting",
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            if (response.data.success) {
                setMeetings(response.data.data || []);
            }
        } catch (error) {
            console.error("Error fetching meetings:", error);
        }
    }, []);

    useEffect(() => {
        fetchMeetings();
    }, [fetchMeetings]);

    useEffect(() => {
        fetchData();
    }, []);

    const [searchTerm, setSearchTerm] = useState("");
    const [editing, setEditing] = useState({});
    const [addingNew, setAddingNew] = useState(false);

    const handleSave = async (contentId, contentData) => {
        try {
            if (contentId) {
                await updateContent(contentId, contentData);
            } else {
                await addContent(contentData);
            }
            setEditing({});
            setAddingNew(false);
            await fetchData();
            await fetchMeetings();
            toast.success("Content saved successfully!");
        } catch {
            toast.error("Failed to save content");
        }
    };

    const handleDelete = async (id) => {
        await deleteContent(id);
        await fetchData();
        await fetchMeetings();
    };

    const handleEdit = (id) => setEditing((prev) => ({ ...prev, [id]: true }));
    const handleAdd = () => {
        setAddingNew(true);
        setEditing({ new: true });
    };

    return (
        <main className="flex-fill">
            <UserWelcomeHeader
                userName={currentUser?.name || "User"}
                description="Welcome back! Manage your meeting contents efficiently."
            />
            <MeetingContentTable
                contents={contents.filter(
                    (c) =>
                        c.content_name?.toLowerCase().includes(searchTerm.toLowerCase())
                )}
                loading={loading}
                error={error?.message}
                onSave={handleSave}
                onDelete={handleDelete}
                onEdit={handleEdit}
                onAdd={handleAdd}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                addingNew={addingNew}
                editing={editing}
                meetings={meetings}
            />
        </main>
    );
}
