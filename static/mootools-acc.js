var json_ran = false;

function check_equality(id, value){
    if(document.getElementById(id)){
        if(details[id] != value && value.length > 0) return true;
    }
    return false;
}

function check_field(){
    document.getElements('input').each(function(element){
        if(check_equality(element.id, element.value)) runJSON(element.id, element.value);
    });
}

function runJSON(id, value){
    var req = new Request({
        method: 'get',
        url: script_root + '/_modify_account',
        data: {'field' : id, 'updated_val': value, 'acc_id': details.id},
        onRequest: function(){},
        onComplete: function(response) {
            details = JSON.parse(response).details;
            document.getElementById('json_status').innerHTML = (JSON.parse(response).status == 200) ? 'Save successful' : JSON.parse(response).status;
            json_ran = false;
        }
    }).send();
}       

window.addEvent('domready', function(){
    window.addEvent('keyup', function(){
        if(!json_ran) {
            json_ran = true;
            document.getElementById('json_status').innerHTML = 'updating...';
            setTimeout("check_field()", 800);
        }
    });
});
