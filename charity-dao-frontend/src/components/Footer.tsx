import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-800 text-gray-300 py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-semibold text-white">Charity DAO Platform</h3>
            <p className="text-sm mt-1">Transparent charitable donations on the blockchain</p>
          </div>
          
          <div className="text-center md:text-right">
            <p className="text-sm">
              &copy; {currentYear} Charity DAO. All rights reserved.
            </p>
            <p className="text-xs mt-1 text-gray-400">
              Masters in Information Systems Security Project
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
