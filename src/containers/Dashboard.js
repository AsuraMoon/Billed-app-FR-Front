// Import des dépendances et des modules nécessaires
import { formatDate } from '../app/format.js'; // Import de la fonction de formatage de date
import DashboardFormUI from '../views/DashboardFormUI.js'; // Import du composant d'interface utilisateur du formulaire du tableau de bord
import BigBilledIcon from '../assets/svg/big_billed.js'; // Import de l'icône "BigBilledIcon"
import { ROUTES_PATH } from '../constants/routes.js'; // Import du chemin des routes pour la navigation
import USERS_TEST from '../constants/usersTest.js'; // Import de la liste des utilisateurs de test
import Logout from "./Logout.js"; // Import du composant Logout pour la déconnexion

// Fonction pour filtrer les factures en fonction de leur statut
export const filteredBills = (data, status) => {
  return (data && data.length) ?
    data.filter(bill => {
      let selectCondition;

      // Environnement de test avec Jest
      if (typeof jest !== 'undefined') {
        selectCondition = (bill.status === status);
      }
      /* istanbul ignore next */
      else {
        // Environnement de production
        const userEmail = JSON.parse(localStorage.getItem("user")).email;
        selectCondition =
          (bill.status === status) &&
          ![...USERS_TEST, userEmail].includes(bill.email);
      }

      return selectCondition;
    }) : [];
};

// Fonction pour générer le code HTML d'une carte de facture
export const card = (bill) => {
  const firstAndLastNames = bill.email.split('@')[0];
  const firstName = firstAndLastNames.includes('.') ?
    firstAndLastNames.split('.')[0] : '';
  const lastName = firstAndLastNames.includes('.') ?
  firstAndLastNames.split('.')[1] : firstAndLastNames;

  return (`
    <div class='bill-card' id='open-bill${bill.id}' data-testid='open-bill${bill.id}'>
      <div class='bill-card-name-container'>
        <div class='bill-card-name'> ${firstName} ${lastName} </div>
        <span class='bill-card-grey'> ... </span>
      </div>
      <div class='name-price-container'>
        <span> ${bill.name} </span>
        <span> ${bill.amount} € </span>
      </div>
      <div class='date-type-container'>
        <span> ${formatDate(bill.date)} </span>
        <span> ${bill.type} </span>
      </div>
    </div>
  `);
};

// Fonction pour générer le code HTML de toutes les cartes de facture
export const cards = (bills) => {
  return bills && bills.length ? bills.map(bill => card(bill)).join("") : "";
};

// Fonction pour obtenir le statut en fonction de l'index (1: pending, 2: accepted, 3: refused)
export const getStatus = (index) => {
  switch (index) {
    case 1:
      return "pending";
    case 2:
      return "accepted";
    case 3:
      return "refused";
  }
};

// Classe Dashboard
export default class {
  constructor({ document, onNavigate, store, bills, localStorage }) {
    this.document = document; // Stocke l'objet document du navigateur
    this.onNavigate = onNavigate; // Fonction de navigation pour changer de page
    this.store = store; // Le magasin de données (store) pour récupérer les factures
    $('#arrow-icon1').click((e) => this.handleShowTickets(e, bills, 1)); // Ajoute un gestionnaire de clic pour le premier icône "arrow" (flèche) pour afficher les factures de statut "pending"
    $('#arrow-icon2').click((e) => this.handleShowTickets(e, bills, 2)); // Ajoute un gestionnaire de clic pour le deuxième icône "arrow" (flèche) pour afficher les factures de statut "accepted"
    $('#arrow-icon3').click((e) => this.handleShowTickets(e, bills, 3)); // Ajoute un gestionnaire de clic pour le troisième icône "arrow" (flèche) pour afficher les factures de statut "refused"
    new Logout({ localStorage, onNavigate }); // Crée une instance du composant Logout pour gérer la déconnexion
  }

  // Gestionnaire de clic pour l'icône "eye" (oeil) pour afficher une facture en grand
  handleClickIconEye = () => {
    const billUrl = $('#icon-eye-d').attr("data-bill-url"); // Obtient l'URL de la facture à afficher
    const imgWidth = Math.floor($('#modaleFileAdmin1').width() * 0.8); // Calcule la largeur de l'image pour affichage
    $('#modaleFileAdmin1').find(".modal-body").html(`<div style='text-align: center;'><img width=${imgWidth} src=${billUrl} alt="Bill"/></div>`); // Affiche l'image de la facture dans une modale
    if (typeof $('#modaleFileAdmin1').modal === 'function') $('#modaleFileAdmin1').modal('show'); // Affiche la modale
  }

  // Gestionnaire de clic pour éditer une facture
  handleEditTicket(e, bill, bills) {
    if (this.counter === undefined || this.id !== bill.id) this.counter = 0;
    if (this.id === undefined || this.id !== bill.id) this.id = bill.id;
    if (this.counter % 2 === 0) {
      bills.forEach(b => {
        $(`#open-bill${b.id}`).css({ background: '#0D5AE5' }); // Change le fond de chaque carte de facture en bleu
      });
      $(`#open-bill${bill.id}`).css({ background: '#2A2B35' }); // Change le fond de la carte de facture sélectionnée en noir
      $('.dashboard-right-container div').html(DashboardFormUI(bill)); // Remplace le contenu de la partie droite du tableau de bord par le formulaire de la facture sélectionnée
      $('.vertical-navbar').css({ height: '150vh' }); // Ajuste la hauteur de la barre de navigation
      this.counter ++;
    } else {
      $(`#open-bill${bill.id}`).css({ background: '#0D5AE5' }); // Change le fond de la carte de facture sélectionnée en bleu

      $('.dashboard-right-container div').html(`
        <div id="big-billed-icon" data-testid="big-billed-icon"> ${BigBilledIcon} </div>
      `); // Remplace le contenu de la partie droite du tableau de bord par l'icône "BigBilledIcon"
      $('.vertical-navbar').css({ height: '120vh' }); // Ajuste la hauteur de la barre de navigation
      this.counter ++;
    }
    $('#icon-eye-d').click(this.handleClickIconEye); // Ajoute un gestionnaire de clic pour l'icône "eye" (oeil) pour afficher la facture en grand
    $('#btn-accept-bill').click((e) => this.handleAcceptSubmit(e, bill)); // Ajoute un gestionnaire de clic pour le bouton "Accepter" pour soumettre la facture avec le statut "accepted"
    $('#btn-refuse-bill').click((e) => this.handleRefuseSubmit(e, bill)); // Ajoute un gestionnaire de clic pour le bouton "Refuser" pour soumettre la facture avec le statut "refused"
  }

  // Gestionnaire de clic pour soumettre la facture avec le statut "accepted"
  handleAcceptSubmit = (e, bill) => {
    const newBill = {
      ...bill,
      status: 'accepted',
      commentAdmin: $('#commentary2').val() // Récupère le commentaire de l'administrateur pour la facture
    };
    this.updateBill(newBill); // Met à jour la facture avec le nouveau statut et le commentaire de l'administrateur
    this.onNavigate(ROUTES_PATH['Dashboard']); // Navigue vers le tableau de bord
  }

  // Gestionnaire de clic pour soumettre la facture avec le statut "refused"
  handleRefuseSubmit = (e, bill) => {
    const newBill = {
      ...bill,
      status: 'refused',
      commentAdmin: $('#commentary2').val() // Récupère le commentaire de l'administrateur pour la facture
    };
    this.updateBill(newBill); // Met à jour la facture avec le nouveau statut et le commentaire de l'administrateur
    this.onNavigate(ROUTES_PATH['Dashboard']); // Navigue vers le tableau de bord
  }

  // Gestionnaire de clic pour afficher les factures en fonction du statut sélectionné
  handleShowTickets(e, bills, index) {
    if (this.counter === undefined || this.index !== index) this.counter = 0;
    if (this.index === undefined || this.index !== index) this.index = index;
    if (this.counter % 2 === 0) {
      $(`#arrow-icon${this.index}`).css({ transform: 'rotate(0deg)' }); // Fait tourner l'icône "arrow" vers le bas pour montrer les factures
      $(`#status-bills-container${this.index}`).html(cards(filteredBills(bills, getStatus(this.index)))); // Affiche les cartes de facture filtrées en fonction du statut sélectionné
      this.counter ++;
    } else {
      $(`#arrow-icon${this.index}`).css({ transform: 'rotate(90deg)' }); // Fait tourner l'icône "arrow" vers la droite pour masquer les factures
      $(`#status-bills-container${this.index}`).html(""); // Efface le contenu du conteneur des factures
      this.counter ++;
    }

    bills.forEach(bill => {
      $(`#open-bill${bill.id}`).off().on().click((e) => this.handleEditTicket(e, bill, bills)); // Ajoute un gestionnaire de clic pour chaque carte de facture pour édition
    });

    return bills;
  }

  // Fonction pour récupérer toutes les factures de tous les utilisateurs
  getBillsAllUsers = () => {
    if (this.store) {
      return this.store
        .bills()
        .list()
        .then(snapshot => {
          const bills = snapshot
            .map(doc => ({
              id: doc.id,
              ...doc,
              date: doc.date,
              status: doc.status
            }));
          return bills; // Retourne la liste de toutes les factures avec leurs informations
        })
        .catch(error => {
          throw error;
        });
    }
  }

  // Fonction pour mettre à jour une facture (non testée)
  /* istanbul ignore next */
  updateBill = (bill) => {
    if (this.store) {
      return this.store
        .bills()
        .update({ data: JSON.stringify(bill), selector: bill.id })
        .then(bill => bill)
        .catch(console.log);
    }
  }
}
