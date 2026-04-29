import React from 'react';
import { CheckCircle, UploadSimple, Trash } from 'phosphor-react';

const BrandingFormSection = ({ state, setters, handlers }) => {
    const {
        nameDraft, colorDraft, logoDraft, logoFile, termsHtml, privacyHtml, guidelinesHtml, authGoogleEnabled,
        isEditMode, hasCompany, uploading, saving
    } = state;
    const {
        setNameDraft, setColorDraft, setTermsHtml, setPrivacyHtml, setGuidelinesHtml, setAuthGoogleEnabled,
        setUserEditedName, setUserEditedColor, setUserEditedTerms, setUserEditedPrivacy, setUserEditedGuidelines, setUserEditedAuth,
        setLogoDraft, setLogoFile
    } = setters;
    const { handleUpdateMode, handleUpdateCompany, handleLogoUpload } = handlers;

    return (
        <div className="row g-4">
            <div className="col-md-6">
                <label className="form-label fw-semibold">Platform Name</label>
                <div className="d-flex gap-2">
                    <input
                        type="text"
                        className="form-control form-control-lg rounded-3"
                        value={nameDraft}
                        onChange={(e) => {
                            setNameDraft(e.target.value);
                            setUserEditedName(true);
                        }}
                        placeholder="e.g. My University"
                        readOnly={!isEditMode}
                        disabled={!isEditMode}
                        tabIndex={isEditMode ? "0" : "-1"}
                        style={{ backgroundColor: isEditMode ? 'white' : '#f8f9fa' }}
                    />
                    {hasCompany && !isEditMode && (
                        <button 
                            className="btn btn-primary rounded-pill px-3 d-flex align-items-center" 
                            onClick={handleUpdateMode} 
                            title="Edit Company Name Only"
                        >
                            <CheckCircle size={18} />
                        </button>
                    )}
                    {hasCompany && isEditMode && (
                        <button 
                            className="btn btn-success rounded-pill px-3 d-flex align-items-center" 
                            onClick={handleUpdateCompany} 
                            disabled={saving}
                            title="Update Company Name Only"
                        >
                            <CheckCircle size={18} />
                        </button>
                    )}
                </div>
                <div className="form-text mt-2">This name will appear in page titles and headers.</div>
            </div>

            <div className="col-md-6">
                <label className="form-label fw-semibold">System Name Color</label>
                <div className="d-flex align-items-center gap-3">
                    <input
                        type="color"
                        className="form-control form-control-color rounded-3"
                        value={colorDraft || '#2c3e50'}
                        onChange={(e) => {
                            setColorDraft(e.target.value);
                            setUserEditedColor(true);
                        }}
                        style={{ width: '60px', height: '40px' }}
                        readOnly={!isEditMode}
                        disabled={!isEditMode}
                        tabIndex={isEditMode ? "0" : "-1"}
                    />
                    <input
                        type="text"
                        className="form-control form-control-lg rounded-3"
                        value={colorDraft || '#2c3e50'}
                        onChange={(e) => {
                            setColorDraft(e.target.value);
                            setUserEditedColor(true);
                        }}
                        placeholder="#2c3e50"
                        style={{ fontFamily: 'monospace', backgroundColor: isEditMode ? 'white' : '#f8f9fa' }}
                        readOnly={!isEditMode}
                        disabled={!isEditMode}
                        tabIndex={isEditMode ? "0" : "-1"}
                    />
                </div>
                <div className="form-text mt-2">Choose a color for your system name display.</div>
            </div>

            <div className="col-12 mt-4">
                <label className="form-label fw-semibold">Platform Logo</label>
                <div className="logo-upload-container d-flex align-items-center gap-4 p-4 rounded-4 border-dashed">
                    <div className="logo-preview bg-light rounded-4 d-flex align-items-center justify-content-center">
                        {logoDraft ? (
                            <img src={logoDraft} alt="Preview" className="img-fluid rounded-4" style={{ maxHeight: '100px' }} />
                        ) : (
                            <div className="text-muted text-center p-3">
                                <UploadSimple size={40} className="mb-2" />
                                <div>No Logo</div>
                            </div>
                        )}
                    </div>
                    <div className="logo-actions d-flex flex-column gap-2">
                        {isEditMode && (
                            <>
                                {hasCompany && logoDraft ? (
                                    <label className={`btn btn-success rounded-pill px-4 ${uploading ? 'disabled' : ''}`}>
                                        {uploading ? 'Updating...' : 'Update Logo'}
                                        <input type="file" hidden accept="image/*" onChange={handleLogoUpload} disabled={uploading} />
                                    </label>
                                ) : (
                                    <label className={`btn btn-primary rounded-pill px-4 ${uploading ? 'disabled' : ''}`}>
                                        {logoFile ? 'Logo Selected' : 'Upload Logo'}
                                        <input type="file" hidden accept="image/*" onChange={handleLogoUpload} disabled={uploading} />
                                    </label>
                                )}
                                
                                {logoDraft && isEditMode && (
                                    <button className="btn btn-outline-danger rounded-pill px-4" onClick={() => {
                                        setLogoDraft('');
                                        setLogoFile(null);
                                    }}>
                                        <Trash className="me-2" /> Remove
                                    </button>
                                )}
                            </>
                        )}
                        <div className="form-text">Recommended: Transparent PNG, 512x512px.</div>
                    </div>
                </div>
            </div>

            {/* HTML Content Section */}
            <div className="col-12 mt-4">
                <h5 className="fw-semibold mb-3">Footer Content</h5>
                <div className="row g-4">
                    <div className="col-md-4">
                        <label className="form-label fw-semibold">Terms</label>
                        <textarea
                            className="form-control rounded-3"
                            value={termsHtml}
                            onChange={(e) => {
                            setTermsHtml(e.target.value);
                            setUserEditedTerms(true);
                        }}
                            placeholder="Enter content for Terms"
                            rows="4"
                            readOnly={!isEditMode}
                            disabled={!isEditMode}
                            tabIndex={isEditMode ? "0" : "-1"}
                            style={{ backgroundColor: isEditMode ? 'white' : '#f8f9fa' }}
                        />
                    </div>
                    <div className="col-md-4">
                        <label className="form-label fw-semibold">Privacy</label>
                        <textarea
                            className="form-control rounded-3"
                            value={privacyHtml}
                            onChange={(e) => {
                            setPrivacyHtml(e.target.value);
                            setUserEditedPrivacy(true);
                        }}
                            placeholder="Enter content for Privacy"
                            rows="4"
                            readOnly={!isEditMode}
                            disabled={!isEditMode}
                            tabIndex={isEditMode ? "0" : "-1"}
                            style={{ backgroundColor: isEditMode ? 'white' : '#f8f9fa' }}
                        />
                    </div>
                    <div className="col-md-4">
                        <label className="form-label fw-semibold">Guidelines</label>
                        <textarea
                            className="form-control rounded-3"
                            value={guidelinesHtml}
                            onChange={(e) => {
                            setGuidelinesHtml(e.target.value);
                            setUserEditedGuidelines(true);
                        }}
                            placeholder="Enter content for Guidelines"
                            rows="4"
                            readOnly={!isEditMode}
                            disabled={!isEditMode}
                            tabIndex={isEditMode ? "0" : "-1"}
                            style={{ backgroundColor: isEditMode ? 'white' : '#f8f9fa' }}
                        />
                    </div>
                </div>
            </div>

            {/* Authentication Settings */}
            <div className="col-12 mt-4">
                <h5 className="fw-semibold mb-3">Authentication Settings</h5>
                <div className="row g-4">
                    <div className="col-md-6">
                        <label className="form-label fw-semibold">Google Authentication</label>
                        <div className="d-flex align-items-center gap-3">
                            <div className="form-check form-switch">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    checked={authGoogleEnabled}
                                    onChange={(e) => {
                                        setAuthGoogleEnabled(e.target.checked);
                                        setUserEditedAuth(true);
                                    }}
                                    disabled={!isEditMode}
                                />
                                <label className="form-check-label">
                                    Enable Google Login
                                </label>
                            </div>
                        </div>
                        <div className="form-text mt-2">Show Google login button on authentication page.</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BrandingFormSection;
