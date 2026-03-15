import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../../../context/AuthContext';
import {
    buildFileUrl,
    durationFromApiToSeconds,
    formatDate,
    formatDuration,
    getVideoDuration,
    getVideoDurationSeconds,
    fetchVideosApi,
    fetchGroupsApi,
    fetchLikeCountsApi,
    fetchCommentsByVideoIdApi,
    searchVideosApi,
    updateVideoApi,
    deleteVideoApi,
    deleteCommentApi,
    uploadVideoApi,
    summarizeVideo,
} from '../services/videoService';

const initialUploadFormData = {
    title: '',
    poster_file: null,
    video_file: null,
    duration: 0,
    group_id: '',
    description: '',
};

export function useVideoDisplay(currentUserProp) {
    const { user: authUser } = useAuth();
    const currentUser = currentUserProp ?? authUser;

    const [videos, setVideos] = useState([]);
    const [currentVideo, setCurrentVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [likeCounts, setLikeCounts] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [searchTimeout, setSearchTimeout] = useState(null);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const searchContainerRef = useRef(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editFormData, setEditFormData] = useState({ title: '', poster_file: null, id: null });
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [videoToDelete, setVideoToDelete] = useState(null);
    const [showDeleteCommentModal, setShowDeleteCommentModal] = useState(false);
    const [commentToDelete, setCommentToDelete] = useState({ videoId: null, commentId: null });
    const [groups, setGroups] = useState([]);
    const [uploadFormData, setUploadFormData] = useState(initialUploadFormData);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [is1440x900, setIs1440x900] = useState(false);

    useEffect(() => {
        const checkScreenSize = () => {
            setIs1440x900(window.innerWidth === 1440 && window.innerHeight === 900);
        };
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    const fetchVideos = async () => {
        try {
            setLoading(true);
            setError(null);
            const videosArray = await fetchVideosApi();
            if (videosArray && videosArray.length > 0) {
                setVideos(videosArray);
                setCurrentVideo(videosArray[0]);
            } else {
                setVideos([]);
                setCurrentVideo(null);
            }
        } catch (err) {
            console.error('Error fetching videos:', err);
            const errorMsg = err.response?.data?.message || err.message || 'Failed to fetch videos';
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const fetchGroups = async () => {
        try {
            const payload = await fetchGroupsApi();
            const user = authUser || currentUser;
            const isSuperAdmin = user?.role === 'Super_Admin';
            const isAdministrator = user?.role === 'Administrator';
            let filteredGroups = payload;
            if (isAdministrator && !isSuperAdmin) {
                filteredGroups = payload.filter(
                    (g) =>
                        g.admin_id === user?.id ||
                        g.adminId === user?.id ||
                        g.administrator_id === user?.id ||
                        g.user_id === user?.id ||
                        g.admin?.id === user?.id
                );
            }
            setGroups(filteredGroups);
        } catch (err) {
            console.error('Failed to fetch groups:', err);
            toast.error('Failed to load groups');
        }
    };

    useEffect(() => {
        fetchVideos();
        fetchGroups();
    }, []);

    useEffect(() => {
        return () => {
            if (searchTimeout) clearTimeout(searchTimeout);
        };
    }, [searchTimeout]);

    const fetchLikeCounts = async (videoId) => {
        try {
            const counts = await fetchLikeCountsApi(videoId);
            setLikeCounts((prev) => ({ ...prev, [videoId]: counts }));
        } catch (err) {
            console.error(`Error fetching like counts for video ${videoId}:`, err);
        }
    };

    const fetchCommentsByVideoId = async (videoId) => {
        try {
            const { commentsList, commentCount } = await fetchCommentsByVideoIdApi(videoId);
            setCurrentVideo((prev) => {
                if (!prev || (prev._id !== videoId && prev.id !== videoId)) return prev;
                if (JSON.stringify(prev.comments) === JSON.stringify(commentsList) && prev.commentCount === commentCount) return prev;
                return { ...prev, comments: commentsList, commentCount };
            });
        } catch (err) {
            if (err.response?.status === 404) {
                setCurrentVideo((prev) => {
                    if (!prev || (prev._id !== videoId && prev.id !== videoId)) return prev;
                    if (JSON.stringify(prev.comments) === JSON.stringify([]) && prev.commentCount === 0) return prev;
                    return { ...prev, comments: [], commentCount: 0 };
                });
            } else {
                console.error(`Error fetching comments for video ${videoId}:`, err);
                setCurrentVideo((prev) => {
                    if (!prev || (prev._id !== videoId && prev.id !== videoId)) return prev;
                    return { ...prev, comments: [], commentCount: 0 };
                });
            }
        }
    };

    useEffect(() => {
        if (!currentVideo) return;
        const videoId = currentVideo._id || currentVideo.id;
        fetchLikeCounts(videoId);
        if (!videoId) return;
        fetchCommentsByVideoId(videoId);
    }, [currentVideo]);

    useEffect(() => {
        if (!isSearchOpen) return;
        const handleClickOutside = (event) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
                setIsSearchOpen(false);
                if (searchQuery.trim() === '') {
                    fetchVideosApi()
                        .then((data) => {
                            if (data && data.length > 0) setVideos(data);
                            else setVideos([]);
                        })
                        .catch((err) => console.error('Error fetching videos:', err));
                }
            }
        };
        const timeoutId = setTimeout(() => {
            document.addEventListener('click', handleClickOutside, true);
        }, 100);
        return () => {
            clearTimeout(timeoutId);
            document.removeEventListener('click', handleClickOutside, true);
        };
    }, [isSearchOpen, searchQuery]);

    const searchVideos = async (query) => {
        try {
            const videoData = await searchVideosApi(query);
            setVideos(videoData);
            if (videoData.length > 0) {
                setCurrentVideo((prev) => (!prev ? videoData[0] : prev));
            }
        } catch (err) {
            console.error('Error searching videos:', err);
            toast.error(err.response?.data?.message || err.message || 'Failed to search videos');
            setVideos([]);
        }
    };

    const handleVideoSelect = (video) => {
        setShowUploadModal(false);
        setCurrentVideo(video);
    };

    const handleEditVideo = (video) => {
        const videoId = video._id || video.id;
        setEditFormData({ title: video.title || '', poster_file: null, id: videoId });
        setShowEditModal(true);
    };

    const handleUpdateVideo = async () => {
        if (!editFormData.title?.trim()) {
            toast.error('Title is required');
            return;
        }
        if (!editFormData.id) {
            toast.error('Video ID is missing');
            return;
        }
        const videoId = editFormData.id;
        const hasPosterFile = editFormData.poster_file && editFormData.poster_file instanceof File;
        try {
            const formData = new FormData();
            formData.append('title', editFormData.title.trim());
            if (hasPosterFile) formData.append('poster_file', editFormData.poster_file);
            const newPosterUrl = await updateVideoApi(videoId, formData);
            toast.success('Video updated successfully');
            setVideos((prev) =>
                prev.map((v) =>
                    v._id === videoId || v.id === videoId
                        ? { ...v, title: editFormData.title.trim(), ...(newPosterUrl && { poster_url: newPosterUrl }) }
                        : v
                )
            );
            setCurrentVideo((prev) => {
                if (!prev || (prev._id !== videoId && prev.id !== videoId)) return prev;
                return { ...prev, title: editFormData.title.trim(), ...(newPosterUrl && { poster_url: newPosterUrl }) };
            });
            setShowEditModal(false);
        } catch (err) {
            console.error('Error updating video:', err);
            let errorMsg = 'Failed to update video';
            if (err.response?.status === 404) errorMsg = `Video not found. ID: ${editFormData.id}.`;
            else if (err.response?.data?.message) errorMsg = err.response.data.message;
            else if (err.message) errorMsg = err.message;
            toast.error(errorMsg);
        }
    };

    const handleDeleteVideo = (videoId) => {
        setVideoToDelete(videoId);
        setShowDeleteModal(true);
    };

    const confirmDeleteVideo = async () => {
        if (!videoToDelete) return;
        try {
            await deleteVideoApi(videoToDelete);
            toast.success('Video deleted successfully');
            const remaining = videos.filter((v) => v._id !== videoToDelete && v.id !== videoToDelete);
            setVideos(remaining);
            setCurrentVideo((prev) => {
                if (!prev || (prev._id !== videoToDelete && prev.id !== videoToDelete)) return prev;
                return remaining.length > 0 ? remaining[0] : null;
            });
            setShowDeleteModal(false);
            setVideoToDelete(null);
        } catch (err) {
            console.error('Error deleting video:', err);
            toast.error(err.response?.data?.message || 'Failed to delete video');
            setShowDeleteModal(false);
            setVideoToDelete(null);
        }
    };

    const handleSearchChange = (query) => {
        setSearchQuery(query);
        if (searchTimeout) clearTimeout(searchTimeout);
        if (query.trim() === '') {
            fetchVideos();
        } else {
            const timeout = setTimeout(() => {
                if (query.trim().length > 2) {
                    searchVideos(query).catch(() => toast.error('Failed to search videos'));
                }
            }, 500);
            setSearchTimeout(timeout);
        }
    };

    const handleDeleteComment = (videoId, commentId) => {
        setCommentToDelete({ videoId, commentId });
        setShowDeleteCommentModal(true);
    };

    const confirmDeleteComment = async () => {
        const { videoId, commentId } = commentToDelete;
        if (!videoId || !commentId) return;
        try {
            await deleteCommentApi(commentId);
            toast.success('Comment deleted successfully');
            fetchCommentsByVideoId(videoId);
        } catch (err) {
            console.error('Error deleting comment:', err);
            toast.error(err.response?.data?.message || 'Failed to delete comment');
        } finally {
            setShowDeleteCommentModal(false);
            setCommentToDelete({ videoId: null, commentId: null });
        }
    };

    const handleUploadFormChange = (e) => {
        const { name, value } = e.target;
        setUploadFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const { name } = e.target;
        const file = e.target.files[0];
        if (!file) return;
        const maxVideo = 100 * 1024 * 1024;
        const maxPoster = 10 * 1024 * 1024;
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
        if (name === 'video_file' && file.size > maxVideo) {
            toast.error(`Video file is too large (${fileSizeMB}MB). Maximum size is 100MB.`);
            e.target.value = '';
            return;
        }
        if (name === 'poster_file' && file.size > maxPoster) {
            toast.error(`Poster image is too large (${fileSizeMB}MB). Maximum size is 10MB.`);
            e.target.value = '';
            return;
        }
        setUploadFormData((prev) => ({ ...prev, [name]: file }));
    };

    const handleEditPosterFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) {
            setEditFormData((prev) => ({ ...prev, poster_file: null }));
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            toast.error('Poster image is too large (max 10MB).');
            e.target.value = '';
            return;
        }
        setEditFormData((prev) => ({ ...prev, poster_file: file }));
    };

    const handleUploadVideo = async () => {
        if (!uploadFormData.title?.trim()) {
            toast.error('Title is required');
            return;
        }
        if (!uploadFormData.video_file) {
            toast.error('Video file is required');
            return;
        }
        if (!uploadFormData.group_id) {
            toast.error('Please select a group');
            return;
        }
        try {
            setUploading(true);
            let durationSeconds = uploadFormData.duration || 0;
            if (!durationSeconds && uploadFormData.video_file) {
                try {
                    const raw = await getVideoDurationSeconds(uploadFormData.video_file);
                    durationSeconds = Math.round(raw || 0);
                    setUploadFormData((prev) => ({ ...prev, duration: durationSeconds }));
                } catch (e) {
                    console.warn('Could not determine video duration:', e);
                }
            }
            const formData = new FormData();
            formData.append('title', uploadFormData.title);
            formData.append('video_file', uploadFormData.video_file);
            formData.append('group_id', uploadFormData.group_id);
            formData.append('description', uploadFormData.description || '');
            formData.append('duration', durationSeconds || 0);
            if (uploadFormData.poster_file) formData.append('poster_file', uploadFormData.poster_file);
            setUploadProgress(0);
            const response = await uploadVideoApi(formData, (progressEvent) => {
                if (progressEvent.total) {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percent);
                }
            });
            toast.success('Video uploaded successfully!');
            const videoData = response?.data?.data || response?.data;
            if (videoData?.id && videoData?.video_url) {
                const fullUrl = buildFileUrl(videoData.video_url);
                summarizeVideo(videoData.id, fullUrl, 'en').catch((err) =>
                    console.warn('Background summary EN failed:', err)
                );
                summarizeVideo(videoData.id, fullUrl, 'ar').catch((err) =>
                    console.warn('Background summary AR failed:', err)
                );
            }
            setShowUploadModal(false);
            setUploadFormData(initialUploadFormData);
            setUploadProgress(0);
            await fetchVideos();
        } catch (err) {
            console.error('Error uploading video:', err);
            setUploadProgress(0);
            const has413 = err.response?.status === 413 || JSON.stringify(err).toLowerCase().includes('413');
            if (has413) {
                const fileSizeMB = uploadFormData.video_file
                    ? (uploadFormData.video_file.size / (1024 * 1024)).toFixed(2)
                    : 'unknown';
                toast.error(`File too large (${fileSizeMB}MB). Please compress the video. Max recommended: 50MB.`);
            } else if (err.response?.status === 404) {
                toast.error('Video upload endpoint not found. Please contact the administrator.');
            } else if (err.response?.status >= 500) {
                toast.error('Server error. Please try again later.');
            } else if (err.message?.includes('Network Error')) {
                toast.error('Network error. Please check your connection.');
            } else {
                toast.error(
                    err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to upload video.'
                );
            }
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const resetUploadForm = () => {
        setUploadFormData(initialUploadFormData);
        setUploadProgress(0);
    };

    const handleSummarizeVideo = async (video) => {
        const videoId = video?._id || video?.id;
        const videoUrl = buildFileUrl(video?.video_url);
        if (!videoId || !videoUrl) {
            toast.error('Video ID or URL missing');
            return;
        }
        try {
            toast.info('Generating summary…');
            await Promise.all([
                summarizeVideo(videoId, videoUrl, 'en'),
                summarizeVideo(videoId, videoUrl, 'ar'),
            ]);
            toast.success('Summary generated');
        } catch (err) {
            console.error('Summary failed:', err);
            toast.error(err?.response?.data?.message || err?.message || 'Summary failed');
        }
    };

    return {
        // state
        videos,
        currentVideo,
        loading,
        error,
        likeCounts,
        searchQuery,
        isSearchOpen,
        searchContainerRef,
        showEditModal,
        editFormData,
        setEditFormData,
        showUploadModal,
        setShowUploadModal,
        showDeleteModal,
        videoToDelete,
        showDeleteCommentModal,
        commentToDelete,
        groups,
        uploadFormData,
        setUploadFormData,
        uploading,
        uploadProgress,
        setUploadProgress,
        is1440x900,
        // utils (from service, for component)
        buildFileUrl,
        formatDuration,
        formatDate,
        getVideoDuration,
        // handlers
        handleVideoSelect,
        handleEditVideo,
        handleUpdateVideo,
        handleDeleteVideo,
        confirmDeleteVideo,
        handleSearchChange,
        setIsSearchOpen,
        handleDeleteComment,
        confirmDeleteComment,
        handleUploadFormChange,
        handleFileChange,
        handleEditPosterFileChange,
        handleUploadVideo,
        resetUploadForm,
        handleSummarizeVideo,
        setShowEditModal,
        setShowDeleteModal,
        setVideoToDelete,
        setShowDeleteCommentModal,
        setCommentToDelete,
    };
}
