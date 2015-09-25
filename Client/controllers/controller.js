(function(){
    var cookies;

    function readCookie(name,c,C,i){
        if(cookies){ return cookies[name]; }

        c = document.cookie.split('; ');
        cookies = {};

        for(i=c.length-1; i>=0; i--){
           C = c[i].split('=');
           cookies[C[0]] = C[1];
        }

        return cookies[name];
    }

    window.readCookie = readCookie; // or expose it however you want
})();

var myApp = angular.module('checklistApp', ['ngRoute']);

myApp.config(function($routeProvider) {
  $routeProvider

    // route for the home page
    .when('/', {
      //templateUrl : 'pages/home.html',
      templateUrl : 'pages/login.html',
      controller  : 'loginController'
    })
    .when('/register', {
      templateUrl : 'pages/register.html',
      controller  : 'loginController'
    })
    .when('/login', {
      templateUrl : 'pages/login.html',
      controller  : 'loginController'
    })
    .when('/all', {
      templateUrl : 'pages/all.html',
      //controller  : 'allListController'
    })
    .when('/groups', {
      templateUrl : 'pages/groups.html',
      //controller  : 'allListController'
    })

    .when('/list', {
      templateUrl : 'pages/list.html',
      //controller  : 'allListController'
    })

    .when('/settings', {
      templateUrl : 'pages/list.html',
      //controller  : 'allListController'
    })

    .otherwise({redirectTo:'/login'});
});

myApp.controller('loginController', function($scope) {
  if(d) $window.location.href="/all";
});


// app.controller('MainController', ['$scope', function($scope) { 
//   $scope.title = 'Top Sellers in Books'; 
// }]);

myApp.controller('AppCtrl', function ($scope, $http) {
  //Initialize item 
  $scope.item = {};
  
  //Initialize socket io 
  var socket = io();
  
  /**
   * Takes a JSON array to be sorted by the field "claimedby",
   * returns a sorted JSON array that clusters items with similar
   * "claimedby" values together
   */
  var arrange = function(jsonArray) {
    //jsonArray.sort(function(a,b){
    //  console.log(a.claimedby);
    //  return a.claimedby == b.claimedby;  
    //});
    //jsonArray.sort(function(a,b){
    //  return a.claimedby.length - b.claimedby.length;
    //});
    //jsonArray.sort(function(a,b){
    //  if(a.claimedby =="" && b.claimedby=="") {
    //    return a.name.length - b.name.length;
    //  } else {
    //    return 0;
    //  }
    //});

    //var seenNames = new Set();
    //for (var i = 0; i < jsonArray.length; i++) {
    //  name = jsonArray[i].claimedby;
    //  if (!seenNames.has(name)) {
    //    seenNames.add(name);
    //  };
    //};   
    /*
    var unclaimedArray = [];
    var claimedArray = [];

    for (var i = 0; i < jsonArray.length; i++) {
      name = jsonArray[i].claimedby;
      if(name=="") {
        unclaimedArray.push(jsonArray[i]); 
      } else {
        claimedArray.push(jsonArray[i]);
      }
    }

    claimedArray.sort(function(a,b) {
      console.log("sorting claimed Array");  
      return a.claimedby > b.claimedby;
    });

    console.log(claimedArray);
  
    return unclaimedArray.concat(claimedArray);
    */
  };

var refresh = function() {
  $http.get('/itemlist').success(function(res) {
    console.log("Refreshing");
    $scope.itemlist = arrange(res);
    
    //console.log(res);

    //Reset values
    $scope.item.name = "";
    $scope.item.check = false;
    $scope.item.claim = false;
    $scope.item.claimby = "";

    

// <<<<<<< HEAD
//     })
//     $http.get('/currentUser').success(function(res) {
//       console.log("Refreshing");
//       $scope.currentUser = arrange(res);
//     }
//   };
  
//   console.log("Checklist app controller started")
//   //Load up the page
//   refresh();
// =======
  })
};

console.log("Checklist app controller started")
//Load up the page
/*
refresh();
>>>>>>> 69c5e3fd8033375f558f162f4fab3cc58ffbf460
 
//Initialize heartbeat, which refreshes the page if the heartbeat has been lost for more than 5 seconds  
var lastHeartbeat=(new Date()).getTime();
//For debugging, print the number of times that refresh has kicked in due to heartbeat timeout
var count = 0;
setInterval(function() {
  currentHeartbeat = (new Date()).getTime();
  console.log("Heartbeat");
  if (currentHeartbeat > (lastHeartbeat + 5000)) {
    document.getElementById('test-counter').innerHTML = count;
    count +=1
    refresh();
  }
  lastHeartbeat = currentHeartbeat;
},1000);*/

socket.on("refresh", function() {
  refresh();
  //Vibrate the device for feedback
  if('vibrate' in navigator) {
    navigator.vibrate(100);      
  };
});


$scope.checkstatus = function (item) {
  //console.log(item.checked);
  return item.checked;
};

$scope.claimed = function (id, status, name) {
  if (status) {
    console.log(id + "has been claimed by:" + name);
    $http.post(/itemclaim/+id+"/"+status+"/"+name).success(function(res){
      //may be unnecessary
      refresh();  
    });
  } else {
    console.log(id + "has been unclaimed by:" + name);
    $http.post(/itemclaim/+id+"/"+status+"/"+name).success(function(res){
      //may be unnecessary
      refresh();  
    });
  }    
};

$scope.checked = function(id,status) {
  console.log(id + "has been set to:" + status);
  //Tell server that status has been changed
  console.log("Telling the server to check: " + id);
  $http.post("/itemcheck/"+id+"/"+status).success(function(res) {
    //may be unnecessary
    refresh();
  });
}

$scope.remove = function(id) {
  console.log("Telling the server to remove: " + id);
  $http.delete("/itemlist/"+id).success(function(res) {
    //may be unnecessary
    refresh();
  });
}

$scope.addItem = function() {
  console.log($scope.item);
  if($scope.item.claim) {$scope.item.claimby=$scope.shopper.name};
  $scope.item.time= (new Date()).getTime();
  $http.post('/itemlist',$scope.item).success(function (res) {
    //console.log(res);
    refresh();
  })
};

// myApp.controller('userController', ['$scope', function($scope) { 
//   $scope.name = currentUser.name; 
// }]);)

$scope.refresh = refresh;
});