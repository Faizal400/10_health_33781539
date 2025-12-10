// routes/weather.js
const express = require('express');
const router = express.Router();
const request = require('request');

// GET /weather
// - If no ?city= provided: just show the form
// - If ?city= is provided: call OpenWeatherMap API and render results
router.get('/', (req, res, next) => {
  const rawCity = (req.query.city || '').trim();

  // If no city given yet, just render the form with no data
  if (!rawCity) {
    return res.render('weather.ejs', {
      query: '',
      weather: null,
      error: null,
    });
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;
  const city = rawCity;
  const url = `http://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
    city
  )}&units=metric&appid=${apiKey}`;

  request(url, (err, response, body) => {
    if (err) {
      // Network / low-level error
      return next(err);
    }

    let weatherData;
    try {
      weatherData = JSON.parse(body);
    } catch (parseErr) {
      // JSON parse error – unexpected response from API
      return res.render('weather.ejs', {
        query: city,
        weather: null,
        error: 'Unable to read weather data right now.',
      });
    }

    // Error / no data from OpenWeather
    if (!weatherData || !weatherData.main || weatherData.cod !== 200) {
      const msg =
        (weatherData && weatherData.message) ||
        'No weather data found for that city.';
      return res.render('weather.ejs', {
        query: city,
        weather: null,
        error: msg,
      });
    }

    // object for the template (Task 3, 4, 5, 6)
    const weather = {
      city: weatherData.name,
      country: weatherData.sys && weatherData.sys.country,
      temp: weatherData.main.temp,
      feelsLike: weatherData.main.feels_like,
      humidity: weatherData.main.humidity,
      pressure: weatherData.main.pressure,
      description:
        weatherData.weather &&
        weatherData.weather[0] &&
        weatherData.weather[0].description,
      windSpeed: weatherData.wind && weatherData.wind.speed,
      windDirection: weatherData.wind && weatherData.wind.deg,
    };

    res.render('weather.ejs', {
      query: city,
      weather,
      error: null,
    });
  });
});

module.exports = router;
