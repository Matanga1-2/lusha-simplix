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
}

function injectCss() {
  // Inject the stylesheet for the floating button
  const link = document.createElement("link");
  console.log("simplix- link is ", link);
  link.href = chrome.runtime.getURL("content.css");
  console.log("simplix- link is ", link);
  link.type = "text/css";
  link.rel = "stylesheet";
  (document.head || document.documentElement).appendChild(link);
  console.log("simplix- vsible ", link);
}

// Show the floating button
console.log("simplix- starting injection");
injectCss();
showFloatingButton();
