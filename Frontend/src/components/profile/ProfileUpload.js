import React, { useState } from 'react';
import { supabase } from '../../config/supabaseClient';
import '../../styles/ProfileUpload.css';

function ProfileUpload({ userEmail, currentImageUrl, onUploadSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl || null);

  const handleFileSelect = async (event) => {
    try {
      setUploading(true);
      const file = event.target.files[0];
      
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
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
        throw new Error(`Upload failed: ${uploadError.message}. Please ensure the 'avatars' bucket exists and is public in Supabase Storage.`);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      console.log('Upload successful! Public URL:', publicUrl);

      setPreviewUrl(publicUrl);

      // Update backend database
      const response = await fetch('http://localhost:5000/api/auth/profile-image', {
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

      if (!response.ok) throw new Error('Failed to update profile');

      onUploadSuccess(publicUrl);
      alert('Profile image updated successfully!');

    } catch (error) {
      console.error('Error uploading:', error);
      alert('Error uploading image: ' + error.message);
    } finally {
      setUploading(false);
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

      <label className="upload-btn">
        {uploading ? 'Uploading...' : 'Upload Photo'}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={uploading}
          style={{ display: 'none' }}
        />
      </label>
    </div>
  );
}

export default ProfileUpload;
