import View from './View.js';
import icons from 'url:../../img/icons.svg';

class AddRecipeView extends View {
  _parentElement = document.querySelector('.upload');
  _message = 'Recipe was successfully uploaded';
  _window = document.querySelector('.add-recipe-window');
  _overlay = document.querySelector('.overlay');
  _btnOpen = document.querySelector('.nav__btn--add-recipe');
  _btnClose = document.querySelector('.btn--close-modal');

  constructor() {
    // Use constructor method in class to fire class method on page load.
    super(); // need super method here as child class of View - this key word will be set to point to this class instance.
    this._addHandlerShowWindow(); // Will add event listeners for button click after page load
    this._addHandlerHideWindow();
  }

  toggleWindow() {
    this._overlay.classList.toggle('hidden');
    this._window.classList.toggle('hidden');
  }

  _addHandlerShowWindow() {
    this._btnOpen.addEventListener('click', this.toggleWindow.bind(this)); // need to export values using this keyword into another function so that can bind this keyword in callback function of event listener (Will point to object/class rather than element attached to event listener)
  }

  _addHandlerHideWindow() {
    this._btnClose.addEventListener('click', this.toggleWindow.bind(this));
    this._overlay.addEventListener('click', this.toggleWindow.bind(this));
  }

  addHandlerUpload(handler) {
    this._parentElement.addEventListener('submit', function(e) {
      e.preventDefault();
      const dataArr = [...new FormData(this)]; // FormData = constructs key/value pairs of form fields and values - can then be sent via fetch() or XMLHttpRequest.send()- use spread operator to add all values in a new array.

      const data = Object.fromEntries(dataArr); // fromEntries = takes array of data and converts it to an object.
      handler(data);
    });
  }

  _generateMarkup() {}
}

export default new AddRecipeView();
