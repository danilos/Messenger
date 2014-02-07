'strict'

if (typeof String.prototype.startsWith != 'function') {
  String.prototype.startsWith = function (str){
    return this.slice(0, str.length) == str;
  };
}

if (typeof String.prototype.endsWith != 'function') {
  String.prototype.endsWith = function (str){
    return this.slice(-str.length) == str;
  };
}

var clientWindowUrl = "/clientwindow.html";
var clientWindowWidth = 275;
var clientWindowHeight = 440;
var windowTopCoord = 0;
var domain = "";

var conversations = [];
var users = [];
var id = 0;

function existsUser(username) {
    if (!users) return null;
    for (var i=0; i<users.length; i++) {
        if (users[i].name === username) {
            return users[i];
        }
    }
    return null;
}

function closeAll(){
    for (var i = 0; i < users.length; i++){
        users[i].window.close();
    }
}

function newUser() {
    var topEdge = window.screenY;
    var rhsEdge = window.screenX + window.outerWidth;
    var user = [];
    
    var username = document.getElementById("username").value;
    
    //this.prompt("Please enter your name", "");
    if (!username) {
        alert("No user name entered, please enter a name for the new user");
        return ;
    }
    
    var user = existsUser(username);
    if (user) {
        if (!user.window.closed){
            user.window.focus();
            return;
        }
        var index = users.indexOf(user);
        users.splice(index,1);
    }
    else {
        user = new Object();
        user.name = username;
    }
    
    //pagelocation = location.href;
    var pageUrl = location.pathname;
    pageUrl = pageUrl.replace("/serverwindow.html", clientWindowUrl);
    
    win = window.open(pageUrl, user.name, "width=275, height=440" +
                                               ", top=" + (topEdge + windowTopCoord + 2) +
                                               ", left=" + (rhsEdge + 2));
    windowTopCoord += 50;
    
    user.window = win;
    user.id = id;
    id++;
    
    users.push(user);
    setTimeout(function(){ broadcastUsers();}, 500);
}

function displayUsers() {
    var usersops = "";
    
    var connectedUsersSelect = document.getElementById("connectedUsers");
    connectedUsersSelect.innerHTML = "";
    
    for (var i=0; i < users.length; i++) {
        var option = document.createElement("option");
        option.text = users[i].name;
        connectedUsersSelect.add(option);
    }
}

function broadcastUsers() {
    var connectedUsers = "users:";
    
    for (var i = 0; i < users.length; i++){
        connectedUsers += "/" + users[i].name;
    }
    for (var i = 0; i < users.length; i++) {
        users[i].window.postMessage(connectedUsers, "*");
    }
}

function storeMessage(sender, recepient, msg, delivered) {
    var time = new Date();
    
}

function broadcastMessage(msg, sender, recepients) {
    sender = sender.replace("sender:","");
    recepients = recepients.replace("recepients:","").split("|");
    
    for (var i=0; i < recepients.length; i++){
        var user = existsUser(recepients[i]);
        if (!user) {
            storeMessage(sender, recepients[i], msg, false);
        }
        else{
            storeMessage(sender, recepients[i], msg, true);
            user.window.postMessage("message:/sender:" + sender + ":/"  + msg, "*");
        }
    }
}

function getSelectedText(elementId) {
    var elt = document.getElementById(elementId);

    if (elt.selectedIndex == -1)
        return null;

    return elt.options[elt.selectedIndex].text;
}

function messageUser() {
    
    var connectedUsers = document.getElementById("connectedUsers");
    if (connectedUsers.length === 0) {
        return;
    }
    
    var msg = prompt("Enter a message: ");
    if (msg === "") {
        return;
    }
    
    msg = "message:/" + msg;
    var usr = connectedUsers.options[connectedUsers.selectedIndex].text;
    
    var user = existsUser(usr);
    user.window.postMessage(msg, "*");
}

function manageConnection(user, command) {
    switch (command){
        case "close":
            user.window.close();
            users.splice(users.indexOf(user),1);
            displayUsers();
            broadcastUsers();
        break;
    }
}

function onMessage(e) {
    //Handle message sent to child window
    /*if (e.origin == domain) {
     *
    }
    else {
        alert("Child window rejecting message from " + e.origin);
    }*/
    var msgparts = e.data.split(":/");
    switch(msgparts[0]){
        case "command":{
            //"command:/user:" + this.name + ":/connection:close"
            var usr = msgparts[1].replace("user:","");
            var user = existsUser(usr);
            var command = msgparts[2];
            if (command.startsWith("connection:")) manageConnection(user, command.replace("connection:",""));
            else alert("invalid command: " + command);
            break;
        }
        case "message":{
            //var msg = "message:/sender:" + window.name + ":/recepients:" + currentConversation.user.name + ":/text:" +  txt;
            var sender = msgparts[1];
            var recepients = msgparts[2];
            var msg = msgparts[3];
            broadcastMessage(msg, sender, recepients);
            break;
        }
        default: alert(e.data);
    }
    
}

window.addEventListener("message", onMessage, true);
