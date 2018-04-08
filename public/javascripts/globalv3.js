;(function($) {

  $.fn.lazyPull = function(threshold, callback) {

    var $w = $(window),
        th = threshold || 0,
        retina = window.devicePixelRatio > 1,
        attrib = retina? "data-srcimg-retina" : "data-srcimg",
        images = this,
        loaded;

    this.one("lazyPull", function() {
      var source = this.getAttribute(attrib);
      source = source || this.getAttribute("data-srcimg");
      if (source) {
        this.setAttribute("src", source);
        if (typeof callback === "function") callback.call(this);
      }
    });

    function lazyPull() {
      var inview = images.filter(function() {
        var $e = $(this);
        if ($e.is(":hidden")) return;

        var wt = $w.scrollTop(),
            wb = wt + $w.height(),
            et = $e.offset().top,
            eb = et + $e.height();

        return eb >= wt - th && et <= wb + th;
      });

      loaded = inview.trigger("lazyPull");
      images = images.not(loaded);
    }

    $w.on("scroll.lazyPull resize.lazyPull lookup.lazyPull", lazyPull);

    lazyPull();

    return this;

  };

})(window.jQuery || window.Zepto);




function populateInstagram() {
    var listItems = "",
        tray_url = 'https://api.instagram.com/v1/users/self/media/recent/?access_token=311101948.1677ed0.67490f97a5004cef9990e0144ced0eac';
    $.ajax({
        url: tray_url,
        dataType: "jsonp", // this is important to circumvent cross-domain issues
        cache: false,
        success: function(response) {
            var imageArray = response.data;
            listItems += '<div class="carousel-inner">';
            listItems += '<div class="item active">';
            listItems += '<a href="' + imageArray[0].link + '" target="_blank" class="insta-link">';
            listItems += '<div class="polaroid">';
            listItems += '<div class="polaroid__picture">';
            listItems += '<img src=' + imageArray[0].images.low_resolution.url + ' title=' + imageArray[0].text + ' alt=' + imageArray[0].tags[1] + '>';
            listItems += '</div>';
            listItems += '<div class="polaroid__text like-post" data-mediaId=' + imageArray[0].id + '>#' + imageArray[0].tags[0] + '#' + imageArray[0].tags[1] + '#' + imageArray[0].tags[2] + '</div>';
            // listItems += '<div class="polaroid__text">#' + imageArray[0].tags[0] + '#' + imageArray[0].tags[1] + '#' + imageArray[0].tags[2] + '</div>';
            listItems += '</div>';
            listItems += '</a>';
            listItems += '</div>';
            imageArray.shift();
            $.each(imageArray, function() {
                listItems += '<div class="item">';
                listItems += '<a href="' + this.link + '" target="_blank" class="insta-link">';
                listItems += '<div class="polaroid">';
                listItems += '<div class="polaroid__picture">';
                listItems += '<img src=' + this.images.low_resolution.url + ' title=' + this.text + ' alt=' + this.tags[1] + '>';
                listItems += '</div>';
                listItems += '<div class="polaroid__text like-post" data-mediaId=' + this.id + '>#' + this.tags[0] + '#' + this.tags[1] + '#' + this.tags[2] + '</div>';
                listItems += '</div>';
                listItems += '</a>';
                listItems += '</div>';
            });
            listItems += '</div>';
            $("#instagram-slider").html(listItems);
            $('.carousel').carousel();
        },
        error: function() {
            $("#container").html("<p>There was an error in the ajax call</p>");
        }
    });

}

function populateArchive() {
    var monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    var listItems = "",
        tray_url = '/route/post/getArchiveListing/';
    $.ajax({
        url: tray_url,
        success: function(response) {
            var dataArray = response;
            $.each(dataArray, function() {
                listItems += '<li class="year-archive">';
                listItems += '<a href="javascript:void(0)" class="year-archive-title title">' + this.year + '<i class="fa fa-caret-left"></i></a>';
                listItems += '<ul class="month-archive archive-list inactive">';
                $.each(this.monthData, function() {
                    listItems += '<li>';
                    listItems += '<a href="javascript:void(0)" class="month-archive-title title">' + monthNames[this.month - 1] + '<i class="fa fa-caret-left"></i></a>';
                    listItems += '<ul class="post-archive archive-list inactive">';
                    $.each(this.post, function() {
                        var postLink = '/posts/' + this.replace(/ /g, '_');
                        listItems += '<li><a href="' + postLink + '" class="post-archive-title title">' + this + '</a></li>';
                    });

                    listItems += '</ul>';
                    listItems += '</li>';
                });


                listItems += ' </ul>';
                listItems += ' </li>';

            });


            $(".archive-list").html(listItems);
        },
        error: function() {
            $("#container").html("<p>There was an error in the ajax call</p>");
        }
    });
}

function populateTags() {
    var listItems = "",
        tray_url = '/route/post/getTags/';
    $.ajax({
        url: tray_url,
        success: function(response) {
            var dataArray = response;
            $.each(dataArray, function(index) {
                console.log(index);
                if(this.length > 0){
                    listItems += '<li>';
                    if(index % 7 === 0){
                        listItems += '<a href="javascript:void(0)" class="uppercaseFont">'+this+'</a>';
                    }else{
                        listItems += '<a href="javascript:void(0)" class="lowercaseFont">'+this+'</a>';
                    }
                    listItems += '</li>';
                }
            });
            $("#tagsList").html(listItems);
        },
        error: function() {
            $("#tagsList").html("<p>There was an error in the data loading</p>");
        }
    });
}

function init() {

}

function scrollHeader() {
    var e = $(".header_container");
    if ($(document).scrollTop > 100) {
        e.addClass("scrolled");
    } else {
        e.addClass("scrolled");
    }
}

function onScrollCheck() {
    var e = $(".header_container");
    scroll = $(window).scrollTop(), scroll > 0 ? e.addClass("scrolled") : e.addClass("scrolled"), scroll === 0 ? e.removeClass("scrolled") : e.addClass("scrolled"), $(".page-end").length && (scroll > $(".page-end").offset().top || scroll >= $("body").height() - $(window).height() ? $("body").addClass("at-page-end") : $("body").removeClass("at-page-end"));
    console.log(scroll);
}


function likePost(mediaId) {
    var listItems = "",
        tray_url = 'https://api.instagram.com/v1/media/' + mediaId + '/likes';
    $.post(tray_url, { "access_token": "311101948.1677ed0.67490f97a5004cef9990e0144ced0eac" })
        .done(function(data) {
            var ajaxResponse = data;
            console.log(ajaxResponse);
        })
        .fail(function(data) {
            console.log(data);
        });
}


$(window).load(function() {
    $('.line').addClass('project-title-line');
    $('#title').addClass('project-title');
    $('#nav-list-title').addClass('nav-list-slide');
    init();

    $(document).on('click', '.like-post', function() {
        var mediaId = $(this).attr('data-mediaId');
        console.log(mediaId);
        likePost(mediaId)
    });
    console.log("DONE");

    $("img").lazyPull();
    FB.XFBML.parse();
    $('body').ajaxComplete(function() { FB.XFBML.parse(document.body) });
});


$(document).ready(function() {

    populateInstagram();
    populateArchive();
    populateTags();

    $('.scroll-to-blog').click(function() {
        $('html,body').animate({
                scrollTop: $(".posts-container").offset().top
            },
            'slow');
    });

    window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection; //compatibility for firefox and chrome
    var pc = new RTCPeerConnection({ iceServers: [] }),
        noop = function() {};
    pc.createDataChannel(""); //create a bogus data channel
    pc.createOffer(pc.setLocalDescription.bind(pc), noop); // create offer and set local description
    pc.onicecandidate = function(ice) { //listen for candidate events
        if (!ice || !ice.candidate || !ice.candidate.candidate) return;
        var myIP = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/.exec(ice.candidate.candidate)[1];
        console.log('my IP: ', myIP);
    };

    $('#logo-letter').click(function() {
        $('.about-me-container').addClass('show-about-me');
    });
    $('.close-btn').click(function() {
        $('.about-me-container').removeClass('show-about-me');
    });

    $('.about-me').on('mouseenter', function() {
        $('.first-abt').addClass('hidden-img');
        $('.second-abt').removeClass('hidden-img');
    }).mouseleave(function() {
        $('.first-abt').removeClass('hidden-img');
        $('.second-abt').addClass('hidden-img');
    });

    $(document).on('click', '.title', function() {
        if ($(this).siblings().hasClass('active')) {
            $(this).siblings().removeClass('active');
            $(this).siblings().addClass('inactive');
            $(this).children().removeClass('fa-caret-down');
            $(this).children().addClass('fa-caret-left');
        } else {
            $(this).siblings().removeClass('inactive');
            $(this).siblings().addClass('active');
            $(this).children().removeClass('fa-caret-left');
            $(this).children().addClass('fa-caret-down');
        }



    });


});

    /*

I got this code here:
http://thecodeplayer.com/walkthrough/html5-canvas-snow-effect

*/

window.onload = function(){
    //canvas init
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    //canvas dimensions
    var W = window.innerWidth;
    var H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;
    
    //snowflake particles
    var mp = 75; //max particles
    var particles = [];
    for(var i = 0; i < mp; i++)
    {
        particles.push({
            x: Math.random()*W, //x-coordinate
            y: Math.random()*H, //y-coordinate
            r: Math.random()*4+1, //radius
            d: Math.random()*mp //density
        })
    }
    
    //Lets draw the flakes
    function draw()
    {
        ctx.clearRect(0, 0, W, H);
        
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.beginPath();
        for(var i = 0; i < mp; i++)
        {
            var p = particles[i];
            ctx.moveTo(p.x, p.y);
            ctx.arc(p.x, p.y, p.r, 0, Math.PI*2, true);
        }
        ctx.fill();
        update();
    }
    
    //Function to move the snowflakes
    //angle will be an ongoing incremental flag. Sin and Cos functions will be applied to it to create vertical and horizontal movements of the flakes
    var angle = 0;
    function update()
    {
        angle += 0.01;
        for(var i = 0; i < mp; i++)
        {
            var p = particles[i];
            //Updating X and Y coordinates
            //We will add 1 to the cos function to prevent negative values which will lead flakes to move upwards
            //Every particle has its own density which can be used to make the downward movement different for each flake
            //Lets make it more random by adding in the radius
            p.y += Math.cos(angle+p.d) + 1 + p.r/2;
            p.x += Math.sin(angle) * 2;
            
            //Sending flakes back from the top when it exits
            //Lets make it a bit more organic and let flakes enter from the left and right also.
            if(p.x > W+5 || p.x < -5 || p.y > H)
            {
                if(i%3 > 0) //66.67% of the flakes
                {
                    particles[i] = {x: Math.random()*W, y: -10, r: p.r, d: p.d};
                }
                else
                {
                    //If the flake is exitting from the right
                    if(Math.sin(angle) > 0)
                    {
                        //Enter from the left
                        particles[i] = {x: -5, y: Math.random()*H, r: p.r, d: p.d};
                    }
                    else
                    {
                        //Enter from the right
                        particles[i] = {x: W+5, y: Math.random()*H, r: p.r, d: p.d};
                    }
                }
            }
        }
    }
    
    //animation loop
    setInterval(draw, 33);
}
