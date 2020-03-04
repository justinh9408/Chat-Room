let name = '';
let nameColor = '';
$(function () {
    var socket = io();  

    console.log("name " + nameFrmCookie());

    $('form').submit(function(e){
        e.preventDefault(); // prevents page reloading
        socket.emit('chat message', {'type':1,'msg':$('#msgIn').val(), 'from':name});
        $('#msgIn').val('');
        return false;
    });
    socket.on('chat message', function(data){
        console.log("chat"+data)
        appendMsg(data);
        var objDiv = document.getElementById("messages");
        objDiv.scrollTop = objDiv.scrollHeight;
    });

    socket.on('onlineUsers', function(data){
        $('#onlineUsers').html("")
        for (var i = 0; i < data.length; i++) {
            appendUser(data[i]);
        }
    });
    socket.on('random name', function(data){
        let cookieName = nameFrmCookie();
        if(cookieName != null){
            socket.emit('chat message', {'type':0,'msg':'/nick '+ cookieName, 'from':cookieName});
        }else{
            socket.emit('chat message', {'type':0,'msg':'/nick '+ data, 'from':data});
        }
    });

    socket.on('set name response', function(data){
        name = data;
        document.cookie = 'username='+data;
        console.log(document.cookie);
    });
    
    socket.on('chatHistory', function(data){
        $('#messages').html("")
        console.log("nnnn: " + name)
        console.log("nnnn2222: " + data[0].from.name)

        for (var i = 0; i < data.length; i++) {
            appendMsg(data[i]);
        }
    });
    socket.on('color set', function(data){
        nameColor = data.nameColor
        console.log(data);
    })
});

function appendMsg(data){
    if(data.type == 1){
        var selfStyle = "";
        if(name === data.from.name){
            selfStyle = ''
            $('#messages').append($('<li style="text-align:right" >')
            .html("<span class='msgTimestamp'>"+data.time + "</span><br>" 
                + '<span class="badge badge-info" style="'+selfStyle+'">'+data.msg+'</span>'));
        }else{
             $('#messages').append($('<li>')
            .html("<span class='msgTimestamp'>"+data.time + "</span><br>"
                + ' <span style="color:#'+data.from.nameColor+';'+selfStyle+'">' + data.from.name + '</span>: ' 
                + '<span class="badge badge-primary text-wrap" style="'+selfStyle+'">'+data.msg+'</span>'));
        }
       
    }else{
        $('#messages').append($('<li>').html(data.msg));
    }
}

function appendUser(data){
    if(data.name == name){
        $('#onlineUsers').append($('<li id="selfUser">').html(data.name));
    }else{
        $('#onlineUsers').append($('<li>').html(data.name));
    }
    
}

function nameFrmCookie(){
    let cookie = document.cookie;
    let name = document.cookie.split(';').filter(function(item) {
        return item.trim().indexOf('username=') == 0
    });
    if(name.length){
        return name[0].split('=')[1];
    }else{
        return null;
    }
    
}

