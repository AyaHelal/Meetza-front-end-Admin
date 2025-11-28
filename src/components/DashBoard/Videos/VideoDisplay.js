import React, { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import api from '../../../utils/api';
import { toast } from 'react-toastify';
import { ThumbsDown } from 'phosphor-react';
import { HeartStraight } from 'phosphor-react';
import { ChatTeardropDots } from 'phosphor-react';
import { PencilSimpleLine } from 'phosphor-react';
import { Trash } from 'phosphor-react';
import { MagnifyingGlass, X, ArrowLeft } from 'phosphor-react';
import { UploadSimple } from 'phosphor-react';
import CustomDatePicker from './CustomDatePicker';
import './VideoDisplay.css';
const VideoDisplay = ({ currentUser }) => {
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
    const [editFormData, setEditFormData] = useState({ title: '', poster_url: '', id: null });
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [videoToDelete, setVideoToDelete] = useState(null);
    const [groups, setGroups] = useState([]);
    const [uploadFormData, setUploadFormData] = useState({
        title: '',
        poster_file: null,
        video_file: null,
        date_recorded: '',
        group_id: '',
        description: ''
    });
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Fetch videos from API
    useEffect(() => {
        fetchVideos();
        fetchGroups();
    }, []);

    // Fetch groups for dropdown
    const fetchGroups = async () => {
        try {
            const res = await api.get('/group');
            const payload = Array.isArray(res.data) ? res.data : res.data?.data || [];
            setGroups(payload);
        } catch (err) {
            console.error('Failed to fetch groups:', err);
            toast.error('Failed to load groups');
        }
    };

    // Cleanup search timeout on unmount
    useEffect(() => {
        return () => {
            if (searchTimeout) clearTimeout(searchTimeout);
        };
    }, [searchTimeout]);

    const fetchLikeCounts = async (videoId) => {
        try {
            const res = await api.get(`/like/video/${videoId}`);
            const countsArray = res.data.likeCounts || [];
            const counts = { like: 0, dislike: 0 };

            countsArray.forEach(item => {
                const type = Number(item.like_type);
                if (type === 1) counts.like = item.count;
                else if (type === 0) counts.dislike = item.count;
            });

            setLikeCounts(prev => ({ ...prev, [videoId]: counts }));
        } catch (err) {
            console.error(`Error fetching like counts for video ${videoId}:`, err);
        }
    };


    const fetchVideos = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/video');
            console.log('API /video response:', response.data);

            // Handle both response structures: array directly or nested in data property
            const videosArray = Array.isArray(response.data)
                ? response.data
                : (Array.isArray(response.data?.data) ? response.data.data : []);

            console.log('Parsed videos array:', videosArray);
            console.log('First video structure:', videosArray[0]);

            if (videosArray && videosArray.length > 0) {
                setVideos(videosArray);
                setCurrentVideo(videosArray[0]);
            } else {
                console.warn('No videos found in response');
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

    // Close search bar when clicking outside
    useEffect(() => {
        if (!isSearchOpen) return;

        const handleClickOutside = (event) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
                setIsSearchOpen(false);
                // If search query is empty, restore all videos without loading state
                if (searchQuery.trim() === '') {
                    // Fetch videos without showing loading spinner
                    api.get('/video')
                        .then(response => {
                            if (response.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
                                setVideos(response.data.data);
                            } else {
                                setVideos([]);
                            }
                        })
                        .catch(err => {
                            console.error('Error fetching videos:', err);
                        });
                }
            }
        };

        // Small delay to prevent immediate closing when opening
        const timeoutId = setTimeout(() => {
            document.addEventListener('click', handleClickOutside, true);
        }, 100);

        return () => {
            clearTimeout(timeoutId);
            document.removeEventListener('click', handleClickOutside, true);
        };
    }, [isSearchOpen, searchQuery]);

    // Search videos using API
    const searchVideos = async (query) => {
        try {
            // Don't set loading state for search - it should happen in background
            const response = await api.get(`/video?title=${encodeURIComponent(query)}`);
            console.log('API /video search response:', response.data);

            const videoData = Array.isArray(response.data)
                ? response.data
                : (response.data?.data || []);

            // Only update the videos list for sidebar, don't change currentVideo
            setVideos(videoData);

            // If there are results and no current video is selected, select the first one
            if (videoData.length > 0 && !currentVideo) {
                setCurrentVideo(videoData[0]);
            }
        } catch (err) {
            console.error('Error searching videos:', err);
            const errorMsg = err.response?.data?.message || err.message || 'Failed to search videos';
            toast.error(errorMsg);
            setVideos([]);
            // Don't change currentVideo on error - keep it as is
        }
    };

    const handleVideoSelect = (video) => {
        // Close upload form if it's open
        setShowUploadModal(false);
        setCurrentVideo(video);
    };

    // Build full file URL for poster/video paths returned from the API
    const buildFileUrl = (path) => {
        if (!path) return '';

        // Handle OneDrive/SharePoint URLs
        if (path.includes('sharepoint.com') || path.includes('onedrive.aspx')) {
            try {
                const url = new URL(path);
                const idParam = url.searchParams.get('id');

                if (idParam) {
                    const baseUrl = `${url.protocol}//${url.host}`;
                    const encodedPath = encodeURIComponent(idParam);

                    return `${baseUrl}/_layouts/15/getpreview.ashx?path=${encodedPath}&resolution=6`;
                }

                // Fallback: return original URL
                return path;
            } catch (e) {
                console.error('Error processing SharePoint URL:', e);
                return path;
            }
        }

        // Handle regular HTTP/HTTPS URLs
        if (path.startsWith('http://') || path.startsWith('https://')) return path;

        // Handle relative paths
        try {
            const base = api.defaults.baseURL || '';
            // remove trailing '/api' if present to point to root domain
            const origin = base.replace(/\/api\/?$/, '');
            return `${origin}${path.startsWith('/') ? '' : '/'}${path}`;
        } catch (e) {
            return path;
        }
    };
    // log constructed URLs when currentVideo changes (helpful for debugging)
    useEffect(() => {
        if (!currentVideo) return;
        const posterFull = buildFileUrl(currentVideo.poster_url);
        const videoFull = buildFileUrl(currentVideo.video_url);
        console.log('CurrentVideo poster full URL:', posterFull);
        console.log('CurrentVideo video full URL:', videoFull);
    }, [currentVideo]);

    // Fetch comments for a specific video
    const fetchCommentsByVideoId = async (videoId) => {
        try {
            const response = await api.get(`/comment/video/${videoId}`);
            console.log(`Full API response for video ${videoId}:`, response);
            console.log(`Response data:`, response.data);
            console.log(`Response status:`, response.status);

            // Try different possible response structures
            let commentsList = [];
            if (Array.isArray(response.data)) {
                commentsList = response.data;
                console.log('Comments is direct array');
            } else if (response.data?.data && Array.isArray(response.data.data)) {
                commentsList = response.data.data;
                console.log('Comments in response.data.data');
            } else if (response.data?.comments && Array.isArray(response.data.comments)) {
                commentsList = response.data.comments;
                console.log('Comments in response.data.comments');
            }

            // Get comment count from API or fallback to length
            let commentCount = 0;
            if (typeof response.data.commentCount === 'number') {
                commentCount = response.data.commentCount;
            } else {
                commentCount = commentsList.length;
            }

            console.log('Final commentsList:', commentsList);
            console.log('Comment count:', commentCount);

            // Only update if this is still the current video
            setCurrentVideo(prev => {
                if (!prev || (prev._id !== videoId && prev.id !== videoId)) {
                    return prev;
                }

                // Only update if comments or count actually changed
                if (JSON.stringify(prev.comments) === JSON.stringify(commentsList) && prev.commentCount === commentCount) {
                    return prev;
                }

                return { ...prev, comments: commentsList, commentCount };
            });
        } catch (err) {
            // Handle 404 as no comments found (not an error)
            if (err.response?.status === 404) {
                console.log(`No comments found for video ${videoId}`);
                setCurrentVideo(prev => {
                    if (!prev || (prev._id !== videoId && prev.id !== videoId)) return prev;
                    if (JSON.stringify(prev.comments) === JSON.stringify([]) && prev.commentCount === 0) return prev;
                    return { ...prev, comments: [], commentCount: 0 };
                });
            } else {
                console.error(`Error fetching comments for video ${videoId}:`, err);
                setCurrentVideo(prev => {
                    if (!prev || (prev._id !== videoId && prev.id !== videoId)) return prev;
                    if (JSON.stringify(prev.comments) === JSON.stringify([]) && prev.commentCount === 0) return prev;
                    return { ...prev, comments: [], commentCount: 0 };
                });
            }
        }
    };
    // Fetch comments when currentVideo changes
    useEffect(() => {
        if (!currentVideo) return;
        const videoId = currentVideo._id || currentVideo.id;
        fetchLikeCounts(videoId);
        if (!videoId) return;

        // Fetch comments for this video
        fetchCommentsByVideoId(videoId);
    }, [currentVideo]);


    const handleEditVideo = (video) => {
        console.log('Editing video:', video);
        console.log('Video ID (_id):', video._id);
        console.log('Video ID (id):', video.id);
        const videoId = video._id || video.id;
        console.log('Using video ID:', videoId);

        setEditFormData({
            title: video.title || '',
            poster_url: video.poster_url || '',
            id: videoId
        });
        setShowEditModal(true);
    };

    const handleUpdateVideo = async () => {
        if (!editFormData.title.trim()) {
            toast.error("Title is required");
            return;
        }

        if (!editFormData.id) {
            toast.error("Video ID is missing");
            return;
        }

        try {
            const videoId = editFormData.id;
            const payload = {
                title: editFormData.title,
                poster_url: editFormData.poster_url
            };

            console.log('Updating video with ID:', videoId);
            console.log('Payload:', payload);
            console.log('Full URL will be:', `/video/${videoId}`);
            console.log('Base URL:', api.defaults.baseURL);
            console.log('Full endpoint:', `${api.defaults.baseURL}/video/${videoId}`);

            // Try to get the video first to verify the ID
            try {
                const checkResponse = await api.get(`/video/${videoId}`);
                console.log('Video exists, ID is valid:', checkResponse.data);
            } catch (checkErr) {
                console.error('Video check failed:', checkErr);
                console.error('Check error response:', checkErr.response);
            }

            // Try POST first, then PATCH, then PUT with different endpoint variations
            let response;
            try {
                response = await api.post(`/video/${videoId}`, payload);
                console.log('POST /video/{id} succeeded');
            } catch (postErr) {
                console.log('POST /video/{id} failed, trying PATCH...');
                try {
                    response = await api.patch(`/video/${videoId}`, payload);
                    console.log('PATCH /video/{id} succeeded');
                } catch (patchErr) {
                    console.log('PATCH /video/{id} failed, trying alternatives...');
                    // Try POST on /videos (plural)
                    try {
                        response = await api.post(`/videos/${videoId}`, payload);
                        console.log('POST /videos/{id} succeeded');
                    } catch (videosPostErr) {
                        // Try PATCH on /videos (plural)
                        try {
                            response = await api.patch(`/videos/${videoId}`, payload);
                            console.log('PATCH /videos/{id} succeeded');
                        } catch (videosPatchErr) {
                            // Try PUT on /videos (plural)
                            try {
                                response = await api.put(`/videos/${videoId}`, payload);
                                console.log('PUT /videos/{id} succeeded');
                            } catch (putErr) {
                                // If all fail, throw the original POST error
                                throw postErr;
                            }
                        }
                    }
                }
            }
            console.log('Update response:', response);

            toast.success("Video updated successfully");

            // Update video in the list
            const updatedVideos = videos.map(v =>
                (v._id === videoId || v.id === videoId)
                    ? { ...v, title: editFormData.title, poster_url: editFormData.poster_url }
                    : v
            );
            setVideos(updatedVideos);

            // Update current video if it's the one being edited
            if (currentVideo && (currentVideo._id === videoId || currentVideo.id === videoId)) {
                setCurrentVideo({
                    ...currentVideo,
                    title: editFormData.title,
                    poster_url: editFormData.poster_url
                });
            }

            setShowEditModal(false);
        } catch (err) {
            console.error("Error updating video:", err);
            console.error("Error config:", err.config);
            console.error("Request URL:", err.config?.url);
            console.error("Full request URL:", err.config?.baseURL + err.config?.url);
            console.error("Error response:", err.response);
            console.error("Error response data:", err.response?.data);
            console.error("Error status:", err.response?.status);

            let errorMsg = "Failed to update video";
            if (err.response?.status === 404) {
                errorMsg = `Video not found. ID: ${editFormData.id}. Please check if the video ID is correct.`;
            } else if (err.response?.data?.message) {
                errorMsg = err.response.data.message;
            } else if (err.message) {
                errorMsg = err.message;
            }
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
            await api.delete(`/video/${videoToDelete}`);

            toast.success("Video deleted successfully");
            // Remove video from list
            const updatedVideos = videos.filter(v => v._id !== videoToDelete && v.id !== videoToDelete);
            setVideos(updatedVideos);

            // If deleted video was current, set first video as current
            if (currentVideo && (currentVideo._id === videoToDelete || currentVideo.id === videoToDelete)) {
                setCurrentVideo(updatedVideos.length > 0 ? updatedVideos[0] : null);
            }

            setShowDeleteModal(false);
            setVideoToDelete(null);
        } catch (err) {
            console.error("Error deleting video:", err);
            const errorMsg = err.response?.data?.message || "Failed to delete video";
            toast.error(errorMsg);
            setShowDeleteModal(false);
            setVideoToDelete(null);
        }
    };

    const handleSearchChange = (query) => {
        setSearchQuery(query);

        // Clear existing timeout
        if (searchTimeout) clearTimeout(searchTimeout);

        if (query.trim() === '') {
            // If search is empty, fetch all videos
            fetchVideos();
        } else {
            // Debounce search API call
            const timeout = setTimeout(() => {
                if (query.trim().length > 2) {
                    searchVideos(query).catch((err) => {
                        toast.error(err?.response?.data?.message || "Failed to search videos");
                    });
                }
            }, 500);
            setSearchTimeout(timeout);
        }
    };

    const handleDeleteComment = async (videoId, commentId) => {
        if (!window.confirm("Are you sure you want to delete this comment?")) return;

        try {
            await api.delete(`comment/${commentId}`);
            toast.success("Comment deleted successfully");
            // Refresh comments for this video
            fetchCommentsByVideoId(videoId);
        } catch (err) {
            console.error("Error deleting comment:", err);
            const errorMsg = err.response?.data?.message || "Failed to delete comment";
            toast.error(errorMsg);
        }
    };

    // Upload Video Handlers
    const handleUploadFormChange = (e) => {
        const { name, value } = e.target;
        setUploadFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const { name } = e.target;
        const file = e.target.files[0];
        if (file) {
            // Check file size (100MB limit - adjust as needed)
            const maxSize = 100 * 1024 * 1024; // 100MB in bytes
            const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);

            if (name === 'video_file' && file.size > maxSize) {
                toast.error(`Video file is too large (${fileSizeMB}MB). Maximum size is 100MB. Please compress the video or choose a smaller file.`);
                e.target.value = ''; // Clear the input
                return;
            }

            if (name === 'poster_file' && file.size > 10 * 1024 * 1024) {
                toast.error(`Poster image is too large (${fileSizeMB}MB). Maximum size is 10MB.`);
                e.target.value = ''; // Clear the input
                return;
            }

            setUploadFormData(prev => ({ ...prev, [name]: file }));
        }
    };

    const handleUploadVideo = async () => {
        // Validation
        if (!uploadFormData.title.trim()) {
            toast.error("Title is required");
            return;
        }
        if (!uploadFormData.video_file) {
            toast.error("Video file is required");
            return;
        }
        if (!uploadFormData.group_id) {
            toast.error("Please select a group");
            return;
        }
        if (!uploadFormData.date_recorded) {
            toast.error("Date recorded is required");
            return;
        }

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('title', uploadFormData.title);
            formData.append('video_file', uploadFormData.video_file);
            formData.append('date_recorded', uploadFormData.date_recorded);
            formData.append('group_id', uploadFormData.group_id);
            formData.append('description', uploadFormData.description || '');

            if (uploadFormData.poster_file) {
                formData.append('poster_file', uploadFormData.poster_file);
            }

            // Reset progress
            setUploadProgress(0);

            // Configure timeout for large file uploads (10 minutes = 600000ms)
            const uploadConfig = {
                timeout: 600000, // 10 minutes timeout for large video files
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        setUploadProgress(percentCompleted);
                        console.log(`Upload progress: ${percentCompleted}%`);
                    }
                },
            };

            // Try /video/create endpoint first (as specified by user)
            // Then fallback to /video if that doesn't work
            try {
                await api.post('/video/create', formData, uploadConfig);
                console.log('POST /video/create succeeded');
            } catch (createErr) {
                console.log('POST /video/create failed:', createErr.response?.status || createErr.message);

                // If it's a 404, try /video as fallback
                if (createErr.response?.status === 404) {
                    console.log('Trying /video as fallback...');
                    try {
                        await api.post('/video', formData, uploadConfig);
                        console.log('POST /video succeeded');
                    } catch (videoErr) {
                        console.error('All upload attempts failed.');
                        console.error('/video/create error:', {
                            status: createErr.response?.status,
                            message: createErr.message,
                            code: createErr.code
                        });
                        console.error('/video error:', {
                            status: videoErr.response?.status,
                            message: videoErr.message,
                            code: videoErr.code
                        });
                        // Throw the original error from /video/create
                        throw createErr;
                    }
                } else {
                    // For other errors (413, 400, etc.), throw immediately
                    throw createErr;
                }
            }

            toast.success("Video uploaded successfully!");
            setShowUploadModal(false);
            setUploadProgress(0);
            setUploadFormData({
                title: '',
                poster_file: null,
                video_file: null,
                date_recorded: '',
                group_id: '',
                description: ''
            });

            // Refresh videos list
            await fetchVideos();
        } catch (err) {
            console.error("Error uploading video:", err);
            console.error("Error details:", {
                status: err.response?.status,
                statusText: err.response?.statusText,
                message: err.message,
                code: err.code,
                data: err.response?.data
            });
            setUploadProgress(0); // Reset progress on error

            // Check if the error message contains 413 (sometimes network errors hide the status)
            const errorString = JSON.stringify(err).toLowerCase();
            const has413 = errorString.includes('413') || err.response?.status === 413;

            // Handle specific error cases
            if (has413 || err.response?.status === 413) {
                const fileSizeMB = uploadFormData.video_file
                    ? (uploadFormData.video_file.size / (1024 * 1024)).toFixed(2)
                    : 'unknown';
                toast.error(
                    `File too large (${fileSizeMB}MB). The server cannot accept files of this size. ` +
                    `Please compress the video or use a smaller file. Maximum recommended size: 50MB.`
                );
            } else if (err.response?.status === 404) {
                toast.error("Video upload endpoint not found. Please contact the administrator.");
            } else if (err.response?.status >= 500) {
                toast.error("Server error. Please try again later or contact the administrator.");
            } else if (err.message && err.message.includes('Network Error')) {
                toast.error(
                    "Network error: Unable to connect to server. Please check your internet connection and try again."
                );
            } else {
                const errorMsg = err.response?.data?.message ||
                    err.response?.data?.error ||
                    err.message ||
                    "Failed to upload video. Please check your file size and try again.";
                toast.error(errorMsg);
            }
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    // note: copy actions use direct navigator.clipboard.writeText where needed

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    };

    if (loading) {
        return (
            <div className="container-fluid d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container-fluid d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
                <div className="alert alert-danger" role="alert">
                    Error loading videos: {error}
                </div>
            </div>
        );
    }


    return (
        <div className="flex-fill ps-0" style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', padding: '20px' }}>
            <style>{`
               .video-main-col {
    width: 100%;
    max-width: 100%;
    margin: 0 auto;
}

@media (max-width: 1900px) {
    .video-main-col {
        width: 815px;
        max-width: 100%;
    }
}

@media (max-width: 1500px) {
    .video-main-col {
        width: 746px;
        max-width: 100%;
    }
}
            `}</style>
            <div className="d-flex   ">
                {/* Main Video Section */}
                <style>{`
    .responsive-a {

    transform-origin: top left;

   }


@media (max-height: 800px) {
    .responsive-a {
        transform: scale(0.8);
        transform-origin: left top;

    }
`}
                </style>
                <div className=" ps-0 ms-0 video-main-col responsive-aside responsive-a align-items-start" >
                    {showUploadModal ? (
                        <>
                            <div className="card border-0 mt-4 width-850 video-upload-card" style={{
                                borderRadius: '20px',
                                background: 'linear-gradient(to right, #FFFFFF, #80BAF5)',
                                display: 'flex',
                                flexDirection: 'column',
                                overflow: 'hidden',
                                maxHeight: 'calc(100vh - 100px)'
                            }}>
                                <div className="card-body ps-4 pb-4 pt-4  d-flex flex-column h-820 responsive-aside" style={{
                                    overflow: 'hidden',
                                    paddingRight: "13px"
                                }}>
                                    <div className="d-flex align-items-center gap-3 mb-3" >
                                        <button
                                            className="btn btn-sm d-flex align-items-center gap-2"
                                            onClick={() => {
                                                setShowUploadModal(false);
                                                setUploadFormData({
                                                    title: '',
                                                    poster_file: null,
                                                    video_file: null,
                                                    date_recorded: '',
                                                    group_id: '',
                                                    description: ''
                                                });
                                                setUploadProgress(0);
                                            }}
                                            style={{
                                                backgroundColor: "#0076EA",
                                                color: "#ffffff",
                                                border: "none",
                                                borderRadius: "12px",
                                            }}
                                        >
                                            <ArrowLeft size={24} />
                                        </button>
                                        <h2 className="h5 mb-0 fw-semibold" style={{ fontSize: "24px" }}>
                                            Upload Video
                                        </h2>
                                    </div>

                                    <div className="row justify-content-center video-upload-form-container videos-sidebar-scroll" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', display: 'flex', minHeight: 0 }}>
                                        <div className="col-12" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                            <div className="border-0 p-3 video-upload-form" style={{ border: "2px solid #E9ECEF", borderRadius: "12px", flex: 1, display: 'flex', flexDirection: 'column', overflow: 'visible' }}>
                                                <div className=" ps-4 g-3">
                                                    {/* Title */}
                                                    <div className="mb-3">
                                                        <label className="form-label fw-semibold" style={{ color: "#888888", fontSize: "18px" }}>
                                                            Title <span style={{ color: "#FF0000" }}>*</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className="form-control rounded-4 py-2  w-75"
                                                            name="title"
                                                            value={uploadFormData.title}
                                                            onChange={handleUploadFormChange}
                                                            placeholder="Enter video title"
                                                            style={{
                                                                border: "1px solid #ABABAB",
                                                                fontSize: "16px",
                                                            }}
                                                        />
                                                    </div>

                                                    {/* Group */}
                                                    <div className="col-md-12 mb-3">
                                                        <label className="form-label fw-semibold" style={{ color: "#888888", fontSize: "18px" }}>
                                                            Group <span style={{ color: "#FF0000" }}>*</span>
                                                        </label>
                                                        <select
                                                            className="form-select rounded-4 py-2  w-75"
                                                            name="group_id"
                                                            value={uploadFormData.group_id}
                                                            onChange={handleUploadFormChange}
                                                            style={{
                                                                border: "1px solid #ABABAB",
                                                                fontSize: "16px",
                                                                color: uploadFormData.group_id ? "#212529" : "#888888",
                                                            }}
                                                        >
                                                            <option value="" style={{ color: "#888888" }}>Select a group</option>
                                                            {groups.map((group) => (
                                                                <option key={group.id} value={group.id}>
                                                                    {group.name || group.group_name || `Group ${group.id}`}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    {/* Date Recorded */}
                                                    <div className="col-lg-6 col-md-12 mb-3">
                                                        <label className="form-label fw-semibold" style={{ color: "#888888", fontSize: "18px" }}>
                                                            Date Recorded <span style={{ color: "#FF0000" }}>*</span>
                                                        </label>
                                                        <CustomDatePicker
                                                            name="date_recorded"
                                                            value={uploadFormData.date_recorded}
                                                            onChange={handleUploadFormChange}
                                                            className="custom-date-picker-input py-2"
                                                        />
                                                    </div>

                                                    {/* Description - Full Width */}
                                                    <div className=" mb-3">
                                                        <label className="form-label fw-semibold" style={{ color: "#888888", fontSize: "18px" }}>
                                                            Description
                                                        </label>
                                                        <textarea
                                                            className="form-control f rounded-4 w-75 "
                                                            name="description"
                                                            value={uploadFormData.description}
                                                            onChange={handleUploadFormChange}
                                                            placeholder="Enter video description (optional)"
                                                            rows="2"
                                                            style={{
                                                                borderColor: "#ABABAB",
                                                                border: "1px solid #ABABAB",
                                                                fontSize: "16px",
                                                                resize: "vertical"
                                                            }}
                                                        />
                                                    </div>

                                                    {/* Poster File */}
                                                    <div className="mb-3">
                                                        <label className="form-label fw-semibold" style={{ color: "#888888", fontSize: "18px" }}>
                                                            Poster Image
                                                        </label>
                                                        <input
                                                            type="file"
                                                            className="form-control rounded-4 py-2 w-75"
                                                            name="poster_file"
                                                            accept="image/*"
                                                            onChange={handleFileChange}
                                                            style={{
                                                                border: "1px solid #ABABAB",
                                                                fontSize: "16px",
                                                            }}
                                                        />
                                                        {uploadFormData.poster_file && (
                                                            <div className="mt-1">
                                                                <small className="text-muted d-block">
                                                                    Selected: {uploadFormData.poster_file.name}
                                                                </small>
                                                                <small className="text-muted d-block">
                                                                    Size: {(uploadFormData.poster_file.size / (1024 * 1024)).toFixed(2)} MB
                                                                </small>
                                                            </div>
                                                        )}
                                                        <small className="text-muted mt-1 d-block">
                                                            Maximum file size: 10MB
                                                        </small>
                                                    </div>

                                                    {/* Video File */}
                                                    <div className=" mb-3">
                                                        <label className="form-label fw-semibold" style={{ color: "#888888", fontSize: "18px" }}>
                                                            Video File <span style={{ color: "#FF0000" }}>*</span>
                                                        </label>
                                                        <input
                                                            type="file"
                                                            className="form-control rounded-4 py-2 w-75"
                                                            name="video_file"
                                                            accept="video/*"
                                                            onChange={handleFileChange}
                                                            style={{
                                                                border: "1px solid #ABABAB",
                                                                fontSize: "16px",
                                                            }}
                                                        />
                                                        {uploadFormData.video_file && (
                                                            <div className="mt-1">
                                                                <small className="text-muted d-block">
                                                                    Selected: {uploadFormData.video_file.name}
                                                                </small>
                                                                <small className="text-muted d-block">
                                                                    Size: {(uploadFormData.video_file.size / (1024 * 1024)).toFixed(2)} MB
                                                                </small>
                                                            </div>
                                                        )}
                                                        <small className="text-muted mt-1 d-block">
                                                            Maximum file size: 100MB (recommended: 50MB or less)
                                                        </small>
                                                    </div>
                                                </div>

                                                {/* Upload Progress */}
                                                {uploading && (
                                                    <div className="mb-3">
                                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                                            <small className="text-muted fw-semibold">Uploading video...</small>
                                                            <small className="text-muted fw-semibold">{uploadProgress}%</small>
                                                        </div>
                                                        <div className="progress" style={{ height: '10px', borderRadius: '8px', backgroundColor: '#E9ECEF' }}>
                                                            <div
                                                                className="progress-bar progress-bar-striped progress-bar-animated"
                                                                role="progressbar"
                                                                style={{
                                                                    width: `${uploadProgress}%`,
                                                                    backgroundColor: '#00DC85',
                                                                    transition: 'width 0.3s ease'
                                                                }}
                                                                aria-valuenow={uploadProgress}
                                                                aria-valuemin="0"
                                                                aria-valuemax="100"
                                                            ></div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Submit Button */}
                                                <div className="d-flex justify-content-center mt-3">
                                                    <button
                                                        type="button"
                                                        className="btn rounded-3 px-5 py-2"
                                                        onClick={handleUploadVideo}
                                                        disabled={uploading}
                                                        style={{
                                                            background: "#0076EA",
                                                            color: "white",
                                                            border: "none",
                                                            fontSize: "16px",
                                                            fontWeight: "600",
                                                        }}
                                                    >
                                                        {uploading ? 'Uploading...' : 'Upload Video'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : currentVideo ? (
                        <>
                            <div className="card border-0 mt-4 width-850 " style={{
                                borderRadius: '20px',
                                overflow: 'hidden',
                                background: 'linear-gradient(to right, #FFFFFF, #80BAF5)'
                            }}>

                                {/* Video Header */}
                                <div className="card-header border-0 d-flex justify-content-between align-items-center p-3">
                                    <h5 className="mb-0 fw-semibold">{currentVideo.title}</h5>
                                    <span className="badge text-dark fw-semibold">Recorded: {formatDate(currentVideo.date_recorded)}</span>
                                </div>

                                {/* Poster Only */}
                                <div className="position-relative rounded-3 "  >
                                    <video
                                        src={buildFileUrl(currentVideo.video_url)}
                                        controls
                                        className="w-100 px-3"
                                        style={{ height: '450px', objectFit: 'cover', borderRadius: '24px', }}
                                    ></video>


                                </div>
                            </div>
                            {/* Video Info */}
                            <div className="card-body my-3">
                                <div className="d-flex align-items-center mb-3 ps-3 p-2  bg-light  shadow-sm width-850
                        " style={{
                                        fontSize: "14px",
                                        borderRadius: "24px"
                                    }}>
                                    <span>URL:</span>
                                    <input
                                        type="text"
                                        className="form-control form-control-sm border-0 bg-transparent input-custom-width"
                                        value={buildFileUrl(currentVideo.video_url) || ''}
                                        readOnly
                                        style={{
                                            overflow: "hidden"
                                            , width: "400px"
                                        }}
                                    />
                                    <button className="btn rounded-3 btn-sm ms-2 me-4 p-1 fw-semibold"
                                        style={{ backgroundColor: "#00DC85", color: "#ffffff" }}
                                        onClick={() => navigator.clipboard.writeText(buildFileUrl
                                            (currentVideo.video_url) || '')}>Copy</button>
                                    <button className='btn rounded-5 p-1 btn-sm' style={{ backgroundColor: "#E6E0E0", color: "#000000" }}>
                                        <span className='m-1'>{likeCounts[currentVideo._id || currentVideo.id]?.dislike || 0}</span>
                                        <ThumbsDown size={24} />


                                    </button>
                                    <button className='btn rounded-5 p-1 btn-sm mx-2' style={{ backgroundColor: "#E6E0E0", color: "#000000" }}>
                                        <span className='m-1'>{likeCounts[currentVideo._id || currentVideo.id]?.like || 0}</span>
                                        <HeartStraight size={24} />



                                    </button>
                                    <button className='btn rounded-5 p-1 btn-sm' style={{ backgroundColor: "#E6E0E0", color: "#000000" }}>
                                        <span className='m-1'>{currentVideo.commentCount || 0}</span>
                                        <ChatTeardropDots size={24} />



                                    </button>
                                </div>

                            </div>

                            {/* Comments Section */}
                            <div className="card-body shadow-sm width-850"
                                style={{
                                    background: "linear-gradient(to right, #FFFFFF, rgba(0, 220, 133, 0.3))",
                                    borderRadius: '24px'
                                }}
                            >
                                <h6 className="mb-3 fw-semibold p-3" style={{ fontSize: "24px" }}>
                                    Comments Section
                                </h6>

                                {/* Scrollable comments box */}
                                <div className='comment_scrollbar_height' style={{
                                    maxHeight: "240px",   // تقدري تغيري الرقم
                                    overflowY: "auto",
                                    paddingRight: "10px"   // علشان scrollbar مايغطيش النص
                                }}>
                                    {currentVideo.comments && currentVideo.comments.length > 0 ? (
                                        currentVideo.comments.map((comment) => (
                                            <div key={comment._id || comment.id} className="px-3 d-flex align-items-start mb-3 pb-3 ">
                                                <img
                                                    src={comment.Member_photo || `https://ui-avatars.com/api/?name=${comment.Member_photo || 'User'}&background=random`}
                                                    alt={comment.Member_photo || 'User'}
                                                    className="rounded-circle me-3"
                                                    style={{ width: '50px', height: '50px' }}
                                                />
                                                <div className="flex-grow-1">
                                                    <h6 className="mb-1 fw-semibold">{comment.member_name}</h6>
                                                    <p className="mb-0 small">{comment.comment_text || comment.text || comment.content}</p>
                                                </div>

                                                <button
                                                    className="btn btn-sm btn-link text-danger"
                                                    onClick={() => handleDeleteComment(currentVideo._id || currentVideo.id, comment._id || comment.id)}
                                                    title="Delete comment"
                                                >
                                                    <Trash size={24} />
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-muted px-3 pb-3">No comments yet.</p>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="card border-0 mt-4 width-850 d-flex justify-content-center align-items-center" style={{
                            borderRadius: '20px',
                            minHeight: '400px',
                            background: 'linear-gradient(to right, #FFFFFF, #80BAF5)'
                        }}>
                            <div className="text-center text-muted">
                                <p className="mb-0" style={{ fontSize: '18px' }}>No video selected</p>
                            </div>
                        </div>
                    )}


                </div>

                {/* Videos Sidebar */}
                <div className=" mt-4 " >
                    <div className="card border-0 bg-white" style={{
                        width: "367px",
                        borderRadius: '24px',
                        height: showUploadModal ? '936px' : 'calc(936px - 80px)',
                        maxHeight: showUploadModal ? 'calc(100vh - 80px)' : 'calc(100vh - 140px)',
                        overflow: 'auto'
                    }} >
                        <div className="card-header border-0 d-flex justify-content-between align-items-center p-3 bg-white"
                            style={{ borderRadius: '24px' }} >
                            <h5 className="mb-0 fw-semibold me-1">Videos</h5>
                            <div className="d-flex align-items-center gap-2" style={{ position: 'relative' }}>
                                <div
                                    ref={searchContainerRef}
                                    className="search-container"
                                    style={{
                                        width: isSearchOpen ? '240px' : '40px',
                                        height: '40px',
                                        backgroundColor: "#F4F6F8",
                                        borderRadius: isSearchOpen ? '24px' : '50%',
                                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                        overflow: 'hidden',
                                        position: 'relative',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                >
                                    {isSearchOpen ? (
                                        <>
                                            <input
                                                type="text"
                                                className="search-input-expanded"
                                                placeholder="Search videos..."
                                                value={searchQuery}
                                                onChange={(e) => handleSearchChange(e.target.value)}
                                                autoFocus
                                                style={{
                                                    fontSize: "16px",
                                                    border: "none",
                                                    paddingTop: "0.75rem",
                                                    paddingBottom: "0.75rem",
                                                    paddingLeft: "45px",
                                                    paddingRight: "15px",
                                                    background: "transparent",
                                                    width: '100%',
                                                    outline: 'none',
                                                    color: '#000'
                                                }}
                                            />
                                            <MagnifyingGlass
                                                size={20}
                                                weight="bold"
                                                className="position-absolute"
                                                style={{
                                                    left: 15,
                                                    top: "50%",
                                                    transform: "translateY(-50%)",
                                                    color: "#000000",
                                                    pointerEvents: "none",
                                                    opacity: 1,
                                                    transition: 'opacity 0.2s ease 0.2s'
                                                }}
                                            />
                                        </>
                                    ) : (
                                        <button
                                            className="btn p-0 border-0 bg-transparent"
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => setIsSearchOpen(true)}
                                        >
                                            <MagnifyingGlass
                                                size={24}
                                                weight="bold"
                                                style={{
                                                    color: "#000000",
                                                    transition: 'transform 0.3s ease'
                                                }}
                                            />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="card-body p-2 videos-sidebar-scroll" style={{ maxHeight: showUploadModal ? '800px' : 'calc(800px - 80px)', overflowY: 'auto' }}>
                            {videos.length > 0 ? (
                                videos.map((video) => (
                                    <div
                                        key={video._id || video.id}
                                        className={`d-flex align-items-center bg-white shadow-sm p-2 mb-2 rounded ${currentVideo?._id === video._id || currentVideo?.id === video.id ? 'bg-light' : ''}`}
                                        onClick={() => handleVideoSelect(video)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <img
                                            src={buildFileUrl(video.poster_url) || 'https://via.placeholder.com/80x60?text=No+Poster'}
                                            alt={video.title}
                                            className="rounded"
                                            style={{ width: '70px', height: '70px', objectFit: 'cover' }}
                                        />
                                        <div className="flex-grow-1 ms-3">
                                            <h6 className="mb-1 small">{video.title}</h6>
                                            <p className="mb-0 text-muted small"> {formatDate(video.date_recorded)}</p>
                                        </div>
                                        <div className="d-flex gap-1 ">
                                            <button
                                                className="btn btn-sm p-0 rounded-5"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditVideo(video);
                                                }}
                                            >
                                                <span style={{ color: "white" }}>
                                                    <PencilSimpleLine size={20} color="#000000" />
                                                </span>
                                            </button>

                                            <button
                                                className="btn btn-sm p-0 rounded-5"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteVideo(video._id || video.id);
                                                }}
                                            >
                                                <span style={{ color: "white" }}>
                                                    <Trash size={20} style={{ color: "#FF0000" }} />
                                                </span>
                                            </button>

                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-muted p-4">
                                    <p className="mb-0">No videos available</p>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Upload Video Button - Outside the card */}
                    {!showUploadModal && (
                        <div className="mt-3" style={{ width: "367px" }}>
                            <button
                                className="btn w-100 d-flex align-items-center justify-content-center gap-2"
                                onClick={() => setShowUploadModal(true)}
                                style={{
                                    backgroundColor: "#0076EA",
                                    color: "#FFFFFF",
                                    border: "none",
                                    borderRadius: "12px",
                                    padding: "12px 24px",
                                    fontSize: "16px",
                                    fontWeight: "600",
                                    transition: "all 0.2s ease"
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = "#0066CC";
                                    e.currentTarget.style.transform = "translateY(-1px)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = "#0076EA";
                                    e.currentTarget.style.transform = "translateY(0)";
                                }}
                            >
                                <UploadSimple size={20} />

                                <span>Upload video</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Video Confirmation Modal */}
            {showDeleteModal && (
                <div
                    className="modal show d-block"
                    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                    onClick={() => {
                        setShowDeleteModal(false);
                        setVideoToDelete(null);
                    }}
                >
                    <div
                        className="modal-dialog modal-dialog-centered"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-content rounded-4 border-0" style={{ boxShadow: "0 10px 40px rgba(0,0,0,0.2)" }}>
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold" style={{ fontSize: "24px", color: "#010101" }}>
                                    Delete Video
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setVideoToDelete(null);
                                    }}
                                    aria-label="Close"
                                    style={{ fontSize: "14px" }}
                                >
                                </button>
                            </div>

                            <div className="modal-body pt-3">
                                <p style={{ fontSize: "16px", color: "#010101" }}>
                                    Are you sure you want to delete this video? This action cannot be undone.
                                </p>
                            </div>

                            <div className="modal-footer border-0 pt-0">
                                <button
                                    type="button"
                                    className="btn rounded-3"
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setVideoToDelete(null);
                                    }}
                                    style={{
                                        backgroundColor: "#F4F6F8",
                                        color: "#010101",
                                        border: "none",
                                        padding: "10px 24px",
                                        fontSize: "16px",
                                        fontWeight: "600"
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn rounded-3"
                                    onClick={confirmDeleteVideo}
                                    style={{
                                        backgroundColor: "#FF0000",
                                        color: "#FFFFFF",
                                        border: "none",
                                        padding: "10px 24px",
                                        fontSize: "16px",
                                        fontWeight: "600",
                                        marginLeft: "12px"
                                    }}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Video Modal */}
            {showEditModal && (
                <div
                    className="modal show d-block"
                    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                    onClick={() => setShowEditModal(false)}
                >
                    <div
                        className="modal-dialog modal-dialog-centered"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-content rounded-4 border-0" style={{ boxShadow: "0 10px 40px rgba(0,0,0,0.2)" }}>
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold" style={{ fontSize: "24px", color: "#010101" }}>
                                    Edit Video
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowEditModal(false)}
                                    aria-label="Close"
                                    style={{ fontSize: "14px" }}
                                >
                                </button>
                            </div>

                            <div className="modal-body pt-3">
                                <form>
                                    {/* Title */}
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold" style={{ color: "#010101" }}>
                                            Title <span style={{ color: "#FF0000" }}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control rounded-3"
                                            value={editFormData.title || ''}
                                            onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                                            placeholder="Enter video title"
                                            style={{
                                                border: "2px solid #E9ECEF",
                                                padding: "0.75rem",
                                                fontSize: "16px"
                                            }}
                                        />
                                    </div>

                                    {/* Poster URL */}
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold" style={{ color: "#010101" }}>
                                            Poster URL
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control rounded-3"
                                            value={editFormData.poster_url || ''}
                                            onChange={(e) => setEditFormData({ ...editFormData, poster_url: e.target.value })}
                                            placeholder="Enter poster URL"
                                            style={{
                                                border: "2px solid #E9ECEF",
                                                padding: "0.75rem",
                                                fontSize: "16px"
                                            }}
                                        />
                                    </div>
                                </form>
                            </div>

                            <div className="modal-footer border-0 pt-0 w-100 align-items-center justify-content-center">
                                <button
                                    type="button"
                                    className="btn rounded-3 px-4 py-2 w-50 "
                                    onClick={handleUpdateVideo}
                                    style={{
                                        flex: 1,
                                        background: '#007bff',
                                        color: 'white',
                                        borderRadius: 8,
                                        padding: '10px 12px',
                                        fontWeight: 600,
                                    }}
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Old Upload Video Modal - Removed, using inline form instead */}
            {false && showUploadModal && (
                <div
                    className="modal show d-block"
                    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                    onClick={() => setShowUploadModal(false)}
                >
                    <div
                        className="modal-dialog modal-dialog-centered"
                        style={{ maxWidth: "600px" }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-content rounded-4 border-0" style={{ boxShadow: "0 10px 40px rgba(0,0,0,0.2)" }}>
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold" style={{ fontSize: "24px", color: "#010101" }}>
                                    Upload Video
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => {
                                        setShowUploadModal(false);
                                        setUploadFormData({
                                            title: '',
                                            poster_file: null,
                                            video_file: null,
                                            date_recorded: '',
                                            group_id: '',
                                            description: ''
                                        });
                                    }}
                                    aria-label="Close"
                                    style={{ fontSize: "14px" }}
                                >
                                    <X size={24} weight="bold" />
                                </button>
                            </div>

                            <div className="modal-body pt-3">
                                <form>
                                    {/* Title */}
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold" style={{ color: "#010101" }}>
                                            Title <span style={{ color: "#FF0000" }}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control rounded-3"
                                            name="title"
                                            value={uploadFormData.title}
                                            onChange={handleUploadFormChange}
                                            placeholder="Enter video title"
                                            style={{
                                                border: "2px solid #E9ECEF",
                                                padding: "0.75rem",
                                                fontSize: "16px"
                                            }}
                                        />
                                    </div>

                                    {/* Group */}
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold" style={{ color: "#010101" }}>
                                            Group <span style={{ color: "#FF0000" }}>*</span>
                                        </label>
                                        <select
                                            className="form-select rounded-3"
                                            name="group_id"
                                            value={uploadFormData.group_id}
                                            onChange={handleUploadFormChange}
                                            style={{
                                                border: "2px solid #E9ECEF",
                                                padding: "0.75rem",
                                                fontSize: "16px"
                                            }}
                                        >
                                            <option value="">Select a group</option>
                                            {groups.map((group) => (
                                                <option key={group.id} value={group.id}>
                                                    {group.name || group.group_name || `Group ${group.id}`}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Date Recorded */}
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold" style={{ color: "#010101" }}>
                                            Date Recorded <span style={{ color: "#FF0000" }}>*</span>
                                        </label>
                                        <input
                                            type="date"
                                            className="form-control rounded-3"
                                            name="date_recorded"
                                            value={uploadFormData.date_recorded}
                                            onChange={handleUploadFormChange}
                                            style={{
                                                border: "2px solid #E9ECEF",
                                                padding: "0.75rem",
                                                fontSize: "16px"
                                            }}
                                        />
                                    </div>

                                    {/* Description */}
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold" style={{ color: "#010101" }}>
                                            Description
                                        </label>
                                        <textarea
                                            className="form-control rounded-3"
                                            name="description"
                                            value={uploadFormData.description}
                                            onChange={handleUploadFormChange}
                                            placeholder="Enter video description (optional)"
                                            rows="3"
                                            style={{
                                                border: "2px solid #E9ECEF",
                                                padding: "0.75rem",
                                                fontSize: "16px",
                                                resize: "vertical"
                                            }}
                                        />
                                    </div>

                                    {/* Poster File */}
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold" style={{ color: "#010101" }}>
                                            Poster Image
                                        </label>
                                        <input
                                            type="file"
                                            className="form-control rounded-3"
                                            name="poster_file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            style={{
                                                border: "2px solid #E9ECEF",
                                                padding: "0.75rem",
                                                fontSize: "16px"
                                            }}
                                        />
                                        {uploadFormData.poster_file && (
                                            <div className="mt-1">
                                                <small className="text-muted d-block">
                                                    Selected: {uploadFormData.poster_file.name}
                                                </small>
                                                <small className="text-muted d-block">
                                                    Size: {(uploadFormData.poster_file.size / (1024 * 1024)).toFixed(2)} MB
                                                </small>
                                            </div>
                                        )}
                                        <small className="text-muted mt-1 d-block">
                                            Maximum file size: 10MB
                                        </small>
                                    </div>

                                    {/* Video File */}
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold" style={{ color: "#010101" }}>
                                            Video File <span style={{ color: "#FF0000" }}>*</span>
                                        </label>
                                        <input
                                            type="file"
                                            className="form-control rounded-3"
                                            name="video_file"
                                            accept="video/*"
                                            onChange={handleFileChange}
                                            style={{
                                                border: "2px solid #E9ECEF",
                                                padding: "0.75rem",
                                                fontSize: "16px"
                                            }}
                                        />
                                        {uploadFormData.video_file && (
                                            <div className="mt-1">
                                                <small className="text-muted d-block">
                                                    Selected: {uploadFormData.video_file.name}
                                                </small>
                                                <small className="text-muted d-block">
                                                    Size: {(uploadFormData.video_file.size / (1024 * 1024)).toFixed(2)} MB
                                                </small>
                                            </div>
                                        )}
                                        <small className="text-muted mt-1 d-block">
                                            Maximum file size: 100MB (recommended: 50MB or less)
                                        </small>
                                    </div>
                                </form>

                                {/* Upload Progress */}
                                {uploading && (
                                    <div className="mt-3">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <small className="text-muted fw-semibold">Uploading video...</small>
                                            <small className="text-muted fw-semibold">{uploadProgress}%</small>
                                        </div>
                                        <div className="progress" style={{ height: '10px', borderRadius: '8px', backgroundColor: '#E9ECEF' }}>
                                            <div
                                                className="progress-bar progress-bar-striped progress-bar-animated"
                                                role="progressbar"
                                                style={{
                                                    width: `${uploadProgress}%`,
                                                    backgroundColor: '#00DC85',
                                                    transition: 'width 0.3s ease'
                                                }}
                                                aria-valuenow={uploadProgress}
                                                aria-valuemin="0"
                                                aria-valuemax="100"
                                            ></div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="modal-footer border-0 pt-0">
                                <button
                                    type="button"
                                    className="btn rounded-3 px-4 py-2 me-2"
                                    onClick={() => {
                                        setShowUploadModal(false);
                                        setUploadFormData({
                                            title: '',
                                            poster_file: null,
                                            video_file: null,
                                            date_recorded: '',
                                            group_id: '',
                                            description: ''
                                        });
                                        setUploadProgress(0);
                                    }}
                                    disabled={uploading}
                                    style={{
                                        flex: 1,
                                        background: '#E9ECEF',
                                        color: '#000',
                                        borderRadius: 8,
                                        padding: '10px 12px',
                                        fontWeight: 600,
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn rounded-3 px-4 py-2"
                                    onClick={handleUploadVideo}
                                    disabled={uploading}
                                    style={{
                                        flex: 1,
                                        background: '#00DC85',
                                        color: 'white',
                                        borderRadius: 8,
                                        padding: '10px 12px',
                                        fontWeight: 600,
                                    }}
                                >
                                    {uploading ? 'Uploading...' : 'Upload Video'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
};

export default VideoDisplay;