"use client"
import { useState, useEffect, useRef } from 'react';
import { Canvas, useLoader, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import axios from 'axios';
import YouTube from 'react-youtube';
import FileUpload from '@/components/FileUpload';
import WelcomeScreen from '@/components/WelcomeScreen';
import Settings from '@/components/Settings';
import StartMenu from '@/components/StartMenu';
import gsap from 'gsap';


const ImageSphere = ({ textureUrl, visible }) => {
  const [opacity, setOpacity] = useState(0);
  const texture = useLoader(THREE.TextureLoader, textureUrl);
  const materialRef = useRef();

  useEffect(() => {
    if (visible) {
      gsap.to(materialRef.current, {
        opacity: 1,
        duration: 7,
        ease: "power2.inOut"
      });
    }
  }, [visible]);

  return (
    <mesh visible={visible}>
      <sphereGeometry args={[500, 60, 40]} />
      <meshBasicMaterial ref={materialRef} side={THREE.BackSide} map={texture} transparent opacity={opacity} />
    </mesh>
  );
};

const Home = () => {
  const [showStartMenu, setShowStartMenu] = useState(true);
  const [sphereVisible, setSphereVisible] = useState(false);
  const [particlesVisible, setParticlesVisible] = useState(true);
  const [chapterDescriptions, setChapterDescriptions] = useState([]);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [images, setImages] = useState([]);
  const [youtubeIds, setYoutubeIds] = useState([]);
  const [viewMode, setViewMode] = useState('Menu');
  const [customText, setCustomText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(50);
  const [showWelcome, setShowWelcome] = useState(true);
  const [userPreferences, setUserPreferences] = useState(null);
  const [improvePrompt, setImprovePrompt] = useState(true);
  const videoRef = useRef(null);
  const defaultImage = '/default.png';

  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisited');
    if (hasVisited) {
      setShowWelcome(false);
      setUserPreferences(JSON.parse(localStorage.getItem('userPreferences')));
    }
  }, []);

  const handleStart = () => {
    const hasVisited = localStorage.getItem('hasVisited');

    const audio = new Audio('/sounds/welcome1.mp3');
    audio.play();
    setShowStartMenu(false);
    if (hasVisited) {
      setSphereVisible(true);
    } else {
      setShowWelcome(true);
    }
  };

  const handleParticleTransitionComplete = () => {

  };

  const handleWelcomeComplete = (preferences) => {
    setUserPreferences(preferences);
    setShowWelcome(false);
    setSphereVisible(true);
    localStorage.setItem('hasVisited', 'true');
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
  };

  const playClickSound = () => {
    const audio = new Audio('/sounds/click.ogg');
    audio.play();
  };

  const handlePreviousChapter = () => {
    playClickSound();
    setCurrentChapter((prev) => (prev > 0 ? prev - 1 : chapterDescriptions.length - 1));
  };

  const handleNextChapter = () => {
    playClickSound();
    setCurrentChapter((prev) => (prev < chapterDescriptions.length - 1 ? prev + 1 : 0));
  };

  const handleCustomTextChange = (e) => {
    setCustomText(e.target.value);
  };

  const handleGenerateCustomImage = async () => {
    playClickSound();
    setIsLoading(true);
    const response = await axios.post('/api/prediction', { 
      prompt: customText,
      userPreferences,
      improvePrompt
    });
    setImages([response.data.image[0]]);
    setYoutubeIds([response.data.id || null]);
    setIsLoading(false);
  };

  const renderMenu = () => (
    <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-md shadow-lg">
      <button
        onClick={() => {
          setViewMode('Story');
          playClickSound();
        }}
        className="py-2 px-4 rounded-lg m-1 bg-white bg-opacity-20 hover:bg-opacity-30"
      >
        Story
      </button>
      <button
        onClick={() => {
          setViewMode('Custom');
          playClickSound();
        }}
        className="py-2 px-4 rounded-lg m-1 bg-white bg-opacity-20 hover:bg-opacity-30"
      >
        Custom
      </button>
    </div>
  );

  const renderStory = () => (
    <div>
      <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-md shadow-lg">
        <FileUpload setChapterDescriptions={setChapterDescriptions} />
      </div>
      {Array.isArray(chapterDescriptions) && chapterDescriptions.length > 0 && (
        <div className="mt-4 bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-md shadow-lg flex items-center">
          <button
            onClick={handlePreviousChapter}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white py-2 px-4 rounded-lg m-1"
          >
            &larr;
          </button>
          <span className="text-white mx-4">Chapter {currentChapter + 1}</span>
          <button
            onClick={handleNextChapter}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white py-2 px-4 rounded-lg m-1"
          >
            &rarr;
          </button>
        </div>
      )}
      <button
        onClick={() => {
          setViewMode('Menu');
          playClickSound();
        }}
        className="py-2 px-4 rounded-lg m-1 bg-white bg-opacity-20 hover:bg-opacity-30"
      >
        Go Back
      </button>
    </div>
  );

  const renderCustom = () => (
    <div>
      <div className="w-80 mt-4 bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-md shadow-lg flex flex-col items-start">
        <textarea
          value={customText}
          onChange={handleCustomTextChange}
          className="w-full p-2 mb-2 bg-white bg-opacity-20 text-white rounded-lg"
          placeholder="Enter your custom text here"
        />
        <button
          onClick={handleGenerateCustomImage}
          className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white py-2 px-4 rounded-lg mb-2"
        >
          Generate Image
        </button>
      </div>
      <button
        onClick={() => {
          setViewMode('Menu');
          playClickSound();
        }}
        className="m-1 py-2 px-4 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30"
      >
        Go Back
      </button>
    </div>
  );

  return (
    <div className="h-screen w-screen relative">
      <Canvas>
        <PerspectiveCamera makeDefault fov={75} position={[0, 0, 5]} />
        <OrbitControls
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI * 5 / 6.5}
          enableDamping
          dampingFactor={0.05}
          rotateSpeed={0.5}
        />
        {!showStartMenu && <ImageSphere textureUrl={images[currentChapter] || defaultImage} visible={sphereVisible} />}
      </Canvas>
      {showStartMenu && <StartMenu onStart={handleStart} />}
      {showWelcome && (
        <WelcomeScreen
          onComplete={handleWelcomeComplete}
          initialPreferences={userPreferences}
        />
      )}
      {!showStartMenu && !showWelcome && (
        <>
          <div className="absolute top-0 left-0 p-4">
            {viewMode === 'Menu' && renderMenu()}
            {viewMode === 'Story' && renderStory()}
            {viewMode === 'Custom' && renderCustom()}
          </div>
          {isLoading && (
            <div className="absolute top-0 left-0 h-full w-full flex items-center justify-center bg-black bg-opacity-50">
              <div className="text-white text-2xl">Loading...</div>
            </div>
          )}
          {youtubeIds[currentChapter] && (
            <YouTube
              videoId={youtubeIds[currentChapter]}
              ref={videoRef}
              opts={{
                height: '0',
                width: '0',
                playerVars: {
                  autoplay: 1,
                  controls: 0,
                },
              }}
            />
          )}
          <Settings
            volume={volume}
            setVolume={setVolume}
            userPreferences={userPreferences}
            setUserPreferences={setUserPreferences}
            improvePrompt={improvePrompt}
            setImprovePrompt={setImprovePrompt}
          />
        </>
      )}
    </div>
  );
};

export default Home;