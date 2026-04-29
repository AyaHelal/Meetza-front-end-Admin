import React from 'react';
import './BrandingSettings.css';

import { useBrandingSettings } from './hooks/useBrandingSettings';

import AppearanceSection from './components/AppearanceSection';
import BrandingFormSection from './components/BrandingFormSection';
import DomainManagementSection from './components/DomainManagementSection';
import BrandingActions from './components/BrandingActions';
import BrandingPreviewSection from './components/BrandingPreviewSection';
import DeleteConfirmationModal from './components/DeleteConfirmationModal';

const BrandingSettings = () => {
    const brandingSettings = useBrandingSettings();
    const { state, setters, handlers } = brandingSettings;
    const { isSuperAdmin, theme, showDeleteModal, deleteType } = state;
    const { setTheme, setShowDeleteModal } = setters;
    const { confirmDelete } = handlers;

    return (
        <div className={`branding-settings p-4 ${!isSuperAdmin ? 'no-branding-margin' : ''}`}>
            <AppearanceSection theme={theme} setTheme={setTheme} />

            {isSuperAdmin && (
                <>
                    <div className="branding-header mb-4 mt-3">
                        <h2 className="fw-semibold">Branding </h2>
                        <p className="text-muted">Customize the platform name and logo for your organization.</p>
                    </div>
                    
                    <div className="branding-card shadow-sm rounded-4 p-4 bg-white">
                        <BrandingFormSection state={state} setters={setters} handlers={handlers} />
                        <DomainManagementSection state={state} setters={setters} handlers={handlers} />
                        <BrandingActions state={state} handlers={handlers} />
                    </div>

                    <BrandingPreviewSection 
                        logoDraft={state.logoDraft} 
                        nameDraft={state.nameDraft} 
                        colorDraft={state.colorDraft} 
                    />
                </>
            )}
            
            <DeleteConfirmationModal 
                show={showDeleteModal} 
                onClose={() => setShowDeleteModal(false)} 
                onConfirm={confirmDelete} 
                deleteType={deleteType} 
            />
        </div>
    );
};

export default BrandingSettings;
