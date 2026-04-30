import api from '../../../../utils/api';

/**
 * Fetches analytics data for the dashboard.
 * @param {string} startDate - Optional start date filter.
 * @param {string} endDate - Optional end date filter.
 * @returns {Promise<Object>} The analytics data.
 */
export const getAnalysisData = async (startDate, endDate) => {
    const params = {};
    if (startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
    }

    const response = await api.get('/reports/analytics', { params });
    return response.data?.data || response.data;
};
