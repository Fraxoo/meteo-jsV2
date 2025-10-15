async function main() {

    async function getWeather(longitude, latitude) {
        try {
            const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,weather_code,sunrise,sunset,daylight_duration,rain_sum,snowfall_sum,wind_speed_10m_max,precipitation_probability_max&hourly=temperature_2m,is_day,rain,snowfall,apparent_temperature,precipitation_probability,cloud_cover&current=temperature_2m,rain,is_day,apparent_temperature,snowfall,cloud_cover,wind_speed_10m&timezone=Europe%2FLondon&forecast_hours=24`)
            const respons = await fetch(`http://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);


            const meteo = await res.json();
            const town = await respons.json();

            return { meteo, town };
        } catch (error) {
            console.error(error);
        }
    }

    async function getCoordsByTown(town) {
        try {
            const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${town}&count=10&language=en&format=json`);

            return res.json();

        } catch (error) {
            console.error(error);
        }
    }


    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const meteo = await getWeather(position.coords.longitude, position.coords.latitude);

            console.log(meteo);


            showForecastMid(meteo.meteo);
            showCurrentMeteo(meteo.meteo, meteo.town)
        })

    }




}

main();

/**
 * 
 * @param {object} meteo //result of fetch function
 */
    function showForecastMid(meteo) {
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

            forecastMidDiv.appendChild(clone)

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

        console.log(weather);

        const mainTop = document.querySelector(".main-top")
        const topH1 = mainTop.querySelector("h1").textContent = town.address.city;

        const rainChances = mainTop.querySelector("p").textContent = `Chance de pluie: ${meteo.daily.precipitation_probability_max[0]}`;

        const temp = mainTop.querySelector("h2").textContent = meteo.current.temperature_2m;

        const img = mainTop.querySelector("img").setAttribute("src", convertMeteoToAsset({
            isDay_bool: weather.isDay,
            "meteoCloud_number": weather.meteoCloud,
            "meteoRain_number": weather.meteoRain,
            "meteoSnow": weather.meteoSnow
        }));
    }


/**
 * 
 * @param {number} meteoRain_number millimeter of water on the ground
 * @param {number} meteoCloud_number from 0 (no cloud) to 100 (full cloud)
 * @param {number} meteoSnow_number centimeter of snow of the ground
 * @param {1|0} isDay 
 * @returns 
 */
function convertMeteoToAsset(option = { isDay_bool: 1, meteoRain_number: 0, meteoCloud_number: 0, meteoSnow: 0 }) {

    let imgSrc = "";
    let { isDay_bool, meteoRain_number, meteoCloud_number, meteoSnow } = option;

    if (meteoRain_number > 1) {
        imgSrc = "images/douche.png";
    } else if (meteoCloud_number > 20 && meteoCloud_number < 50 && isDay_bool === 1) {
        imgSrc = "images/nuage.png";
    } else if (meteoCloud_number > 20 && meteoCloud_number < 50 && isDay_bool === 0) {
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

    return {
        meteoHour,
        meteoTemp,
        meteoApparentTemp,
        meteoPrecipitationProbab,
        meteoRain,
        meteoSnow,
        meteoCloud,
        isDay
    };
}