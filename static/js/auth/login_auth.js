import {
  validateInput,
  setFormInvalid,
  redirectToDashboard,
} from "../pages/login.js";

function quickBalance() {
  var inputQr = document.getElementById("inputScholarQr").value;

  //no image was selected
  if (inputQr === "") {
    document.getElementById("inputQrErrorMessage").innerHTML =
      "QR code image is required.";
    document.getElementById("loginScholar").classList.add("was-validated");
    //shake the form
    shakeElement("elementInputQr");
  } else {
    //get the image from the hidden div
    var img = document.getElementById("qrImage");
    var image = new Image();
    image.src = img.src;

    //scan the image
    QrScanner.scanImage(image)
      .then((result) => {
        var scholarID = result;

        //1 if true, 0 if false (queried from Python backend)
        eel.login_scholar(scholarID)((data) => {
          if (data === 1) {
            document.getElementById("inputQrErrorMessage").innerHTML = "";
            var scholarForm = document.getElementById("loginScholar");
            scholarForm.classList.add("was-validated");
            //make scholarID global variable (this session)
            window.sessionStorage.setItem("scholarID", scholarID);
            hideFormAndTransit("scholar");
          } else {
            console.log("Scholar account does not exist.");

            var scholarForm = document.getElementById("loginScholar");
            scholarForm.classList.remove("was-validated");
            document
              .getElementById("inputScholarQr")
              .classList.add("is-invalid");
            document.getElementById("inputQrErrorMessage").innerHTML =
              "Scholar account does not exist.";
            shakeElement("elementInputQr");
          }
        });
      })
      .catch((error) => {
        console.log("error: " + error);

        var scholarForm = document.getElementById("loginScholar");
        scholarForm.classList.remove("was-validated");
        document.getElementById("inputScholarQr").classList.add("is-invalid");
        document.getElementById("inputQrErrorMessage").innerHTML =
          "Image contains no valid QR code.";
        shakeElement("elementInputQr");
      });
  }
}

// Logs in the manager using the manager ID and name
async function loginManager() {
  const validate = await validateInput();

  if (validate) {
    const managerID = document.getElementById("managerID").value;
    const managerName = document.getElementById("managerName").value;
    const response = await eel.login_manager(managerID, managerName)();

    console.log("response: " + response);

    if (response) {
      redirectToDashboard("manager");
    } else {
      setFormInvalid();
    }
  }
}

// Expose the functions to the global scope
window.loginManager = loginManager;

//remove animated class after animation of the main content
const element = document.getElementById("mainContent");
element.addEventListener("animationend", () => {
  element.classList.remove("animate__animated", "animate__bounceIn");
});
