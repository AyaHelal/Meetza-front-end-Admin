import React from 'react';
import { CheckCircle } from 'phosphor-react';

const AppearanceSection = ({ theme, setTheme }) => {
    return (
        <div className="appearance-section mb-3">
            <div className="appearance-header mb-4">
                <h2 className="fw-semibold">Appearance</h2>
                <p className="text-muted">Choose how the app looks and feels.</p>
            </div>
            <div className="appearance-card shadow-sm rounded-4 p-4 bg-white">
                <label className="form-label fw-bold text-uppercase small text-muted mb-3">Theme</label>
                <div className="row g-4">
                    <div className="col-md-6">
                        <div className={`theme-preview-card ${theme === 'light' ? 'active' : ''}`} onClick={() => setTheme('light')}>
                            <div className="theme-mockup light">
                                <div className="d-flex gap-2 h-100">
                                    <div className="mock-sidebar"></div>
                                    <div className="mock-content">
                                        <div className="mock-line w-25"></div>
                                        <div className="mock-line w-50"></div>
                                        <div className="mock-line w-75"></div>
                                    </div>
                                </div>
                            </div>
                            <div className="theme-label-bar d-flex justify-content-between align-items-center">
                                <span className="fw-bold">Light</span>
                                {theme === 'light' ? (
                                    <CheckCircle size={22} weight="fill" color="#0d6efd" />
                                ) : (
                                    <div className="check-placeholder" />
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className={`theme-preview-card ${theme === 'dark' ? 'active' : ''}`} onClick={() => setTheme('dark')}>
                            <div className="theme-mockup dark">
                                <div className="d-flex gap-2 h-100">
                                    <div className="mock-sidebar"></div>
                                    <div className="mock-content">
                                        <div className="mock-line w-25"></div>
                                        <div className="mock-line w-50"></div>
                                        <div className="mock-line w-75"></div>
                                    </div>
                                </div>
                            </div>
                            <div className="theme-label-bar d-flex justify-content-between align-items-center">
                                <span className="fw-bold">Dark</span>
                                {theme === 'dark' ? (
                                    <CheckCircle size={22} weight="fill" color="#0d6efd" />
                                ) : (
                                    <div className="check-placeholder" />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppearanceSection;
