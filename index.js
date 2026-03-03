const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

class Location {
    static #cache = {};

    static async fetch(){
        if( ! this.#cache.data || this.#cache.expire < Date.now() ){
            this.#cache.data = await (await fetch(`http://ip-api.com/json/?fields=66842623&lang=en`)).json();
            this.#cache.expire = Date.now() + 3600000; // Cache for 1 hour
        }

        return {
            country: this.#cache.data.country,
            region: this.#cache.data.regionName,
            city: this.#cache.data.city,
            lat: this.#cache.data.lat,
            lon: this.#cache.data.lon,
            timezone: this.#cache.data.timezone
        }
    }
}

class Weather {
    static #cache = {};

    static codes = {
        0: ['Clear', 'wi-day-sunny', 'wi-night-clear'],
        1: ['Mainly clear', 'wi-day-sunny-overcast', 'wi-night-partly-cloudy'],
        2: ['Partly cloudy', 'wi-day-cloudy', 'wi-night-cloudy'],
        3: ['Overcast', 'wi-day-cloudy-high', 'wi-night-cloudy-high'],
        45: ['Fog', 'wi-fog', 'wi-fog'],
        48: ['Depositing rime fog', 'wi-fog', 'wi-fog'],
        51: ['Light drizzle', 'wi-sprinkle', 'wi-sprinkle'],
        53: ['Drizzle', 'wi-sprinkle', 'wi-sprinkle'],
        55: ['Dense drizzle', 'wi-sprinkle', 'wi-sprinkle'],
        56: ['Freezing drizzle', 'wi-sleet', 'wi-sleet'],
        57: ['Heavy freezing drizzle', 'wi-sleet', 'wi-sleet'],
        61: ['Slight rain', 'wi-raindrops', 'wi-raindrops'],
        63: ['Rain', 'wi-rain', 'wi-rain'],
        65: ['Heavy rain', 'wi-rain', 'wi-rain'],
        66: ['Freezing rain', 'wi-rain-mix', 'wi-rain-mix'],
        67: ['Heavy freezing rain', 'wi-rain-mix', 'wi-rain-mix'],
        71: ['Slight snow fall', 'wi-snow', 'wi-snow'],
        73: ['Snow fall', 'wi-snow', 'wi-snow'],
        75: ['Heavy snow fall', 'wi-snow', 'wi-snow'],
        77: ['Snow grains', 'wi-snow', 'wi-snow'],
        80: ['Slight rain showers', 'wi-showers', 'wi-showers'],
        81: ['Rain showers', 'wi-showers', 'wi-showers'],
        82: ['Heavy rain showers', 'wi-showers', 'wi-showers'],
        85: ['Slight snow showers', 'wi-snow', 'wi-snow'],
        86: ['Heavy snow showers', 'wi-snow', 'wi-snow'],
        95: ['Thunderstorm', 'wi-thunderstorm', 'wi-thunderstorm'],
        96: ['Thunderstorm with slight hail', 'wi-thunderstorm', 'wi-thunderstorm'],
        99: ['Thunderstorm with heavy hail', 'wi-thunderstorm', 'wi-thunderstorm']
    }

    static async fetch(lat, lon){
        if( ! this.#cache.data || ! this.#cache.forecast || this.#cache.expire < Date.now() ){
            this.#cache.data = await (await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`)).json();
            this.#cache.forecast = await (await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=6&timezone=auto`)).json();
            this.#cache.expire = Date.now() + 3600000; // Cache for 1 hour
        }

        let forecast = [];

        for( let i = 0; i < this.#cache.forecast.daily.time.length; i++ ){
            forecast.push({
                date: this.#cache.forecast.daily.time[i],
                code: this.#cache.forecast.daily.weather_code[i],
                status: this.codes[this.#cache.forecast.daily.weather_code[i]],
                temp_max: Math.round(this.celsiusToFahrenheit(this.#cache.forecast.daily.temperature_2m_max[i])),
                temp_min: Math.round(this.celsiusToFahrenheit(this.#cache.forecast.daily.temperature_2m_min[i]))
            });
        }

        return {
            temperature: Math.round(this.celsiusToFahrenheit(this.#cache.data.current_weather.temperature)),
            status: this.codes[this.#cache.data.current_weather.weathercode],
            code: this.#cache.data.current_weather.weathercode,
            forecast
        }
    }

    static celsiusToFahrenheit(celsius){
        return (celsius * 9/5) + 32;
    }
}

class CallMe {
    static init(){
        if( ! window.localStorage["callme__ntfy"] ){
            CallMe.generateUrl();
        }

        document.querySelector("#callme-subscribe").innerText = `ntfy.sh/${window.localStorage["callme__ntfy"]}`;
        document.querySelector("#callme-call").addEventListener("click", CallMe.call);
        document.querySelector("#callme-reset").addEventListener("click", CallMe.generateUrl);
    }

    static generateUrl(){
        window.localStorage["callme__ntfy"] = new Array(15).fill(0).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
        document.querySelector("#callme-subscribe").innerText = `ntfy.sh/${window.localStorage["callme__ntfy"]}`;
    }

    static async call(){
        await fetch(`https://ntfy.sh/${window.localStorage["callme__ntfy"]}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: 'Call me notification sent at ' + new Date().toLocaleTimeString(),
            headers: {
                Title: 'Koikaze'
            }
        });
    }
}

class UI {
    static updateWeather(weather){
        document.querySelector('#weather-temperature').textContent = `${weather.temperature}`;
        document.querySelector('#weather-status').textContent = weather.status[0];
        document.querySelector('#weather-icon').className = `wi ${weather.status[1]}`;

        document.querySelector("#forecast").innerHTML = "";

        for( let day of weather.forecast ){
            let date = new Date(day.date + " UTC");
            let dayName = date.toLocaleDateString(undefined, { weekday: 'short', timeZone: 'UTC' });

            let forecastItem = document.createElement('h3');
            forecastItem.className = 'forecast-day box rounded inset';

            let forecastDate = document.createElement('span');
            forecastDate.className = 'forecast-date';
            forecastDate.textContent = dayName;
            forecastItem.appendChild(forecastDate);

            let forecastIcon = document.createElement('i');
            forecastIcon.className = `wi ${day.status[1]}`;
            forecastItem.appendChild(forecastIcon);

            let forecastTemperatureMax = document.createElement('span');
            forecastTemperatureMax.className = 'forecast-temperature-max';
            forecastTemperatureMax.textContent = `${day.temp_max}°`;
            forecastItem.appendChild(forecastTemperatureMax);

            let forecastTemperatureMin = document.createElement('span');
            forecastTemperatureMin.className = 'forecast-temperature-min';
            forecastTemperatureMin.textContent = `${day.temp_min}°`;
            forecastItem.appendChild(forecastTemperatureMin);

            document.querySelector('#forecast').appendChild(forecastItem);
        }
    }

    static updateTime(){
        const now = new Date();

        let time = now.getHours();
        if( time > 12 ){
            time = time%12 + ":" + now.getMinutes().toString().padStart(2, '0') + " pm";
        } else {
            time = time + ":" + now.getMinutes().toString().padStart(2, '0') + " am";
        }

        document.querySelector("#time").textContent = time;
        document.querySelector("#date").textContent = `${now.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' })}`;
    }

    static initDraggables(){
        const draggables = document.querySelectorAll('.draggable');

        draggables.forEach(draggable => {
            const events = ['mousedown', 'touchstart'];

            for( let event of events ){
                draggable.addEventListener(event, (e) => {
                    document.querySelector(".window.last") ? document.querySelector(".window.last").classList.remove("last") : null;
                    draggable.classList.add("last");

                    document.querySelector(".icon.selected") ? document.querySelector(".icon.selected").classList.remove("selected") : null;

                    if( e.target.tagName === 'A' || e.target.tagName == 'TEXTAREA' || e.target.tagName == 'INPUT' || e.target.tagName == 'SELECT' || e.target.tagName == 'BUTTON' ) return;
                    e.preventDefault();

                    const rect = draggable.getBoundingClientRect();
                    const startLeft = rect.left + window.scrollX;
                    const startTop = rect.top + window.scrollY; 

                    draggable.style.position = 'absolute';
                    draggable.style.left = `${startLeft}px`;
                    draggable.style.top = `${startTop}px`;
                    draggable.style.margin = '0';

                    const offsetX = (e.pageX || (e.touches || [])[0]?.pageX) - startLeft;
                    const offsetY = (e.pageY || (e.touches || [])[0]?.pageY) - startTop;

                    const onMouseMove = (e) => {
                        const newLeft = (e.pageX || (e.touches || [])[0]?.pageX) - offsetX;
                        const newTop = (e.pageY || (e.touches || [])[0]?.pageY) - offsetY;
                        draggable.style.left = `${newLeft}px`;
                        draggable.style.top = `${newTop}px`;
                        draggable.classList.add('dragging');

                        if( draggable.getAttribute("name") ){
                            window.localStorage["draggable__" + draggable.getAttribute("name")] = JSON.stringify({ left: newLeft, top: newTop });
                        }
                    };

                    const onMouseUp = () => {
                        document.removeEventListener('mousemove', onMouseMove);
                        document.removeEventListener('mouseup', onMouseUp);
                        document.removeEventListener('touchmove', onMouseMove);
                        document.removeEventListener('touchend', onMouseUp);
                        window.removeEventListener('mousemove', onMouseMove);
                        window.removeEventListener('mouseup', onMouseUp);
                        window.removeEventListener('touchmove', onMouseMove);
                        window.removeEventListener('touchend', onMouseUp);

                        draggable.classList.remove('dragging');
                    };

                    document.addEventListener('mousemove', onMouseMove);
                    document.addEventListener('touchmove', onMouseMove);
                    document.addEventListener('mouseup', onMouseUp);
                    document.addEventListener('touchend', onMouseUp);

                    window.addEventListener('mousemove', onMouseMove);
                    window.addEventListener('touchmove', onMouseMove);
                    window.addEventListener('mouseup', onMouseUp);
                    window.addEventListener('touchend', onMouseUp);
                });
            }

            if( window.localStorage["draggable__" + draggable.getAttribute("name")] ){
                const pos = JSON.parse(window.localStorage["draggable__" + draggable.getAttribute("name")]);
                draggable.style.position = 'absolute';
                draggable.style.left = `${pos.left}px`;
                draggable.style.top = `${pos.top}px`;
                draggable.style.margin = '0';
            }
        });
    }

    static initWindowClose(){
        for( let event of ['click', 'touchstart'] ){
                window.addEventListener(event, (e) => {
                    if( ! e.target.classList.contains('window') ) return;

                    const rect = e.target.getBoundingClientRect();

                    // detect if this is a touch event. if so, get the coordinates from the touch event instead of the mouse event.
                    const p = (e.touches && e.touches.length) ? e.touches[0]
                            : (e.changedTouches && e.changedTouches.length) ? e.changedTouches[0]
                            : e;

                    const offsetX = p.clientX - rect.left;
                    const offsetY = p.clientY - rect.top;

                    if (
                        offsetX > e.target.clientWidth - 28 && offsetX < e.target.clientWidth - 10 &&
                        offsetY >= 10 && offsetY < 28
                    ){
                        e.target.classList.add('closed');
                        delete window.localStorage["draggable__" + e.target.getAttribute("name")];
                        e.target.style.position = null;
                        e.target.style.left = null;
                        e.target.style.top = null;
                        e.target.style.margin = null;
                        e.preventDefault();
                    }
            });
        }
    }

    static initIcons(){
        document.querySelectorAll('.icon').forEach(icon => {
            // click handler (mouse & synthesized click after touch)
            icon.addEventListener('click', (e) => {
                if (icon.dataset.skipClick) { delete icon.dataset.skipClick; return; }

                const previous = document.querySelector('.icon.selected');
                if (previous && previous !== icon) previous.classList.remove('selected');

                if (icon.classList.contains('selected')){
                    icon.classList.remove('selected');

                    const name = icon.getAttribute('name');
                    const win = document.querySelector(`.window[name="${name}"]`);

                    if (win){
                        win.classList.remove('closed');

                        document.querySelector(".window.last") ? document.querySelector(".window.last").classList.remove("last") : null;

                        win.classList.add('last');
                    }
                } else {
                    icon.classList.add('selected');
                }
            });

            // touch: detect double-tap to launch (time + distance threshold)
            icon.addEventListener('touchend', (e) => {
                if (!e.changedTouches || !e.changedTouches.length) return;
                const now = Date.now();
                const t = e.changedTouches[0];
                const x = t.clientX, y = t.clientY;
                const last = icon._lastTap || { time: 0, x: 0, y: 0 };
                const dt = now - last.time;
                const dx = x - (last.x || 0);
                const dy = y - (last.y || 0);
                const dist2 = dx*dx + dy*dy;

                // double-tap if within 350ms and within ~30px
                if (dt > 0 && dt < 350 && dist2 < (30 * 30)){
                    const name = icon.getAttribute('name');
                    const win = document.querySelector(`.window[name="${name}"]`);
                    if (win){
                        win.classList.remove('closed');
                        win.classList.add('last');
                    }

                    // prevent the synthesized click from duplicating behavior
                    icon.dataset.skipClick = '1';
                    e.preventDefault();
                    icon._lastTap = { time: 0, x: 0, y: 0 };
                    return;
                }

                icon._lastTap = { time: now, x, y };
            });
        });
    }

    static initScreensaver(timeoutSec = 180000){
        const screensavers = [];

        if( window.HeyMacaroni ) screensavers.push(HeyMacaroni);
        if( window.SteamDiscover ) screensavers.push(SteamDiscover);

        const events = [ "mousemove", "keydown", "mousedown", "touchstart", "scroll" ];

        let ss;
        let timeout;

        const resetTimer = () => {
            if( ss ) ss.stop();
            if( timeout ) clearTimeout(timeout);

            timeout = setTimeout(() => {
                ss = new screensavers[Math.floor(Math.random() * screensavers.length)]();
            }, timeoutSec);
        }

        events.forEach(event => {
            window.addEventListener(event, resetTimer);
        });
    }
}

window.addEventListener("load", () => {
    UI.initScreensaver();

    let update = async function(){
        const location = await Location.fetch();
        const weather = await Weather.fetch(location.lat, location.lon);

        UI.updateWeather(weather);
        UI.updateTime();
    };

    document.querySelector("#notepad").addEventListener("keyup", () => {
        window.localStorage.notepad = document.querySelector("#notepad").value;
    });

    document.querySelector("#notepad").value = window.localStorage.notepad || "";

    setInterval(update, 60000);
    update();

    setTimeout(() => history.go(0), 12000000);

    UI.initWindowClose();
    UI.initDraggables();
    UI.initIcons();

    CallMe.init();
});