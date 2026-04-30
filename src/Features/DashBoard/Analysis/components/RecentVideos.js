import React from 'react';
import { YoutubeLogo, Users } from 'phosphor-react';
import './RecentVideos.css';

const RecentVideos = ({ videosData = [] }) => {
    return (
        <div className="recent-videos-section mt-4 mb-2">
            <h4 className="recent-videos-title mb-3 px-4">Recent Videos</h4>

            <div className="recent-videos-grid px-4">
                {videosData.length === 0 ? (
                    <div className="text-muted p-4">No recent videos found</div>
                ) : (
                    videosData.map((video) => (
                        <div className="video-analytics-card" key={video.id}>
                            <div className="video-thumbnail-container">
                                <img
                                    src={video.posterUrl || "/assets/video-standard.png"}
                                    alt={video.title}
                                    className="video-thumbnail"
                                />
                                <div className="video-date-badge">
                                    {video.date}
                                </div>
                            </div>

                            <div className="video-info-content">
                                <h5 className="video-card-title">Video: {video.title}</h5>
                                <p className="video-card-group">Group: {video.group}</p>

                                <div className="watch-progress-container">
                                    <div className="watch-progress-header">
                                        <div className="play-icon-wrapper">
                                            <YoutubeLogo size={26} weight="regular" color="rgba(255, 255, 255, 1) " />
                                        </div>
                                        <span className="progress-label">Avg watch progress</span>
                                    </div>

                                    <div className="progress-bar-wrapper">
                                        <div
                                            className="progress-bar-fill"
                                            style={{ width: `${video.avgProgressPercent}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="video-card-footer">
                                    <span className="completion-text">{video.completionRate}% Completion</span>
                                    <div className="viewer-count">
                                        <span className="viewer-number">{video.viewerCount} Viewer</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default RecentVideos;
