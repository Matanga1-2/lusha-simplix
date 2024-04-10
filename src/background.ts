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

function base64ToBlob(base64: string, contentType = "", sliceSize = 512) {
  const byteCharacters = atob(base64);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);
    const byteNumbers = new Array(slice.length);

    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  const blob = new Blob(byteArrays, { type: contentType });
  return blob;
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

          sendResponse({ success: true, screenshotUrl: base64Data });
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
    const { feedback, screenshotUrl, email, userAgent } = request.data;

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
        screenshot: screenshotUrl,
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

/// Upload to drive event
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "uploadToDrive") {
    const imageDataBase64 = request.imageData; // Get the base64 part
    const blob = base64ToBlob(imageDataBase64, "image/png");
    sendResponse({ success: true, driveFileLink: "", imageData: blob });
    // Call the function to upload this blob to Google Drive
    uploadToGoogleDrive(blob)
      .then((driveFileLink) => {
        sendResponse({ success: true, driveFileLink, imageData: blob });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message, imageData: blob });
      });
  }

  return true; // Keep the messaging channel open for asynchronous response
});

async function uploadToGoogleDrive(blob: Blob): Promise<string> {
  // Implement the upload logic here
  // You would typically make an API call to Google Drive's API
  // with appropriate headers, method, and body using fetch or another HTTP client.
  // Then you would extract the link to the uploaded file from the response
  // and return that link.

  // This is a placeholder return statement, you will replace this with actual implementation
  return "The link to the uploaded file on Google Drive";
}
