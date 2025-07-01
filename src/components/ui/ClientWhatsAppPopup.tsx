"use client";

import { useEffect, useState } from "react";
import WhatsAppPopup from "./WhatsAppPopup";

export default function ClientWhatsAppPopup() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return <WhatsAppPopup />;
}
