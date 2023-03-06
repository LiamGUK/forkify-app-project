import * as model from './model.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import bookmarksView from './views/bookmarksView.js';
import paginationView from './views/paginationView.js';
import addRecipeView from './views/addRecipeView.js';
import { MODAL_CLOSE_SEC } from './config.js';

import 'core-js/stable';
import { async } from 'regenerator-runtime';

if (module.hot) {
  module.hot.accept();
}

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

const controlRecipes = async function() {
  // Add try catch block to catch errors in async functions
  try {
    const id = window.location.hash.slice(1); // Grabs the string value with # in URL (slice removes # string)

    if (!id) return; // Guard clause = if no id will exit out of function straight away.
    recipeView.renderSpinner(); // Loads loading spinner

    // 0) Update results to view mark selected search result
    resultsView.update(model.getSearchResultsPage());

    // 1) Updating bookmarks view
    bookmarksView.update(model.state.bookmarks);

    // 2) Loading recipe
    await model.loadRecipe(id); // Call function from imported model sheet - async function so will return a promise (need to await function call here).

    // 3) Rendering recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    // console.log(err);
    recipeView.renderError();
  }
};

const controlSearchResults = async function() {
  try {
    resultsView.renderSpinner();
    // console.log(resultsView);

    // 1) Get search query
    const query = searchView.getQuery(); // Method grabs typed in value in search input field and stores to query variable.
    if (!query) return;

    // 2) Load search results
    await model.loadSearchResults(query); // query used in loadSearchResults method to grab relevant data in API call.

    // 3) Render Results
    resultsView.render(model.getSearchResultsPage());

    // 4) Render initial pagination buttons
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function(goToPage) {
  // 1) Render new Results
  resultsView.render(model.getSearchResultsPage(goToPage)); // render method will override existing results as will clear parent children when fired.

  // 2) Render NEW pagination buttons
  paginationView.render(model.state.search);
};

const controlServings = function(newServings) {
  // Update the recipe servings (in state)
  model.updateServings(newServings);

  // Update the recipe view
  // recipeView.render(model.state.recipe); // Fire render method here to update entire HTML markup to include changes in state object.
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function() {
  // 1) Add/Remove bookmark
  if (!model.state.recipe.bookmarked) {
    model.addBookmark(model.state.recipe);
  } else {
    model.deleteBookmark(model.state.recipe.id);
  }

  // 2) Update recipe view
  console.log(model.state.recipe);
  recipeView.update(model.state.recipe); // Re-use update method in recipeView to update only HTML markup that has changed - changes logo image after being bookmarked.

  // 3) Render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function() {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function(newRecipe) {
  try {
    // Show loading spinner
    addRecipeView.renderSpinner();

    // Upload the new recipe data
    await model.uploadRecipe(newRecipe);

    // Render recipe
    recipeView.render(model.state.recipe);

    // Display success message
    addRecipeView.renderMessage();

    // Render bookmark view
    bookmarksView.render(model.state.bookmarks); // Use render method as need to add new HTML elements

    // Change ID in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`); // History API allows to update URL without re-rendering page state - this case will change id in URL without reloading the page.

    // Close form window
    setTimeout(function() {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);

    console.log(model.state.recipe);
  } catch (err) {
    console.log('⛔', err);
    addRecipeView.renderError(err.message);
  }
};

// Function which fires on page load - sets up all event listeners and passes relevant functions to fire on each event handler.
const init = function() {
  // All event listeners controlled in class objects (Views) - event handlers all attached on page load
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults); // Pass in function that handles loading data from GET request so that it attaches to event listener.
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();
