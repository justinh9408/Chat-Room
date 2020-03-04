let express = require('express');
let app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
let path = require("path");

app.use(express.static(path.join(__dirname, "public")));

app.get('/', function(req, res){
    res.sendFile(__dirname + '/public' + '/client.html');
});

let count = 0;

let chatHistory = [];

let connectMap = new Map();

let nameSet = new Set();

io.on('connection', function(socket){
	let color = getRandomColor();
	count = count + 1;
	connectMap.set(socket.id,{"name":color,"nameColor":color});

	socket.emit('random name', color);
	
	io.emit('onlineUsers', Array.from(connectMap.values()));
  setTimeout(function(){
    socket.emit('chatHistory', chatHistory);
  }, 600)
  
//nick <new nickname>
  socket.on('chat message', function(data){
  	if(data.msg.startsWith("/nick ")){

  		let newName = data.msg.slice(6);
  		if(nameSet.has(newName)){
        if(data.type != 0)
  			  socket.emit('chat message', {'type' : 0, 'msg': 'Nick name taken! Please choose another one!'});
        else{
          for (let sid of connectMap.keys()) {
            if(sid != socket.id && connectMap.get(sid).name === newName){
              color = connectMap.get(sid).nameColor;
              connectMap.delete(sid);
            }
          }
          connectMap.set(socket.id,{"name":newName,"nameColor":color});
          socket.emit('set name response', newName);
          io.emit('onlineUsers', Array.from(connectMap.values()));
        }
  		}else{
  			let oldUser = connectMap.get(socket.id);
  			oldUser.name = newName;
  			nameSet.add(newName);
  			connectMap.set(socket.id,oldUser);
	  		socket.emit('set name response', newName);
	  		io.emit('onlineUsers', Array.from(connectMap.values()));
  		}
  		
  	}else if (data.msg.startsWith("/nickcolor ")) {
      let colorStr = data.msg.slice(11);
      let oldUser = connectMap.get(socket.id)
      oldUser.nameColor = colorStr;
      connectMap.set(socket.id, oldUser);
      console.log("color changed");
      socket.emit('color set', Array.from(connectMap.values()));
    }else if(data.msg.startsWith("/")){
      socket.emit('chat message', {'type' : 0, 'msg': 'Command doesn\' exist!'});
    }else{
	  	timeStamp = new Date();
	  	let hour = timeStamp.getHours();
	    let min = (timeStamp.getMinutes()<10 ? '0' : '') + timeStamp.getMinutes();
	    timeStr = hour + " : " + min;
	    let chat = new Object();
	    chat.time = timeStr;
	    chat.type = 1;
	    chat.from = connectMap.get(socket.id);
	    chat.msg = data.msg;
	    if(chatHistory.length > 200)
	    	chatHistory.shift()
	    chatHistory.push(chat)
	    io.emit('chat message', {'type':1,'msg':data.msg , 'time':timeStr, 'from':chat.from});
	  }
  });

  socket.on('disconnect', function(){
    connectMap.delete(socket.id)
    count = count - 1;
  });
  
});




http.listen(3000, function(){
  console.log('listening on *:3000');
});

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
