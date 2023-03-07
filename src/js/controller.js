import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config';
import recipeView from './views/recipeView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import searchView from './views/searchView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable';  //This is for polyfiling everything
import 'regenerator-runtime/runtime'; //This for polyfiling async/await
import { async } from 'regenerator-runtime';

async function controlRecipes() {

  try {
    const id = window.location.hash.slice(1);  //It will be the hash part of the url excluding the hash symbol by slice method

    if(!id) return;
    recipeView.renderSpinner();

    // Update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage());

    // Update bookmarks view
    bookmarksView.update(model.state.bookmarks)

    // Loading recipe
    await model.loadRecipe(id);

    // Rendering recipe
    recipeView.render(model.state.recipe);

  } catch (err) {
    recipeView.renderError()
  }
}

const controlSearchResults = async function() {
  try {

    resultsView.renderSpinner();

      // Get search query
      const query = searchView.getQuery();
      if(!query) return;

      // Load search results
      await model.loadSearchResults(query);

      // Render Results
      resultsView.render(model.getSearchResultsPage());

      // Render initial pagination buttons
      paginationView.render(model.state.search);

  } catch(err) {
      console.log(err);
  }
}

const controlPagination = function(goToPage) {
  // Render new Results
  resultsView.render(model.getSearchResultsPage(goToPage));

  // Render new pagination buttons
  paginationView.render(model.state.search);
}

const controlServings = function(newServings) {
  // Update the recipe servings (in state)
  model.updateServings(newServings);

  // Update the recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
}

const controlAddBookmark = function() {
  // 1) Add/remove bookmark
  if(!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id)

  // 2) Update recipe view
  recipeView.update(model.state.recipe);

  // 3)Render bookmarks
  bookmarksView.render(model.state.bookmarks)
}

const controlBookmarks = function() {
  bookmarksView.render(model.state.bookmarks);
}

const controlAddRecipe = async function(newRecipe) {

  try {

    // Show Loading spinner
    addRecipeView.renderSpinner();

    // Upload new recipe data
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    // Render recipe
    recipeView.render(model.state.recipe);

    // Success message
    addRecipeView.renderMessage();

    // Render bookmark view
    bookmarksView.render(model.state.bookmarks);

    // Change ID in url
    window.history.pushState(null,'',`#${model.state.recipe.id}`); //history API is used to change url without loading the page

    // Close form window
    setTimeout(function() {
      addRecipeView.toggleWindow();
      addRecipeView.render();
    }, MODAL_CLOSE_SEC * 1000);
  }catch(err) {
    addRecipeView.renderError(err.message);
  }
}

const init = function() {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
} 
init();