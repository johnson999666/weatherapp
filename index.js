const express = require('express');
const axios = require('axios');

const app = express();
const port = 3000;

const UNSPLASH_ACCESS_KEY = 'vED9k9K6oUnDwtabdRg9_GO8_m_8btNLqcxu9exHeCU';
const OPENWEATHERMAP_API_KEY = '6ba32f41bb0c05cbb768a80023a771e0';

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Set up a route to handle GET requests
app.get('/', (req, res) => {
  const cityName = req.query.city;
  let imageURL = '';
  let searchedImage = false;
  let temperature = '';
  let searchedWeather = false;
  let forecast = null;

  if (cityName) {
    // Make a request to the Unsplash API
    axios
      .get('https://api.unsplash.com/search/photos', {
        params: {
          query: cityName,
          client_id: UNSPLASH_ACCESS_KEY,
        },
      })
      .then((imageResponse) => {
        // Retrieve the image URL from the API response
        imageURL = imageResponse.data.results[0]?.urls?.regular || '';
        searchedImage = true;

        // Make a request to the OpenWeatherMap API for current weather
        axios
          .get('https://api.openweathermap.org/data/2.5/weather', {
            params: {
              q: cityName,
              appid: OPENWEATHERMAP_API_KEY,
              units: 'metric',
            },
          })
          .then((weatherResponse) => {
            // Retrieve the temperature from the API response
            temperature = weatherResponse.data.main?.temp || '';
            searchedWeather = true;

            // Make a request to the OpenWeatherMap API for forecast
            axios
              .get('https://api.openweathermap.org/data/2.5/forecast', {
                params: {
                  q: cityName,
                  appid: OPENWEATHERMAP_API_KEY,
                  units: 'metric',
                },
              })
              .then((forecastResponse) => {
                // Retrieve the forecast data from the API response
                const forecastList = forecastResponse.data.list;
                const numDays = parseInt(req.query.days) || 5; // Get the number of days from the query parameter, default to 5 if not provided

                forecast = {
                  list: forecastList.slice(0, numDays).map((item) => ({
                    date: item.dt_txt,
                    temp: item.main.temp,
                    iconURL: `https://openweathermap.org/img/wn/${item.weather[0].icon}.png`,
                    description: item.weather[0].description,
                    willRain: item.weather[0].main === 'Rain',
                  })),
                };

                // Render the index.ejs template with the image URL, temperature, and forecast
                res.render('index', { cityName, imageURL, temperature, searchedImage, searchedWeather, forecast });
              })
              .catch((error) => {
                console.error('Error fetching forecast:', error);
                res.render('error', { message: 'Error fetching forecast' });
              });
          })
          .catch((error) => {
            console.error('Error fetching weather:', error);
            res.render('error', { message: 'Error fetching weather' });
          });
      })
      .catch((error) => {
        console.error('Error fetching image:', error);
        res.render('error', { message: 'Error fetching image' });
      });
  } else {
    // Render the index.ejs template without image URL, temperature, and forecast
    res.render('index', { cityName, imageURL, temperature, searchedImage, searchedWeather, forecast });
  }
});

// Start the server
app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
  });
  
