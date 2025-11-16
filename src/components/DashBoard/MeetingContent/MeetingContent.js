import { useState, useEffect, useCallback } from "react";
import { smartToast } from "../../../utils/toastManager";
import axios from "axios";
import useMeetingContentData from "./hooks/useMeetingContentData";
import { MeetingContentTable } from "./components/MeetingContentTable";
import UserWelcomeHeader from "../shared/UserWelcomeHeader";
import "../User/UserMainComponent.css";

export default function MeetingContent() {
    const [meetings, setMeetings] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchTimeout, setSearchTimeout] = useState(null);
    const [editing, setEditing] = useState({});
    const [addingNew, setAddingNew] = useState(false);

    const {
        contents,
        loading,
        error,
        currentUser,
        addContent,
        updateContent,
        deleteContent,
        fetchContents,
        searchContents
    } = useMeetingContentData();

    const fetchMeetings = useCallback(async () => {
        try {
            const token = localStorage.getItem("authToken");
            const response = await axios.get(
                "https://meetza-backend.vercel.app/api/meeting-contents",
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
        fetchContents();
    }, []);


    const handleSave = async (id, data) => {
        try {
            if (id) {
                await updateContent(id, data);
            } else {
                await addContent(data);
            }
            setEditing({});
            setAddingNew(false);
            await fetchContents();
            await fetchMeetings();
        } catch(error) {
            console.error("Failed to save content", error);
            smartToast.error(error.response?.data?.message || "Failed to save content");
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteContent(id);
            await fetchContents();
            await fetchMeetings();
        } catch (error) {
            console.error("Failed to delete content:", error);
            smartToast.error(error.response?.data?.message || "Failed to delete content");
        }
    };

    const handleSearch = async (query) => {
        setSearchTerm(query);

        // Clear previous timeout
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        // Set a new timeout
        const timeout = setTimeout(() => {
            searchContents(query);
        }, 500); // 500ms debounce

        setSearchTimeout(timeout);
    };

    // Clean up timeout on component unmount
    useEffect(() => {
        return () => {
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
        };
    }, [searchTimeout]);

    const handleEdit = (id) => setEditing((prev) => (id === 'new' ? { new: true } : { ...prev, [id]: !prev[id] }));
    const handleAdd = () => {
        setAddingNew(true);
        setEditing({ new: true });
    };

    return (
        <main className="flex-fill">
            <UserWelcomeHeader
                userName={currentUser?.name || currentUser?.username || "User"}
                description={
                    currentUser?.role === 'Super_Admin'
                        ? "Welcome back! Manage all meeting contents."
                        : "Welcome back! Manage your meeting contents."
                }
            />
            <MeetingContentTable
                contents={contents}
                loading={loading}
                error={error?.message || error}
                onSave={handleSave}
                onDelete={handleDelete}
                onEdit={handleEdit}
                onAdd={handleAdd}
                meetings={meetings}
                searchTerm={searchTerm}
                onSearchChange={handleSearch}
                editing={editing}
                addingNew={addingNew}
                currentUser={currentUser}
            />
        </main>
    );
}
