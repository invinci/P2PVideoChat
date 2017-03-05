var Peer = require('simple-peer');
var getUserMedia = require('getusermedia');

var readyToSend = false;
var yourStream;
if (Peer.WEBRTC_SUPPORT) {

/*
  : reinit call
  : samtal avslutat animation
  : timer
*/
var socket = io.connect();
socket.on('connect',function(){

var init = function(){
    console.log("reinit");
    getUserMedia({ video:true,audio: false },function (err,stream)
    {
      if (err) return console.error(err);


        socket.emit("ready");
        console.log("ready to go");

        var peer = null;
        var user;
        socket.on('init',function(initiator) {

            console.log("init peer",initiator);
            peer = new Peer({
              initiator: initiator,
              trickle: false,
              stream: stream
            });

            // Start usercam
            var video = document.createElement('video');
            document.getElementsByClassName('you')[0].appendChild(video);
            yourStream = stream;
            video.src = window.URL.createObjectURL(stream);
            video.play();


            user = (initiator===true)? 'user1' : 'user2';

            peer.on('signal', function (data) {
              console.log("recived your("+user+") signal",data);
              socket.emit("sendSignal",JSON.stringify(data));
            });
            peer.on('connect', function () {
              peer.send("hello world");
            });
/*
            socket.on('cancelCall',function(sig) {
              console.log("destrop peer");
              peer.destroy();
              peer = null;
              init();
            });*/

            peer.on('close', () => {
              console.log("peer closed");
              peer.destroy();
              peer = null;
              init();
            });
            socket.on('reciveSignal',function(sig) {
              var other = (user==='user1')? 'user2' : 'user1';
              console.log("Connect to "+other,sig);
              peer.signal(sig);
              if(user==='user1'){
                console.log("Försöker skicka..");

                setTimeout(function(){
                  readyToSend=true;

                },200);
              }
            });

            peer.on('data', function (data) {
              console.log(data);
            });

            peer.on('stream', function (stream) {
              document.getElementsByClassName('display')[0].className = "display active";

              ///
              var video = document.createElement('video');
              document.getElementsByClassName('screenContainer')[0].appendChild(video);

              document.getElementsByClassName('status')[0].innerHTML='Samtal startat';
              video.src = window.URL.createObjectURL(stream);
              video.play();

            });
        });




      });

  };
  init();
  });
}else{
  alert('NOou :(');
}
