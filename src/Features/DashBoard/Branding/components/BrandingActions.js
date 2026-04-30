import React from 'react';
import { CheckCircle, Trash, PlusCircle } from 'phosphor-react';

const BrandingActions = ({ state, handlers }) => {
    const { hasCompany, isEditMode, saving } = state;
    const { handleSave, handleUpdateMode, handleDeleteCompany, handleCreateCompany, cancelEdit } = handlers;

    return (
        <div className="branding-actions mt-5 pt-3 border-top d-flex justify-content-end gap-3">
            <button className="btn btn-light rounded-pill px-4" onClick={cancelEdit}>Cancel</button>
            {hasCompany ? (
                <>
                    {isEditMode ? (
                        <button className="btn btn-success rounded-pill px-4 d-flex align-items-center" onClick={handleSave} disabled={saving}>
                            {saving ? 'Saving...' : (
                                <>
                                    <CheckCircle className="me-2" size={18} />
                                    Save Settings
                                </>
                            )}
                        </button>
                    ) : (
                        <button className="btn btn-primary rounded-pill px-4 d-flex align-items-center" onClick={handleUpdateMode}>
                            <CheckCircle className="me-2" size={18} />
                            Update
                        </button>
                    )}
                    <button className="btn btn-danger rounded-pill px-4 d-flex align-items-center" onClick={handleDeleteCompany}>
                        <Trash className="me-2" size={18} />
                        Delete Company
                    </button>
                </>
            ) : (
                <>
                    {isEditMode ? (
                        <button className="btn btn-success rounded-pill px-4 d-flex align-items-center" onClick={handleSave} disabled={saving}>
                            {saving ? 'Creating...' : (
                                <>
                                    <PlusCircle className="me-2" size={18} />
                                    Create Company
                                </>
                            )}
                        </button>
                    ) : (
                        <button className="btn btn-primary rounded-pill px-4 d-flex align-items-center" onClick={handleCreateCompany}>
                            <PlusCircle className="me-2" size={18} />
                            Create Company
                        </button>
                    )}
                </>
            )}
        </div>
    );
};

export default BrandingActions;
