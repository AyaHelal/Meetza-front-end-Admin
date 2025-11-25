import React, { useState, useEffect, useRef } from "react";
import UserWelcomeHeader from "../shared/UserWelcomeHeader";
import useGroupContentData from "../GroupContent/hooks/useGroupContentData";
import useResourcesData from "./hooks/useResourcesData";
import ResourcesTable from "./components/ResourcesTable";
import Select from "react-select";
import { smartToast } from "../../../utils/toastManager";

const ResourcesPage = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const fileInputRef = useRef(null);
    const [selectedContent, setSelectedContent] = useState(null);

    const { contents, fetchContents } = useGroupContentData();
    const { addResource, deleteResource } = useResourcesData(fetchContents);

    useEffect(() => {
        const u = JSON.parse(localStorage.getItem('user'));
        if (u) setCurrentUser(u);
    }, []);

    useEffect(() => {
        // For Administrator, don't preselect - let them choose from their content
        // Super_Admin will start with null and must select
        // Administrator will also start with null and must select from their content
    }, []);

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

    const handleDelete = async (meetingContentId, resourceId) => {
        try {
        await deleteResource(meetingContentId, resourceId);
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
            <div className="m-4">
                <label className="form-label fw-semibold" style={{color: "#888888"}}>Select Group Content</label>
                <Select
                    className="mb-3 rounded-3"
                    options={contentOptions}
                    value={selectedContent ? { value: selectedContent, label: contents.find(c => c.id === selectedContent)?.content_name } : null}
                    onChange={(s) => setSelectedContent(s?.value || null)}
                    placeholder="Select group content..."
                    menuPortalTarget={document.body}
                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                />
            </div>
        )}

        {/* For Administrator, allow selecting from their content */}
        {currentUser?.role === 'Administrator' && (
            <>
                {contents.length > 0 ? (
                    <div className="m-4">
                        <label className="form-label fw-semibold" style={{color: "#888888"}}>Select Your Group Content</label>
                        <Select
                            className="mb-3 rounded-3"
                            options={contentOptions}
                            value={selectedContent ? { value: selectedContent, label: contents.find(c => c.id === selectedContent)?.content_name } : null}
                            onChange={(s) => setSelectedContent(s?.value || null)}
                            placeholder="Select your content..."
                            menuPortalTarget={document.body}
                            styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                        />
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

        <ResourcesTable contents={contents} currentUser={currentUser} onUploadClick={onUploadClick} onDelete={handleDelete} selectedContentId={selectedContent} />
        </main>
    );
};

export default ResourcesPage;
