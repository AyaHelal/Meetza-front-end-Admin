import api from '../../../../utils/api';

/**
 * Normalize duration from API to seconds.
 * API may return: number (seconds), string number "120", "HH:MM:SS", or ISO date string (MySQL TIME as Date).
 */
export function durationFromApiToSeconds(duration) {
    if (duration == null || duration === '') return 0;
    const num = Number(duration);
    if (!isNaN(num) && num >= 0) return Math.round(num);
    if (typeof duration === 'string') {
        const s = duration.trim();
        const parts = s.split(':').map(Number);
        if (parts.length >= 2 && parts.every((p) => !isNaN(p))) {
            if (parts.length === 2) {
                const [min, sec] = parts;
                return Math.round((min || 0) * 60 + (sec || 0));
            }
            const [h = 0, m = 0, sec = 0] = parts;
            return Math.round((h || 0) * 3600 + (m || 0) * 60 + (sec || 0));
        }
        const isoMatch = s.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
        if (isoMatch) {
            const [, , , , h, m, sec] = isoMatch.map(Number);
            return Math.round((h || 0) * 3600 + (m || 0) * 60 + (sec || 0));
        }
        const numFromStr = Number(s);
        if (!isNaN(numFromStr) && numFromStr >= 0) return Math.round(numFromStr);
    }
    if (typeof duration === 'object' && typeof duration?.getHours === 'function') {
        const d = duration;
        return Math.round(d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds());
    }
    return 0;
}

/** Get duration from a video object (API may use duration, duration_seconds, etc.) */
export function getVideoDuration(video) {
    if (!video) return 0;
    const raw = video.duration ?? video.duration_seconds ?? video.durationSeconds;
    return durationFromApiToSeconds(raw);
}

export function formatDuration(duration) {
    const totalSec = durationFromApiToSeconds(duration);
    if (totalSec <= 0) return '0m 0s';
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
}

export function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
}

/** Build full file URL for poster/video paths returned from the API */
export function buildFileUrl(path, apiInstance = api) {
    if (!path) return '';

    if (path.includes('sharepoint.com') || path.includes('onedrive.aspx')) {
        try {
            const url = new URL(path);
            const idParam = url.searchParams.get('id');
            if (idParam) {
                const baseUrl = `${url.protocol}//${url.host}`;
                const encodedPath = encodeURIComponent(idParam);
                return `${baseUrl}/_layouts/15/getpreview.ashx?path=${encodedPath}&resolution=6`;
            }
            return path;
        } catch (e) {
            console.error('Error processing SharePoint URL:', e);
            return path;
        }
    }

    if (path.startsWith('http://') || path.startsWith('https://')) return path;

    try {
        const base = apiInstance.defaults.baseURL || '';
        const origin = base.replace(/\/api\/?$/, '');
        return `${origin}${path.startsWith('/') ? '' : '/'}${path}`;
    } catch (e) {
        return path;
    }
}

export function getVideoDurationSeconds(file) {
    return new Promise((resolve, reject) => {
        try {
            const url = URL.createObjectURL(file);
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.onloadedmetadata = () => {
                const duration = video.duration || 0;
                URL.revokeObjectURL(url);
                resolve(duration);
            };
            video.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error('Failed to load video metadata'));
            };
            video.src = url;
        } catch (e) {
            reject(e);
        }
    });
}

// ——— API ———

export async function fetchVideosApi() {
    const response = await api.get('/video');
    const videosArray = Array.isArray(response.data)
        ? response.data
        : (Array.isArray(response.data?.data) ? response.data.data : []);
    return videosArray || [];
}

export async function fetchGroupsApi() {
    const res = await api.get('/group');
    return Array.isArray(res.data) ? res.data : res.data?.data || [];
}

export async function fetchLikeCountsApi(videoId) {
    const res = await api.get(`/like/video/${videoId}`);
    const countsArray = res.data.likeCounts || [];
    const counts = { like: 0, dislike: 0 };
    countsArray.forEach((item) => {
        const type = Number(item.like_type);
        if (type === 1) counts.like = item.count;
        else if (type === 0) counts.dislike = item.count;
    });
    return counts;
}

export async function fetchCommentsByVideoIdApi(videoId) {
    const response = await api.get(`/comment/video/${videoId}`);
    let commentsList = [];
    let commentCount = 0;

    if (Array.isArray(response.data)) {
        commentsList = response.data;
        commentCount = commentsList.length;
    } else if (response.data?.data) {
        const wrapper = response.data.data;
        if (Array.isArray(wrapper)) {
            commentsList = wrapper;
            commentCount = commentsList.length;
        } else if (wrapper?.comments && Array.isArray(wrapper.comments)) {
            commentsList = wrapper.comments;
            commentCount = typeof wrapper.commentCount === 'number' ? wrapper.commentCount : commentsList.length;
        }
    } else if (response.data?.comments && Array.isArray(response.data.comments)) {
        commentsList = response.data.comments;
        commentCount = typeof response.data.commentCount === 'number' ? response.data.commentCount : commentsList.length;
    } else {
        if (typeof response.data?.commentCount === 'number') commentCount = response.data.commentCount;
        if (Array.isArray(response.data?.comments)) commentsList = response.data.comments;
    }
    if (commentCount === 0 && Array.isArray(commentsList)) commentCount = commentsList.length;
    return { commentsList, commentCount };
}

export async function searchVideosApi(query) {
    const response = await api.get(`/video?title=${encodeURIComponent(query)}`);
    return Array.isArray(response.data) ? response.data : (response.data?.data || []);
}

export async function updateVideoApi(videoId, formData) {
    const response = await api.post(`/video/${videoId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response?.data?.data?.poster_url;
}

export async function deleteVideoApi(videoId) {
    await api.delete(`/video/${videoId}`);
}

export async function deleteCommentApi(commentId) {
    await api.delete(`comment/${commentId}`);
}

export async function uploadVideoApi(formData, onUploadProgress) {
    const uploadConfig = {
        timeout: 600000,
        ...(onUploadProgress && { onUploadProgress }),
    };
    try {
        await api.post('/video/create', formData, uploadConfig);
    } catch (createErr) {
        if (createErr.response?.status === 404) {
            await api.post('/video', formData, uploadConfig);
        } else {
            throw createErr;
        }
    }
}
