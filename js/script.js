console.log("Park Dev Rangers");

function getParkData() {
  // Create variables for both current weather & five day Open Weather Map API's
  var apiKey = 'TNFSbiKup0DvQBzqjbD6tCiZTq4j6SBhWGF4hCOQ';
  var parkCode = 'acad';
  var parkPullURL = `https://developer.nps.gov/api/v1/parks?parkCode=${parkCode}&api_key=${apiKey}`;

  // Pull data and display today's weather
  $.ajax({
    url: parkPullURL,
    method: 'GET',
  }).then(function (response) {
    console.log(response);
  })
}

getParkData();