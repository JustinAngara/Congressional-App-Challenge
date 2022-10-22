
/**
 * IMPORTANT -> You must register an API key at mockapi.io
 * IMPORTANT -> Get your API key and place it into the variable down below 
 */

const MOCKAPI_KEY = "";



/**
 * IMPORTANT -> You must register an API key at mockapi.io
 * IMPORTANT -> Get your API key and place it into the variable down below 
 */
const POSITIONAPI_KEY = "";



// this array holds marker objects, unformatted
let arrayOfMarkers = [];


// negative iamge  
let generalN = "./icons/d2.png"

// theft image
let theftimg = "./icons/r7.png"

// harassment image
let harasimg = "./icons/h2.png";

// safety image
let safeimg = "./icons/s2.png";

/**
 * anon function to create markers given location,
 * m param is used to save in the db
 */
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

const getMessages = async()=>{
  // gets fetch request to API
  const response = await fetch(`https://${MOCKAPI_KEY}.mockapi.io/locations`);
  const sim = await response.json();
  // create new arrays to store proper data

  let arrayOfMessages = [];

  // array of words that relates to robbery, if message contains it will be added to appropriate method
  let tConditions = ["theft","stole","robbery","heist","raid","burglary","stealing"]

  // array of words that relates to harassment, if message contains it will be added to appropriate method
  let hConditions = ["disturbance","abuse","racism","racist","sexual","assault","abusive","threat", "unsafe"]

  // array of words that relates to positive, if message contains it will be added to appropiate method
  let pConditions = ["safe","sanitary","nice","friendly","protected","secure","guarded","good","acceptable","kind"];
  for(let i =0;i<sim.length;i++){
    let typeOfCond = "";
    let x = sim[i].message;
    let gId = sim[i].id;


    if(pConditions.some(el=>x.includes(el)) && x!=""){
      typeOfCond="positive";
    } else if(tConditions.some(el=>x.includes(el))){
      typeOfCond = "theft";
    } else if(hConditions.some(el=>x.includes(el)) && x!=""){
      typeOfCond="harassment";
    } else {
      typeOfCond="negative";
    }

    arrayOfMessages.push({
      message: x,
      type: typeOfCond,
      id: gId
    });
    
  }
  return arrayOfMessages;
}

const initMap = async () => {
  // This will be the coordinate that will be rendered  (CHICAGO)
  const start = { lat: 41.881832, lng: -87.623177 };
  

  // Initilazation of the map setting up
  const map = new google.maps.Map(document.getElementById("map"), {
    mapId:"9c6f810b0563cd4",
    zoom: 5,
    center: start,
    
  });
  // creates legend
  const icons = {
    negative: {
      name: "Unsafe area",
      icon: generalN,
    },
    harassment: {
      name: "Harassment",
      icon: harasimg,
    },
    theft: {
      name: "Robbery",
      icon: theftimg,
    },
    positive: {
      name: "Safe area",
      icon: safeimg
    }
  };
  const legend = document.getElementById("legend");

  for (const key in icons) {
    const type = icons[key];
    const name = type.name;
    const icon = type.icon;
    const div = document.createElement("div");

    div.innerHTML = '<img src="' + icon + '"> ' + name;
    legend.appendChild(div);
  }

  map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(legend);

 
  // BACK END MOCKAPI
  const response = await fetch(`https://${MOCKAPI_KEY}.mockapi.io/locations`);
  const data = await response.json();
  
  // this code grabbs all of the lat/lng coordinates and places it in array
  let formattedMarkers = [];
  arrayOfMarkers = data.map((e)=>{
    //adds objects with correct attributes to the formattedMarkers array
    
    formattedMarkers.push({
      lat: e.lat,
      lng: e.lng
    })
    
  });
  // formatterMarkers is the proper array to hold valid markers with proper attributes  


  let fIcon=generalN;

  getMessages().then((e)=>{
    const infoWindow = new google.maps.InfoWindow();
    let messagesArray=e;
    console.log(messagesArray);

    // adds markers
    for(let i =0;i<formattedMarkers.length;i++){
      // adds marker objects from the formattedMarkers array of objects

      let type = messagesArray[i].type 
      fIcon = getIconImg(type);

      let message = messagesArray[i].message;
      console.log(message);
      let title = message.substring(0,message.indexOf("+"));
      message = message.substring(message.indexOf(">")+1)
      
      let contentString = 
      `
        <div id ="content">
          <h6>${title}</h6>
          <p><b>${message}</b></p>
        </div>
      `;



      let z = new google.maps.Marker({
        position: formattedMarkers[i],
        map: map,
        icon: fIcon,
      });
      z.addListener("click",()=>{
        infoWindow.close();
        infoWindow.setContent(contentString);
        infoWindow.open(z.getMap(),z);
      });
      
    }
    

  })
  

}




getIconImg = (type) =>{
  if(type=="positive"){
    return safeimg;
  } else if(type=="theft"){
    return theftimg;
  } else if(type=="harassment"){
    return harasimg;
  } 
  return generalN;
  
}

// adds map to html
window.initMap = initMap;


// Involved with animations for menu, ignore
$(document).ready(function () {
  $('.first-button').on('click', function () {
    $('.animated-icon1').toggleClass('open');
  });
});

/** 
 * async method to return actual lat/long given the address
 * parameters for address,city,state can be rewritten in any way if valid
 */
const getLngLat = async(address, city, state)=>{
  const response = await fetch(`http://api.positionstack.com/v1/forward?access_key=${POSITIONAPI_KEY}&query=${address},${city}%20${state}`);
  const data = await response.json();
  
  // .data is an array, 0 index grabs first instance of address 
  let x = data.data[0]
  // returns an array [latitude, longitude]
  return [x.latitude, x.longitude]
 
}


/**
 * event listener when user submits a report
 * passes in anon function
 */
document.getElementById("submitBtn").addEventListener("click", ()=>{
  // uses jQuery to get refernece id then uses val method in order to return input text field 
  let city = $('#cityAdd').val();
  let state = $('#stateAdd').val();
  let street = $('#streetAdd').val();
  let message = $('#description').val();
  // calls in createLoc function when promise is fulfilled 
  // passes longitude then latitude 
  changeSubmitBtn();
  getLngLat(street,city,state).then((data)=>{
    // the ++:> will be parsed out of the displayed message and be sent towards the header of street add
    createLoc(data[1], data[0],`${city} ${state} ${street}++:> ${message}`).then(()=>{
      location.reload();
    });
  }); 
});

/**
 * adds the loading symbol then removes the submit button
 */
function changeSubmitBtn(){
  $("#modalContent").append(`
  <div>    
    <div class="lds-roller"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
  </div>
  `);
  $("#submitBtn").remove();
}

