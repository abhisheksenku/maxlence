import React, { useState, useRef, useEffect } from 'react';

export default function ImageUpload({ value, onChange, error, label = 'Profile Photo' }) {
  const [preview, setPreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  // Clean up the object URL when the component unmounts or preview changes
  // to prevent memory leaks in the browser.
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFile = (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB limit matching backend)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be under 5MB');
      return;
    }

    const url = URL.createObjectURL(file);
    setPreview(url);
    onChange(file);
  };

  const handleInputChange = (e) => handleFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation(); // Prevent triggering the click on the dropzone
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label style={labelStyle}>
        {label}
      </label>

      <div
        style={{
          ...dropzone,
          ...(dragging ? dropzoneDrag : {}),
          ...(error ? dropzoneError : {}),
        }}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        {preview ? (
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <img src={preview} alt="Preview" style={previewImg} />
            <button
              type="button"
              onClick={handleRemove}
              style={removeBtn}
              title="Remove photo"
            >
              ✕
            </button>
          </div>
        ) : (
          <div style={placeholder}>
            <div style={iconCircle}>
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>
              {dragging ? 'Drop to upload' : 'Click or drag photo here'}
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-dim)', margin: 0 }}>
              PNG, JPG, or GIF up to 5MB
            </p>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleInputChange}
        />
      </div>

      {error && <p className="field-error">⚠ {error}</p>}
    </div>
  );
}

// --- Styles ---

const labelStyle = {
  fontSize: 13,
  fontWeight: 500,
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.03em'
};

const dropzone = {
  border: '2px dashed var(--border)',
  borderRadius: 12,
  padding: 24,
  cursor: 'pointer',
  textAlign: 'center',
  transition: 'all 0.2s',
  background: 'var(--surface2)',
  minHeight: 140,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const dropzoneDrag = { 
  borderColor: 'var(--accent)', 
  background: 'var(--accent-dim)',
  transform: 'scale(1.01)'
};

const dropzoneError = { borderColor: 'var(--danger)' };

const placeholder = { 
  display: 'flex', 
  flexDirection: 'column', 
  alignItems: 'center', 
  gap: 10 
};

const iconCircle = {
  width: 48,
  height: 48,
  borderRadius: '50%',
  background: 'var(--accent-dim)',
  color: 'var(--accent)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const previewImg = {
  width: 100,
  height: 100,
  borderRadius: '50%',
  objectFit: 'cover',
  border: '3px solid var(--accent)',
  display: 'block',
};

const removeBtn = {
  position: 'absolute',
  top: -4,
  right: -4,
  width: 24,
  height: 24,
  borderRadius: '50%',
  background: 'var(--danger)',
  color: '#fff',
  border: 'none',
  cursor: 'pointer',
  fontSize: 12,
  fontWeight: 700,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
};