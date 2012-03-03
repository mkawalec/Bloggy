"use strict";
var comment_anims = {};
var comm_array = new Array();
var comm_cont = new Array();
var animation_duration = 500;
var loginAnimator;
var id_to_comment, commenting_on_cont;
var commenting_on = {begin: 0, end: 0};
var current_start = 0;

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

// Delete newlines before (and after) tags:
function delNewlines(string){
    for(var i = 0; i < string.length; i++){
        if(string[i] == '\\') console.log('yea');
    }
}

window.addEvent('domready', function() {
    // Create a map of post contents before inserting those stupid spans/divs
    document.getElements('.entry .contents').each(function(element){
        comm_cont.push(element.innerHTML);
    });
    for(var i = 0; i < comm_cont.length; i++) delNewlines(comm_cont[i]);

    // Add colour markings
    for(var i=0; i < comm_array.length; i++){
        var comment = document.getElementById('entry' + comm_array[i].post_id).innerHTML;
        var index = comment.search(comm_array[i].comment_on);
        if(index != -1){
            comment = insert(comment, index+comm_array[i].comment_on.length, "</div>");
            comment = insert(comment, index, "<div style='color:white;display:inline;background-color:#542437;'>");
            document.getElementById('entry' + comm_array[i].post_id).innerHTML = comment;
        }
    }
    if(document.getElements('.add_comment dl').length > 0){
        document.getElements('.add_comment dl').each(function(element){
            comment_anims[element.id.slice(3)] = new Fx.Slide(element, 
                {duration: animation_duration, transition: 'quad:in'});
            comment_anims[element.id.slice(3)].hide();
        });
        document.getElements('.add_header').each(function(element){
            if(element != null){
                element.addEvent('click', function(){
                    var length = 0;
                    for(element in comment_anims){
                        length++;
                    }
                    comment_anims[this.id.slice(12)].slideIn();
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
                action += encodeURIComponent(commenting_on_cont);
                form.setProperty('action', action);
                form.submit();
            });
        });
    }
    /* 
     * How to fix the range:
     * - The span need to be, somehow, not inserted
     *   Which gives us a nice problem of how to determine the position of the range on a page:
     *   - I could copy the contents of the div, without any spans, to the memory, insert the span and then copy the contents back -> the position is determined.
     *     Needs to test if the selection is still active in such a case, if it is not, a new seslection must be made using the start/stop details from a page
     *  Then when the div is inserted, it shouldn't create a new line (does it actually?)
     *
     */
    if(document.getElements('.entry').length > 0){
        window.addEvent('mouseup', function(event){
            if(window.getSelection().getRangeAt(0).cloneContents().textContent.length>0){
            event.stop();
            var range = window.getSelection().getRangeAt(0);
            var dummy = document.createElement('span');
            console.log('start: ' + range.startOffset + ' end: ' + range.endOffset);
        
            commenting_on.begin = range.startOffset;
            commenting_on.end = range.endOffset;
            console.log('Range count: ' + window.getSelection().rangeCount);

            range.insertNode(dummy);
            var x,y;
            [x, y] = findpos(dummy);
            var notif = document.createElement('div');
            notif.setProperty('class', 'common');
            notif.setProperty('id', 'comm_notif');

            if(!document.getElementById('comm_notif')) document.getElementById('page').appendChild(notif);
            else {
                document.getElementById('page').removeChild(document.getElementById('comm_notif'));
                document.getElementById('page').appendChild(notif);
            }

            id_to_comment = dummy.parentNode.parentNode.id;
            console.log(id_to_comment);
        //dummy.parentNode.removeChild(dummy);

            var pageleft, pageright;
            [pageleft, pageright] = findpos(document.getElementById('page'));
            var stylestring = 'left:'+(pageleft-150)+'px;top:'+y+'px;';
            notif.setProperty('style', stylestring);

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
    }
});
