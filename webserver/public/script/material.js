$(".dropdown-menu li a").click(function () {
  $(this).parents(".dropdown").find('.btn').html($(this).text());
  $(this).parents(".dropdown").find('.btn').val($(this).data('value'));

  $("#dateityp").val($(this).text());

  if ($("#Dateityp").text() == "Img") {
    document.getElementById("infotext").style.display = "block";
  } else {
    document.getElementById("infotext").style.display = "none";
  }

  if ($("#Dateityp").text() == 'Website') {
    document.getElementById("file").type = "url";
    document.getElementById("file").placeholder = "https://example.com"
    document.getElementById("file").pattern = "https://.*"
    $("#Datei").text("Link:");
  }
  else if ($("#Dateityp").text() == "YouTube") {
    document.getElementById("file").type = "url";
    document.getElementById("file").placeholder = "https://www.youtube.com/watch?v=..."
    document.getElementById("file").pattern = "https://.*"
    $("#Datei").text("Link:");
  }
  else if ($("#Dateityp").text() == "Buch") {
    document.getElementById("file").type = "text";
    document.getElementById("file").placeholder = "https://example.com"
    //document.getElementById("file").pattern = "^(?:ISBN(?:-13)?:?\ )?(?=[0-9]{13}$|(?=(?:[0-9]+[-\ ]){4})[-\ 0-9]{17}$)97[89][-\ ]?[0-9]{1,5}[-\ ]?[0-9]+[-\ ]?[0-9]+[-\ ]?[0-9]$";
    $("#Datei").text("ISBN: ");
  }
  else {
    document.getElementById("file").type = "file";
    document.getElementById("file").placeholder = ""
    document.getElementById("file").pattern = ""
    $("#Datei").text("Datei:");
  }
});