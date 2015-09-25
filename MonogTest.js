var mg = require('mongoose');

mg.connect('mongodb://admin:h32isawesome@ds041432.mongolab.com:41432/checklist');

/**
 * Add an item onto the DB
 */

function addItem(item) {
	
}

var item = mg.model("item", {name: String, checked: Boolean});

var testItem = new item({name : "Apples",checked : false});

testItem.save(function(err,userObj) {
	if (err) {
		console.log(err);
	} else {
		console.log('saved:', userObj);
	}
});