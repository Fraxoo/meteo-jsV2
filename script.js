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


    function showCurrentMeteo(meteo, town) {
        const mainTop = document.querySelector(".main-top")
        const topH1 = mainTop.querySelector("h1").textContent = town.address.city;

        const rainChances = mainTop.querySelector("p").textContent = `Chance de pluie: ${meteo.daily.precipitation_probability_max[0]}`;

        const temp = mainTop.querySelector("h2").textContent = meteo.current.temperature_2m;

        const img  = mainTop.querySelector("img").setAttribute("src",convertMeteoToAsset({
                isDay_bool : 1,
                "meteoCloud_number" : 12,
                "meteoRain_number" : 12,
                "meteoSnow" : 12
            }))





    }


    function showForecastMid(meteo) {
        const meteoHour = meteo.hourly.time;
        const meteoTemp = meteo.hourly.temperature_2m;
        const meteoApparentTemp = meteo.hourly.apparent_temperature;
        const meteoPrecipitationProbab = meteo.hourly.precipitation_probability;
        const meteoRain = meteo.hourly.rain;
        const meteoSnow = meteo.hourly.snowfall;
        const meteoCloud = meteo.hourly.cloud_cover;
        const isDay = meteo.hourly.is_day;

        const forecastMidDiv = document.querySelector(".forecast-mid");
        for (let i = 0; i < meteo.hourly.time.length; i++) {

            const forecastMidTemplate = document.querySelector("#forecast-mid")
            const clone = forecastMidTemplate.content.cloneNode(true);

            const hour = clone.querySelector("p").textContent = meteoHour[i].split("T")[1];

            const temp = clone.querySelector("h3").textContent = `${meteoTemp[i]}°`;

            const img = clone.querySelector("img");
            // if (meteoRain[i] > 1) {
            //     img.setAttribute("src", "images/douche.png");
            // } else if (meteoCloud[i] > 20 && meteoCloud[i] < 50 && isDay[i] === 1) {
            //     img.setAttribute("src", "images/nuage.png");
            // } else if (meteoCloud[i] > 20 && meteoCloud[i] < 50 && isDay[i] === 0) {
            //     img.setAttribute("src", "images/night.png")
            // } else if (meteoCloud[i] > 50) {
            //     img.setAttribute("src", "images/nuage(1).png");
            // } else if (meteoSnow[i] > 0) {
            //     img.setAttribute("src", "images/snowfall.png");
            // } else if (meteoCloud[i] > 80 && meteoRain[i] > 1) {
            //     img.setAttribute("src", "images/orage.png");
            // } else if (isDay[i] === 0) {
            //     img.setAttribute("src", "images/nuit.png")
            // } else {
            //     img.setAttribute("src", "images/ensoleille.png");
            // }
            img.setAttribute("src",convertMeteoToAsset({
                isDay_bool : isDay[i],
                "meteoCloud_number" : meteoCloud[i],
                "meteoRain_number" : meteoRain[i],
                "meteoSnow" : meteoSnow[i]
            }))

            forecastMidDiv.appendChild(clone)

        }

    }




}

main();



/**
 * 
 * @param {number} meteoRain_number millimeter of water on the ground
 * @param {number} meteoCloud_number from 0 (no cloud) to 100 (full cloud)
 * @param {number} meteoSnow_number centimeter of snow of the ground
 * @param {1|0} isDay 
 * @returns 
 */
function convertMeteoToAsset(option = {isDay_bool:1,meteoRain_number : 0,meteoCloud_number:0,meteoSnow:0}) {

    let imgSrc = "";
    let {isDay_bool,meteoRain_number,meteoCloud_number,meteoSnow} = option;
    
    if (meteoRain_number > 1) {
        imgSrc =  "images/douche.png";
    } else if (meteoCloud_number > 20 && meteoCloud_number < 50 && isDay_bool === 1) {
        imgSrc =  "images/nuage.png";
    } else if (meteoCloud_number > 20 && meteoCloud_number < 50 && isDay_bool === 0) {
        imgSrc =  "images/night.png"
    } else if (meteoCloud_number > 50) {
        imgSrc =  "images/nuage(1).png";
    } else if (meteoSnow > 0) {
        imgSrc =  "images/snowfall.png";
    } else if (meteoCloud_number > 80 && meteoRain_number > 1) {
        imgSrc =  "images/orage.png";
    } else if (isDay_bool === 0) {
        imgSrc =  "images/nuit.png";
    } else {
        imgSrc =  "images/ensoleille.png";
    }

    return imgSrc;
}