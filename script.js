const apiKey = "845c59842a4240c48f725347252305";
const city = "Las Piedras";

document.addEventListener("DOMContentLoaded", () => {
    getWeather(city);
});

async function getWeather(cityName) {
    try {
        const res = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(cityName)}&days=9&lang=es`);
        const data = await res.json();

        setBackgroundByWeather(data.current.condition.code, data.current.is_day);
        showCurrentWeather(data);
        showAstroData(data.forecast.forecastday[0]);
        showHourly(data.forecast.forecastday[0].hour);
        showForecast(data.forecast.forecastday);
    } catch (error) {
        alert("Error al obtener los datos del clima.");
        console.error(error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    getWeather(city);

    // Actualizar cada 1 minuto (60000 ms)
    setInterval(() => {
        getWeather(city);
    }, 60000);
});


function setBackgroundByWeather(code, is_day) {
    const body = document.body;
    body.className = ""; // reset classes

    const weatherMap = {
        sunny: [1000],
        cloudy: [1003, 1006, 1009],
        rainy: [1063, 1072, 1150, 1153, 1180, 1183, 1186, 1189, 1192, 1195, 1240],
        stormy: [1087, 1273, 1276],
        snowy: [1066, 1069, 1114, 1210, 1213, 1216, 1219, 1222, 1225, 1255, 1258, 1261, 1264],
    };

    let className = "sunny"; // default

    if (!is_day) {
        className = "night";
    } else if (weatherMap.snowy.includes(code)) {
        className = "snowy";
    } else if (weatherMap.stormy.includes(code)) {
        className = "stormy";
    } else if (weatherMap.rainy.includes(code)) {
        className = "rainy";
    } else if (weatherMap.cloudy.includes(code)) {
        className = "cloudy";
    }

    body.classList.add(className);
}

// ...resto de funciones: showCurrentWeather, showAstroData, showHourly, showForecast


function showCurrentWeather(data) {
    const w = data.current;
    const loc = data.location;
    const container = document.getElementById("current-weather");

    container.innerHTML = `
        <div class="weather-card">
            <h2>${loc.name}, ${loc.country}</h2>
            <img src="https:${w.condition.icon}" alt="${w.condition.text}">
            <p><strong>${w.condition.text}</strong></p>

            <p>🌡️ <strong>Temp:</strong> ${w.temp_c}°C (Sensación: ${w.feelslike_c}°C)</p>

            <p>💧 <strong>Humedad:</strong> ${w.humidity}% </p>

            <p>🌬️ <strong>Viento:</strong> ${w.wind_kph} km/h (${w.wind_dir})</p>
            <p>💨 <strong>Ráfagas:</strong> ${w.gust_kph} km/h</p>

            <p>🌥️ <strong>Nubosidad:</strong> ${w.cloud}% 
            | 🌞 <strong>UV:</strong> ${w.uv}</p>

            <p>👁️ <strong>Visibilidad:</strong> ${w.vis_km} km 
            | 📌 <strong>Presión:</strong> ${w.pressure_mb} hPa</p>

            <p><small>Última actualización: ${w.last_updated}</small></p>
        </div>
    `;

    // Cambiar favicon según el clima
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
    }
    link.href = `https:${w.condition.icon}`;
}


function showAstroData(day) {
    const a = day.astro;
    const container = document.getElementById("astro");

    container.innerHTML = `
        <div class="weather-card">
            <h3>🌙 Datos Astronómicos</h3>
            <p>☀️ <strong>Amanecer:</strong> ${a.sunrise} | 🌇 <strong>Atardecer:</strong> ${a.sunset}</p>
            <p>🌙 <strong>Salida de la Luna:</strong> ${a.moonrise} | 🌌 <strong>Puesta:</strong> ${a.moonset}</p>
            <p>🌔 <strong>Fase lunar:</strong> ${a.moon_phase} (${a.moon_illumination}% iluminada)</p>
        </div>
    `;
}

function showHourly(hourly) {
    const container = document.getElementById("hourly");
    container.innerHTML = `<h3>🕒 Pronóstico por hora (Hoy)</h3><div class="hourly-container"></div>`;

    const scrollArea = container.querySelector(".hourly-container");

    hourly.forEach(h => {
        const time = new Date(h.time).getHours();
        scrollArea.innerHTML += `
            <div class="hour-block">
                <p><strong>${time}:00</strong></p>
                <img src="https:${h.condition.icon}" alt="${h.condition.text}">
                <p>${h.temp_c}°C</p>
                <p>${h.condition.text}</p>
                <p>💧${h.humidity}%</p>
            </div>
        `;
    });
}

let forecastData = [];
let currentDayIndex = 0;

function showForecast(days) {
    forecastData = days; // guardamos la data completa
    const container = document.getElementById("forecast");
    container.innerHTML = ""; // quitamos el encabezado

    days.forEach((day, index) => {
        const card = document.createElement("div");
        card.className = "weather-card";
        card.innerHTML = `
            <p><strong>${new Date(day.date).toLocaleDateString("es-ES", {
                weekday: 'long', day: 'numeric', month: 'short'
            })}</strong></p>
            <img src="https:${day.day.condition.icon}" alt="${day.day.condition.text}">
            <p>${day.day.condition.text}</p>
            <p>🌡️ Máx: ${day.day.maxtemp_c}°C / Mín: ${day.day.mintemp_c}°C</p>
        `;
        card.addEventListener("click", () => openModal(index));
        container.appendChild(card);
    });
}
/*
function openModal(index) {
    currentDayIndex = index;
    renderModal(currentDayIndex);
    const modal = document.getElementById("forecastModal");
    modal.classList.add("show");
    document.body.style.overflow = "hidden"; // BLOQUEA scroll del body
}

function closeModal() {
    const modal = document.getElementById("forecastModal");
    modal.classList.remove("show");
    document.body.style.overflow = ""; // RESTAURA scroll del body
}


function renderModal(index) {
    const day = forecastData[index];
    const modal = document.getElementById("modalDetails");
    const hours = day.hour;

    modal.innerHTML = `
        <h3>${new Date(day.date).toLocaleDateString("es-ES", {
            weekday: 'long', day: 'numeric', month: 'long'
        })}</h3>
        <p><strong>${day.day.condition.text}</strong></p>
        <img src="https:${day.day.condition.icon}" alt="${day.day.condition.text}">
        <p>🌡️ Máx: ${day.day.maxtemp_c}°C / Mín: ${day.day.mintemp_c}°C</p>
        <p>💧 Humedad: ${day.day.avghumidity}% | 🌬️ Viento: ${day.day.maxwind_kph} km/h</p>
        <p>💦 Prob. Lluvia: ${day.day.daily_chance_of_rain}% | UV: ${day.day.uv}</p>
        <hr>
        <h4>Por hora:</h4>
        <div class="hourly-container">
    ${hours.map(h => `
        <div class="hour-card">
            <div><strong>${h.time.split(' ')[1]}</strong></div>
            <div><img src="https:${h.condition.icon}" alt="${h.condition.text}" title="${h.condition.text}" /></div>
            <div>${h.temp_c}°C</div>
            <div>💧 ${h.humidity}%</div>
            <div>🌬️ ${h.wind_kph} km/h</div>
        </div>
    `).join('')}
</div>

    `;
}

// Botones del modal
document.querySelector(".close").addEventListener("click", closeModal);
document.getElementById("prevDay").addEventListener("click", () => {
    if (currentDayIndex > 0) {
        currentDayIndex--;
        renderModal(currentDayIndex);
    }
});
document.getElementById("nextDay").addEventListener("click", () => {
    if (currentDayIndex < forecastData.length - 1) {
        currentDayIndex++;
        renderModal(currentDayIndex);
    }
});
*/
