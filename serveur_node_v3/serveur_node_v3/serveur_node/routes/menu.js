const { Router } = require('express');
const fs = require("fs");

const menuRoutes = Router();

const americano = fs.readFileSync("./images/americano.jpg").toString('base64');
const chia_pudding = fs.readFileSync("./images/chia_pudding.jpg").toString('base64');
const chicken_feta_wrap = fs.readFileSync("./images/chicken_feta_wrap.jpg").toString('base64');
const comfort_smoothie = fs.readFileSync("./images/comfort_smoothie.jpg").toString('base64');
const croissant = fs.readFileSync("./images/croissant.jpg").toString('base64');
const espresso = fs.readFileSync("./images/espresso.jpg").toString('base64');
const goat_cheese_panini = fs.readFileSync("./images/goat_cheese_panini.jpg").toString('base64');
const green_smoothie = fs.readFileSync("./images/green_smoothie.jpg").toString('base64');
const grilled_cheese = fs.readFileSync("./images/grilled_cheese.jpg").toString('base64');
const latte = fs.readFileSync("./images/latte.jpg").toString('base64');
const market_salad = fs.readFileSync("./images/market_salad.jpg").toString('base64');
const morning_burrito = fs.readFileSync("./images/morning_burrito.jpg").toString('base64');
const overnight_oats = fs.readFileSync("./images/overnight_oats.jpg").toString('base64');
const spinach_salad = fs.readFileSync("./images/spinach_salad.jpg").toString('base64');
const strawberry_banana_smoothie = fs.readFileSync("./images/strawberry_banana_smoothie.jpg").toString('base64');
const tropical_smoothie = fs.readFileSync("./images/tropical_smoothie.jpg").toString('base64');
const vegeterian_wrap = fs.readFileSync("./images/vegeterian_wrap.jpg").toString('base64');

menuRoutes.get('/', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  let cat = [];
  let cat_idx = 0;
  for (let c of Menu) {
    cat.push({ id_cat: cat_idx, nom_cat: c.nom_cat });
    cat_idx = cat_idx + 1;
  }
  res.json(cat);
});

menuRoutes.get('/categorie', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  let { cat_id } = req.query;
  if (cat_id === undefined) {
    res.status(400).send("paramètre manquant");
    return;
  }
  cat_id = Number(cat_id)
  if (isNaN(cat_id)) {
    res.status(400).send("catégorie invalide invalide");
    return;
  }
  if (cat_id < 0 || cat_id >= Menu.length) {
    res.status(400).send("catégorie invalide invalide");
    return;
  }
  let cat = Menu[cat_id]
  let items_cat = []

  for (let item_idx = 0; item_idx < cat.items.length; item_idx++) {
    items_cat.push({
      id_item: item_idx,
      nom_item: cat.items[item_idx].nom_item,
      prix: cat.items[item_idx].prix,
      image: cat.items[item_idx].image
    })
  }
  res.json({
    id_cat: cat_id,
    nom_cat: cat.nom_cat,
    items: items_cat
  });
});

menuRoutes.get('/categorie/item', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  let { cat_id, item_id } = req.query;
  if (cat_id === undefined || item_id === undefined) {
    res.status(400).send("paramètre manquant");
    return;
  }
  cat_id = Number(cat_id)
  item_id = Number(item_id)
  if (isNaN(cat_id) || isNaN(item_id)) {
    res.status(400).send("paramètre invalide");
    return;
  }
  if (cat_id < 0 || cat_id >= Menu.length) {
    res.status(400).send("catégorie id invalide");
    return;
  }
  let cat = Menu[cat_id]
  if (item_id < 0 || item_id >= cat.items.length) {
    res.status(400).send("item id invalide");
    return;
  }
  let item = cat.items[item_id]
  res.json( {
    nom_cat: cat.nom_cat,
    nom_item: item.nom_item,
    prix_item: item.prix,
  });
});
const Menu = [
  {
    nom_cat: "Déjeuner",
    items: [
      {
        nom_item: 'Burrito matin',
        prix: 10.00,
        image: morning_burrito,
      },
      {
        nom_item: 'Croissant',
        prix: 2.50,
        image: croissant,
      },
      {
        nom_item: 'Pouding de chia',
        prix: 7.75,
        image: chia_pudding,
      },
      {
        nom_item: "Overnight à l'avoine",
        prix: 7.50,
        image: overnight_oats,
      },
    ]
  },
  {
    nom_cat: "Sandwichs",
    items: [
      {
        nom_item: 'Grilled Cheese',
        prix: 7.50,
        image: grilled_cheese,
      },
      {
        nom_item: 'Wrap végé',
        prix: 12.00,
        image: vegeterian_wrap,
      },
      {
        nom_item: 'Wrap au poulet-féta',
        prix: 11.50,
        image: chicken_feta_wrap,
      },
      {
        nom_item: 'Panini Chèvre',
        prix: 6.00,
        image: goat_cheese_panini,
      },
    ]
  },
  {
    nom_cat: "Salades",
    items: [
      {
        nom_item: 'Salade épinard',
        prix: 5.00,
        image: spinach_salad,
      },
      {
        nom_item: 'Salade du marché',
        prix: 3.50,
        image: market_salad,
      },
    ]
  },
  {
    nom_cat: "Smoothies",
    items: [
      {
        nom_item: 'Tropical',
        prix: 7.50,
        image: tropical_smoothie,
      },
      {
        nom_item: 'Fraise, banane',
        prix: 7.50,
        image: strawberry_banana_smoothie,
      },
      {
        nom_item: 'Réconfort',
        prix: 8.50,
        image: comfort_smoothie,
      },
      {
        nom_item: 'Vert-grano',
        prix: 9.60,
        image: green_smoothie,
      },
    ]
  },
  {
    nom_cat: "Breuvages",
    items: [
      {
        nom_item: 'Espresso',
        prix: 3.75,
        image: espresso,
      },
      {
        nom_item: 'Latte',
        prix: 4.00,
        image: latte,
      },
      {
        nom_item: 'Americano',
        prix: 3.25,
        image: americano,
      },
    ]
  },
];

//module.exports = menuRoutes;

module.exports = {
  menuRoutes,
};
