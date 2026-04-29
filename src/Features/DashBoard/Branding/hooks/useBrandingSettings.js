import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { brandingService } from '../services/brandingService';
import { useBranding } from '../../../../context/BrandingContext';
import { useTheme } from '../../../../context/ThemeContext';
import { useAuth } from '../../../../context/AuthContext';

export const useBrandingSettings = () => {
    const { systemName, logoUrl, systemNameColor, updateBranding } = useBranding();
    const { theme, setTheme } = useTheme();
    const { user } = useAuth();
    const userRole = (user?.role || "").toString().trim().toLowerCase();
    const isSuperAdmin = userRole.includes("super_admin") || userRole.includes("super admin") || userRole.includes("leader");

    const [nameDraft, setNameDraft] = useState('');
    const [logoDraft, setLogoDraft] = useState('');
    const [colorDraft, setColorDraft] = useState('');
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [logoFile, setLogoFile] = useState(null);
    
    const [termsHtml, setTermsHtml] = useState('');
    const [privacyHtml, setPrivacyHtml] = useState('');
    const [guidelinesHtml, setGuidelinesHtml] = useState('');
    const [domains, setDomains] = useState([]);
    const [authGoogleEnabled, setAuthGoogleEnabled] = useState(true);
    const [userEditedAuth, setUserEditedAuth] = useState(false);
    const [newDomain, setNewDomain] = useState('');
    const [newDomainGoogleEnabled, setNewDomainGoogleEnabled] = useState(true);
    const [userEditedDomain, setUserEditedDomain] = useState(false);
    const [userEditedTerms, setUserEditedTerms] = useState(false);
    const [userEditedPrivacy, setUserEditedPrivacy] = useState(false);
    const [userEditedGuidelines, setUserEditedGuidelines] = useState(false);
    const [userEditedName, setUserEditedName] = useState(false);
    const [userEditedLogo, setUserEditedLogo] = useState(false);
    const [userEditedColor, setUserEditedColor] = useState(false);
    const [showDomainForm, setShowDomainForm] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteType, setDeleteType] = useState('');
    const [deleteItem, setDeleteItem] = useState(null);
    const [hasCompany, setHasCompany] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [forceUpdate, setForceUpdate] = useState(0);

    const isValidLogoUrl = (url) => {
        if (!url) return false;
        if (url.startsWith('blob:')) return false;
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    const fetchCompanyData = useCallback(async () => {
        try {
            const data = await brandingService.getCompanyData();
            const settings = data?.settings || {};
            
            setHasCompany(true);
            
            if (!userEditedName) setNameDraft(data.name || '');
            
            if (!userEditedLogo) {
                const fetchedLogoUrl = settings.logo_url || '';
                if (isValidLogoUrl(fetchedLogoUrl)) {
                    setLogoDraft(fetchedLogoUrl);
                } else if (isValidLogoUrl(logoUrl)) {
                    setLogoDraft(logoUrl);
                }
            }

            if (!userEditedColor) setColorDraft(settings.system_name_color || '');
            
            setTermsHtml(settings.terms_html || '');
            setPrivacyHtml(settings.privacy_html || '');
            setGuidelinesHtml(settings.guidelines_html || '');
            setTheme(settings.theme || 'light');
            setDomains(data.domains || []);
            setAuthGoogleEnabled(settings.auth_google_enabled !== false);
            
            setForceUpdate(prev => prev + 1);
        } catch (error) {
            console.error('Error fetching company data:', error);
        }
    }, [userEditedName, userEditedLogo, userEditedColor, logoUrl, setTheme]);

    useEffect(() => {
        if (!nameDraft.trim()) setNameDraft(systemName);
        if (!logoDraft.trim()) setLogoDraft(logoUrl);
        if (!colorDraft.trim()) setColorDraft(systemNameColor);
        
        fetchCompanyData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getToken = () => {
        let token = localStorage.getItem("authToken");
        if (!token) {
            token = sessionStorage.getItem("authToken");
        }
        return token;
    };

    const handleLogoUpload = async (e) => {
        if (!e.target.files || e.target.files.length === 0) return;
        
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('company_logo', file);

        try {
            if (!getToken()) {
                toast.error('Authentication token not found. Please login again.');
                setUploading(false);
                return;
            }
            
            const data = await brandingService.updateCompanyLogo(formData);
            const url = data?.settings?.logo_url || data?.logo_url;
            if (url) {
                setLogoDraft(url);
                setLogoFile(null);
                setUserEditedLogo(false);
                toast.success('Logo updated successfully');
            }
        } catch (error) {
            console.error('Logo update error:', error);
            toast.error('Failed to update logo');
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
            if (!getToken()) {
                toast.error('Authentication token not found. Please login again.');
                setSaving(false);
                return;
            }
            
            if (!hasCompany) {
                const formData = new FormData();
                formData.append('name', nameDraft);
                formData.append('is_active', true);
                formData.append('system_name', nameDraft);
                formData.append('system_name_color', colorDraft || '#000000');
                formData.append('theme', theme || 'light');
                formData.append('terms_html', termsHtml || '<h1>Terms</h1>');
                formData.append('privacy_html', privacyHtml || '<h1>Privacy</h1>');
                formData.append('guidelines_html', guidelinesHtml || '<h1>Guidelines</h1>');
                formData.append('auth_email_enabled', true);
                formData.append('auth_google_enabled', true);
                
                if (logoFile) {
                    formData.append('company_logo', logoFile);
                }
                
                const data = await brandingService.createCompany(formData);
                
                if (data?.name) {
                    updateBranding({
                        systemName: data.name,
                        logoUrl: logoDraft,
                        systemNameColor: colorDraft
                    });
                    
                    setHasCompany(true);
                    toast.success('Company created and settings saved successfully');
                    fetchCompanyData();
                }
            } else {
                await brandingService.updateCompanySettings({
                    system_name: nameDraft,
                    logo_url: logoDraft,
                    system_name_color: colorDraft,
                    theme: theme || 'light',
                    terms_html: termsHtml,
                    privacy_html: privacyHtml,
                    guidelines_html: guidelinesHtml,
                    auth_email_enabled: true,
                    auth_google_enabled: authGoogleEnabled
                });

                updateBranding({
                    systemName: nameDraft,
                    logoUrl: logoDraft,
                    systemNameColor: colorDraft
                });
                toast.success('Branding settings updated successfully');
            }
            
            setSaving(false);
            setIsEditMode(false);
            fetchCompanyData();
        } catch (error) {
            console.error('Save error:', error);
            toast.error(hasCompany ? 'Failed to update settings' : 'Failed to create company');
            setSaving(false);
        }
    };

    const handleUpdateCompany = async () => {
        if (!nameDraft.trim()) {
            toast.error('Company name cannot be empty');
            return;
        }

        try {
            if (!getToken()) {
                toast.error('Authentication token not found. Please login again.');
                return;
            }
            
            const data = await brandingService.updateCompany({
                name: nameDraft,
                is_active: true
            });
            
            if (data?.name) {
                updateBranding({
                    systemName: data.name,
                    logoUrl: logoUrl,
                    systemNameColor: systemNameColor
                });
                toast.success('Company updated successfully');
            }
        } catch (error) {
            console.error('Company update error:', error);
            toast.error('Failed to update company');
        }
    };

    const handleCreateCompany = () => {
        setIsEditMode(true);
        setNameDraft('');
        setLogoDraft('');
        setColorDraft('#2c3e50');
        setTermsHtml('');
        setPrivacyHtml('');
        setGuidelinesHtml('');
        setAuthGoogleEnabled(true);
        setUserEditedAuth(false);
        setUserEditedDomain(false);
        setUserEditedName(false);
        setUserEditedLogo(false);
        setUserEditedColor(false);
        setUserEditedTerms(false);
        setUserEditedPrivacy(false);
        setUserEditedGuidelines(false);
        setDomains([]);
    };

    const handleUpdateMode = () => setIsEditMode(true);

    const handleDeleteCompany = () => {
        setDeleteType('company');
        setDeleteItem(null);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            if (!getToken()) {
                toast.error('Authentication token not found. Please login again.');
                return;
            }

            if (deleteType === 'company') {
                await brandingService.deleteCompany();
                
                localStorage.removeItem('selectedCompany');
                localStorage.removeItem('companySettings');
                localStorage.removeItem('brandingData');
                localStorage.removeItem('companyDomains');
                
                toast.success('Company deleted successfully');
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 2000);
            } else if (deleteType === 'domain' && deleteItem) {
                await brandingService.deleteDomain(deleteItem);
                
                setDomains(domains.filter(d => d.id !== deleteItem));
                toast.success('Domain deleted successfully');
            }
        } catch (error) {
            console.error(`Delete ${deleteType} error:`, error);
            toast.error(`Failed to delete ${deleteType}`);
        }
        
        setShowDeleteModal(false);
        setDeleteType('');
        setDeleteItem(null);
    };

    const handleAddDomain = async () => {
        if (!newDomain.trim()) {
            toast.error('Domain name cannot be empty');
            return;
        }

        try {
            if (!getToken()) {
                toast.error('Authentication token not found. Please login again.');
                return;
            }
            
            const newDomainData = await brandingService.addDomain({
                domain_name: newDomain,
                auth_email_enabled: true,
                auth_google_enabled: Boolean(newDomainGoogleEnabled)
            });
            
            setDomains([...domains, newDomainData]);
            setNewDomain('');
            setNewDomainGoogleEnabled(true);
            setShowDomainForm(false);
            toast.success('Domain added successfully');
        } catch (error) {
            console.error('Add domain error:', error);
            toast.error('Failed to add domain');
        }
    };

    const handleUpdateDomain = async (domainId, updates) => {
        try {
            if (!getToken()) {
                toast.error('Authentication token not found. Please login again.');
                return;
            }
            
            const updatedDomain = await brandingService.updateDomain(domainId, updates);
            setDomains(domains.map(d => d.id === domainId ? updatedDomain : d));
            toast.success('Domain updated successfully');
        } catch (error) {
            console.error('Update domain error:', error);
            toast.error('Failed to update domain');
        }
    };

    const handleUpdateDomainFromInput = async () => {
        if (!newDomain.trim()) {
            toast.error('Domain name cannot be empty');
            return;
        }

        try {
            if (!getToken()) {
                toast.error('Authentication token not found. Please login again.');
                return;
            }
            
            const existingDomain = domains[0];
            if (!existingDomain) {
                toast.error('No domain found to update');
                return;
            }
            
            const domainId = existingDomain.id || existingDomain._id;
            if (!domainId) {
                toast.error('Domain ID not found');
                return;
            }
            
            const updatedDomain = await brandingService.updateDomain(domainId, {
                domain_name: newDomain,
                auth_email_enabled: true,
                auth_google_enabled: authGoogleEnabled ? true : false
            });
            
            setDomains(domains.map(d => d.id === existingDomain.id ? updatedDomain : d));
            setNewDomain('');
            setNewDomainGoogleEnabled(true);
            setUserEditedDomain(false);
            setShowDomainForm(false);
            toast.success('Domain updated successfully');
        } catch (error) {
            console.error('Update domain error:', error);
            toast.error('Failed to update domain');
        }
    };

    const handleDeleteDomain = (domainId) => {
        setDeleteType('domain');
        setDeleteItem(domainId);
        setShowDeleteModal(true);
    };

    const cancelEdit = () => {
        setNameDraft(systemName);
        setLogoDraft(logoUrl);
        setColorDraft(systemNameColor);
        setIsEditMode(false);
    };

    return {
        state: {
            systemName, logoUrl, systemNameColor, isSuperAdmin, theme,
            nameDraft, logoDraft, colorDraft, saving, uploading, logoFile,
            termsHtml, privacyHtml, guidelinesHtml, domains, authGoogleEnabled,
            newDomain, showDomainForm, showDeleteModal, deleteType, hasCompany, isEditMode
        },
        setters: {
            setTheme, setNameDraft, setLogoDraft, setColorDraft, setLogoFile,
            setTermsHtml, setPrivacyHtml, setGuidelinesHtml, setAuthGoogleEnabled,
            setNewDomain, setShowDomainForm, setShowDeleteModal,
            setUserEditedName, setUserEditedColor, setUserEditedLogo,
            setUserEditedTerms, setUserEditedPrivacy, setUserEditedGuidelines,
            setUserEditedAuth, setUserEditedDomain, setDomains, setDeleteType, setDeleteItem
        },
        handlers: {
            handleLogoUpload, handleSave, handleUpdateCompany, handleCreateCompany,
            handleUpdateMode, handleDeleteCompany, confirmDelete,
            handleAddDomain, handleUpdateDomain, handleUpdateDomainFromInput, handleDeleteDomain,
            cancelEdit
        }
    };
};
