(function ($) {

    $.googlePlaces = function (element, options) {

        var defaults = {
            placeId: 'ChIJERONVFK22YgRnhdwEhEDjrc' // placeId provided by google api documentation
            , render: ['reviews']
            , min_rating: 5
            , max_rows: 6
            , rotateTime: false
        };

        var plugin = this;

        plugin.settings = {}

        var $element = $(element),
            element = element;

        plugin.init = function () {
            plugin.settings = $.extend({}, defaults, options);
            $element.html("<div id='map-plug'></div>");

            // Check if reviews.json file exists
            $.getJSON('reviews.json', function (reviews) {
                if (reviews && reviews.length > 0) {
                    // Use reviews from reviews.json if available
                    renderReviews(reviews);
                } else {
                    // Use Google API to fetch reviews
                    initialize_place(function (place) {
                        plugin.place_data = place;
                        if (plugin.settings.render.indexOf('reviews') > -1) {
                            renderReviews(plugin.place_data.reviews);
                            if (!!plugin.settings.rotateTime) {
                                initRotation();
                            }
                        }
                    });
                }
            });
        }

        var initialize_place = function (c) {
            var map = new google.maps.Map(document.getElementById('map-plug'));

            var request = {
                placeId: plugin.settings.placeId,
                language: 'de'
            };

            var service = new google.maps.places.PlacesService(map);

            service.getDetails(request, function (place, status) {
                if (status == google.maps.places.PlacesServiceStatus.OK) {
                    c(place);
                }
            });
        }

        var sort_by_date = function (ray) {
            ray.sort(function (a, b) {
                var keyA = new Date(a.time),
                    keyB = new Date(b.time);
                // Compare the 2 dates
                if (keyA < keyB) return -1;
                if (keyA > keyB) return 1;
                return 0;
            });
            return ray;
        }

        var filter_minimum_rating = function (reviews) {
            for (var i = reviews.length - 1; i >= 0; i--) {
                if (reviews[i].rating < plugin.settings.min_rating) {
                    reviews.splice(i, 1);
                }
            }
            return reviews;
        }

        var renderReviews = function (reviews) {
            reviews = filter_minimum_rating(reviews);
            var html = "<div class='glide'><div class='glide__track' data-glide-el='track'><div class='review-item-wrapper glide__slides'>";
            var row_count = (plugin.settings.max_rows > 0) ? plugin.settings.max_rows - 1 : reviews.length - 1;
            row_count = (row_count > reviews.length - 1) ? reviews.length - 1 : row_count;
            for (var i = row_count; i >= 0; i--) {
                var stars = renderStars(reviews[i].rating);
                var date = convertTime(reviews[i].time);
                date = date.split(' ');
                date = date[1] + '.' + date[0] + '.' + date[2];
                date = date.replace(/,/g, "");
                html = html + "<div class='review-item glide__slide'><div class='review-meta'><span class='review-author'>" + reviews[i].author_name + "</span><span class='review-date'>" + date + "</span></div>" + stars + "<p class='review-text'>" + truncate(reviews[i].text) + "</p></div>"
            };
            $element.append(html);
            html = html + "</div></div></div>";
        }

        function truncate(string) {
            if (string.length > 189)
                return string.substring(0, 189) + '...';
            else
                return string;
        };

        var initRotation = function () {
            var $reviewEls = $element.children('.review-item');
            var currentIdx = $reviewEls.length > 0 ? 0 : false;
            $reviewEls.hide();
            if (currentIdx !== false) {
                $($reviewEls[currentIdx]).show();
                setInterval(function () {
                    if (++currentIdx >= $reviewEls.length) {
                        currentIdx = 0;
                    }
                    $reviewEls.hide();
                    $($reviewEls[currentIdx]).fadeIn('slow');
                }, plugin.settings.rotateTime);
            }
        }

        var renderStars = function (rating) {
            var stars = "<div class='review-stars'><ul>";

            // fill in gold stars
            for (var i = 0; i < rating; i++) {
                stars = stars + "<li><i class='star'></i></li>";
            }
            ;

            // fill in empty stars
            if (rating < 5) {
                for (var i = 0; i < (5 - rating); i++) {
                    stars = stars + "<li><i class='star inactive'></i></li>";
                }
                ;
            }
            stars = stars + "</ul></div>";
            return stars;
        }

        var convertTime = function (UNIX_timestamp) {
            var a = new Date(UNIX_timestamp * 1000);
            var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            var time = months[a.getMonth()] + ' ' + a.getDate() + ', ' + a.getFullYear();
            return time;
        }

        plugin.init();

    }

    $.fn.googlePlaces = function (options) {

        return this.each(function () {
            if (undefined == $(this).data('googlePlaces')) {
                var plugin = new $.googlePlaces(this, options);
                $(this).data('googlePlaces', plugin);
            }
        });

    }

})(jQuery);

$(document).ready(function( $ ) {
    $("#google-reviews").googlePlaces({
        placeId: 'ChIJidEIrxGobUcRweVFN_jGgtA',
        render: ['reviews'],
        min_rating: 4,
        max_rows:7
    });
});

// set timeout for google reviews
setTimeout(function(){
    var glide = new Glide('.glide', {
        type: 'carousel',
        perView: 4,
        focusAt: 'center',
        autoplay: 3000,
        breakpoints: {
            800: {
                perView: 2
            },
            480: {
                perView: 1
            }
        }
    })

    glide.mount()
}, 1000);