const width = window.innerWidth,
  height = window.innerHeight,
  maxRadius = (Math.min(width, height) / 2) - 50;

const formatNumber = d3.format(',d');

const x = d3.scaleLinear()
  .range([0, 2 * Math.PI])
  .clamp(true);

const y = d3.scaleSqrt()
  .range([maxRadius * .1, maxRadius]);

const color = d3.scaleOrdinal(d3.schemeCategory20);

const partition = d3.partition();

const arc = d3.arc()
  .startAngle(d => x(d.x0))
  .endAngle(d => x(d.x1))
  .innerRadius(d => Math.max(0, y(d.y0-0.02))) //Ring size
  .outerRadius(d => Math.max(0, y(d.y1-0.02))); 

const middleArcLine = d => {
  const halfPi = Math.PI / 2;
  const angles = [x(d.x0) - halfPi, x(d.x1) - halfPi];
  const r = Math.max(0, (y(d.y0) + y(d.y1)) / 2);

  const middleAngle = (angles[1] + angles[0]) / 2;
  const invertDirection = middleAngle > 0 && middleAngle < Math.PI; // On lower quadrants write text ccw
  if (invertDirection) { angles.reverse(); }

  const path = d3.path();
  path.arc(0, 0, r, angles[0], angles[1], invertDirection);
  return path.toString();
};

const textFits = d => {
  const CHAR_SPACE = 6;

  const deltaAngle = x(d.x1) - x(d.x0);
  const r = Math.max(0, (y(d.y0) + y(d.y1)) / 2);
  const perimeter = r * deltaAngle;

  return d.data.name?.length * CHAR_SPACE < perimeter;
};

const maxwidth = 306;
const minwidth = 40;
const maxheight = 302;
const minheight = 40;
let inner = false;

const svg = d3.select('#content').append('svg')
  .style('width', '82vw')
  .style('height', '82vh')
  .style("display", "block")
  .style("margin", "auto")
  .attr('viewBox', `${-width / 3} ${-height / 3} ${width/1.5} ${height/1.5}`)
  .on('click', () => focusOn()); // Reset zoom on canvas click

    data = d3.hierarchy(data);
    data.sum(d => d.size - 40);
    const slice = svg.selectAll('g.slice')
    .data(partition(data).descendants());


  slice.exit().remove();

  const newSlice = slice.enter()
    .append('g').attr('class', 'slice')
    .on('click', function (d) {
      if (d.data.haschildren) {
        d3.event.stopPropagation();
        focusOn(d);
      }
    });

  newSlice.append('title')
    .text(d => d.data.name);
  
  newSlice.append("image")
    .attr("id", function (d) {
      if (d.data.name == "Themen") return "logo";
    })
    .attr("xlink:href", function (d) {
      if (d.data.name == "Themen") return "https://i.ibb.co/N29FBTM/logo-Blau-transformed.png";
    })
    .attr("width", maxwidth)
    .attr("height", maxheight)
    .attr("x", -(maxwidth/2))
    .attr("y", -(maxheight/2));


  newSlice.append('a')
    .attr("xlink:href", function (d) { if (!d.data.haschildren) return "suchen?suchen=" + "%23" + encodeURIComponent(d.data.name) })
    .append('path')
    .attr('class', 'main-arc')
    .style('fill', function (d, i) {
      if (d.depth > 0) return d.data.color;
      else return "transparent";
    })
    .attr('d', arc);

  newSlice.append('path')
    .attr('class', 'hidden-arc')
    .attr('id', (_, i) => `hiddenArc${i}`)
    .attr('d', middleArcLine);

  const text = newSlice.append('a')
    .append("text");


text.append('textPath')
  .attr("dy", "0em")
  .attr("font-size", "13px")
  .attr('startOffset', '50%')
  .attr('xlink:href', (_, i) => `#hiddenArc${i}`)
  .text(function (d) {
    if (d.data.name == "Themen") {
      return "";
    }
    else {
      if (!textFits(d)) {
        var arr;
        var name = d.data.name + "";
        arr = name.split(" ");
        if (arr.length < 2) {
          arr = name.split("-");
        }
        name = arr[0];
        return name;
      }
      else {
        return d.data.name;
      }
    }
  })
  .style('fill', function (d) {
    return pickTextColorBasedOnBgColorAdvanced(d.data.color, '#FFFFFF', '#000000');
  });

/*
text.append("textPath")   
  .attr("font-size", "13px")
  .attr('startOffset', '50%')
  .attr('xlink:href', (_, i) => `#hiddenArc${i}`)
  .attr("y", "10px")
  .text(function (d) {
    if (d.data.name == "Themen") {
      return "";
    }
    else {
      if (!textFits(d)) {
        var arr;
        var name = d.data.name + "";
        arr = name.split(" ");
        if (arr.length < 2) {
          arr = name.split("-");
        }
        name = "";
        for (let i = 0; i < arr.length; i++){
          if (i > 0) {
            name += arr[i];
            name += " ";
          }
        }
        return name;
      }
    }
  })   
  .style('fill', function (d) {
    return pickTextColorBasedOnBgColorAdvanced(d.data.color, '#FFFFFF', '#000000');
  })
*/
  



function focusOn(d = { x0: 0, x1: 1, y0: 0, y1: 1 }) {
  // Reset to top-level if no data point specified

  const transition = svg.transition()
    .duration(750)
    .tween('scale', () => {
      const xd = d3.interpolate(x.domain(), [d.x0, d.x1]),
        yd = d3.interpolate(y.domain(), [d.y0, 1]);
      return t => { x.domain(xd(t)); y.domain(yd(t)); };
    });
  
  transition.selectAll('path.main-arc')
    .attrTween('d', d => () => arc(d));
  
  if (d.data?.name == undefined || d.data?.name == "Themen") {
    transition.selectAll('a')
      .attr("xlink:href", function (d) { if (!d.data.haschildren) return "suchen?suchen=" + "%23" + encodeURIComponent(d.data.name) })
  }
  else {
    transition.selectAll('a')
      .attr("xlink:href", function (d) { if (d.data.name != "Themen") return "suchen?suchen=" + "%23" + encodeURIComponent(d.data.name) })
  }


  if ((d.data?.name != undefined && d.data?.name != "Themen")) {
    if (inner&&!d.data.haschildren) {
      transition.select("#logo")
        .attr("width", maxwidth)
        .attr("height", maxheight)
        .attr("x", -(maxwidth / 2))
        .attr("y", -(maxheight / 2));
      inner = false;
    }
    else {
      transition.select("#logo")
        .attr("width", minwidth)
        .attr("height", minheight)
        .attr("x", -(minwidth / 2))
        .attr("y", -(minheight / 2));
      inner = true;
    }
  }

  else {
    if (inner) {
      transition.select("#logo")
      .attr("width", maxwidth)
      .attr("height", maxheight)
      .attr("x", -(maxwidth / 2))
      .attr("y", -(maxheight / 2));
      inner = false;
    }
  }


  transition.selectAll('path.hidden-arc')
    .attrTween('d', d => () => middleArcLine(d));

  moveStackToFront(d);

  function moveStackToFront(elD) {
    svg.selectAll('.slice').filter(d => d === elD)
      .each(function (d) {
        this.parentNode.appendChild(this);
        if (d.parent) { moveStackToFront(d.parent); }
      })
  }
}

function pickTextColorBasedOnBgColorAdvanced(bgColor, lightColor, darkColor) {
  var color = (bgColor?.charAt(0) === '#') ? bgColor.substring(1, 7) : bgColor;
  var r = parseInt(color?.substring(0, 2), 16); // hexToR
  var g = parseInt(color?.substring(2, 4), 16); // hexToG
  var b = parseInt(color?.substring(4, 6), 16); // hexToB
  var uicolors = [r / 255, g / 255, b / 255];
  var c = uicolors.map((col) => {
    if (col <= 0.03928) {
      return col / 12.92;
    }
    return Math.pow((col + 0.055) / 1.055, 2.4);
  });
  var L = (0.2126 * c[0]) + (0.7152 * c[1]) + (0.0722 * c[2]);
  if (L > 0.179) return darkColor;
  else return lightColor;
}

//random farbgenerierung für neue themen
function randomInteger(min, max){
  return Math.floor(Math.random() * (max - min) + min);
}
function randomRgbColor(rX, rY, gX, gY, bX, bY) {
  let r = randomInteger(rX, rY);
  let g = randomInteger(gX, gY);
  let b = randomInteger(bX, bY);
  return [r,g,b];
}
function randomHexColor(rX, rY, gX, gY, bX, bY) {
  let [r,g,b] =randomRgbColor(rX, rY, gX, gY, bX, bY);
  let hr = r.toString(16).padStart(2, '0');
  let hg = g.toString(16).padStart(2, '0');
  let hb = b.toString(16).padStart(2, '0');
  return "#" + hr + hg + hb;
}
function changeColor(cUeber) {
  if(cUeber == '#FF0000') {var hex = randomHexColor(255, 255, 1, 42, 1, 42);}
  if(cUeber == '#FF5500') {var hex = randomHexColor(255, 255, 43, 127, 0, 0);}
  if(cUeber == '#FFAA00') {var hex = randomHexColor(255, 255, 128, 212, 0, 0);}
  if(cUeber == '#FFFF00') {var hex = randomHexColor(213, 254, 213, 254, 0, 0);}
  if(cUeber == '#AAFF00') {var hex = randomHexColor(128, 212, 255, 255, 0, 0);}
  if(cUeber == '#55FF00') {var hex = randomHexColor(43, 127, 255, 255, 0, 0);}
  if(cUeber == '#00FF00') {var hex = randomHexColor(1, 42, 255, 255, 1, 42);}
  if(cUeber == '#00FF55') {var hex = randomHexColor(0, 0, 255, 255, 43, 127);}
  if(cUeber == '#00FFAA') {var hex = randomHexColor(0, 0, 255, 255, 128, 212);}
  if(cUeber == '#00FFFF') {var hex = randomHexColor(0, 0, 213, 254, 213, 254);}
  if(cUeber == '#00AAFF') {var hex = randomHexColor(0, 0, 128, 212, 255, 255);}
  if(cUeber == '#0055FF') {var hex = randomHexColor(0, 0, 43, 127, 255, 255);}
  if(cUeber == '#0000FF') {var hex = randomHexColor(1, 42, 1, 42, 255, 255);}
  if(cUeber == '#5500FF') {var hex = randomHexColor(43, 127, 0, 0, 255, 255);}
  if(cUeber == '#AA00FF') {var hex = randomHexColor(128, 212, 0, 0, 255, 255);}
  if(cUeber == '#FF00FF') {var hex = randomHexColor(213, 254, 0, 0, 213, 254);}
  if(cUeber == '#FF00AA') {var hex = randomHexColor(255, 255, 0, 0, 128, 212);}
  if(cUeber == '#FF0055') {var hex = randomHexColor(255, 255, 0, 0, 43, 127);}
  if(cUeber == '#2B2B2B') {
    let number = randomInteger(0, 85);
    var hex = randomHexColor(number, number, number, number, number, number);
  }
  if(cUeber == '#808080') {
    let number = randomInteger(85, 170);
    var hex = randomHexColor(number, number, number, number, number, number);
  }
  if(cUeber == '#D5D5D5') {
    let number = randomInteger(170, 255);
    var hex = randomHexColor(number, number, number, number, number, number);
  }
  let farbe = document.getElementsByClassName('themaAddFarbe');
  for(let i = 0; i < farbe.length; i++){
    farbe[i].value = hex;
  }
}

function clorsUeber(){
  var color1 =[255, 0, 0, '#FF0000'];
  var color2 =[255, 85, 0, '#FF5500'];
  var color3 =[255, 170, 0, '#FFAA00'];
  var color4 =[255, 255, 0, '#FFFF00'];
  var color5 =[170, 255, 0, '#AAFF00'];
  var color6 =[85, 255, 0, '#55FF00'];
  var color7 =[0, 255, 0, '#00FF00'];
  var color8 =[0, 255, 85, '#00FF55'];
  var color9 =[0, 255, 170, '#00FFAA'];
  var color10 =[0, 255, 255, '#00FFFF'];
  var color11 =[0, 170, 255, '#00AAFF'];
  var color12 =[0, 85, 255, '#0055FF'];
  var color13 =[0, 0, 255, '#0000FF'];
  var color14 =[85, 0, 255, '#5500FF'];
  var color15 =[170, 0, 255, '#AA00FF'];
  var color16 =[255, 0, 255, '#FF00FF'];
  var color17 =[255, 0, 170, '#FF00AA'];
  var color18 =[255, 0, 85, '#FF0055'];
  var color19 =[43, 43, 43, '#2B2B2B'];
  var color20 =[128, 128, 128, '#808080'];
  var color21 =[212, 212, 212, '#D5D5D5'];
  var color = [color1, color2, color3, color4, color5, 
    color6, color7, color8, color9, color10, color11, 
    color12, color13, color14, color15, color16, color17, 
    color18, color19, color20, color21 ];
}

//Logik für die Übergabe der Rucksack-ID zum Lösch-Dialog:
$(document).ready(function() {
    
  $('.loeschung').click(function(){

      $('#themaDelUeber').val($('.hidden_id',this).text());
      
  });   

  if (document.getElementById('userExperte').value == 0) {
    document.getElementsByTagName("svg")[0].style.width = "100%";
    document.getElementsByTagName("svg")[0].style.float = "none";
  }

});
