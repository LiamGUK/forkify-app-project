import icons from 'url:../../img/icons.svg'; // Parcel 2 - need to import images when adding as src values in JS when using parcel

export default class View {
  _data; // data field added here so fetch response can be shared to all class extension methods.

  // Render method controls new HTML elements being added to page.
  /**
   * Render the received object to DOM
   * @param {Object| Object[]} data The data to be rendered (e.g. recipe)
   * @param {boolean} [render=true] if false, create markup string instead of rendering to DOM
   * @returns {undefined | string} A markup string is returned if render = false
   * @this {Object} View instance
   * @author Liam Groves
   * @todo Finish implementing
   */
  render(data, render = true) {
    if (!data || (Array.isArray(data) && data.length === 0))
      return this.renderError();

    this._data = data; // Object returned from fetch request in model.js sheet and exported in state object (sent from method call in controller.js)

    const markup = this._generateMarkup(); // Fires method to build HTML markup

    if (!render) return markup;

    this._clear(); // Removes all child elements of target parent (removes default message)
    this._parentElement.insertAdjacentHTML('afterbegin', markup); // Adds new HTML markup as child of target parent - fires generateMarkup method from class where method was called from (only renders HTML markup it needs to)
  }

  // Method added in View so accessible in all classes - checks existing HTML markup to look for any changes (if updated then new markup is generated)
  update(data) {
    this._data = data;
    const newMarkup = this._generateMarkup();

    const newDOM = document.createRange().createContextualFragment(newMarkup); // createContextualFragment creates a new virtual DOM object based on string HTML markup passed as argument (newMarkup)

    const newElements = Array.from(newDOM.querySelectorAll('*')); // Use querySelectorAll and target all elements to create list of all DOM elements in newDOM created based on HTML elements called in generateMarkup method.

    const curElements = Array.from(this._parentElement.querySelectorAll('*'));

    newElements.forEach((newEl, i) => {
      const curEl = curElements[i]; // loop against other array containing existing elements from live DOM
      //console.log(curEl, newEl.isEqualNode(curEl)); // isEqualNode = checks if node has the same properties attached to it (returns boolean value)

      // Updates changed text
      if (
        !newEl.isEqualNode(curEl) &&
        newEl.firstChild?.nodeValue.trim() !== ''
      ) {
        curEl.textContent = newEl.textContent;
      }

      // Update changed attributes
      if (!newEl.isEqualNode(curEl)) {
        // console.log(newEl.attributes);
        Array.from(newEl.attributes).forEach(attr =>
          curEl.setAttribute(attr.name, attr.value)
        );
      }
    });
  }

  _clear() {
    this._parentElement.innerHTML = ''; // clear all html in parent to add in HTML markup
  }

  // Function to add loading spinner element to page during fetch request.
  renderSpinner() {
    const markup = `
     <div class="spinner">
       <svg>
          <use href="${icons}#icon-loader"></use>
        </svg>   
    </div> 
  `;
    this._clear(); // clear parent element of HTML elements.
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  renderError(message = this._errorMessage) {
    const markup = `
      <div class="error">
        <div>
          <svg>
            <use href="${icons}#icon-alert-triangle"></use>
          </svg>
        </div>
        <p>${message}</p>
      </div>
    `;
    this._clear(); // clear parent element of HTML elements.
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  renderMessage(message = this._message) {
    const markup = `
      <div class="message">
        <div>
          <svg>
            <use href="${icons}#icon-smile"></use>
          </svg>
        </div>
        <p>${message}</p>
      </div>
    `;
    this._clear(); // clear parent element of HTML elements.
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }
}
