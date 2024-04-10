function getEmailFromStorage(callback: (email: string | null) => void) {
  chrome.storage.local.get("email", (result) => {
    if (chrome.runtime.lastError) {
      console.error(
        "Error retrieving the email from storage:",
        chrome.runtime.lastError.message
      );
      callback(null); // Pass null to indicate failure
    } else {
      callback(result.email); // Pass the retrieved email
    }
  });
}

export function sendFeedbackData(
  feedback: string,
  image: string, // Add a parameter for the image URL
  callback: (success: boolean) => void
) {
  // First, get the email from storage
  getEmailFromStorage((email) => {
    if (email === null) {
      callback(false); // Call the callback with false if email is not found
      return;
    }

    const userAgent = navigator.userAgent; // Get the user agent from the navigator object

    // Prepare the data to send, including the image URL
    const data = {
      email: email,
      feedback: feedback,
      userAgent: userAgent,
      screenshotUrl: image, // Include the image URL in the data
    };

    // Now send the data to your background script
    chrome.runtime.sendMessage(
      {
        action: "sendFeedback",
        data: data,
      },
      (response) => {
        // Handle the response
        if (chrome.runtime.lastError || !response?.success) {
          console.error(
            "Feedback sending failed.",
            chrome.runtime.lastError?.message
          );
          callback(false); // Call the callback with false if there is an error
        } else {
          console.log("Feedback sent successfully: ", response.requestData);
          callback(true); // Call the callback with true on success
        }
      }
    );
  });
}
