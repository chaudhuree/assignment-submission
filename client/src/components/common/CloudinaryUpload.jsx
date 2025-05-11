import React, { useState } from 'react';

const CloudinaryUpload = ({ onUploadSuccess, buttonText = 'Upload File', resourceType = 'auto' }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const successCallbackFunction = (result) => {
    setIsUploading(false);
    setError('');
    
    // Extract the secure URL from the result
    const fileUrl = result.info.secure_url;
    const publicId = result.info.public_id;
    const resourceType = result.info.resource_type;
    const format = result.info.format;
    
    // Pass the URL and file info to the parent component
    onUploadSuccess({
      url: fileUrl,
      publicId,
      resourceType,
      format
    });
  };

  const failureCallbackFunction = (error) => {
    console.error('Upload failed:', error);
    setIsUploading(false);
    setError('Upload failed. Please try again.');
  };

  const handleOnUploadStart = () => {
    setIsUploading(true);
    setError('');
  };

  // Use a simple file input instead of the Cloudinary widget
  // which is having compatibility issues
  const handleFileChange = async (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    setIsUploading(true);
    setError('');
    
    try {
      // Create FormData and append file
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'chaudhuree');
      
      // Upload directly to Cloudinary
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/djftsbsuu/${resourceType}/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }
      
      // Call success callback with the result
      successCallbackFunction({
        info: {
          secure_url: data.secure_url,
          public_id: data.public_id,
          resource_type: data.resource_type,
          format: data.format
        }
      });
    } catch (err) {
      console.error('Upload failed:', err);
      setError('Upload failed. Please try again.');
      setIsUploading(false);
    }
  };
  
  return (
    <div className="mb-4">
      <label className="block w-full">
        <input 
          type="file" 
          onChange={handleFileChange}
          disabled={isUploading}
          className="hidden"
          accept=".pdf,.doc,.docx,.zip"
        />
        <div 
          className={`text-white border-none w-full text-center py-2 px-4 rounded-md text-sm font-medium cursor-${isUploading ? 'not-allowed' : 'pointer'} bg-sky-600 hover:bg-sky-700 opacity-${isUploading ? '70' : '100'}`}
        >
          {isUploading ? 'Uploading...' : buttonText}
        </div>
      </label>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default CloudinaryUpload;
