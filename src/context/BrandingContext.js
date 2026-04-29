import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const BrandingContext = createContext();

export const useBranding = () => useContext(BrandingContext);

const API_BASE_URL = process.env.REACT_APP_API_BASE;

export const BrandingProvider = ({ children }) => {
    const [branding, setBranding] = useState({
        systemName: 'Meetza',
        logoUrl: '',
        systemNameColor: '#2c3e50',
        showPoweredBy: true,
        loading: true
    });

    const fetchBranding = useCallback(async () => {
        try {
            // Check if company was deleted (localStorage cleared)
            const hasCompanyData = localStorage.getItem('selectedCompany') || 
                                  localStorage.getItem('companySettings') || 
                                  localStorage.getItem('brandingData');
            
            if (!hasCompanyData) {
                // No company data exists, try to fetch from API first
                // Don't return here, continue to API fetch
            }

            // First, try to load branding from localStorage
            const storedBranding = localStorage.getItem('brandingData');
            if (storedBranding) {
                try {
                    const parsedBranding = JSON.parse(storedBranding);
                    setBranding({
                        ...parsedBranding,
                        loading: false
                    });
                    return; // Use stored data, don't fetch from API
                } catch (e) {
                    console.warn('Failed to parse stored branding data');
                    // Continue to API fetch if stored data is invalid
                }
            }

            // Get token from the same place AuthContext uses
            let token = localStorage.getItem("authToken");
            if (!token) {
                token = sessionStorage.getItem("authToken");
            }
            
            if (!token) {
                console.warn('No token found, using default branding');
                setBranding(prev => ({ ...prev, loading: false }));
                return;
            }
            
            // Using /id endpoint, no need for companyId logic
            
            const res = await axios.get(`${API_BASE_URL}/companies/id`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = res.data?.data || res.data;
            const settings = data?.settings || {};
            
            if (data && typeof data === 'object') {
                
                // Check if logo URL is valid (not blob)
                const logoUrl = settings.logo_url || '';
                
                const isValidLogoUrl = (url) => {
                    if (!url) return false;
                    // Check if it's a blob URL (invalid for display)
                    if (url.startsWith('blob:')) return false;
                    // Check if it's a valid HTTP/HTTPS URL
                    try {
                        new URL(url);
                        return true;
                    } catch {
                        return false;
                    }
                };
                
                const brandingData = {
                    systemName: settings.system_name || data.name || 'Meetza',
                    logoUrl: isValidLogoUrl(logoUrl) ? logoUrl : '',
                    systemNameColor: settings.system_name_color || '#2c3e50',
                    showPoweredBy: true, // This might not be in backend yet
                    loading: false
                };
                
                setBranding(brandingData);
                
                // Store branding data in localStorage for persistence
                localStorage.setItem('brandingData', JSON.stringify(brandingData));
                
            } else {
                setBranding(prev => ({ ...prev, loading: false }));
            }
        } catch (error) {
            console.error('Branding fetch error:', error);
            console.error('Error details:', error.response?.data);
            
            // If company not found (404), clear localStorage and use defaults
            if (error.response?.status === 404) {
                localStorage.removeItem('selectedCompany');
                localStorage.removeItem('companySettings');
                localStorage.removeItem('brandingData');
                localStorage.removeItem('companyDomains');
                
                setBranding({
                    systemName: 'Meetza',
                    logoUrl: '',
                    systemNameColor: '#2c3e50',
                    showPoweredBy: true,
                    loading: false
                });
            } else {
                setBranding(prev => ({ ...prev, loading: false }));
            }
        }
    }, []);

    useEffect(() => {
        fetchBranding();
    }, []);

    const updateBranding = (newData) => {
        const updatedBranding = {
            ...branding,
            ...newData
        };
        
        setBranding(updatedBranding);
        
        // Store updated branding data in localStorage for persistence
        localStorage.setItem('brandingData', JSON.stringify(updatedBranding));
    };

    const setBrandingFromProvision = (provisionData) => {
        const settings = provisionData?.settings || {};
        
        // Check if logo URL is valid (not blob)
        const logoUrl = settings.logo_url || '';
        const isValidLogoUrl = (url) => {
            if (!url) return false;
            // Check if it's a blob URL (invalid for display)
            if (url.startsWith('blob:')) return false;
            // Check if it's a valid HTTP/HTTPS URL
            try {
                new URL(url);
                return true;
            } catch {
                return false;
            }
        };
        
        const brandingData = {
            systemName: settings.system_name || provisionData.name || 'Meetza',
            logoUrl: isValidLogoUrl(logoUrl) ? logoUrl : '',
            systemNameColor: settings.system_name_color || '#2c3e50',
            showPoweredBy: true,
            loading: false
        };
        
        setBranding(brandingData);
        
        // Store branding data in localStorage for persistence
        localStorage.setItem('brandingData', JSON.stringify(brandingData));
        
        
    };

    return (
        <BrandingContext.Provider value={{ ...branding, refreshBranding: fetchBranding, updateBranding, setBrandingFromProvision }}>
            {children}
        </BrandingContext.Provider>
    );
};
