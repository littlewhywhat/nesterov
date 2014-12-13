var SVG_ID = "#content",
    SELECTED_CLASS = "selected",
    height = document.body.clientHeight,
    width = document.body.clientWidth,
    IMAGE_IDS = ["zero", "one", "two"];

var s = Snap(SVG_ID);
var animInterval = 500;
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
        var image;
        for (var i = 0, len = IMAGE_IDS.length; 
                        i < len; i++)
            image = appendImage(IMAGE_IDS[i]);
        selectImage(image);
        center();
        return instance;
    }

    function appendImage(image) {
        var image = drawImage(image),
            g = getGById(GID);
        g.append(image);
        adjustImage(image);
        return image;
    }

    function drawImage(image) {
        return s.image(getImageURL(image), 0, 0, 0, 0)
                     .attr({
                        id: image
                     });
    }

    function adjustImage(image) {
        var rate = width/height,
            adjheight = height,
            adjwidth = width;
        if (rate > 2)
            adjheight = adjwidth/2;
        else if (rate < 2)
            adjwidth = adjheight * 2;
        image.attr({
            height: adjheight,
            width: adjwidth
        });
    }

    this.adjust = function() {
        getImageSet().forEach(function(image) {
            adjustImage(image);
        })
        center();
    }

    function center() {
        var adjwidth = instance.selected().getBBox().w,
            center = width/2 - adjwidth/2,
            g = getGById(GID);
        g.transform("t" + [center, 0]);
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
        getGById(ID).append(
            drawCover(getWidth(), getHeight())
        );
        return this;
    }

    function getWidth() {
        return width + 100;
    }

    function getHeight() {
        return height + 100;
    }

    function getCover() {
        return getById(TAG, ID);
    }

    this.open = function() {
        getCover().animate({
            opacity: 0
        }, animInterval);
    }

    this.close = function() {
        getCover().attr({
            opacity: 1
        });
    }

    this.adjust = function() {
        getCover().attr({
            width: getWidth(),
            height: getHeight()
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
        animator;
    this.init = function() {     
        g(GID);
        return this;
    }

    this.draw = function() {
        for (var i = 0, len = IMAGE_IDS.length; 
                        i < len; i++) 
            appendCircle(IMAGE_IDS[i]);
        animator = new Animator(instance.selectSet(),{
                    r: 0
                }, {
                    r: RADIUS
                });
        return this;
    }

    function appendCircle(id) {
        var g = getG(),
            len = instance.selectSet().length,
            cx = len * (RADIUS * 2 + DISTANCE);
        g.append(drawCircle(cx, 0, id));
    } 

    function Switch(byselects, toselects) {
        function relate() {
            byselects.selectSet()
                  .forEach(function(byselect){
                      byselect.hover(hover);
                  });
            var selected = toselects.selected();
            if (selected)
                byselects.selectById(selected.attr('id'));
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

    function Animator(elements, to, from) {

        this.start = function() {
            start(animInterval);
        }

        this.stop = function() {
            stop(animInterval);
        }

        function start(interval) {
            elements.forEach(function(element) {
                animate(element, interval);
            });
        }

        function stop(interval) {
            elements.forEach(function(element) {
                element.stop();
            });
            elements.animate(from, interval, mina.easein);
        }

        function animate(element, interval) {
            element.animate(to, interval, mina.easein, 
            function() {
                element.animate(from, interval, mina.easein, 
                    function() {
                        animate(element, interval);
                });
            });
        }
    }   

    function drawCircle(cx, cy, id) {
        return s.circle(cx, cy, RADIUS).attr({
                    fill: "white",
                    id: id,
                    stroke: "black",
                    strokeWidth: 2
                });
    } 

    function move(x, y) {
        var g = getG(),
            bbox = g.getBBox(),
            gcx = bbox.w/2,
            gcy = bbox.h/2,
            tx = x - gcx + RADIUS,
            ty = y - gcy;
        g.animate({
            transform: 't' + [tx, ty]
        }, animInterval);
    }

    function getG() {
        return getGById(GID);
    }

    function moveDown() {
        move(width/2, height - RADIUS - DISTANCE);
    }

    function moveCenter() {
        move(width/2, height/2);
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
        moveCenter();
        animator.start();
    }

    this.asSwitch = function() {
        animator.stop();
        moveDown()
        sw.start();
    }
}

doInARow([{ 
    time: animInterval, 
    todo: unhide 
}, { 
    time: imageInterval , 
    todo: load 
}, { 
    time: animInterval, 
    todo: hide
}]);

function load() {
    images.draw();
}

function doInARow(callbacks) {
    if (callbacks.length > 0) {
        var callback = callbacks.pop();
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

{var startMillis = new Date().getTime(),
     timerId,
     wait = 500;

document.body.onresize = function() {
    height = document.body.clientHeight;
    width = document.body.clientWidth;
       
    cover.adjust();
    hide();
    
    var currentMillis = new Date().getTime();
    if ((currentMillis - startMillis) < wait)
        clearTimeout(timerId);
    timerId = setTimeout(function() {
        images.adjust();
        unhide();
    }, wait);
    startMillis = currentMillis;
}}