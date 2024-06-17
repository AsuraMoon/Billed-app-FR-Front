// Import des dépendances et des modules nécessaires
import { ROUTES_PATH } from '../constants/routes.js'; // Import du chemin des routes pour la navigation

// Variable globale pour stocker la précédente localisation (route) après la connexion
export let PREVIOUS_LOCATION = '';

// Classe Login
export default class Login {
  constructor({ document, localStorage, onNavigate, PREVIOUS_LOCATION, store }) {
    this.document = document; // Stocke l'objet document du navigateur
    this.localStorage = localStorage; // Stocke l'objet localStorage pour gérer les données locales
    this.onNavigate = onNavigate; // Fonction de navigation pour changer de page
    this.PREVIOUS_LOCATION = PREVIOUS_LOCATION; // Stocke la précédente localisation (route) après la connexion
    this.store = store; // Le magasin de données (store) pour les opérations liées à la connexion
    const formEmployee = this.document.querySelector(`form[data-testid="form-employee"]`); // Sélectionne le formulaire pour les employés
    formEmployee.addEventListener("submit", this.handleSubmitEmployee); // Ajoute un gestionnaire de soumission pour le formulaire des employés
    const formAdmin = this.document.querySelector(`form[data-testid="form-admin"]`); // Sélectionne le formulaire pour les administrateurs
    formAdmin.addEventListener("submit", this.handleSubmitAdmin); // Ajoute un gestionnaire de soumission pour le formulaire des administrateurs
  }

  // Gestionnaire de soumission pour le formulaire des employés
  handleSubmitEmployee = e => {
    e.preventDefault(); // Empêche la soumission du formulaire par défaut
    const user = {
      type: "Employee", // Définit le type d'utilisateur comme "Employee"
      email: e.target.querySelector(`input[data-testid="employee-email-input"]`).value, // Récupère l'e-mail saisi dans le champ du formulaire
      password: e.target.querySelector(`input[data-testid="employee-password-input"]`).value, // Récupère le mot de passe saisi dans le champ du formulaire
      status: "connected" // Définit le statut de l'utilisateur comme "connected"
    };
    this.localStorage.setItem("user", JSON.stringify(user)); // Stocke les informations de l'utilisateur (e-mail, mot de passe et statut) dans l'objet localStorage
    this.login(user) // Appelle la fonction login pour tenter de se connecter avec les informations de l'utilisateur
      .catch((err) => this.createUser(user)) // Si la connexion échoue, crée un nouvel utilisateur avec les informations fournies
      .then(() => {
        this.onNavigate(ROUTES_PATH['Bills']); // Navigue vers la page des factures après la connexion réussie
        this.PREVIOUS_LOCATION = ROUTES_PATH['Bills']; // Met à jour la précédente localisation (route) après la connexion
        PREVIOUS_LOCATION = this.PREVIOUS_LOCATION; // Met à jour la variable globale PREVIOUS_LOCATION
        this.document.body.style.backgroundColor = "#fff"; // Change la couleur de fond du corps du document à blanc
      });
  }

  // Gestionnaire de soumission pour le formulaire des administrateurs
  handleSubmitAdmin = e => {
    e.preventDefault(); // Empêche la soumission du formulaire par défaut
    const user = {
      type: "Admin", // Définit le type d'utilisateur comme "Admin"
      email: e.target.querySelector(`input[data-testid="admin-email-input"]`).value, // Récupère l'e-mail saisi dans le champ du formulaire
      password: e.target.querySelector(`input[data-testid="admin-password-input"]`).value, // Récupère le mot de passe saisi dans le champ du formulaire
      status: "connected" // Définit le statut de l'utilisateur comme "connected"
    };
    this.localStorage.setItem("user", JSON.stringify(user)); // Stocke les informations de l'utilisateur (e-mail, mot de passe et statut) dans l'objet localStorage
    this.login(user) // Appelle la fonction login pour tenter de se connecter avec les informations de l'utilisateur
      .catch((err) => this.createUser(user)) // Si la connexion échoue, crée un nouvel utilisateur avec les informations fournies
      .then(() => {
        this.onNavigate(ROUTES_PATH['Dashboard']); // Navigue vers le tableau de bord après la connexion réussie
        this.PREVIOUS_LOCATION = ROUTES_PATH['Dashboard']; // Met à jour la précédente localisation (route) après la connexion
        PREVIOUS_LOCATION = this.PREVIOUS_LOCATION; // Met à jour la variable globale PREVIOUS_LOCATION
        document.body.style.backgroundColor = "#fff"; // Change la couleur de fond du corps du document à blanc
      });
  }

  // Fonction pour se connecter à l'aide des informations d'utilisateur (non testée)
  /* istanbul ignore next */
  login = (user) => {
    if (this.store) {
      return this.store
        .login(JSON.stringify({
          email: user.email,
          password: user.password,
        })).then(({ jwt }) => {
          localStorage.setItem('jwt', jwt); // Stocke le jeton d'authentification (JWT) dans l'objet localStorage
        });
    } else {
      return null;
    }
  }

  // Fonction pour créer un nouvel utilisateur (non testée)
  /* istanbul ignore next */
  createUser = (user) => {
    if (this.store) {
      return this.store
        .users()
        .create({ data: JSON.stringify({
          type: user.type,
          name: user.email.split('@')[0],
          email: user.email,
          password: user.password,
        })})
        .then(() => {
          //console.log(`User with ${user.email} is created`);
          return this.login(user); // Connecte automatiquement l'utilisateur après sa création
        });
    } else {
      return null;
    }
  }
}
