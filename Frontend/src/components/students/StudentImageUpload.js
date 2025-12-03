import React, { useState } from 'react';
import { supabase } from '../../config/supabaseClient';
import '../../styles/ProfileUpload.css';

function StudentImageUpload({ studentId, currentImageUrl, onUploadSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl || null);

  const handleFileSelect = async (event) => {
    try {
      setUploading(true);
      const file = event.target.files[0];
      
      if (!file) return;

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

      // Create unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${studentId}_${Date.now()}.${fileExt}`;
      const filePath = `students/${fileName}`;

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
      
      console.log('Student image uploaded! Public URL:', publicUrl);

      setPreviewUrl(publicUrl);
      onUploadSuccess(publicUrl);
      alert('Student image uploaded successfully!');

    } catch (error) {
      console.error('Error uploading:', error);
      alert('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="profile-upload-container">
      <div className="profile-preview">
        <img 
          src={previewUrl || '/user_icon.png'} 
          alt="Student"
          className="profile-image-preview"
        />
      </div>
      
      <div className="upload-controls">
        <label htmlFor="student-image-upload" className="upload-btn">
          {uploading ? <><span className="spinner"></span>Uploading...</> : 'Choose Image'}
        </label>
        <input
          id="student-image-upload"
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={uploading}
          style={{ display: 'none' }}
        />
      </div>

      <p className="upload-hint">Max 10MB • JPG, PNG, GIF</p>
    </div>
  );
}

export default StudentImageUpload;
