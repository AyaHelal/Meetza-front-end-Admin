import { useState, useEffect } from "react";
import useMeetingData from "./hooks/useMeetingData";
import { MeetingTable } from "./components/MeetingTable";
import UserWelcomeHeader from "../shared/UserWelcomeHeader";
import useMeetingContentData from "../MeetingContent/hooks/useMeetingContentData";

export default function Meeting() {
    const [currentUser, setCurrentUser] = useState({});
    const [searchTerm, setSearchTerm] = useState("");
    const [editing, setEditing] = useState({});
    const [addingNew, setAddingNew] = useState(false);

    const { meetings, loading, error, addMeeting, updateMeeting, deleteMeeting, fetchMeetings } = useMeetingData();
    const { contents, fetchData: fetchContents } = useMeetingContentData();
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user) setCurrentUser({ name: user.name || "User" });
        fetchMeetings();
        fetchContents();
    }, []);

    const handleSave = async (id, data) => {
        try {
        if (id) await updateMeeting(id, data);
        else await addMeeting(data);
        setEditing({});
        setAddingNew(false);
        } catch {}
    };

    const handleDelete = async (id) => await deleteMeeting(id);
    const handleEdit = (id) => setEditing((prev) => ({ ...prev, [id]: true }));
    const handleAdd = () => { setAddingNew(true); setEditing({ new: true }); };

    const filtered = meetings.filter((m) => m.title.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <main className="flex-fill">
        <UserWelcomeHeader userName={currentUser?.name || "User"} description="Welcome back! Manage your meetings efficiently." />
        <MeetingTable
            meetings={filtered}
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
            contents={contents}
        />
        </main>
    );
}
