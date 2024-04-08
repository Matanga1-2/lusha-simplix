export function sendFeedbackData(
  feedback: string,
  callback: (success: boolean) => void
) {
  // Retrieve the saved email from storage
  chrome.storage.local.get("email", (result) => {
    if (chrome.runtime.lastError) {
      console.error(
        "Error retrieving the email from storage:",
        chrome.runtime.lastError.message
      );
      callback(false); // Indicate failure through the callback
      return;
    }

    const userAgent = navigator.userAgent; // Get the user agent from the navigator object

    // Prepare the data to send
    const data = {
      email: result.email,
      feedback: feedback,
      userAgent: userAgent,
    };

    // Send the data to your background script
    chrome.runtime.sendMessage(
      {
        action: "sendFeedback",
        data: data,
      },
      (response) => {
        if (chrome.runtime.lastError) {
          // Handle message sending error
          console.error(
            "Error sending message:",
            chrome.runtime.lastError.message
          );
          callback(false); // Indicate failure through the callback
        } else {
          // Process the response here
          console.log("Feedback response:", response);
          callback(true); // Indicate success through the callback
        }
      }
    );
  });
}
