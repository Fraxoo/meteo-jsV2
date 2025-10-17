async function main() {

    /**
     * 
     * @param { number } longitude 
     * @param { number } latitude 
     * @returns 
     */
    async function getWeather(longitude, latitude) {
        try {
            const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,weather_code,sunrise,sunset,daylight_duration,rain_sum,snowfall_sum,wind_speed_10m_max,precipitation_probability_max,cloud_cover_mean,cloud_cover_max&hourly=temperature_2m,is_day,rain,snowfall,apparent_temperature,precipitation_probability,cloud_cover&current=temperature_2m,rain,is_day,apparent_temperature,snowfall,cloud_cover,wind_speed_10m&timezone=Europe%2FLondon&forecast_hours=24`)
            const respons = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`); //si marhc eplus retire s http

            const meteo = await res.json();
            const town = await respons.json();

            return { meteo, town };
        } catch (error) {
            console.error(error);
        }
    }


    /**
     * 
     * @param { string } town 
     */
    async function getWeatherByTown(town) {
        try {
            const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${town}&count=1&language=fr&format=json`).then(response => response.json());

            if (response.results.length > 0) {

                const latitude = response.results[0].latitude;
                const longitude = response.results[0].longitude;
                const meteo = await getWeather(longitude, latitude);

                showMeteo(meteo.meteo, response.results[0].name)
            } else {

            }
        } catch (error) {
            console.error(error);
        }
    }



    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const meteo = await getWeather(position.coords.longitude, position.coords.latitude);

                console.log(meteo);

                showMeteo(meteo.meteo, meteo.town.address.municipality)
            },
            async (error) => {
                console.warn("Géolocalisation refusée :", error.message);
                getWeatherByTown("Paris");
            }
        );
    } else { // Si l’API n’existe pas du tout
        getWeatherByTown("Paris");
    }

    window.addEventListener("load", () => {
        const searchInput = document.querySelector("#search");
        if (searchInput) {
            searchInput.value = "";
        }
    });

    const searchBar = document.querySelector("#search-bar");

    searchBar.addEventListener("submit", (event) => {
        event.preventDefault();

        const erase1 = document.querySelector(".bottom-main").innerHTML = "";
        const erase2 = document.querySelector(".forecast-mid").innerHTML = "";

        const formData = new FormData(searchBar);

        const town = formData.get("search");

        getWeatherByTown(town);
    })



}

main();

/**
 * 
 * @param {object} meteo 
 * @param {string} town 
 */
function showMeteo(meteo, town) {
    showCurrentMeteo(meteo, town);
    showDailyMeteo(meteo);
    showHourlyMeteo(meteo);
}


/**
 * 
 * @param {object} meteo 
 */
function showDailyMeteo(meteo) {
    const type = "daily"
    const weather = convertInfoToConst(meteo, type);
    const bottomMainDiv = document.querySelector(".bottom-main");

    for (let i = 0; i < meteo.daily.time.length; i++) {
        const bottomMainTemplate = document.querySelector("#bottom-main");
        const clone = bottomMainTemplate.content.cloneNode(true);
        const dateString = weather.meteoHour[i];
        const date = new Date(dateString);

        const day = date.toLocaleDateString("fr-FR", { weekday: "long" });
        if (day[i] === day[0]) {
            const day_elem = clone.querySelector(".day").textContent = "Aujourd'hui";
        } else {
            const day_elem = clone.querySelector(".day").textContent =
                day.charAt(0).toUpperCase() + day.slice(1);
        }

        const img = clone.querySelector("img").setAttribute("src", convertMeteoToAsset({
            isDay_bool: 1,
            "meteoCloud_number": weather.meteoDailyCloud[i],
            "meteoRain_number": weather.meteoDailyRain[i],
            "meteoSnow": weather.meteoDailysnow[i]
        }));

        const bottomMainInfoTemp = clone.querySelector(".bottom-main-info-temp");
        const maxTemp = bottomMainInfoTemp.querySelector("h3").textContent = `${Math.round(weather.meteoMaxTemp[i])}°`;
        const minTemp = bottomMainInfoTemp.querySelector(".min-temp").textContent = `${Math.round(weather.meteoMinTemp[i])}°`;

        bottomMainDiv.appendChild(clone);
    }
}



/**
 * affiche la meteo actuel a l'emplacement choisi et les info comme la vitesse du vent etc
 * @param {object} meteo //result of fetch function
 */
function showHourlyMeteo(meteo) {
    const type = "hourly";
    const weather = convertInfoToConst(meteo, type);

    const forecastMidDiv = document.querySelector(".forecast-mid");
    for (let i = 0; i < meteo.hourly.time.length; i++) {

        const forecastMidTemplate = document.querySelector("#forecast-mid")
        const clone = forecastMidTemplate.content.cloneNode(true);

        const hour = clone.querySelector("p").textContent = weather.meteoHour[i].split("T")[1];

        const temp = clone.querySelector("h3").textContent = `${weather.meteoTemp[i]}°`;
        const img = clone.querySelector("img");

        img.setAttribute("src", convertMeteoToAsset({
            isDay_bool: weather.isDay[i],
            "meteoCloud_number": weather.meteoCloud[i],
            "meteoRain_number": weather.meteoRain[i],
            "meteoSnow": weather.meteoSnow[i]
        }))

        forecastMidDiv.appendChild(clone);
    }
}



/**
 * 
 * @param {object} meteo //result of fetch function
 * @param {string} town 
 */
function showCurrentMeteo(meteo, town) {

    const type = "current"

    const weather = convertInfoToConst(meteo, type);

    const mainTop = document.querySelector(".main-top");
    
    const topH1 = mainTop.querySelector("h1").textContent = town;

    const rainChances = mainTop.querySelector("p").textContent = `Chance de pluie: ${meteo.daily.precipitation_probability_max[0]}%`;

    const temp = mainTop.querySelector("h2").textContent = `${meteo.current.temperature_2m}°`;

    const img = mainTop.querySelector("img").setAttribute("src", convertMeteoToAsset({
        isDay_bool: weather.isDay,
        "meteoCloud_number": weather.meteoCloud,
        "meteoRain_number": weather.meteoRain,
        "meteoSnow": weather.meteoSnow
    }));




    const midInfo = document.querySelector(".mid-info");

    const realFeel = midInfo.querySelector(".real-feel").querySelector("h3").textContent = `${weather.meteoApparentTemp}°`;

    const wind = midInfo.querySelector(".wind").querySelector("h3").textContent = `${weather.meteoWind} km/h`;
}




/**
 * 
 * @param {number} meteoRain_number millimeter of water on the ground
 * @param {number} meteoCloud_number from 0 (no cloud) to 100 (full cloud)
 * @param {number} meteoSnow_number centimeter of snow of the ground
 * @param {1|0} isDay 
 * @returns 
 */
function convertMeteoToAsset(option = { isDay_bool: null, meteoRain_number: null, meteoCloud_number: null, meteoSnow: null, meteoDailyCloud: null }) {

    let imgSrc = "";
    let { isDay_bool, meteoRain_number, meteoCloud_number, meteoSnow } = option;

    if (meteoRain_number > 1) {
        imgSrc = "images/douche.png";
    } else if (meteoCloud_number > 20 && meteoCloud_number < 50 && (isDay_bool === 1 || isDay_bool === null)) {
        imgSrc = "images/nuage.png";
    } else if (meteoCloud_number > 20 && meteoCloud_number < 50 && (isDay_bool === 1 || isDay_bool === null)) {
        imgSrc = "images/night.png"
    } else if (meteoCloud_number > 50) {
        imgSrc = "images/nuage(1).png";
    } else if (meteoSnow > 0) {
        imgSrc = "images/snowfall.png";
    } else if (meteoCloud_number > 80 && meteoRain_number > 1) {
        imgSrc = "images/orage.png";
    } else if (isDay_bool === 0) {
        imgSrc = "images/nuit.png";
    } else {
        imgSrc = "images/ensoleille.png";
    }

    return imgSrc;
}


/**
 * @param {object} meteo //result of fetch function 
 * @param {string} type //type of data
 */
function convertInfoToConst(meteo, type) {
    const meteoHour = meteo[type].time;
    const meteoTemp = meteo[type].temperature_2m;
    const meteoApparentTemp = meteo[type].apparent_temperature;
    const meteoPrecipitationProbab = meteo[type].precipitation_probability;
    const meteoRain = meteo[type].rain;
    const meteoSnow = meteo[type].snowfall;
    const meteoCloud = meteo[type].cloud_cover;
    const isDay = meteo[type].is_day;
    const meteoWind = meteo[type].wind_speed_10m;
    const meteoMaxTemp = meteo[type].temperature_2m_max;
    const meteoMinTemp = meteo[type].temperature_2m_min;
    const meteoDailyCloud = meteo.daily.cloud_cover_mean;
    const meteoDailyRain = meteo.daily.rain_sum;
    const meteoDailysnow = meteo.daily.snowfall_sum;

    return {
        meteoHour,
        meteoTemp,
        meteoApparentTemp,
        meteoPrecipitationProbab,
        meteoRain,
        meteoSnow,
        meteoCloud,
        isDay,
        meteoWind,
        meteoMaxTemp,
        meteoMinTemp,
        meteoDailyCloud,
        meteoDailyRain,
        meteoDailysnow
    };
}