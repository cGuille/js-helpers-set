document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    var buttonElts = Array.prototype.slice.call(document.querySelectorAll('button'));
    var selectFormatElt = document.querySelector('#format');
    var bodyContentElt = document.querySelector('#content');

    buttonElts.forEach(function (btnElt) {
        btnElt.addEventListener('click', function (event) {
            var method = btnElt.textContent;
            var options = {
                data: JSON.parse(bodyContentElt.textContent),
                json: selectFormatElt.selectedOptions[0].value === 'json'
            };

            console.log('\nSending a ' + method + ' request with options:\n');
            console.log(options);
            xhr.request(method, '/api/test', options, function (error, response) {
                console.log('error:', error);
                console.log('response:', response);
                console.log('\n------------------------------');
            });
        });
    });
});
