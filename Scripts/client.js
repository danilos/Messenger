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

//Global variables
var domain = "";

var users = [];
var conversations = [];
var currentConversation = null;

function existsUser(username) {
    if (!users) return null;
    for (var i=0; i<users.length; i++) {
        if (users[i].name === username) {
            return users[i];
        }
    }
    return null;
}

function existsConversation(username) {
    if (!conversations) return null;
    for (var i=0; i<conversations.length; i++) {
        if (conversations[i].user.name === username) {
            return conversations[i];
        }
    }
    return null;
}

function processUsers(connectedUsers) {
    var connectedUsers = connectedUsers.replace("users:/", "");
    var usersList = connectedUsers.split("/");
    
    users = [];
    var user;
    for (var i = 0; i < usersList.length; i++) {
        user = new Object();
        user.name = usersList[i];
        users.push(user);
    }
    displayUsers();
}

function processMessage(message) {
    //"message:/sender:" + sender + ":/text:" + msg
    var parts = message.split(":/");
    var sender = parts[1].replace("sender:","");
    var txt = parts[2].replace("text:","");;
    
    //alert("Message received: " + message);
    var conversation = existsConversation(sender);
    if (!conversation) {
        if(!confirm("Do you accept conversation from: " + sender + "?")) return;
        
        connectUser(sender);
    }
    
    var conversationdiv = document.getElementById("content-" + sender);
    var div = document.createElement("div");
    div.innerHTML = txt;
    div.className= "text-left";
    conversationdiv.appendChild(div);
}

function onMessage(e) {
    //child window rejecting message from
    //if (e.origin == domain) {
    //}
    //else {
    //    alert("Child window rejecting message from " + e.origin);
    //}
    if (e.data.startsWith("users:/")) processUsers(e.data);
    else if (e.data.startsWith("message:/")) processMessage(e.data);
    else alert("Malformed message received: " + e.data);
}

function displayUsers() {
    var usersops = "";
    var connectedUsersSelect = document.getElementById("connectedUsers");
    connectedUsersSelect.innerHTML = "";
    
    for (var i=0; i < users.length; i++) {
        if (users[i].name!==window.name) {
            var option = document.createElement("option");
            option.text = users[i].name;
            connectedUsersSelect.add(option);
        }
    }
}

function updateMessageSent(msg){
    var conversationdiv = document.getElementById("content-" + currentConversation.user.name);
    var div = document.createElement("div");
    div.innerHTML = msg;
    div.className= "text-right";
    conversationdiv.appendChild(div);
    document.getElementById("message").value = "";
}

function updateMessageReceived(msg){
    //look at sender
    //find sender's conversation tab
    //update conversation
    
    var conversationdiv = document.getElementById("conversation");
    var div = document.createElement("div");
    div.innerHTML = msg;
    div.className= "text-left";
    conversationdiv.appendChild(div);
}

function sendMessage() {
    
    if (!currentConversation) {
        alert("please select a user to talk to");
        return;
    }
    
    var txt = document.getElementById("message").value;
    if (!txt) {
        return;
    }
    
    var msg = "message:/sender:" + window.name + ":/recepients:" + currentConversation.user.name + ":/text:" +  txt;
    window.opener.postMessage(msg,"*");
    updateMessageSent(txt);
}

function switchToUser(usr){
    currentConversation = usr;
}

function createConnectionTab(user){
    var usertab = document.createElement("div");
    usertab.id = "tab-" + user;
    usertab.className = "tab";
    var radio = document.createElement("input");
    radio.type = "radio";
    radio.id = "radio-" + user;
    radio.name = "user-selector";
    var label = document.createElement("label");
    label.id = "label-" + user;
    label.for = "tab-" + user;
    label.innerHTML  = user;
    var content = document.createElement("div");
    content.className = "content";
    content.id = "content-" + user;
    
    usertab.appendChild(radio);
    usertab.appendChild(label);
    usertab.appendChild(content);
    
    return usertab;
}

function disconnect() {
    
    var msg = "command:/user:" + this.name + ":/connection:close";
    window.opener.postMessage(msg,"*");
}

function connectToUser(){
    
    var username = document.getElementById("connectedUsers").value;
    if (!username) {
        alert("No user selected. Please select a user for connetion.");
        return;
    }
    
    connectUser(username);
}

function connectUser(username){
    
    //if(this.name === user.name) alert("You cannot send messages to yourself.");
    //find out if there was an existinf connection to teh user
    var usertab = null;
    if (currentConversation) {
        
        if (currentConversation.user.name === username) {
            return;
        }
        usertab = document.getElementById("tab-" + username);
        
        if (!usertab) {
            //create tab
            usertab = createConnectionTab(username);
            var parent = document.getElementById("tabs");
            parent.appendChild(usertab);
        }
        var radio = document.getElementById("radio-" + username);
            radio.checked =true;
    }
    else {
        usertab = document.getElementById("tab-");
        usertab.id = "tab-" + username;
        var radio = document.getElementById("radio-");
        radio.id = "radio-" + username;
        radio.name = "user-selector";
        radio.checked =true;
        var label = document.getElementById("label-");
        label.id = "label-" + username;
        label.for = "tab-" + username;
        label.innerHTML  = username;
        var content = document.getElementById("content-");
        content.id =  "content-" + username;
    }

    conversation = existsConversation(username);
    if (!conversation) {
        conversation = new Object();
        conversation.user = existsUser(username);
        conversation.tab = usertab;
        conversations.push(conversation);
    }
    currentConversation = conversation;
}

//window.onunload = disconnect();

function  init(){
    window.addEventListener("message", onMessage, true);
    window.document.title = "Welcome " + window.name;
    var spanEle = document.getElementById("user-name");
    spanEle.innerHTML = " " + window.name;
}

init();