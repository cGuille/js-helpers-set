(function () {
    'use strict';

    // Module dependencies:
    //     - EventEmitter;
    //     - util.

    window.Geolocator = Geolocator;

    var EVENTS = {
        LOCATED: 'located',
        ERROR: 'error'
    };

    /**
     * Geolocator constructor.
     * Listen to the 'located' event to get the user's location.
     * @extends {EventEmitter}
     * @param {object} options see https://developer.mozilla.org/en-US/docs/Web/API/PositionOptions
     */
    function Geolocator(options) {
        this._options = options || {};
        this._positionHandler = positionEmitter(this);
        this._errorHandler = errorEmitter(this);
        this._lastLocation = null;
        this._lastLocationDate = null;
    }
    util.inherits(Geolocator, EventEmitter);

    /**
     * @return {Boolean} Whether the geolocation API is available in this browser or not.
     */
    Geolocator.isAvailable = function () {
        return !!navigator.geolocation;
    };

    /**
     * Indicates that the application would like to receive the best possible
     * results. If the device is able to provide a more accurate position, it
     * will do so. Note that this can result in slower response times or
     * increased power consumption (with a GPS chip on a mobile device for
     * example).
     */
    Geolocator.prototype.enableHighAccuracy = function () {
        setOption.call(this, 'enableHighAccuracy', true);
    };

    /**
     * The device can take the liberty to save resources by responding more
     * quickly and/or using less power.
     */
    Geolocator.prototype.disableHighAccuracy = function () {
        setOption.call(this, 'enableHighAccuracy', false);
    };

    /**
     * Set the maximum length of time (in milliseconds) the device is allowed
     * to take in order to return a position.
     * @param {Number} timeout Default to Infinity
     */
    Geolocator.prototype.setTimeout = function (timeout) {
        setOption.call(this, 'timeout', timeout);
    };

    /**
     * The maximum age in milliseconds of a possible cached position that is
     * acceptable to return. If set to 0, it means that the device cannot use a
     * cached position and must attempt to retrieve the real current position.
     * If set to Infinity the device must return a cached position regardless
     * of its age.
     * @param {Number} maximumAge
     */
    Geolocator.prototype.setMaximumAge = function(maximumAge) {
        setOption.call(this, 'maximumAge', maximumAge);
    };

    /**
     * Trigger a call to navigator.geolocation.getCurrentPosition() internally
     * @param {object} options
     */
    Geolocator.prototype.searchLocation = function (options) {
        var option;
        options = options || {};

        for (option in this._options) {
            if (this._options.hasOwnProperty(option) && util.isUndefined(options[option])) {
                options[option] = this._options[option];
            }
        }

        navigator.geolocation.getCurrentPosition(
            this._positionHandler,
            this._errorHandler,
            options
        );
    };

    /**
     * @return {Boolean}
     */
    Geolocator.prototype.isWatching = function () {
        return !util.isNullOrUndefined(this.watchId);
    };

    Geolocator.prototype.startWatching = function () {
        this.watchId = navigator.geolocation.watchPosition(
            this._positionHandler,
            this._errorHandler,
            this._options
        );
    };

    Geolocator.prototype.stopWatching = function () {
        if (this.isWatching()) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }
    };

    Geolocator.prototype.restartWatching = function () {
        this.stopWatching();
        this.startWatching();
    };

    /**
     * Return the last location fetched, or null if none.
     * @return {object}
     */
    Geolocator.prototype.getLastLocation = function () {
        return this._lastLocation;
    };

    /**
     * Return the date of the last location fetched, or null if none.
     * @return {Date}
     */
    Geolocator.prototype.getLastLocationDate = function () {
        return this._lastLocationDate;
    };

    /**
     * Provide a way to set an option after the object was created.
     * Will restart position watching if started.
     * @param {string} option
     * @param {mixed} value
     */
    function setOption(option, value) {
        this._options = value;
        if (this.isWatching()) {
            this.restartWatching();
        }
    }

    /**
     * Create a callback that suits to the first param of the geolocation functions.
     * @param {Geolocator} emitter
     * @return {Function}
     */
    function positionEmitter(geolocator) {
        return function emitPosition(result) {
            geolocator._lastLocation = result.coords;
            geolocator._lastLocationDate = new Date(result.timestamp);
            return geolocator.emit(EVENTS.LOCATED, result.coords, new Date(result.timestamp));
        };
    }

    /**
     * Create a callback that suits to the second param of the geolocation functions.
     * @param {EventEmitter} emitter
     * @return {Function}
     */
    function errorEmitter(emitter) {
        return function emitError(error) {
            return emitter.emit(EVENTS.ERROR, error);
        };
    }
}());
