
console.log("--------");
var express = require('express');
var app = express(app)
var bodyParser = require('body-parser');
var http = require('http').Server(app);
var io = require('socket.io')(http);

var cookieParser = require('cookie-parser')


console.log("--------");
var mg = require('mongoose');
mg.connect('mongodb://admin:h32isawesome@ds041432.mongolab.com:41432/checklist');

console.log("--------");
var Parse = require('node-parse-api').Parse;

var parse_app = new Parse({app_id:"vua3eSr4EeCkRRbeWMNHPTHOLFy8KVJQZc4ReKne", api_key:"z2sEm73BnY8e6WCz9eNJswPtNgkp0z7TkVLHtXCy"});

//SCHEMA
var itemSchema = mg.Schema({name:String, category:String, claimed:String,got:Boolean});
var groupSchema = mg.Schema({name:String, users:[String]});

var userSchema = mg.Schema({username:String, nickname:String, lists:[String],groups:[String], id:String});

//MODELS
var Item = mg.model("item", itemSchema);
var Group = mg.model("group", groupSchema);
var User = mg.model("user", userSchema);

var listSchema = mg.Schema({name:String, archived:Boolean, id:String, groceryItems:[Item], categories:[String], users:[String]});
var List = mg.model("list", listSchema);

app.use(express.static(__dirname + '/Client'));
//app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieParser());
console.log("--------");

//Authentication stuff
app.use(function (req, res, next) {
    next();
});


io.on('connection', function(socket){
  console.log('a user connected');
});

//Tell the client to refresh the page
function refreshClients() {
  console.log("refreshing clients");
  io.sockets.emit("refresh");
}

function List (username, nickname, list, groups, id) {
    this.name = name;
    this.archived = archived;
    this.groceryItems = groceryItems;
    this.users = users;
    this.id = id;
    this.addItem = function(groceryItem) {
      this.groceryItems.push(groceryItem);
      this.save(function(err, userObj){
        if(err) console.log(err);
        else {
          console.log("Saved "+userObj);
          res.json(userObj);
          refreshClients();
        }
      });
    }
}

function User (username, nickname, list, groups, id) {
    this.username = username;
    this.nickname = nickname;
    this.list = list;
    this.groups = groups;
    this.id = id;
    this.addList = function(groceryList) {
      this.lists.push(groceryList);
      this.save(function(err, userObj){
        if(err) console.log(err);
        else {
          console.log("Saved "+userObj);
          res.json(userObj);
          refreshClients();
        }
      });
    }
}

userSchema.methods.addList = function(groceryList) {
  this.lists.push(groceryList);
  this.save(function(err, userObj){
    if(err) console.log(err);
    else {
      console.log("Saved "+userObj);
      res.json(userObj);
      refreshClients();
    }
  });
}

userSchema.methods.addGroup = function(groupName) {

  this.lists.push(groceryList);
  this.save(function(err, userObj){
    if(err) console.log(err);
    else {
      console.log("Saved "+userObj);
      res.json(userObj);
      refreshClients();
    }
  });
}

userSchema.methods.getGroups = function(groupName) {
  return this.lists;
}

listSchema.methods.addItem = function(item) {
  this.groceryItems.push(item);
  this.save(function(err, userObj){
    if(err) console.log(err);
    else {
      console.log("Saved "+userObj);
      res.json(userObj);
      refreshClients();
    }
  });
}

userSchema.statics.findByName = function (name, cb) {
  return this.find({ name: new RegExp(name, 'i') }, cb);
}


function addItem(jsonItem, res) {
  var checklistItem = new Item ({time: jsonItem.time, checked: jsonItem.check, name:jsonItem.name, claimed:jsonItem.claim, claimedby:jsonItem.claimby});
  checklistItem.save(function(err, userObj){
    if(err) console.log(err);
    else {
      console.log("Saved "+userObj);
      res.json(userObj);
      refreshClients();
    }
  });
}

function addList(jsonItem, res) {
  var checklistItem = new List ({name:jsonItem.name, archived:false, id:"whatever", groceryItems:[], categories:[], users:[]});
  checklistItem.save(function(err, userObj){
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
  //console.log("\nGot POST request, adding item");
  //console.log(req.body);
  //console.log("---------------");
  //console.log(req.headers);
  addItem(req.body,res);
});

app.get("/itemlist", function(req, res) {
  //console.log("\nGot GET request, returning docs");
  Item.find().sort({time:-1}).exec(function(err, items) {
    if(err) return console.error(err);
    //console.log("Current database: " + items);
    res.json(items);
  });  
});

app.get("/currentUser", function(req, res) {
  //console.log("\nGot GET request, returning docs");
  User.find().sort({time:-1}).exec(function(err, currentUser) {
    if(err) return console.error(err);
    //console.log("Current database: " + items);
    res.json(currentUser);
  });  
});

// <<<<<<< HEAD

// // var currentUser = User.findByName(Parse.User.current().id, function (err, users) {
// //   console.log("animals");
// // });

// app.get("/currentUser", function(req, res) {
//   //console.log("\nGot GET request, returning docs");
//   User.find().sort({time:-1}).exec(function(err, items) {
//     if(err) return console.error(err);
//     //console.log("Current database: " + items);
//     res.json(currentUser);
//   });  
// =======
/*
var currentUser = User.findByName(Parse.User.current().id, function (err, users) {
  console.log("animals");
>>>>>>> 69c5e3fd8033375f558f162f4fab3cc58ffbf460
});

app.get('/', function(req, res){
    User.find({}, function(err, users){
        res.render('all', { users: users, currentUser: currentUser});
    });
});*/


app.post("/register", function(req, res) {
  var form = req.body;
  parse_app.insertUser({
    'email': form.email,
    'username': form.username,
    'password': form.password,
    'nickname': form.nick
  }, function(err, response){
    if(!err){
      if(!req.session) req.session={};
      req.session.token = response.sessionToken;
      res.redirect('/');
    }else{
      console.log(err);
    }
    console.log(response);
  })
});

app.post("/login", function(req, res) {
  var form = req.body;
  parse_app.loginUser(form.username, form.password, function(err, response){
      if(!err){
        console.log(response);
        if(!res.session) res.session={};
        res.session.token = response.sessionToken;
        res.cookie('ehhToken', response.sessionToken);
        console.log(response.sessionToken);
        console.log("cookie: "+req.cookies.ehhToken);
        res.redirect('/');
      } else{
        console.log(err);
      }
  });
});

app.get('/me', function(req, res) {
  parse_app.me(req.cookies.ehhToken, function(err, response){
    if(!err){
      res.json(response);
    } else{
      console.log(err);
      res.send("");
    }
  })
})


http.listen(3000);
console.log("Server running on port 3000");
//var io = require('socket.io').listen(server);
