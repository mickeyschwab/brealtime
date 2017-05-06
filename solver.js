let PuzzleSolver = {};

/**
 * Main function that accepts puzzle string from the challenge page, formats it into our matrix, and solves it
 *
 * @param {string} rawPuzzle
 * @returns {Array}
 */
PuzzleSolver.solve = function (rawPuzzle) {
    let puzzle = this.parseRawPuzzle(rawPuzzle);
    puzzle = this.setIdentities(puzzle);
    const solution = this.solvePuzzle(puzzle);
    return solution;
}

/**
 *
 * @param {string} rawPuzzleString raw input from bRealTime's resume submission site
 */
PuzzleSolver.parseRawPuzzle = function (rawPuzzleString) {
    if (rawPuzzleString.length !== 28) {
        throw 'Invalid puzzle length: ' + rawPuzzleString.length;
    }

    //Explode the string into its row components
    let rawPuzzleArray = rawPuzzleString.split(' ');

    //Drop the first row (just ' ABCD') which is useless to us
    rawPuzzleArray.splice(0,1);

    //Only fetch the last four digits of each row then explode each row into its own array
    rawPuzzleArray = rawPuzzleArray.map(x => x.substring(1).split(''));

    return rawPuzzleArray;
}

/**
 *
 * This function sets all the identities (A=A) as well as transforms values above that line to below.
 * We don't need to solve the entire puzzle, only half, then reflect that across the identity line
 * thus this function cuts our effective workload in half because from now on we can forget about the columns
 * and only check rows as they contain 100% of the available information
 *
 * @param {Array} puzzle
 * @returns {Array}
 */
PuzzleSolver.setIdentities = function (puzzle) {
    const inequalityOperators = ['>', '<'];
    for (let row = 0; row < puzzle.length; row++) {
        //As A will always = A and they appear at the same index value, it is safe to set row.column to itself
        puzzle[row][row] = '=';

        for(let column = 0; column < puzzle[row].length; column++) {
            if(inequalityOperators.indexOf(puzzle[row][column]) !== -1) {
                //Reflect and flip the unequal values across the line row=column as A > B --> B < A
                puzzle[column][row] = (puzzle[row][column] === '>') ? '<' : '>';
            }
        }
    }

    return puzzle;
}

/**
 *
 * Using the knowledge that only one row at a time can have only remaining less than signs
 * recursively identify that row and solve its outstanding columns
 *
 * @param {Array} puzzle
 * @param {Array} solvedRows
 * @returns {Array}
 */
PuzzleSolver.solvePuzzle = function (puzzle, solvedRows) {
    solvedRows = solvedRows || [];
    // >= in case we solve multiple rows in a single pass
    if(solvedRows.length >= puzzle.length) {
        //Bam, we solved the whole puzzle!
        return puzzle;
    }

    for(let row = 0; row < puzzle.length; row++) {
        if(solvedRows.indexOf(row) !== -1) {
            //We've already solved this row, carry on
            continue;
        }

        if(this.isMaximum(puzzle[row], solvedRows)) {
            for(let column = 0; column < puzzle[row].length; column++) {
                //Set any unsolved cells of the row on either side of the identity line to their appropriate signs
                if(puzzle[row][column] === '-') {
                    puzzle[row][column] = '>';
                    puzzle[column][row] = '<';
                }
            }
            solvedRows.push(row);
        }
    }

    //Call the solve function again with the updated puzzle and solvedRows until we reach base case
    return this.solvePuzzle(puzzle, solvedRows);
}

/**
 *
 * Checks if a given row is greater than all remaining unsolved rows
 *
 * @param {Array} row
 * @param {Array} solvedRows
 * @returns {boolean}
 */
PuzzleSolver.isMaximum = function(row, solvedRows) {
    for(let i = 0; i < row.length; i++) {
        //If we find a less than sign, this row obviously isn't the maximum***
        if(row[i] === '<') {
            //***Unless it's already been solved (and is therefore greater),
            // in which case we continue checking the rest of the columns
            if(solvedRows.indexOf(i) !== -1) {
                continue;
            }
            return false;
        }
    }

    return true;
}

module.exports = PuzzleSolver;