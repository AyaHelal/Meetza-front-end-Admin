import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import useMeetingContentData from "./hooks/useMeetingContentData";
import { MeetingContentTable } from "./components/MeetingContentTable";
import UserWelcomeHeader from "../shared/UserWelcomeHeader";
import "../../DashBoard/UserMainComponent.css";

export default function MeetingContent() {
    const [currentUser, setCurrentUser] = useState({});

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user) {
            setCurrentUser({
                name: user.name || user.fullName || 'User',
                role: user.role || ''
            });
        }
    }, []);

    const {
        contents,
        loading,
        error,
        addContent,
        updateContent,
        deleteContent,
        fetchData,
    } = useMeetingContentData();

    const [searchTerm, setSearchTerm] = useState("");
    const [editing, setEditing] = useState({});
    const [addingNew, setAddingNew] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const handleSave = async (contentId, contentData) => {
        try {
        if (contentId) await updateContent(contentId, contentData);
        else await addContent(contentData);
        setEditing({});
        setAddingNew(false);
        fetchData();
        } catch {
        toast.error("Failed to save content");
        }
    };

    const handleDelete = async (id) => {
        await deleteContent(id);
        fetchData();
    };

    const handleEdit = (id) => setEditing((prev) => ({ ...prev, [id]: true }));

    const handleAdd = () => {
        setAddingNew(true);
        setEditing({ new: true });
    };

    const filtered = contents.filter(
        (c) =>
        c.content_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <main className="flex-fill">
            <UserWelcomeHeader
                userName={currentUser?.name || 'User'}
                description="Welcome back! Manage your meeting contents efficiently."
            />
            <MeetingContentTable
                contents={filtered}
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
            />
        </main>
    );
}
