const urlParams = new URLSearchParams(window.location.search);
const suchWerte = urlParams.get('suchen');
document.getElementById("suchWerte").innerHTML = suchWerte;

for (let i = 0; i < document.getElementsByClassName("sucheZuRucksack").length; i++) {
  document.getElementsByClassName("sucheZuRucksack")[i].value = suchWerte;
}