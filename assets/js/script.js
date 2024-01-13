const removeRecentBtn = `<button type="button" class="btn btn-outline-secondary btn-sm ms-2 remove-item-btn">Delete</button>`;
const recentDropdown = $('#dropdown-recent');
let recentLocations = ['London','Hong Kong', 'Lisbon'];

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

    clearAllEl.on('click', function() {
        if (recentLocations.length) {
            recentLocations = [];
            dropDownRecent();
        }
    });

    if (recentLocations.length) {
        
        $.each(recentLocations, function( i, location) {
            const dropDownLi = $('<li>').attr('class', 'd-flex px-2');
            const divRecent = $('<button>').attr('class', 'dropdown-item rounded');
            $(dropDownLi).addClass('recent-item').append(divRecent.text(location));
            $(dropDownLi).hover(
                function () {
                    $(this).append($(removeRecentBtn)).on('click',function(e) {
                        let toClear = $(e.target).siblings('.dropdown-item').text();
                        recentLocations = recentLocations.filter(function(x) {
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
        $(dropDownLi).append(divRecent.addClass('disabled').attr('aria-disabled','true').text('Empty'));
        $(recentDropdown).prepend(dropDownLi);
        $(clearAllBtn).addClass('disabled');
    }
    $(recentDropdown)
        .append(dropDownDivider)
        .append(clearAllEl);
}