const docElm = document.documentElement;
let preference = false;
const preferenceLS = localStorage.getItem("darkMode");
if (preferenceLS) {
  preference = JSON.parse(preferenceLS);
} else {
  preference = window.matchMedia("(prefers-color-scheme: dark)").matches;
  console.log(`Got device preference: ${preference}`);
  localStorage.setItem("darkMode", JSON.stringify(preference));
}
setDarkMode(preference);

function setDarkMode(preference: boolean) {
  if (preference) {
    docElm.classList.add("dark");
    docElm.classList.remove("light");
  } else {
    docElm.classList.add("light");
    docElm.classList.remove("dark");
  }
}