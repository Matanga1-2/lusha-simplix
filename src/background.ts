chrome.runtime.onMessage.addListener((request, sender) => {});

// A type guard function to check if the caught object is an Error
function isError(e: unknown): e is Error {
  return e instanceof Error;
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "sendFeedback") {
    const { email, feedback } = msg.data;
    try {
      // Perform the fetch operation
      fetch("https://hooks.zapier.com/hooks/catch/14134904/3pqoek3/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          feedback: feedback,
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
          // Optionally, send a response back to the content script
          sendResponse({ status: "success", data: data });
        })
        .catch((error) => {
          console.error("Failed to send feedback:", error);
          // Optionally, send a response back to the content script
          sendResponse({ status: "error", error: error.toString() });
        });
    } catch (error) {
      console.error("Error during fetch operation:");
      // If the caught object is an Error, log its message
      if (isError(error)) {
        console.error(error.message);
        // Optionally, send a response back to the content script
        sendResponse({ status: "error", error: error.message });
      } else {
        // If the caught object isn't an Error, stringify it as it could be of another type
        console.error(String(error));
        // Optionally, send a response back to the content script
        sendResponse({ status: "error", error: String(error) });
      }
    }
  }
  // Keep the messaging channel open for the asynchronous response
  return true;
});
