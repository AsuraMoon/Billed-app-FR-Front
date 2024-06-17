// Import des dépendances et des modules nécessaires
import { ROUTES_PATH } from '../constants/routes.js'; // Importer les constantes des routes de l'application
import Logout from "./Logout.js"; // Importer le composant de déconnexion

// Classe NewBill pour gérer la création d'une nouvelle facture
export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document; // Référence à l'objet document du navigateur
    this.onNavigate = onNavigate; // Fonction de navigation entre les pages
    this.store = store; // Magasin de l'application (non utilisé dans ce code)
    this.localStorage = localStorage; // Référence à l'objet localStorage du navigateur
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`); // Sélectionner le formulaire de nouvelle facture
    formNewBill.addEventListener("submit", this.handleSubmit); // Ajouter un écouteur d'événement pour la soumission du formulaire
    const file = this.document.querySelector(`input[data-testid="file"]`); // Sélectionner l'input de type "file" pour le fichier de la facture
    file.addEventListener("change", this.handleChangeFile); // Ajouter un écouteur d'événement pour le changement de fichier
    this.fileUrl = null; // URL du fichier de la facture (initialisée à null)
    this.fileName = null; // Nom du fichier de la facture (initialisé à null)
    this.billId = null; // ID de la facture (initialisé à null)
    new Logout({ document, localStorage: this.localStorage, onNavigate }); // Créer une instance du composant Logout pour gérer la déconnexion
    // (utilise this.localStorage pour transmettre l'objet localStorage à Logout)
  }

  // Fonction pour gérer le changement de fichier de la facture
  handleChangeFile = e => {
    e.preventDefault(); // Empêcher le comportement par défaut du navigateur lors du changement de fichier
    const fileInput = this.document.querySelector(`input[data-testid="file"]`); // Sélectionner l'input de type "file"
    const file = fileInput.files[0]; // Récupérer le fichier sélectionné
    const filePath = e.target.value.split(/\\/g); // Récupérer le chemin du fichier (pour extraire le nom du fichier)
    const fileName = filePath[filePath.length - 1]; // Extraire le nom du fichier à partir du chemin complet
    const allowedExtensions = /(\.png|\.jpg|\.jpeg)$/i; // Expressions régulières pour vérifier les extensions autorisées

    if (!allowedExtensions.exec(fileName)) {
      // Vérifier si l'extension du fichier n'est pas autorisée
      alert("Type de fichier invalide. Seuls les fichiers PNG, JPG et JPEG sont autorisés.");
      fileInput.value = ''; // Effacer le contenu de l'input de type "file"
      return;
    }

    const formData = new FormData(); // Créer un objet FormData pour envoyer le fichier à la sauvegarde
    const email = JSON.parse(this.localStorage.getItem("user")).email; // Récupérer l'adresse e-mail de l'utilisateur connecté à partir de l'objet localStorage
    formData.append("file", file); // Ajouter le fichier au FormData
    formData.append("email", email); // Ajouter l'adresse e-mail de l'utilisateur au FormData

    // Appeler la méthode de création d'une facture dans le magasin pour sauvegarder la facture avec le fichier
    this.store
      .bills()
      .create({
        data: formData, // Les données du FormData qui contiennent le fichier et l'adresse e-mail de l'utilisateur
        headers: {
          noContentType: true, // Indiquer qu'aucun type de contenu n'est spécifié (laisser le navigateur gérer le type de contenu du fichier)
        },
      })
      .then(({ fileUrl, key }) => {
        // Si la création de la facture réussit, la réponse contient l'URL du fichier et l'ID de la facture
        // console.log(fileUrl); // Afficher l'URL du fichier (pour débogage)
        this.billId = key; // Sauvegarder l'ID de la facture pour une utilisation ultérieure
        this.fileUrl = fileUrl; // Sauvegarder l'URL du fichier pour une utilisation ultérieure
        this.fileName = fileName; // Sauvegarder le nom du fichier pour une utilisation ultérieure
      })
      .catch((error) => console.error(error)); // En cas d'erreur, afficher l'erreur dans la console
  }

  // Fonction pour gérer la soumission du formulaire de nouvelle facture
  handleSubmit = e => {
    e.preventDefault(); // Empêcher le comportement par défaut du navigateur lors de la soumission du formulaire
    const email = JSON.parse(this.localStorage.getItem("user")).email; // Récupérer l'adresse e-mail de l'utilisateur connecté à partir de l'objet localStorage
    const bill = {
      email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value, // Récupérer le type de dépense sélectionné dans le formulaire
      name:  e.target.querySelector(`input[data-testid="expense-name"]`).value, // Récupérer le nom de la dépense saisi dans le formulaire
      amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value), // Récupérer le montant de la dépense saisi dans le formulaire (converti en nombre entier)
      date:  e.target.querySelector(`input[data-testid="datepicker"]`).value, // Récupérer la date de la dépense sélectionnée dans le formulaire
      vat: e.target.querySelector(`input[data-testid="vat"]`).value, // Récupérer la TVA de la dépense saisie dans le formulaire
      pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20, // Récupérer le pourcentage de la dépense saisie dans le formulaire (converti en nombre entier, valeur par défaut 20)
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value, // Récupérer le commentaire de la dépense saisi dans le formulaire
      fileUrl: this.fileUrl, // Utiliser l'URL du fichier de la facture sauvegardée (récupérée dans handleChangeFile)
      fileName: this.fileName, // Utiliser le nom du fichier de la facture sauvegardée (récupéré dans handleChangeFile)
      status: 'pending' // Définir le statut de la facture comme "pending" (en attente)
    };
    this.updateBill(bill); // Appeler la fonction pour mettre à jour la facture avec les données fournies
    this.onNavigate(ROUTES_PATH['Bills']); // Naviguer vers la page des factures après la soumission du formulaire
  }
 
  // Fonction pour mettre à jour la facture
  updateBill = (bill) => {
    if (this.store) {
      this.store
      .bills()
      .update({data: JSON.stringify(bill), selector: this.billId}) // Appeler la méthode de mise à jour de la facture dans le magasin avec les données de la facture et l'ID de la facture
      .then(() => {
        this.onNavigate(ROUTES_PATH['Bills']); // Naviguer vers la page des factures après la mise à jour de la facture
      })
      .catch(error => console.error(error)); // En cas d'erreur, afficher l'erreur dans la console
    }
  }
}
