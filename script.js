"use strict";

const zomatoUrl = 'https://developers.zomato.com/api/v2.1/';
const zomatoKey = 'dfcbf4ec3afff8937560994206294706';
const mapBoxKey = 'pk.eyJ1IjoiaG9sbHktMjkzODQ3IiwiYSI6ImNrNTlycHgyZjBlc20zb24zZHhvbGpnaGgifQ.4wuSuhP7Za_lKtKMiGx2lg'
const mapBoxUrl = 'https://api.mapbox.com/geocoding/v5/mapbox.places/'
const states = [ 'AL', 'AK', 'AS', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FM', 'FL', 'GA', 'GU', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MH', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'MP', 'OH', 'OK', 'OR', 'PW', 'PA', 'PR', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VI', 'VA', 'WA', 'WV', 'WI', 'WY' ];

let error = true;
let lat = 0;
let lon = 0;
let localMarker = [];
let newStr = "";

$('#start-app').on('click', function(){
	$('#first-page').hide();
	$('#results').hide();
	$('#second-page').show();
})

$('#info-button').on('click', function(){
	$('.info').show();
})

$('#new-search-button').on('click', function(){
	$('#first-page').hide();
	$('#results').hide();
	$('#second-page').show();
	$('#js-search-state').val("AL");
	$('#js-search-city').val("");
	$('#js-search-category').val("");
})

states.forEach(element =>
    $('#js-search-state').append(`<option id='${element}'>${element}</option>`)
)

function formatQueryParams(params) {
  const queryItems = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
  return queryItems.join('&');
}

function displayResults(responseJson) {
	error = true;
	$("#js-error-message").empty();
	$("#js-error-message").addClass("hidden");
	$("#results-list").empty();
	$("#results").removeClass("hidden");
	$('#results').show();
	$('#second-page').hide();
	localMarker = [];
	for( let i = 0; i < responseJson.restaurants.length; i++) {
		let restauPath = responseJson.restaurants[i].restaurant;
		$("#results-list").append(
		`<br>
		<li>Restaurant: ${restauPath.name} | Rating: ${restauPath.user_rating.rating_text} (${restauPath.user_rating.aggregate_rating})</li>
		<li><a href="${restauPath.url}" target="_blank">Website</a> | <a href="${restauPath.menu_url}" target="_blank">MENU</a></li>
		<li>Address: ${restauPath.location.address}</li>
		<li>Type of Cuisine(s): ${restauPath.cuisines}</li>
		<li>Hours: ${restauPath.timings}</li>
		<br>`
		);

		localMarker.push(
			{ 
			type: 'Feature',
			geometry: { 
				type: 'Point', 
				coordinates: [restauPath.location.longitude, restauPath.location.latitude] 
				},
			id: restauPath.name
			},
		);
	}

	showMap();
}


let map = {};


function showMap(){
	mapboxgl.accessToken = 'pk.eyJ1IjoiaG9sbHktMjkzODQ3IiwiYSI6ImNrNTlybDc0YTEydnIzZ3A3bHc5eHZwaWgifQ.7B75rcVKQJASnlD_-yIDkQ';
	map = new mapboxgl.Map({
	  container: 'map',
	  style: 'mapbox://styles/mapbox/streets-v11',
	  center: localMarker[0].geometry.coordinates,
	  zoom: 10
	});
  
	map.addControl(new mapboxgl.NavigationControl());
	localMarker.forEach(marker => {
		// new mapboxgl.Marker().setLngLat(marker.geometry.coordinates).addTo(map);
	 new mapboxgl.Popup({ closeOnClick: false }).setLngLat(marker.geometry.coordinates).setHTML(`<p>${marker.id}</p>`).addTo(map);
	
		

	})
}

function getRestaurantList(cityId, cuisineId) {f
	
	const newUrl = zomatoUrl + 'search?' + `entity_id=${cityId}&entity_type=city&cuisines=${cuisineId}&start=5&count=15`;

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
		.then(responseJson => displayResults(responseJson))
		.catch(err => {
			$("#js-error-message").removeClass("hidden");
			$('#js-error-message').text(`Something went wrong: ${err.message}`);
		});
}

function getCuisineId(responseJson, cityId) {
	let categoryGiven = $('#js-search-category').val();
	formatEntry(categoryGiven);
	categoryGiven = newStr;
	
	if(categoryGiven === "" || categoryGiven === "all" || categoryGiven === "All") {
		categoryGiven = "all";
		getRestaurantList(cityId, categoryGiven)
	} else {
		
		
		
		
		const cuisineChoice = responseJson.cuisines.find(cuisine => cuisine.cuisine.cuisine_name === categoryGiven);
		
		if(cuisineChoice){
			getRestaurantList(cityId, cuisineChoice.cuisine.cuisine_id);

		}else{
			$("#js-error-message").removeClass("hidden");
			$('#js-error-message').text(`Invalid cuisine! Try again or leave it blank to get a list of cuisines.`);
		}


		// for (let i = 0; i < responseJson.cuisines.length; i++){
			
		// 	if(responseJson.cuisines[i].cuisine.cuisine_name === categoryGiven) {
		// 		let cuisineId = responseJson.cuisines[i].cuisine.cuisine_id;
		// 		error = true;
		// 		getRestaurantList(cityId, cuisineId);
				
		// 	} else {
		// 			if(error == false) {
		// 				$("#js-error-message").removeClass("hidden");
		// 				$('#js-error-message').text(`Invalid cuisine! Try again or leave it blank to get a list of cuisines.`);
		// 			}	
		// 	}
			
			//		}
		
	} 
}

function getCuisineList(responseJson, locationGiven) {
	for (let i = 0; i < responseJson.location_suggestions.length; i++){
		if(responseJson.location_suggestions[i].name == locationGiven) {
			error = false;
			let cityId = responseJson.location_suggestions[i].id;
			const newUrl = zomatoUrl + 'cuisines?' + `city_id=${cityId}`;
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
		    .then(responseJson => getCuisineId(responseJson, cityId))
		    .catch(err => {
		    	$("#js-error-message").removeClass("hidden");
		    	$('#js-error-message').text(`Something went wrong: ${err.message}`);
		    });
		} else {
			if(error == true) {
				$("#js-error-message").removeClass("hidden");
				$('#js-error-message').text(`That is not a valid location! Make sure the city is located in the state provided.`);
			} 
		}		
	} 
}

function getCityId(cityGiven, locationGiven) {
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
    .then(responseJson => getCuisineList(responseJson, locationGiven))
    .catch(err => {
    	$("#js-error-message").removeClass("hidden");
    	$('#js-error-message').text(`Something went wrong: ${err.message}`);
    });
}

function watchForm() {
	$('#second-page').hide();
	$('.info').hide();

  	$('form').submit(event => {
		event.preventDefault();
		const stateGiven = $('#js-search-state').val();
		let cityGiven = $('#js-search-city').val();
		formatEntry(cityGiven);

		$("#js-error-message").empty();
		$("#js-error-message").addClass("hidden");
		$("#results-list").empty();
		$("#results").addClass("hidden");

		cityGiven = newStr;
		let locationGiven = `${cityGiven}, ${stateGiven}`;
			getCityId(cityGiven, locationGiven);
	});
}

function formatEntry(word){
	let splitStr = word.toLowerCase().split(' ');
	for (var i = 0; i < splitStr.length; i++) {
		splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
	}
	newStr = splitStr.join(' ');
	return newStr;
}

$(watchForm);