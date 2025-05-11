import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { completeAssignment, updateSubmission } from '../../services/assignmentService';
import { useSocket } from '../../context/SocketContext';
import CloudinaryUpload from '../common/CloudinaryUpload';

const SubmissionForm = ({ assignmentId, onSubmissionComplete, isUpdate = false }) => {
  const [files, setFiles] = useState({
    submissionFile: null,
    previewFile: null
  });
  const [cloudinaryFiles, setCloudinaryFiles] = useState({
    submissionFile: null,
    previewFile: null
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formKey, setFormKey] = useState(Date.now()); // Add a key to force component re-render
  const navigate = useNavigate();
  const { sendStatusUpdate } = useSocket();

  const handleFileChange = (e) => {
    setFiles({
      ...files,
      [e.target.name]: e.target.files[0]
    });
  };
  
  const handleSubmissionUploadSuccess = (fileData) => {
    setCloudinaryFiles(prev => ({
      ...prev,
      submissionFile: fileData
    }));
  };
  
  const handlePreviewUploadSuccess = (fileData) => {
    setCloudinaryFiles(prev => ({
      ...prev,
      previewFile: fileData
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!cloudinaryFiles.submissionFile || !cloudinaryFiles.previewFile) {
      setError('Both submission file and preview file are required');
      setLoading(false);
      return;
    }

    try {
      // Create payload with Cloudinary file URLs and metadata
      const payload = {
        submissionFileUrl: cloudinaryFiles.submissionFile.url,
        submissionFileId: cloudinaryFiles.submissionFile.publicId,
        previewFileUrl: cloudinaryFiles.previewFile.url,
        previewFileId: cloudinaryFiles.previewFile.publicId
      };

      if (isUpdate) {
        // Use the update endpoint if we're updating
        await updateSubmission(assignmentId, payload);
        
        // Notify via socket that files were updated
        sendStatusUpdate({
          assignmentId,
          status: 'updated'
        });
      } else {
        // Use the complete endpoint for initial submission
        await completeAssignment(assignmentId, payload);
        
        // Notify via socket
        sendStatusUpdate({
          assignmentId,
          status: 'completed'
        });
      }
      
      // Reset form state after successful submission
      setFiles({
        submissionFile: null,
        previewFile: null
      });
      setCloudinaryFiles({
        submissionFile: null,
        previewFile: null
      });
      setFormKey(Date.now()); // Update key to force re-render of Cloudinary components
      
      // Call the callback if provided
      if (onSubmissionComplete) {
        onSubmissionComplete();
      } else {
        navigate(`/assignments/${assignmentId}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit assignment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">
        {isUpdate ? 'Update Submission Files' : 'Submit Completed Assignment'}
      </h3>
      
      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Submission File (PDF, DOC, DOCX, ZIP)
          </label>
          <CloudinaryUpload 
            key={`submission-${formKey}`}
            onUploadSuccess={handleSubmissionUploadSuccess}
            buttonText={cloudinaryFiles.submissionFile ? 'Change Submission File' : 'Upload Submission File'}
            resourceType="auto"
          />
          {cloudinaryFiles.submissionFile && (
            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-700 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                File uploaded successfully
              </p>
              <a href={cloudinaryFiles.submissionFile.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                View uploaded file
              </a>
            </div>
          )}
          <p className="mt-1 text-xs text-gray-500">
            This is the complete assignment that will be available to the student after payment.
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Preview File (PDF, DOC, DOCX)
          </label>
          <CloudinaryUpload 
            key={`preview-${formKey}`}
            onUploadSuccess={handlePreviewUploadSuccess}
            buttonText={cloudinaryFiles.previewFile ? 'Change Preview File' : 'Upload Preview File'}
            resourceType="auto"
          />
          {cloudinaryFiles.previewFile && (
            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-700 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                File uploaded successfully
              </p>
              <a href={cloudinaryFiles.previewFile.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                View uploaded file
              </a>
            </div>
          )}
          <p className="mt-1 text-xs text-gray-500">
            This is a preview or sample of your work that the student can see before payment.
          </p>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Submitting...' : (isUpdate ? 'Update Submission' : 'Submit Assignment')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubmissionForm;
