'use client';

import React, { useState } from 'react';
import axios from 'axios';

const FileUpload = ({ setChapterDescriptions }) => {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleFileUpload = async () => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post('/api/pdf', formData);
    console.log(response.data);
    //Parse the string into an array of chapter descriptions

    setChapterDescriptions(response.data);
  };

  return (
    <div>
      <input
        type="file"
        onChange={handleFileChange}
        className="block mb-2 text-white"
      />
      <button
        onClick={handleFileUpload}
        className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white py-2 px-4 rounded-lg"
      >
        Upload PDF
      </button>
    </div>
  );
};

export default FileUpload;
