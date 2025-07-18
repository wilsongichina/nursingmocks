"use client";

import Image from "next/image";
import { useState } from "react";

interface FirebaseImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  fallbackSrc?: string;
}

export default function FirebaseImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className = "",
  priority = false,
  fallbackSrc = "/placeholder-image.svg",
}: FirebaseImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError && imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
      setHasError(true);
    }
  };

  const imageProps = {
    src: imgSrc,
    alt: alt || "Image",
    className,
    priority,
    onError: handleError,
    ...(fill ? { fill } : { width, height }),
  };

  return <Image {...imageProps} />; // eslint-disable-line jsx-a11y/alt-text
}
