//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _= require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.set('strictQuery', true)
main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb+srv://harshsaini:Welcome123@cluster0.wbvnyoa.mongodb.net/todolistDB');
}

app.get('/:customListName', function (req, res) {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name: customListName}, function(err, results){
if(!err){
if(results){
  //SHOW RESULT AS ITEMS EXISTS
  res.render("list", {listTitle: results.name, newListItems: results.items })
}
else{
  //ITEM DON'T EXIST TO ADD IT TO THE LIST
  const list = new List({
    name: customListName,
    items: defaultItems
  });
  list.save();
  res.redirect("/" + customListName)
}
}
});


});

app.get("/", function(req, res) {

  Item.find((err, items) => {
    // mongoose.connection.close(function() {
    //   process.exit(0);
    // });
    if(items.length === 0){
      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err)
        }
        else{
          defaultItems.forEach(function(item){ console.log(item.name)  });
        }
      })
      res.redirect("/")
    }
  //   if (err) {
  //     console.log(err);
  //   }
    else {
          res.render("list", {listTitle: "Today", newListItems: items });
  }
  })
});


const itemsSchema = new mongoose.Schema({
  name: {
    type: String
  }
})


const Item = new mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Eat food"
});

const item2 = new Item({
  name: "Study"
});

const item3 = new Item({
  name: "Sleep"
});

const defaultItems = [item1, item2, item3]

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema)



// FOR LOGGING ITEMS IN CONSOLE


// FOR DELETING items

// Item.deleteMany({name: "Eat food"}, function(err){
//   if(err){
//     console.log(err);
//
//   }
//   else{
//     console.log("Successfully deleted");
//   }
// })

// POSTING

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

if(listName === "Today"){
  item.save();
  res.redirect("/")
}
else {
  List.findOne({name: listName}, function(err, result){
    result.items.push(item);
    result.save();
    res.redirect("/" + listName)
  })
}

});

app.post("/delete", function(req,res){

  const checkedIdItem = req.body.checkbox;
  const listName = req.body.listName;

if(listName === "Today"){
  Item.findByIdAndRemove(checkedIdItem, function(err){
    if(err){
      console.log(err);
    }
    else{
      console.log("Deleted Successfully");
      res.redirect("/")
    }
  });
}
else{
  List.findOneAndUpdate({name: listName}, {$pull: {items:{_id: checkedIdItem}}}, function(err, result){
    if(!err){
      res.redirect("/"+ listName)
    }
  })
}


});



app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
