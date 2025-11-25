import { useState, useEffect } from "react";
import { smartToast } from "../../../utils/toastManager";
import useMeetingData from "./hooks/useMeetingData";
import { MeetingTable } from "./components/MeetingTable";
import UserWelcomeHeader from "../shared/UserWelcomeHeader";
import useGroupContentData from "../GroupContent/hooks/useGroupContentData";
import { useGroupData } from "../Group/hooks/useGroupData";
import MeetingModal from "./components/MeetingModal";

export default function Meeting() {
    const [currentUser, setCurrentUser] = useState({});
    const [searchTerm, setSearchTerm] = useState("");
    const [searchTimeout, setSearchTimeout] = useState(null);
    const [editing, setEditing] = useState({});
    const [addingNew, setAddingNew] = useState(false);
    // use normalized group hook (handles fetching + normalization)
    const { groups } = useGroupData();

    // modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [modalData, setModalData] = useState({ title: '', datetime: '', status: 'Scheduled', meeting_content_id: '', group_id: '', id: null });

    const { meetings, loading, error, addMeeting, updateMeeting, deleteMeeting, fetchMeetings, searchMeetings } = useMeetingData();
    const { contents, fetchContents } = useGroupContentData();


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

    const handleEdit = (id) => {
        const m = meetings.find(x => String(x.id) === String(id));
        setModalMode('edit');
        setModalData({
            id: m?.id || null,
            title: m?.title || '',
            datetime: m?.datetime || '',
            status: m?.status || 'Scheduled',
            meeting_content_id: m?.meeting_content_id || '',
            group_id: m?.group_id || ''
        });
        setModalOpen(true);
    };

    const handleAdd = () => {
        setModalMode('create');
        // Derive a group_id silently: prefer the first existing meeting's group_id, then the first fetched group
        const derivedGroupId = meetings && meetings.length > 0 ? meetings[0].group_id : (groups && groups.length > 0 ? (groups[0].id || groups[0].group_id) : '');
        setModalData({ title: '', datetime: '', status: 'Scheduled', meeting_content_id: '', group_id: derivedGroupId || '', id: null });
        setModalOpen(true);
    };

    const closeModal = () => setModalOpen(false);

    const handleModalSubmit = async (data) => {
        await handleSave(data.id, data);
        closeModal();
    };

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
        {modalOpen && (
            <MeetingModal mode={modalMode} data={modalData} contents={contents} groups={groups} onChange={setModalData} onClose={closeModal} onSubmit={handleModalSubmit} />
        )}
        </main>
    );
}
