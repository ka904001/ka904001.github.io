dimension = 9;
sqrtDimension = Math.ceil(Math.sqrt(dimension));
/*
    ID system
    <th id="321"></th>
    board[9][9][9]

  1:123
    456
    789

*/
let elementsDOM = new Array(9);
for (let i = 0; i < 9; i++) {
    // block consists of 9 cells
    let block = elementsDOM[i] = new Array(9);
    for (let j = 0; j < 9; j++) {
        // cell consists of 9 possibilities
        let cell = block[j] = new Array(9);
    }

}

class Mutex {

    constructor() {

        this._locking = Promise.resolve();
        this._locks = 0;
    };

    isLocked() {

        return this._locks > 0;
    };

    lock() {

        this._locks += 1;

        let unlockNext;

        let willLock = new Promise(resolve => unlockNext = () => {
            this._locks -= 1;

            resolve();
        });

        let willUnlock = this._locking.then(() => unlockNext);

        this._locking = this._locking.then(() => willLock);

        return willUnlock;
    };
}

function div(x, y) {
    return [Math.floor(x / y), x % y];
};

function quot(x, y) {
    return Math.floor(x / y);
};

function constructBoard() {
    rowStyle = 'display: flex; flex-flow: row;';
    columnStyle = 'display: flex; flex-flow: column;';
    let board = document.getElementById('board');
    board.innerHTML = '';
    board.style.cssText += 'font-size: 20px; text-align:center;';
    let blockColumn = board;
    blockColumn.style.cssText += columnStyle;
    for (let i = 0; i < 9; i++) {
        if (i % 3 == 0) {
            // new row!
            blockRow = blockColumn.appendChild(document.createElement('div'));
            blockRow.style.cssText += rowStyle;
        }
        let cellColumn;
        for (let j = 0; j < 9; j++) {
            if (j % 3 == 0) {
                cellColumn = blockRow.appendChild(document.createElement('div'));
                cellColumn.style.cssText += columnStyle;
            }
            let cellRow;
            for (let k = 0; k < 9; k++) {
                if (k % 3 == 0) {
                    cellRow = cellColumn.appendChild(document.createElement('div'));
                    cellRow.style.cssText += rowStyle;
                }
                let possibility = cellRow.appendChild(document.createElement('div'));
                possibility.id = '' + (i + 1) + (j + 1) + (k + 1);
                possibility.innerHTML = '' + (k + 1);
                possibility.style.cssText += 'width: 20px; height: 20px;';
                possibility.classList.add('possibility');
                // transpose j, strange artefact
                let a = j % 3;
                let b = quot(j, 3);
                let trJ = a * 3 + b;
                elementsDOM[i][trJ][k] = possibility;
            }
        }
    }
    // draw lines
    // board main lines
    // main lines
    {
        for (let i = 0; i < 9; i++) {
            // top borders
            for (let j = 0; j < 3; j++) {
                for (let k = 0; k < 3; k++) {
                    elementsDOM[i][j][k].style.cssText += 'border-top: 3px solid';
                }
            }
            // for the last row bottom
            if (quot(i, 3) == 3 - 1) {
                for (let j = 6; j < 9; j++) {
                    for (let k = 6; k < 9; k++) {
                        elementsDOM[i][j][k].style.cssText += 'border-bottom: 3px solid';
                    }
                }
            }
            // left borders
            for (let j = 0; j < 9; j += 3) {
                for (let k = 0; k < 9; k += 3) {
                    elementsDOM[i][j][k].style.cssText += 'border-left: 3px solid';
                }
            }
            // for the right most border right
            if (i % 3 == 3 - 1) {
                for (let j = 2; j < 9; j += 3) {
                    for (let k = 2; k < 9; k += 3) {
                        elementsDOM[i][j][k].style.cssText += 'border-right: 3px solid';
                    }
                }
            }
        }
    }
    // inter block lines
    {
        for (let i = 0; i < 9; i++) {
            // horizontal
            for (let j = 3; j < 9; j++) {
                for (let k = 0; k < 3; k++) {
                    elementsDOM[i][j][k].style.cssText += 'border-top: 1px solid';
                }
            }
            // vertical
            for (let j = 0; j < 9; j++) {
                if (j % 3 == 0) {
                    continue;
                }
                for (let k = 0; k < 9; k += 3) {
                    elementsDOM[i][j][k].style.cssText += 'border-left: 1px solid';
                }
            }
        }
    }
    // for the rest of the lines make them dotted
    {
        document.querySelectorAll('.possibility:not([style*="border-left"])').forEach(elem => {
            elem.style.cssText += 'border-left: 1px dotted;';
        });
        document.querySelectorAll('.possibility:not([style*="border-top"])').forEach(elem => {
            elem.style.cssText += 'border-top: 1px dotted;';
        });
    }

}
constructBoard();

class Possibility {
    value;
    element;
    active;
    constructor(blockID, cellID, possibilityID) {
        if (possibilityID >= dimension || possibilityID < 0) {
            throw new Error('Value passed to the constructor of Possibility is out of range!');
        }
        this.value = possibilityID;
        this.active = true;
        this.i = blockID;
        this.j = cellID;
        this.k = possibilityID;
        this.element = elementsDOM[this.i][this.j][this.k];
        // write the possibility to the element
        this.element.innerHTML = '' + (this.value + 1);
        this.text = this.textID();
        this.clicked = new CustomEvent('clicked' + this.text, { 'detail': this });
        this.focused = new CustomEvent('focused' + this.text, { 'detail': this });
        this.unfocused = new CustomEvent('unfocused' + this.text, { 'detail': this });
        this.element.addEventListener('mousedown', (e) => {
            if (this.active) {
                if (e.which == 1) {
                    // left click
                    // archive the coordinates
                    Board.userStepsArchive.push(['clicked', this.line(), this.column(), this.k]);
                    document.body.dispatchEvent(this.clicked);
                    return;
                }
                if (e.which == 3) {
                    // right click
                    // empty the possibility
                    Board.userStepsArchive.push(['crossed', this.line(), this.column(), this.k]);
                    Possibility.crossOut(this);
                    Board.searchForLoners();
                }
            }
        });
        this.element.addEventListener('mouseover', (e) => {
            if (this.active) {
                let target = e.target;
                target.style.backgroundColor = 'rgba(0,0,255,0.2)';
                document.body.dispatchEvent(this.focused);
            }
        });
        this.element.addEventListener('mouseout', (e) => {
            if (this.active) {
                let target = e.target;
                target.style.backgroundColor = '';
                document.body.dispatchEvent(this.unfocused);
            }
        });
    };
    static line(i, j) {
        return quot(i, 3) * 3 + quot(j, 3);
    }
    static column(i, j) {
        return (i % 3) * 3 + (j % 3);
    };
    static textID(i, j, k) {
        return '' + (Possibility.line(i, j) + 1) + '' + (Possibility.column(i, j) + 1) + ' ' + (k + 1);
    };
    line() {
        return Possibility.line(this.i, this.j);
    };
    column() {
        return Possibility.column(this.i, this.j);
    };
    textID() {
        return Possibility.textID(this.i, this.j, this.k);
    };
    static onClicked(poss) {
        poss.active = false;
        poss.element.style.backgroundColor = 'white';
    };
    static crossOut(poss) {
        poss.active = false;
        poss.element.innerHTML = ' ';
        // poss.element.style.backgroundColor = 'grey';
    }
    static markDone(poss) {
        poss.active = false;
        poss.element.style.backgroundColor = 'rgba(0,0,255,0.2)';
    }
};

class Cell {
    possibilities;
    finalized;
    constructor(blockID, cellID) {
        // example of cellID "12"
        this.finalized = false;
        this.i = blockID;
        this.j = cellID;
        // document.getElementByID("msg");
        // deduce the elementsIDs from cellID 
        this.possibilities = [];
        for (let k = 0; k < 9; k++) {
            // concat the id
            this.possibilities.push(new Possibility(blockID, cellID, k));

        }
    }
};

class Block {
    cells;
    constructor(blockID) {
        this.cells = [];
        this.i = blockID;
        for (let j = 0; j < 9; j++) {
            this.cells.push(new Cell(blockID, j));
        }
    };
}

let board;
let initiated = false;
let eventListeners = {};
class Board {
    static blocks;
    static cells;
    constructor() {
        // user steps archive
        Board.userStepsArchive = [];
        Board.blocks = [];
        for (let i = 0; i < 9; i++) {
            Board.blocks.push(new Block(i));
        }
        // straight cells grid
        Board.cells = [];
        Board.cells = new Array(9);
        for (let i = 0; i < 9; i++) {
            Board.cells[i] = new Array(9);
            for (let j = 0; j < 9; j++) {
                Board.cells[i][j] = Board.blocks[quot(i, 3) * 3 + quot(j, 3)].cells[(i % 3) * 3 + j % 3];
            }
        }
        // mutex to resolve the data race
        Board.mutex = new Mutex();
        // add event listeners to propagate if a possibility was clicked
        if (initiated) {
            // purge previous event listeners
            for (const [key, value] of Object.entries(eventListeners)) {
                document.body.removeEventListener(key, value);
            }
            eventListeners = {};
        }
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                for (let k = 0; k < 9; k++) {
                    let textID = Possibility.textID(i, j, k);
                    // if one possibility in in cell is clicked, then
                    // all other in block are discarded
                    // all other in line of cells are discarded
                    // add event listener to the scope
                    eventListeners['clicked' + textID] = async(e) => {
                        let unlock = await Board.mutex.lock();
                        e.stopPropagation();
                        // position
                        let block = i;
                        let cell = j;
                        let possibility = k;
                        console.log('clicked on: ' + e.detail.text);
                        // finalize the cell
                        Board.blocks[i].cells[j].finalized = true;
                        Possibility.onClicked(e.detail);
                        // crossout within cell all others
                        for (let c = 0; c < 9; c++) {
                            Possibility.markDone(Board.blocks[i].cells[j].possibilities[c]);
                            if (c == k) {
                                continue;
                            }
                            Possibility.crossOut(Board.blocks[i].cells[j].possibilities[c]);
                        }
                        // crossout within the block:
                        for (let b = 0; b < 9; b++) {
                            if (b == j) {
                                continue;
                            }
                            Possibility.crossOut(Board.blocks[i].cells[b].possibilities[k]);
                        }
                        // crossout within column
                        let block_column = i % 3;
                        let cell_column = j % 3;
                        for (let a = block_column; a < 9; a += 3) {
                            if (a == i) {
                                continue;
                            }
                            for (let b = cell_column; b < 9; b += 3) {
                                Possibility.crossOut(
                                    Board.blocks[a].cells[b].possibilities[k]
                                );
                            }
                        }
                        // crossout within line
                        let block_line = quot(i, 3);
                        // console.log(block_line);
                        let cell_line = quot(j, 3);
                        // console.log(cell_line);
                        for (let a = block_line * 3; a < block_line * 3 + 3; a++) {
                            if (a == i) {
                                continue;
                            }
                            for (let b = cell_line * 3; b < cell_line * 3 + 3; b++) {
                                Possibility.crossOut(
                                    Board.blocks[a].cells[b].possibilities[k]
                                );
                            }
                        }
                        Board.searchForLoners();
                        console.log('releasing mutex');
                        unlock();
                    };
                    document.body.addEventListener('clicked' + textID, eventListeners['clicked' + textID]);
                }
            }
        }
        initiated = true;
    };
    static searchForLoners() {
        // SEARCH FOR LONE POSSIBILITIES
        // console.log('searching');
        // for(let a = 0; a < 9; a++){
        //     for(let b = 0; b < 9; b++){
        //         for(let c = 0; c < 9; c++){

        //         }
        //     }
        // }
        // if loner in a cell, fire click
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (Board.cells[i][j].finalized) {
                    continue;
                }
                let count = 0;
                let loner = 0;
                for (let c = 0; c < 9; c++) {
                    if (Board.cells[i][j].possibilities[c].active) {
                        count++;
                        loner = c;
                    }
                }
                if (count == 1) {
                    // loner in cell
                    console.log('loner in cell: ' + Board.cells[i][j].possibilities[loner].text);
                    document.body.dispatchEvent(Board.cells[i][j].possibilities[loner].clicked);
                    return;
                }
            }
        }
        // if loner in block, fire click
        for (let a = 0; a < 9; a++) {
            let possibilitiesCount = new Array(9);
            for (let c = 0; c < 9; c++) {
                possibilitiesCount[c] = 0;
            }
            // count
            for (let b = 0; b < 9; b++) {
                if (Board.blocks[a].cells[b].finalized) {
                    continue;
                }
                for (let c = 0; c < 9; c++) {
                    if (Board.blocks[a].cells[b].possibilities[c].active) {
                        possibilitiesCount[c]++;
                    }
                }
            }
            // find the lone possibility
            for (let c = 0; c < 9; c++) {
                if (possibilitiesCount[c] == 1) {
                    let poss = c;
                    // find the cell with that possibility
                    for (let b = 0; b < 9; b++) {
                        if (Board.blocks[a].cells[b].finalized) {
                            continue;
                        }
                        if (Board.blocks[a].cells[b].possibilities[c].active) {
                            console.log('loner in block: ' + Board.blocks[a].cells[b].possibilities[c].text);
                            document.body.dispatchEvent(Board.blocks[a].cells[b].possibilities[c].clicked);
                            return;
                        }
                    }
                }
            }
        }
        // if loner in line (9)
        for (let line = 0; line < 9; line++) {
            let possibilitiesCount = new Array(9);
            for (let c = 0; c < 9; c++) {
                possibilitiesCount[c] = 0;
            }
            for (let j = 0; j < 9; j++) {
                if (Board.cells[line][j].finalized) {
                    continue;
                }
                for (let c = 0; c < 9; c++) {
                    if (Board.cells[line][j].possibilities[c].active) {
                        possibilitiesCount[c]++;
                    }
                }
            }
            for (let c = 0; c < 9; c++) {
                if (possibilitiesCount[c] == 1) {
                    // find the cell with that possibility
                    for (let j = 0; j < 9; j++) {
                        if (Board.cells[line][j].finalized) {
                            continue;
                        }
                        if (Board.cells[line][j].possibilities[c].active) {
                            console.log('loner in line: ' + Board.cells[line][j].possibilities[c].text);
                            document.body.dispatchEvent(Board.cells[line][j].possibilities[c].clicked);
                            return;
                        }
                    }
                }
            }
        }
        // if loner in column
        for (let column = 0; column < 9; column++) {
            let possibilitiesCount = new Array(9);
            for (let c = 0; c < 9; c++) {
                possibilitiesCount[c] = 0;
            }
            for (let i = 0; i < 9; i++) {
                if (Board.cells[i][column].finalized) {
                    continue;
                }
                for (let c = 0; c < 9; c++) {
                    if (Board.cells[i][column].possibilities[c].active) {
                        possibilitiesCount[c]++;
                    }
                }
            }
            for (let c = 0; c < 9; c++) {
                if (possibilitiesCount[c] == 1) {
                    // find the cell with that possibility
                    for (let i = 0; i < 9; i++) {
                        if (Board.cells[i][column].finalized) {
                            continue;
                        }
                        if (Board.cells[i][column].possibilities[c].active) {
                            console.log('loner in column: ' + Board.cells[i][column].possibilities[c].text);
                            document.body.dispatchEvent(Board.cells[i][column].possibilities[c].clicked);
                            return;
                        }
                    }
                }
            }
        }
        // SEARCH FOR PAIRS
        // pairs in lines
        for (let line = 0; line < 9; line++) {
            // if there is only 2 or 3 elements in line and in the same block =>
            // every other element in this block can't contain these elements
            let pos = new Array(9);
            for (let c = 0; c < 9; c++) {
                pos[c] = {
                    'count': 0,
                    'positions': []
                };
            }
            for (let j = 0; j < 9; j++) {
                if (Board.cells[line][j].finalized) {
                    continue;
                }
                for (let c = 0; c < 9; c++) {
                    if (Board.cells[line][j].possibilities[c].active) {
                        pos[c].count++;
                        pos[c].positions.push(j);
                    }
                }
            }
            for (let c = 0; c < 9; c++) {
                if (pos[c].count == 2 || pos[c].count == 3) {
                    let sameBlock = true;
                    for (let n = 0; n < pos[c].count - 1; n++) {
                        sameBlock = sameBlock && (quot(pos[c].positions[n], 3) == quot(pos[c].positions[n + 1], 3));
                    }
                    if (sameBlock) {
                        // console.log('same');
                        // everywhere else in this block there cant be these elements
                        // Board.cells[i][j] = Board.blocks[quot(i, 3) * 3 + quot(j, 3)].cells[(i % 3) * 3 + j % 3];
                        let block = Board.cells[line][pos[c].positions[0]].i;
                        // console.log(block);
                        for (let i = quot(block, 3) * 3; i < quot(block, 3) * 3 + 3; i++) {
                            for (let j = (block % 3) * 3; j < (block % 3) * 3 + 3; j++) {
                                if (i == line && pos[c].positions.includes(j)) {
                                    continue;
                                }
                                if (Board.cells[i][j].possibilities[c].active) {
                                    console.log('crossed out: ' + Board.cells[i][j].possibilities[c].text);
                                    Possibility.crossOut(Board.cells[i][j].possibilities[c]);
                                }
                            }
                        }
                    }
                }
            }
        }
        // pairs in columns
        for (let column = 0; column < 9; column++) {
            // if there is only 2 or 3 elements in line and in the same block =>
            // every other element in this block can't contain these elements
            let pos = new Array(9);
            for (let c = 0; c < 9; c++) {
                pos[c] = {
                    'count': 0,
                    'positions': []
                };
            }
            for (let i = 0; i < 9; i++) {
                if (Board.cells[i][column].finalized) {
                    continue;
                }
                for (let c = 0; c < 9; c++) {
                    if (Board.cells[i][column].possibilities[c].active) {
                        pos[c].count++;
                        pos[c].positions.push(i);
                    }
                }
            }
            for (let c = 0; c < 9; c++) {
                if (pos[c].count == 2 || pos[c].count == 3) {
                    let sameBlock = true;
                    for (let n = 0; n < pos[c].count - 1; n++) {
                        sameBlock = sameBlock && (quot(pos[c].positions[n], 3) == quot(pos[c].positions[n + 1], 3));
                    }
                    if (sameBlock) {
                        // console.log('same');
                        // everywhere else in this block there cant be these elements
                        // Board.cells[i][j] = Board.blocks[quot(i, 3) * 3 + quot(j, 3)].cells[(i % 3) * 3 + j % 3];
                        let block = Board.cells[pos[c].positions[0]][column].i;
                        // console.log(block);
                        for (let i = quot(block, 3) * 3; i < quot(block, 3) * 3 + 3; i++) {
                            for (let j = (block % 3) * 3; j < (block % 3) * 3 + 3; j++) {
                                if (j == column && pos[c].positions.includes(i)) {
                                    continue;
                                }
                                if (Board.cells[i][j].possibilities[c].active) {
                                    console.log('crossed out: ' + Board.cells[i][j].possibilities[c].text);
                                    Possibility.crossOut(Board.cells[i][j].possibilities[c]);
                                }
                            }
                        }
                    }
                }
            }
        }
        // pairs in block and in line or column
        for (let block = 0; block < 9; block++) {
            // for each block
            let possibilities = [];
            for (let c = 0; c < 9; c++) {
                possibilities.push([]);
            }
            for (let i = quot(block, 3) * 3; i < quot(block, 3) * 3 + 3; i++) {
                for (let j = (block % 3) * 3; j < (block % 3) * 3 + 3; j++) {
                    if (Board.cells[i][j].finalized) {
                        continue;
                    }
                    for (let c = 0; c < 9; c++) {
                        if (Board.cells[i][j].possibilities[c].active) {
                            possibilities[c].push([Board.cells[i][j].possibilities[c], i, j]);
                        }
                    }
                }
            }
            // possibilities within the block
            for (let c = 0; c < 9; c++) {
                let num = possibilities[c].length;
                if (num > 1 && num < 4) {
                    // check if in the same line
                    let sameLine = true;
                    for (let n = 0; n < num - 1; n++) {
                        sameLine = sameLine && (possibilities[c][n][0].line() == possibilities[c][n + 1][0].line());
                    }
                    if (sameLine) {
                        // delete from the whole line omitting the block
                        let line = possibilities[c][0][0].line();
                        for (let j = 0; j < 9; j++) {
                            if (Board.cells[line][j].i == block) {
                                continue;
                            }
                            if (Board.cells[line][j].possibilities[c].active) {
                                console.log('binded line: ' + Board.cells[line][j].possibilities[c].textID);
                                Possibility.crossOut(Board.cells[line][j].possibilities[c]);
                            }
                        }
                    }
                    // check if same column
                    let sameColumn = true;
                    for (let n = 0; n < num - 1; n++) {
                        sameColumn = sameColumn && (possibilities[c][n][0].column() == possibilities[c][n + 1][0].column());
                    }
                    if (sameColumn) {
                        // console.log(possibilities[c]);
                        let column = possibilities[c][0][0].column();
                        for (let i = 0; i < 9; i++) {
                            if (Board.cells[i][column].i == block) {
                                continue;
                            }
                            if (Board.cells[i][column].possibilities[c].active) {
                                // console.log([i, column]);
                                console.log('binded column: ' + Board.cells[i][column].possibilities[c].textID);
                                Possibility.crossOut(Board.cells[i][column].possibilities[c]);
                            }
                        }
                    }
                    /**
                     * Check for the blockages
                     * Blockage is a condition:
                     * 1) when two(three) possibilities are constricted to the same positions
                     * within the block or line/column thus these positions can't hold other possibilities;
                     * 2) when two(three) positions within block or line/column hosts
                     * two(tree) possibilities and no other possibilities, thus other positions within
                     * same block or line/column can't contain these possibilities
                     */
                    // case 1) with two possibilities
                    switch (num) {
                        case 2:
                            let locations = possibilities[c];
                            // possibility is located within two positions within block
                            // check if there are other possibilities that are constricted ONLY to these positions
                            for (let n = 0; n < 9; n++) {
                                if (possibilities[n].length == possibilities[c].length && n != c) {
                                    let allWithin = true;
                                    // console.log('here');

                                    for (let poss of possibilities[n]) {
                                        let within = false;
                                        for (let loc of locations) {
                                            within = within || (poss[1] == loc[1] && poss[2] == loc[2]);
                                        }
                                        allWithin = allWithin && within;
                                    }
                                    if (allWithin) {
                                        // blockage
                                        // possibilities[n] and possibilities[c] are ONLY possible occupants
                                        // purge others
                                        // console.log('here2');
                                        for (let p = 0; p < 9; p++) {
                                            if (p == c || p == n) {
                                                continue;
                                            }
                                            for (let location of locations) {
                                                if (Board.cells[location[1]][location[2]].possibilities[p].active) {
                                                    // purge it
                                                    console.log('blockage cells purge: ' + Board.cells[location[1]][location[2]].possibilities[p].text);
                                                    Possibility.crossOut(Board.cells[location[1]][location[2]].possibilities[p]);
                                                }
                                            }
                                        }

                                    }
                                }
                            }
                            break;
                        case 3:
                            break;
                    }

                }
            }
        }
        // pairs in block and binded in pairs and triplets
    };
}

board = new Board();
let button = document.getElementById('button_cont').appendChild(document.createElement('button'));
// document.body.appendChild(document.createElement('button'));
button.innerText = 'step back';
button.addEventListener('click', (e) => {
    if (Board.userStepsArchive.length == 0) {
        return;
    }
    let tempArchive = Board.userStepsArchive;
    console.log(tempArchive);
    constructBoard();
    board = new Board();
    tempArchive.pop();
    Board.userStepsArchive = tempArchive;
    for (let step of Board.userStepsArchive) {
        // act the steps
        if (step[0] == 'clicked') {
            // left click
            document.body.dispatchEvent(Board.cells[step[1]][step[2]].possibilities[step[3]].clicked);
        }
        if (step[0] == 'crossed') {
            // right click
            // empty the possibility
            Possibility.crossOut(Board.cells[step[1]][step[2]].possibilities[step[3]]);
            Board.searchForLoners();
        }
    }
});