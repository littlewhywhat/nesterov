var SVG_ID = "content",
    INDICATOR_ID = "indicator",
    COVER_ID = "cover",
    CIRCLE_TAG = "circle",
    SELECTED_CLASS = "selected",
    BUTTON_COUNT = 3,
    BUTTON_RADIUS = 10,
    BUTTON_DISTANCE = 5,
    height = document.body.clientHeight,
    width = document.body.clientWidth,
    minwidth = 1920,
    minheight = 966,
    IMAGE_IDS = ["zero", "one", "two"];

var s = Snap(formId(SVG_ID));
var interval = 500;
    imageInterval = 4000;
var loading = true;

var images;
function Images(s, IMAGE_IDS) {
    var IMAGE_TAG = "image",
        instance = this;
    this.init = function() {
        for (var i = 0, len = IMAGE_IDS.length; 
                        i < len; i++)
            createImage(IMAGE_IDS[i], null);
        return instance;
    }

    function createImage(image, interval) {
        var image = drawImage(image);
        adjustImage(image, width, height);
        selectImage(image);
    }

    function drawImage(image) {
        return s.image(getImageURL(image), 0, 0, 0, 0)
                     .attr({
                        id: image
                     });
    }

    function adjustImage(image, width, height) {
        var rate = width/height;
        var adjheight = height;
        var adjwidth = width;
        if (rate > 2)
            adjheight = adjwidth /2;
        if (rate < 2)
            adjwidth = adjheight * 2;
        image.attr({
            height: adjheight,
            width: adjwidth
        });
        var center = width/2 - adjwidth/2;
        image.transform("t" + [center, 0]);
    }

    this.adjust = function() {
        getImageSet().forEach(function(image) {
            adjustImage(image, width, height);
        })
    }

    function selectImage(image) {
        var selected = instance.selected();
        if (selected)
            toggleSelected(selected);
        getCover().before(image);
        toggleSelected(image);
    }   

    function getImageURL(id) {
        return id + ".jpg";
    }

    function getImageSet() {
        return s.selectAll(IMAGE_TAG);
    }

    function getImageById(id) {
        return s.select(IMAGE_TAG + formId(id));
    }

    this.selected = function() {
        return s.select(IMAGE_TAG + cssClass(SELECTED_CLASS));
    }

    this.selectById = function(id) {
        selectImage(getImageById(id));
    }
}

doInARow([{
    time: interval,
    todo: function(interval) {
        loading = false;
        relateCircles();
    }
}, { 
    time: interval, 
    todo: uncover 
}, { 
    time: imageInterval , 
    todo: load, args: IMAGE_IDS 
}, { 
    time: interval, 
    todo: cover
}]);

function load(IMAGE_IDS, time) {
    startAnimate(500);
    doInARow([{ 
            time: 0, 
            todo: stopAnimate
        }, { 
            time: time,
            todo: function(IMAGE_IDS, time) {
                images = new Images(s, IMAGE_IDS).init();
            },
            args: IMAGE_IDS,
    }]);
    
}

function doInARow(callbacks) {
    if (callbacks.length > 0) {
        var callback = callbacks.pop();
        if (callback.args)
            callback.todo(callback.args, callback.time);
        else
            callback.todo(callback.time);
        window.setTimeout(function() {
            doInARow(callbacks);
        }, callback.time)
    }
}

function cover(interval) {
    for (var i in IMAGE_IDS) 
        drawCircle(0, 0, IMAGE_IDS[i]);
    var indicator = s.g(getCircleSet())
                     .attr({
                        id: INDICATOR_ID
                     });
    
    indicator.before(drawCover(width + 100, height + 100));
    placeCircles(width/2, height/2, interval - 100);
}

function uncover(interval) {
    var cover = getCover();
    cover.animate({
        opacity: 0
    }, 500);
    placeCirclesDown(height, width, interval);
}

function startAnimate(interval) {
    getCircleSet().forEach(function(circle) {
        animateCircle(circle, interval, true);
    });
}

function stopAnimate(interval) {
    getCircleSet().forEach(function(circle) {
        circle.stop();
        animateCircle(circle, interval);
    })
}

function animateCircle(circle, interval, isendless) {
    circle.animate({ 
        r: 0
    }, interval, mina.easein, 
    function() {
        circle.animate({
            r: BUTTON_RADIUS
        }, interval, mina.easein, isendless?
        function() {
            animateCircle(circle, interval, isendless);
        } : null);
    });
}

function getCover() {
    return s.select(formId(COVER_ID));
}

function getIndicator() {
    return s.select(formId(INDICATOR_ID));
}

function getCircleSet() {
    return s.selectAll(CIRCLE_TAG);
}

function getCircleById(id) {
    return s.select(CIRCLE_TAG + formId(id));
}

function getSelectedCircle() {
    return s.select(CIRCLE_TAG + cssClass(SELECTED_CLASS));
}

function formId(id) {
    return "#" + id;
}

function cssClass(className) {
    return "." + className;
}

function toggleSelected(element) {
    element.toggleClass(SELECTED_CLASS);
}

function selectCircle(circle) {
    var selected = getSelectedCircle();
    if (selected)
        toggleSelected(selected);
    toggleSelected(circle);
}

function drawCover(width, height) {
    return s.rect(0,0,width,height)
            .attr({
                id: COVER_ID
            });
}

function drawCircle(cx, cy, id) {
    s.circle(cx, cy, BUTTON_RADIUS).attr({
        fill: "white",
        id: id,
        stroke: "black",
        strokeWidth: 2
    })  
}

function relateCircles() {
   getCircleSet().forEach(function(circle){
        circle.hover(function() {
            selectByCircle(this); 
        }, function() {});
   });
   var selectedId = images.selected().attr('id');
   selectCircle(getCircleById(selectedId));
}

function selectByCircle(circle) {
    selectCircle(circle);
    images.selectById(circle.attr('id'));
}

function placeCirclesDown(height, width, interval) {
    placeCircles(
        width/2, 
        height - BUTTON_RADIUS - BUTTON_DISTANCE,
        interval
        );
}

function placeCircles(x, y, interval) {
    var set = getCircleSet();
        count = set.length;
    var cx = x - BUTTON_RADIUS - 
        count * BUTTON_RADIUS
       + Math.round(count/2 - 0.1) 
       * BUTTON_DISTANCE;
    var cy = y;
    set.forEach(function(circle) {
        circle.animate({
            cx: cx,
            cy: cy
        }, interval);
        cx += BUTTON_RADIUS * 2 + BUTTON_DISTANCE;
    })
}

var startMillis;
var timerId;

document.body.onresize = function() {
    height = document.body.clientHeight;
    width = document.body.clientWidth;
    
    
    var cover = getCover();
    cover.attr({
        width: width + 100,
        height: height + 100
    });
    cover.attr({
        opacity: 1
    });

    placeCircles(width/2, height/2, 500);
    
    var currentMillis = new Date().getTime();
    if ((currentMillis - startMillis) < 300)
        clearTimeout(timerId);
    timerId = setTimeout(function() {
        cover.attr({
            opacity: 0
        });
        images.adjust();
        placeCirclesDown(height, width, 500);
    }, 1000);
    startMillis = currentMillis;
}