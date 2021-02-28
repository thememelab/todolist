// Application required modules
const express = require("express");
const app = express();
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const date = require(__dirname + "/date.js")
//const path = require('path');
// const appPort = 3000;
const _ = require('lodash');




// app usgae
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static("public"))
//app.use(express.static(__dirname, 'public'));

// app set view engine
app.set('view engine', 'ejs');

mongoose.connect("mongodb+srv://memeTest:Test1234@cluster0.yeesb.mongodb.net/todolistDB", { useNewUrlParser: true });

const itemsSchema = {
  name: String
}

const Item = mongoose.model("item", itemsSchema);

const item1=  new Item({
  name: "You are a blessed man"
})

const item2 = new Item({
  name: "He is also blessed too"
})

const item3 = new Item({
  name: " <-- This is amazing what you said"
})

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List" , listSchema)
var items = []
let workItems = []
const defaultItems = [ item1, item2, item3 ]
//Application routes
app.get('/', (req,res)=> {
  Item.find({}, function(err, foundItems){
    if(foundItems.length === 0 ){
      Item.insertMany(defaultItems, (err)=> {
        if(err){
          console.log(err)
        }
        else {
          console.log("this was successfull")
        }
      })
      res.redirect("/")
    }
   else {
      let day = date.getDate();
      res.render('list', { allItimes : foundItems, tittleOfList: "Today"});
      console.log("there is already data available")
    }
  })
});

app.post('/',(req, res) => {
  newItem = req.body.newListItem;
  listTittle = req.body.listName;
  const itemdata = new Item({
    name: newItem
  })

  if(listTittle === "Today"){
    itemdata.save();
    res.redirect("/")
  }else {

    List.findOne({name: listTittle}, function( err, foundItems ){
        foundItems.items.push(itemdata);
        foundItems.save();
        res.redirect("/"+listTittle)
      })
   }
});

app.post("/delete", ( req, res ) => {
const deletItem = req.body.deleteItem
const listTittle = req.body.listName
if(listTittle== "Today"){
  Item.deleteOne({ _id:deletItem }, function(err) {
      if (!err) {
            res.redirect("/")
      }
      else {
          console.log(err)
        }
  });
} else{

  List.findOneAndUpdate({name: listTittle}, {$pull : {items:{_id: deletItem }}}, function( err, foundItems ){
      if(!err){
        res.redirect('/' + listTittle)
      }
      else {
        console.log(err)
      }
    });
 }
});

app.get('/:todoRequest', (req, res)=> {
  const requestedTodo = _.capitalize(req.params.todoRequest)
  List.findOne({name: requestedTodo}, function( err, foundItems ){
  if(!err ){
    if(!foundItems){
      const list = List({
      name: requestedTodo,
      items: defaultItems
    });
    list.save();
    res.redirect("/"+requestedTodo)
    //console.log(requestedTodo)
      }
      else {
        res.render('list', { allItimes : foundItems.items, tittleOfList : foundItems.name })
        console.log("Item already exit ")
        }
    }
    })
})


let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}

app.listen(port, ()=> {
  console.log("The application is running")
});
