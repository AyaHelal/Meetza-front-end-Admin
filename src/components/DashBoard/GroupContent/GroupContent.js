import { useState, useEffect } from "react";
import { smartToast } from "../../../utils/toastManager";
import useGroupContentData from "./hooks/useGroupContentData";
import { GroupContentTable } from "./components/GroupContentTable";
import GroupContentModal from "./components/GroupContentModal";
import UserWelcomeHeader from "../shared/UserWelcomeHeader";
import "../User/UserMainComponent.css";

export default function GroupContent() {
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
    } = useGroupContentData();

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
                    (currentUser?.role === 'Super_Admin' || currentUser?.role === 'Administrator')
                        ? "Welcome back! Manage all group contents."
                        : "Welcome back! Manage your group contents."
                }
            />

            <GroupContentTable
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
                <GroupContentModal mode={modalMode} data={modalData} onChange={setModalData} onClose={closeModal} onSubmit={handleModalSubmit} />
            )}
        </main>
    );
}

export { GroupContent };
