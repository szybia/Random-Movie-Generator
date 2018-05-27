var IP = "http://86.45.45.71:5000";

//Parallax background effect
$(function() {
    var $window = $(window);

    $('section[data-type="background"]').each(function(){
        var $object = $(this);

        $(window).scroll(function() {
            var yPos = -($window.scrollTop() / $object.data('speed'));

            var coords = '50% '+ yPos + 'px';

            $object.css({ backgroundPosition: coords });
        });
    });
});


//  Slider
var rangeSlider = function(){
  var slider = $('.range-slider'),
      range = $('.range-slider__range'),
      value = $('.range-slider__value');

  slider.each(function(){

    value.each(function(){
      var value = $(this).prev().attr('value');
      $(this).html(value);
    });

    range.on('input', function(){
      $(this).next(value).html(this.value);
    });
  });
};

rangeSlider();


$( ".generate" ).click(function() {
    var movieTitle = $("#movieTitle").val();
    var movieRating = parseFloat($("#movieRating").val());
    var movieRatingRangeMin = parseFloat($("#movieRatingRangeMin").val());
    var movieRatingRangeMax = parseFloat($("#movieRatingRangeMax").val());
    var movieYear = $("#movieYear").val();
    var movieDecade = $("#movieDecade").val();


    if (movieTitle)
    {
        if (    !(/^[a-zA-Z0-9\.\'\! ]+$/.test(movieTitle))  )
        {
            showModal("Movie Title.", "Please do not enter any special characters.");
        }
        else
        {
            if (movieTitle.length > 100)
            {
                showModal("Movie Title.", "Too many characters.");
            }
            else
            {
                 makeCorsRequest(IP + "/movies/title/" + movieTitle, "title");
            }

        }
    }
    else if (movieRating)
    {
        if (isNaN(movieRating))
        {
            showModal("Movie Rating.", "Please only enter in numbers.");
        }
        else
        {
            if (movieRating > 10 || movieRating < 0)
            {
                showModal("Movie Rating.", "Rating has to be between 0 and 10.");
            }
            else
            {
                makeCorsRequest(IP + "/movies/rating/" + movieRating, "rating");
            }
        }
    }
    else if (movieRatingRangeMin != 0)
    {
        if (movieRatingRangeMin > movieRatingRangeMax)
        {
            showModal("Movie Rating Range.", "Minimum range cannot be greater than maximum.");
        }
        else
        {
            var data = movieRatingRangeMin + "-" + movieRatingRangeMax;
            makeCorsRequest(IP + "/movies/rating/range/" + data, "ratingRange");
        }

    }
    else if (movieRatingRangeMax != 10)
    {
        if (movieRatingRangeMin > movieRatingRangeMax)
        {
            showModal("Movie Rating Range.", "Minimum range cannot be greater than maximum.");
        }
        else
        {
             var data = movieRatingRangeMin + "-" + movieRatingRangeMax;
             makeCorsRequest(IP + "/movies/rating/range/" + data, "ratingRange");
        }
    }
    else if (movieYear)
    {
        if (movieYear.length > 4)
        {
            showModal("Movie Year.", "Year entered is too long. Please enter a valid year.");
        }
        else
        {
            movieYear = parseInt(movieYear);
            if (isNaN(movieYear))
            {
                showModal("Movie Year.", "Please only enter in numbers.");
            }
            else
            {
                makeCorsRequest(IP + "/movies/year/" + movieYear, "year");
            }
        }
    }
    else if (movieDecade)
    {
        if (movieDecade.length > 4)
        {
            showModal("Movie Decade.", "Year entered is too long. Please enter a valid year.");
        }
        else
        {
            movieDecade = parseInt(movieDecade);
            if (isNaN(movieDecade))
            {
                showModal("Movie Decade.", "Please only enter in numbers.");
            }
            else
            {
                makeCorsRequest(IP + "/movies/decade/" + movieDecade, "decade");
            }
        }
    }
    else
    {
        makeCorsRequest(IP + "/movies", null);
    }

});


// Create the XHR object.
function createCORSRequest(method, url)
{
  var xhr = new XMLHttpRequest();
  if ("withCredentials" in xhr)
  {
    // XHR for Chrome/Firefox/Opera/Safari.
    xhr.open(method, url, true);
  }
  else if (typeof XDomainRequest != "undefined")
  {
    // XDomainRequest for IE.
    xhr = new XDomainRequest();
    xhr.open(method, url);
  }
  else
  {
    xhr = null;
  }
  return xhr;
}

// Make the actual CORS request.
function makeCorsRequest(url, preference)
{
  var url = url;

  var xhr = createCORSRequest('GET', url);
  if (!xhr)
  {
    showModal("Connection Failed.", "CORS connection to server not supported. Please update your browser.");
    return;
  }

  // Response handlers.
  xhr.onload = function()
  {
    updateMovie(xhr.responseText, preference);
  };

  xhr.onerror = function()
  {
    showModal("Connection Failed.", 'There was an error making the request. Please check your internet connection.');
  };

  xhr.send();
}



var updateMovie = function(json, preference)
{
     json = JSON.parse(json);
     if (json['error'])
     {
          if (preference == 'null')
          {
               showModal("Empty Result.", "Please try again later.")
          }
          else
          {
               showModal("Empty Result.", "No movies with the specified " + preference + ". Please try again with another preference.")
          }

     }
     else
     {
          if (json['title'])
          {
               $("h4.title").html(json['title']);
               updateMoviePoster(json['title']);
          }
          else
          {
               $("h4.title").html("No title available.");
          }

          if (json['overview'])
          {
               $("p.description").html(json['overview']);
          }
          else
          {
               $("p.description").html("No description available.");
          }

          if (json['release_date'])
          {
               $("p.year").html("Year:" + json['release_date'].substring(0, 4)  );
          }
          else
          {
               $("p.year").html("Year: Unknown");
          }

          if (json['vote_average'])
          {
               $("p.rating").html("Rating:" + json['vote_average']  );
          }
          else
          {
               $("p.rating").html("Rating: 0");
          }

          if (json['runtime'])
          {
               $("p.runtime").html("Runtime:" + json['runtime']  );
          }
          else
          {
               $("p.runtime").html("Runtime: Unknown");
          }

          if (json['genres'])
          {
               var genres = JSON.parse(json['genres']);
               $(".genresList").empty();
               if (genres.length == 0)
               {
                    $(".genresList").append("<li class=\"list-group-item\">No genres.</li>");
               }
               else
               {
                    for (var i = 0; i < genres.length; i++)
                    {
                         $(".genresList").append("<li class=\"list-group-item\">" + genres[i]["name"] + ".</li>");
                    }
               }
          }
     }
}



var updateMoviePoster = function(movieTitle)
{
     $.getJSON("https://api.themoviedb.org/3/search/movie?api_key=15d2ea6d0dc1d476efbca3eba2b9bbfb&query=" + movieTitle + "&callback=?", function(json)
     {
          if (json != "Nothing found.")
          {
               var imageHeight     = $(".moviePoster").height();
               var imageWidth      = $(".moviePoster").width();
               $(".moviePoster").animate({
                    height: "0px",
                    width: "0px",
                    opacity: 0
               }, 400);

               setTimeout(function()
               {
                    $(".moviePoster").attr("src", "http://image.tmdb.org/t/p/w500/" + json.results[0].poster_path);
                    setTimeout(function()
                    {
                         $(".moviePoster").animate({
                              height: imageHeight,
                              width: imageWidth,
                              opacity: 100
                         }, 400);
                    }, 400);
               }, 400);
          }
          else
          {
               $(".moviePoster").fadeOut('fast', function ()
               {
                  $(".moviePoster").attr("src", "assets/img/emptyPoster.jpg");
                  $(".moviePoster").fadeIn('fast');
               });
          };
     });
}


var showModal = function(title, body){
    $(".modal-title").html(title);
    $(".modal-body p").html(body);
    $('.modal').modal('show');
};
