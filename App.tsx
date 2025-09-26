
import React from 'react';
import VideoGenerator from './components/VideoGenerator';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 font-sans">
      <header className="w-full max-w-4xl text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          VEO-2 Video Generator
        </h1>
        <p className="text-gray-400 mt-2">
          Bring your ideas to life. Generate stunning videos from text and images.
        </p>
      </header>
      <main className="w-full max-w-4xl">
        <VideoGenerator />
      </main>
       <footer className="w-full max-w-4xl text-center mt-8 text-gray-500 text-sm">
        <p>Powered by Google's VEO Model</p>
      </footer>
    </div>
  );
};

export default App;