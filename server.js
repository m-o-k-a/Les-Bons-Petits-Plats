"use strict"
/* Serveur pour le site de recettes */
var express = require('express');
var mustache = require('mustache-express');

var model = require('./model');
var app = express();

app.engine('html', mustache());
app.set('view engine', 'html');
app.set('views', './views');

/* Retourne une page principale avec le nombre de recettes */
app.get('/', (req, res) => {
  res.render('index', {num_entries: model.num_entries(), random_recipe1: model.get_random(), random_recipe2: model.get_random(), random_recipe3: model.get_random()});
});

/* Retourne les résultats de la recherche à partir de la requête "query" */
app.get('/search', (req, res) => {
  var found = model.search(req.query.query);
  //console.log(found);
  res.render('found', found);
});

/* Retourne les résukltats de toutes les recettes */
app.get('/all', (req, res) => {
  var found = model.all();
  res.render('found', found);
});

/* Retourne le contenu d'une recette d'identifiant "id" */
app.get('/entry/:id', (req, res) => {
  var entry = model.get_entry(req.params.id);
  //console.log(entry);
  res.render('entry', entry);
});

app.listen(3000, () => console.log('listening on http://localhost:3000'));
