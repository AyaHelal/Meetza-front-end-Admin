import React from 'react';
import { useBranding } from '../../context/BrandingContext';
import './BrandingLogo.css';

const BrandingLogo = ({
  className = "",
  style = {},
  fallbackSrc = "/assets/MeetzaLogo.png",
  alt = "Company Logo",
  showSystemName = true,
  systemNameClassName = "",
  systemNameStyle = {},
  maxWidth = '120px',
  size = 'medium' // 'small', 'medium', 'large', 'extra-small'
}) => {
  const { logoUrl, systemName, systemNameColor, loading } = useBranding();
  
  
  
  // Generate CSS classes
  const getLogoClasses = () => {
    let classes = 'branding-logo';
    
    if (className) {
      classes += ` ${className}`;
    }
    
    return classes;
  };

  const getLogoImageClasses = () => {
    let classes = '';
    
    switch (size) {
      case 'large':
        classes += 'branding-logo-large';
        break;
      case 'small':
        classes += 'branding-logo-small';
        break;
      case 'extra-small':
        classes += 'branding-logo-extra-small';
        break;
      default:
        // medium - no additional class
        break;
    }
    
    return classes;
  };

  const getSystemNameClasses = () => {
    let classes = 'branding-system-name';
    
    switch (size) {
      case 'large':
        classes += ' branding-system-name-large';
        break;
      case 'small':
        classes += ' branding-system-name-small';
        break;
      case 'extra-small':
        classes += ' branding-system-name-extra-small';
        break;
      default:
        // medium - no additional class
        break;
    }
    
    if (systemNameClassName) {
      classes += ` ${systemNameClassName}`;
    }
    
    return classes;
  };

  const getSystemNameStyle = () => {
    const baseStyle = { ...systemNameStyle };
    
    // Apply custom color if not default Meetza
    if (!isDefaultMeetza && systemNameColor) {
      baseStyle.color = systemNameColor;
      // Remove gradient and use solid color
      baseStyle.background = 'none';
      baseStyle.webkitBackgroundClip = 'initial';
      baseStyle.webkitTextFillColor = systemNameColor;
      baseStyle.backgroundClip = 'initial';
    }
    
    return baseStyle;
  };

  if (loading) {
    return (
      <div className="branding-logo-loading" style={style}>
        <img src={fallbackSrc} alt={alt} className={getLogoImageClasses()} />
      </div>
    );
  }

  // Case 1: Default Meetza - show logo + word as images
  const isDefaultMeetza = systemName === 'Meetza';
  
  
  if (isDefaultMeetza) {
    return (
      <div className={`branding-logo-default ${getLogoClasses()}`} style={style}>
        <img
          src="/assets/MeetzaLogo.png"
          alt="Meetza Logo"
          className={getLogoImageClasses()}
        />
        <img
          src="/assets/MeetzaWord.png"
          alt="Meetza Word"
          style={{ maxWidth: '150px', height: 'auto', ...systemNameStyle }}
        />
      </div>
    );
  }

  // Case 2: Custom logo with system name - show logo + name + powered by below
  if (showSystemName && systemName) {
    return (
      <div className={`branding-logo-custom ${getLogoClasses()}`} style={style}>
        <div className="branding-logo-content">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={alt}
              className={getLogoImageClasses()}
              onError={(e) => {
                e.target.src = fallbackSrc;
              }}
            />
          ) : (
            <img src={fallbackSrc} alt={alt} className={getLogoImageClasses()} />
          )}
          <div className={getSystemNameClasses()} style={getSystemNameStyle()}>
            {systemName}
          </div>
        </div>
        <div className="branding-powered-by">
          Powered by 
          <img src="/assets/MeetzaLogo.png" alt="Meetza" />
          <img src="/assets/MeetzaWord.png" alt="Meetza" />
        </div>
      </div>
    );
  }

  // Case 3: Custom logo only - show logo centered
  return (
    <div className={`branding-logo-center ${getLogoClasses()}`} style={style}>
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={alt}
          className={getLogoImageClasses()}
          onError={(e) => {
            e.target.src = fallbackSrc;
          }}
        />
      ) : (
        <img src={fallbackSrc} alt={alt} className={getLogoImageClasses()} />
      )}
    </div>
  );
};

export default BrandingLogo;
