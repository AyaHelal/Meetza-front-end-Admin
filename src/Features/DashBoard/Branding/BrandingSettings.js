import React, { useState, useEffect } from 'react';
import { useBranding } from '../../../context/BrandingContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { UploadSimple, Trash, CheckCircle } from 'phosphor-react';
import './BrandingSettings.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const BrandingSettings = () => {
    const { systemName, logoUrl, showPoweredBy, updateBranding } = useBranding();
    const [nameDraft, setNameDraft] = useState(systemName);
    const [logoDraft, setLogoDraft] = useState(logoUrl);
    const [poweredByDraft, setPoweredByDraft] = useState(showPoweredBy);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        setNameDraft(systemName);
        setLogoDraft(logoUrl);
        setPoweredByDraft(showPoweredBy);
    }, [systemName, logoUrl, showPoweredBy]);

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('media', file);

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_BASE_URL}/upload-logo`, formData, {
                headers: { 
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });
            const url = res.data?.url || res.data?.data?.url;
            if (url) {
                setLogoDraft(url);
                toast.success('Logo uploaded successfully');
            }
        } catch (error) {
            toast.error('Failed to upload logo');
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        if (!nameDraft.trim()) {
            toast.error('System name cannot be empty');
            return;
        }

        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_BASE_URL}/settings`, {
                systemName: nameDraft,
                logoUrl: logoDraft,
                showPoweredBy: poweredByDraft
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            updateBranding({
                systemName: nameDraft,
                logoUrl: logoDraft,
                showPoweredBy: poweredByDraft
            });
            toast.success('Branding settings updated successfully');
        } catch (error) {
            toast.error('Failed to update settings');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="branding-settings p-4">
            <div className="branding-header mb-4">
                <h2 className="fw-bold">Branding Settings</h2>
                <p className="text-muted">Customize the platform name and logo for your organization.</p>
            </div>

            <div className="branding-card shadow-sm rounded-4 p-4 bg-white">
                <div className="row g-4">
                    <div className="col-md-6">
                        <label className="form-label fw-semibold">Platform Name</label>
                        <input
                            type="text"
                            className="form-control form-control-lg rounded-3"
                            value={nameDraft}
                            onChange={(e) => setNameDraft(e.target.value)}
                            placeholder="e.g. My University"
                        />
                        <div className="form-text mt-2">This name will appear in page titles and headers.</div>
                    </div>

                    <div className="col-md-6">
                        <label className="form-label fw-semibold">Powered by Meetza</label>
                        <div className="form-check form-switch mt-2">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                role="switch"
                                id="poweredBySwitch"
                                checked={poweredByDraft}
                                onChange={(e) => setPoweredByDraft(e.target.checked)}
                            />
                            <label className="form-check-label" htmlFor="poweredBySwitch">
                                Show "Powered by Meetza" in footer
                            </label>
                        </div>
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
                                <label className={`btn btn-primary rounded-pill px-4 ${uploading ? 'disabled' : ''}`}>
                                    {uploading ? 'Uploading...' : 'Upload New Logo'}
                                    <input type="file" hidden accept="image/*" onChange={handleLogoUpload} disabled={uploading} />
                                </label>
                                {logoDraft && (
                                    <button className="btn btn-outline-danger rounded-pill px-4" onClick={() => setLogoDraft('')}>
                                        <Trash className="me-2" /> Remove
                                    </button>
                                )}
                                <div className="form-text">Recommended: Transparent PNG, 512x512px.</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="branding-actions mt-5 pt-3 border-top d-flex justify-content-end gap-3">
                    <button className="btn btn-light rounded-pill px-5" onClick={() => {
                        setNameDraft(systemName);
                        setLogoDraft(logoUrl);
                        setPoweredByDraft(showPoweredBy);
                    }}>Cancel</button>
                    <button className="btn btn-success rounded-pill px-5 d-flex align-items-center" onClick={handleSave} disabled={saving}>
                        {saving ? 'Saving...' : (
                            <>
                                <CheckCircle className="me-2" size={20} />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Preview Section */}
            <div className="branding-preview-section mt-5">
                <h4 className="fw-bold mb-3">Live Preview</h4>
                <div className="preview-navbar p-3 rounded-4 shadow-sm bg-white d-flex align-items-center justify-content-between mb-4">
                    <div className="d-flex flex-column">
                        <img src={logoDraft || "/assets/MeetzaLogo.png"} alt="Logo" style={{ height: '40px', objectFit: 'contain' }} />
                        {logoDraft && (
                            <div className="d-flex align-items-center mt-1" style={{ opacity: 0.6 }}>
                                <span style={{ fontSize: '8px', marginRight: '3px' }}>Powered by</span>
                                <img src="/assets/MeetzaLogo.png" alt="Meetza" style={{ height: '10px' }} />
                            </div>
                        )}
                    </div>
                    <span className="fw-bold h5 mb-0">{nameDraft}</span>
                </div>
                <div className="preview-footer p-3 rounded-4 shadow-sm bg-dark text-white d-flex justify-content-between align-items-center">
                    <span>© 2025 {nameDraft} — All rights reserved</span>
                    {poweredByDraft && (
                        <div className="d-flex align-items-center" style={{ opacity: 0.7 }}>
                            <small style={{ fontSize: '10px', marginRight: '4px' }}>Powered by</small>
                            <img src="/assets/MeetzaLogo.png" alt="Meetza" style={{ height: '12px', filter: 'brightness(10)' }} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BrandingSettings;
