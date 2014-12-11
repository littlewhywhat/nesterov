var SVG_ID = "content",
    SELECTED_CLASS = "selected",
    height = document.body.clientHeight,
    width = document.body.clientWidth,
    IMAGE_IDS = ["zero", "one", "two"];

var s = Snap(formId(SVG_ID));
var interval = 500;
    imageInterval = 4000;

var images;
var cover;
var circles;
function Images(s, g, IMAGE_IDS) {
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
        g.append(image);
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

function Cover(s) {
    var COVER_ID = "cover";
    this.init = function() {
        drawCover(width + 100, height + 100);
        return this;
    }

    function getCover() {
        return s.select(formId(COVER_ID));
    }

    this.open = function() {
        getCover().animate({
            opacity: 0
        }, 500);
    }

    this.close = function() {
        getCover().attr({
            opacity: 1
        });
    }

    this.adjust = function() {
        getCover().attr({
            width: width + 100,
            height: height + 100
        });
    }

    this.before = function(el) {
        getCover().before(el);
    }

    function drawCover(width, height) {
        return s.rect(0,0,width,height)
                .attr({
                    id: COVER_ID
                });
    }
}

function Circles(s) {
    var CIRCLE_TAG = "circle",
        CIRCLES_ID = "circles",
        BUTTON_RADIUS = 10,
        BUTTON_DISTANCE = 5,
        instance = this;
    this.init = function() {
        for (var i in IMAGE_IDS) 
            drawCircle(0, 0, IMAGE_IDS[i]);
        s.g(getCircleSet())
         .attr({
             id: CIRCLES_ID
         });
        return this;
    }

    function drawCircle(cx, cy, id) {
        s.circle(cx, cy, BUTTON_RADIUS).attr({
            fill: "white",
            id: id,
            stroke: "black",
            strokeWidth: 2
        });
    }

    function placeCirclesDown(interval) {
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
        });
    }

    function relateCircles() {
       getCircleSet().forEach(function(circle){
            circle.hover(hover);
       });
       var selectedId = images.selected().attr('id');
       selectCircle(getCircleById(selectedId));
    }

    function unrelateCircles() {
        getCircleSet().forEach(function(circle){
            circle.unhover(hover);
       });
       var selected = getSelectedCircle();
       if (selected)
            selected.toggleClass(SELECTED_CLASS, false);
    }

    function hover() {
        selectByCircle(this); 
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
        });
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

    function selectByCircle(circle) {
        selectCircle(circle);
        images.selectById(circle.attr('id'));
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

    function selectCircle(circle) {
        var selected = getSelectedCircle();
        if (selected)
            toggleSelected(selected);
        toggleSelected(circle);
    }

    this.asIndicator = function() {
        unrelateCircles();
        startAnimate(500);
        placeCircles(width/2, height/2, 500);
    }

    this.asSwitch = function() {
        stopAnimate(500);
        relateCircles();
        placeCirclesDown(height, width, 500);
    }
}

doInARow([{ 
    time: interval, 
    todo: unhide 
}, { 
    time: imageInterval , 
    todo: load, args: IMAGE_IDS 
}, { 
    time: interval, 
    todo: hide
}]);

function load(IMAGE_IDS) {
    var g = s.g().attr({
                    id: "images"
                 });
    cover.before(g);
    images = new Images(s, g, IMAGE_IDS).init();
}

function doInARow(callbacks) {
    if (callbacks.length > 0) {
        var callback = callbacks.pop();
        if (callback.args)
            callback.todo(callback.args);
        else
            callback.todo();
        window.setTimeout(function() {
            doInARow(callbacks);
        }, callback.time)
    }
}

function hide() {
    cover = new Cover(s).init();
    circles = new Circles(s).init();    
    circles.asIndicator();
}

function unhide() {
    circles.asSwitch();
    cover.open(); 
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

var startMillis;
var timerId;

document.body.onresize = function() {
    height = document.body.clientHeight;
    width = document.body.clientWidth;
       
    cover.adjust();
    cover.close();
    circles.asIndicator();
    
    var currentMillis = new Date().getTime();
    if ((currentMillis - startMillis) < 300)
        clearTimeout(timerId);
    timerId = setTimeout(function() {
        cover.open();
        images.adjust();
        circles.asSwitch();
    }, 1000);
    startMillis = currentMillis;
}