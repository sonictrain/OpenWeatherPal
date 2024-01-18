
const removeRecentBtn = `<button type="button" class="btn btn-outline-secondary btn-sm ms-2 remove-item-btn">Delete</button>`;
const recentDropdown = $('#dropdown-recent');
const searchBtn = $('#search-btn');
let recentLocations = [];

dropDownRecent();

$('body').append(`<script id="mapBox">updateMap([-0.15, 51.5]);

function updateMap(coordinate) {
mapboxgl.accessToken = 'pk.eyJ1Ijoic29uaWN0cmFpbiIsImEiOiJjaWpvaXpxaXMwMHdmdW9seGVybXc2NGJtIn0.5B0Jv5pJCNYs9pNdl3tyQA';
const map = new mapboxgl.Map({
    container: 'map', // container ID
    center: coordinate, // starting position [lng, lat]
    zoom: 9, // starting zoom
});
const marker1 = new mapboxgl.Marker()
.setLngLat(coordinate)
.addTo(map);
};</script>`)

$('#date-time').addClass('bg-blur');

setInterval(() => {
    $('#date-time').empty().append($('<p>').addClass('m-0 fs-6').text(`${dayjs().format('D/MM/YYYY')}`));
}, 1000);

function bsIconGenerator(bs_className) {
    return `<i class="${bs_className}"></i>`;
}

function dropDownRecent() {

    $(recentDropdown).empty();
    const listItem = $('<li>').addClass('px-2');
    const dropDownDivider = $('<hr>').addClass('dropdown-divider').append(listItem);
    const clearAllBtn = $('<button>').addClass('btn btn-secondary w-100 rounded-bottom').text('Clear search history').append(bsIconGenerator('bi bi-trash ps-1'));
    const clearAllEl = $(listItem).append(clearAllBtn);

    clearAllEl.on('click', function () {
        if (recentLocations.length) {
            recentLocations = [];
            dropDownRecent();
        }
    });

    if (recentLocations.length) {

        $.each(recentLocations, function (i, location) {
            const dropDownLi = $('<li>').attr('class', 'd-flex px-2');
            const divRecent = $('<button>')
                .attr('class', 'dropdown-item rounded')
                .on('click', (e) => {
                    e.preventDefault();
                    searchLocation(location);
                });
            $(dropDownLi)
                .addClass('recent-item')
                .append(divRecent.text(location));
            $(dropDownLi).hover(
                function () {
                    $(this).append($(removeRecentBtn)).on('click', function (e) {
                        let toClear = $(e.target).siblings('.dropdown-item').text();
                        recentLocations = recentLocations.filter(function (x) {
                            return x !== toClear
                        });
                        dropDownRecent();
                    })
                }, function () {
                    $(this).find('.remove-item-btn').last().remove();
                }
            );
            $(recentDropdown).prepend(dropDownLi);
        });

    } else {
        const dropDownLi = $('<li>').attr('class', 'd-flex px-2');
        const divRecent = $('<button>').attr('class', 'dropdown-item rounded');
        $(dropDownLi).append(divRecent.addClass('disabled').attr('aria-disabled', 'true').text('Empty'));
        $(recentDropdown).prepend(dropDownLi);
        $(clearAllBtn).addClass('disabled');
    }
    $(recentDropdown)
        .append(dropDownDivider)
        .append(clearAllEl);
};

// click on search button event listener
searchBtn.on('click', (e) => {
    e.preventDefault();
    const inputCity = $('#inputCity').val().trim();
    searchLocation(inputCity);
});

// render the best unique results in the dashboard (up to 5 result)
function renderResults(objArr) {

    const resultsContainer = $('#results-container').empty().addClass('bg-blur');
    if (objArr.length > 1) {
        $(resultsContainer).append($('<p>').addClass('m-0 fs-6').text('Did you mean:'))
    } else {$(resultsContainer).empty().rmeoveClass('bg-blur')};

    $(objArr.splice(1)).each((i, r) => {
        let closeResult = $('<button>')
            .addClass('btn btn-sm btn-warning rounded-2')
            .text(`${r.name}, ${r.country}`)
            .on('click', (e) => {
                e.preventDefault();
                searchLocation(`${r.name}, ${r.country}`);
            });
        resultsContainer.append(closeResult);
    });
};
// search location function
function searchLocation(locationString) {

    const apiKey = `748b56884fc69047f189d030cf1dd596`;
    const inputValidation = $('.input-validation');

    // check if input field is empty
    if (locationString) {

        // if not, remove invalid feedback
        $(inputValidation).each((i, x) => { $(x).removeClass('is-invalid') });
        $('#input-label').removeClass('text-danger').text('City');

        const geoURL = `http://api.openweathermap.org/geo/1.0/direct?q=${locationString}&limit=5&appid=${apiKey}`;

        // API Call to get the best 5 result
        fetch(geoURL)
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {

                // filter out the array and keep one unique result per country
                let uniqueCountry = []
                data = jQuery.map((data), function (obj, i) {
                    if (!uniqueCountry.includes(obj.country)) {
                        uniqueCountry.push(obj.country);
                        return obj;
                    }
                })
                console.log(data);
                renderResults(data);

                // if location is not yet in the recent dropdown add it and refresh the list
                if (!recentLocations.includes(`${data[0].name}, ${data[0].country}`)) {
                    recentLocations.push(`${data[0].name}, ${data[0].country}`);
                    $('#inputCity').val(`${data[0].name}, ${data[0].country}`);
                    dropDownRecent();

                } else {
                    // if already there move it on top of the dropdown
                    recentLocations.push(recentLocations.splice(recentLocations.indexOf(`${data[0].name}, ${data[0].country}`), 1)[0]);
                    dropDownRecent();
                }

                // close the sidebar
                $('#offcanvasScrolling').removeClass('show');

                // empty the current-weather container
                $('#current-weather').empty();


                // save lat & lon
                const lat = data[0].lat;
                const lon = data[0].lon;

                $('#mapBox').empty();
                $('body').append(`<script id="mapBox">updateMap([${lon}, ${lat}]);
                function updateMap(coordinate) {
                mapboxgl.accessToken = 'pk.eyJ1Ijoic29uaWN0cmFpbiIsImEiOiJjaWpvaXpxaXMwMHdmdW9seGVybXc2NGJtIn0.5B0Jv5pJCNYs9pNdl3tyQA';
                const map = new mapboxgl.Map({
                    container: 'map', // container ID
                    center: coordinate, // starting position [lng, lat]
                    zoom: 9, // starting zoom
                });
                const marker1 = new mapboxgl.Marker()
                .setLngLat(coordinate)
                .addTo(map);
                };</script>`);

                const currentURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`

                // run API to get weather information
                fetch(currentURL)
                    .then(function (response) {
                        return response.json();
                    })
                    .then(function (data) {
                        console.log(data);

                        let currentWeather = {
                            location: `${data.name}, ${data.sys.country}`,
                            humidty: data.main.humidity + ' %',
                            pressure: data.main.pressure + ' hPa',
                            temp: {
                                max: data.main.temp_max,
                                actual: data.main.temp,
                                min: data.main.temp_min,
                                feels_like: data.main.feels_like,
                                },
                            visibility: data.visibility,
                            weather: {
                                main: data.weather[0].main,
                                description: data.weather[0].description,
                                icon: data.weather[0].icon,
                                id: data.weather[0].id,
                                },
                            wind: {
                                direction: data.wind.deg,
                                speed: data.wind.speed + ' m/s',
                            },
                            daylight: {
                                sunrise: data.sys.sunrise,
                                sunset: data.sys.sunset,
                            },
                            timezone: data.timezone,
                        }

                        // creating the grid to display the weather information
                        let rowContainer = $('<div>').addClass('row gap-2');
                        let timeOfDay = dayjs().unix(dayjs().unix()+currentWeather.timezone) >= currentWeather.daylight.sunrise && dayjs().unix(dayjs().unix()+currentWeather.timezone) < currentWeather.daylight.sunset ? 'day' : 'night';
                        $(rowContainer).append(createWeatherWidget(currentWeather.weather.description, currentWeather.temp.feels_like, currentWeather.temp.min, currentWeather.temp.max, `./assets/images/svg/${getIcon(timeOfDay, currentWeather.weather.id)}.svg`));
                        $('#current-weather').append($(rowContainer));

                    })
                    // console log the error if any
                    .catch(error => console.log(error));


            })
            // console log the error if any
            .catch(error => console.log(error));

    } else {
        // if input field is empty show invalid feedback
        $(inputValidation).each((i, x) => { $(x).addClass('is-invalid') });
        $('#input-label').addClass('text-danger').text('Invalid city');

    }
};

// create weather widget - it needs parent id/class using the selectors (# or .) and a title for the card
function createWeatherWidget(weatherDescription, feelsLike, min_temp, max_temp, imgPath) {
    return  `<div class="col-sm-12 col-md custom-bg-grey widget rounded-3 position-relative fw-light fs-2 text-capitalize p-4 z-n1">
                <p class="text-start mb-0">${weatherDescription}</p>
                <div class="d-flex flex-column">
                    <p class="fs-1 fw-bold text-center">${K2c(feelsLike)}</p>
                    <div class="d-flex gap-3 justify-content-center">
                        <div class="d-flex flex-column">
                            <p class="fs-5 mb-0 fw-bolder text-center">${K2c(min_temp)}</p>
                            <span class="badge rounded-pill fs-6 min-temp">MIN</span>
                        </div>
                        <div class="d-flex flex-column">
                            <p class="fs-5 mb-0 fw-light text-center">${K2c(max_temp)}</p>
                            <span class="badge small rounded-pill fs-6 max-temp">MAX</span>
                        </div>
                    </div>
                </div>
                <img src="${imgPath}" class="position-absolute start-50 top-50 translate-middle wi-icon-bg mt-auto">
            </div>`
};

function K2c(K) {
    return (Number(K)-273).toFixed(2) + '°C';
}

// https://gist.github.com/basarat/4670200
function degree2cardinal(angle) {

    const degreePerDirection = 360 / 8;
    const offsetAngle = Number(angle) + degreePerDirection / 2;
  
    return (offsetAngle >= 0 * degreePerDirection && offsetAngle < 1 * degreePerDirection) ? "N ↑"
      : (offsetAngle >= 1 * degreePerDirection && offsetAngle < 2 * degreePerDirection) ? "NE ↗"
        : (offsetAngle >= 2 * degreePerDirection && offsetAngle < 3 * degreePerDirection) ? "E →"
          : (offsetAngle >= 3 * degreePerDirection && offsetAngle < 4 * degreePerDirection) ? "SE ↘"
            : (offsetAngle >= 4 * degreePerDirection && offsetAngle < 5 * degreePerDirection) ? "S ↓"
              : (offsetAngle >= 5 * degreePerDirection && offsetAngle < 6 * degreePerDirection) ? "SW ↙"
                : (offsetAngle >= 6 * degreePerDirection && offsetAngle < 7 * degreePerDirection) ? "W ←"
                  : "NW ↖";
};