"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { shouldSkipChatForPublicPath } from "@/lib/public-route-performance";

const TawkToChat = () => {
  const pathname = usePathname();
  const { currentUser } = useAuth();

  useEffect(() => {
    const removeTawk = () => {
      document
        .querySelectorAll(
          'script[src*="embed.tawk.to"], iframe[src*="tawk.to"], #tawk-bubble-container, #tawkchat-container, #tawkchat-minified-container, style[data-nursingmocks-tawk-style="true"]'
        )
        .forEach((element) => element.remove());
    };

    if (currentUser) {
      removeTawk();
      return;
    }

    if (shouldSkipChatForPublicPath(pathname)) {
      removeTawk();
      return;
    }

    removeTawk();
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.async = true;
    script.src = "https://embed.tawk.to/69da63faa5ae3e1c3b562ef3/1jluhd3ht";
    script.charset = "UTF-8";
    script.setAttribute("crossorigin", "*");
    document.body.appendChild(script);

    const style = document.createElement("style");
    style.setAttribute("data-nursingmocks-tawk-style", "true");
    style.innerHTML = `
      #tawk-bubble-container {
        bottom: 0 !important;
        right: 0 !important;
        left: auto !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      script.remove();
      style.remove();
    };
  }, [currentUser, pathname]);

  return null;
};

export default TawkToChat;
