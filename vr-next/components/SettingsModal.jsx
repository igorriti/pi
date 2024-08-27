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

const SettingsModal = ({ isOpen, onClose, volume, setVolume, userPreferences, setUserPreferences, improvePrompt, setImprovePrompt }) => {
  const [activeTab, setActiveTab] = useState('volume');
  const [selectedStyle, setSelectedStyle] = useState(userPreferences?.style || '');
  const [avoidList, setAvoidList] = useState(userPreferences?.avoid || []);
  const [openAIKey, setOpenAIKey] = useState(process.env.OPENAI_API_KEY || '');
  const [replicateKey, setReplicateKey] = useState(process.env.REPLICATE_AUTH || '');
  const [showOpenAIKey, setShowOpenAIKey] = useState(false);
  const [showReplicateKey, setShowReplicateKey] = useState(false);

  useEffect(() => {
    setSelectedStyle(userPreferences?.style || '');
    setAvoidList(userPreferences?.avoid || []);
  }, [userPreferences]);

  const playClickSound = () => {
    const audio = new Audio('/sounds/click.ogg');
    audio.play();
  };

  const handleStyleSelect = (style) => {
    playClickSound();
    setSelectedStyle(style);
  };

  const handleAvoidToggle = (item) => {
    playClickSound();
    setAvoidList(prev => 
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const handleSave = () => {
    playClickSound();
    setUserPreferences({ style: selectedStyle, avoid: avoidList });
    // Here you would also save the API keys to your backend or environment
    onClose();
  };

  const maskKey = (key) => {
    return key.substring(0, 5) + '*'.repeat(key.length - 5);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white bg-opacity-10 backdrop-blur-md p-6 rounded-lg w-full max-w-4xl shadow-lg">
        <div className="flex h-[500px]">
          <div className="w-1/4 pr-4 border-r border-white border-opacity-20">
            <button
              className={`w-full text-left py-2 px-4 rounded-lg mb-2 ${activeTab === 'volume' ? 'bg-white bg-opacity-20' : ''}`}
              onClick={() => setActiveTab('volume')}
            >
              Volume
            </button>
            <button
              className={`w-full text-left py-2 px-4 rounded-lg mb-2 ${activeTab === 'preferences' ? 'bg-white bg-opacity-20' : ''}`}
              onClick={() => setActiveTab('preferences')}
            >
              Preferences
            </button>
            <button
              className={`w-full text-left py-2 px-4 rounded-lg mb-2 ${activeTab === 'improvePrompt' ? 'bg-white bg-opacity-20' : ''}`}
              onClick={() => setActiveTab('improvePrompt')}
            >
              Improve Prompt
            </button>
            <button
              className={`w-full text-left py-2 px-4 rounded-lg mb-2 ${activeTab === 'apiKeys' ? 'bg-white bg-opacity-20' : ''}`}
              onClick={() => setActiveTab('apiKeys')}
            >
              API Keys
            </button>
          </div>
          <div className="w-3/4 pl-4 overflow-y-auto">
            {activeTab === 'volume' && (
              <div className="h-full flex flex-col justify-center">
                <h3 className="text-xl font-semibold mb-4 text-white">Volume</h3>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(e.target.value)}
                  className="w-full"
                />
              </div>
            )}
            {activeTab === 'preferences' && (
              <div>
                <h3 className="text-xl font-semibold mb-4 text-white">Preferences</h3>
                <h4 className="text-lg font-semibold mb-2 text-white">Select a style you prefer:</h4>
                <div className="grid grid-cols-4 gap-4 mb-4">
                  {styles.map((style) => (
                    <div 
                      key={style.name} 
                      className={`relative cursor-pointer aspect-square w-fit rounded-lg overflow-hidden ${selectedStyle === style.name ? 'ring-2 ring-blue-500' : ''}`}
                      onClick={() => handleStyleSelect(style.name)}
                    >
                      <Image src={style.image} alt={style.name} width={100} height={100} className="object-cover" />
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-1 text-sm">
                        {style.name}
                      </div>
                    </div>
                  ))}
                </div>
                <h4 className="text-lg font-semibold mb-2 text-white">Select things you want to avoid:</h4>
                <div className="grid grid-cols-4 gap-4 mb-4">
                  {avoidOptions.map((option) => (
                    <div 
                      key={option.name} 
                      className={`relative cursor-pointer aspect-square w-fit rounded-lg overflow-hidden ${avoidList.includes(option.name) ? 'ring-2 ring-red-500' : ''}`}
                      onClick={() => handleAvoidToggle(option.name)}
                    >
                      <Image src={option.image} alt={option.name} width={100} height={100} className="object-cover" />
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-1 text-sm">
                        {option.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activeTab === 'improvePrompt' && (
              <div className="h-full flex flex-col justify-center">
                <h3 className="text-xl font-semibold mb-4 text-white">Improve Prompt</h3>
                <div className="flex items-center mb-4">
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input 
                      type="checkbox" 
                      name="toggle" 
                      id="improvePrompt" 
                      className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                      checked={improvePrompt}
                      onChange={(e) => setImprovePrompt(e.target.checked)}
                    />
                    <label 
                      htmlFor="improvePrompt" 
                      className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
                    ></label>
                  </div>
                  <label htmlFor="improvePrompt" className="text-white">
                    Improve Custom Prompts
                  </label>
                </div>
                <p className="text-white text-sm">
                  When enabled, this option uses AI to enhance your custom prompts based on your preferences, potentially improving the generated images.
                </p>
              </div>
            )}
            {activeTab === 'apiKeys' && (
              <div>
                <h3 className="text-xl font-semibold mb-4 text-white">API Keys</h3>
                <div className="mb-4">
                  <label htmlFor="openAIKey" className="block text-white mb-2">OpenAI API Key</label>
                  <div className="flex items-center">
                    <input
                      type={showOpenAIKey ? "text" : "password"}
                      id="openAIKey"
                      value={openAIKey}
                      onChange={(e) => setOpenAIKey(e.target.value)}
                      className="flex-grow bg-white bg-opacity-20 text-white p-2 rounded-lg"
                      placeholder="Enter OpenAI API Key"
                    />
                    <button
                      onClick={() => setShowOpenAIKey(!showOpenAIKey)}
                      className="ml-2 p-2 bg-white bg-opacity-20 rounded-lg"
                    >
                      {showOpenAIKey ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>
                <div className="mb-4">
                  <label htmlFor="replicateKey" className="block text-white mb-2">Replicate API Key</label>
                  <div className="flex items-center">
                    <input
                      type={showReplicateKey ? "text" : "password"}
                      id="replicateKey"
                      value={replicateKey}
                      onChange={(e) => setReplicateKey(e.target.value)}
                      className="flex-grow bg-white bg-opacity-20 text-white p-2 rounded-lg"
                      placeholder="Enter Replicate API Key"
                    />
                    <button
                      onClick={() => setShowReplicateKey(!showReplicateKey)}
                      className="ml-2 p-2 bg-white bg-opacity-20 rounded-lg"
                    >
                      {showReplicateKey ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            className="bg-red-500 text-white px-4 py-2 rounded-lg mr-2"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-lg"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;