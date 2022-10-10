
// IMPORTANT -> You must register an API key at mockapi.io
// IMPORTANT -> Get your API key and place it into the variable down below 
const MOCKAPI_KEY = "";


// IMPORTANT -> You must register an API key at positionstack.com
// IMPORTANT -> Get your API key and place it into the variable down below  
const POSITIONAPI_KEY = "";



// array of the markers
let arrayOfMarkers = [];

// anon function to createLocs
const createLoc = async (l,la,m) => {
  // l -> longitude
  // la -> latitude
  const newProduct = {
    lng: l,
    lat: la,
    message: m
  }
  
  // UPDATING THE DATA ON THE BACKEND 
  const response = await fetch(`https://${MOCKAPI_KEY}.mockapi.io/locations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newProduct)
  })
  const newlyCreatedProduct = await response.json();
  return (newlyCreatedProduct);
}

const initMap = async () => {
  // This will be the coordinate that will be rendered  (CHICAGO)
  const start = { lat: 41.881832, lng: -87.623177 };
  

  // Initilazation of the map setting up
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 6,
    center: start,
  });
  
 
  // BACK END MOCKAPI
  const response = await fetch(`https://${MOCKAPI_KEY}.mockapi.io/locations`);
  const data = await response.json();
  
  // this code grabbs all of the lat/lng coordinates and places it in array
  let formattedMarkers = [];
  arrayOfMarkers = data.map((e)=>{
    //adds objects with correct attributes to the formattedMarkers array
    if(e.lat >=-90 && e.lat <=90 && e.lng >=-180 && e.lng<=180){
      formattedMarkers.push({
        lat: e.lat,
        lng: e.lng
      })
    }
  });
  // formatterMarkers is the proper variable to use for adding/removing markers  

  // image location
  let url = "./icons/d2.png"

  // adds markers
  for(let i =0;i<formattedMarkers.length;i++){
    // adds marker objects from the formattedMarkers array of objects
    let z = new google.maps.Marker({
      position: formattedMarkers[i],
      map: map,
      icon: url
    })
    
  }

}
// adds map to html
window.initMap = initMap;


// Involved with animations for menu, ignore
$(document).ready(function () {

  $('.first-button').on('click', function () {

    $('.animated-icon1').toggleClass('open');
  });
});

const getLngLat = async(address, city, state)=>{

  const response = await fetch(`http://api.positionstack.com/v1/forward?access_key=${POSITIONAPI_KEY}&query=${address},${city}%20${state}`);
  const data = await response.json();
  
  let x = data.data[0]
  // returns an array [latitude, longitude]
  return [x.latitude, x.longitude]
 
}


// event listener when user submits a report
// passes in anon function
document.getElementById("submitBtn").addEventListener("click", (e)=>{
  // uses jQuery to get refernece id then uses val method in order to return input text field 
  let city = $('#cityAdd').val();
  let state = $('#stateAdd').val();
  let street = $('#streetAdd').val();
  let message = $('#description').val();
  // calls in createLoc function when promise is fulfilled 
  // passes longitude then latitude 
  changeSubmitBtn();
  getLngLat(street,city,state).then((data)=>{
    createLoc(data[1], data[0],message).then(()=>{
      location.reload();
    });
  }); 
});

function changeSubmitBtn(){
  /*
  
    <div>
        
      <div class="lds-roller"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>

    </div>
  */

  $("#modalContent").append(`
  <div>    
    <div class="lds-roller"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
  </div>
  `);
  $("#submitBtn").remove();

  
}

