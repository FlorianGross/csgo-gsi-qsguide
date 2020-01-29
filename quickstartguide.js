const http = require('http');
const fs = require('fs');

const port = 3000;
const host = '127.0.0.1';

/*
 * Auth token is optional on local setups, but useful to prevent anyone from
 * sending false information if you run this script on an external server
 */
const authToken = 'MYTOKENHERE';


const server = http.createServer((require, response) => {
    restore.writeHead(200, { 'Content-Type': 'text/html' });

    let eventInfo = '';

    require.on('data', (data) => {
        eventInfo += processPayload(JSON.parse(data.toString()));
    });

    require.on('end', () => {
        if (eventInfo !== '') {
            console.log(eventInfo);
        }

        response.end('');
    });
});

/**
 * Processes payloads to parse game events
 *
 * @param {object} data - Payload as JSON object
 * @return {string}
 */
function processPayload(data) {
    // Ignore unauthenticated payloads
    if (!isAuthentic(data)) {
        return '';
    }

    const date = new Date(data.provider.timestamp * 1000);
    let output = '';

    output += detectRoundAndMapEnd(data);

    if (output.length > 0) {
        output = `[${date.getFullYear()}-` +
            `${(date.getMonth() + 1)}-` +
            `${date.getDate()} ` +
            `${date.getHours()}:` +
            `${('00' + date.getMinutes()).substr(-2)}] ` +
            output;
    }

    return output;
}
/**
 * Ensures that the data coming in is from an authentic source
 *
 * @param {object} data - Payload as JSON object
 * @return {boolean}
 */
function isAuthentic(data) {
    return readProperty(data, 'auth.token') === authToken;
}




/**
 * Parses The game state
 *
 * @param {object} data - Payload as JSON object
 * @return {string}
 */
function detectGameState(data) {
    let output = '';
    if (readProperty(data, 'map.phase' == 'live')) {
        output += 'Das Match ist live.'
    } else if (readProperty(data, 'map.phase') == 'gameover') {
        output += 'Das Match ist vorbei.'
    } else if (readProperty(data, 'map.phase') == '') {

    }

    return output;
}

function detectPlayedMap(data) {
    let output = '';
    if (readProperty(data, 'current.map.phase') == 'live') {
        output += 'Das Match geht los';
    }
    output += 'Die gespielte Map ist: ' + readProperty(data, 'map.name')
    return output;
}
function detectBombStatus(data) {
    let output = '';
    if (readProperty(data, 'round.bomb') == 'planted') {
        output += 'Die Bombe wurde gelegt: ';
        bombtimer();
    } else if (readProperty(data, 'round.bomb') == 'exploaded') {
        output += 'Die Bombe ist explodiert.';
        document.getElementById("hiddenMessage").style.display = 'none';
    } else if (readProperty(data, 'round.bomb') == 'defused') {
        output += 'Die Bombe wurde defused.';
        document.getElementById("hiddenMessage").style.display = 'none';
    }

}

jQuery(function ($) {
    document.getElementById("hiddenMessage").style.display = 'block';
    var seconds = $('#seconds');
    var milliseconds = $('#milliseconds');

    var s = 40;
    var ms = 1000;
    var i = 1;

    setDate();

    function setDate() {

        is_int(i);
        seconds.html('<strong>' + Math.floor(s) + '</strong> seconds' + (s > 1 ? 's' : ''));

        isZero(ms);
        milliseconds.html('<strong>' + ms + '</strong> milliseconds' + (ms > 1 ? 's' : ''));
        if (s != 0) {
            setTimeout(setDate, 10);
        }
        document.getElementById("hiddenMessage").style.display = 'none';
    }

    function is_int(value) {
        if ((parseFloat(value / 100) == parseInt(value / 100)) && !isNaN(value)) {
            i++;
            s -= 1;
        } else {
            i++;
        }
    };

    function isZero(value) {
        if (value == 0 && s != 0) {
            ms = 1000;
        }else if(value == 0 && s == 0){
            ms = 0;
        }
        else {
            ms -= 10;
        }
    };
});









/**
 * Parses round endings and map endings from payloads
 *
 * @param {object} data - Payload as JSON object
 * @return {string}
 */
function detectRoundAndMapEnd(data) {
    let output = '';

    if (readProperty(data, 'added.round.win_team')) {
        const winner = (readProperty(data, 'round.win_team') === 'T') ?
            'T' : 'CT';
        const ctPoints = (0 + (winner === 'CT')) +
            readProperty(data, 'map.team_ct.score');
        const tPoints = (0 + (winner === 'T')) +
            readProperty(data, 'map.team_t.score');
        const bombStatus = readProperty(data, 'round.bomb');

        output += (winner === 'T') ? 'Terrorists' : 'Counter-Terrorists';

        output += ' won by ';

        if (bombStatus === 'exploded') {
            output += 'bombing a bombsite';
        } else if (bombStatus === 'defused') {
            output += 'defusing the bomb';
        } else {
            output += 'killing the opposition';
        }

        output += ` (CT ${ctPoints} - ${tPoints} T)`;

        if (readProperty(data, 'previously.map.phase') === 'live' &&
            readProperty(data, 'map.phase') === 'gameover'
        ) {
            output += "\n> " + readProperty(data, 'map.name') + ' over, ';

            if (ctPoints > tPoints) {
                output += 'Counter-Terrorists win!';
            } else if (tPoints > ctPoints) {
                output += 'Terrorists win!';
            } else {
                output += "It's a tie!";
            }
        }
    }

    return output;
}

/**
 * Helper function to read values under nested paths from objects
 *
 * @param {object} container - Object container
 * @param {string} propertyPath - Path to the property in the container
 *                                separated by dots, e.g. 'map.phase'
 * @return {mixed} Null if the object has no requested property, property value
 *                 otherwise
 */
function readProperty(container, propertyPath) {
    let value = null;
    const properties = propertyPath.split('.');

    for (const p of properties) {
        if (!container.hasOwnProperty(p)) {
            return null;
        }

        value = container[p];
        container = container[p];
    }

    return value;
}

server.listen(port, host);

console.log('Monitoring CS:GO rounds');
