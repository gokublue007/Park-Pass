var inputTextBox = $(".input");
var searchParkButtonEl = $("#searchParkButton");
var clearSavedParksButtonEl = $("#clearSavedParksButton");
var parkCodeList = [];
var parkNameList = [];
var NPSApiKey = "TNFSbiKup0DvQBzqjbD6tCiZTq4j6SBhWGF4hCOQ";
var googleApiKey = "AIzaSyA_Szh6txcLm9SOSbuZV-CyqKVbqljMkTM";
var hikingContent = $("#hiking-content");
var parkInfoContent = $("#park-info-content");
var savedSearchButtonEl = $(".savedSearch");
var parkLatitude;
var parkLongitude;
var parkCode;
var chosenPark;
var parkEntryFee;
var parkImageLink;
var parkHomepageLink;

// Place holder for input text until we get that functionally working
// var inputText = "Abraham Lincoln Birthplace National Historical Park";

// Clears previous search results when new search is made
function clearPage() {
  hikingContent.empty();
  parkInfoContent.empty();
}

// This function will take the input the user types into the search box, find the spot in the parkNamees array that matches the input and return the corresponding park code from the
// parkCodes array
function findParkCode(chosenPark) {
  // Create variable that has park code pulled from array based on selection from dropdown
  for (i = 0; i < parkNameList.length; i++) {
    if (chosenPark == parkNameList[i]) {
      parkCode = parkCodeList[i];
      // console.log(parkCode);
      break;
    }
  }
}
//gets list of saved park names from local storage
function getSavedParks() {
  var storedSavedParkNames = localStorage.getItem("savedParkNames");
  // console.log("storedSavedParkNames: ", storedSavedParkNames);
  var savedParkNames = [];
  if (storedSavedParkNames) {
    savedParkNames = JSON.parse(storedSavedParkNames);
  }
  return savedParkNames;
}
//saves park name to local storage if it doesn't already exists
function saveParkName(parkName) {
  var savedParkNames = getSavedParks();
  // console.log("Saved Park Names: ", savedParkNames);
  var alreadySaved = savedParkNames.includes(parkName);
  if (!alreadySaved) {
    savedParkNames = savedParkNames.concat(parkName);
    localStorage.setItem("savedParkNames", JSON.stringify(savedParkNames));
  }
}
//adds parks to saved content
function populateSavedContent() {
  var savedParkNames = getSavedParks();
  if (savedParkNames.length !== 0) {
    $("#savedParks").empty();
    savedParkNames.forEach(function (parkName) {
      var parkBtn = $("<button>");
      parkBtn.text(parkName);
      parkBtn.attr("id", parkName);
      parkBtn.addClass("button m-1");
      parkBtn.addClass("wrapButtonText");
      parkBtn.addClass("savedSearch");
      $("#savedParks").append(parkBtn);
    });
  }
  $(".savedSearch").on("click", savedParkSearch);
}

//Clears saved parks from local storage
function clearSavedParks() {
  $("#savedParks").empty();
  localStorage.setItem("savedParkNames", JSON.stringify([]));
  var noParks = $("<p>");
  noParks.text("You have no saved parks.");
  $("#savedParks").append(noParks);
}

clearSavedParksButtonEl.on("click", clearSavedParks);

// Populate saved park names from local storage on page load
populateSavedContent();

// This function will be executed upon clicking the search button
// This function will pull the necessary park data to then be displayed under the Park Info tab
function pullParkData() {
  var parkPullURL = `https://developer.nps.gov/api/v1/parks?parkCode=${parkCode}&api_key=${NPSApiKey}`;
  $.ajax({
    url: parkPullURL,
    method: "GET",
  }).then(function (response) {
    // console.log(response);
    // Set entryFee variable to cost of entry if > 0, to text "Free Fee Park" if there is no entry fee
    if (response.data[0].entranceFees[0].cost == 0) {
      parkEntryFee = "Entrance to this park is free!";
      // console.log(parkEntryFee);
    } else {
      parkEntryFee = response.data[0].entranceFees[0].cost;
      // console.log(parkEntryFee);
    }
    parkHomepageLink = response.data[0].url;
    parkImageLink = response.data[0].images[0].url;
    // Storing latitude and longitude of park to be used in nearby hikes API
    parkLatitude = response.data[0].latitude;
    parkLongitude = response.data[0].longitude;
    
    // Add image to page display
    var iconElement = $("<img>");
    iconElement.attr("src", parkImageLink);
    iconElement.attr("class", "imgOne");
    parkInfoContent.append(iconElement);

    // add national park name to display
    var nameElement = $("<h2>");
    nameElement.text(chosenPark);
    parkInfoContent.append(nameElement);

    // add national park homepage link to display
    var linkElement = $("<a>");
    linkElement.attr("href", parkHomepageLink);
    linkElement.html(parkHomepageLink);
    parkInfoContent.append(linkElement);

    // add national park fee to display
    var feeDisplayElement = $("<p>");
    feeDisplayElement.html("Entrance Fee: " + parkEntryFee);
    parkInfoContent.append(feeDisplayElement);

    var parkFullName = response.data[0].fullName;
    saveParkName(parkFullName);
    populateSavedContent();
  });
}

// Function pulls data from NPS API and stores park names and codes to be used later
function getParkNamesCodes() {
  var allParksURL = `https://developer.nps.gov/api/v1/parks?limit=500&api_key=${NPSApiKey}`;
  $.ajax({
    url: allParksURL,
    method: "GET",
  }).then(function (response) {
    // console.log(response);
    for (i = 0; i < response.data.length; i++) {
      parkCodeList.push(response.data[i].parkCode);
      parkNameList.push(response.data[i].fullName);
    }
  });
  // console.log(parkNameList);
  // console.log(parkCodeList);
}

// Function pulls data from google maps api
function hikingTrails(park) {
  fetch(
    `https://mighty-headland-78923.herokuapp.com/https://maps.googleapis.com/maps/api/place/textsearch/json?query=hiking+trails+${park}&key=${googleApiKey}`,
    {
      method: "GET",
    }
  )
    .then(function (response) {
      return response.json();
    })
    .then(function (trailData) {
      // console.log(trailData);
      displayTrails(trailData);
    });
}

// Function displays trail list
function displayTrails(trails) {
  
  for (var i = 0; i < trails.results.length; i++) {
    // Creates text for trail
    var listItem = $('<p>'); 
    listItem.addClass('custom-trail');   
    hikingContent.append(listItem);

    // Creates link to trailhead
    var trailLink = $('<a>');
    listItem.append(trailLink);
    trailLink.text(trails.results[i].name);
    trailLink.attr('href', 'https://www.google.com/maps/@' + trails.results[i].geometry.location.lat + ',' + trails.results[i].geometry.location.lng + ',20z')
    .attr('target', '_blank');    
  }

}

getParkNamesCodes();

function runParkSearch(event) {
  event.preventDefault();
  clearPage();
  chosenPark = inputTextBox.val();
  findParkCode(chosenPark);
  pullParkData();
  hikingTrails(chosenPark);
}

searchParkButtonEl.on("click", runParkSearch);

function savedParkSearch(event) {
  event.preventDefault();
  clearPage();
  chosenPark = event.target.innerText;
  findParkCode(chosenPark);
  pullParkData();
  hikingTrails(chosenPark);
}

$(function () {
  $("#tags").autocomplete({
    source: parkNameList,
  });
  $('#tags').autocomplete('widget').addClass('auto-complete-scroll');
});




// Allows for tab function to display each tabs content
var tabs = document.querySelectorAll('.tabs li');
var tabContent = document.querySelectorAll('#tab-content > div');

// Gives/removes class "is-active" when tab is click
tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    tabs.forEach(item => item.classList.remove('is-active'))
    tab.classList.add('is-active');

    // Hides/displays tab content when click
    const target = tab.dataset.target;
    tabContent.forEach(box => {
      if (box.getAttribute('id') === target) {
        box.classList.remove('is-hidden');
      } else {
        box.classList.add('is-hidden');
      }
    })

  })
})
