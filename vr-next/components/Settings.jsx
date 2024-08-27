import React, { useState } from 'react';
import SettingsModal from './SettingsModal';

const Settings = ({ volume, setVolume, userPreferences, setUserPreferences, improvePrompt, setImprovePrompt }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const playClickSound = () => {
    const audio = new Audio('/sounds/click.ogg');
    audio.play();
  };

  return (
    <>
      <button
        onClick={() => {
          setIsModalOpen(true);
          playClickSound();
        }}
        className="absolute top-4 right-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white py-2 px-4 rounded-lg"
      >
        Settings
      </button>
      <SettingsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        volume={volume}
        setVolume={setVolume}
        userPreferences={userPreferences}
        setUserPreferences={setUserPreferences}
        improvePrompt={improvePrompt}
        setImprovePrompt={setImprovePrompt}
      />
    </>
  );
};

export default Settings;