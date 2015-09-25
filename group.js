var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var http = require('http').Server(app);
var io = require('socket.io')(http);

var mg = require('mongoose');
mg.connect('mongodb://admin:h32isawesome@ds041432.mongolab.com:41432/checklist');

var Parse = require('parse/node').Parse;

Parse.initialize("EIsRAYWGVu5gaQKeZfivzkcbiNkNm7crTDIhUkIq", "i6cCdNGZIdGOpW0Eti7nymCbeMPUcassOdmEwRak");

// Parse Test Code

// var TestObject = Parse.Object.extend("TestObject");
// var testObject = new TestObject();
// testObject.save({foo: "bar"}).then(function(object) {
//   console.log("yay! it worked");
// });

var Group = mg.model("group", {name:String, users:[String]});


app.use(express.static(__dirname + '/Client'));
app.use(bodyParser.json());

io.on('connection', function(socket){
  console.log('a user connected');
});

//Tell the client to refresh the page
function refreshClients() {
  console.log("refreshing clients");
  io.sockets.emit("refresh");
}

function addList(jsonItem, res) {
  var newList = new List ({name: jsonItem.name, archived: jsonItem.archived, id:jsonItem.id, groceryItems:jsonItem.groceryItems, \
    categories:jsonItem.categories, users:jsonItem.users});
  newList.save(function(err, userObj){
    if(err) console.log(err);
    else {
      console.log("Saved "+userObj);
      res.json(userObj);
      refreshClients();
    }
  });
}

var checkItem= function(id,status,res) {
  Item.findByIdAndUpdate(id,{$set: {checked: status}}, function (err,item) {
    if(err) return console.error(err);
    res.send(item);
    refreshClients();
  });
}; 

var claimItem = function(id,status,name,res) {
  if(status=="true") {
    Item.findByIdAndUpdate(id,{$set: {claimed:status, claimedby:name}}, function (err,item) {
    if(err) return console.error(err);
    res.send(item);
    refreshClients();
    });
  } else {
    Item.findByIdAndUpdate(id,{$set: {claimed:status, claimedby:""}}, function (err,item) {
    if(err) return console.error(err);
    res.send(item);
    refreshClients();
    });
  }
};



app.delete("/itemlist/:id", function(req,res) {
  var id = req.params.id;
  console.log("\nDeleting:" + id);
  Item.remove({_id:id}, function(err) {
    if(err) console.error(err);
    //Sketchy
    else res.send("Removed");
    refreshClients();
  });
});

app.post("/itemcheck/:id/:status", function(req,res) {
  var id = req.params.id;
  var status = req.params.status;
  console.log("\nGot POST request, un/checking item: " + id);
  checkItem(id, status, res);
});

app.post("/itemclaim/:id/:status/:name",function(req,res) {
  var id = req.params.id;
  var status = req.params.status;
  var name = req.params.name;
  console.log("\n Got POST request, un/claiming item: " + id);
  claimItem(id,status,name,res);
});

app.post("/itemlist", function(req, res) {
  console.log("\nGot POST request, adding item");
  console.log(req.body);
  console.log("---------------");
  console.log(req.headers);
  addItem(req.body,res);
});

app.get("/itemlist", function(req, res) {
  console.log("\nGot GET request, returning docs");
  Item.find().sort({time:-1}).exec(function(err, items) {
    if(err) return console.error(err);
    console.log("Current database: " + items);
    res.json(items);
  }
  );  
});

http.listen(3000);
console.log("Server running on port 3000");
//var io = require('socket.io').listen(server);
