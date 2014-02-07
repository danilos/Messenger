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

var profileWindowUrl = "/userprofile.html";
var profileWindowWidth = 275;
var profileWindowHeight = 275;

var users = [];
var conversations = [];
var currentConversation = null;

/* personal user preferences */
var timeStamp = true;
var recordTime = true;
var recordUser = true;
var recordDate = true;

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

function processUsersReceived(connectedUsers) {
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

function processMessageReceived(message) {
    //"message:/sender:" + sender + ":/text:" + msg
    var parts = message.split(":/");
    var sender = parts[1].replace("sender:","");
    var txt = parts[2].replace("text:","");
    txt = txt.replace("data:","");
    
    //alert("Message received: " + message);
    var conversation = existsConversation(sender);
    if (!conversation) {
        if(!confirm("Do you accept conversation from: " + sender + "?")) return;
        
        connectUser(sender);
    }
    
    var conversationdiv = document.getElementById("content-" + sender);
    var div = document.createElement("div");
    div.className= "text-left";
    if (timeStamp) {
      var timediv = document.createElement("div");
      timediv.className = "timestamp";
      
      timediv.innerHTML = "";
      if (recordUser) {
        timediv.innerHTML += sender;
      }
      var d = new Date();
      if (recordDate) {
        timediv.innerHTML += " " + d.getFullYear() + "/" + d.getMonth() + "/" + d.getDay();
      }
      if (recordTime) {
        timediv.innerHTML += " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
      }

      div.appendChild(timediv);
    }
    var txtdiv = document.createElement("div");
    txtdiv.className = "content-data";
    txtdiv.innerHTML = txt;
    div.appendChild(txtdiv);
    conversationdiv.appendChild(div);
    conversationdiv.scrollTop = conversationdiv.scrollHeight;
}

function onMessage(e) {
    //child window rejecting message from
    //if (e.origin == domain) {
    //}
    //else {
    //    alert("Child window rejecting message from " + e.origin);
    //}
    if (e.data.startsWith("users:/")) processUsersReceived(e.data);
    else if (e.data.startsWith("message:/")) processMessageReceived(e.data);
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

function updateMessageSent(txt){
    var recipient = currentConversation.user.name;
    var sender = window.name;
    var conversationdiv = document.getElementById("content-" + recipient);
    var div = document.createElement("div");
    div.className= "text-right";
    if (timeStamp) {
      var timediv = document.createElement("div");
      timediv.className = "timestamp";
      
      timediv.innerHTML = "";
      if (recordUser) {
        timediv.innerHTML += sender;
      }
      var d = new Date();
      if (recordDate) {
        timediv.innerHTML += " " + d.getFullYear() + "/" + d.getMonth() + "/" + d.getDay();
      }
      if (recordTime) {
        timediv.innerHTML += " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
      }

      div.appendChild(timediv);
    }
    var txtdiv = document.createElement("div");
    txtdiv.className = "content-data";
    txtdiv.innerHTML = txt;
    div.appendChild(txtdiv);
    conversationdiv.appendChild(div);
    conversationdiv.scrollTop = conversationdiv.scrollHeight;
}

function prepareUpload(file){
    var file = document.getElementById('file').files[0];
    var fileSize = 0;
    if (file.size > 1024 * 1024)
      fileSize = (Math.round(file.size * 100 / (1024 * 1024)) / 100).toString() + 'MB';
    else
      fileSize = (Math.round(file.size * 100 / 1024) / 100).toString() + 'KB';
    document.getElementById('fileName').innerHTML = 'Name: ' + file.name;
    document.getElementById('fileSize').innerHTML = 'Size: ' + fileSize;
    document.getElementById('fileType').innerHTML = 'Type: ' + file.type;
    var messageArea = document.getElementById('messageArea');
    messageArea.innerHTML = "Opening file...";
    var href = "";
    if(file.type.startsWith('image/')){
      href = 'images/image-holder.png';
    }
    else if(file.type.startsWith('audio/') || file.type.startsWith('video/')){
      href = 'images/video-holder.png';
    }
    else if(file.type.startsWith('text/') || file.type.startsWith('application/')){
      href = 'images/file-holder.png';
    }
    else href = 'images/generic-holder.png';
    var source = href;
    
    var txt = "<div id='fileinfo-" + file.name + "' class='fileinfo'>Name: " + file.name + "<br>Size: " + fileSize + "<br>Type: " + file.type + "<br>";
    txt += "<progress class='progress-holder' id='progressBar-" + file.name + "' value='0' max='100'></progress></div>";
    txt +=  "<div id='img-" + file.name + "' class='image-holder'><a href='" + href + "' target='blank'><img src='" + source + "' alt='" + file.name + "'/></a></div>";
    
    // Start reading the file into memory.
    //var reader = new FileReader();
    //reader.onloadend = doUpload;
    //reader.readAsArrayBuffer(fileElem.files[0]);
    return txt;
}

function uploadFile(filename) {
  //code
}

function updateFileSent(filename) {
  //code
}

function embedEmoicons(txt) {
  return txt;
}

function insertSmiley(smiley, alt){
  var txtSmiley = "<img src='" + smiley + "' alt='" + alt + "'>";
  document.getElementById("message").innerHTML += txtSmiley;
}

function insertSmileys(){
  insertSmiley('smileys/15.png', ':)');
}

function sendMessage() {
    
    if (!currentConversation) {
        alert("please select a user to talk to");
        return;
    }
    
    var txt = document.getElementById("message").innerHTML.trim();
    var file = document.getElementById("file");
    var msg="";
    var msgType = "";
    if (!txt) {
        if (!file) return;
        msgType = ":/data:";
        txt += prepareUpload(file);
        //uploadFile(file);
        updateFileSent(file);
        document.getElementById("file")[0]= "";
    } else msgType = ":/text:";;
    
    msg = "message:/sender:" + window.name + ":/recepients:" + currentConversation.user.name + msgType +  embedEmoicons(txt);
    window.opener.postMessage(msg,"*");
    updateMessageSent(txt);
    document.getElementById("message").innerHTML = "";
}

function switchToUser(usr){
    currentConversation = existsConversation(usr);
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

function initProfileWindow(win){
  win.document.getElementById("timeStamp").checked = timeStamp;
  win.document.getElementById("recordTime").checked = recordTime;
  win.document.getElementById("recordDate").checked = recordDate;
  win.document.getElementById("recordUser").checked = recordUser;
}

function saveUserPreferences(){
  timeStamp = win.document.getElementById("timeStamp").checked;
  recordTime = win.document.getElementById("recordTime").checked;
  recordDate = win.document.getElementById("recordDate").checked;
  recordUser = win.document.getElementById("recordUser").checked;
}

function editProfile(){
  
  var pageUrl = location.pathname;
  pageUrl = pageUrl.replace("/clientwindow.html", profileWindowUrl);
  var win = window.open(pageUrl, "Profile " + window.name, "width=275, height=275" +
                                               ", top=" + 50 +
                                               ", left=" + 50);
  //setTimeout(function(win){ initProfileWindow();}, 500);
  initProfileWindow(win);
  var timer = setInterval(checkChild, 500);

  function checkChild() {
      if (win.closed) {
          alert("Child window closed");   
          clearInterval(timer);
      }
  }
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
    label.htmlFor = "radio-" + user;
    label.innerHTML  = user;
    var content = document.createElement("div");
    content.className = "content";
    content.id = "content-" + user;
    
    usertab.appendChild(radio);
    usertab.appendChild(label);
    usertab.appendChild(content);
    
    return usertab;
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
    }
    else {
        usertab = document.getElementById("tab-");
        usertab.id = "tab-" + username;
        var radio = document.getElementById("radio-");
        radio.id = "radio-" + username;
        radio.name = "user-selector";
        var label = document.getElementById("label-");
        label.id = "label-" + username;
        label.htmlFor = "radio-" + username;
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
    var radio = document.getElementById("radio-" + username);
    var label = document.getElementById("label-" + username);
    radio.checked =true;
    label.onclick = function() {switchToUser(username);}
    //radio.onclick = function() {switchToUser(username);}
}

//window.onunload = disconnect();

function  init(){
  // initialize emoicons?????
  //better images or canvas?
    var emoicons = {};
    emoicons[':)'] = 'images/1.png';
    window.addEventListener("message", onMessage, true);
    window.document.title = "Welcome " + window.name;
    var spanEle = document.getElementById("user-name");
    spanEle.innerHTML = " " + window.name;
}

init();