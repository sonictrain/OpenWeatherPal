
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

    const resultsContainer = $('#results-container').empty();
    if (objArr.length > 1) {
        $(resultsContainer).append($('<p>').addClass('m-0 fs-6').text('Did you mean:'))
    };

    $(objArr.splice(1)).each((i, r) => {
        let closeResult = $('<button>')
            .addClass('btn btn-sm btn-warning rounded-pill')
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
                // create and append the location name
                createCard($('#current-weather'), `Currently in ${data[0].name}, ${data[0].country}:`);

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

                        // display the weather icon
                        let weatherIcon = data.weather[0].id;
                        $('#current-weather').append($('<img>').addClass('wi-icon-md').attr('src', `./assets/images/svg/${iconMap["openweathermap/codes/"][weatherIcon]}.svg`));
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

// create card function - it needs parent id/class using the selectors (# or .) and a title for the card
function createCard(parent, title) {
    let col = $('<div>').addClass('col');
    let card = $('<div>').addClass('card h-100 border-0 rounded-4 bg-body-secondary');
    let cardBody = $('<div>').addClass('card-body');
    let cardTitle = $('<h5>').addClass('card-title').text(title);

    $(cardBody).append(cardTitle);
    $(card).append(cardBody);
    $(col).append(card);

    $(parent).append(col);
};