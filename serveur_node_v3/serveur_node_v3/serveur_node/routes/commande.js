const { Router } = require('express');

const commandeRoutes = Router();

commandeRoutes.route('/')
    .post((req, res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        console.log("Créer une commande");
        let commande_info = req.body;
        let { nom, postal, courriel, carte, code, expiration } = req.body;
        console.log(commande_info);

        if (nom === undefined || postal === undefined || courriel === undefined ||
            carte === undefined || code === undefined || expiration === undefined) {
            res.status(400).send("Un ou des paramètres sont manquant");
            return;
        }
        let exp_courriel = new RegExp("^[a-zA-Z0-9\-_]+[a-zA-Z0-9\.\-_]*@[a-zA-Z0-9\-_]+\.[a-zA-Z\.\-_]{1,}[a-zA-Z\-_]+$");
        let exp_credit = new RegExp("^[0-9]{16}$");
        let exp_code = new RegExp("^[0-9]{3}$");
        let exp_postal = new RegExp("^[a-zA-Z0-9]{3}[a-zA-Z0-9]{3}$");
        let exp_expiration = new RegExp("^[0-9]{4}-[0-9]{2}$");

        if (nom.length < 2 || nom.length > 20)
        {
            res.status(400).send("longueur du nom entre 2 et 20 caractères");
            return;
        }
        if (!exp_courriel.test(courriel)) {
            res.status(400).send("respecter le format bod.john@simpson.ttt.com");
            return;
        }
        if (!exp_credit.test(carte)) {
            res.status(400).send("Une carte de crédit à 16 chiffre");
            return;
        }
        if (!exp_code.test(code)) {
            res.status(400).send("code de sécurité à 3 chiffres");
            return;
        }
        if (!exp_postal.test(postal)) {
            res.status(400).send("respecter le format H2J 3Y8");
            return;
        }
        if (!exp_expiration.test(expiration)) {
            res.status(400).send("respecter le format AAAA-MM");
            return;
        }
        res.status(201).send("Commande acceptée");
    })
    .get(async (req, res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        console.log("Obtenir toutes les commande");
        res.status(200).send("Obtenir toutes les commande");

    });

module.exports = commandeRoutes;
