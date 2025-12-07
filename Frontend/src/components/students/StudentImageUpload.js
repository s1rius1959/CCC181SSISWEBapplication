import React, { useState } from 'react';
import { supabase } from '../../config/supabaseClient';
import '../../styles/ProfileUpload.css';

function StudentImageUpload({ studentId, originalStudentId, currentImageUrl, onUploadSuccess }) {
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

      // Delete old image first if exists
      // Check both originalStudentId (if ID changed) and current studentId
      const idsToCheck = originalStudentId && originalStudentId !== studentId 
        ? [originalStudentId, studentId] 
        : [studentId];
      
      for (const idToCheck of idsToCheck) {
        try {
          const { data: files } = await supabase.storage
            .from('avatars')
            .list('students');
          
          if (files) {
            const oldFile = files.find(file => file.name.startsWith(`${idToCheck}.`));
            if (oldFile) {
              await supabase.storage
                .from('avatars')
                .remove([`students/${oldFile.name}`]);
              console.log(`Deleted old image: students/${oldFile.name}`);
            }
          }
        } catch (err) {
          console.warn(`Could not delete old image for ID ${idToCheck}:`, err);
        }
      }

      // Create file name using only student ID (no timestamp)
      const fileExt = file.name.split('.').pop().toLowerCase();
      const fileName = `${studentId}.${fileExt}`;
      const filePath = `students/${fileName}`;

      // Upload to Supabase Storage - upsert will replace if exists
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

      // Get public URL with cache-busting timestamp
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      // Add timestamp to prevent browser caching
      const urlWithTimestamp = `${publicUrl}?t=${Date.now()}`;
      
      console.log('Student image uploaded! Public URL:', urlWithTimestamp);

      setPreviewUrl(urlWithTimestamp);
      onUploadSuccess(urlWithTimestamp);
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
