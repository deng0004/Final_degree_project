
console.log('API_KEY:', process.env.API_KEY);
console.log('AUTH_DOMAIN:', process.env.AUTH_DOMAIN);
console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('PROJECT_ID:', process.env.PROJECT_ID);
console.log('STORAGE_BUCKET:', process.env.STORAGE_BUCKET);
console.log('MESSAGING_SENDER_ID:', process.env.MESSAGING_SENDER_ID);
console.log('APP_ID:', process.env.APP_ID);
console.log('MEASUREMENT_ID:', process.env.MEASUREMENT_ID);

const firebaseConfig = {
  apiKey: process.env.API_KEY, 
  authDomain: process.env.AUTH_DOMAIN,
  databaseURL: process.env.DATABASE_URL,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID,
  measurementId: process.env.MEASUREMENT_ID,
};

// Initialize firebase
firebase.initializeApp(firebaseConfig);

// Make auth and database references
const auth = firebase.auth();
const db = firebase.database();


/*-----------------------------------------------------------------------------------authentication -------------------------------------------------------------------*/


document.addEventListener("DOMContentLoaded", function(){
    // listen for auth status changes
    auth.onAuthStateChanged(user => {
        if (user) {
          console.log("user logged in");
          console.log(user);
          setupUI(user);
          var uid = user.uid;
          console.log(uid);
        } else {
          console.log("user logged out");
          setupUI();
        }
    });

    // login
    const loginForm = document.querySelector('#login-form');
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // get user info
        const email = loginForm['input-email'].value;
        const password = loginForm['input-password'].value;
        // log the user in
        auth.signInWithEmailAndPassword(email, password).then((cred) => {
            // close the login modal & reset form
            loginForm.reset();
            console.log(email);
        })
        .catch((error) =>{
            const errorCode = error.code;
            const errorMessage = error.message;
            document.getElementById("error-message").innerHTML = errorMessage;
            console.log(errorMessage);
        });
    });

    // logout
    const logout = document.querySelector('#logout-link');
    logout.addEventListener('click', (e) => {
        e.preventDefault();
        auth.signOut();
    });
});

/*-----------------------------------------------------------------------------------table and chart -------------------------------------------------------------------*/

// global stdNo
var stdNo = 0;

// convert epochtime to JavaScripte Date object
function epochToJsDate(epochTime){
  return new Date(epochTime*1000);
}

// convert time to human-readable format YYYY/MM/DD HH:MM:SS
function epochToDateTime(epochTime){
  var epochDate = new Date(epochToJsDate(epochTime));
  var dateTime = epochDate.getFullYear() + "/" +
    ("00" + (epochDate.getMonth() + 1)).slice(-2) + "/" +
    ("00" + epochDate.getDate()).slice(-2) + "\n" +
    ("00" + epochDate.getHours()).slice(-2) + ":" +
    ("00" + epochDate.getMinutes()).slice(-2) + ":" +
    ("00" + epochDate.getSeconds()).slice(-2);

  return dateTime;
}



// function to plot values on charts
function plotValues(chart, timestamp, value){
   var keys = Object.keys(value);
  console.log(keys);
  console.log(keys.length);

    for (var i = 0; i < keys.length; i++){
     var x = epochToJsDate(timestamp).getTime();
    console.log(x);
    // const key = keys[i];
     const key = keys[i];
     var y = Number (value[key]);
    console.log(y);

    if(chart.series[i].data.length > 40) {
      chart.series[i].addPoint([x, y], true, true, true);
    } else {
      chart.series[i].addPoint([x, y], true, false, true);
    }

  }
}




// DOM elements
const loginElement = document.querySelector('#login-form');
const contentElement = document.querySelector("#content-sign-in");
const userDetailsElement = document.querySelector('#user-details');
const authBarElement = document.querySelector('#authentication-bar');
const deleteButtonElement = document.getElementById('delete-button');
const deleteModalElement = document.getElementById('delete-modal');
const deleteDataFormElement = document.querySelector('#delete-data-form');
const viewDataButtonElement = document.getElementById('view-data-button');
const hideDataButtonElement = document.getElementById('hide-data-button');
const tableContainerElement = document.querySelector('#table-container');
const chartsRangeInputElement = document.getElementById('charts-range');
const loadDataButtonElement = document.getElementById('load-data');
const cardsCheckboxElement = document.querySelector('input[name=cards-checkbox]');
// const gaugesCheckboxElement = document.querySelector('input[name=gauges-checkbox]');
const chartsCheckboxElement = document.querySelector('input[name=charts-checkbox]');

// DOM elements for sensor readings
const cardsReadingsElement = document.querySelector("#cards-div");
const chartsDivElement = document.querySelector('#charts-div');
// MQ2 gases
const MQ2_alcElement = document.getElementById("MQ2_alc");
const MQ2_coElement = document.getElementById("MQ2_co");
const MQ2_h2Element = document.getElementById("MQ2_h2");
const MQ2_lpgElement = document.getElementById("MQ2_lpg");
const MQ2_propElement = document.getElementById("MQ2_prop");
// MQ3 gases
const MQ3_alcElement = document.getElementById("MQ3_alc");
const MQ3_benElement = document.getElementById("MQ3_ben");
const MQ3_ch4Element = document.getElementById("MQ3_ch4");
const MQ3_coElement = document.getElementById("MQ3_co");
const MQ3_hexElement = document.getElementById("MQ3_hex");
const MQ3_lpgElement = document.getElementById("MQ3_lpg");
// MQ136 gases
const MQ136_coElement = document.getElementById("MQ136_co");
const MQ136_h2sElement = document.getElementById("MQ136_h2s");
const MQ136_nh4Element = document.getElementById("MQ136_nh4");


const updateElement = document.getElementById("lastUpdate")

// MANAGE LOGIN/LOGOUT UI
const setupUI = (user) => {
  if (user) {
    //toggle UI elements
    loginElement.style.display = 'none';
    contentElement.style.display = 'block';
    authBarElement.style.display = 'block';
    userDetailsElement.style.display = 'block';
    userDetailsElement.innerHTML = user.email;

    // get user UID to get data from database
    var uid = user.uid;
    console.log(uid);

    // Database paths (with user UID)
    var dbPath = 'UsersData/' + uid.toString() + '/readings';
    var chartPath = 'UsersData/' + uid.toString() + '/charts/range';

    // Database references
    var dbRef = firebase.database().ref(dbPath);
    var chartRef = firebase.database().ref(chartPath);

    // CHARTS
    // Number of readings to plot on charts
    var chartRange = 0;
    // Get number of readings to plot saved on database (runs when the page first loads and whenever there's a change in the database)
    chartRef.on('value', snapshot => {
      chartRange = Number(snapshot.val());
      console.log(chartRange);
      // Delete all data from charts
      // to update with new values when a new range is selected
      chartT.destroy();
  
      // Render new charts to display new range of data
      chartT = createTemperatureChart();
     
      // Update the charts with the new range
      // Get the latest readings and plot them on charts (the number of plotted readings corresponds to the chartRange value)
      dbRef.orderByKey().limitToLast(chartRange).on('child_added', snapshot => {
        var jsonData = snapshot.toJSON(); // example: {Alc: 25.02, humidity: 50.20, pressure: 1008.48, timestamp:1641317355}
        // Save values on variables
        var timestamp = jsonData.timestamp;
        // Plot the values on the charts
        plotValues(chartT, timestamp, jsonData);
      });
    });

    // Update database with new range (input field)
    chartsRangeInputElement.onchange = () => {
      chartRef.set(chartsRangeInputElement.value);
    };

    //CHECKBOXES
    // Checbox (cards for sensor readings)
    cardsCheckboxElement.addEventListener('change', (e) => {
      if (cardsCheckboxElement.checked) {
        cardsReadingsElement.style.display = 'block';
      }
      else {
        cardsReadingsElement.style.display = 'none';
      }
    });

      // Checbox (charts for sensor readings)
    chartsCheckboxElement.addEventListener('change', (e) =>{
      if (chartsCheckboxElement.checked) {
        chartsDivElement.style.display = 'block';
      }
      else{
        chartsDivElement.style.display = 'none';
      }
    });
    

    // CARDS
    // Get the latest readings and display on cards
    dbRef.orderByKey().limitToLast(1).on('child_added', snapshot => {
      var jsonData = snapshot.toJSON(); // example: {temperature: 25.02, humidity: 50.20, pressure: 1008.48, timestamp:1641317355}
      // MQ2
      var MQ2_Alc = jsonData.MQ2_Alc;
      var MQ2_CO = jsonData.MQ2_CO;
      var MQ2_H2 = jsonData.MQ2_H2;
      var MQ2_LPG = jsonData.MQ2_LPG;
      var MQ2_Prop = jsonData.MQ2_Prop;

      // MQ3 
      var MQ3_Alc = jsonData.MQ3_Alc;
      var MQ3_Ben = jsonData.MQ3_Ben;
      var MQ3_CH4 = jsonData.MQ3_CH4;
      var MQ3_CO = jsonData.MQ3_CO;
      var MQ3_Hex = jsonData.MQ3_Hex;
      var MQ3_LPG = jsonData.MQ3_LPG;

      // MQ136
      var MQ136_CO = jsonData.MQ136_CO;
      var MQ136_H2S = jsonData.MQ136_H2S;
      var MQ136_NH4 = jsonData.MQ136_NH4;

      var timestamp = jsonData.timestamp;
      // Update DOM elements
      MQ2_alcElement.innerHTML = MQ2_Alc;
      MQ2_coElement.innerHTML = MQ2_CO;
      MQ2_h2Element.innerText = MQ2_H2;
      MQ2_lpgElement.innerText = MQ2_LPG;
      MQ2_propElement.innerText = MQ2_Prop;

      // MQ3
      MQ3_alcElement.innerText = MQ3_Alc;
      MQ3_benElement.innerHTML = MQ3_Ben;
      MQ3_ch4Element.innerHTML = MQ3_CH4;
      MQ3_coElement.innerHTML= MQ3_CO;
      MQ3_hexElement.innerHTML = MQ3_Hex; 
      MQ3_lpgElement.innerHTML = MQ3_LPG;
      
      // MQ136
      MQ136_coElement.innerHTML = MQ136_CO;
      MQ136_h2sElement.innerHTML = MQ136_H2S;
      MQ136_nh4Element.innerHTML = MQ136_NH4;
  

      updateElement.innerHTML = epochToDateTime(timestamp);
    });

   

    // DELETE DATA
    // Add event listener to open modal when click on "Delete Data" button
    deleteButtonElement.addEventListener('click', e =>{
      console.log("Remove data");
      e.preventDefault;
      deleteModalElement.style.display="block";
    });

    // Add event listener when delete form is submited
    deleteDataFormElement.addEventListener('submit', (e) => {
      // delete data (readings)
      dbRef.remove();
    });

    // TABLE
    var lastReadingTimestamp; //saves last timestamp displayed on the table
    // Function that creates the table with the first 100 readings
    function createTable(){
      // append all data to the table
      var firstRun = true;

      dbRef.orderByKey().limitToLast(100).on('child_added', function(snapshot) {
        if (snapshot.exists()) {
          var jsonData = snapshot.toJSON();
          console.log(jsonData);
          // MQ2
          var MQ2_Alc = jsonData.MQ2_Alc;
          var MQ2_CO = jsonData.MQ2_CO;
          var MQ2_H2 = jsonData.MQ2_H2;
          var MQ2_LPG = jsonData.MQ2_LPG;
          var MQ2_Prop = jsonData.MQ2_Prop;
          // MQ3 
          var MQ3_Alc = jsonData.MQ3_Alc;
          var MQ3_Ben = jsonData.MQ3_Ben;
          var MQ3_CH4 = jsonData.MQ3_CH4;
          var MQ3_CO = jsonData.MQ3_CO;
          var MQ3_Hex = jsonData.MQ3_Hex;
          var MQ3_LPG = jsonData.MQ3_LPG;
          // MQ136
          var MQ136_CO = jsonData.MQ136_CO;
          var MQ136_H2S = jsonData.MQ136_H2S;
          var MQ136_NH4 = jsonData.MQ136_NH4;
          var timestamp = jsonData.timestamp;
          var content = '';
          content += '<tr>';
          // content += '<td>' + ++stdNo + '</td>';
          content += '<td>' + epochToDateTime(timestamp) + '</td>';
          content += '<td>' + MQ2_Alc + '</td>';
          content += '<td>' + MQ2_CO + '</td>';
          content += '<td>' + MQ2_H2 + '</td>';
          content += '<td>' + MQ2_LPG + '</td>';
          content += '<td>' + MQ2_Prop + '</td>';
          content += '<td>' + MQ3_Alc + '</td>';
          content += '<td>' + MQ3_Ben + '</td>';
          content += '<td>' + MQ3_CH4 + '</td>';
          content += '<td>' + MQ3_CO + '</td>';
          content += '<td>' + MQ3_Hex + '</td>';
          content += '<td>' + MQ3_LPG + '</td>';
          content += '<td>' + MQ136_CO + '</td>';
          content += '<td>' + MQ136_H2S + '</td>';
          content += '<td>' + MQ136_NH4 + '</td>';
          content += '</tr>';
          $('#tbody').prepend(content);
          // Save lastReadingTimestamp --> corresponds to the first timestamp on the returned snapshot data
          if (firstRun){
            lastReadingTimestamp = timestamp;
            firstRun=false;
            console.log(lastReadingTimestamp);
          }
        }
      });
    };

    // append readings to table (after pressing More results... button)
    function appendToTable(){
      var dataList = []; // saves list of readings returned by the snapshot (oldest-->newest)
      var reversedList = []; // the same as previous, but reversed (newest--> oldest)
      console.log("APEND");
      dbRef.orderByKey().limitToLast(100).endAt(lastReadingTimestamp).once('value', function(snapshot) {
        // convert the snapshot to JSON
        if (snapshot.exists()) {
          snapshot.forEach(element => {
            var jsonData = element.toJSON();
            dataList.push(jsonData); // create a list with all data
          });
          lastReadingTimestamp = dataList[0].timestamp; //oldest timestamp corresponds to the first on the list (oldest --> newest)
          reversedList = dataList.reverse(); // reverse the order of the list (newest data --> oldest data)

          var firstTime = true;
          // loop through all elements of the list and append to table (newest elements first)
          reversedList.forEach(element =>{
            if (firstTime){ // ignore first reading (it's already on the table from the previous query)
              firstTime = false;
            }
            else {
              // MQ2
              var MQ2_Alc = element.MQ2_Alc;
              var MQ2_CO = element.MQ2_CO;
              var MQ2_H2 = element.MQ2_H2;
              var MQ2_LPG = element.MQ2_LPG;
              var MQ2_Prop = element.MQ2_Prop;
              // MQ3 
              var MQ3_Alc = jsonData.MQ3_Alc;
              var MQ3_Ben = jsonData.MQ3_Ben;
              var MQ3_CH4 = jsonData.MQ3_CH4;
              var MQ3_CO = jsonData.MQ3_CO;
              var MQ3_Hex = jsonData.MQ3_Hex;
              var MQ3_LPG = jsonData.MQ3_LPG;
              // MQ136
              var MQ136_CO = jsonData.MQ136_CO;
              var MQ136_H2S = jsonData.MQ136_H2S;
              var MQ136_NH4 = jsonData.MQ136_NH4;

              var timestamp = element.timestamp;
              var content = '';
              content += '<tr>';
              // content += '<td>' + ++stdNo + '</td>';
              content += '<td>' + epochToDateTime(timestamp) + '</td>';
              content += '<td>' + MQ2_Alc + '</td>';
              content += '<td>' + MQ2_CO + '</td>';
              content += '<td>' + MQ2_H2 + '</td>';
              content += '<td>' + MQ2_LPG + '</td>';
              content += '<td>' + MQ2_Prop + '</td>';
              content += '<td>' + MQ3_Alc + '</td>';
              content += '<td>' + MQ3_Ben + '</td>';
              content += '<td>' + MQ3_CH4 + '</td>';
              content += '<td>' + MQ3_CO + '</td>';
              content += '<td>' + MQ3_Hex + '</td>';
              content += '<td>' + MQ3_LPG + '</td>';
              content += '<td>' + MQ136_CO + '</td>';
              content += '<td>' + MQ136_H2S + '</td>';
              content += '<td>' + MQ136_NH4 + '</td>';
              content += '</tr>';
              $('#tbody').append(content);
            }
          });
        }
      });
    }

    viewDataButtonElement.addEventListener('click', (e) =>{
      // Toggle DOM elements
      tableContainerElement.style.display = 'block';
      viewDataButtonElement.style.display ='none';
      hideDataButtonElement.style.display ='inline-block';
      loadDataButtonElement.style.display = 'inline-block'
      createTable();
    });

    loadDataButtonElement.addEventListener('click', (e) => {
      appendToTable();
    });

    hideDataButtonElement.addEventListener('click', (e) => {
      tableContainerElement.style.display = 'none';
      viewDataButtonElement.style.display = 'inline-block';
      hideDataButtonElement.style.display = 'none';
    });

  // IF USER IS LOGGED OUT
  } else{
    // toggle UI elements
    loginElement.style.display = 'block';
    authBarElement.style.display ='none';
    userDetailsElement.style.display ='none';
    contentElement.style.display = 'none';
  }
}