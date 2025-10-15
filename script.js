async function main() {

    async function getCurrentWeather(latitude, longitude) {
        try {
            const res = await fetch("https://api.open-meteo.com/v1/forecast?latitude=" + latitude + "&longitude=" + longitude + "&current=temperature_2m,is_day,rain,snowfall,cloud_cover&forecast_days=1")
            return res.json();
        } catch (error) {
            console.error(error);
        }
    }

    async function getFullDayPreview(longitude,latitude) {
        try{
            const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,rain,snowfall,cloud_cover,precipitation_probability,apparent_temperature,wind_speed_10m,is_day&forecast_days=1`);
            return res.json();
        }catch(error){
            console.error(error);
        }
    }

    async function getWeeklyPreview(longitude,latitude) {
        try{
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,daylight_duration,rain_sum,wind_speed_10m_max&forecast_days=7`);
        return res.json();
        }catch(error){
            console.error(error);
        }
    }

    const meteo = await getWeeklyPreview(52.52,13.41);
    console.log(meteo);
    


}

main();