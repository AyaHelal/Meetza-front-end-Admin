import React from 'react';

const DomainManagementSection = ({ state, setters, handlers }) => {
    const { domains, isEditMode, showDomainForm, newDomain, hasCompany, authGoogleEnabled } = state;
    const { setDomains, setShowDomainForm, setNewDomain, setUserEditedDomain, setDeleteType, setDeleteItem, setShowDeleteModal } = setters;
    const { handleUpdateDomain, handleUpdateDomainFromInput, handleAddDomain } = handlers;

    return (
        <div className="col-12 mt-4">
            <h5 className="fw-semibold mb-3">Domain Management</h5>
            
            {/* Existing Domain - Show in editable input */}
            {domains.length > 0 && domains.map((domain) => (
                <div key={domain.id} className="domain-item bg-light p-4 rounded-4 mb-3">
                    <div className="row g-3 align-items-end">
                        <div className="col-md-6">
                            <label className="form-label fw-semibold">Domain Name</label>
                            <input
                                type="text"
                                className="form-control rounded-3"
                                value={domain.domain_name}
                                onChange={(e) => {
                                    // Update domain name in state
                                    const updatedDomains = domains.map(d => 
                                        d.id === domain.id ? {...d, domain_name: e.target.value} : d
                                    );
                                    setDomains(updatedDomains);
                                }}
                                disabled={!isEditMode}
                                tabIndex={isEditMode ? "0" : "-1"}
                                style={{ backgroundColor: isEditMode ? 'white' : '#f8f9fa' }}
                            />
                        </div>
                        <div className="col-md-2">
                            <div className="d-flex gap-2">
                                <button 
                                    className="btn btn-sm btn-outline-primary rounded-pill btn-success text-white"
                                    onClick={() => {
                                        // Update domain via API
                                        const domainData = domains.find(d => d.id === domain.id);
                                        if (domainData) {
                                            handleUpdateDomain(domain.id, {
                                                domain_name: domainData.domain_name,
                                                auth_google_enabled: domainData.auth_google_enabled === true || domainData.auth_google_enabled === 'true' || domainData.auth_google_enabled === 1
                                            });
                                        }
                                    }}
                                    disabled={!isEditMode}
                                    title="Update Domain"
                                >
                                    Update
                                </button>
                                <button 
                                    className="btn btn-sm btn-outline-danger rounded-pill"
                                    onClick={() => {
                                        setDeleteType('domain');
                                        setDeleteItem(domain.id);
                                        setShowDeleteModal(true);
                                    }}
                                    disabled={!isEditMode}
                                    title="Delete Domain"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {/* Add New Domain Section */}
            {isEditMode && (
                <div className="domain-add-section mt-3">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                        <h6 className="fw-semibold mb-0">Add New Domain</h6>
                        <button 
                            className="btn btn-outline-primary rounded-pill"
                            onClick={() => setShowDomainForm(!showDomainForm)}
                        >
                            {showDomainForm ? 'Cancel' : 'Add Domain'}
                        </button>
                    </div>
                    
                    {showDomainForm && (
                        <div className="bg-light p-4 rounded-4">
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label">Domain Name</label>
                                    <div className="d-flex gap-2">
                                        <input
                                            type="text"
                                            className="form-control rounded-3"
                                            value={newDomain}
                                            onChange={(e) => {
                                            setNewDomain(e.target.value);
                                            setUserEditedDomain(true);
                                        }}
                                            placeholder="Enter domain name"
                                            tabIndex={isEditMode ? "0" : "-1"}
                                            style={{ backgroundColor: isEditMode ? 'white' : '#f8f9fa' }}
                                        />
                                        {hasCompany && domains.length > 0 && newDomain.trim() && domains[0]?.domain_name === newDomain ? (
                                            <button 
                                                className="btn btn-success rounded-pill px-3" 
                                                onClick={handleUpdateDomainFromInput}
                                                disabled={!newDomain.trim()}
                                            >
                                                Update
                                            </button>
                                        ) : (
                                            <button 
                                                className="btn btn-primary rounded-pill px-3" 
                                                onClick={handleAddDomain}
                                                disabled={!newDomain.trim()}
                                            >
                                                Add
                                            </button>
                                        )}
                                        <button 
                                            className="btn btn-secondary rounded-pill px-3" 
                                            onClick={() => {
                                                setShowDomainForm(false);
                                                setNewDomain('');
                                            }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* No domains message */}
            {domains.length === 0 && !isEditMode && hasCompany && (
                <div className="alert alert-info rounded-4">
                    <div className="d-flex align-items-center">
                        <i className="bi bi-info-circle me-2"></i>
                        <div>
                            <strong>No domains configured</strong>
                            <p className="mb-0 mt-1">Add a domain to enable authentication for your organization.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DomainManagementSection;
