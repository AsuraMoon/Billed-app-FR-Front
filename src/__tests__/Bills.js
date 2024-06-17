/**
 * @jest-environment jsdom
 */

// Importation des dépendances et des modules nécessaires pour les tests
import {fireEvent, screen, waitFor} from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import Bills from "../containers/Bills.js";
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js";

import router from "../app/Router.js";

// Suite de tests pour le scénario où un utilisateur est connecté en tant qu'employé
describe("Given I am connected as an employee", () => {
  // Sous-suite de tests pour le scénario où l'utilisateur est sur la page "Bills"
  describe("When I am on Bills Page", () => {
    // Test pour vérifier que l'icône de la facture dans la mise en page verticale est mise en surbrillance
    test("Then bill icon in vertical layout should be highlighted", async () => {
      // On simule que l'utilisateur est connecté en tant qu'employé
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }));

      // On crée un élément div racine et on l'ajoute au corps du document
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);

      // On initialise le router et on navigue vers la page des notes de frais
      router();
      window.onNavigate(ROUTES_PATH.Bills);

      // On attend que l'icône de la facture dans la mise en page verticale soit rendue
      await waitFor(() => screen.getByTestId('icon-window'));
      const windowIcon = screen.getByTestId('icon-window');

      // À faire : écrire l'expression expect pour vérifier que l'icône de la facture est mise en surbrillance
      expect(windowIcon.getAttribute("class")).toMatch(/active-icon/gi);
    });

    // Test pour vérifier que les notes de frais sont triées du plus ancien au plus récent
    test("Then bills should be ordered from earliest to latest", () => {
      // On insère le HTML de la page des notes de frais dans le corps du document
      document.body.innerHTML = BillsUI({ data: bills });

      // On récupère les dates de toutes les notes de frais affichées
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML);

      // Fonction de tri pour ordonner les dates du plus ancien au plus récent
      const antiChrono = (a, b) => { (new Date(a.date) < new Date(b.date)) ? 1 : -1 };
      const datesSorted = [...dates].sort(antiChrono);

      // À faire : écrire l'expression expect pour vérifier que les dates sont triées correctement
      expect(dates).toEqual(datesSorted);
    });
  });

  // Sous-suite de tests pour le scénario où l'utilisateur clique sur "Nouvelle note de frais"
  describe("When I click on new bill", () => {
    test("Then the form to create a new bill appear", async () => {
      // Fonction de navigation fictive pour simuler les changements de page
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      // On simule que l'utilisateur est connecté en tant qu'employé
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem("user", JSON.stringify({
        type: "Employee"
      }));

      // On crée une instance de la classe Bills pour initialiser l'environnement de test
      const billsInit = new Bills({
        document, onNavigate, store: null, localStorage: window.localStorage
      });

      // On insère le HTML de la page des notes de frais dans le corps du document
      document.body.innerHTML = BillsUI({ data: bills });

      // On crée une fonction de clic fictive pour simuler le clic sur le bouton "Nouvelle note de frais"
      const handleClickNewBill = jest.fn(() => billsInit.handleClickNewBill ());
      const btnNewBill = screen.getByTestId("btn-new-bill");
      btnNewBill.addEventListener("click", handleClickNewBill);
      fireEvent.click(btnNewBill);

      // On vérifie que la fonction handleClickNewBill a été appelée lors du clic
      expect(handleClickNewBill).toHaveBeenCalled();

      // On attend que le formulaire pour créer une nouvelle note de frais soit rendu
      await waitFor(() => screen.getByTestId("form-new-bill"));
      expect(screen.getByTestId("form-new-bill")).toBeTruthy();
    });
  });

  // Sous-suite de tests pour le scénario où l'utilisateur clique sur l'icône "Eye" (aperçu)
  describe("When I click on eye icon", () => {
    test("Then a modal must appear", async () => {
      // Fonction de navigation fictive pour simuler les changements de page
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      // On simule que l'utilisateur est connecté en tant qu'employé
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem("user", JSON.stringify({
        type: "Employee"
      }));

      // On crée une instance de la classe Bills pour initialiser l'environnement de test
      const billsInit = new Bills({
        document, onNavigate, store: null, localStorage: window.localStorage
      });

      // On insère le HTML de la page des notes de frais dans le corps du document
      document.body.innerHTML = BillsUI({ data: bills });

      // On crée une fonction de clic fictive pour simuler le clic sur l'icône "Eye"
      const handleClickIconEye = jest.fn((icon) => billsInit.handleClickIconEye(icon));
      const iconEye = screen.getAllByTestId(/icon-eye/);
      const modaleFile = document.getElementById("modaleFile");
      $.fn.modal = jest.fn(() => modaleFile.classList.add("show"));
      iconEye.forEach((icon) => {
        icon.addEventListener("click", handleClickIconEye(icon));
        fireEvent.click(icon);
        expect(handleClickIconEye).toHaveBeenCalled();
      });

      // On vérifie que la fenêtre modale s'affiche en ajoutant la classe "show"
      expect(modaleFile.getAttribute('class')).toMatch(/show/gi);
    });
  });

  // Sous-suite de tests pour le scénario où l'utilisateur navigue vers la page des notes de frais
  describe("When I navigate to Bills", () => {
    test("Then the page show", async () => {
      // Fonction de navigation fictive pour simuler les changements de page
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      // On simule que l'utilisateur est connecté en tant qu'employé
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem("user", JSON.stringify({
        type: "Employee"
      }));

      // On crée une instance de la classe Bills pour initialiser l'environnement de test
      new Bills({
        document, onNavigate, store: null, localStorage: window.localStorage
      });

      // On insère le HTML de la page des notes de frais dans le corps du document
      document.body.innerHTML = BillsUI({ data: bills });

      // On attend que le texte "Mes notes de frais" soit rendu pour vérifier que la page s'affiche correctement
      await waitFor(() => screen.getByText("Mes notes de frais"));
      expect(screen.getByText("Mes notes de frais")).toBeTruthy();
    });
  });

  // Test d'intégration pour le scénario où une erreur se produit lors de l'appel à l'API
  describe("When an error occurs on API", () => {
    beforeEach(() => {
      // On utilise le mock de l'API pour espionner l'appel à la fonction "bills"
      jest.spyOn(mockStore, "bills");

      // On simule que l'utilisateur est connecté en tant qu'employé avec une adresse e-mail fictive
      Object.defineProperty(
          window,
          "localStorage",
          { value: localStorageMock }
      );
      window.localStorage.setItem("user", JSON.stringify({
        type: "Employee",
        email: "a@a"
      }));

      // On crée un élément div racine et on l'ajoute au corps du document
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.appendChild(root);

      // On initialise le router pour simuler la navigation
      router();
    });

    // Test pour vérifier la gestion d'une erreur 404
    test("Then fetches bills from an API and fails with 404 message error", async () => {
      // On simule un rejet de la promesse avec l'erreur "Erreur 404" lors de l'appel à la fonction "list" de l'API
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }
      });

      // On insère le HTML de la page des notes de frais avec le message d'erreur dans le corps du document
      const html = BillsUI({ error: "Erreur 404" });
      document.body.innerHTML = html;

      // On vérifie que le message d'erreur "Erreur 404" est affiché sur la page
      const message = await screen.getByText(/Erreur 404/);
      expect(message).toBeTruthy();
    });

    // Test pour vérifier la gestion d'une erreur 500
    test("Then fetches messages from an API and fails with 500 message error", async () => {
      // On simule un rejet de la promesse avec l'erreur "Erreur 500" lors de l'appel à la fonction "list" de l'API
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }
      });

      // On insère le HTML de la page des notes de frais avec le message d'erreur dans le corps du document
      const html = BillsUI({ error: "Erreur 500" });
      document.body.innerHTML = html;

      // On vérifie que le message d'erreur "Erreur 500" est affiché sur la page
      const message = await screen.getByText(/Erreur 500/);
      expect(message).toBeTruthy();
    });
  });
});
