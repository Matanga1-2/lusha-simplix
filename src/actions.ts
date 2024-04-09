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
  callback: (success: boolean) => void
) {
  // First, get the email from storage
  getEmailFromStorage((email) => {
    if (email === null) {
      callback(false);
      return;
    }

    const userAgent = navigator.userAgent; // Get the user agent from the navigator object

    // Prepare the data to send, excluding the URL details
    const data = {
      email: email,
      feedback: feedback,
      userAgent: userAgent,
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
          callback(false);
        } else {
          console.log("Feedback sent successfully.");
          callback(true);
        }
      }
    );
  });
}
