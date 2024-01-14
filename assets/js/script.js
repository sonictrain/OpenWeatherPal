const removeRecentBtn = `<button type="button" class="btn btn-outline-secondary btn-sm ms-2 remove-item-btn">Delete</button>`;
const recentDropdown = $('#dropdown-recent');
const searchBtn = $('#search-btn');
let recentLocations = [];

dropDownRecent();

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
        $(resultsContainer).append($('<p>').addClass('m-0').text('Did you mean:'))
    };

    $(objArr.splice(1)).each((i, r) => {
        resultsContainer.append($('<button>').addClass('btn btn-sm btn-warning rounded-pill').text(`${r.name}, ${r.country}`))
        .on('click', (e) => {
            e.preventDefault();
            searchLocation(`${r.name}, ${r.country}`);
        });
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
                    dropDownRecent();
                } else {
                    // if already there move it on top of the dropdown
                    recentLocations.push(recentLocations.splice(recentLocations.indexOf(`${data[0].name}, ${data[0].country}`), 1)[0]);
                    dropDownRecent();
                }
                
            });

    } else {
        // if input field is empty show invalid feedback
        $(inputValidation).each((i, x) => { $(x).addClass('is-invalid') });
    }
};