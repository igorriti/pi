'use client';

import { useState, useEffect } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import axios from 'axios';
import * as THREE from 'three';
import FileUpload from '@/components/FileUpload';

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
  const [viewMode, setViewMode] = useState('Menu');
  const [customText, setCustomText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const defaultImage = '/default.png'; // Path to the default 360 image

  useEffect(() => {
    if (viewMode === 'Story' && chapterDescriptions.length > 0) {
      loadImage(currentChapter);
      loadImage(currentChapter + 1); // Preload next chapter
    }
  }, [chapterDescriptions, currentChapter, viewMode]);

  const loadImage = async (chapter) => {
    if (chapter < chapterDescriptions.length && !images[chapter]) {
      setIsLoading(true);
      const prompt = viewMode === 'Story' ? chapterDescriptions[chapter] : customText;
      const response = await axios.post('/api/prediction', { prompt });
      setImages((prev) => {
        const newImages = [...prev];
        newImages[chapter] = response.data[0];
        return newImages;
      });
      setIsLoading(false);
    }
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
    setImages([response.data[0]]);
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
    </div>
  );
};

export default Home;
