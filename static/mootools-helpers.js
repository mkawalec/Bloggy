var json_ran = false;

function runJSON(){
    var uname = document.getElementById('uname_txt');
    var req = new Request({
        method: 'get',
        url: script_root + '/_check_username',
        data: {'username' : uname.value },
        onRequest: function() { document.getElementById('ajax').innerHTML = "checking...";},
        onComplete: function(response) { 
            var resp = (JSON.parse(response).fine == "true") ? 'Free':'Taken';
            document.getElementById('ajax').innerHTML = resp;
            json_ran = false;
        }
    }).send();
}

function delete_row(id){
    var rowIndex = document.getElementById(id).parentNode.parentNode.rowIndex;
    document.getElementById('table1').deleteRow(rowIndex);
}

window.addEvent('domready', function() {
    console.log('dsadas');
    var uname = document.getElementById('uname_txt');
    uname.addEvent('keyup', function() {
        if(!json_ran){
            json_ran = true;
            document.getElementById('ajax').innerHTML = "checking...";
            setTimeout("runJSON()", 800);
        }
    });
 
    document.getElements('.deluser').each(function(element){
        element.addEvent('click', function() {
            var req = new Request({
                method: 'get',
                url: script_root + '/_rmuser',
                data: {'username': this.id.slice(3)},
                onComplete: function(response) {
                    delete_row("del" + JSON.parse(response).uname);
                }
            }).send();
        });
    });
});

