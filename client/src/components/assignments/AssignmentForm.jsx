import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAssignment } from '../../services/assignmentService';

const AssignmentForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    price: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { title, description, subject, price } = formData;

  const handleChange = (e) => {
    const value = e.target.name === 'price' ? parseFloat(e.target.value) || '' : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await createAssignment(formData);
      navigate('/assignments');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create assignment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // List of common subjects
  const subjectOptions = [
    'Mathematics',
    'English',
    'Science',
    'History',
    'Geography',
    'Computer Science',
    'Physics',
    'Chemistry',
    'Biology',
    'Economics',
    'Business Studies',
    'Accounting',
    'Psychology',
    'Sociology',
    'Political Science',
    'Philosophy',
    'Engineering',
    'Medicine',
    'Law',
    'Art',
    'Music'
  ];

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-6">Create New Assignment</h2>
      
      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Assignment Title
          </label>
          <div className="mt-1">
            <input
              id="title"
              name="title"
              type="text"
              required
              value={title}
              onChange={handleChange}
              className="input"
              placeholder="Enter a descriptive title"
            />
          </div>
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
            Subject
          </label>
          <div className="mt-1">
            <select
              id="subject"
              name="subject"
              required
              value={subject}
              onChange={handleChange}
              className="input"
            >
              <option value="">Select a subject</option>
              {subjectOptions.map(subjectOption => (
                <option key={subjectOption} value={subjectOption}>
                  {subjectOption}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <div className="mt-1">
            <textarea
              id="description"
              name="description"
              rows={5}
              required
              value={description}
              onChange={handleChange}
              className="input"
              placeholder="Provide detailed information about your assignment"
            />
          </div>
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">
            Budget ($)
          </label>
          <div className="mt-1">
            <input
              id="price"
              name="price"
              type="number"
              min="1"
              step="0.01"
              required
              value={price}
              onChange={handleChange}
              className="input"
              placeholder="Your budget for this assignment"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/assignments')}
            className="btn btn-secondary mr-4"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Creating...' : 'Create Assignment'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AssignmentForm;
