const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currrentWeatherDiv = document.querySelector(".current-weather");
const weatherCardDiv = document.querySelector(".weather-cards");

const API_KEY="e9ab2acd05f57b32d0680f1573c71038"; // API KEY FOR OPEN WEATHER MAP API

const createWeatherCard = (cityName, weatherItem ,index) =>{
    if(index === 0){// HTML FOR MAIN WEATHER CARD
        return ` <div class="details ">
                <h2 class="text-[1.7rem]">${cityName}(${weatherItem.dt_txt.split(" ")[0]})</h2>
                <h4  class="mt-3 text-base font-medium">Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
                <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
                <h4>Humidity: ${weatherItem.main.humidity}%</h4> 
               </div> 
               <div class="icon class="icon text-center"">
                <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="Weather-icon class="max-w-[120px] -mt-[15px]"">
                <h4 class="-mt-[10px] capitalize"> ${weatherItem.weather[0].description}</h4>
               </div>`;
    }else{ // HTML FOR THE OTHER FIVE DAYS FORECAST CARD
        return `<li class="card class="card list-none text-white p-[18px] px-[16px] rounded-lg bg-[#C8A1E0] w-[calc(100%/5)]"">
                    <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
                    <img class="max-w-[70px] my-[5px] -mt-[12px]"src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="Weather-icon">
                    <h4>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
                    <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
                    <h4>Humidity: ${weatherItem.main.humidity}%</h4>   
                </li>`;
    }
  
}

const getWeatherDetails=(cityName,lat,lon)=>{
    const WEATHER_API_URL=`http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    fetch(WEATHER_API_URL).then(res=>res.json()).then(data=>{
        // filter the forecast to get only one forecast per day 
        const uniqueForecastDays=[];
        const fiveDaysForecast = data.list.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if(!uniqueForecastDays.includes(forecastDate)){
                return uniqueForecastDays.push(forecastDate);
            }
        });
        
        // Clearing previous weather data
        cityInput.value="";
        currrentWeatherDiv.innerHTML = "";
        weatherCardDiv.innerHTML = "";

        // creating weather cards and adding them to the DOM
        fiveDaysForecast.forEach((weatherItem,index )=>{
            if(index === 0){
                currrentWeatherDiv.insertAdjacentHTML("beforeend",createWeatherCard(cityName , weatherItem ,index));
            }else {
                weatherCardDiv.insertAdjacentHTML("beforeend",createWeatherCard(cityName , weatherItem ,index));
            }
            
        });
    }).catch(()=>{
        alert("An error occured while fetching the weather forecast!");
     })
}

const getCityCoordinates = ()=>{
     const cityName = cityInput.value.trim(); // get user entered city name and remove extra spaces
     if(!cityName) return; // return if city name is empty
     const GEOCODING_API_URL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;
//Get entered city coordinates (latitude, longitude, and name )from the API responses
     fetch(GEOCODING_API_URL).then(res=> res.json()).then(data=>{
        if(!data.length)return alert(`No cordinates found for ${cityName}`);
        const {name,lat,lon} = data[0];
        getWeatherDetails(name,lat,lon);
     }).catch(()=>{
        alert("An error occured while fetching the coordinates!");
     })
}

const getUserCoordinates = ()=>{
    navigator.geolocation.getCurrentPosition(
        position =>{
            const {latitude,longitude} = position.coords; //get coordinates of user location
            const REVERSE_GEOCODING_URL=`http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;

            //  Get city name from coordinates using reverse geocoding API
            fetch(REVERSE_GEOCODING_URL).then(res=> res.json()).then(data=>{
                const {name} = data[0];
                getWeatherDetails(name,latitude,longitude);
             }).catch(()=>{
                alert("An error occured while fetching the city!");
             })
        },
        error =>{ // Show alert if user denied the location permission
            if(error.code === error.PERMISSION_DENIED){
               alert("Geolocation request denied. Please reset location permission to grant access again ") 
            }
        }
    );
}

searchButton.addEventListener("click", getCityCoordinates);
locationButton.addEventListener("click", getUserCoordinates);
cityInput.addEventListener("Keyup", e=> e.key === "Enter" && getCityCoordinates());