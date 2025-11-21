import React, { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import api from '../../../utils/api';
import { toast } from 'react-toastify';
import { ThumbsDown } from 'phosphor-react';
import { HeartStraight } from 'phosphor-react';
import { ChatTeardropDots } from 'phosphor-react';
import { PencilSimpleLine } from 'phosphor-react';
import { Trash } from 'phosphor-react';
import { MagnifyingGlass, X } from 'phosphor-react';
import './VideoDisplay.css';
const VideoDisplay = ({ currentUser }) => {
    const [videos, setVideos] = useState([]);
    const [currentVideo, setCurrentVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [members, setMembers] = useState([]);
    const [likeCounts, setLikeCounts] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [searchTimeout, setSearchTimeout] = useState(null);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const searchContainerRef = useRef(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editFormData, setEditFormData] = useState({ title: '', poster_url: '', id: null });

    // Fetch videos from API
    useEffect(() => {
        fetchVideos();
    }, []);

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
        setCurrentVideo(video);
    };

    // Build full file URL for poster/video paths returned from the API
    // Build full file URL for poster/video paths returned from the API
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

    const handleDeleteVideo = async (videoId) => {
        if (!window.confirm("Are you sure you want to delete this video?")) return;

        try {
            await api.delete(`/video/${videoId}`);

            toast.success("Video deleted successfully");
            // Remove video from list
            const updatedVideos = videos.filter(v => v._id !== videoId && v.id !== videoId);
            setVideos(updatedVideos);

            // If deleted video was current, set first video as current
            if (currentVideo._id === videoId || currentVideo.id === videoId) {
                setCurrentVideo(updatedVideos.length > 0 ? updatedVideos[0] : null);
            }
        } catch (err) {
            console.error("Error deleting video:", err);
            const errorMsg = err.response?.data?.message || "Failed to delete video";
            toast.error(errorMsg);
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
        <div className="flex-fill" style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', padding: '20px' }}>
            <style>{`
               .video-main-col {
    width: 100%;
    max-width: 100%;
    margin: 0 auto;
}

/* شاشات كبيرة جدًا 1900px أو أكتر */
@media (max-width: 1900px) {
    .video-main-col {
        width: 815px;
        max-width: 100%;
    }
}

/* لو العرض أقل من 1800px */
@media (max-width: 1500px) {
    .video-main-col {
        width: 746px;
        max-width: 100%;
    }
}
            `}</style>
            <div className="row  ">
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
                <div className=" col-xl-8 col-lg-8 col-md-7 video-main-col responsive-aside responsive-a align-items-start" >
                    {currentVideo ? (
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
                                <div className="d-flex align-items-center mb-3 p-2  bg-light  shadow-sm width-850
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
                <div className="col-lg-4 col-xl-4 col-md-5 mt-4 " >
                    <style>{`
                .responsive-aside {
                    height: 936px;
                }
                @media (max-height: 1024px) {
                    .responsive-aside {
                        height: calc(100vh - 80px);
                    }
                }
            `}</style>
                    <div className="card border-0 bg-white responsive-aside" style={{
                        width: "330px",
                        borderRadius: '24px',

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
                        <div className="card-body p-2" style={{ maxHeight: '800px', overflowY: 'auto' }}>
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
                                        <div className="d-flex gap-2">
                                            <button
                                                className="btn btn-sm p-1"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditVideo(video);
                                                }}
                                                style={{ backgroundColor: "#00DC85", borderRadius: "20px" }}
                                            >
                                                <span style={{ color: "white" }}>
                                                    <PencilSimpleLine size={24} />
                                                </span>
                                            </button>

                                            <button
                                                className="btn btn-sm p-1"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteVideo(video._id || video.id);
                                                }}
                                                style={{ backgroundColor: "#FF0000", borderRadius: "20px" }}
                                            >
                                                <span style={{ color: "white" }}>
                                                    <Trash size={24} />
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
                </div>
            </div>

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

                            <div className="modal-footer border-0 pt-0">
                                <button
                                    type="button"
                                    className="btn rounded-3 px-4 py-2"
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
        </div >
    );
};

export default VideoDisplay;