import { useState, useEffect } from "react";
import { smartToast } from "../../../utils/toastManager";
import useGroupContentData from "./hooks/useGroupContentData";
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
    const [groups, setGroups] = useState([]);
    const [users, setUsers] = useState([]);
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

    useEffect(() => {
    const fetchUsers = async () => {
        const res = await apiCommon.get("/user");
        setUsers(res.data.data || res.data);
    };

    fetchUsers();
    }, []);


    // Note: availableGroups is no longer needed since group assignment is handled in Group module
    useEffect(() => {
        const fetchGroups = async () => {
            try {
            const res = await apiCommon.get("/group");
            setGroups(res.data.data || res.data);
            } catch (err) {
            smartToast.error("Failed to load groups");
            }
        };

        fetchGroups();
        }, []);

    const handleSave = async (data) => {
    try {
        const contentData = {
            content_name: data.content_name,
            content_description: data.content_description,
            group_id: data.group_id ?? null,
            administrator_id: data.administrator_id,
            role: currentUser?.role,
        };



        if (currentUser?.role === "Super_Admin") {
            if (!contentData.administrator_id) {
                smartToast.error("Please select an Administrator");
                return;
            }
            contentData.administrator_id = data.administrator_id;
            } else {
            contentData.administrator_id = currentUser.id;
            }

        if (editing.id) {
            await updateContent(editing.id, contentData);
        } else {
            await addContent(contentData);
        }

        setEditing({});
        setAddingNew(false);
        await fetchContents();
    } catch (error) {
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
                    groups={groups}
                    users={users}
                    currentUser={currentUser}
                />
            )}
        </main>
    );
}

export { GroupContent };
