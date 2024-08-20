"use client"
import { useState, useEffect, useRef } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import axios from 'axios';
import * as THREE from 'three';
import FileUpload from '@/components/FileUpload';
import YouTube from 'react-youtube';

const ImageSphere = ({ textureUrl }) => {
  const texture = useLoader(THREE.TextureLoader, textureUrl);

  return (
    <mesh>
      <sphereGeometry args={[500, 60, 40]} />
      <meshBasicMaterial side={THREE.BackSide} map={texture} />
    </mesh>
  );
};

const Home = () => {
  const [chapterDescriptions, setChapterDescriptions] = useState([]);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [images, setImages] = useState([]);
  const [youtubeIds, setYoutubeIds] = useState([]);
  const [viewMode, setViewMode] = useState('Menu');
  const [customText, setCustomText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(50);
  const videoRef = useRef(null);
  const defaultImage = '/default.png'; // Path to the default 360 image

  useEffect(() => {
    if (viewMode === 'Story' && chapterDescriptions.length > 0) {
      loadAllImages();
    }
  }, [chapterDescriptions, viewMode]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.internalPlayer.setVolume(volume);
    }
  }, [volume]);

  useEffect(() => {
    if (youtubeIds.length > 0 && youtubeIds[currentChapter] && videoRef.current) {
      videoRef.current.internalPlayer.loadVideoById(youtubeIds[currentChapter]);
    }
  }, [currentChapter, youtubeIds]);

  const loadAllImages = async () => {
    setIsLoading(true);
    const loadedImages = [];
    const loadedYoutubeIds = [];
    for (let i = 0; i < chapterDescriptions.length; i++) {
      const prompt = chapterDescriptions[i];
      const response = await axios.post('/api/prediction', { prompt });
      loadedImages.push(response.data.image);
      loadedYoutubeIds.push(response.data.id || null);
    }
    setImages(loadedImages);
    setYoutubeIds(loadedYoutubeIds);
    setIsLoading(false);
  };

  const handlePreviousChapter = () => {
    setCurrentChapter((prev) => (prev > 0 ? prev - 1 : chapterDescriptions.length - 1));
  };

  const handleNextChapter = () => {
    setCurrentChapter((prev) => (prev < chapterDescriptions.length - 1 ? prev + 1 : 0));
  };

  const handleCustomTextChange = (e) => {
    setCustomText(e.target.value);
  };

  const handleGenerateCustomImage = async () => {
    setIsLoading(true);
    const response = await axios.post('/api/prediction', { prompt: customText });
    console.log(response);
    setImages([response.data.image[0]]);
    setYoutubeIds([response.data.id || null]);
    setIsLoading(false);
  };

  const renderMenu = () => (
    <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-md shadow-lg">
      <button
        onClick={() => setViewMode('Story')}
        className="py-2 px-4 rounded-lg m-1 bg-white bg-opacity-20 hover:bg-opacity-30"
      >
        Story
      </button>
      <button
        onClick={() => setViewMode('Custom')}
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
        onClick={() => setViewMode('Menu')}
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
        onClick={() => setViewMode('Menu')}
        className="m-1 py-2 px-4 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30"
      >
        Go Back
      </button>
    </div>
  );

  return (
    <div className="h-screen w-screen relative">
      <Canvas>
        <OrbitControls />
        <ImageSphere textureUrl={images[currentChapter] || defaultImage} />
      </Canvas>
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
      <div className="absolute top-4 right-4 bg-white bg-opacity-10 p-4 rounded-lg backdrop-blur-md shadow-lg">
        <label htmlFor="volume" className="text-white">
          Volume
        </label>
        <input
          id="volume"
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={(e) => setVolume(e.target.value)}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default Home;