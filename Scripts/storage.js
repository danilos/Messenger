tinyMessenger.webdb.db = null;
tinyMessenger.webdb.initialize = function(size){
    var dbSize = size * 1024 * 1024; // 10MB
    var db = window.openDatabase("tinyMessenger", "1.0", "test db for tinyMessenger", dbSize);
    db.transaction(function(tx) {
    tx.executeSql("CREATE TABLE IF NOT EXISTS undelivered" +
                  "(ID INTEGER PRIMARY KEY ASC, sender TEXT, recepient TEXT, itemtype TEXT, item TEXT, done TEXT, added_on DATETIME)", []);
  });
}

tinyMessenger.webdb.onError = function(tx, e) {
  alert("There has been an error: " + e.message);
}

tinyMessenger.webdb.onSuccess = function(tx, r) {
  tinyMessenger.webdb.getUndeliveredItems(user, loadTodoItems);
}

tinyMessenger.webdb.createUser = function(username) {
  var db = tinyMessenger.webdb.db;
  db.transaction(function(tx) {
    tx.executeSql("CREATE TABLE IF NOT EXISTS " + username +
                  "(ID INTEGER PRIMARY KEY ASC, sender TEXT, itemtype TEXT, item TEXT, done TEXT, added_on DATETIME)", []);
  });
}

tinyMessenger.webdb.storeMessage = function(sender, recepient, message, delivered) {
  var db = tinyMessenger.webdb.db;
  db.transaction(function(tx){
    var addedOn = new Date();
    if (delivered) {
        tx.executeSql("INSERT INTO "+ recepient +"(sender, itemtype, item, done, added_on) VALUES (?,?,?,?,?)",
        [sender, "MESSAGE", message, "TRUE", added_on],
        tinyMessenger.webdb.onSuccess,
        tinyMessenger.webdb.onError);
    }
    else{
        tx.executeSql("INSERT INTO undelivered" +"(sender, itemtype, item, done, added_on) VALUES (?,?,?,?,?)",
        [sender, "MESSAGE", message, "FALSE", added_on],
        tinyMessenger.webdb.onSuccess,
        tinyMessenger.webdb.onError);
    }
  });
}

tinyMessenger.webdb.getUndeliveredItems = function(recepient, renderFunc) {
  var db = tinyMessenger.webdb.db;
  db.transaction(function(tx) {
    tx.executeSql("SELECT * FROM " + recepient + " WHERE done='false' ORDER BY added_on ASC", [], renderFunc,
        tinyMessenger.webdb.onError);
  });
}

tinyMessenger.webdb.setItemDelivered = function(recepient, renderFunc){
    
}

tinyMessenger.webdb.initialize(10);