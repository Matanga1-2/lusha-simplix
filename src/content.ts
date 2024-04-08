let popupTextarea: HTMLTextAreaElement; // Define the variable with an explicit type

function initialize() {
  console.log("Initializing script");
  injectCss();
  createPopup();
  showFloatingButton();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialize);
} else {
  // DOMContentLoaded has already fired
  initialize();
}

function showFloatingButton() {
  // Create the floating button div
  const floatingButton = document.createElement("div");
  floatingButton.id = "simplix-floating-button";

  // Create the image element
  const imageElement = document.createElement("img");
  imageElement.src = chrome.runtime.getURL("images/logo48.png");

  // Append the image to the button
  floatingButton.appendChild(imageElement);

  // Append the floating button to the body
  document.body.appendChild(floatingButton);

  // Add click event listener to the floating button
  floatingButton.addEventListener("click", showPopup);
}

function injectCss() {
  // Inject the stylesheet for the floating button
  const link = document.createElement("link");
  link.href = chrome.runtime.getURL("content.css");
  link.type = "text/css";
  link.rel = "stylesheet";
  document.head.appendChild(link);
}

function createPopup() {
  // Container for the popup
  const popupContainer = document.createElement("div");
  popupContainer.id = "simplix-popup-container";

  // Content area for the popup
  const popupContent = document.createElement("div");
  popupContent.id = "simplix-popup-content";

  // Title for the popup
  const popupTitle = document.createElement("h2");
  popupTitle.textContent = "Provide Feedback";

  // Textarea for input
  popupTextarea = document.createElement("textarea");
  popupTextarea.id = "simplix-popup-textarea";

  // Submit button
  const submitButton = document.createElement("button");
  submitButton.id = "simplix-submit-button";
  submitButton.textContent = "Submit";
  // Event listeners to close popup
  submitButton.onclick = () => {
    submitButton.onclick = handleSubmit;
  };

  // Close button
  const closeButton = document.createElement("button");
  closeButton.id = "simplix-popup-close";
  closeButton.textContent = "X";
  closeButton.onclick = () => (popupContainer.style.display = "none");
  popupContainer.onclick = (event) => {
    if (event.target === popupContainer) {
      popupContainer.style.display = "none";
    }
  };

  // Append children
  popupContent.appendChild(popupTitle);
  popupContent.appendChild(popupTextarea);
  popupContent.appendChild(submitButton);
  popupContent.appendChild(closeButton);
  popupContainer.appendChild(popupContent);

  // Append popup to body
  document.body.appendChild(popupContainer);
}

function showPopup() {
  const popupContainer = document.getElementById(
    "simplix-popup-container"
  ) as HTMLElement;
  if (popupContainer) {
    popupContainer.style.display = "flex"; // Show the popup
  } else {
    console.error("Popup container not found");
  }
}

function handleSubmit() {
  // Retrieve the saved email from storage
  chrome.storage.local.get("email", (result) => {
    // Make sure the email is retrieved successfully
    if (chrome.runtime.lastError) {
      console.error(
        "Error retrieving the email from storage:",
        chrome.runtime.lastError
      );
      return;
    }

    const email = result.email;
    const feedback = popupTextarea.value;

    // Prepare the data to send
    const data = {
      email: email,
      feedback: feedback,
    };

    // Send a message to the background script to perform the fetch
    chrome.runtime.sendMessage(
      {
        action: "sendFeedback",
        data: {
          email: email,
          feedback: feedback,
        },
      },
      (response) => {
        if (response.status === "success") {
          showSuccessNotification("Feedback sent successfully!");
        } else {
          console.error("Failed to send feedback:", response.error);
        }
      }
    );

    // Clear the textarea and hide the popup
    popupTextarea.value = "";
    const popupContainer = document.getElementById("simplix-popup-container");
    if (popupContainer) {
      popupContainer.style.display = "none";
    }
  });
}

function showSuccessNotification(message: string) {
  // Create the notification element (style this in CSS)
  const notification = document.createElement("div");
  notification.textContent = message;
  notification.id = "simplix-success-notification";
  notification.style.display = "block"; // Show the notification

  // Append and remove after some time, e.g., 3 seconds
  document.body.appendChild(notification);
  setTimeout(() => {
    notification.style.display = "none"; // Hide the notification
    document.body.removeChild(notification);
  }, 3000);
}
