import { useState, useEffect, useCallback } from "react";
import { smartToast } from "../../../utils/toastManager";
import useMeetingContentData from "./hooks/useMeetingContentData";
import { MeetingContentTable } from "./components/MeetingContentTable";
import UserWelcomeHeader from "../shared/UserWelcomeHeader";
import "../User/UserMainComponent.css";

export default function MeetingContent() {
    const [currentUser, setCurrentUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchTimeout, setSearchTimeout] = useState(null);
    const [editing, setEditing] = useState({});
    const [addingNew, setAddingNew] = useState(false);

    const {
        contents,
        loading,
        error,
        addContent,
        updateContent,
        deleteContent,
        fetchContents,
        searchContents
    } = useMeetingContentData();

    // تحميل currentUser من localStorage
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user) setCurrentUser(user);
        fetchContents();
    }, []);

    const handleSave = async (id, data) => {
        try {
            if (id) await updateContent(id, data);
            else await addContent(data);

            setEditing({});
            setAddingNew(false);
            await fetchContents();
        } catch(error) {
            console.error("Failed to save content", error);
            smartToast.error(error.response?.data?.message || "Failed to save content");
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteContent(id);
            await fetchContents();
        } catch (error) {
            console.error("Failed to delete content:", error);
            smartToast.error(error.response?.data?.message || "Failed to delete content");
        }
    };

    const handleSearch = async (query) => {
        setSearchTerm(query);

        if (searchTimeout) clearTimeout(searchTimeout);

        const timeout = setTimeout(() => {
            searchContents(query);
        }, 500);

        setSearchTimeout(timeout);
    };

    useEffect(() => {
        return () => {
            if (searchTimeout) clearTimeout(searchTimeout);
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
                searchTerm={searchTerm}
                onSearchChange={handleSearch}
                editing={editing}
                addingNew={addingNew}
                currentUser={currentUser}
            />
        </main>
    );
}
