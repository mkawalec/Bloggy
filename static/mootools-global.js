"use strict";
var comment_anims = new Array();
var comm_array = new Array();
var animation_duration = 500;
var loginAnimator;
var id_to_comment, commenting_on_cont;

function highlighted() {
    return window.getSelection();
}

function findpos(obj) {
    var objtop, objleft;
    objtop = objleft = 0;
    if(obj.offsetParent){
        do { 
            objtop += obj.offsetTop; 
            objleft += obj.offsetLeft;
        } while (obj = obj.offsetParent);
    }
    return [objleft, objtop];
}

function insert(main_string, position, pasted_string){
    var temp1 = main_string.slice(0, position);
    var temp2 = main_string.slice(position+1);
    return temp1 + pasted_string + temp2;
}

window.addEvent('domready', function() {
    for(var i=0; i < comm_array.length; i++){
        console.log(comm_array[i].comment_on);
        console.log(comm_array[i].post_id);
        console.log(comm_array[i].comment_id);
        

        var comment = document.getElementById('entry' + comm_array[i].post_id).innerHTML;
        var index = comment.search(comm_array[i].comment_on);
        if(index != -1){
            comment = insert(comment, index+comm_array[i].comment_on.length, "</span>");
            comment = insert(comment, index, "<span style='color:white;display:block;border: 2px solid #C02942;background-color:#542437;'>");
            console.log('Hurrey!!!!!!!!');
            document.getElementById('entry' + comm_array[i].post_id).innerHTML = comment;
        }
    }
    console.log(comm_array.length);
    setTimeout('console.log(comm_array.length)', 2000);
    if(document.getElements('.add_comment dl').length > 0){
        document.getElements('.add_comment dl').each(function(element){
            comment_anims.push(new Fx.Slide(element, 
                {duration: animation_duration, transition: 'quad:in'}));
            comment_anims[comment_anims.length-1].hide();
        });
        document.getElements('.add_header').each(function(element, iter){
            if(element != null){
                element.addEvent('click', function(){
                    console.log(this.id.slice(12));
                    comment_anims[parseInt(this.id.slice(12))-1].slideIn();
                });
            }
        });
    }
    if(document.getElementById('login_form')) {
        loginAnimator = new Fx.Tween('login_form', {property: 'opacity', duration: animation_duration, transition: 'quad:in'});
        loginAnimator.set(0);
        document.getElementById('login').addEvent('click', function(event){
            event.stop();
        
            var login_form = document.getElementById('login_form');
            if(document.defaultView.getComputedStyle(login_form,null).opacity == 1) loginAnimator.start(0);
            else loginAnimator.start(1);
            document.getElementById('uname_input').focus();
        });
    }
    if(document.getElements('.flash').length > 0){
        document.getElements('.flash').each(function(element){
            var animator = new Fx.Slide(element, 
                {duration:2*animation_duration, transition: 'quad:in'})
            animator.hide();
            animator.slideIn();
        });
    }
    if(document.getElements("input[value='Post comment']").length > 0){
        document.getElements("input[value='Post comment']").each(function(element){
            element.addEvent('click', function(event){
                event.stop();
                var form = this.parentNode.parentNode.parentNode.parentNode;
                var action = form.getProperty('action');
                var index = action.lastIndexOf('/');
                action = action.slice(0,index+1);
                console.log(action + ' ' + index + ' ' + action.length);
                action += encodeURIComponent(commenting_on_cont);
                form.setProperty('action', action);
                form.submit();
            });
        });
    }
    window.addEvent('mouseup', function(event){
        if(window.getSelection().getRangeAt(0).cloneContents().textContent.length>0){
        event.stop();
        var range = window.getSelection().getRangeAt(0);
        var dummy = document.createElement('span');
        range.insertNode(dummy);
        var x,y;
        [x, y] = findpos(dummy);
        var notif = document.createElement('div');
        console.log(x + ' ' + y);
        notif.setProperty('class', 'common');
        document.getElementById('page').appendChild(notif);
        commenting_on_cont = range.cloneContents().textContent;
        id_to_comment = dummy.parentNode.parentNode.id;
        dummy.parentNode.removeChild(dummy);

        var pageleft, pageright;
        [pageleft, pageright] = findpos(document.getElementById('page'));
        var stylestring = 'left:'+(pageleft-150)+'px;top:'+y+'px;';
        notif.setProperty('style', stylestring);
        notif.setProperty('id', 'comm_notif');

        notif.innerHTML = "<div id='comm_on'>Comment on that!</div>";

        document.getElementById('comm_on').addEvent('click', function(evt){
            evt.stop();
            if(document.getElements(".add_comment").length > 0){
                var scroller = new Fx.Scroll(window, 
                    {duration: animation_duration, transition:'quad:in'});

                var comm_x, comm_y;
                [comm_x, comm_y] = findpos(document.getElementById(id_to_comment));
                scroller.start(0, comm_y+document.getElementById(id_to_comment).offsetHeight);
            }
        });
        }
    });
});
