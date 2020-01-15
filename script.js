"use strict";

const zomatoUrl = 'https://developers.zomato.com/api/v2.1/';
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
// this functions gets the city id and uses it to get a list of cuisines
function getCityId(responseJson, locationGiven) {
	console.log(responseJson);
	console.log(locationGiven);
	let cityId

	for (let i = 0; i < responseJson.location_suggestions.length; i++){
		if(responseJson.location_suggestions[i].name == locationGiven) {
			console.log("found location");
			console.log(responseJson.location_suggestions[i].id)
			 let cityId = responseJson.location_suggestions[i].id;
			console.log(cityId)

			const newUrl = zomatoUrl + 'cuisines?' + `city_id=${cityId}`;
		  	console.log(newUrl);
			fetch(newUrl, {
				method: 'get',
				headers: {
					'user-key': zomatoKey
				}
			})
			.then(response => {
		      if (response.ok) {
		        return response.json();
		      }
		      throw new Error(response.statusText);
		    })
		    .then(responseJson => console.log(responseJson))
		    .catch(err => {
		      $('#js-error-message').text(`Something went wrong: ${err.message}`);
		    });
		}
	}

	

}
// this functions gets the checks if the users city is there and gets it's id
function getRestaurant(cityGiven, locationGiven) {
	const params = {
    q: cityGiven,
  };
	const queryString = formatQueryParams(params)
  	const url = zomatoUrl + 'cities?' + queryString;
	fetch(url, {
		method: 'get',
		headers: {
			'user-key': zomatoKey
		}
	})
	.then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => getCityId(responseJson, locationGiven))
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
    let locationGiven = `${cityGiven}, ${stateGiven}`;
    	getRestaurant(cityGiven, locationGiven);
  });
}



$(watchForm);
