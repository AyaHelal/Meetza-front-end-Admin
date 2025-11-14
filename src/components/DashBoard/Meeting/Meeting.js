import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import useMeetingData from "./hooks/useMeetingData";
import { MeetingTable } from "./components/MeetingTable";
import UserWelcomeHeader from "../shared/UserWelcomeHeader";
import useMeetingContentData from "../MeetingContent/hooks/useMeetingContentData";

export default function Meeting() {
    const [currentUser, setCurrentUser] = useState({});
    const [searchTerm, setSearchTerm] = useState("");
    const [searchTimeout, setSearchTimeout] = useState(null);
    const [editing, setEditing] = useState({});
    const [addingNew, setAddingNew] = useState(false);

    const {
        meetings,
        loading,
        error,
        addMeeting,
        updateMeeting,
        deleteMeeting,
        fetchMeetings,
        searchMeetings
    } = useMeetingData();
    const { contents, fetchData: fetchContents } = useMeetingContentData();
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user) setCurrentUser({ name: user.name || "User" });
        fetchMeetings();
        fetchContents();
    }, []);

    const handleSave = async (id, data) => {
        try {
            if (id) {
                await updateMeeting(id, data);
            } else {
                await addMeeting(data);
            }
            setEditing({});
            setAddingNew(false);
            // Refresh the meetings list after saving
            await fetchMeetings();
        } catch (err) {
            console.error('Save error:', err);
            toast.error(err.response?.data?.message || "Failed to save meeting");
        }
    };

    const handleDelete = async (id) => await deleteMeeting(id);
    const handleEdit = (id) => setEditing((prev) => ({ ...prev, [id]: true }));
    const handleAdd = () => { setAddingNew(true); setEditing({ new: true }); };

    const handleSearch = async (query) => {
        setSearchTerm(query);

        // Clear previous timeout
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        // Set a new timeout
        const timeoutId = setTimeout(async () => {
            if (query.trim() === "") {
                await fetchMeetings();
            } else {
                if (query.trim().length > 2)
                await searchMeetings(query).catch((err) => {
                    toast.error(err?.response?.data?.message || "Failed to search meetings");
                });
            }
        }, 500);

        setSearchTimeout(timeoutId);
    };

    return (
        <main className="flex-fill">
        <UserWelcomeHeader userName={currentUser?.name || "User"} description="Welcome back! Manage your meetings efficiently." />
        <MeetingTable
            meetings={meetings}
            loading={loading}
            error={error?.message}
            onSave={handleSave}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onAdd={handleAdd}
            searchTerm={searchTerm}
            onSearchChange={handleSearch}
            addingNew={addingNew}
            editing={editing}
            contents={contents}
        />
        </main>
    );
}