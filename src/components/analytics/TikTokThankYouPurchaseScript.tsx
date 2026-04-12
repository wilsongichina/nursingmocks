"use client";

import Script from "next/script";

const purchaseScript = `
const eventId = 'purchase_' + Date.now();

ttq.track('Purchase', {
  contents: [
    {
      content_id: 'teas_7_bundle',
      content_name: 'ATI TEAS 7 Practice Sets'
    }
  ],
  value: 99,
  currency: 'USD'
}, {
  event_id: eventId
});
`;

export function TikTokThankYouPurchaseScript() {
  return (
    <Script
      id="tiktok-thank-you-purchase"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{ __html: purchaseScript }}
    />
  );
}
