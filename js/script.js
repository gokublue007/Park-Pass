// var inputTextBox = $('.input');
var parkCodeList = [];
var parkNameList = [];
var apiKey = 'TNFSbiKup0DvQBzqjbD6tCiZTq4j6SBhWGF4hCOQ';
var googleApiKey = 'AIzaSyA_Szh6txcLm9SOSbuZV-CyqKVbqljMkTM'
var parkCode;
var inputText = "rocky mountain national park";
var hikingContent = $('#hiking-content');

// This function will take the input the user types into the search box, find the spot in the parkNamees array that matches the input and return the corresponding park code from the 
// parkCodes array
function findParkCode() {
  // Create variable that has park code pulled from array based on selection from dropdown
  for (i=0; i<parkNameList.length; i++) {
    if (inputText == parkNameList[i]) {
      parkCode = parkCodeList[i];
      console.log(parkCode);
      break
    }
  }
}

// This function will be executed upon clicking the search button
// This function will pull the necessary park data to then be displayed under the Park Info tab
function pullParkData() {
  var parkPullURL = `https://developer.nps.gov/api/v1/parks?parkCode=${parkCode}&api_key=${apiKey}`;
  $.ajax({
    url: parkPullURL,
    method: 'GET',
  }).then(function (response) {
    console.log(response);
  })
}

// Function pulls data from NPS API and stores park names and codes to be used later
function getParkNamesCodes() {
  var allParksURL = `https://developer.nps.gov/api/v1/parks?limit=500&api_key=${apiKey}`;
  $.ajax({
    url: allParksURL,
    method: 'GET',
  }).then(function (response) {
    // console.log(response);
    for (i=0; i<response.data.length; i++) {
      parkCodeList.push(response.data[i].parkCode);
      parkNameList.push(response.data[i].fullName);
    }
    findParkCode();
    pullParkData();
  })
  // console.log(parkNameList);
  // console.log(parkCodeList);
}

function hikingTrails() {
  fetch(`https://maps.googleapis.com/maps/api/place/textsearch/json?query=hiking+trails+${inputText}&key=${googleApiKey}`, {
    method: 'GET',
  })
  .then(function (response) {
    return response.json();
  })
  .then(function (trailData) {
    console.log(trailData)
  });
}

hikingTrails();

getParkNamesCodes();

