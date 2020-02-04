"use strict";

const zomatoUrl = "https://developers.zomato.com/api/v2.1/";
const zomatoKey = "dfcbf4ec3afff8937560994206294706";
const mapBoxKey = "pk.eyJ1IjoiaG9sbHktMjkzODQ3IiwiYSI6ImNrNTlycHgyZjBlc20zb24zZHhvbGpnaGgifQ.4wuSuhP7Za_lKtKMiGx2lg";
const mapBoxUrl = "https://api.mapbox.com/geocoding/v5/mapbox.places/";

let error = true;
let lat = 0;
let lon = 0;
let localMarker = [];
let newStr = "";
let cityGiven = "";
let locationGiven = "";
let cityId = "";
let map = {};
let categoryGiven = "";
let citiesJson = {};

// search for a resturant button functionality
$("#start-app").on("click", function(){
	$("#first-page").hide();
	$("#results").hide();
	$("#second-page").show();
})

// showing info behind "how we build this" button
$("#info-button").on("click", function(){
	$(".info").show();
})

// resetting page and values for new search
$('#new-search-button').on("click", function(){
	$("#first-page").hide();
	$("#results").hide();
	$("#second-page").show();
	$("#js-search-city").val("");
	$("#js-search-category").val("");
	$(".selectedCity").empty();
})

// formatting parameters for any fetch call
function formatQueryParams(params) {
  	const queryItems = Object.keys(params).map(key => 
		`${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
	)
  return queryItems.join('&');
}

// this resets all of the previous results and errors
// and then displays each response with a corresponding map pointer
function displayResults(responseJson) {
	error = true;
	$("#js-error-message").empty();
	$("#js-error-message").addClass("hidden");
	$("#results-list").empty();
	$("#results").removeClass("hidden");
	$("#second-page").hide();
	$(".loader").hide();
	localMarker = [];

	for( let i = 0; i < responseJson.restaurants.length; i++) {
		let restauPath = responseJson.restaurants[i].restaurant;
		$("#results-list").append(
			`<br>
			<li>
				Restaurant: ${restauPath.name} | 
				Rating: ${restauPath.user_rating.rating_text} 
				(${restauPath.user_rating.aggregate_rating})
			</li>
			<li>
				<a href="${restauPath.url}" 
					target="_blank">Website</a> | 
				<a href="${restauPath.menu_url}" 
					target="_blank">MENU</a>
			</li>
			<li>
				Address: ${restauPath.location.address}
			</li>
			<li>
				Type of Cuisine(s): ${restauPath.cuisines}
			</li>
			<li>
				Hours: ${restauPath.timings}
			</li>
			<br>`
		);

		localMarker.push({ 
			type: "Feature",
			geometry: { 
				type: "Point", 
				coordinates: [
					restauPath.location.longitude, 
					restauPath.location.latitude
				] 
			},
			id: restauPath.name
		});
	}
	$("#results").show();
	showMap();
}

// sets the center of the map to focus on and attaches markers
function showMap(){
	mapboxgl.accessToken = 
		// why is different that other mapbox key on line 5?
		"pk.eyJ1IjoiaG9sbHktMjkzODQ3IiwiYSI6ImNrNTlybDc0YTEydnIzZ3A3bHc5eHZwaWgifQ.7B75rcVKQJASnlD_-yIDkQ";
	map = new mapboxgl.Map({
		container: "map",
		style: "mapbox://styles/mapbox/streets-v11",
		center: localMarker[0].geometry.coordinates,
		zoom: 10
	});
  
	map.addControl(new mapboxgl.NavigationControl());
	localMarker.forEach(marker => {
		new mapboxgl.Popup({ closeOnClick: false })
		.setLngLat(marker.geometry.coordinates)
		.setHTML(`<p>${marker.id}</p>`)
		.addTo(map);
	});
}

// takes the cityid# and user category and returns the corresponding resturant data
function getRestaurantList(cityId, categoryGiven) {
	console.log("hi")
	const newUrl = 
		zomatoUrl + "search?" + `entity_id=${cityId}&entity_type=city&cuisines=${categoryGiven}&start=5&count=15`;

	fetch(newUrl, {
		method: "get",
		headers: {
			"user-key": zomatoKey
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
		$("#js-error-message").text(
			`Something went wrong: ${err.message}`
		);
	});
}

// is this needed ? probably for formatting category 
// formats the words submitted by user to correct entry format
function formatEntry(word){
	let splitStr = word.toLowerCase().split(' ');
	for (var i = 0; i < splitStr.length; i++) {
		splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
	}
	newStr = splitStr.join(' ');
	return newStr;
}

// when I tried to return category given below and then call the above function
// this above function ran first and then displayed results from India and Candada
function getCuisineId(responseJson, cityId) {
	console.log("hello from 128")
	categoryGiven = $("#js-search-category").val();
	formatEntry(categoryGiven);
	categoryGiven = newStr;
		// do we need to check type? might do "" || "All" and nothing else?
	if(categoryGiven == "" || categoryGiven == "all" || categoryGiven == "All") {
		categoryGiven = "all";
		getRestaurantList(cityId, categoryGiven);
	} else {
		const cuisineChoice = responseJson.cuisines.find(
			cuisine => cuisine.cuisine.cuisine_name === categoryGiven
		);
		if(cuisineChoice){
			getRestaurantList(cityId, cuisineChoice.cuisine.cuisine_id);
		} else {
			$("#js-error-message").removeClass("hidden");
			$("#js-error-message").text(
				`Invalid cuisine! Try again or leave it blank to get a list of cuisines.`
			);
		}
	} 
}

// takes cityId and returns cuisine options within a city
// returns array of objects
function getCuisineList() {
	console.log(`${cityId}`)
	const newUrl = zomatoUrl + "cuisines?" + `city_id=${cityId}`;
	fetch(newUrl, {
		method: "get",
		headers: {
			"user-key": zomatoKey
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
		$("#js-error-message").text(
			`Something went wrong: ${err.message}`
		);
	});		
}

//runs on submit button click
function onSubmit(){
	$("form").submit(event => {
		event.preventDefault();
		$("#js-error-message").empty();
		$("#js-error-message").addClass("hidden");
		$("#results-list").empty();
		$("#results").addClass("hidden");
		$(".loader").show();
		getCuisineList(cityId);
		getRestaurantList();
	});
}

function searchCities(searchTerm) {
	const params = {
		q: searchTerm
	};
	const queryString = formatQueryParams(params);
	const url = zomatoUrl + "cities?" + queryString;

	fetch(url, {
		method: "get",
		headers: {
			"user-key": zomatoKey
		}
	})
	.then(response => {
		if (response.ok) {
			return response.json();
		}
		throw new Error(response.statusText);
	})
	.then(cities => {
		console.log(cities);
		$(".cities")
		.html(
			cities.location_suggestions
			.map(
				city =>
				`<div class="city" data-id="${city.id}">${city.name}</div>`
			)
			.join("")
		)
		.show();
	})
	.catch(err => {
		console.log(err);
	});
}

function selectCity() {
	$(".cities").on("click", ".city", e => {
		cityId = $(e.target).data("id");
		console.log("is this running?")
		$(".selectedCity").html($(e.target).html());
		$(".cities").hide();
		$("#getRestBtn").prop("disabled", false);
	});
}

function autoComplete() {
	$("#js-search-city").keyup(function() {
	  searchCities($("#js-search-city").val());
	});
}

// called with page load, attaches original event listeners
function watchForm() {
	$("#second-page").hide();
	$(".info").hide();
	$(".loader").hide();
	autoComplete();
	selectCity();
	onSubmit();
}

$(watchForm);