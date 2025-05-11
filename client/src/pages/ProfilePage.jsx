import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">My Profile</h2>
      
      <div className="card">
        <div className="flex items-center mb-6">
          <div className="h-20 w-20 rounded-full bg-primary-600 flex items-center justify-center text-white text-3xl font-semibold mr-6">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-xl font-semibold">{user.name}</h3>
            <p className="text-gray-500 capitalize">{user.role}</p>
          </div>
        </div>
        
        <div className="space-y-4 border-t pt-6">
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium">{user.email}</p>
          </div>
          
          {user.role === 'teacher' && (
            <div>
              <p className="text-sm text-gray-500">Subjects</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {user.subjects && user.subjects.length > 0 ? (
                  user.subjects.map((subject, index) => (
                    <span 
                      key={index} 
                      className="bg-primary-100 text-primary-800 text-sm px-3 py-1 rounded-full"
                    >
                      {subject}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500">No subjects specified</p>
                )}
              </div>
            </div>
          )}
          
          <div>
            <p className="text-sm text-gray-500">Member Since</p>
            <p className="font-medium">
              {new Date(user.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
