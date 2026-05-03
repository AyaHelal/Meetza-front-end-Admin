import React from 'react';

const BrandingPreviewSection = ({ logoDraft, nameDraft, colorDraft }) => {
    return (
        <div className="branding-preview-section mt-5">
            <h4 className="fw-bold mb-3">Live Preview</h4>
            <div className="preview-navbar p-3 rounded-4 shadow-sm bg-white d-flex align-items-center justify-content-between mb-4">
                <div className="d-flex flex-column">
                    <img 
                        src={(logoDraft && nameDraft?.toLowerCase() !== 'meetza') ? logoDraft : "/assets/MeetzaLogo.png"} 
                        alt="Logo" 
                        style={{ height: '40px', objectFit: 'contain' }} 
                    />
                    {logoDraft && nameDraft?.toLowerCase() !== 'meetza' && (
                        <div className="d-flex align-items-center mt-1" style={{ opacity: 0.6 }}>
                            <span style={{ fontSize: '8px', marginRight: '3px' }}>Powered by</span>
                            <img src="/assets/MeetzaLogo.png" alt="Meetza" style={{ height: '10px' }} />
                            <img src="/assets/MeetzaWord.png" alt="Meetza" style={{ height: '10px' }} />
                        </div>
                    )}
                </div>
                <span className="fw-bold h5 mb-0" style={{ color: nameDraft !== 'Meetza' ? colorDraft : '#2c3e50' }}>{nameDraft}</span>
            </div>
            <div className="preview-footer p-3 rounded-4 shadow-sm bg-dark text-white d-flex justify-content-between align-items-center">
                <span>© 2025 Meetza — All rights reserved</span>
                <div className="d-flex align-items-center" style={{ opacity: 0.7 }}>
                    <small style={{ fontSize: '10px', marginRight: '4px' }}>Powered by</small>
                    <img src="/assets/MeetzaLogo.png" alt="Meetza" style={{ height: '12px', filter: 'brightness(10)' }} />
                    <img src="/assets/MeetzaWord.png" alt="Meetza" style={{ height: '12px', filter: 'brightness(10)' }} />
                </div>
            </div>
        </div>
    );
};

export default BrandingPreviewSection;
