import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const BrandingContext = createContext();

export const useBranding = () => useContext(BrandingContext);

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const BrandingProvider = ({ children }) => {
    const [branding, setBranding] = useState({
        systemName: 'Meetza',
        logoUrl: '',
        showPoweredBy: true,
        loading: true
    });

    const fetchBranding = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE_URL}/settings`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = res.data?.data || res.data;
            if (data && typeof data === 'object') {
                setBranding({
                    systemName: data.systemName || data.system_name || 'Meetza',
                    logoUrl: data.logoUrl || data.logo_url || '',
                    showPoweredBy: data.showPoweredBy ?? data.show_powered_by ?? true,
                    loading: false
                });
            } else {
                setBranding(prev => ({ ...prev, loading: false }));
            }
        } catch (error) {
            setBranding(prev => ({ ...prev, loading: false }));
        }
    }, []);

    useEffect(() => {
        fetchBranding();
    }, [fetchBranding]);

    const updateBranding = (newData) => {
        setBranding(prev => ({
            ...prev,
            ...newData
        }));
    };

    return (
        <BrandingContext.Provider value={{ ...branding, refreshBranding: fetchBranding, updateBranding }}>
            {children}
        </BrandingContext.Provider>
    );
};
