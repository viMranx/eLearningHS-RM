//Logik für die Übergabe der Rucksack-ID zum Lösch-Dialog:
$(document).ready(function() {
    
    $('.loeschung').click(function(){

        $('#rucksackDel').val($('.hidden_id',this).text());
        
    });   

});
