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

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "sendFeedback") {
    // Extract email, feedback, and userAgent from the message
    const { email, feedback, userAgent } = msg.data;

    // Get the current tab URL details using getTabURL
    getTabURL((urlDetails) => {
      if (urlDetails) {
        const { domain, relativeURL } = urlDetails;

        // Perform the fetch operation with URL details
        fetch("https://hooks.zapier.com/hooks/catch/14134904/3pqoek3/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            feedback: feedback,
            userAgent: userAgent,
            domain: domain,
            relativeUrl: relativeURL,
          }),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error("Network response was not ok");
            }
            return response.json();
          })
          .then((data) => {
            console.log("Feedback sent successfully:", data);
            sendResponse({ success: true, data: data });
          })
          .catch((error) => {
            console.error("Failed to send feedback:", error);
            sendResponse({ success: false, error: error.toString() });
          });
      } else {
        // Handle the case where URL details could not be fetched
        console.error("Could not get URL details");
        sendResponse({ success: false, error: "Could not get URL details" });
      }
    });

    // Since we are performing asynchronous operations, return true to indicate to Chrome that `sendResponse` will be called asynchronously
    return true;
  }
});
