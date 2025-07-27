function clickMethode(vorname, name, email, thema) {
  document.getElementById("cvname").innerHTML = vorname + " " + name;
  document.getElementById("email").innerHTML = email;
  console.log(thema);
  document.getElementById("thema_lehrjahr").innerHTML = thema.replaceAll(",", "<br>");
}

let azu = document.getElementById("tab_azu");
let exp = document.getElementById("tab_exp");
let chLabeL = document.getElementById("tag_lehrjahr").innerHTML;

azu.onclick = function () {
  let chLabeL = (document.getElementById("tag_lehrjahr").innerHTML =
    "Themen:");
  let pbild = document.getElementById("imgName");

  if (pbild.classList.contains("hidden")) {
    pbild.classList.remove("hidden");
    pbild.classList.add("imgName");
    pbild = document.getElementById("imgName").src =
      "../../public/assets/imgs/PBStudent.png";
  } else {
    pbild = document.getElementById("imgName").src =
      "../../public/assets/imgs/PBStudent.png";
  }
};

exp.onclick = function () {
  chLabeL = document.getElementById("tag_lehrjahr").innerHTML = "Themen:";
  let pbild = document.getElementById("imgName");

  if (pbild.classList.contains("hidden")) {
    pbild.classList.remove("hidden");
    pbild.classList.add("imgName");
    pbild = document.getElementById("imgName").src =
      "../../public/assets/imgs/PBProfessor.png";
  } else {
    pbild = document.getElementById("imgName").src =
      "../../public/assets/imgs/PBProfessor.png";
  }
};


$(document).ready(function() {

  $('.pers_row').click(function(){

    $(this).addClass('table-active').siblings().removeClass('table-active');

  });

});