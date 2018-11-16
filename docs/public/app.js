'use strict'

let socket = io.connect('https://aldunque.github.io/simple-chat-sample:8020')

class SocketTest {
  onPageLoad() {
    // socket.on("news", function(data) {
    //   console.log(data);
    //   socket.emit("other event", { my: "this is the data from client" });
    // });

    socket.on("join room notice", function(data) {
      console.log("data", data, "rooms: ", socket.rooms);
      let joinedRoomText = document.getElementById("joinNotice");
      if (joinedRoomText.innerHTML.indexOf(data.id) !== -1) {
        console.log("already logged on front end");
        return (joinedRoomText.innerHTML += "");
      }
      joinedRoomText.innerHTML += "<div><span>" + data.id + "</span> " + data.notice + " ," + new Date() + "</div>";
    });

    socket.on('private message', function(data) {
      console.log('private message ...', data)
      let privateMessageText = document.getElementById("publicMessage");
      privateMessageText.innerHTML += "<i>You received a private message</i><br/>" + data.sender + ": " + data.message + "<br/>";
    });

    socket.on("send public message", function(data) {
      console.log("public message... from: ", data.id, data);
      let publicMessageText = document.getElementById("publicMessage");
      publicMessageText.innerHTML += data.id + ": " + data.message + "<br/>";
    });

    socket.on("send message test room", function(data) {
      console.log("sending test room message... from: ", data.id, data);
      let testMessageText = document.getElementById("publicMessage");
      testMessageText.innerHTML += '<b>Message to all in test room</b><br/>' + data.id + ": " + data.message + "<br/>";
    });

  }

  onJoinTestRoom() {
    console.log("join button clicked...");
    socket.emit("join test room", {
      id: socket.id
    });

    let sendMessageTestBtn = document.getElementById("sendMessageTestRoom");
    let sendPrivateMessageBtn = document.getElementById("sendPrivateMessageBtn");
    let noticeText = document.getElementById("joinNotice");
    sendMessageTestBtn.classList.remove("hidden");
    sendPrivateMessageBtn.classList.remove("hidden");
    noticeText.classList.add("notice");
  }

  sendMessage() {
    console.log("sending message...");
    let inputValue = document.getElementById("inputText");
    console.log("the input value", inputValue);
    socket.emit("send message", {
      id: socket.id,
      message: inputValue.value
    });
    return inputValue.value = "";
  }

  sendMessageTestRoom() {
    console.log("sending message to test room...")
    let inputValue = document.getElementById("inputText");
    socket.emit("send message test", {
      id: socket.id,
      message: inputValue.value
    });

    return (inputValue.value = "");
  }

  sendPrivateMessage() {
    let recipient = document.getElementById("inputTextName").value;
    let inputValue = document.getElementById("inputText").value;
    if (recipient) {
      socket.emit("send private message", {
        recipient,
        sender: socket.id,
        message: inputValue
      });
    }
  }
}

window.socketTest = new SocketTest;
