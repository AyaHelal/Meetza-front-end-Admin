import api from '../../../../utils/api';

/** Static asset used when no poster is uploaded; place file at `public/assets/video-standard.png`. */
export function getDefaultPosterPublicUrl() {
    const p = (typeof process !== 'undefined' && process.env && process.env.PUBLIC_URL) || '';
    if (!p) return '/assets/video-standard.png';
    return `${p.replace(/\/$/, '')}/assets/video-standard.png`;
}

/** File used in upload FormData when the user does not select a poster image. */
export async function getDefaultPosterFile() {
    const url = getDefaultPosterPublicUrl();
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Default poster not found (${url})`);
    const blob = await res.blob();
    return new File([blob], 'video-standard.png', { type: blob.type || 'image/png' });
}

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

export function formatRelativeTime(isoString) {
    if (!isoString) return '';
    let date = new Date(isoString);

    // Handle MySQL datetime string "YYYY-MM-DD HH:mm:ss" - treat as UTC
    if (typeof isoString === 'string' && !isoString.includes('T') && !isoString.includes('Z')) {
        date = new Date(isoString.replace(' ', 'T') + 'Z');
    }

    if (Number.isNaN(date.getTime())) return '';
    let diff = Math.max(0, new Date().getTime() - date.getTime());
    const sec = Math.floor(diff / 1000);

    if (sec < 10) return 'just now';
    if (sec < 60) return `${sec} seconds ago`;

    const min = Math.floor(sec / 60);
    if (min === 1) return '1 minute ago';
    if (min < 60) return `${min} minutes ago`;

    const hour = Math.floor(min / 60);
    if (hour === 1) return '1 hour ago';
    if (hour < 24) return `${hour} hours ago`;

    const day = Math.floor(hour / 24);
    if (day === 1) return '1 day ago';
    if (day < 30) return `${day} days ago`;

    const month = Math.floor(day / 30);
    if (month === 1) return '1 month ago';
    if (month < 12) return `${month} months ago`;

    const year = Math.floor(month / 12);
    if (year === 1) return '1 year ago';
    return `${year} years ago`;
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
    // The backend mapVideoDetails returns { video: { ... }, admin: { ... }, ... }
    // while mapVideoRow returns { ...video, admin: { ... }, ... }
    return response?.data?.data?.video?.poster_url || response?.data?.data?.poster_url;
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
        const response = await api.post('/video/create', formData, uploadConfig);
        return response;
    } catch (createErr) {
        if (createErr.response?.status === 404) {
            const response = await api.post('/video', formData, uploadConfig);
            return response;
        }
        throw createErr;
    }
}

/** Label + Bootstrap badge class for video moderation / pipeline state (if API sends fields). */
export function getVideoSidebarBadge(video) {
    if (!video) return null;
    if (video.is_rejected === true || video.is_rejected === 1 || (video.rejection_reason && String(video.rejection_reason).trim())) {
        return { label: 'Rejected', className: 'text-bg-danger' };
    }
    if (video.is_approved === 0) {
        return { label: 'In progress', className: 'text-bg-warning' };
    }
    if (video.is_approved === 1) return null;

    const raw = String(video.status ?? video.approval_status ?? video.video_status ?? '').trim();
    if (!raw) return null;
    const lower = raw.toLowerCase();
    if (['rejected', 'denied', 'refused'].some((k) => lower === k) || lower.startsWith('reject')) {
        return { label: 'Rejected', className: 'text-bg-danger' };
    }
    if (
        ['pending', 'processing', 'in_progress', 'in review', 'awaiting', 'in_review', 'submitted', 'queue', 'uploading'].some(
            (k) => lower === k || lower.includes(k)
        )
    ) {
        return { label: 'In progress', className: 'text-bg-warning' };
    }
    if (['approved', 'published', 'active', 'live', 'completed', 'accepted'].some((k) => lower === k)) return null;
    return null;
}
