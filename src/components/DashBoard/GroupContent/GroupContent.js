import { useState, useEffect } from "react";
import { smartToast } from "../../../utils/toastManager";
import useGroupContentData from "./hooks/useGroupContentData";
import { useGroupData } from "../Group/hooks/useGroupData";
import { GroupContentTable } from "./components/GroupContentTable";
import GroupContentModal from "./components/GroupContentModal";
import UserWelcomeHeader from "../shared/UserWelcomeHeader";
import "../User/UserMainComponent.css";
import apiCommon from "../../../utils/api";

export default function GroupContent() {
    const [currentUser, setCurrentUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [editing, setEditing] = useState({});
    const [addingNew, setAddingNew] = useState(false);
    const {
        contents,
        loading,
        error,
        addContent,
        updateContent,
        deleteContent,
        fetchContents
    } = useGroupContentData();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user) setCurrentUser(user);
        fetchContents();
    }, []);

    // Note: availableGroups is no longer needed since group assignment is handled in Group module



    const handleSave = async (data) => {
    try {
        const contentData = {
            content_name: data.content_name,
            content_description: data.content_description
        };

        if (editing.id) {
            await updateContent(editing.id, contentData);
        } else {
            await addContent(contentData);
        }

        setEditing({});
        setAddingNew(false);
        await fetchContents();
    } catch (error) {
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

    const handleSearch = (query) => {
        setSearchTerm(query);
    };

    const handleEdit = (id) => {
    const item = contents.find((c) => c.id === id);
    setEditing({
        id: item?.id || null,
        content_name: item?.content_name || '',
        content_description: item?.content_description || ''
    });
};


    const handleAdd = () => {
        setAddingNew(true);
        setEditing({
            content_name: '',
            content_description: '',
            id: null
        });
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
            {(addingNew || editing.id) && (
                <GroupContentModal
                    mode={editing.id ? 'edit' : 'create'}
                    data={editing}
                    onChange={setEditing}
                    onClose={() => {
                        setEditing({});
                        setAddingNew(false);
                    }}
                    onSubmit={handleSave}
                />
            )}
        </main>
    );
}

export { GroupContent };
