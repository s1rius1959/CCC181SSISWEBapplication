import React, { useState } from 'react';
import { supabase } from '../../config/supabaseClient';
import '../../styles/ProfileUpload.css';

function ProfileUpload({ userEmail, currentImageUrl, onUploadSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl || null);

  // Helper to extract file path from Supabase URL
  const getFilePathFromUrl = (url) => {
    if (!url) return null;
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      const bucketIndex = pathParts.indexOf('avatars');
      if (bucketIndex !== -1) {
        return pathParts.slice(bucketIndex + 1).join('/');
      }
    } catch (e) {
      console.error('Error parsing URL:', e);
    }
    return null;
  };

  // Delete old image from Supabase
  const deleteOldImage = async (oldUrl) => {
    if (!oldUrl) return;
    
    const filePath = getFilePathFromUrl(oldUrl);
    if (!filePath) return;

    try {
      const { error } = await supabase.storage
        .from('avatars')
        .remove([filePath]);
      
      if (error) {
        console.warn('Could not delete old image:', error.message);
      } else {
        console.log('Old image deleted successfully');
      }
    } catch (error) {
      console.warn('Error deleting old image:', error);
    }
  };

  const handleFileSelect = async (event) => {
    try {
      setUploading(true);
      const file = event.target.files[0];
      
      if (!file) {
        setUploading(false);
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (JPG, PNG, GIF, etc.)');
        setUploading(false);
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB. Please choose a smaller image.');
        setUploading(false);
        return;
      }

      // Delete old image before uploading new one
      if (currentImageUrl) {
        await deleteOldImage(currentImageUrl);
      }

      // Create unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${userEmail.replace('@', '_')}_${Date.now()}.${fileExt}`;
      const filePath = `profile-images/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Upload error details:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}. Please check your Supabase configuration.`);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      console.log('Upload successful! Public URL:', publicUrl);

      setPreviewUrl(publicUrl);

      // Update backend database
      const response = await fetch('/api/auth/profile-image', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          email: userEmail, 
          profile_image_url: publicUrl 
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update profile in database');
      }

      onUploadSuccess(publicUrl);
      alert('Profile image updated successfully!');

    } catch (error) {
      console.error('Error uploading:', error);
      alert('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!previewUrl) return;
    
    if (!window.confirm('Are you sure you want to remove your profile picture?')) {
      return;
    }

    try {
      setDeleting(true);

      // Delete from Supabase
      await deleteOldImage(previewUrl);

      // Update backend database
      const response = await fetch('/api/auth/profile-image', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          email: userEmail, 
          profile_image_url: null 
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to remove profile picture');
      }

      setPreviewUrl(null);
      onUploadSuccess(null);
      alert('Profile picture removed successfully!');

    } catch (error) {
      console.error('Error removing image:', error);
      alert('Failed to remove profile picture: ' + error.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="profile-upload">
      <div className="profile-image-container">
        {previewUrl ? (
          <img 
            src={previewUrl} 
            alt="Profile" 
            className="profile-image"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/150?text=No+Image';
            }}
          />
        ) : (
          <div className="profile-placeholder">
            <span>👤</span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <label className="upload-btn">
          {uploading ? <><span className="spinner"></span>Uploading...</> : 'Upload Photo'}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading || deleting}
            style={{ display: 'none' }}
          />
        </label>

        {previewUrl && (
          <button 
            className="remove-profile-btn"
            onClick={handleRemoveImage}
            disabled={uploading || deleting}
          >
            {deleting ? <><span className="spinner"></span>Removing...</> : 'Remove Photo'}
          </button>
        )}
      </div>

      <p className="upload-hint">Max 10MB • JPG, PNG, GIF</p>
    </div>
  );
}

export default ProfileUpload;
