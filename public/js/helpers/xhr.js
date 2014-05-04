(function (exports) {
    'use strict';

    exports.request = xhrRequest;
    exports.get = xhrRequest.bind(exports, 'GET');
    exports.post = xhrRequest.bind(exports, 'POST');

    exports.STATE = {
        UNSENT: 0,
        OPENED: 1,
        HEADERS_RECEIVED: 2,
        LOADING: 3,
        DONE: 4
    };

    /**
     * Send an XHR request.
     * @param {string} method 'get', 'post'…
     * @param {string} url
     * @param {object} options  { data: { your: 'data', json: true } }
     * @param {Function} callback fn(error, response)
     * @return {XMLHttpRequest}
     */
    function xhrRequest(method, url, options, callback) {
        method = method.toUpperCase();

        if (!callback) {
            callback = options;
            options = {};
        }
        if (typeof callback !== 'function') {
            throw new TypeError('A callback is mandatory for the XHR request');
        }

        var data = options.data || {};
        var json = !!options.json;

        var xhr = createXhr();
        var body = null;

        if (method === 'GET') {
            url += ('?' + toQueryString(data));
        }

        xhr.open(method, url, true);

        if (method === 'POST') {
            if (json) {
                xhr.setRequestHeader('Content-Type', 'application/json');
                body = JSON.stringify(data);
            } else {
                xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                body = toQueryString(data);
            }
        }

        xhr.onreadystatechange = handleStateChangeWith(callback);
        xhr.send(body);

        return xhr;
    }

    /**
     * @return {XMLHttpRequest}
     */
    function createXhr() {
        var xhr = null;

        if (window.XMLHttpRequest) {
            xhr = new XMLHttpRequest();
        } else if (window.ActiveXObject) {
            try {
                xhr = new ActiveXObject('Microsoft.XMLHTTP');
            } catch(e) {
                xhr = new ActiveXObject('Msxml2.XMLHTTP');
            }
        } else {
            throw new Error('Cannot instantiate XHR.');
        }

        return xhr;
    }

    /**
     * Create a function handling XHR state changes with the provided callback.
     * @param  {Function} callback fn(error, response)
     * @return {Function} fn(event)
     */
    function handleStateChangeWith(callback) {
        return function handleStateChange(event) {
            var xhr = event.srcElement;
            var error = null;
            var response;

            if (xhr.readyState === exports.STATE.DONE) {
                if (xhr.status === 0) {
                    error = new Error('unknown request status, the server or network may be unreachable');
                }
                response = getResponseFromXhr(xhr);

                callback(
                    error,
                    new XMLHttpResponse(
                        xhr,
                        xhr.status,
                        xhr.statusText,
                        response.content,
                        response.format
                    )
                );
            }
        };
    }

    /**
     * Transform a data object into a query string.
     * @param  {object} data { param: 'value', otherParam: 'otherValue' }
     * @return {string} 'param=value&otherParam=otherValue'
     */
    function toQueryString(data) {
        var query = [];
        var name;

        for (name in data) {
            if (data.hasOwnProperty(name)) {
                query.push(name + '=' + encodeURIComponent(data[name]));
            }
        }

        return query.join('&');
    }

    /**
     * Retrieve the response content and format from and XHR object.
     * @param  {XMLHttpRequest} xhr
     * @return {object} { content: [XMLDocument|Object|string], format: ['xml'|'json'|'text'] }
     */
    function getResponseFromXhr(xhr) {
        var content;
        var format;

        if (xhr.responseXML) {
            content = xhr.responseXML;
            format = 'xml';
        } else {
            try {
                content = JSON.parse(xhr.responseText);
                format = 'json';
            } catch (error) {
                content = xhr.responseText;
                format = 'text';
            }
        }

        return { content: content, format: format };
    }

    /**
     * Constructor.
     * @param {XMLHttpRequest} xhr
     * @param {Number} statusCode
     * @param {string} statusText
     * @param {XMLDocument|Object|string} data
     * @param {string} format ['xml'|'json'|'text']
     */
    function XMLHttpResponse(xhr, statusCode, statusText, data, format) {
        this.request = xhr;
        this.status = statusCode;
        this.statusText = statusText;
        this.data = data;
        this.format = format;
    }
}(window.xhr = {}));
