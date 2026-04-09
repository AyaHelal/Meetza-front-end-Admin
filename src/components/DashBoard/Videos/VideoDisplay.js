import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ThumbsDown, HeartStraight, ChatTeardropDots, PencilSimpleLine, Trash, MagnifyingGlass, ArrowLeft, UploadSimple, FileText, DownloadSimple } from 'phosphor-react';
import { downloadVideo } from '../../../utils/videoUtils';
import './VideoDisplay.css';
import { useVideoDisplay } from './hooks/useVideoDisplay';

const VideoDisplay = ({ currentUser: currentUserProp }) => {
    const {
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
        showDeleteCommentModal,
        groups,
        uploadFormData,
        uploading,
        uploadProgress,
        buildFileUrl,
        formatDuration,
        getVideoDuration,
        formatRelativeTime,
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
    } = useVideoDisplay(currentUserProp);
    
    // Download states
    const [downloadingMap, setDownloadingMap] = React.useState({});
    const [downloadingDetail, setDownloadingDetail] = React.useState(false);
    
    const handleDownloadClick = (video, isDetail = false) => {
        const videoId = video._id || video.id;
        const videoUrl = buildFileUrl(video.video_url);
        
        const onStart = () => {
            if (isDetail) setDownloadingDetail(true);
            else setDownloadingMap(prev => ({ ...prev, [videoId]: true }));
        };
        
        const onEnd = () => {
            if (isDetail) setDownloadingDetail(false);
            else setDownloadingMap(prev => ({ ...prev, [videoId]: false }));
        };
        
        downloadVideo(
            videoUrl,
            video.title,
            onStart,
            onEnd,
            onEnd
        );
    };

    if (loading) {
        return (
            <div className="container-fluid d-flex justify-content-center align-items-center video-loading-error-wrap">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container-fluid d-flex justify-content-center align-items-center video-loading-error-wrap">
                <div className="alert alert-danger" role="alert">
                    Error loading videos: {error}
                </div>
            </div>
        );
    }


    return (
        <div className="flex-fill ps-0 video-page-root">
            <div className="d-flex video-layout-wrap">
                {/* Main Video Section */}
                <div className="ps-0 ms-0 video-main-col responsive-aside responsive-a align-items-start">
                    {showUploadModal ? (
                        <>
                            <div className="card border-0 mt-4 width-850 video-upload-card">
                                <div className="card-body ps-4 pb-4 pt-4 d-flex flex-column h-820 responsive-aside video-upload-card-body">
                                    <div className="d-flex align-items-center gap-3 mb-3" >
                                        <button
                                            type="button"
                                            className="btn btn-sm d-flex align-items-center gap-2 video-upload-back-btn"
                                            onClick={() => {
                                                setShowUploadModal(false);
                                                resetUploadForm();
                                            }}
                                        >
                                            <ArrowLeft size={24} />
                                        </button>
                                        <h2 className="h5 mb-0 fw-semibold video-upload-title">
                                            Upload Video
                                        </h2>
                                    </div>

                                    <div className="row justify-content-center video-upload-form-container videos-sidebar-scroll">
                                        <div className="col-12 video-upload-form-inner">
                                            <div className="border-0 p-3 video-upload-form">
                                                <div className=" ps-4 g-3">
                                                    {/* Title */}
                                                    <div className="mb-3">
                                                        <label className="form-label fw-semibold video-form-label">
                                                            Title <span className="video-form-required">*</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className="form-control rounded-4 py-2 w-75 video-form-input"
                                                            name="title"
                                                            value={uploadFormData.title}
                                                            onChange={handleUploadFormChange}
                                                            placeholder="Enter video title"
                                                        />
                                                    </div>

                                                    {/* Group */}
                                                    <div className="col-md-12 mb-3">
                                                        <label className="form-label fw-semibold video-form-label">
                                                            Group <span className="video-form-required">*</span>
                                                        </label>
                                                        <select
                                                            className="form-select rounded-4 py-2 w-75 video-form-select"
                                                            name="group_id"
                                                            value={uploadFormData.group_id}
                                                            onChange={handleUploadFormChange}
                                                        >
                                                            <option value="" className="video-form-select-placeholder">Select a group</option>
                                                            {groups.map((group) => (
                                                                <option key={group.id} value={group.id}>
                                                                    {group.name || group.group_name || `Group ${group.id}`}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    {/* Duration (auto from video) */}
                                                    <div className="col-lg-6 col-md-12 mb-3">
                                                        <label className="form-label fw-semibold video-form-label">
                                                            Duration
                                                        </label>
                                                        <div className="form-control rounded-4 py-2 w-75 d-flex align-items-center video-form-duration-display">
                                                            {uploadFormData.duration ? formatDuration(uploadFormData.duration) : "Will be detected automatically from video"}
                                                        </div>
                                                        <small className="text-muted d-block mt-1">
                                                            Duration is calculated automatically from the selected video file.
                                                        </small>
                                                    </div>

                                                    {/* Description - Full Width */}
                                                    <div className="mb-3">
                                                        <label className="form-label fw-semibold video-form-label">
                                                            Description
                                                        </label>
                                                        <textarea
                                                            className="form-control rounded-4 w-75 video-form-textarea"
                                                            name="description"
                                                            value={uploadFormData.description}
                                                            onChange={handleUploadFormChange}
                                                            placeholder="Enter video description (optional)"
                                                            rows="2"
                                                        />
                                                    </div>

                                                    {/* Poster File */}
                                                    <div className="mb-3">
                                                        <label className="form-label fw-semibold video-form-label">
                                                            Poster Image <span className="video-form-required">*</span>
                                                        </label>
                                                        <input
                                                            type="file"
                                                            className="form-control rounded-4 py-2 w-75 video-form-input"
                                                            name="poster_file"
                                                            accept="image/*"
                                                            onChange={handleFileChange}
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
                                                        <label className="form-label fw-semibold video-form-label">
                                                            Video File <span className="video-form-required">*</span>
                                                        </label>
                                                        <input
                                                            type="file"
                                                            className="form-control rounded-4 py-2 w-75 video-form-input"
                                                            name="video_file"
                                                            accept="video/*"
                                                            onChange={handleFileChange}
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
                                                        <div className="progress video-upload-progress-track">
                                                            <div
                                                                className="progress-bar progress-bar-striped progress-bar-animated video-upload-progress-bar"
                                                                role="progressbar"
                                                                style={{ width: `${uploadProgress}%` }}
                                                                aria-valuenow={uploadProgress}
                                                                aria-valuemin="0"
                                                                aria-valuemax="100"
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Submit Button */}
                                                <div className="d-flex justify-content-center mt-3">
                                                    <button
                                                        type="button"
                                                        className="btn rounded-3 px-5 py-2 video-upload-submit-btn"
                                                        onClick={handleUploadVideo}
                                                        disabled={uploading}
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
                            <div className="card border-0 mt-4 width-850 video-current-card">

                                {/* Video Header */}
                                <div className="card-header border-0 d-flex justify-content-between align-items-center p-3 flex-wrap gap-2">
                                    <div className="d-flex flex-column min-w-0 flex-grow-1">
                                        <h5 className="mb-0 fw-semibold text-truncate">{currentVideo.title}</h5>
                                        {(currentVideo.group_name || currentVideo.groupName) && (
                                            <span className="small text-muted mt-1 text-truncate">
                                                {currentVideo.group_name || currentVideo.groupName}
                                            </span>
                                        )}
                                    </div>
                                    <span className="badge text-dark fw-semibold flex-shrink-0">
                                        Duration:{" "}
                                        {formatDuration(getVideoDuration(currentVideo))}
                                    </span>
                                </div>

                                {/* Poster Only */}
                                <div className="position-relative rounded-3">
                                    <video
                                        src={buildFileUrl(currentVideo.video_url) || undefined}
                                        controls
                                        className="w-100 px-3 video-player-el"
                                    />


                                </div>
                            </div>
                            {/* Video Info */}
                            <div className="card-body my-3">
                                <div className="d-flex align-items-center justify-content-between mb-3 ps-3 p-2 bg-light shadow-sm width-850 video-info-bar video-info-bar-wrap">
                                    <div className="d-flex align-items-center flex-grow-1 video-info-url-wrap">
                                        <span>URL:</span>
                                        <input
                                            type="text"
                                            className="form-control form-control-sm border-0 bg-transparent input-custom-width"
                                            value={buildFileUrl(currentVideo.video_url) || ''}
                                            readOnly
                                        />
                                    </div>
                                    <div className="d-flex align-items-center video-info-actions">
                                        <button
                                            type="button"
                                            className="btn rounded-3 btn-sm p-1 fw-semibold video-btn-copy"
                                            onClick={() => navigator.clipboard.writeText(buildFileUrl(currentVideo.video_url) || '')}
                                        >
                                            Copy
                                        </button>
                                        <button
                                            type="button"
                                            className="btn rounded-3 btn-sm p-1 px-2 fw-semibold video-btn-download ms-2"
                                            onClick={() => handleDownloadClick(currentVideo, true)}
                                            disabled={downloadingDetail}
                                        >
                                            <div className="d-flex align-items-center gap-1">
                                                {downloadingDetail ? (
                                                    <div className="spinner-border spinner-border-sm text-white" role="status" style={{ width: '14px', height: '14px' }}></div>
                                                ) : (
                                                    <DownloadSimple size={16} />
                                                )}
                                                <span>{downloadingDetail ? 'Downloading...' : 'Download'}</span>
                                            </div>
                                        </button>
                                        <button type="button" className="btn rounded-5 p-1 btn-sm video-btn-stat">
                                            <span className="m-1">{likeCounts[currentVideo._id || currentVideo.id]?.dislike || 0}</span>
                                            <ThumbsDown size={24} />
                                        </button>
                                        <button type="button" className="btn rounded-5 p-1 btn-sm video-btn-stat">
                                            <span className="m-1">{likeCounts[currentVideo._id || currentVideo.id]?.like || 0}</span>
                                            <HeartStraight size={24} />
                                        </button>
                                        <button type="button" className="btn rounded-5 p-1 btn-sm video-btn-stat">
                                            <span className="m-1">{currentVideo.commentCount || 0}</span>
                                            <ChatTeardropDots size={24} />
                                        </button>
                                    </div>
                                </div>

                            </div>

                            {/* Comments Section */}
                            <div className="card-body shadow-sm width-850 video-comments-card">
                                <h6 className="mb-3 fw-semibold p-3 video-comments-title">
                                    Comments Section
                                </h6>

                                {/* Scrollable comments box */}
                                <div className="comment_scrollbar_height video-comments-list">
                                    {currentVideo.comments && currentVideo.comments.length > 0 ? (
                                        currentVideo.comments.map((comment) => (
                                            <div key={comment._id || comment.id} className="px-3 d-flex align-items-start mb-3 pb-3">
                                                <img
                                                    src={(comment.Member_photo && comment.Member_photo.trim()) ? comment.Member_photo : `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.member_name || 'User')}&background=random`}
                                                    alt={comment.Member_photo || 'User'}
                                                    className="rounded-circle me-3 video-comment-avatar"
                                                />
                                                <div className="flex-grow-1">
                                                    <h6 className="mb-1 fw-semibold d-flex align-items-center">
                                                        {comment.member_name}
                                                        <small className="text-muted ms-2 fw-normal" style={{ fontSize: '0.7rem' }}>
                                                            {formatRelativeTime(comment.timestamp || comment.created_at || comment.createdAt)}
                                                        </small>
                                                    </h6>
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
                        <div className="card border-0 mt-4 width-850 d-flex justify-content-center align-items-center video-empty-state">
                            <div className="text-center text-muted">
                                <p className="mb-0 video-empty-state-text">No video selected</p>
                            </div>
                        </div>
                    )}


                </div>

                {/* Videos Sidebar */}
                <div className="mt-4 video-sidebar-wrap">
                    <div className={`card border-0 bg-white video-sidebar-card ${showUploadModal ? 'video-sidebar-card--upload-open' : ''}`}>
                        <div className="card-header border-0 d-flex justify-content-between align-items-center p-3 bg-white video-sidebar-header">
                            <h5 className="mb-0 fw-semibold me-1">Videos</h5>
                            <div className="d-flex align-items-center gap-2 video-sidebar-search-wrap">
                                <div
                                    ref={searchContainerRef}
                                    className={`search-container ${isSearchOpen ? 'search-container--open' : ''}`}
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
                                            />
                                            <MagnifyingGlass
                                                size={20}
                                                weight="bold"
                                                className="position-absolute search-icon-wrap"
                                            />
                                        </>
                                    ) : (
                                        <button
                                            type="button"
                                            className="btn p-0 border-0 bg-transparent search-trigger-btn"
                                            onClick={() => setIsSearchOpen(true)}
                                        >
                                            <MagnifyingGlass size={24} weight="bold" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="card-body p-2 videos-sidebar-scroll">
                            {videos.length > 0 ? (
                                videos.map((video) => {
                                    const videoId = video._id || video.id;
                                    const currentVideoId = currentVideo?._id || currentVideo?.id;
                                    const isSelected = currentVideo && videoId === currentVideoId;

                                    return (
                                        <div
                                            key={videoId}
                                            className={`d-flex align-items-center shadow-sm p-2 mb-2 rounded video-sidebar-item ${isSelected ? 'video-sidebar-item--selected' : ''}`}
                                            onClick={() => handleVideoSelect(video)}
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleVideoSelect(video); }}
                                        >
                                            <img
                                                src={buildFileUrl(video.poster_url) || 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'80\' height=\'60\'%3E%3Crect fill=\'%23e0e0e0\' width=\'80\' height=\'60\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' fill=\'%23999\' font-size=\'10\' font-family=\'sans-serif\'%3ENo poster%3C/text%3E%3C/svg%3E'}
                                                alt={video.title}
                                                className="rounded video-sidebar-thumb"
                                            />
                                            <div className="flex-grow-1 ms-3 min-w-0">
                                                <h6 className="mb-1 small video-sidebar-item-title text-truncate">{video.title}</h6>
                                                {(video.group_name || video.groupName) && (
                                                    <p className="mb-0 small video-sidebar-item-group text-truncate">
                                                        {video.group_name || video.groupName}
                                                    </p>
                                                )}
                                                <p className="mb-0 small video-sidebar-item-meta">
                                                    Duration:{" "}
                                                    {formatDuration(getVideoDuration(video))}
                                                </p>
                                            </div>
                                            <div className="d-flex gap-1">


                                                <button
                                                    type="button"
                                                    className="btn btn-sm p-0 rounded-5"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEditVideo(video);
                                                    }}
                                                >
                                                    <span className="video-icon-edit-span">
                                                        <PencilSimpleLine size={20} color="#000000" />
                                                    </span>
                                                </button>

                                                <button
                                                    type="button"
                                                    className="btn btn-sm p-0 rounded-5"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteVideo(video._id || video.id);
                                                    }}
                                                >
                                                    <span className="video-icon-edit-span">
                                                        <Trash size={20} className="video-icon-delete-span" />
                                                    </span>
                                                </button>

                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center text-muted p-4">
                                    <p className="mb-0">No videos available</p>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Upload Video Button - Outside the card */}
                    {!showUploadModal && (
                        <div className="mt-3 video-upload-cta-wrap">
                            <button
                                type="button"
                                className="btn w-100 d-flex align-items-center justify-content-center gap-2 video-upload-cta-btn"
                                onClick={() => setShowUploadModal(true)}
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
                    className="modal show d-block video-modal-backdrop"
                    onClick={() => {
                        setShowDeleteModal(false);
                        setVideoToDelete(null);
                    }}
                    role="presentation"
                >
                    <div
                        className="modal-dialog modal-dialog-centered"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-content rounded-4 border-0 video-modal-content">
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold video-modal-title">Delete Video</h5>
                                <button
                                    type="button"
                                    className="btn-close video-modal-close-btn"
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setVideoToDelete(null);
                                    }}
                                    aria-label="Close"
                                />
                            </div>

                            <div className="modal-body pt-3">
                                <p className="video-modal-body-text">
                                    Are you sure you want to delete this video? This action cannot be undone.
                                </p>
                            </div>

                            <div className="modal-footer border-0 pt-0">
                                <button
                                    type="button"
                                    className="btn rounded-3 video-modal-btn-cancel"
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setVideoToDelete(null);
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn rounded-3 video-modal-btn-danger"
                                    onClick={confirmDeleteVideo}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Comment Confirmation Modal */}
            {showDeleteCommentModal && (
                <div
                    className="modal show d-block video-modal-backdrop"
                    onClick={() => {
                        setShowDeleteCommentModal(false);
                        setCommentToDelete({ videoId: null, commentId: null });
                    }}
                    role="presentation"
                >
                    <div
                        className="modal-dialog modal-dialog-centered"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-content rounded-4 border-0 video-modal-content">
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold video-modal-title">Delete Comment</h5>
                                <button
                                    type="button"
                                    className="btn-close video-modal-close-btn"
                                    onClick={() => {
                                        setShowDeleteCommentModal(false);
                                        setCommentToDelete({ videoId: null, commentId: null });
                                    }}
                                    aria-label="Close"
                                />
                            </div>

                            <div className="modal-body pt-3">
                                <p className="video-modal-body-text">
                                    Are you sure you want to delete this comment? This action cannot be undone.
                                </p>
                            </div>

                            <div className="modal-footer border-0 pt-0">
                                <button
                                    type="button"
                                    className="btn rounded-3 video-modal-btn-cancel"
                                    onClick={() => {
                                        setShowDeleteCommentModal(false);
                                        setCommentToDelete({ videoId: null, commentId: null });
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn rounded-3 video-modal-btn-danger"
                                    onClick={confirmDeleteComment}
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
                    className="modal show d-block video-modal-backdrop"
                    onClick={() => setShowEditModal(false)}
                    role="presentation"
                >
                    <div
                        className="modal-dialog modal-dialog-centered"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-content rounded-4 border-0 video-modal-content">
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold video-modal-title">Edit Video</h5>
                                <button
                                    type="button"
                                    className="btn-close video-modal-close-btn"
                                    onClick={() => setShowEditModal(false)}
                                    aria-label="Close"
                                />
                            </div>

                            <div className="modal-body pt-3">
                                <form>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold video-edit-form-label">
                                            Title <span className="video-form-required">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control rounded-3 video-edit-form-input"
                                            value={editFormData.title || ''}
                                            onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                                            placeholder="Enter video title"
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-semibold video-edit-form-label">Poster (image)</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="form-control rounded-3 video-edit-form-input"
                                            onChange={handleEditPosterFileChange}
                                        />
                                        {editFormData.poster_file && (
                                            <span className="small text-muted d-block mt-1">
                                                Selected: {editFormData.poster_file.name}
                                            </span>
                                        )}
                                    </div>
                                </form>
                            </div>

                            <div className="modal-footer border-0 pt-0 w-100 align-items-center justify-content-center">
                                <button
                                    type="button"
                                    className="btn rounded-3 px-4 py-2 w-50 video-edit-save-btn"
                                    onClick={handleUpdateVideo}
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoDisplay;