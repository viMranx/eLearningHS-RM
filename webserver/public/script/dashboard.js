$(document).ready(function() {
    
    $('#rates_inner').hide();
    $('.alert.alert-danger').hide();
        
    //code für update der range-slider
    $('.row').on('input', function(){
        val_azu = $('.col-5 .form-range',this).val();
        $('#result',this).text(val_azu);
    });


    //code für 2. Spalte:
    $('.azurow').click(function(){

        $(this).addClass('table-active').siblings().removeClass('table-active');
        $('.alert.alert-success').hide();
        $('.platzhalter').hide();
        $('#user_id_submit').val($('.id',this).text());

        $.post("/dashboard_azulist", $('.id',this).text(),function(data){
            
            //Falls kein Tag gefunden wurde, Fehler einblenden
            if(data.Nachricht == 1){
                $('#rates_inner').hide();
                $('.alert.alert-danger').show();
            }
            else{
                $('.alert.alert-danger').hide();
                $('#rates_inner').show();
                let tags = data.Tags;
                let rates = data.ARates;
                let exp_rate = "";
                let exp_range = "";
                let azu_inner_html = "";

                for(let i = 0; i < tags.length; i++){
                    exp_range = "<input type='range' class='form-range' min='0' max='100' step='1' style='width: 75%' value='" + rates[i].ExpRate + "' name='" + tags[i].ThemaID + "'>";
                    exp_rate = "<div style='float:right' id='rate_exp'>" + rates[i].ExpRate + "</div>";
                    azu_inner_html = azu_inner_html + "<tr><td>" + tags[i].ThemaName + "</td><td>" + rates[i].AzuRate + "</td><td class='exp_slider'>" + exp_range + exp_rate + "</td></tr>";
                }
                
                $('#azu_rates_body').html(azu_inner_html);

                $('.exp_slider').on('input', function(){
                    val_exp = $('.form-range',this).val();
                    $('#rate_exp',this).text(val_exp);
                });
            }
            
        });
    });   

});
