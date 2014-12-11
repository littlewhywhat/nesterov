var SVG_ID = "#content",
    SELECTED_CLASS = "selected",
    height = document.body.clientHeight,
    width = document.body.clientWidth,
    IMAGE_IDS = ["zero", "one", "two"];

var s = Snap(SVG_ID);
var interval = 500;
    imageInterval = 4000;

var images = new Images(s, IMAGE_IDS).init(),
    cover = new Cover(s).init().draw(),
    circles = new Circles(s).init().draw();  
function Images(s, IMAGE_IDS) {
    var TAG = "image",
        GID = "images",
        instance = this;
    this.init = function() {
        g(GID);
        return instance;       
    }

    this.draw = function() {
        var g = getGById(GID);
        for (var i = 0, len = IMAGE_IDS.length; 
                        i < len; i++)
            g.append(createImage(IMAGE_IDS[i], null));
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
        select(image, instance.selected());
        getGById(GID).append(image);
    }   

    function getImageURL(id) {
        return id + ".jpg";
    }

    function getImageSet() {
        return getAll(TAG);
    }

    function getImageById(id) {
        return getById(TAG, id);
    }

    this.selected = function() {
        return getSelected(TAG);
    }

    this.selectById = function(id) {
        selectImage(getImageById(id));
    }
}

function Cover(s) {
    var ID = "cover",
        GID = "cover",
        TAG = "rect";
    this.init = function() {
        g(GID);
        return this;
    }

    this.draw = function() {
        getGById(ID).append(drawCover(width + 100, height + 100));
        return this;
    }

    function getCover() {
        return getById(TAG, ID);
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
                    id: ID
                });
    }
}

function Circles(s) {
    var TAG = "circle",
        GID = "circles",
        RADIUS = 10,
        DISTANCE = 5,
        instance = this,
        sw = new Switch(this, images),
        indicator = new Indicator(this);
    this.init = function() {     
        g(GID);
        return this;
    }

    this.draw = function() {
        var g = getGById(GID);
        for (var i in IMAGE_IDS) 
            g.append(drawCircle(0, 0, IMAGE_IDS[i]));
        return this;
    }

    function Switch(byselects, toselects) {
        function relate() {
            byselects.selectSet()
                  .forEach(function(byselect){
                      byselect.hover(hover);
                  });
            var selectedId = toselects.selected().attr('id');
            byselects.selectById(selectedId);
        }

        function unrelate() {
            byselects.selectSet()
                  .forEach(function(byselect){
                      byselect.unhover(hover);
                  });
            var selected = byselects.selected();
            if (selected)
                unselect(selected);
        }

        function hover() {
            selectBoth(this.attr('id')); 
        }

        function selectBoth(id) {
            byselects.selectById(id);
            toselects.selectById(id);
        }

        this.start = function() {
            relate();
        }

        this.stop = function() {
            unrelate();
        }

        return this;
    }

    function Indicator(circles) {

        this.start = function() {
            startAnimate(500);
        }

        this.stop = function() {
            stopAnimate(500);
        }

        function startAnimate(interval) {
            circles.selectSet().forEach(function(circle) {
                animateCircle(circle, interval, true);
            });
        }

        function stopAnimate(interval) {
            circles.selectSet().forEach(function(circle) {
                circle.stop();
                animateCircle(circle, interval);
            });
        }

        function animateCircle(circle, interval, isendless) {
            circle.animate({ 
                r: 0
            }, interval, mina.easein, 
            function() {
                circle.animate({
                    r: RADIUS
                }, interval, mina.easein, isendless?
                function() {
                    animateCircle(circle, interval, isendless);
                } : null);
            });
        }
        return this;
    }   

    function drawCircle(cx, cy, id) {
        return s.circle(cx, cy, RADIUS).attr({
                    fill: "white",
                    id: id,
                    stroke: "black",
                    strokeWidth: 2
                });
    } 

    function move(x, y, interval) {
        var set = instance.selectSet();
            count = set.length;
        var cx = x - RADIUS - 
            count * RADIUS
           + Math.round(count/2 - 0.1) 
           * DISTANCE;
        var cy = y;
        set.forEach(function(circle) {
            circle.animate({
                cx: cx,
                cy: cy
            }, interval);
            cx += RADIUS * 2 + DISTANCE;
        });
    }

    function moveDown(interval) {
        move(
            width/2, 
            height - RADIUS - DISTANCE,
            interval
        );
    }

    this.selectSet = function() {
        return getAll(TAG);
    }

    function getCircleById(id) {
        return getById(TAG, id);
    }

    this.selected = function() {
        return getSelected(TAG);
    }

    this.selectById = function(id) {
        select(getCircleById(id), instance.selected());
    }

    this.asIndicator = function() {
        sw.stop();
        move(width/2, height/2, 500);
        indicator.start();
    }

    this.asSwitch = function() {
        indicator.stop();
        moveDown(500)
        sw.start();
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
    images.draw();
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
    cover.close();
    circles.asIndicator();
}

function unhide() {
    circles.asSwitch();
    cover.open(); 
}

function getAll(css) {
    return s.selectAll(css);
}

function getGById(id) {
    return getById("g", id);
}

function g(id) {
    s.g().attr({ id: id });
}

function getById(css, id) {
    return s.select(css + "#" + id);
}

function getSelected(css) {
    return s.select(css + "." + SELECTED_CLASS);
}

function select(element, selected) {
    if (selected)
        unselect(selected);
    element.toggleClass(SELECTED_CLASS, true);
}

function unselect(element) {
    element.toggleClass(SELECTED_CLASS, false);
}

var startMillis;
var timerId;

document.body.onresize = function() {
    height = document.body.clientHeight;
    width = document.body.clientWidth;
       
    cover.adjust();
    hide();
    
    var currentMillis = new Date().getTime();
    if ((currentMillis - startMillis) < 300)
        clearTimeout(timerId);
    timerId = setTimeout(function() {
        images.adjust();
        unhide();
    }, 1000);
    startMillis = currentMillis;
}