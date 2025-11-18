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

    const { meetings, loading, error, addMeeting, updateMeeting, deleteMeeting, fetchMeetings, searchMeetings } = useMeetingData();
    const { contents, fetchContents } = useMeetingContentData();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user) setCurrentUser(user);
        fetchMeetings();
        fetchContents();
    }, []);

    const handleSave = async (id, data) => {
        try {
        if (id) await updateMeeting(id, data);
        else await addMeeting(data);
        setEditing({}); setAddingNew(false);
        await fetchMeetings();
        } catch (err) { smartToast.error(err.response?.data?.message || "Failed to save meeting"); }
    };

    const handleDelete = async (id) => await deleteMeeting(id);

    const handleEdit = (id) => setEditing(prev => (id === "new" ? { new: true } : { ...prev, [id]: !prev[id] }));

    const handleAdd = () => { setAddingNew(true); setEditing({ new: true }); };

    const handleSearch = async (query) => {
        setSearchTerm(query);
        if (searchTimeout) clearTimeout(searchTimeout);
        const timeoutId = setTimeout(() => searchMeetings(query).catch(err => smartToast.error(err?.response?.data?.message || "Failed to search meetings")), 500);
        setSearchTimeout(timeoutId);
    };

    return (
        <main className="flex-fill">
        <UserWelcomeHeader userName={currentUser?.name || "User"} description="Welcome back! Manage your meetings efficiently." />
        <MeetingTable meetings={meetings} loading={loading} error={error?.message} onSave={handleSave} onDelete={handleDelete} onEdit={handleEdit} onAdd={handleAdd} searchTerm={searchTerm} onSearchChange={handleSearch} addingNew={addingNew} editing={editing} contents={contents} currentUser={currentUser} />
        </main>
    );
}
