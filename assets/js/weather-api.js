const WeatherAPI = {
  cache: {},
  cacheDuration: 600000,
  online: navigator.onLine,

  conditions: ['Clear','Clouds','Rain','Drizzle','Thunderstorm','Snow','Mist','Fog','Haze'],
  descriptions: ['clear sky','few clouds','scattered clouds','broken clouds','shower rain','rain','thunderstorm','snow','mist'],

  async fetchForCity(city, countryCode) {
    const key = `${city},${countryCode}`;
    const now = Date.now();
    if (this.cache[key] && now - this.cache[key].timestamp < this.cacheDuration) {
      return this.cache[key].data;
    }
    const data = await this._tryFetch(city, countryCode);
    this.cache[key] = { data, timestamp: now };
    return data;
  },

  async _tryFetch(city, countryCode) {
    if (!this.online) return this._generateFallback(city);

    const url = countryCode
      ? `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)},${countryCode}&units=metric&appid=YOUR_API_KEY`
      : null;

    try {
      if (!url) throw new Error('no url');
      const resp = await fetch(url, { signal: AbortSignal.timeout(4000) });
      if (!resp.ok) throw new Error('API error');
      const json = await resp.json();
      return {
        temp: Math.round(json.main.temp),
        feels_like: Math.round(json.main.feels_like),
        humidity: json.main.humidity,
        wind_speed: json.wind.speed,
        condition: json.weather[0].main,
        description: json.weather[0].description,
        icon: json.weather[0].icon,
        city: json.name,
        source: 'api',
      };
    } catch {
      return this._generateFallback(city);
    }
  },

  _generateFallback(city) {
    const conditions = this.conditions;
    const descriptions = this.descriptions;
    const idx = Math.floor(Math.random() * conditions.length);
    const temp = Math.floor(Math.random() * 35) + 5;
    return {
      temp,
      feels_like: temp + Math.floor(Math.random() * 6) - 3,
      humidity: Math.floor(Math.random() * 60) + 30,
      wind_speed: Math.floor(Math.random() * 30) + 2,
      condition: conditions[idx],
      description: descriptions[idx] || 'clear sky',
      icon: '01d',
      city: city || 'Unknown',
      source: 'fallback',
    };
  },

  getIconHTML(icon) {
    return icon ? `<img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="weather" style="width:48px;height:48px;">` : '<i class="fas fa-cloud-sun" style="font-size:1.5rem;"></i>';
  },

  getConditionIcon(condition) {
    const map = {
      'Clear': 'fas fa-sun',
      'Clouds': 'fas fa-cloud',
      'Rain': 'fas fa-cloud-rain',
      'Drizzle': 'fas fa-cloud-drizzle',
      'Thunderstorm': 'fas fa-bolt',
      'Snow': 'fas fa-snowflake',
      'Mist': 'fas fa-smog',
      'Fog': 'fas fa-smog',
      'Haze': 'fas fa-smog',
    };
    return map[condition] || 'fas fa-cloud-sun';
  },
};
