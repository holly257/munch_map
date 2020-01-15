"use strict";

const zomatoUrl = 'https://developers.zomato.com/api/v2.1/cities';
const zomatoKey = 'dfcbf4ec3afff8937560994206294706';

const mapBoxKey = 'pk.eyJ1IjoiaG9sbHktMjkzODQ3IiwiYSI6ImNrNTlycHgyZjBlc20zb24zZHhvbGpnaGgifQ.4wuSuhP7Za_lKtKMiGx2lg'
const mapBoxUrl = 'https://api.mapbox.com/geocoding/v5/mapbox.places/'


const states = [ 'AL', 'AK', 'AS', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FM', 'FL', 'GA', 'GU', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MH', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'MP', 'OH', 'OK', 'OR', 'PW', 'PA', 'PR', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VI', 'VA', 'WA', 'WV', 'WI', 'WY' ];
states.forEach(element =>
    $('#js-search-state').append(`<option id='${element}'>${element}</option>`)
)

function formatQueryParams(params) {
  const queryItems = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
  return queryItems.join('&');
}

function getRestaurant(cityGiven, categoryGiven, foodGiven) {
  const params = {
    key: zomatoKey,
    city: cityGiven,
    category: categoryGiven,
    food: foodGiven
  };
  const queryString = formatQueryParams(params)
  const url = zomatoUrl + '?' + queryString;

  console.log(url);

  fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => displayResults(responseJson))
    .catch(err => {
      $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });
}

function watchForm() {
  $('form').submit(event => {
    event.preventDefault();
    const stateGiven = $('#js-search-state').val();
    const cityGiven = $('#js-search-city').val();
    const categoryGiven = $('#js-search-category').val();
    const foodGiven = $('#js-search-food').val();
    	console.log(cityGiven, categoryGiven, foodGiven);
      getRestaurant(cityGiven, categoryGiven, foodGiven);
  });
}



$(watchForm);
