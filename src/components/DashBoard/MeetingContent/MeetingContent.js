import { useState, useEffect, useCallback } from "react";
import { smartToast } from "../../../utils/toastManager";
import useMeetingContentData from "./hooks/useMeetingContentData";
import { MeetingContentTable } from "./components/MeetingContentTable";
import MeetingContentModal from "./components/MeetingContentModal";
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

    // modal state for create/edit
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [modalData, setModalData] = useState({ content_name: '', content_description: '', id: null });

    const handleEdit = (id) => {
        const item = contents.find((c) => c.id === id);
        setModalMode('edit');
        setModalData({ id: item?.id || null, content_name: item?.content_name || '', content_description: item?.content_description || '' });
        setModalOpen(true);
    };

    const handleAdd = () => {
        setModalMode('create');
        setModalData({ content_name: '', content_description: '', id: null });
        setModalOpen(true);
    };

    const closeModal = () => setModalOpen(false);

    const handleModalSubmit = async (data) => {
        await handleSave(data.id, data);
        closeModal();
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
            {modalOpen && (
                <MeetingContentModal mode={modalMode} data={modalData} onChange={setModalData} onClose={closeModal} onSubmit={handleModalSubmit} />
            )}
        </main>
    );
}
