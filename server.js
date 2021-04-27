'use strict';
require('dotenv').config();
const express = require('express');
const server = express();
const pg = require('pg');
const superagent = require('superagent');
const methodOverride = require('method-override');

server.use(express.urlencoded({ extended: true }));
server.use(methodOverride('_method'));
server.use(express.static('./public'));
server.set('view engine', 'ejs');
const PORT = process.env.PORT;
const DATABASE_URL = process.env.DATABASE_URL;
const client = new pg.Client(process.env.DATABASE_URL);
// const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });


server.get('/' , homePage);
server.get('/allproducts', handleAll);
server.post('/pbp' ,handleSearch);
server.post('/DB',saveToDB);
server.get('/mycard',myCard);
server.post('/details/:id' ,details);
server.put('/details/:id' ,update);


function homePage(req,res){
  res.render('index');
}

function handleSearch (req,res){
  let nameProd = req.body.name;
  let lower = req.body.lower;
  let higher = req.body.higher;
  let URL = `http://makeup-api.herokuapp.com/api/v1/products.json?brand=${nameProd}&price_greater_than=${lower}&price_less_than=${higher}`;
  console.log(URL);
  superagent.get(URL)
    .then(data =>{
      let prodArr = data.body.map(product=>{
        return new Product (product);
      });
      res.render('pbp', {products:prodArr});



    });
}

function handleAll(req,res){
  let URL = 'http://makeup-api.herokuapp.com/api/v1/products.json?brand=maybelline';
  superagent.get(URL)
    .then(data =>{
      let prodArr = data.body.map(product=>{
        return new Product (product);
      });
      res.render('all', {products:prodArr});



    });
}

function saveToDB(req,res){
  let {name,price,image,description}= req.body;
  console.log(req.body);
  let SQL = 'INSERT INTO makeup (name,price,image,description) VALUES ($1,$2,$3,$4)  RETURNING *;';
  let safeValues = [name,price,image,description];
  client.query(SQL,safeValues)
    .then(data =>{
      res.redirect('/mycard');
    });


}

function myCard(req,res){
  let SQL = 'SELECT * FROM makeup;';
  client.query(SQL)
    .then(data=>{
      // console.log(data.rows);
      res.render('card',{ products: data.rows});

    });

}
function details (req,res){
  let id = req.params.id;
  let SQL = 'SELECT * FROM makeup WHERE id =$1;';
  let safeValue = [id];
  client.query(SQL,safeValue)
    .then(data =>{
      res.render(`details`,{products:data.rows});
    });


}
function update(req,res){
  let id = req.params.id;
  let {name,price,image,description}= req.body;
  console.log(hello);

  let SQL = 'UPDATE TABLE makeup SET name=$1,price=$2,image=$3,description=$4 WHERE id=$5;';
  let safeValue = [name,price,image,description,id];
  client.query(SQL,safeValue)
    .then(data =>{
      res.redirect(`/details/${id}`);
    });
}

function Product (data){
  this.name = data.name;
  this.price = data.price;
  this.image = data.image_link;
  this.description = data.description;
}

client.connect()
  .then(()=>{
    server.listen(PORT,()=>{
      console.log(`listining on ${PORT}`);
    });
  });
