"use strict"
/* Module de recherche dans une base de recettes de cuisine */
var fs = require('fs');

// Charger les recettes au format json.
var entries = JSON.parse(fs.readFileSync('data.json').toString());

// Construction d'un index pour la recherche. C'est un dictionnaire associant chaque mot à la liste des identifiants de recettes qui le contiennent.
var index = {};

// mots à supprimer de la requête
var stopwords = {'de': 1, 'à': 1, 'la': 1, 'le': 1, "d'": 1, "l'": 1, 'du': 1, 'au': 1, 'en': 1, 'et': 1, 'aux': 1};

// Fonction qui normalise un texte, le divise en mots et supprime les mots indésirables.
function tokenize(text) {
  var tokens = [];
  for(var word of text.trim().toLowerCase().replace("'", "' ").replace('-', ' ').split(/\s+/)) {
    if(!(word in stopwords)) {
      tokens.push(word.replace(/s$/, ''));
    }
  }
  return tokens;
}

// Ajouter les mots d'un texte à l'index de recherche, associés avec un identifiant de recette particulier.
function add_to_index(text, id) {
  for(var word of tokenize(text)) {
    if(!(word in index)) index[word] = [];
    index[word].push(id);
  }
}

// Construire l'index pour la recherche. Cette fonction utilise le titre de la recette ainsi que le nom des ingrédients.
function build_index() {
  var i = 0;
  for(var entry of entries) {
    var text = entry.title;
    for(var ingredient of entry.ingredients) {
      // récupération du nom de l'ingrédient avec une expression régulière 
      var name = ingredient.name.replace(' (facultatif)', '').replace(' ( Comment faire pour... )', '');
      name = name.replace(/(Quelques|un peu +(de|d')|(\d+(\.\d+)?|½|¼) +((g|ml|kgs?( \d+ g)?|l|litres?|pincées?|tranches?|verres?|(petites? )?cuillères?|(petites? )?cuillères? à (soupe|café)) +(de|d'))?)/, '').toLowerCase().trim();
      text += " " + name;
    }
    add_to_index(text, i);
    i++;
  }
}

build_index();

/* Recherche par mots clé: récupération des identifiants de recette dans l'index.
Cette fonction retourne un dictionnaire contenant les champs suivants :
- results: liste de recettes (version courte contenant l'identifiant de la recette, son titre et l'url de son image)
- num_found: le nombre de recettes trouvées
- query: la requête
*/
exports.search = (query) => {
  query = query || "";

  var found = {};

  // pour chaque mot de la requête
  for(var word of tokenize(query)) {
    if(word in index) {
      for(var i of index[word]) {
        if(!(i in found)) found[i] = 0;
        found[i]++; // on ajoute 1 au nombre de mots trouvés dans la recette i
      }
    }
  }
  
  // ordonner les recettes trouvées par nombre de mots de la requête
  var keys = Object.keys(found).sort((a, b) => found[b] - found[a]);

  // construire le tableau de résultats
  var results = [];
  for(var k of keys) {
    results.push({entry: k, title: entries[k].title, img: entries[k].img});
  }

  return {
    results: results,
    num_found: results.length, 
    query: query,
  };
};

/* Recherche renvoyant tous les elements*/
exports.all = () => {
  // ordonner les recettes
  var keys = Object.keys(entries).sort((a, b) => entries[b] - entries[a]);

  // construire le tableau de résultats
  var results = [];
  for(var k of keys) {
    results.push({entry: k, title: entries[k].title, img: entries[k].img});
  }

  return {
    results: results,
    num_found: results.length, 
  };
};

/* Nombre de recettes dans la base */
exports.num_entries = () => entries.length;

/* Contenu d'une recette à partir de son identifiant.
Une recette est un dictionnaire contenant :
- title: son titre
- description: la description textuelle de la recette
- duration: la durée totale de la recette
- img: l'url de son image
- ingredients: une liste d'ingrédients (pour chacun il y a un champ name)
- stages: une liste d'étapes pour la recette (chacune contient un champ description)
 */
exports.get_entry = (id) => {
  if(id >= 0 && id < entries.length) return entries[id];
  return null;
};

/* Obtenir une recette au hasard */
exports.get_random = () => { 
	var rand = Math.floor(Math.random()*Math.floor(entries.length));
	var random_entry = entries[rand];
	random_entry.entry = rand;
	return random_entry; 
}