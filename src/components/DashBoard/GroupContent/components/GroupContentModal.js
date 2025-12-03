
import { useEffect, useState } from "react";
import "../../Group/GroupMainComponent.css";
import Select from "react-select";



const GroupContentModal = ({ mode = 'create', data = {}, onChange, onClose, onSubmit,groups = [],users=[],currentUser}) => {
    const title = mode === 'create' ? 'Create Content' : 'Update Content';

    const [availableGroups, setAvailableGroups] = useState([]);
    const adminUsers = users.filter(
    u => u.role === "Administrator" || u.role === "Super_Admin"
    );

    useEffect(() => {

    const storedUser =
    JSON.parse(localStorage.getItem("user")) ||
    JSON.parse(sessionStorage.getItem("user"));

    const currentUserId = storedUser?.id;
    const userRole = (storedUser?.role || "").toLowerCase();
    const isSuperAdmin = userRole.includes("super");

    const updatedGroups  = groups.filter(group => {
    const hasNoContent = !group.group_content_id;

    if (isSuperAdmin) {
        return hasNoContent;
    } else {
        return group.administrator_id === currentUserId && hasNoContent;
    }
    });
    setAvailableGroups(updatedGroups );
},[groups]);

    return (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.45)' }}>
            <div className="card p-4 mx-auto" style={{ maxWidth: 560, borderRadius: 12, marginTop: '6rem' }}>
                <div className="d-flex justify-content-between align-items-start">
                    <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{title}</h3>
                    <button type="button" className="btn-close" onClick={onClose} aria-label="Close" style={{ fontSize: "14px" }}>
                    </button>
                </div>

                <div style={{ marginTop: 12 }}>
                    <label className="form-label" style={{ fontSize: 13, color: '#6c757d' }}>Content Name</label>
                    <input
                        className="form-control mb-3 rounded-3"
                        placeholder="Enter content name"
                        value={data.content_name || ''}
                        onChange={(e) => onChange({ ...data, content_name: e.target.value })}
                    />

                    <label className="form-label" style={{ fontSize: 13, color: '#6c757d' }}>Description</label>
                    <input
                        className="form-control mb-3 rounded-3"
                        placeholder="Enter description"
                        value={data.content_description || ''}
                        onChange={(e) => onChange({ ...data, content_description: e.target.value })}
                    />
                    <label className="form-label" style={{ fontSize: 13, color: '#6c757d',marginTop: '5px', marginBottom: '8px' }}>
                    Assign Group
                    </label>

                    <div style={{ width: '100%' }}>
                    <Select
                        options={availableGroups.map(group => ({
                        value: group.id,
                        label: group.group_name
                        }))}
                        value={
                        data.group_id
                            ? {
                                value: data.group_id,
                                label: availableGroups.find(g => g.id === data.group_id)?.group_name
                            }
                            : null
                        }
                        onChange={(opt) =>
                        onChange({
                            ...data,
                            group_id: opt?.value ?? ""
                        })
                        }
                        placeholder="Select Group"
                        menuPortalTarget={document.body}
                        styles={{
                        menuPortal: base => ({ ...base, zIndex: 9999 })
                        }}
                    />
                    </div>

                    {currentUser?.role === "Super_Admin" && (
                        <>
                            <label className="form-label" style={{ fontSize: 13, color: '#6c757d', marginTop: '16px', marginBottom: '8px' }}>
                            Administrator
                            </label>

                            <Select
                            options={adminUsers.map(u => ({
                                value: u.id,
                                label: `${u.name} (${u.role})`
                            }))}
                            value={
                                data.administrator_id
                                ? {
                                    value: data.administrator_id,
                                    label: adminUsers.find(u => u.id === data.administrator_id)?.name
                                    }
                                : null
                            }
                            onChange={(opt) =>
                                onChange({
                                ...data,
                                administrator_id: opt?.value || null
                                })
                            }
                            placeholder="Select Administrator"
                            menuPortalTarget={document.body}
                            styles={{
                                menuPortal: base => ({ ...base, zIndex: 9999 })
                            }}
                            />
                        </>
                        )}


                    <div className="d-flex gap-2" style={{ marginTop: 12 }}>
                        <button
                            className="btn"
                            onClick={() => onSubmit(data)}
                            style={{
                                flex: 1,
                                background: '#007bff',
                                color: 'white',
                                borderRadius: 8,
                                padding: '10px 12px',
                                fontWeight: 600,
                            }}
                        >
                            {mode === 'create' ? 'Create' : 'Save'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GroupContentModal;
