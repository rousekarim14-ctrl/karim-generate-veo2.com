
import React, { useState, useEffect, useRef } from 'react';
import { generateVideo } from '../services/geminiService';
import Spinner from './Spinner';
import { UploadIcon } from './Icons';

const LOADING_MESSAGES = [
  "Warming up the video generation engine...",
  "Analyzing your creative prompt...",
  "Storyboarding the main scenes...",
  "This can take a few minutes. Great art takes time!",
  "Rendering the initial frames...",
  "Adding special effects and lighting...",
  "Finalizing the video stream...",
  "Almost there! Preparing your video for viewing."
];

const VideoGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>(LOADING_MESSAGES[0]);

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // FIX: Replaced NodeJS.Timeout with browser-compatible interval handling.
    // This refactoring also prevents calling clearInterval with an undefined value.
    if (isLoading) {
      let messageIndex = 0;
      const interval = setInterval(() => {
        messageIndex = (messageIndex + 1) % LOADING_MESSAGES.length;
        setLoadingMessage(LOADING_MESSAGES[messageIndex]);
      }, 10000); // Change message every 10 seconds
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  useEffect(() => {
    if (generatedVideoUrl && videoRef.current) {
      videoRef.current.load();
    }
  }, [generatedVideoUrl]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const fileToBase64 = (file: File): Promise<{mimeType: string, data: string}> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            const mimeType = result.split(',')[0].split(':')[1].split(';')[0];
            const data = result.split(',')[1];
            resolve({ mimeType, data });
        };
        reader.onerror = error => reject(error);
    });
  };

  const handleGenerate = async () => {
    if (!prompt) {
      setError('Please enter a prompt.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedVideoUrl(null);
    setLoadingMessage(LOADING_MESSAGES[0]);

    try {
      let imagePayload: { mimeType: string; data: string } | undefined;
      if (imageFile) {
        imagePayload = await fileToBase64(imageFile);
      }
      
      const videoUrl = await generateVideo(prompt, imagePayload);
      setGeneratedVideoUrl(videoUrl);

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred during video generation.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewGeneration = () => {
    setPrompt('');
    setImageFile(null);
    setImagePreview(null);
    setGeneratedVideoUrl(null);
    setError(null);
  };

  if (isLoading) {
    return (
      <div className="w-full bg-gray-800 rounded-lg p-8 flex flex-col items-center justify-center shadow-2xl h-96">
        <Spinner />
        <p className="mt-4 text-lg text-gray-300">{loadingMessage}</p>
        <p className="mt-2 text-sm text-gray-500">Video generation is in progress. Please wait.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-red-900/20 border border-red-500 rounded-lg p-8 flex flex-col items-center justify-center shadow-2xl">
        <p className="text-red-400 font-semibold">Generation Failed</p>
        <p className="mt-2 text-center text-gray-300">{error}</p>
        <button
          onClick={handleNewGeneration}
          className="mt-6 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (generatedVideoUrl) {
    return (
      <div className="w-full bg-gray-800 rounded-lg p-4 md:p-8 flex flex-col items-center justify-center shadow-2xl">
        <video ref={videoRef} controls autoPlay loop muted className="w-full max-w-2xl rounded-lg shadow-lg">
          <source src={generatedVideoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <button
          onClick={handleNewGeneration}
          className="mt-6 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
        >
          Create Another Video
        </button>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-800 rounded-lg p-4 md:p-8 shadow-2xl">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-2">
            1. Describe your video
          </label>
          <textarea
            id="prompt"
            rows={4}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A neon hologram of a cat driving a sports car at top speed"
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-300"
          />
        </div>
        <div className="w-full md:w-64">
          <label htmlFor="image-upload" className="block text-sm font-medium text-gray-300 mb-2">
            2. Add an image (optional)
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md h-full items-center text-center">
            <div className="space-y-1">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="mx-auto h-24 w-auto rounded-md object-cover" />
              ) : (
                <>
                  <UploadIcon className="mx-auto h-12 w-12 text-gray-500" />
                  <div className="flex text-sm text-gray-400">
                    <label htmlFor="image-upload" className="relative cursor-pointer bg-gray-800 rounded-md font-medium text-purple-400 hover:text-purple-500 focus-within:outline-none">
                      <span>Upload a file</span>
                      <input id="image-upload" name="image-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
                    </label>
                  </div>
                   <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6">
        <button
          onClick={handleGenerate}
          disabled={!prompt || isLoading}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75"
        >
          {isLoading ? 'Generating...' : 'Generate Video'}
        </button>
      </div>
    </div>
  );
};

export default VideoGenerator;