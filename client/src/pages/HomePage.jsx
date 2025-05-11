import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="space-y-16 ">
      {/* Hero Section */}
      <div className="text-center py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[#0284c7] to-[#0284c7] text-white rounded-xl">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
          Assignment Bidding Platform
        </h1>
        <p className="mt-6 text-xl max-w-3xl mx-auto">
          Connect with qualified teachers to get help with your assignments. 
          Submit your work, receive bids, and choose the best offer.
        </p>
        <div className="mt-10 flex justify-center">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="btn btn-primary text-lg px-8 py-3"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="btn btn-primary text-lg px-8 py-3"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="ml-4 btn btn-primary bg-white text-[#0284c7] hover:bg-gray-100 text-lg px-8 py-3"
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      </div>

      {/* How It Works Section */}
      <div>
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-[#0284c7] text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              1
            </div>
            <h3 className="text-xl font-semibold mb-2">Submit Assignment</h3>
            <p className="text-gray-600">
              Create an account as a student and submit your assignment with details and budget.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-[#0284c7] text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              2
            </div>
            <h3 className="text-xl font-semibold mb-2">Receive Bids</h3>
            <p className="text-gray-600">
              Qualified teachers will review your assignment and place bids with their proposed price.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-[#0284c7] text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              3
            </div>
            <h3 className="text-xl font-semibold mb-2">Get Your Solution</h3>
            <p className="text-gray-600">
              Accept the best bid, make payment when the work is completed, and download your solution.
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div>
        <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="card">
            <h3 className="text-xl font-semibold mb-3">Real-time Bidding</h3>
            <p className="text-gray-600">
              Teachers can place bids on assignments in real-time, allowing students to choose the best offer.
            </p>
          </div>
          <div className="card">
            <h3 className="text-xl font-semibold mb-3">Secure Payments</h3>
            <p className="text-gray-600">
              Students only pay after the assignment is completed and they've reviewed the preview.
            </p>
          </div>
          <div className="card">
            <h3 className="text-xl font-semibold mb-3">Direct Communication</h3>
            <p className="text-gray-600">
              Chat directly with teachers to discuss assignment details and requirements.
            </p>
          </div>
          <div className="card">
            <h3 className="text-xl font-semibold mb-3">Quality Assurance</h3>
            <p className="text-gray-600">
              Preview assignments before making payment to ensure quality and satisfaction.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center py-12 px-4 sm:px-6 lg:px-8 bg-[#0284c7] rounded-xl">
        <h2 className="text-3xl font-bold mb-6 text-white">Ready to Get Started?</h2>
        <p className="text-xl text-white max-w-3xl mx-auto mb-8">
          Join our platform today and connect with qualified teachers to get help with your assignments.
        </p>
        {isAuthenticated ? (
          <Link
            to="/dashboard"
            className="btn btn-primary text-lg px-8 py-3"
          >
            Go to Dashboard
          </Link>
        ) : (
          <>
            <Link
              to="/register"
              className="btn btn-primary text-lg px-8 py-3  text-white"
            >
              Create an Account
            </Link>
            <Link
              to="/login"
              className="ml-4 btn btn-primary text-lg px-8 py-3 bg-white text-[#0284c7]"
            >
              Sign In
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default HomePage;
