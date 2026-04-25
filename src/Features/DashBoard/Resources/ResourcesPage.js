import React, { useState, useRef } from "react";
import UserWelcomeHeader from "../shared/UserWelcomeHeader";
import useGroupContentData from "../GroupContent/hooks/useGroupContentData";
import useResourcesData from "./hooks/useResourcesData";
import ResourcesTable from "./components/ResourcesTable";
import ResourcesLinksModal from "./components/ResourcesLinksModal";
import { ConfirmDeleteModal } from "../shared/ConfirmDeleteModal";
import Select from "react-select";
import { smartToast } from "../../../utils/toastManager";
import { useAuth } from "../../../context/AuthContext";

const ResourcesPage = () => {
    const { user: currentUser } = useAuth();
    const fileInputRef = useRef(null);
    const [selectedContent, setSelectedContent] = useState(null);
    const [isLinksModalOpen, setIsLinksModalOpen] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [resourceToDelete, setResourceToDelete] = useState(null);

    const { contents, fetchContents } = useGroupContentData();
    const { addResource, addLinkResource, deleteResource } = useResourcesData(fetchContents);

    const onUploadClick = () => {
        // If super admin, require selecting a group content first
        if (currentUser?.role === 'Super_Admin' && !selectedContent) {
        smartToast.error('Please select a group content before uploading');
        return;
        }
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const meetingContentId = currentUser?.role === 'Super_Admin' ? selectedContent : (selectedContent || (contents.find(c=> c.administrator_id === currentUser?.id)?.id));
        if (!meetingContentId) {
        smartToast.error('No group content available to attach this file');
        return;
        }
        try {
        await addResource(meetingContentId, file);
        } catch (err) {
        // handled in hook
        } finally {
        e.target.value = null;
        }
    };

    const handleDelete = (meetingContentId, resourceId) => {
        setResourceToDelete({ meetingContentId, resourceId });
        setShowDeleteModal(true);
    };

    const confirmDeleteResource = async () => {
        if (!resourceToDelete) return;
        try {
            await deleteResource(resourceToDelete.meetingContentId, resourceToDelete.resourceId);
            setShowDeleteModal(false);
            setResourceToDelete(null);
        } catch (err) {
            setShowDeleteModal(false);
            setResourceToDelete(null);
        }
    };

    const onLinksClick = () => {
        // If super admin, require selecting a group content first
        if (currentUser?.role === 'Super_Admin' && !selectedContent) {
            smartToast.error('Please select a group content before adding links');
            return;
        }
        setIsLinksModalOpen(true);
    };

    const handleLinkSubmit = async (link) => {
        const meetingContentId = currentUser?.role === 'Super_Admin' ? selectedContent : (selectedContent || (contents.find(c=> c.administrator_id === currentUser?.id)?.id));
        if (!meetingContentId) {
            smartToast.error('No group content available to attach this link');
            return;
        }
        try {
            await addLinkResource(meetingContentId, link);
        } catch (err) {
            // handled in hook
        }
    };

    const contentOptions = (contents || []).map(c => ({ value: c.id, label: c.content_name }));

    return (
        <main className="flex-fill">
        <UserWelcomeHeader userName={currentUser?.name || currentUser?.username || 'User'} description="Manage resources attached to group contents." />

        {/* If Super Admin allow selecting content to attach to */}
{currentUser?.role === 'Super_Admin' && (
    <div className="m-4 p-4 rounded-3 shadow-sm" style={{ backgroundColor: "var(--surface-color)" }}>
        <div className="mb-2">
            <label className="form-label fw-semibold" style={{color: "var(--text-secondary)"}}>Select Group Content</label>
            <div className="d-flex gap-3 align-items-center">
                <div className="flex-grow-1">
                    <Select
                        className="rounded-3"
                        options={contentOptions}
                        value={selectedContent ? { value: selectedContent, label: contents.find(c => c.id === selectedContent)?.content_name } : null}
                        onChange={(s) => setSelectedContent(s?.value || null)}
                        placeholder="Select group content..."
                        menuPortalTarget={document.body}
                        styles={{
                            menuPortal: base => ({ ...base, zIndex: 9999 }),
                            control: (provided, state) => ({
                                ...provided,
                                border: '1px solid var(--border-color)',
                                boxShadow: 'none',
                                backgroundColor: 'var(--surface-color)',
                                color: 'var(--text-primary)',
                                '&:hover': {
                                    borderColor: 'var(--primary-color)',
                                }
                            }),
                            menu: (provided) => ({
                                ...provided,
                                backgroundColor: 'var(--surface-color)',
                                border: '1px solid var(--border-color)',
                            }),
                            option: (provided, state) => ({
                                ...provided,
                                backgroundColor: state.isFocused ? 'var(--primary-color)' : 'transparent',
                                color: state.isFocused ? 'white' : 'var(--text-primary)',
                                '&:hover': {
                                    backgroundColor: 'var(--primary-color)',
                                    color: 'white',
                                }
                            }),
                            singleValue: (provided) => ({
                                ...provided,
                                color: 'var(--text-primary)',
                            }),
                            placeholder: (provided) => ({
                                ...provided,
                                color: 'var(--text-secondary)',
                            })
                        }}
                    />
                </div>
            </div>
        </div>
    </div>
)}

{/* For Administrator, allow selecting from their content */}
{currentUser?.role === 'Administrator' && (
    <>
        {contents.length > 0 ? (
            <div className="m-4 p-4 rounded-3 shadow-sm" style={{ backgroundColor: "var(--surface-color)" }}>
                <div className="mb-2">
                    <label className="form-label fw-semibold" style={{color: "var(--text-secondary)"}}>Select Your Group Content</label>
                    <div className="d-flex gap-3 align-items-center">
                        <div className="flex-grow-1">
                            <Select
                                className="rounded-3"
                                options={contentOptions}
                                value={selectedContent ? { value: selectedContent, label: contents.find(c => c.id === selectedContent)?.content_name } : null}
                                onChange={(s) => setSelectedContent(s?.value || null)}
                                placeholder="Select your content..."
                                menuPortalTarget={document.body}
                                styles={{
                                    menuPortal: base => ({ ...base, zIndex: 9999 }),
                                    control: (provided, state) => ({
                                        ...provided,
                                        border: '1px solid var(--border-color)',
                                        boxShadow: 'none',
                                        backgroundColor: 'var(--surface-color)',
                                        color: 'var(--text-primary)',
                                        '&:hover': {
                                            borderColor: 'var(--primary-color)',
                                        }
                                    }),
                                    menu: (provided) => ({
                                        ...provided,
                                        backgroundColor: 'var(--surface-color)',
                                        border: '1px solid var(--border-color)',
                                    }),
                                    option: (provided, state) => ({
                                        ...provided,
                                        backgroundColor: state.isFocused ? 'var(--primary-color)' : 'transparent',
                                        color: state.isFocused ? 'white' : 'var(--text-primary)',
                                        '&:hover': {
                                            backgroundColor: 'var(--primary-color)',
                                            color: 'white',
                                        }
                                    }),
                                    singleValue: (provided) => ({
                                        ...provided,
                                        color: 'var(--text-primary)',
                                    }),
                                    placeholder: (provided) => ({
                                        ...provided,
                                        color: 'var(--text-secondary)',
                                    })
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        ) : (
            <div className="m-4 p-3 rounded-3" style={{ backgroundColor: '#fff3cd', borderLeft: '4px solid #ffc107' }}>
                <p className="mb-0" style={{color: "#856404", fontWeight: 500}}>
                    No content available. Please create a group content first to manage resources.
                </p>
            </div>
        )}
    </>
)}

        <input ref={fileInputRef} type="file" style={{ display: 'none' }} onChange={handleFileChange} />

        <ResourcesTable contents={contents} currentUser={currentUser} onUploadClick={onUploadClick} onLinksClick={onLinksClick} onDelete={handleDelete} selectedContentId={selectedContent} />

        <ResourcesLinksModal isOpen={isLinksModalOpen} onClose={() => setIsLinksModalOpen(false)} onSubmit={handleLinkSubmit} loading={false} />

        <ConfirmDeleteModal
            show={showDeleteModal}
            onClose={() => { setShowDeleteModal(false); setResourceToDelete(null); }}
            onConfirm={confirmDeleteResource}
            title="Delete Resource"
            message="Are you sure you want to delete this resource? This action cannot be undone."
        />
        </main>
    );
};

export default ResourcesPage;
