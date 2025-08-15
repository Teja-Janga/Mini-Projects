
// Alt + 0176 for degrees " ° ".
// Kelvin to Celcius = K - 273.15
// Kelvin to Fahrenheit = (k - 273.15) * (9/5) + 32. 


// 🎯 Get DOM elements with unique, descriptive names
const userCityInput = document.getElementById('cityNameInput');
const fetchWeatherButton = document.getElementById('fetchWeatherDataButton');
const weatherResultsDisplay = document.getElementById('weatherResultsContainer');

// 🌐 API configuration with descriptive variable names
const openWeatherApiKey = 'Your_Actual_API_Key'; // In real app, use your actual API key
const weatherApiBaseUrl = 'https://api.openweathermap.org/data/2.5/weather';

// 🎮 Main weather fetching function
async function fetchCityWeatherData() {
    // 📝 Get user input with validation
    const requestedCityName = userCityInput.value.trim();
    
    if (!requestedCityName) {
        displayWeatherMessage('⚠️ Please enter a city name!', true);
        return;
    }
    
    try {
        // 🔄 Show loading state
        displayLoadingState(true);
        
        // 🌐 Construct API URL with parameters
        const weatherApiUrl = `${weatherApiBaseUrl}?q=${encodeURIComponent(requestedCityName)}&appid=${openWeatherApiKey}&units=metric`;
        
        // 🚀 Make the API request
        const weatherApiResponse = await fetch(weatherApiUrl);
        
        // ✅ Check if the response is successful
        if (!weatherApiResponse.ok) {
            if (weatherApiResponse.status === 404) {
                throw new Error(`City "${requestedCityName}" not found. Please check the spelling and try again.`);
            } else if (weatherApiResponse.status === 401) {
                throw new Error('Invalid API key. Please check your OpenWeather API configuration.');
            } else {
                throw new Error(`Weather service error: ${weatherApiResponse.status} - ${weatherApiResponse.statusText}`);
            }
        }
        
        // 📊 Parse the JSON response
        const weatherApiData = await weatherApiResponse.json();
        
        // 🎨 Display the weather information
        displayWeatherInformation(weatherApiData);
        
    } catch (networkError) {
        // 🚨 Handle different types of errors
        console.error('Weather fetch error:', networkError);
        
        if (networkError.name === 'TypeError' && networkError.message.includes('fetch')) {
            displayWeatherMessage('🌐 Network error. Please check your internet connection and try again.', true);
        } else {
            displayWeatherMessage(`❌ ${networkError.message}`, true);
        }
    } finally {
        // 🏁 Always hide loading state
        displayLoadingState(false);
    }
}

// 🎯 Display loading indicator
function displayLoadingState(isCurrentlyLoading) {
    fetchWeatherButton.disabled = isCurrentlyLoading;
    
    if (isCurrentlyLoading) {
        fetchWeatherButton.textContent = '⏳ Loading...';
        weatherResultsDisplay.innerHTML = '<div class="loadingIndicator">🔄 Fetching weather data...</div>';
    } else {
        fetchWeatherButton.textContent = '🌍 Get Weather';
    }
}

// 📝 Display messages (success or error)
function displayWeatherMessage(userMessage, isErrorType = false) {
    const messageClass = isErrorType ? 'errorMessageDisplay' : 'loadingIndicator';
    weatherResultsDisplay.innerHTML = `<div class="${messageClass}">${userMessage}</div>`;
}

// 🌤️ Display formatted weather information
function displayWeatherInformation(weatherDataFromApi) {
    const cityName = weatherDataFromApi.name;
    const countryCode = weatherDataFromApi.sys.country;
    const currentTemperature = Math.round(weatherDataFromApi.main.temp);
    const weatherCondition = weatherDataFromApi.weather[0].description;
    const feelsLikeTemperature = Math.round(weatherDataFromApi.main.feels_like);
    const humidityPercentage = weatherDataFromApi.main.humidity;
    const windSpeedMps = weatherDataFromApi.wind.speed;
    
    weatherResultsDisplay.innerHTML = `
        <div class="weatherInfoCard">
            <h2>📍 ${cityName}, ${countryCode}</h2>
            
            <div class="temperatureDisplay">
                ${currentTemperature}°C
            </div>
            
            <div class="weatherDescription">
                ${weatherCondition}
            </div>
            
            <div class="additionalWeatherDetails">
                <div class="weatherDetailItem">
                    <div>🌡️ Feels Like</div>
                    <div><strong>${feelsLikeTemperature}°C</strong></div>
                </div>
                
                <div class="weatherDetailItem">
                    <div>💧 Humidity</div>
                    <div><strong>${humidityPercentage}%</strong></div>
                </div>
                
                <div class="weatherDetailItem">
                    <div>💨 Wind Speed</div>
                    <div><strong>${windSpeedMps} m/s</strong></div>
                </div>
            </div>
        </div>
    `;
}

// 🎮 Event listeners
fetchWeatherButton.addEventListener('click', fetchCityWeatherData);

userCityInput.addEventListener('keypress', (keyboardEvent) => {
    if (keyboardEvent.key === 'Enter') {
        fetchCityWeatherData();
    }
});

// 🚀 Load demo data on page load
window.addEventListener('load', () => {
    displayWeatherMessage('👆 Enter a city name and click "Get Weather" to see live weather data!');
});
