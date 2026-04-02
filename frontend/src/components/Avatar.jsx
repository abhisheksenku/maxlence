import React from 'react';

// Vite environment variable access
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Avatar({ user, size = 40 }) {
  // Loading/Null state
  if (!user) {
    return <div style={{ ...circle(size), background: 'var(--surface2)' }} />;
  }

  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
  
  // Logic to determine image source
  const imgSrc = user.profileImage
    ? (user.profileImage.startsWith('http') ? user.profileImage : `${BASE_URL}${user.profileImage}`)
    : null;

  // Modern color palette for initial fallbacks
  const colors = ['#7c6af7', '#34d399', '#f87171', '#fbbf24', '#60a5fa', '#f472b6'];
  const colorIdx = (user.firstName?.charCodeAt(0) || 0) % colors.length;

  const circleStyle = circle(size);

  // If user has a profile image, try to render it
  if (imgSrc) {
    return (
      <img
        src={imgSrc}
        alt={`${user.firstName} ${user.lastName}`}
        style={{ 
          ...circleStyle, 
          objectFit: 'cover', 
          border: '2px solid var(--border)' 
        }}
        // If image fails (e.g., 404), hide it so the parent container shows initials (if implemented) 
        // or just use a simple state toggle if you want a perfect fallback.
        onError={(e) => {
          e.target.onerror = null; 
          e.target.src = ""; // This triggers the hide logic or you can swap to initials
          e.target.style.display = 'none';
        }}
      />
    );
  }

  // Fallback: Initials with a colored background
  return (
    <div
      style={{
        ...circleStyle,
        background: `${colors[colorIdx]}22`,
        border: `2px solid ${colors[colorIdx]}44`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: colors[colorIdx],
        fontFamily: 'Syne, sans-serif',
        fontWeight: 700,
        fontSize: size * 0.38,
      }}
    >
      {initials || '?'}
    </div>
  );
}

// Helper for consistent circular dimensions
const circle = (size) => ({
  width: size,
  height: size,
  borderRadius: '50%',
  flexShrink: 0,
});