const express = require('express')
const https = require('node:https');
const bodyParser = require('body-parser')

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/app.html");
});
app.post("/", function (req, res) {
    const query = req.body.cityName;
    const key = "a5e255578c2f5c28db418432770664ba";
    const url = "https://api.openweathermap.org/data/2.5/weather?q=" + query + "&appid=" + key + "&units=metric&lang=eng";

    https.get(url, function (response) {
        response.on("data", function (data) {
            const weatherData = JSON.parse(data);
            const temp = weatherData.main.temp;
            const description = weatherData.weather[0].description;
            const icon = weatherData.weather[0].icon;
            const lon = weatherData.coord.lon;
            const lat = weatherData.coord.lat;
            const ftemp = weatherData.main.feels_like;
            const humidity = weatherData.main.humidity;
            const pressure = weatherData.main.pressure;
            const windSpeed = weatherData.wind.speed;
            const countryCode = weatherData.sys.country;
            const imageURL = "https://openweathermap.org/img/wn/" + icon + "@2x.png";
            res.write(`<h1>
  The current temperature in ${query} (longitude: ${lon}, latitude: ${lat}) with the country code ${countryCode} is ${temp}, but it feels like ${ftemp}.
  Humidity stands at ${humidity}.
  The atmospheric pressure registers ${pressure}.
  Wind speed is ${windSpeed}.
  The weather condition is described as ${description}.</h1>
  <img src="${imageURL}"><br>
`);
            const rainurl = "https://api.openweathermap.org/data/2.5/forecast?q=" + query + "&appid=" + key + "&units=metric";
            https.get(rainurl, function (rainResponse) {
                let rainData = "";

                rainResponse.on("data", function (chunk) {
                    rainData += chunk;
                });

                rainResponse.on("end", function () {

                    const rainVolume = JSON.parse(rainData);


                    var rain3h = 0;
                    if (rainVolume.list[1].rain && rainVolume.list[1].rain['3h']) {
                        rain3h = rainVolume.list[1].rain['3h'];
                    }
                    res.write("<h1>Rain volume for last 3 hours is " + rain3h + " </h1>")
                });
            });
        });


    });

    https.get('https://uselessfacts.jsph.pl/api/v2/facts/random', function (FactResponse) {
        FactResponse.on('data', function (FactData) {
            const Fact = JSON.parse(FactData);
            const randomFact = Fact.text;
            res.write(`<h1>Fact: ${randomFact}</h1>`);
        });
    });
    https.get('https://v2.jokeapi.dev/joke/Any', function (JokeResponse) {
        let JokeData = '';
    
        JokeResponse.on('data', function (chunk) {
            JokeData += chunk;
        });
    
        JokeResponse.on('end', function () {
            try {
                const Joke = JSON.parse(JokeData);
    
                let randomJoke = "";
    
                if (Joke.joke) {
                    randomJoke = Joke.joke;
                } else if (Joke.setup && Joke.delivery) {
                    randomJoke = Joke.setup + " " + Joke.delivery;
                } else {
                    randomJoke = "No joke available.";
                }
    
                res.write(`<h1>Joke: ${randomJoke}</h1>`);
            } catch (error) {
                res.write('<h1>Error parsing JSON</h1>');
            }
        });
    });
    
});


app.listen(3000, function () {
    console.log("Server is running on port 3000");
}); 