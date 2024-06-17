// Import des dépendances et des fonctions utilitaires
import { ROUTES_PATH } from '../constants/routes.js'; // Import du chemin des routes pour la navigation
import { formatDate, formatStatus } from "../app/format.js"; // Import de fonctions utilitaires de formatage
import Logout from "./Logout.js"; // Import du composant Logout pour la déconnexion

export default class {
  constructor({ document, onNavigate, store, localStorage }) {
    // Constructeur de la classe Dashboard
    this.document = document; // Stocke l'objet document du navigateur
    this.onNavigate = onNavigate; // Fonction de navigation pour changer de page
    this.store = store; // Le magasin de données (store) pour récupérer les factures
    const buttonNewBill = document.querySelector(`button[data-testid="btn-new-bill"]`);
    if (buttonNewBill) buttonNewBill.addEventListener('click', this.handleClickNewBill); // Ajoute un gestionnaire de clic pour le bouton de création de facture
    const iconEye = document.querySelectorAll(`div[data-testid="icon-eye"]`);
    if (iconEye) iconEye.forEach(icon => {
      icon.addEventListener('click', () => this.handleClickIconEye(icon));
    }); // Ajoute un gestionnaire de clic pour chaque icône "eye" (oeil) pour afficher une facture en grand
    new Logout({ document, localStorage, onNavigate }); // Crée une instance du composant Logout pour gérer la déconnexion
  }

  handleClickNewBill = () => {
    // Gestionnaire de clic pour le bouton de création de facture
    this.onNavigate(ROUTES_PATH['NewBill']); // Navigue vers la page de création de facture
  }

  handleClickIconEye = (icon) => {
    // Gestionnaire de clic pour les icônes "eye" (oeil) pour afficher une facture en grand
    const billUrl = icon.getAttribute("data-bill-url"); // Obtient l'URL de la facture à afficher
    const imgWidth = Math.floor($('#modaleFile').width() * 0.5); // Calcule la largeur de l'image pour affichage
    $('#modaleFile').find(".modal-body").html(`<div style='text-align: center;' class="bill-proof-container"><img width=${imgWidth} src=${billUrl} alt="Bill" /></div>`); // Affiche l'image de la facture dans une modale
    $('#modaleFile').modal('show'); // Affiche la modale
  }

  getBills = () => {
    // Fonction pour récupérer la liste des factures
    if (this.store) {
      return this.store
        .bills()
        .list()
        .then(snapshot => {
          // Récupère la liste des factures à partir du store et formate les données
          const bills = snapshot
            .sort(function (a, b) { return new Date(b.date) - new Date(a.date); }) // Trie les factures par date décroissante
            .map(doc => {
              try {
                return {
                  ...doc,
                  date: formatDate(doc.date), // Formate la date de la facture
                  status: formatStatus(doc.status) // Formate le statut de la facture
                }
              } catch(e) {
                // Si une erreur se produit lors du formatage, on utilise les données non formatées
                return {
                  ...doc,
                  date: doc.date,
                  status: formatStatus(doc.status)
                }
              }
            });
          return bills; // Retourne la liste des factures formatées
        });
    }
  }
}
