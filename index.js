'use strict';
const PuzzleSolver = require('./solver');

exports.handler = (event, context, callback) => {
    console.log(event);

    //Performance compared to an object with keys matching the query params was within 0.5% but
    //we need the switch case for instantiation of puzzlesolver and a default catch all
    let response = 'OK';
    let statusCode = '200';
    switch (event.queryStringParameters.q) {
        case 'Ping':
            response = 'OK';
            break;
        case 'Name':
            response = 'Mickey Schwab';
            break;
        case 'Email Address':
            response = 'mickeyschwab@gmail.com';
            break;
        case 'Phone':
            response = '+14195098644';
            break;
        case 'Position':
            response = 'Software Engineer';
            break;
        case 'Years':
            //Int as, unlike phone numbers, this could be used for numerical comparison
            response = 6;
            break;
        case 'Referrer':
            response = 'Jason Bier - EVP Engine Media';
            break;
        case 'Degree':
            response = 'B.A. Economics & French - DePaul University 2012';
            break;
        case 'Resume':
            //uriencode is unecessary by virtue of how this is received and not parsed
            response = 'https://assets.mickeyschwab.com/Mickey%20Schwab.pdf';
            break;
        case 'Source':
            response = 'https://github.com/mickeyschwab/brealtime';
            break;
        case 'Status':
            response = 'US Citizen';
            break;
        case 'Puzzle':
            const puzzleString = event.queryStringParameters.d
                .substring(26)
                .replace(/\r?\n|\r/g, ' ')
                .trim();
            //Instantiate the solver class and use it to find the solution
            try {
                response = formatPuzzleSolution(PuzzleSolver.solve(puzzleString));
            } catch(err) {
                response = err;
                statusCode = 400;
            }
            break;
        default:
            response = 'Invalid query parameter!'
            statusCode = '400';
    }

    callback(null, {
        statusCode: statusCode,
        body: response,
        headers: {
            'Content-Type': 'text/html'
        },
    });

};

/**
 *
 * @param {Array} solution
 * @returns {string}
 */
function formatPuzzleSolution(solution) {
    let headerRow = ' ';
    for(let i = 0; i < solution.length; i++) {
        const character = String.fromCharCode(65 + i);
        headerRow += character;
        solution[i].unshift(character);
    }

    let formattedSolutionArray = solution.map(row => row.join(''));
    formattedSolutionArray.unshift(headerRow);

    const formattedSolution = formattedSolutionArray.join('\n');

    return formattedSolution;
}