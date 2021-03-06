/**
 * Created by yantianyu on 2015/10/8.
 */
window.Swipe = function (element, options) {
    if (!element) return null;
    var _this = this;
    this.options = options || {};
    this.index = this.options.startSlide || 0;
    this.speed = this.options.speed || 300;
    this.callback = this.options.callback || function () {
        };
    this.delay = this.options.auto || 0;
    this.CustomDistance = this.options.Distance || 0;
    this.container = element;
    this.element = container.children[0];
    this.container.style.overflow = 'hidden';
    this.container.style.listStyle = 'none';
    this.container.style.margin = 0;
    this.setup();
    this.begin();

    if (this.element.addEventListener) {
        this.element.addEventListener('touchstart', this, false);
        this.element.addEventListener('touchmove', this, false);
        this.element.addEventListener('touchend', this, false);
        this.element.addEventListener('webkitTransitionEnd', this, false);
        this.element.addEventListener('msTransitionEnd', this, false);
        this.element.addEventListener('oTransitionEnd', this, false);
        this.element.addEventListener('transitionend', this, false);
        window.addEventListener('resize', this, false);
    }
};
Swipe.prototype = {
    setup: function () {
        console.log(this);
        this.slides = this.element.children;
        this.length = this.slides.length;
        if (this.length < 2) return null;

        this.width = ("getBoundingClientRect" in this.container) ? this.container.getBoundingClientRect().width : this.container.offsetWidth;

        if (!this.width) return null;
        this.container.style.visibility = 'hidden';
        this.element.style.width = (this.slides.length * this.width - (this.CustomDistance * this.length)) + 'px';
        var index = this.length;
        while (index--) {
            var el = this.slides[index];
            el.style.width = this.width - this.CustomDistance + 'px';
            el.style.display = 'table-cell';
            el.style.verticalAlign = 'top';
        }
        this.slide(this.index, 0);
        this.container.style.visibility = 'visible';
    },
    slide: function (index, duration) {
        var style = this.element.style;
        if (duration == undefined) {
            duration = this.speed;
        }
        style.webkitTransitionDuration = style.MozTransitionDuration = style.msTransitionDuration = style.OTransitionDuration = duration + 'ms';
        style.MozTransform = style.webkitTransform = 'translate3d(' + -(index * (this.width - this.CustomDistance)) + 'px,0,0)';
        style.msTransform = style.Otransform = 'translateX(' + -(index * (this.with - this.CustomDistance)) + 'px)';
        this.index = index;
    },
    getPos: function () {
        return this.index;
    },
    prev: function (delay) {
        this.delay = delay || 0;
        clearTimeout(this.interval);
        if (this.index)this.slide(this.index - 1, this.speed);
    },
    next: function (delay) {
        this.delay = delay || 0;
        clearTimeout(this.delay);
        if (this.index < this.length - 1) this.slide(this.index + 1, this.speed);
        else this.slide(0, this.speed);
    },
    begin: function () {
        var _this = this;
        this.interval = (this.delay) ? setTimeout(function () {
            _this.next(_this.delay);
        }, this.delay) : 0;
    },
    stop: function () {
        this.delay = 0;
        clearTimeout(this.interval);
    },
    resume: function () {
        this.delay = this.options.auto || 0;
        this.begin();
    },
    handleEvent: function (e) {
        switch (e.type) {
            case 'touchstart':
                this.onTouchStart(e);
                break;
            case 'touchmove':
                this.onTouchMove(e);
                break;
            case 'touchend':
                this.onTouchEnd(e);
                break;
            case 'webkitTransitionEnd':
            case 'msTransitionEnd':
            case 'oTransitionEnd':
            case 'transitionend':
                this.transitionEnd(e);
                break;
            case 'resize':
                this.setup();
                break;
        }
    },
    transitionEnd: function (e) {
        if (this.delay) this.begin();
        this.callback(e, this.slides[this.index]);
    },
    onTouchStart: function (e) {
        this.start = {
            pageX: e.touches[0].pageX,
            pageY: e.touches[0].pageY,
            time: Number(new Date())
        };
        this.isScrolling = undefined;
        this.deltaX = 0;
        this.element.style.MozTransitionDuration = this.element.style.webkitTransitionDuration = 0;
    },
    onTouchMove: function (e) {
        if (e.touches.length > 1 || e.scale && e.scale !== 1) return;
        this.deltaX = e.touches[0].pageX - this.start.pageX;
        if (typeof this.isScrolling == 'undefined') {
            this.isScrolling = !!(this.isScrolling || Math.abs(this.deltaX) < Math.abs(e.touches))
        }
        if (!this.isScrolling) {
            e.preventDefault();
            clearTimeout(this.interval);
            this.deltaX = this.deltaX / ((!this.index && this.deltaX > 0 || this.index == this.length - 1 && this.deltaX < 0) ? (Math.abs(this.deltaX) / this.width + 1) : 1);
            this.element.style.MozTransform = this.element.style.webkitTransform = 'translate3d(' + (this.deltaX - this.index * (this.width - this.CustomDistance)) + 'px,0,0)';
        }
    },
    onTouchEnd: function (e) {
        var isValidSlide = Number(new Date()) - this.start.time < 250 && Math.abs(this.deltaX) > 20 || Math.abs(this.deltaX) > this.width / 2,
            isPastBounds = !this.index && this.deltaX > 0 || this.index == this.length - 1 && this.deltaX < 0;
        if (!this.isScrolling) {
            this.slide(this.index + (isValidSlide && !isPastBounds ? (this.deltaX < 0 ? 1 : -1) : 0), this.speed);
        }
    }
};
