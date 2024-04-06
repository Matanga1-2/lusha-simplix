document.addEventListener("DOMContentLoaded", () => {
  // Load and display the saved email
  loadSavedEmail();

  // Set up the form submission handler
  const form = document.getElementById("email-form") as HTMLFormElement | null;
  if (form) {
    form.addEventListener("submit", handleFormSubmit);
  }
});

// Function to load and display the saved email
function loadSavedEmail(): void {
  chrome.storage.local.get("email", (result) => {
    if (result.email) {
      const emailInput = document.getElementById(
        "email"
      ) as HTMLInputElement | null;
      if (emailInput) {
        emailInput.value = result.email;
      }
    }
  });
}

// Function to handle form submission
function handleFormSubmit(event: Event): void {
  event.preventDefault();
  const emailInput = document.getElementById(
    "email"
  ) as HTMLInputElement | null;
  if (emailInput) {
    const email = emailInput.value;
    chrome.storage.local.set({ email }, () => {
      console.log(`Email saved: ${email}`);
      // Show the success message
      const successMessage = document.getElementById(
        "save-success"
      ) as HTMLSpanElement | null;
      if (successMessage) {
        successMessage.classList.add("visible");
        setTimeout(() => successMessage.classList.remove("visible"), 5000); // Hide after 5 seconds
      }
    });
  }
}
