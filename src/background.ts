chrome.runtime.onMessage.addListener((request, sender) => {});

// A type guard function to check if the caught object is an Error
function isError(e: unknown): e is Error {
  return e instanceof Error;
}

function getTabURL(
  callback: (
    urlDetails: { fullURL: string; domain: string; relativeURL: string } | null
  ) => void
) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0 && tabs[0].url) {
      const fullURL = tabs[0].url;
      const urlObj = new URL(fullURL);
      const domain = urlObj.hostname;
      const relativeURL = urlObj.pathname + urlObj.search;
      callback({ fullURL, domain, relativeURL });
    } else {
      console.error("No active tab with accessible URL found.");
      callback(null);
    }
  });
}

// take screenshot event
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "takeScreenshot") {
    // Check if the current tab has a valid ID
    if (!sender.tab?.id) {
      console.error("No valid tab ID found for taking screenshot.");
      sendResponse({ success: false, error: "No valid tab ID." });
      return true;
    }

    // Take a screenshot of the current tab
    chrome.tabs.captureVisibleTab(
      sender.tab.windowId,
      { format: "png" },
      (dataUrl) => {
        if (chrome.runtime.lastError) {
          console.error(
            "Error taking screenshot:",
            chrome.runtime.lastError.message
          );
          sendResponse({
            success: false,
            error: chrome.runtime.lastError.message,
          });
        } else {
          // Extract the base64 part of the data URL
          const base64Index = dataUrl.indexOf(",") + 1;
          const base64Data = dataUrl.substring(base64Index);

          sendResponse({ success: true, imageBase64: base64Data });
        }
      }
    );
  }

  // Keep the messaging channel open for the asynchronous response
  return true;
});

// send feedback event
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "sendFeedback") {
    const { feedback, imageBinary, email, userAgent } = request.data;

    // You'll need to convert the screenshot data URL to a Blob if you're sending as FormData
    // For simplicity, we're sending the data URL directly as a string in this example

    // Get the current tab URL details
    getTabURL((urlDetails) => {
      if (!urlDetails) {
        sendResponse({ success: false });
        return true; // asynchronous response
      }

      const { domain, relativeURL } = urlDetails;

      // Prepare the data to send, including the URL details and email
      const feedbakData = {
        email: email,
        feedback: feedback,
        userAgent: userAgent,
        screenshot: imageBinary,
        domain: domain,
        relativeUrl: relativeURL,
      };

      // Now send the data to Zapier
      fetch("https://hooks.zapier.com/hooks/catch/14134904/3pqoek3/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(feedbakData),
      })
        .then((response) => response.json())
        .then((data) =>
          sendResponse({
            success: true,
            responseData: data,
            requestData: feedbakData,
          })
        )
        .catch((error) =>
          sendResponse({ success: false, error: error.toString() })
        );

      return true; // asynchronous response
    });
  }
});
