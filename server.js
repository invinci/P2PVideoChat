var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
app.use(express.static("./public"));

server.listen(3000);

var
clients = [],
activeUsers=[],
signalToSend=null;

io.on('connection', function(client){

  clients.push(client);
  console.log("Client"+clients.length+" connected");
  for(var i=0; i<clients.length; i++){
    clients[i].emit("queue",{"size":clients.length,"position":i+1});
  }

  client.on('ready',function() {
    // First user, init call
    if(activeUsers.length===0){
      activeUsers[0] = client;
      client.emit("init",true);
      console.log("User set to host");
    }else if(activeUsers.length==1){
      activeUsers[1] = client;
      client.emit("init",false);

      // Check if we have an active signal
      if(signalToSend!==null){
        console.log("emit connect to user2");
        activeUsers[1].emit("reciveSignal",signalToSend);
        signalToSend = null;
      }
      console.log("User set as responder");
    }else{
      console.log("Wait in line");
    }
  });


  /*
  *   DISCONNECT
  */
  client.on('disconnect', function(){

    // remove element from client array
    for(var i=0; i<clients.length; i++){
      if(clients[i]==client){
        console.log("Client"+(i+1)+" disconnect");
        clients.splice(i, 1);
      }
    }

    // Check if disconnected player was in call
    if(activeUsers.length!==0){
      var dropedUser = activeUsers.indexOf(client);

      if(dropedUser!==-1){

        var other = (dropedUser==1)? activeUsers[0] : activeUsers[1];
        other.emit("cancelCall");

        console.log("active user droped",dropedUser);

        // remove him from the list
        activeUsers.splice(dropedUser, 1);

        // Host droped?
        if(dropedUser===0){
          // Init new call

          activeUsers[0].emit("init",true);
          console.log("init new call");

          // Add other active user
          if(clients.length>1){
            activeUsers[1] = clients[1];
            clients[1].emit("init",false);
            console.log("New responder is added");
          }

        }else{
          // responder droped
          console.log("get new responder");
          // Get new responder
          if(clients.length>1){
            activeUsers[1] = clients[1];
            clients[1].emit("init",false);
            console.log("New responder is ",clients[1]);
          }
        }


      }
    }

    //  io.emit("numberOfClients",clients.length);
    for(var u=0; i<clients.length; u++){
      clients[i].emit("queue",{"size":clients.length,"position":u+1});
    }
    console.log("Number of clients: "+clients.length);
  });



  client.on('sendSignal',function(data) {

      if(client===activeUsers[0]){
        console.log("Token recived from user1");
        // Loop until user2 connect
        if(activeUsers.length!==1){
          console.log("emit connect to user2");
          activeUsers[1].emit("reciveSignal",data);
        }else{
          // Try later
          signalToSend = data;
        }
      }else{
        console.log("Token recived from user2");
        console.log("emit connect to user1");
        activeUsers[0].emit("reciveSignal",data);
      }
  });


});


app.get('/',function(req,res){
   res.sendFile(__dirname+'/public/index.html');
});
