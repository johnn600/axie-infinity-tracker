// Scripts for the login page
import { headShake } from "../animate/headShake.js";

// Render the reCAPTCHA checkbox
async function onLoadCallback() {
  const recaptchaCheckbox = await eel.get_env("RECAPTCHA_CHECKBOX")();

  grecaptcha.render("rcaptcha", {
    sitekey: recaptchaCheckbox,
  });
}

window.onLoadCallback = onLoadCallback; // Expose the function to the global scope

// Put the filename in the image input (scholar) field
// Reference: https://stackoverflow.com/a/48942822/19225183
$(".custom-file-input").on("change", function () {
  const fileInput = $(this);
  const filePath = fileInput.val();

  if (filePath) {
    const fileName = filePath.split("\\").pop();
    fileInput.next(".custom-file-label").addClass("selected").text(fileName);
  }
});

// Validate the input fields for the manager login form
export async function validateInput() {
  const managerName = document.getElementById("managerName").value;
  const managerID = document.getElementById("managerID").value;
  const managerForm = document.getElementById("loginManager");
  const recaptchaResponse = await grecaptcha.getResponse();

  // If any of the fields are empty, shake them
  if (managerName === "" || managerID === "") {
    managerForm.classList.add("was-validated");

    if (managerName === "" && managerID === "") {
      headShake("managerName");
      headShake("managerID");
    } else if (managerName === "") {
      headShake("managerName");
    } else if (managerID === "") {
      headShake("managerID");
    }
    return false;
  }

  // Check if the reCAPTCHA is checked
  if (recaptchaResponse.length === 0) {
    headShake("rcaptcha");
    return false;
  }

  return true;
}

window.validateInput = validateInput;

// Set the manager form to invalid
export function setFormInvalid() {
  const managerForm = document.getElementById("loginManager");
  const managerName = document.getElementById("managerName");
  const managerID = document.getElementById("managerID");
  const errorMessage = document.getElementById("managerFormErrorMessage");

  managerForm.classList.remove("was-validated");
  managerName.classList.remove("is-valid");
  managerID.classList.remove("is-valid");
  managerName.classList.add("is-invalid");
  managerID.classList.add("is-invalid");
  errorMessage.innerHTML = "Manager account does not exist.";
}

window.setFormInvalid = setFormInvalid;

// Redirecting to the dashboard based on the role
export function redirectToDashboard(role) {
  const allowedRoles = ["manager", "scholar"];
  const form = document.getElementById("mainContent");

  // Checks before redirecting
  if (!allowedRoles.includes(role)) {
    console.error(`Invalid role: "${role}". Must be "manager" or "scholar".`);
    return;
  }
  if (!form) {
    console.error('Element with ID "mainContent" not found.');
    return;
  }

  // Set session storage values
  if (role === "manager") {
    window.sessionStorage.setItem("managerID", managerID);
    window.sessionStorage.setItem("managerName", managerName);
    window.sessionStorage.setItem("managerFirstLogin", true);
  }

  // Add animation classes to the form
  form.classList.add("animate__animated", "animate__bounceOut");

  // Define the animation end event handler
  const handleAnimationEnd = () => {
    form.classList.add("d-none");
    form.removeEventListener("animationend", handleAnimationEnd);

    // Create transition overlay
    const overlay = document.createElement("div");
    overlay.setAttribute("transition-style", "in:wipe:up");
    overlay.className = "bg-secondary";
    overlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    `;
    document.body.appendChild(overlay);

    // Redirect after a short delay
    setTimeout(() => {
      const redirectMap = {
        manager: "index.html",
        scholar: "quick-check.html",
      };
      window.location.href = redirectMap[role];
    }, 1000);
  };

  // Attach the event listener for animation end
  form.addEventListener("animationend", handleAnimationEnd);
}

window.redirectToDashboard = redirectToDashboard;

// Place the selected QR image input to the hidden div
// Workaround to not violate CORS policy
function prevImage() {
  const input = document.getElementById("inputScholarQr");
  if (!input || !input.files || input.files.length === 0) {
    console.warn("No file selected or input element not found.");
    return;
  }

  const file = input.files[0];
  const img = document.createElement("img");
  img.src = URL.createObjectURL(file);
  img.id = "qrImage";

  const container = document.getElementById("previewQr");
  if (!container) {
    console.error("Preview container not found.");
    return;
  }

  container.innerHTML = ""; // Clear previous content
  container.appendChild(img); // Add the new image
}
