import { useState, useEffect } from 'react';
import {
    UsersFour,
    ChartLineUp,
    CalendarCheck,
    Chats,
    ChatsCircle,
    WaveSine,
    Headset
} from "phosphor-react";
import { AreaChart, Area } from 'recharts';

const OverallNumbers = ({ cardsData }) => {
    const [isMounted, setIsMounted] = useState(false);
    
    useEffect(() => {
        const timer = setTimeout(() => setIsMounted(true), 150);
        return () => clearTimeout(timer);
    }, []);
    const renderIcon = (iconType) => {
        const size = 40;
        const gradientColor = "url(#icon-gradient)";

        switch (iconType) {
            case "UsersFour":
                return <UsersFour size={size} weight="regular" color={gradientColor} />;
            case "ChartLineUp": return <ChartLineUp size={size} weight="regular" color={gradientColor} />;
            case "CalendarCheck": return <CalendarCheck size={size} weight="bold" color={gradientColor} />;
            case "Chats": return <ChatsCircle size={size} weight="regular" color={gradientColor} />;
            case "WaveSine": return <WaveSine size={size} weight="regular" color={gradientColor} />;
            case "Headset": return <Headset size={size} weight="regular" color={gradientColor} />;
            case "Progress":
                return (
                    <div style={{ width: '80px', height: '12px', background: 'var(--divider-color)', borderRadius: '10px', marginTop: '10px' }}>
                        <div style={{ width: '60%', height: '100%', background: 'var(--primary-gradient)', borderRadius: '10px' }}></div>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="px-4 mt-4">
            <svg width="0" height="0" style={{ position: 'absolute' }}>
                <defs>
                    <linearGradient id="icon-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#00DC85" />
                        <stop offset="100%" stopColor="#0076EA" />
                    </linearGradient>
                </defs>
            </svg>

            <h5 className="fw-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Overall Numbers</h5>
            <div className="analysis-cards-container">
                {cardsData.map((card, index) => (
                    <div key={index} className="analysis-card">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <span className="analysis-card-title">{card.title}</span>
                            {card.change && (
                                <span className="analysis-card-pill">{card.change}</span>
                            )}
                        </div>

                        <div className="d-flex align-items-center mt-2">
                            {card.showAvatars && card.avatars && card.avatars.length > 0 && (
                                <div className="analysis-card-avatars">
                                    {card.avatars.slice(0, 3).map((avatar, i) => (
                                        <img 
                                            key={i} 
                                            src={avatar || "/assets/default-avatar.png"} 
                                            alt="avatar" 
                                            className="analysis-card-avatar"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = "/assets/default-avatar.png";
                                            }}
                                        />
                                    ))}
                                    {card.avatars.length > 3 && (
                                        <div className="analysis-card-avatar-more" style={{ 
                                            width: '24px', 
                                            height: '24px', 
                                            borderRadius: '50%', 
                                            border: '2px solid var(--card-bg)', 
                                            backgroundColor: 'var(--bg-light)', 
                                            fontSize: '10px', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center',
                                            marginLeft: '-8px',
                                            color: 'var(--text-secondary)',
                                            fontWeight: 'bold',
                                            zIndex: 1
                                        }}>
                                            +{card.avatars.length - 3}
                                        </div>
                                    )}
                                </div>
                            )}
                            <span className="analysis-card-value">{card.value}</span>
                        </div>

                        {!card.sparkline && (
                            <div className="analysis-card-icon-wrapper">
                                {renderIcon(card.iconType)}
                            </div>
                        )}

                        {card.sparkline && (
                            <div className="analysis-card-sparkline-wrapper d-flex justify-content-end mt-2" style={{ height: '55px' }}>
                                <div style={{ width: '130px', height: '55px', position: 'relative' }}>
                                    {isMounted && (
                                        <AreaChart width={130} height={55} data={card.sparkline}>
                                            <defs>
                                                <linearGradient id={`gradient-${index}`} x1="0" y1="0" x2="1" y2="0">
                                                    <stop offset="0%" stopColor="#00DC85" stopOpacity={1} />
                                                    <stop offset="100%" stopColor="#0076EA" stopOpacity={1} />
                                                </linearGradient>
                                                <linearGradient id={`fill-gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#00DC85" stopOpacity={0.4} />
                                                    <stop offset="100%" stopColor="#0076EA" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <Area
                                                type="monotone"
                                                dataKey="value"
                                                stroke={`url(#gradient-${index})`}
                                                strokeWidth={3}
                                                fillOpacity={card.showFill ? 1 : 0}
                                                fill={card.showFill ? `url(#fill-gradient-${index})` : 'none'}
                                                isAnimationActive={true}
                                            />
                                        </AreaChart>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OverallNumbers;
