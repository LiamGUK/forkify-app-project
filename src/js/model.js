// JS sheet for code to be handled by Model (MVC structure) - handles all data requests in app
import { async } from 'regenerator-runtime';
import { API_URL, RES_PER_PAGE, KEY } from './config.js';
// import { getJSON, sendJSON } from './helpers.js';
import { AJAX } from './helpers.js';

// State object to hold data relevant to recipes, search query's & bookmarks - data storage
export const state = {
  recipe: {},
  search: {
    query: '',
    results: [],
    page: 1,
    resultsPerPage: RES_PER_PAGE
  },
  bookmarks: []
};

const createRecipeObject = function(data) {
  const { recipe } = data.data; // Same as data.data.recipe
  return {
    // Create new property values from response object
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    ...(recipe.key && { key: recipe.key })
  };
};

export const loadRecipe = async function(id) {
  try {
    const data = await AJAX(`${API_URL}${id}?key=${KEY}`);

    state.recipe = createRecipeObject(data);

    // When loading a new recipe and running new data fetch ensures bookmark property added previously is added to new data fetch and doesn't lose bookmark values.
    if (state.bookmarks.some(bookmark => bookmark.id === id)) {
      state.recipe.bookmarked = true;
    } else {
      state.recipe.bookmarked = false;
    }
    // console.log(state.recipe);
  } catch (err) {
    // Temp error handling
    console.error(`${err} 🔴⛔`);
    throw err; // throw error again so that error is handled in catch block in controller.js sheet.
  }
};

export const loadSearchResults = async function(query) {
  try {
    state.search.query = query;
    const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);
    console.log(data);

    state.search.results = data.data.recipes.map(rec => {
      return {
        id: rec.id,
        title: rec.title,
        publisher: rec.publisher,
        image: rec.image_url,
        ...(rec.key && { key: rec.key }) // For recipe uploads - if uploaded recipe will contain a key property of API key, if key property exists need to add to this object too.
      };
    });
    state.search.page = 1; // Reset pagination page tracker back to one when loading new search results to restore pagination state.
    // console.log(state.search.results);
  } catch (err) {
    console.error(`${err} 🔴⛔`);
    throw err; // throw error again so that error is handled in catch block in controller.js sheet.
  }
};

export const getSearchResultsPage = function(page = state.search.page) {
  state.search.page = page; // keeps track of current page in changes to pagination

  const start = (page - 1) * state.search.resultsPerPage; // page 1 - 1 = 0 x 10 = 0, page 2 - 1 = 1 x 10 = 10
  const end = page * state.search.resultsPerPage; // 0 * 10 = 0, 1 * 10 = 10

  return state.search.results.slice(start, end); // Use slice method to create new copy of array as a smaller version based on total number of pages needed.
};

export const updateServings = function(newServings) {
  state.recipe.ingredients.forEach(ing => {
    // newQT = oldQt * newServings / oldServings // 2 * 8 / 4 = 4
    ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
  });

  state.recipe.servings = newServings; // Need to update state object with new values from forEach loop to ensure future calculations to account of changes from state.recipe.servings.
};

const persistBookmarks = function() {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};

export const addBookmark = function(recipe) {
  // Add bookmark of recipe
  state.bookmarks.push(recipe);

  // Mark current recipe as bookmarked
  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true; // Adds new property to state.recipe object to mark a bookmark being added.

  persistBookmarks();
};

export const deleteBookmark = function(id) {
  // Delete bookmark
  const index = state.bookmarks.findIndex(el => el.id === id); // Use findIndex method to match index of id in bookmarks array with passed in id to target in splice method
  state.bookmarks.splice(index, 1); // Splice will use matched index to remove value from bookmarks array permanently.

  // Mark current recipe as NOT bookmarked
  if (id === state.recipe.id) state.recipe.bookmarked = false;

  persistBookmarks();
};

const init = function() {
  const storage = localStorage.getItem('bookmarks');
  if (storage) state.bookmarks = JSON.parse(storage);
};

init();

// For use only during development to instantly remove all bookmarks in localStorage
const clearBookmarks = function() {
  localStorage.clear('bookmarks');
};
// clearBookmarks();

export const uploadRecipe = async function(newRecipe) {
  try {
    const ingredients = Object.entries(newRecipe)
      .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
      .map(ing => {
        const ingArr = ing[1].split(',').map(el => el.trim());
        // const ingArr = ing[1].replaceAll(' ', '').split(',');
        if (ingArr.length !== 3)
          throw new Error('Wrong ingredient format! Please use correct format');

        const [quantity, unit, description] = ingArr;

        return { quantity: quantity ? +quantity : null, unit, description };
      });

    const recipe = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      cooking_time: +newRecipe.cookingTime,
      servings: +newRecipe.servings,
      ingredients
    };

    const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);
    state.recipe = createRecipeObject(data);
    addBookmark(state.recipe); // Call addBookmark method to preserve bookmark state in state object with new recipe object.
  } catch (err) {
    throw err;
  }
};
