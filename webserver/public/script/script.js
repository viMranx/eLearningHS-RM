
function sortTable(n, t) {
  var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
  table = document.getElementById(t);
  switching = true;
  //Set the sorting direction to ascending:
  dir = "asc"; 
  /*Make a loop that will continue until
  no switching has been done:*/
  while (switching) {
    //start by saying: no switching is done:
    switching = false;
    rows = table.rows;
    /*Loop through all table rows (except the
    first, which contains table headers):*/
    for (i = 2; i < (rows.length - 1); i++) { //i=2 erste zeile wird ignoriert
      //start by saying there should be no switching:
      shouldSwitch = false;
      /*Get the two elements you want to compare,
      one from current row and one from the next:*/
      x = rows[i].getElementsByTagName("TD")[n];
      y = rows[i + 1].getElementsByTagName("TD")[n];
      /*check if the two rows should switch place,
      based on the direction, asc or desc:*/
      if (dir == "asc") {
        if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
          //if so, mark as a switch and break the loop:
          shouldSwitch= true;
          break;
        }
      } else if (dir == "desc") {
        if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
          //if so, mark as a switch and break the loop:
          shouldSwitch = true;
          break;
        }
      }
    }
    if (shouldSwitch) {
      /*If a switch has been marked, make the switch
      and mark that a switch has been done:*/
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
      //Each time a switch is done, increase this count by 1:
      switchcount ++;      
    } else {
      /*If no switching has been done AND the direction is "asc",
      set the direction to "desc" and run the while loop again.*/
      if (switchcount == 0 && dir == "asc") {
        dir = "desc";
        switching = true;
      }
    }
  }
}

function backToStandart(){
  var y = document.getElementsByClassName("closer");
  var z = document.getElementsByClassName("opener");
  for (var i = 0; i < y.length; i++) {                  //standart nicht sichtbar
    if(y[i].style.display === "table-row"){
      y[i].style.display = "none";
    }
  }
  for (var i = 0; i < z.length; i++) {                  //standart sichtbar
    if(z[i].style.display === "none"){
      z[i].style.display = "table-row";
    }
  }
}

function openSelected(id){ 
  backToStandart();
  var x = document.getElementsByClassName("openSelected"+id);
  for (var i = 0; i < x.length; i++) {                  //auswahl ändern
    if(x[i].style.display === "none"){
      x[i].style.display = "table-row";
    }else{
      x[i].style.display = "none";
    }
  }
} 

// Ändert die Vordrgrundfarbe abhängig von der Hintergrundfarbe
// Wenn die Hintergrundfarbe hell ist: schwarz, sonst weiß
window.onload = function getColor() {
  chgColor("name");
  chgColor("tag");
}

function chgColor(elementTyp) {
  let elemente = document.getElementsByClassName(elementTyp);
  for (let i = 0; i < elemente.length; i++) {
    let rgb = elemente[i].style.backgroundColor.slice(4, -1).split(", ");

    if (rgb.length == 3) {
      for (let j = 0; j < rgb.length; j++) {
        rgb[j] = parseInt(rgb[j]);
      }
      
      let uic = [rgb[0] / 255, rgb[1] / 255, rgb[2] / 255];
      let c = uic.map((col) => {
        if (col <= 0.03928) {
          return col / 12.92;
        }
        return Math.pow((col + 0.055) / 1.055, 2.4);
      });

      let L = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];

      if (L > 0.179) {
        document.getElementsByClassName(elementTyp)[i].children[0].style.color = 'black'
      } else {
        document.getElementsByClassName(elementTyp)[i].children[0].style.color = 'white';
      }
    }
  }
}

function filterKarten(num, typ) {
  collapse = document.getElementById("collapse" + num);
  karten = collapse.getElementsByClassName(typ);
  for (let i = 0; i < karten.length; i++) {
    if (karten[i].style.display === "none") {
      karten[i].style.display = "block";
    } else {
      karten[i].style.display = "none";
    }
  }
}