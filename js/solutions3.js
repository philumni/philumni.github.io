var myApp = myApp || {};


myApp.doWeather = function() {

    myApp.get("getWeather").innerText ="Loading...";
    myApp.clearWeather();
    myApp.getCoords(myApp.getCity());
}

myApp.getCoords = function(city) {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json`;
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const results = JSON.parse(xhr.responseText);
            if (results.length > 0) {
                let coords={};
                coords.lat = results[0].lat;
                coords.lon = results[0].lon;
                console.log(coords);
                myApp.getWeather(city, coords.lat, coords.lon);
            }
        }
    };
    xhr.send();
}


myApp.getWeather= function(city, lat, lon) {
// Tucson coordinates
// const lat = 32.2226;
// const lon = -110.9747;

// Step 1: Get the gridpoint info (which contains the forecast URL)
    const pointsRequest = new XMLHttpRequest();
    pointsRequest.open("GET", `https://api.weather.gov/points/${lat},${lon}`, true);
    pointsRequest.setRequestHeader("User-Agent", "my-weather-app (example@example.com)");

    pointsRequest.onreadystatechange = function () {
        if (pointsRequest.readyState === 4 && pointsRequest.status === 200) {
            const data = JSON.parse(pointsRequest.responseText);
            const forecastUrl = data.properties.forecast;

            // Step 2: Request the forecast
            const forecastRequest = new XMLHttpRequest();
            forecastRequest.open("GET", forecastUrl, true);
            forecastRequest.setRequestHeader("User-Agent", "my-weather-app (example@example.com)");

            forecastRequest.onreadystatechange = function () {
                if (forecastRequest.readyState === 4 && forecastRequest.status === 200) {
                    const forecastData = JSON.parse(forecastRequest.responseText);
                    const periods = forecastData.properties.periods;

                    let result = `\n********** Weather in ${city} **********\n`;

                    periods.forEach(period => {
                        result += `${period.name} - ${period.detailedForecast}\n` ;
                    });

                    myApp.weatherLog(result);
                    myApp.get("getWeather").innerText = "Get Weather";
               }

            };

            forecastRequest.send();
        }
    };

    pointsRequest.send();

}

myApp.getCity = function()
{
    return myApp.get("city").value;
}

myApp.weatherLog = function(text)
{
    myApp.get("weather").value+=text;
}

myApp.clearWeather = function()
{
    myApp.get("weather").value="";
}

myApp.get=function(name)
{
    return document.getElementById(name);
}
