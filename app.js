//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");

const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("");

const itemsSchema=new mongoose.Schema({
  name: String
});

const Item=mongoose.model("item", itemsSchema);

const item1 = new Item({
  name:"Welcome to your todolist!"
});

const item2 = new Item({
  name:"Hit the + button to add a new item."
});
const item3 = new Item({
  name:"<-- Hit this to delete an item."
});

const defaultItems=[item1,item2,item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List=mongoose.model("List",listSchema);

app.get("/", function(req, res) {

  Item.find({}).then(function(FoundItems){

    if(FoundItems.length===0){
      Item.insertMany(defaultItems)
      .then(function () {
        console.log("Successfully saved defult items to DB");
      })
      .catch(function (err) {
        console.log(err);
      });
      res.redirect("/");
    }else{res.render("list", {listTitle: day, newListItems:FoundItems});}
  })
   .catch(function(err){
    console.log(err);
  });

const day = date.getDate();

  

});

app.get("/:customListName", function(req,res){
  const customListName=req.params.customListName;

  List.findOne({ name: customListName})
  .then((foundList) => { 
    if (!foundList) {
      const list=new List({
        name: customListName,
        items: defaultItems
      });
      list.save();
      res.redirect("/"+customListName);
    } else {
      res.render("list",{listTitle:foundList.name, newListItems: foundList.items});
    }
  })
  .catch(function (err) {
    console.log(err);
  });  
});

app.post("/", function(req, res){
  const day = date.getDate();
  const itemName = req.body.newItem;
  const listName= req.body.list;

  const item =new Item({
    name: itemName
  });
  
  if(listName===day){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({ name: listName}).exec(function (err, foundList) {
      foundList.items.push(item);
      res.redirect("/"+listName);
  })
  }  
});


app.post("/delete",function(req,res){
  const checkedItemId=req.body.checkbox;
  Item.findByIdAndRemove(checkedItemId)
  .then(function () {
    console.log("Successfully removed item.");
    res.redirect("/");
  })
  .catch(function (err) {
    console.log(err);
  });
})


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
