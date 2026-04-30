import api from '../../../../utils/api';

export const brandingService = {
  getCompanyData: async () => {
    const res = await api.get(`/companies/id`);
    return res.data?.data || res.data;
  },

  updateCompanyLogo: async (formData) => {
    const res = await api.patch(`/companies/id/logo`, formData);
    return res.data?.data || res.data;
  },

  createCompany: async (payload) => {
    const isFormData = payload instanceof FormData;
    const config = isFormData
      ? {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      : undefined;
    const res = await api.post('/companies', payload, config);
    return res.data?.data || res.data;
  },

  updateCompanySettings: async (settings) => {
    const res = await api.patch(`/companies/id/settings`, settings);
    return res.data?.data || res.data;
  },

  updateCompany: async (data) => {
    const res = await api.patch(`/companies/id`, data);
    return res.data?.data || res.data;
  },

  deleteCompany: async () => {
    const res = await api.delete(`/companies/id`);
    return res.data?.data || res.data;
  },

  addDomain: async (data) => {
    const res = await api.post(`/companies/id/domains`, data);
    return res.data?.data || res.data;
  },

  updateDomain: async (domainId, updates) => {
    const res = await api.patch(`/companies/id/domains/${domainId}`, updates);
    return res.data?.data || res.data;
  },

  deleteDomain: async (domainId) => {
    const res = await api.delete(`/companies/id/domains/${domainId}`);
    return res.data?.data || res.data;
  }
};
