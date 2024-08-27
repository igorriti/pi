import React, { useRef, useEffect } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';

const StartMenu = ({ onStart, visible }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    if (!visible) {
      gsap.to(menuRef.current, {
        opacity: 0,
        scale: 0.8,
        duration: 1.5,
        ease: "power2.inOut",
        onComplete: () => {
          if (menuRef.current) {
            menuRef.current.style.display = 'none';
          }
        }
      });
    }
  }, [visible]);

  const handleStartClick = () => {
    gsap.to(menuRef.current, {
      opacity: 0,
      scale: 0.8,
      duration: 1.5,
      ease: "power2.inOut",
      onComplete: () => onStart()
    });
  };

  return (
    <div ref={menuRef} className="fixed inset-0 flex items-center justify-center z-10">
      <div className="bg-white flex flex-col items-center justify-center bg-opacity-20 backdrop-blur-md p-8 rounded-lg shadow-lg text-center">
        <Image src="/logo.webp" alt="App Logo" width={150} height={150} className="mb-4 rounded-full" />
        <h1 className="text-4xl font-bold text-white mb-6">Envi v2.0</h1>
        <button
          onClick={handleStartClick}
          className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white py-3 px-6 rounded-lg text-xl transition-all duration-300"
        >
          Start Experience
        </button>
      </div>
    </div>
  );
};

export default StartMenu;