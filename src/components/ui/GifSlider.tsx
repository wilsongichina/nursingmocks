"use client";

import { useState, useEffect } from "react";

const gifs = [
  { id: 1, src: "/gifs/1.gif", alt: "TEAS Exam Preparation GIF 1" },
  { id: 2, src: "/gifs/3.gif", alt: "TEAS Exam Preparation GIF 2" },
  { id: 3, src: "/gifs/4.gif", alt: "TEAS Exam Preparation GIF 3" },
  { id: 4, src: "/gifs/5.gif", alt: "TEAS Exam Preparation GIF 4" },
];

export default function GifSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % gifs.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + gifs.length) % gifs.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % gifs.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            See Our TEAS Preparation in Action
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Watch how our comprehensive TEAS 7 exam materials help students
            succeed
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Main GIF Display */}
          <div className="relative overflow-hidden rounded-2xl shadow-2xl bg-white">
            <div className="relative w-full h-96 md:h-[500px] lg:h-[600px] bg-gray-100 flex items-center justify-center">
              <img
                src={gifs[currentIndex].src}
                alt={gifs[currentIndex].alt}
                className="max-w-full max-h-full object-contain"
              />
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={goToPrevious}
              aria-label="Previous GIF"
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110"
            >
              <svg
                className="w-6 h-6 text-gray-700"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            <button
              onClick={goToNext}
              aria-label="Next GIF"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110"
            >
              <svg
                className="w-6 h-6 text-gray-700"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-1000 ease-linear"
                style={{
                  width: `${((currentIndex + 1) / gifs.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Thumbnail Navigation */}
          <div className="mt-8 flex justify-center space-x-4">
            {gifs.map((gif, index) => (
              <button
                key={gif.id}
                onClick={() => goToSlide(index)}
                className={`relative overflow-hidden rounded-lg transition-all duration-300 ${
                  index === currentIndex
                    ? "ring-4 ring-blue-500 ring-offset-2 scale-110"
                    : "hover:scale-105"
                }`}
              >
                <div className="w-24 h-20 md:w-32 md:h-24 relative overflow-hidden rounded-lg">
                  <img
                    src={gif.src}
                    alt={gif.alt}
                    className="w-full h-full object-cover"
                  />
                  {index === currentIndex && (
                    <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Auto-play Toggle */}
          <div className="mt-4 text-center">
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                isAutoPlaying
                  ? "bg-green-100 text-green-800 hover:bg-green-200"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              <svg
                className={`w-4 h-4 mr-2 ${
                  isAutoPlaying ? "animate-spin" : ""
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                {isAutoPlaying ? (
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                ) : (
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clipRule="evenodd"
                  />
                )}
              </svg>
              {isAutoPlaying ? "Auto-playing" : "Paused"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
