import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-primary-800 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">AssignBid</h3>
            <p className="text-gray-300 mb-4">
              Connect students with teachers for assignment help and bidding.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/assignments" className="text-gray-300 hover:text-white">
                  Assignments
                </Link>
              </li>
              <li>
                <Link to="/chats" className="text-gray-300 hover:text-white">
                  Chats
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <p className="text-gray-300 mb-2">Email: support@assignbid.com</p>
            <p className="text-gray-300 mb-2">Phone: +1 123 456 7890</p>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-300">
          <p>&copy; {new Date().getFullYear()} AssignBid. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
