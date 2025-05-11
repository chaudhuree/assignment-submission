import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    subjects: []
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const { name, email, password, role, subjects } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubjectsChange = (e) => {
    const selectedSubjects = Array.from(e.target.selectedOptions, option => option.value);
    setFormData({ ...formData, subjects: selectedSubjects });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
    <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Create a new account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
            sign in to your account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
              <p>{error}</p>
            </div>
          )}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={handleChange}
                  className="input"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={handleChange}
                  className="input"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={handleChange}
                  className="input"
                />
              </div>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <div className="mt-1">
                <select
                  id="role"
                  name="role"
                  value={role}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                </select>
              </div>
            </div>

            {role === 'teacher' && (
              <div>
                <label htmlFor="subjects" className="block text-sm font-medium text-gray-700">
                  Subjects (hold Ctrl/Cmd to select multiple)
                </label>
                <div className="mt-1">
                  <select
                    id="subjects"
                    name="subjects"
                    multiple
                    value={subjects}
                    onChange={handleSubjectsChange}
                    className="input h-40"
                  >
                    {subjectOptions.map(subject => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn btn-primary flex justify-center"
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
