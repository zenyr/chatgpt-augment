type Details = {
  documentId: string; //  "7AD74...
  documentLifecycle: string; //  "activ...
  frameId: number; // 0;
  frameType: string; //  "outer...
  fromCache: false;
  initiator: string; //  "https...
  ip: string; //  "104.1...
  method: string; //  "GET";...
  parentFrameId: number; //-1;
  requestId: string; //  "6703"...
  statusCode: number; // 200;
  statusLine: string; //  "HTTP/...
  tabId: number; // 1033803684;
  timeStamp: number; // 1686881111010.292;
  type: string; //  "scrip...
  url: string; //  "https...
  requestHeaders?: { name: string; value: string }[];
};

let auth = "";
// @ts-ignore
chrome.webRequest.onBeforeSendHeaders.addListener(
  (details: Details) => {
    const foundAuth = details.requestHeaders?.find(
      ({ name }) => name.toLowerCase() === "authorization"
    );
    if (foundAuth) {
      auth = foundAuth.value;
    }

    console.log("REQ headers!", {
      url: details.url,
      headers: details.requestHeaders,
    });
  },
  { types: ["xmlhttprequest"], urls: ["https://chat.openai.com/*"] },

  ["requestHeaders", "extraHeaders"]
);
