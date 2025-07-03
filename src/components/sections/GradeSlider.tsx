"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const gradeImages = [
  { src: "/grade/Take My Teas Exam Result 90.jpg", alt: "TEAS Exam Result 90" },
  {
    src: "/grade/Take My Teas Exam Result - 90.jpg",
    alt: "TEAS Exam Result 90",
  },
  { src: "/grade/Take My Teas Exam Result 89.jpg", alt: "TEAS Exam Result 89" },
  {
    src: "/grade/Take My Teas Exam for Me - 96.png",
    alt: "TEAS Exam Result 96",
  },
  { src: "/grade/Take My Teas Exam Result 86.jpg", alt: "TEAS Exam Result 86" },
  { src: "/grade/Take My Teas Exam for Me 90.png", alt: "TEAS Exam Result 90" },
  { src: "/grade/Take My Teas Exam Result 87.jpg", alt: "TEAS Exam Result 87" },
  { src: "/grade/Take My Teas Exam Result 85.jpg", alt: "TEAS Exam Result 85" },
];

export default function GradeSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-advance slider
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === gradeImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000); // Change slide every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? gradeImages.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === gradeImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="relative max-w-4xl mx-auto">
      {/* Main Slider */}
      <div className="relative overflow-hidden rounded-2xl shadow-2xl">
        <div className="relative h-96 md:h-[500px]">
          {gradeImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
                index === currentIndex ? "opacity-100" : "opacity-0"
              }`}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-contain bg-white"
                priority={index === currentIndex}
              />
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 p-2 rounded-full shadow-lg transition-all duration-200 z-10"
          aria-label="Previous slide"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 p-2 rounded-full shadow-lg transition-all duration-200 z-10"
          aria-label="Next slide"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        {/* Slide Counter */}
        <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
          {currentIndex + 1} / {gradeImages.length}
        </div>
      </div>

      {/* Dots Navigation */}
      <div className="flex justify-center mt-6 space-x-2">
        {gradeImages.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-200 ${
              index === currentIndex
                ? "bg-blue-600 scale-125"
                : "bg-gray-300 hover:bg-gray-400"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Thumbnail Navigation */}
      <div className="mt-8">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {gradeImages.map((image, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`flex-shrink-0 relative w-20 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                index === currentIndex
                  ? "border-blue-600 scale-105"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              aria-label={`View ${image.alt}`}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
