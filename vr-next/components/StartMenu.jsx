import React from 'react';
import Image from 'next/image';

const StartMenu = ({ onStart }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-10">
      <div className="bg-white flex flex-col items-center justify-center bg-opacity-20 backdrop-blur-md p-8 rounded-lg shadow-lg text-center">
        <Image src="/logo.webp" alt="App Logo" width={150} height={150} className="mb-4" />
        <h1 className="text-4xl font-bold text-white mb-6">VR Chapter Viewer</h1>
        <button
          onClick={onStart}
          className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white py-3 px-6 rounded-lg text-xl transition-all duration-300"
        >
          Start Experience
        </button>
      </div>
    </div>
  );
};

export default StartMenu;