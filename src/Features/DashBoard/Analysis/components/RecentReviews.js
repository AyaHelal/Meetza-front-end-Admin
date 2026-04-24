import React from 'react';
import { ChatCircleDots, UsersThree } from 'phosphor-react';
import './RecentReviews.css';

const RecentReviews = ({ reviewsData }) => {
    // Helper to calculate "time ago"
    const getTimeAgo = (dateString) => {
        if (!dateString || dateString === '-') return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'just now';
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 30) return `${diffInDays} days ago`;
        const diffInMonths = Math.floor(diffInDays / 30);
        return `${diffInMonths} months ago`;
    };

    if (!reviewsData || reviewsData.length === 0) {
        return null;
    }

    return (
        <div className="px-4  mb-5">
            <h5 className="fw-semibold mb-4" style={{ color: '#010101', fontSize: '1.5rem' }}>Recent Reviews</h5>
            <div className="reviews-list">
                {reviewsData.map((review) => (
                    <div key={review.id} className="review-card">
                        <div className="review-header">
                            <img
                                src={review.reviewerPhoto || "/assets/default-avatar.png"}
                                alt={review.reviewerName}
                                className="reviewer-photo"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "/assets/default-avatar.png";
                                }}
                            />
                            <div className="reviewer-info">
                                <span className="reviewer-name">{review.reviewerName}</span>
                                <span className="review-date">{getTimeAgo(review.rawDate)}</span>
                            </div>
                        </div>

                        <p className="review-comment">{review.comment}</p>

                        <div className="review-footer">
                            <div className="footer-item">
                                <ChatCircleDots size={20} weight="bold" color="#00DC85" />
                                <span className='fw-semibold'>Video: {review.videoTitle}</span>
                            </div>
                            <div className="footer-item">
                                <UsersThree size={20} weight="bold" color="#00DC85" />
                                <span className='fw-semibold'>Group: {review.groupName}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecentReviews;
