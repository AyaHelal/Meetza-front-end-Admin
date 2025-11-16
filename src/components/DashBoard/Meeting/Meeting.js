import { useState, useEffect } from "react";
import { smartToast } from "../../../utils/toastManager";
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
        searchMeetings,
    } = useMeetingData();

    // get contents + fetch function from hook
    const { contents, fetchContents } = useMeetingContentData();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user) setCurrentUser({ name: user.name || "User" });
        fetchMeetings();
        fetchContents();
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
        console.error("Save error:", err);
        smartToast.error(err.response?.data?.message || "Failed to save meeting");
        }
    };

    const handleDelete = async (id) => await deleteMeeting(id);

    // <-- changed to TOGGLE editing state (so cancel can toggle off)
    const handleEdit = (id) => setEditing((prev) => (id === "new" ? { new: true } : { ...prev, [id]: !prev[id] }));

    const handleAdd = () => {
        setAddingNew(true);
        setEditing({ new: true });
    };

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
                smartToast.error(err?.response?.data?.message || "Failed to search meetings");
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
