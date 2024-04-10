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
  image64: string,
  imageBinary: Blob,
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
      imageBinary: image64,
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

export function convertImage(
  base64: string,
  contentType = "",
  sliceSize = 512
) {
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
