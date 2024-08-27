import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const styles = [
  { name: 'Animated', image: '/options/animated.webp' },
  { name: 'Cartoon', image: '/options/cartoon.webp' },
  { name: 'Realistic', image: '/options/photo.webp' },
  { name: 'Abstract', image: '/options/abstract.webp' },
];

const avoidOptions = [
  { name: 'Scary Things', image: '/options/scary.webp' },
  { name: 'Monsters', image: '/options/monster.webp' },
  { name: 'Persons', image: '/options/persons.webp' },
  { name: 'Violence', image: '/options/violence.webp' },
];

const WelcomeScreen = ({ onComplete, initialPreferences }) => {
  const [selectedStyle, setSelectedStyle] = useState(initialPreferences?.style || '');
  const [avoidList, setAvoidList] = useState(initialPreferences?.avoid || []);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleStyleSelect = (style) => {
    setSelectedStyle(style);
  };

  const handleAvoidToggle = (item) => {
    setAvoidList(prev => 
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const handleSubmit = () => {
    if (selectedStyle) {
      onComplete({ style: selectedStyle, avoid: avoidList });
    }
  };

  return (
    <div className={`fixed inset-x-0 top-1/4 bottom-1/4 flex items-center justify-center z-50 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="bg-white bg-opacity-10 backdrop-blur-md p-6 rounded-lg w-full max-w-4xl shadow-lg transition-all duration-500 transform ${isVisible ? 'scale-100' : 'scale-95'}">
        <h2 className="text-xl font-bold mb-3 text-white">Welcome! Let's personalize your experience</h2>
        
        <h3 className="text-lg font-semibold mb-2 text-white">Select a style you prefer:</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          {styles.map((style) => (
            <div 
              key={style.name} 
              className={`relative aspect-square w-fit cursor-pointer rounded-lg overflow-hidden ${selectedStyle === style.name ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => handleStyleSelect(style.name)}
            >
              <Image src={style.image} alt={style.name} width={150} height={150} className="object-cover" />
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-1 text-sm">
                {style.name}
              </div>
            </div>
          ))}
        </div>

        <h3 className="text-lg font-semibold mb-2 text-white">Select things you want to avoid:</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {avoidOptions.map((option) => (
            <div 
              key={option.name} 
              className={`relative cursor-pointer aspect-square w-fit rounded-lg overflow-hidden ${avoidList.includes(option.name) ? 'ring-2 ring-red-500' : ''}`}
              onClick={() => handleAvoidToggle(option.name)}
            >
              <Image src={option.image} alt={option.name} width={150} height={150} className="object-cover" />
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-1 text-sm">
                {option.name}
              </div>
            </div>
          ))}
        </div>

        <button 
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-colors duration-300"
          onClick={handleSubmit}
          disabled={!selectedStyle}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default WelcomeScreen;