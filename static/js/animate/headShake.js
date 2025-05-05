// Shake the element
// Using animate.css library
// Reference: https://animate.style/

export function headShake(id) {
  const element = document.getElementById(id);

  if (!element) {
    console.error(`Element with id ${id} not found.`);
    return;
  }

  // Add the animation classes to the element
  element.classList.add("animate__animated", "animate__headShake");

  // Remove the animation classes after the animation ends
  element.addEventListener("animationend", () => {
    element.classList.remove("animate__animated", "animate__headShake");
  });
}
