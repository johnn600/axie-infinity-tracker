// Scripts for the login page

// Render the reCAPTCHA checkbox
async function onLoadCallback() {
  const recaptchaCheckbox = await eel.get_env("RECAPTCHA_CHECKBOX")();

  grecaptcha.render("rcaptcha", {
    sitekey: recaptchaCheckbox,
  });
}

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
