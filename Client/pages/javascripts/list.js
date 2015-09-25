

function List (name) {
    this.name = name;
    this.archived = false;
    this.groceryItems = [];
    this.users = [];
    this.addItem = function(groceryItem) {
      this.groceryItems.push(groceryItem);
    }
}

//var itemSchema = mg.Schema({name:String, category:String, claimed:String, got:Boolean});

function foodItem(name) {
  this.name = name;
  this.category = name;
  this.claimed = "";
  this.got = false;
}

var listofitems = new List("First List");

var main = function() {

  var totalitems = $('.listRow').length;
  var gotitems = $('.gotItem').length;
  var progress = 0;

  if (totalitems != 0) {
    progress = gotitems/totalitems;
  }

  console.log(totalitems);
  console.log(gotitems);

  $(".progress").append("<div class='progress'><div class='progress-bar' role='progressbar' aria-valuenow='" + progress + "' aria-valuemin='0' aria-valuemax='"+ totalitems + "' style='width:" + progress*100 + "%''><span class='sr-only'>70% Complete</span></div></div>");

  /* Push the body and the nav over by 285px over */
  $('.addItem').click(function() {
    var foodname = $(".form-control").val();
    var food = new foodItem(foodname);
    listofitems.addItem(food);
    if (foodname != "") {
      $(".table").append('<tr class="listRow"><td><input type="checkbox" class="claimbox"></td><td><input type="checkbox" class="gotbox"></td><td><div for="{{$index}}" class="checked-{{thisitem.checked}}"><div class="itemname">' + $(".form-control").val() + '</div></div></td><td><button class="btn btn-danger btn-responsive listRow removeItem" ng-click="remove(thisitem._id)">Remove</button></td></tr>');
    }
    $(".form-control").val("");


    $('.menu').animate({
      left: "0px"
    }, 200);

    $('body').animate({
      left: "285px"
    }, 200);
  });

  if($('.claimbox').is(":checked")) {
    $(this).parent().parent().addClass("claimedItem");
  }

   $(".claimbox").click(function() {
    $(this).parent().parent().addClass("claimedItem");
   });

  var elements = document.getElementsByClassName("claimedItem");
  console.log(elements);

  $(".gotbox").click(function() {
    $(this).parent().parent().addClass("gotItem");
  });


$('.removeItem').live('click',function(){console.log($(this).parent().parent().remove())});

  /* Then push them back */
  $('.icon-close').click(function() {
    $('.menu').animate({
      left: "-285px"
    }, 200);

    $('body').animate({
      left: "0px"
    }, 200);
  });
};


$(document).ready(main);