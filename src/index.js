"use strict";

import { fromUnixTime, isAfter, isSameDay, format } from "date-fns";

const APIKEYOPENWEATHERMAP = "7c915b43882fb2af93c0f0a4e7e82a11";
const APIKEYUNSPLASH = "MpHPhdZg_Ulo4jeyZLtSey00gUqD1tHJftfwek4rf_o";
const CELSIUS = "°C";
const FAHRENHEIT = "°F";
const contentEl = document.getElementById("content");

const mainEl = document.createElement("main");
mainEl.classList.add("main");
mainEl.innerHTML = `
<div class="main-bg-photo-links">
  <div class="main-bg-photo-author"></div>
  <div class="main-bg-photo-place"></div>
</div>
<div class="main-weather">
  <div class="main-gradus-degree"></div>
  <div class="main-switch-degrees-btns">
    <button class="main-celsius-btn choosed" type="button">${CELSIUS}</button>
    <button class="main-fahrenheit-btn" type="button">${FAHRENHEIT}</button>
  </div>
  <div class="main-city">
    <div class="main-city-name"></div>
    <div class="main-date"></div>
  </div>
  <div class="main-weather-condition"></div>
</div>
`;

const asideEl = document.createElement("aside");
asideEl.classList.add("aside");
asideEl.innerHTML = `
<div class="aside-search">
  <input
    type="search"
    name="search"
    id="search"
    placeholder="Another location"
  />
  <button class="search-btn" title="Search" type="button">
    <svg class="search-icon" viewBox="0 0 24 24">
      <path
        d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"
      />
    </svg>
  </button>
</div>
<div class="aside-daily-weather">
  <div class="aside-daily-weather-title">Daily Weather</div>
</div>
<div class="aside-weather-details">
  <div class="aside-weather-details-title">Weather Details</div>
</div>
`;

contentEl.append(mainEl, asideEl);

const bgPhotoAuthorContainer = mainEl.querySelector(".main-bg-photo-author");
const bgPhotoPlaceContainer = mainEl.querySelector(".main-bg-photo-place");
const gradusDegreeContainer = mainEl.querySelector(".main-gradus-degree");
const celsiusButton = mainEl.querySelector(".main-celsius-btn");
const fahrenheitButton = mainEl.querySelector(".main-fahrenheit-btn");
const cityNameContainer = mainEl.querySelector(".main-city-name");
const dateContainer = mainEl.querySelector(".main-date");
const weatherConditionContainer = mainEl.querySelector(
  ".main-weather-condition"
);
const dailyWeatherContainer = asideEl.querySelector(".aside-daily-weather");
const weatherDetailsContainer = asideEl.querySelector(".aside-weather-details");
const searchInputEl = asideEl.querySelector("#search");
const searchButton = asideEl.querySelector(".search-btn");
const defaultCityName = "London";
let searchInputValue = "";

const parseJSON = (res) => res.json();

const calculateDateTime = function (offset) {
  // get current local time in milliseconds
  const date = new Date();
  const localTime = date.getTime();

  // get local timezone offset and convert to milliseconds
  const localOffset = date.getTimezoneOffset() * 60000;

  // obtain the UTC time in milliseconds
  const utc = localTime + localOffset;

  const newDateTime = utc + 3600000 * offset;

  const convertedDateTime = format(
    new Date(newDateTime),
    "HH:mm cccc d LLL yy"
  ).toLocaleString();

  return { newDateTime, convertedDateTime };
};

const convertTempDegrees = async function (oneCallAPI, tempDegreeUnit) {
  const currentWeatherDescription = oneCallAPI.current.weather[0].description;

  gradusDegreeContainer.textContent = Math.round(
    oneCallAPI.current.temp
  ).toString();

  const cityTimezoneOffset = oneCallAPI.timezone_offset;
  const cityTime = calculateDateTime(cityTimezoneOffset / 3600);
  dateContainer.textContent = cityTime.convertedDateTime;

  weatherConditionContainer.innerHTML = `
  <img
  class="main-weather-condition-icon"
  title="${currentWeatherDescription}"
  src="https://openweathermap.org/img/wn/${oneCallAPI.current.weather[0].icon}@2x.png"
  alt="${currentWeatherDescription}"
  />
  <div class="main-weather-condition-text">${currentWeatherDescription}</div>
  `;

  const dailyWeatherListContainer = document.createElement("ul");

  for (let i = 0; i < oneCallAPI.daily.length; i++) {
    if (
      isAfter(
        new Date(fromUnixTime(oneCallAPI.daily[i].dt)),
        new Date(cityTime.newDateTime)
      ) &&
      !isSameDay(
        new Date(cityTime.newDateTime),
        new Date(fromUnixTime(oneCallAPI.daily[i].dt))
      )
    ) {
      const liEl = document.createElement("li");
      liEl.classList.add("aside-weather");
      liEl.innerHTML = `
      <img
      class="aside-weather-logo"
      title="${oneCallAPI.daily[i].weather[0].description}"
      src="https://openweathermap.org/img/wn/${
        oneCallAPI.daily[i].weather[0].icon
      }@2x.png"
      alt="${oneCallAPI.daily[i].weather[0].description}"
      />
      <div>
        <span class="aside-week-day-name">${format(
          new Date(fromUnixTime(oneCallAPI.daily[i].dt)),
          "cccc"
        )}</span>
        <span title='Max temperature' class="aside-weather-temp-max">${Math.round(
          oneCallAPI.daily[i].temp.max
        ).toString()} ${tempDegreeUnit}</span>
        <span title='Min temperature' class="aside-weather-temp-min">${Math.round(
          oneCallAPI.daily[i].temp.min
        ).toString()} ${tempDegreeUnit}</span>
      </div>
      `;

      dailyWeatherListContainer.appendChild(liEl);
    }
  }

  if (dailyWeatherContainer.querySelector("ul")) {
    dailyWeatherContainer.querySelector("ul").remove();
  }

  dailyWeatherContainer.appendChild(dailyWeatherListContainer);

  const weatherDetailsListContainer = document.createElement("ul");

  weatherDetailsListContainer.innerHTML = `
  <li class="aside-weather-detail">
    <span class="aside-weather-detail-text">Feels Like</span>
    <span>${Math.round(
      oneCallAPI.current.feels_like
    ).toString()} ${tempDegreeUnit}</span>
  </li>
  <li class="aside-weather-detail">
    <span class="aside-weather-detail-text">Humidity</span>
    <span>${oneCallAPI.current.humidity} %</span>
  </li>
  <li class="aside-weather-detail">
    <span class="aside-weather-detail-text">Cloudiness</span>
    <span>${oneCallAPI.current.clouds} %</span>
  </li>
  <li class="aside-weather-detail">
    <span class="aside-weather-detail-text">UV Index</span>
    <span>${oneCallAPI.current.uvi}</span>
  </li>
  <li class="aside-weather-detail">
    <span class="aside-weather-detail-text">Wind Speed</span>
    <span>${oneCallAPI.current.wind_speed} m/s</span>
  </li>
  `;

  if (weatherDetailsContainer.querySelector("ul")) {
    weatherDetailsContainer.querySelector("ul").remove();
  }

  weatherDetailsContainer.appendChild(weatherDetailsListContainer);
};

const getWeatherData = async function (location) {
  try {
    const cityInfo = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${location}&appid=${APIKEYOPENWEATHERMAP}`
    ).then(parseJSON);

    const cityLatitude = cityInfo[0].lat;
    const cityLongitude = cityInfo[0].lon;
    const cityName = cityInfo[0].name;

    const [oneCallC, oneCallF] = await Promise.all([
      fetch(
        `https://api.openweathermap.org/data/2.5/onecall?lat=${cityLatitude}&lon=${cityLongitude}&exclude=minutely,hourly&appid=${APIKEYOPENWEATHERMAP}&units=metric`
      ),
      fetch(
        `https://api.openweathermap.org/data/2.5/onecall?lat=${cityLatitude}&lon=${cityLongitude}&exclude=minutely,hourly&appid=${APIKEYOPENWEATHERMAP}`
      ),
    ]).then((values) => Promise.all(values.map(parseJSON)));

    const unsplashPhoto = await fetch(
      `https://api.unsplash.com/photos/random?orientation=landscape&query=${oneCallC.current.weather[0].main}&collections=weather,forecast,sky&per_page=1&client_id=${APIKEYUNSPLASH}`
    ).then(parseJSON);

    document.body.style.backgroundImage = `
    linear-gradient(
      var(--color-neutral-900-transparent-40),
      var(--color-neutral-900-transparent-40)
    ),
    url(${unsplashPhoto.urls.regular})
    `;

    bgPhotoAuthorContainer.innerHTML = `
    <a href="${unsplashPhoto.links.html}" target="_blank">Photo</a>
    by
    <a href="${unsplashPhoto.user.links.html}" target="_blank">
    ${unsplashPhoto.user.name}
    </a>
    `;

    bgPhotoPlaceContainer.textContent = unsplashPhoto.location.name
      ? unsplashPhoto.location.name
      : "";

    cityNameContainer.textContent = cityName;

    convertTempDegrees(oneCallC, CELSIUS);

    fahrenheitButton.classList.remove("choosed");
    celsiusButton.classList.add("choosed");

    celsiusButton.addEventListener("click", function (e) {
      if (e.target) {
        fahrenheitButton.classList.remove("choosed");
        e.target.classList.add("choosed");
      }
      convertTempDegrees(oneCallC, CELSIUS);
    });

    fahrenheitButton.addEventListener("click", function (e) {
      if (e.target) {
        celsiusButton.classList.remove("choosed");
        e.target.classList.add("choosed");
      }
      convertTempDegrees(oneCallF, FAHRENHEIT);
    });

    searchInputEl.value = "";
    searchInputValue = "";
  } catch {
    searchInputEl.value = "";
    searchInputValue = "";
    alert("Please type the specified name of a location or zip/post code.");
  }
};

document.addEventListener(
  "DOMContentLoaded",
  function () {
    getWeatherData(defaultCityName);
  },
  { once: true }
);

searchInputEl.addEventListener("input", function (e) {
  searchInputValue = e.target.value;
});

searchButton.addEventListener("click", function () {
  getWeatherData(searchInputValue);
});
