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

    const normalizeLogoUrl = useCallback((rawUrl) => {
        if (!rawUrl || typeof rawUrl !== 'string') return '';
        const trimmed = rawUrl.trim();
        if (!trimmed || trimmed.startsWith('blob:')) return '';

        // Keep already absolute URLs as is.
        if (/^https?:\/\//i.test(trimmed)) return trimmed;

        // Convert relative backend paths to absolute URLs using API base origin.
        try {
            const apiOrigin = new URL(API_BASE_URL).origin;
            const normalizedPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
            return `${apiOrigin}${normalizedPath}`;
        } catch {
            return '';
        }
    }, []);

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

            // First, load branding from localStorage as immediate fallback,
            // then continue and refresh from API to avoid stale logo/name.
            const storedBranding = localStorage.getItem('brandingData');
            if (storedBranding) {
                try {
                    const parsedBranding = JSON.parse(storedBranding);
                    const normalizedStoredBranding = {
                        ...parsedBranding,
                        logoUrl: normalizeLogoUrl(parsedBranding?.logoUrl || '')
                    };
                    setBranding({
                        ...normalizedStoredBranding,
                        loading: false
                    });
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
            
            // Using /id endpoint, no need for companyId logic
            const requestConfig = token
                ? { headers: { Authorization: `Bearer ${token}` } }
                : undefined;
            const res = await axios.get(`${API_BASE_URL}/companies/id`, requestConfig);
            const data = res.data?.data || res.data;
            const settings = data?.settings || {};
            
            if (data && typeof data === 'object') {
                
                // Check if logo URL is valid (not blob)
                const logoUrl = settings.logo_url || '';
                
                const brandingData = {
                    systemName: settings.system_name || data.name || 'Meetza',
                    logoUrl: normalizeLogoUrl(logoUrl),
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
            
            // If company not found/unauthorized, clear localStorage and use defaults
            if (error.response?.status === 404 || error.response?.status === 401) {
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
    }, [normalizeLogoUrl]);

    useEffect(() => {
        fetchBranding();
    }, []);

    const updateBranding = (newData) => {
        const updatedBranding = {
            ...branding,
            ...newData,
            logoUrl: normalizeLogoUrl(newData?.logoUrl ?? branding.logoUrl)
        };
        
        setBranding(updatedBranding);
        
        // Store updated branding data in localStorage for persistence
        localStorage.setItem('brandingData', JSON.stringify(updatedBranding));
    };

    const setBrandingFromProvision = (provisionData) => {
        const settings = provisionData?.settings || {};
        
        // Check if logo URL is valid (not blob)
        const logoUrl = settings.logo_url || '';
        
        const brandingData = {
            systemName: settings.system_name || provisionData.name || 'Meetza',
            logoUrl: normalizeLogoUrl(logoUrl),
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
