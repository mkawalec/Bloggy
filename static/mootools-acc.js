"use strict";
var json_ran = false;
var date = new Date();
var time = date.getTime();

function check_equality(id, value){
    if(document.getElementById(id) && details['id']){
        if(details[id] != value && value.length > 0  && value.indexOf('None') == -1) {
            return true;
        }
    }
    return false;
}

function check_field(){
    document.getElements('input').each(function(element){
        if(check_equality(element.id, element.value)) {
            console.log('JSON ran');
            runJSON(element.id, element.value);
        }
    });
    json_ran = false;
}

function runJSON(id, value){
    var req = new Request({
        method: 'get',
        url: script_root + '/_modify_account',
        data: {'field' : id, 'updated_val': value, 'acc_id': details.id},
        onRequest: function(){},
        onComplete: function(response) {
            details = JSON.parse(response).details[0];
            console.log(details);
            document.getElementById('json_status').innerHTML = (JSON.parse(response).status == 200) ? 'Save successful!!' : 'Something wrong??';
            json_ran = false;
            console.log(json_ran);
        }
    }).send();
}      

function runJson(){
    console.log(json_ran);
    var date_now = new Date();

    if(!json_ran && date_now - time > 500){
        time = date_now
        console.log('shot');
        json_ran = true;
        document.getElementById('json_status').innerHTML = 'updating...';
        setTimeout("check_field()", 800);
    }
}

window.addEvent('domready', function(){
    window.addEvent('keyup', function(){
        time = new Date().getTime();
        setTimeout("runJson()", 800);
    });
});
