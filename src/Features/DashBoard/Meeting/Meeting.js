import { useState, useEffect } from "react";
import { smartToast } from "../../../utils/toastManager";
import useMeetingData from "./hooks/useMeetingData";
import { MeetingTable } from "./components/MeetingTable";
import UserWelcomeHeader from "../shared/UserWelcomeHeader";
import { ConfirmDeleteModal } from "../shared/ConfirmDeleteModal";
import { WeeklyDeleteModal } from "./components/WeeklyDeleteModal";
import { useGroupData } from "../Group/hooks/useGroupData";
import MeetingModal from "./components/MeetingModal";
import { useAuth } from "../../../context/AuthContext";

export default function Meeting() {
    const { user: currentUser } = useAuth();
    const [searchTerm, setSearchTerm] = useState("");
    const [searchTimeout, setSearchTimeout] = useState(null);
    const [editing, setEditing] = useState({});
    const [addingNew, setAddingNew] = useState(false);
    // use normalized group hook (handles fetching + normalization)
    const { groups } = useGroupData();

    // modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showWeeklyDeleteModal, setShowWeeklyDeleteModal] = useState(false);
    const [meetingToDelete, setMeetingToDelete] = useState(null);
    const [deletingMeeting, setDeletingMeeting] = useState(false);
    const [modalData, setModalData] = useState({
        id: null,
        title: '',
        start_time: '',
        end_time: '',
        status: 'Scheduled',
        group_id: '',
        description: '',
        recordMeeting: 'Recording',
        weekly: 'Active',
        poster_file: null,
        files: [],
    });

    const { meetings, loading, error, addMeeting, updateMeeting, deleteMeeting, fetchMeetings, searchMeetings } = useMeetingData();


    useEffect(() => {
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

    const handleDelete = (id) => {
        const meeting = meetings.find(m => String(m.id) === String(id));
        if (meeting) {
            const isWeeklyActive = meeting.weekly === 1 || meeting.weekly === '1' || meeting.is_weekly === 1;
            setMeetingToDelete(meeting);

            // Show weekly delete modal if meeting is weekly active, otherwise show regular delete modal
            if (isWeeklyActive) {
                setShowWeeklyDeleteModal(true);
            } else {
                setShowDeleteModal(true);
            }
        }
    };

    const confirmDeleteMeeting = async () => {
        if (!meetingToDelete) return;
        setDeletingMeeting(true);
        try {
            await deleteMeeting(meetingToDelete.id);
            smartToast.success("Meeting deleted successfully");
            setShowDeleteModal(false);
            setMeetingToDelete(null);
            await fetchMeetings();
        } catch (err) {
            smartToast.error(err?.response?.data?.message || "Failed to delete meeting");
            setShowDeleteModal(false);
            setMeetingToDelete(null);
        } finally {
            setDeletingMeeting(false);
        }
    };

    const confirmWeeklyDeleteMeeting = async (deleteAllWeeks = false) => {
        if (!meetingToDelete) return;
        setDeletingMeeting(true);
        try {
            const meetingId = meetingToDelete.id;
            const isWeeklyActive = meetingToDelete.weekly === 1 || meetingToDelete.weekly === '1' || meetingToDelete.is_weekly === 1;

            if (isWeeklyActive && deleteAllWeeks) {
                // Delete all weekly meetings (series)
                await deleteMeeting(meetingId, { params: { scope: 'series' } });
                smartToast.success("All weekly meetings deleted successfully");
            } else {
                // Regular delete for this week only
                await deleteMeeting(meetingId);
                smartToast.success("Meeting deleted successfully");
            }

            setShowWeeklyDeleteModal(false);
            setShowDeleteModal(false);
            setMeetingToDelete(null);
            await fetchMeetings();
        } catch (err) {
            smartToast.error(err?.response?.data?.message || "Error deleting meeting");
            setShowWeeklyDeleteModal(false);
            setShowDeleteModal(false);
            setMeetingToDelete(null);
        } finally {
            setDeletingMeeting(false);
        }
    };

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
            recordMeeting: (() => {
                const r = m?.recording ?? m?.record_meeting;
                return (r === true || r === 1 || r === '1') ? 'Recording' : 'Not Recording';
            })(),
            weekly: (() => {
                const w = m?.weekly ?? m?.weekly_option ?? m?.is_weekly;
                return (w === true || w === 1 || w === '1') ? 'Active' : (w === false || w === 0 || w === '0') ? 'Inactive' : 'Active';
            })(),
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
            weekly: 'Active',
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
            <ConfirmDeleteModal
                show={showDeleteModal}
                onClose={() => { setShowDeleteModal(false); setMeetingToDelete(null); }}
                onConfirm={confirmDeleteMeeting}
                title="Delete Meeting"
                message="Are you sure you want to delete this meeting? This action cannot be undone."
            />
            <WeeklyDeleteModal
                show={showWeeklyDeleteModal}
                onClose={() => { setShowWeeklyDeleteModal(false); setMeetingToDelete(null); }}
                onConfirmThisWeek={() => confirmWeeklyDeleteMeeting(false)}
                onConfirmAllWeeks={() => confirmWeeklyDeleteMeeting(true)}
                confirming={deletingMeeting}
            />
        </main>
    );
}
