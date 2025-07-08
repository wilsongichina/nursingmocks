"use client";

import { useEffect } from "react";

const TawkToChat = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.async = true;
    script.src = "https://embed.tawk.to/66ed50184cbc4814f7dbe959/1i87g1oj8";
    script.charset = "UTF-8";
    script.setAttribute("crossorigin", "*");
    document.body.appendChild(script);

    const style = document.createElement("style");
    style.innerHTML = `
      #tawk-bubble-container {
        bottom: 0 !important;
        left: 0 !important;
        right: auto !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.body.removeChild(script);
      document.head.removeChild(style);
    };
  }, []);

  return null;
};

export default TawkToChat;
