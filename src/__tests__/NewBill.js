/**
 * @jest-environment jsdom
 */

// Importations nécessaires pour les tests
import { fireEvent, screen } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import mockStore from "../__mocks__/store";
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import { localStorageMock } from "../__mocks__/localStorage.js";
import userEvent from "@testing-library/user-event";
import router from "../app/Router.js";

// On simule le store pour les tests
jest.mock("../app/store", () => mockStore)

// Tests pour la page de création d'une nouvelle facture
describe("Given I am connected as an employee", () => {
  describe("When I submit a new Bill", () => {
    test("Then must save the bill", async () => {
      // On définit une fonction de navigation simulée
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      };

      // On simule le local storage avec un utilisateur connecté en tant qu'employé
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem("user", JSON.stringify({
        type: "Employee"
      }));

      // On rend la page de création de nouvelle facture
      const html = NewBillUI();
      document.body.innerHTML = html;

      // On initialise le composant NewBill pour les tests
      const newBillInit = new NewBill({
        document, onNavigate, store: null, localStorage: window.localStorage
      });

      // On vérifie que le formulaire pour la nouvelle facture est présent
      const formNewBill = screen.getByTestId("form-new-bill");
      expect(formNewBill).toBeTruthy();

      // On simule l'envoi du formulaire en appelant la fonction de soumission
      const handleSubmit = jest.fn((e) => newBillInit.handleSubmit(e));
      formNewBill.addEventListener("submit", handleSubmit);
      fireEvent.submit(formNewBill);
      expect(handleSubmit).toHaveBeenCalled();
    });

    test("Then show the new bill page", async () => {
      // Simule l'affichage de la page de création de facture pour un utilisateur connecté
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);
    })

    test("Then verify the file bill", async () => {
      // On simule l'appel à la méthode 'list' du store
      jest.spyOn(mockStore, "bills");

      // On définit une fonction de navigation simulée
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      };

      // On simule le local storage avec un utilisateur connecté en tant qu'employé
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      Object.defineProperty(window, "location", { value: { hash: ROUTES_PATH['NewBill'] } });
      window.localStorage.setItem("user", JSON.stringify({
        type: "Employee"
      }));

      // On rend la page de création de nouvelle facture
      const html = NewBillUI();
      document.body.innerHTML = html;

      // On initialise le composant NewBill pour les tests
      const newBillInit = new NewBill({
        document, onNavigate, store: mockStore, localStorage: window.localStorage
      });

      // Crée un fichier facture pour le test
      const file = new File(['image'], 'image.png', { type: 'image/png' });
      const handleChangeFile = jest.fn((e) => newBillInit.handleChangeFile(e));
      const formNewBill = screen.getByTestId("form-new-bill");
      const billFile = screen.getByTestId('file');

      // Simule le changement de fichier en déclenchant l'événement 'change'
      billFile.addEventListener("change", handleChangeFile);
      userEvent.upload(billFile, file);

      // Vérifie que le fichier est défini après le changement
      expect(billFile.files[0].name).toBeDefined();
      expect(handleChangeFile).toBeCalled();

      // Simule l'envoi du formulaire en appelant la fonction de soumission
      const handleSubmit = jest.fn((e) => newBillInit.handleSubmit(e));
      formNewBill.addEventListener("submit", handleSubmit);
      fireEvent.submit(formNewBill);
      expect(handleSubmit).toHaveBeenCalled();
    })
  })
})
