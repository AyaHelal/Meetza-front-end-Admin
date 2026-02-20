import { useState, useEffect } from "react";
import { smartToast } from "../../../utils/toastManager";
import useMeetingData from "./hooks/useMeetingData";
import { MeetingTable } from "./components/MeetingTable";
import UserWelcomeHeader from "../shared/UserWelcomeHeader";
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
    const [modalData, setModalData] = useState({
        id: null,
        title: '',
        start_time: '',
        end_time: '',
        status: 'Scheduled',
        group_id: '',
        description: '',
        recordMeeting: 'Recording',
        poster_file: null,
        files: [],
    });

    const { meetings, loading, error, addMeeting, updateMeeting, deleteMeeting, fetchMeetings, searchMeetings } = useMeetingData();


    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user) setCurrentUser(user);
        fetchMeetings();
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
            start_time: m?.start_time || '',
            end_time: m?.end_time || '',
            status: m?.status || 'Scheduled',
            group_id: m?.group_id || '',
            description: m?.description || '',
            recordMeeting: (m?.record_meeting === true || m?.record_meeting === 1 || m?.record_meeting === '1') ? 'Recording' : 'Not Recording',
            poster_file: null,
            files: [],
        });
        setModalOpen(true);
    };

    const handleAdd = () => {
        setModalMode('create');
        // Don't pre-select a group - user must choose
        setModalData({
            id: null,
            title: '',
            start_time: '',
            end_time: '',
            status: 'Scheduled',
            group_id: '',
            description: '',
            recordMeeting: 'Recording',
            poster_file: null,
            files: [],
        });
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
        <MeetingTable meetings={meetings} groups={groups} loading={loading} error={error?.message} onSave={handleSave} onDelete={handleDelete} onEdit={handleEdit} onAdd={handleAdd} searchTerm={searchTerm} onSearchChange={handleSearch} addingNew={addingNew} editing={editing} currentUser={currentUser} />
        {modalOpen && (
            <MeetingModal mode={modalMode} data={modalData} groups={groups} onChange={setModalData} onClose={closeModal} onSubmit={handleModalSubmit} />
        )}
        </main>
    );
}
