"use strict" //erreurs courantes
const serveur = "http://localhost:4242" // url du serveur backend, requete ajax-

// écouteur d'événement qui attend que le DOM soit chargé
document.addEventListener("DOMContentLoaded", function() {
    // 1. Charger les catégories
    chargerCategories(); // Cette fonction sera appelée quand la page est chargée

    // Ajouter les écouteurs d'événements pour la validation des champs
    initialiserValidation();

    // Ajouter l'écouteur d'événement pour la soumission du formulaire
    document.querySelector("form").addEventListener("submit", function(e) {
        e.preventDefault(); // Empêcher la soumission normale du formulaire
        if (validerFormulaire()) {
            placer_commande_ajax();
        }
    });
    
    // Ajouter l'écouteur d'événement pour l'annulation de la commande
    document.querySelector("input[type='reset']").addEventListener("click", function(e) {
        // Vider les lignes de commande
        document.getElementById("item_commande").innerHTML = "";
        
        // Réinitialiser le sous-total
        document.getElementById("total").textContent = "0.00";
        
        // Effacer les messages d'erreur
        document.querySelectorAll(".erreur").forEach(function(element) {
            element.textContent = "";
        });
    });
});

// Fonction pour charger les catégories dans la liste déroulante
function chargerCategories() {
    // Faire une requête AJAX avec une méthode jQuerry pour obtenir les catégories
    $.ajax({
        url: `${serveur}/cafehomer/menu`,
        method: "GET", //methode HTTP pour récupérer les données serveur
        success: function(categories) { //quand la requête sera réussi
            // Créer la liste déroulante
            let selectCategorie = document.createElement("select"); //élément html 
            selectCategorie.id = "categorie"; // identifiant "categorie"
            
            // Ajouter une option par défaut
            let optionDefaut = document.createElement("option"); //élément "option"
            optionDefaut.textContent = "Choisir une catégorie"; //affiche l'écriture pour option par défaut
            optionDefaut.value = ""; //permet de détecter quand le user n'a pas de choix encore
            selectCategorie.appendChild(optionDefaut); //ajoute l'option à l'élément select
            
            // Ajouter chaque catégorie comme option
            categories.forEach(function(categorie) { //parcourt chque élément du tableau
                let option = document.createElement("option"); //pour chaque categorie, crée un nouveau élément option
                option.value = categorie.id_cat; //valeur de l'option comme id de categorie, renvoyé au serveur
                option.textContent = categorie.nom_cat; //texte affiché comme nom de categorie
                selectCategorie.appendChild(option); //ajoute l'option à l'élément select
            });
            
            // Ajouter la liste déroulante au conteneur
            document.getElementById("menu").appendChild(selectCategorie); //cherche l'élément avec id menu et l'ajoute la liste
            
            // Ajouter un écouteur d'événement pour détecter les changements
            selectCategorie.addEventListener("change", function() { // écouteur d'événement lorsque user change de selection
                let categorieId = this.value; // recupere id de valeur selection
                if (categorieId !== "") { // vérifie si c'est vide pour ne pas charger si c'est option défaut
                    chargerItemsCategorie(categorieId);
                }
            });
        },
        error: function(xhr, status, error) { //si la requete échoue
            console.error("Erreur lors du chargement des catégories:", error); //message d'erreur dans la console
            alert("Erreur lors du chargement des catégories"); //alerte à le user
        }
    });
}

// Fonction pour charger les items d'une catégorie
function chargerItemsCategorie(categorieId) { 
    $.ajax({
        url: `${serveur}/cafehomer/menu/categorie`, //URL qui retourne les items d'une categorie
        method: "GET", //recuperer les données
        data: { cat_id: categorieId }, //paramêtre categorieId
        success: function(donnees) {
            // Vider la liste des items actuelle
            let conteneurItems = document.getElementById("item"); //recupere l'id item
            conteneurItems.innerHTML = ""; //vide le contenu actuel
            
            // Créer une nouvelle liste
            let listeItems = document.createElement("ul");
            
            // Ajouter chaque item à la liste
            donnees.items.forEach(function(item) { //chaque item dans le tableau items renvoyé par le serveur
                let elementLi = document.createElement("li"); //crée un élément de liste 
                
                //élément lien pour cliquer
                let lien = document.createElement("a");
                lien.href = "#";
                lien.dataset.categorieId = categorieId;
                lien.dataset.itemId = item.id_item;
                
                //crée élément image pour l'affichage du l'item
                let image = document.createElement("img");
                image.src = "data:image/png;base64," + item.image;
                
                //élément span pour le texte à coté de l'image
                let span = document.createElement("span");
                span.textContent = `${item.nom_item} - $${item.prix}`;
                
                //ajoute tout
                lien.appendChild(image);
                lien.appendChild(span);
                elementLi.appendChild(lien);
                listeItems.appendChild(elementLi);
                
                // Ajouter un écouteur d'événements pour le clic sur l'item
                lien.addEventListener("click", function(e) {
                    e.preventDefault(); // Empêcher le comportement par défaut du lien
                    ajouterItemCommande(this.dataset.categorieId, this.dataset.itemId);
                });
            });
            
            // Ajouter la liste au conteneur
            conteneurItems.appendChild(listeItems);
        },
        error: function(xhr, status, error) {
            console.error("Erreur lors du chargement des items:", error);
            alert("Erreur lors du chargement des items de la catégorie");
        }
    });
}

// Fonction pour ajouter un item à la commande
function ajouterItemCommande(categorieId, itemId) {
    $.ajax({
        url: `${serveur}/cafehomer/menu/categorie/item`,
        method: "GET", //définit la methode GET et envoie 2 paramêtres
        data: { 
            cat_id: categorieId,
            item_id: itemId
        },
        success: function(item) {
            // Vérifier si l'item est déjà dans la commande
            let itemsCommande = document.querySelectorAll("#item_commande tr");
            let itemExiste = false;
            
            for (let i = 0; i < itemsCommande.length; i++) { // for loop pour tableau de commande
                if (itemsCommande[i].dataset.nomItem === item.nom_item) {
                    itemExiste = true; 
                    break;//Si l'item existe, marque itemExiste comme vrai et sort de la boucle
                }
            }
            
            // Si l'item n'est pas déjà dans la commande, l'ajouter
            if (!itemExiste) {
                let conteneurCommande = document.getElementById("item_commande"); //recupere le conteneur du tableau de commande
                
                let ligne = document.createElement("tr");
                ligne.dataset.nomItem = item.nom_item;
                ligne.dataset.prix = item.prix_item;
                
                // Colonne 1: Nom de l'item avec élément label
                let colNom = document.createElement("td");
                let labelNom = document.createElement("label");
                labelNom.textContent = item.nom_item;
                colNom.appendChild(labelNom); 
                
                // Colonne 2: Quantité
                let colQuantite = document.createElement("td");
                let inputQuantite = document.createElement("input");
                inputQuantite.type = "number";
                inputQuantite.min = "1";
                inputQuantite.max = "99";
                inputQuantite.value = "1";
                inputQuantite.name = item.nom_item;
                // Ajouter un écouteur d'événement pour mettre à jour le prix lors du changement de quantité
                inputQuantite.addEventListener("change", function() {
                    updateItemTotal(ligne, this.value);
                });
                colQuantite.appendChild(inputQuantite);
                
                // Colonne 3: Prix unitaire
                let colPrix = document.createElement("td");
                colPrix.className = "dollar";
                colPrix.textContent = item.prix_item;
                
                // Colonne 4: Prix total
                let colTotal = document.createElement("td");
                colTotal.className = "dollar";
                colTotal.textContent = item.prix_item;

                // Ajout d'une colonne pour supprimer l'item (fonctionnalité bonus)
                let colSupprimer = document.createElement("td");
                let btnSupprimer = document.createElement("button");
                btnSupprimer.textContent = "X";
                btnSupprimer.type = "button";
                btnSupprimer.className = "btn-supprimer";
                btnSupprimer.addEventListener("click", function() {
                    ligne.remove();
                    mettreAJourSousTotal();
                });
                colSupprimer.appendChild(btnSupprimer);
                
                // Ajouter les colonnes à la ligne
                ligne.appendChild(colNom);
                ligne.appendChild(colQuantite);
                ligne.appendChild(colPrix);
                ligne.appendChild(colTotal);
                ligne.appendChild(colSupprimer);

                // Ajouter la ligne au tableau
                conteneurCommande.appendChild(ligne); //ajoute la ligne au complet
                
                // Mettre à jour le sous-total
                mettreAJourSousTotal(); // pour recalculer le total, fonction non défini
            }
        },
        error: function(xhr, status, error) { //si ça Échoue
            console.error("Erreur lors de l'ajout de l'item:", error); //message erreur console
            alert("Erreur lors de l'ajout de l'item à la commande"); // alerte le user
        }
    });
}

// Fonction pour mettre à jour le total d'un item lors du changement de quantité
function updateItemTotal(ligneItem, quantite) {
    let prixUnitaire = parseFloat(ligneItem.dataset.prix);
    let prixTotal = prixUnitaire * quantite;
    
    // Mettre à jour le prix total de l'item
    ligneItem.cells[3].textContent = prixTotal.toFixed(2);
    
    // Mettre à jour le sous-total de la commande
    mettreAJourSousTotal();
}

// Fonction pour mettre à jour le sous-total de la commande
function mettreAJourSousTotal() {
    let itemsCommande = document.querySelectorAll("#item_commande tr");
    let sousTotal = 0;
    
    // Calculer le sous-total
    for (let i = 0; i < itemsCommande.length; i++) {
        let prixTotal = parseFloat(itemsCommande[i].cells[3].textContent);
        sousTotal += prixTotal;
    }
    
    // Mettre à jour l'affichage du sous-total
    document.getElementById("total").textContent = sousTotal.toFixed(2);
}

// Initialisation des validations pour les champs du formulaire
function initialiserValidation() {
    // Validation du nom complet
    let champNom = document.getElementById("nom");
    champNom.addEventListener("input", function() {
        // Validation pour caractères alphanumériques seulement
        if (!/^[a-zA-Z0-9\s]*$/.test(this.value)) {
            document.getElementById("erreur-nom").textContent = "Le nom ne doit contenir que des caractères alphanumériques";
            this.setCustomValidity("Le nom ne doit contenir que des caractères alphanumériques");
        } else {
            document.getElementById("erreur-nom").textContent = "";
            this.setCustomValidity("");
        }
    });
    
    // Validation du code postal
    let champPostal = document.getElementById("postal");
    champPostal.addEventListener("input", function() {
        // Validation pour caractères alphanumériques seulement
        if (!/^[a-zA-Z0-9]*$/.test(this.value)) {
            document.getElementById("erreur-postal").textContent = "Le code postal ne doit contenir que des caractères alphanumériques";
            this.setCustomValidity("Le code postal ne doit contenir que des caractères alphanumériques");
        } else {
            document.getElementById("erreur-postal").textContent = "";
            this.setCustomValidity("");
        }
    });
    
    champPostal.addEventListener("blur", function() {
        // Validation pour format R2R2R2
        if (this.value && !/^[A-Za-z][0-9][A-Za-z][0-9][A-Za-z][0-9]$/.test(this.value)) {
            document.getElementById("erreur-postal").textContent = "Le code postal doit suivre le format R2R2R2";
            this.setCustomValidity("Le code postal doit suivre le format R2R2R2");
        } else {
            document.getElementById("erreur-postal").textContent = "";
            this.setCustomValidity("");
        }
    });
    
    // Validation du courriel (déjà fait par le type="email")
    
    // Validation de la carte de crédit
    let champCarte = document.getElementById("carte");
    champCarte.addEventListener("input", function() {
        // Validation pour chiffres seulement
        if (!/^\d*$/.test(this.value)) {
            document.getElementById("erreur-carte").textContent = "La carte de crédit ne doit contenir que des chiffres";
            this.setCustomValidity("La carte de crédit ne doit contenir que des chiffres");
        } else {
            document.getElementById("erreur-carte").textContent = "";
            this.setCustomValidity("");
        }
    });
    
    champCarte.addEventListener("blur", function() {
        // Validation pour exactement 16 chiffres
        if (this.value && this.value.length !== 16) {
            document.getElementById("erreur-carte").textContent = "La carte de crédit doit contenir exactement 16 chiffres";
            this.setCustomValidity("La carte de crédit doit contenir exactement 16 chiffres");
        } else {
            document.getElementById("erreur-carte").textContent = "";
            this.setCustomValidity("");
        }
    });
    
    // Validation du code de sécurité
    let champCode = document.getElementById("code");
    champCode.addEventListener("input", function() {
        // Validation pour chiffres seulement
        if (!/^\d*$/.test(this.value)) {
            document.getElementById("erreur-code").textContent = "Le code ne doit contenir que des chiffres";
            this.setCustomValidity("Le code ne doit contenir que des chiffres");
        } else {
            document.getElementById("erreur-code").textContent = "";
            this.setCustomValidity("");
        }
    });
}

// Fonction de validation complète du formulaire avant soumission
function validerFormulaire() {
    let formulaireValide = true;
    
    // Validation du nom
    let champNom = document.getElementById("nom");
    if (!champNom.checkValidity()) {
        document.getElementById("erreur-nom").textContent = champNom.validationMessage;
        formulaireValide = false;
    }
    
    // Validation du code postal
    let champPostal = document.getElementById("postal");
    if (!champPostal.checkValidity()) {
        document.getElementById("erreur-postal").textContent = champPostal.validationMessage;
        formulaireValide = false;
    }
    
    // Validation du courriel
    let champCourriel = document.getElementById("courriel");
    if (!champCourriel.checkValidity()) {
        document.getElementById("erreur-courriel").textContent = "Veuillez entrer une adresse courriel valide";
        formulaireValide = false;
    }
    
    // Validation de la carte de crédit
    let champCarte = document.getElementById("carte");
    if (!champCarte.checkValidity()) {
        document.getElementById("erreur-carte").textContent = champCarte.validationMessage;
        formulaireValide = false;
    }
    
    // Validation du code de sécurité
    let champCode = document.getElementById("code");
    if (!champCode.checkValidity()) {
        document.getElementById("erreur-code").textContent = champCode.validationMessage;
        formulaireValide = false;
    }
    
    // Validation de la date d'expiration
    let champExpiration = document.getElementById("expiration");
    if (!champExpiration.checkValidity()) {
        document.getElementById("erreur-expiration").textContent = "Veuillez entrer une date d'expiration valide";
        formulaireValide = false;
    }
    
    // Vérifier si la commande contient au moins un item
    let itemsCommande = document.querySelectorAll("#item_commande tr");
    if (itemsCommande.length === 0) {
        alert("Veuillez ajouter au moins un item à votre commande");
        formulaireValide = false;
    }
    
    return formulaireValide;
}

// Requête AJAX pour transmettre la commande au serveur
function placer_commande_ajax() {
    let commande = $("form").serialize()
    $.ajax({
        url: `${serveur}/cafehomer/commande`,
        method: "post",
        data: commande,
        success: function (resultat, status, xhr) {
            alert(resultat)
        },
        error: function (xhr, status, error) {
            alert(xhr.responseText)
        }
    });
}
