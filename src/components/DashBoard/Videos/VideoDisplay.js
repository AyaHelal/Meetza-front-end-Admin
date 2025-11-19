import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import api from '../../../utils/api';
import { toast } from 'react-toastify';
import { ThumbsDown } from 'phosphor-react';
import { HeartStraight } from 'phosphor-react';
import { ChatTeardropDots } from 'phosphor-react';
import { MagnifyingGlass } from 'phosphor-react';
import { PencilSimpleLine } from 'phosphor-react';
import { Trash } from 'phosphor-react';
import './VideoDisplay.css';
const VideoDisplay = ({ currentUser }) => {
    const [videos, setVideos] = useState([]);
    const [currentVideo, setCurrentVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [members, setMembers] = useState([]);

    // Fetch videos from API
    useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/video');
            console.log('API /video response:', response.data);
            if (response.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
                setVideos(response.data.data);
                setCurrentVideo(response.data.data[0]);
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

                    // Use thumbnail API for images - this works without authentication for shared files
                    // Format: https://domain/_layouts/15/getpreview.ashx?path=<encoded_path>
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
    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const res = await api.get('/member/');
                setMembers(res.data);
            } catch (err) {
                console.error('Error fetching members:', err);
            }
        };
        fetchMembers();
    }, []);
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

            console.log('Final commentsList:', commentsList);
            // Only update if this is still the current video
            setCurrentVideo(prev => {
                if (!prev || (prev._id !== videoId && prev.id !== videoId)) {
                    return prev;
                }
                // Only update if comments actually changed
                if (JSON.stringify(prev.comments) === JSON.stringify(commentsList)) {
                    return prev;
                }
                return { ...prev, comments: commentsList };
            });
        } catch (err) {
            // Handle 404 as no comments found (not an error)
            if (err.response?.status === 404) {
                console.log(`No comments found for video ${videoId}`);
                setCurrentVideo(prev => {
                    if (!prev || (prev._id !== videoId && prev.id !== videoId)) {
                        return prev;
                    }
                    if (JSON.stringify(prev.comments) === JSON.stringify([])) {
                        return prev;
                    }
                    return { ...prev, comments: [] };
                });
            } else {
                console.error(`Error fetching comments for video ${videoId}:`, err);
                setCurrentVideo(prev => {
                    if (!prev || (prev._id !== videoId && prev.id !== videoId)) {
                        return prev;
                    }
                    if (JSON.stringify(prev.comments) === JSON.stringify([])) {
                        return prev;
                    }
                    return { ...prev, comments: [] };
                });
            }
        }
    };    // Fetch comments when currentVideo changes
    useEffect(() => {
        if (!currentVideo) return;
        const videoId = currentVideo._id || currentVideo.id;
        if (!videoId) return;

        // Fetch comments for this video
        fetchCommentsByVideoId(videoId);
    }, [currentVideo]);


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

    const handleDeleteComment = async (videoId, commentId) => {
        if (!window.confirm("Are you sure you want to delete this comment?")) return;

        try {
            await api.delete(`/video/${videoId}/comment/${commentId}`);
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

    if (!videos.length) {
        return (
            <div className="container-fluid d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
                <div className="alert alert-info" role="alert">
                    No videos available
                </div>
            </div>
        );
    }

    if (!currentVideo) {
        return null;
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
                                <span className='m-1'>10</span>
                                <ThumbsDown size={24} />


                            </button>
                            <button className='btn rounded-5 p-1 btn-sm mx-2' style={{ backgroundColor: "#E6E0E0", color: "#000000" }}>
                                <span className='m-1'>10</span>
                                <HeartStraight size={24} />



                            </button>
                            <button className='btn rounded-5 p-1 btn-sm' style={{ backgroundColor: "#E6E0E0", color: "#000000" }}>
                                <span className='m-1'>10</span>
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
                            <h5 className="mb-0">Videos</h5>
                            <button className="btn btn-sm rounded-circle" style={{ backgroundColor: "#F4F6F8" }}>
                                <MagnifyingGlass size={24} />


                            </button>
                        </div>
                        <div className="card-body p-2" style={{ maxHeight: '800px', overflowY: 'auto' }}>
                            {videos.map((video) => (
                                <div
                                    key={video._id || video.id}
                                    className={`d-flex align-items-center bg-white shadow-sm p-2 mb-2 rounded ${currentVideo._id === video._id || currentVideo.id === video.id ? 'bg-light' : ''}`}
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

                                            style={{ backgroundColor: "#00DC85", borderRadius: "20px" }}
                                        >
                                            <span style={{ color: "white" }}>
                                                <PencilSimpleLine size={24} />
                                            </span>
                                        </button>

                                        <button
                                            className="btn btn-sm p-1"
                                            onClick={() => handleDeleteVideo(video.id)}
                                            style={{ backgroundColor: "#FF0000", borderRadius: "20px" }}
                                        >
                                            <span style={{ color: "white" }}>
                                                <Trash size={24} />
                                            </span>
                                        </button>

                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default VideoDisplay;