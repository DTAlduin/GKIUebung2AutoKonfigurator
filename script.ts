/*
    Regeln:
    (A^B => C),
    (C^D=>-E),
    (E => w),
    (F => J),
    (G^J^C => K),
    (K => w),
    (A^H^I => w),
    (D => -I),
    (I => -D),
    (E => -G),
    (G => -E);
    (A: Allrad)
    (B: Schiebedach)
    (C: Anhängerkupplung)
    (D: 6-Gang Getriebe)
    (E: Cabrio)
    (F: Fahrassistenz)
    (G: Dachgepäckträger)
    (H: Ledersitze)
    (I: Automatik)
    (J: Rückfahrkamera)
    (K: Kombi)
    (w: Valides Auto)
 */

let optionsTable: HTMLElement;
let jsondata = JSON.parse(readJSON("data.json"));

let checked = {};

let firstTime = true;

document.addEventListener("DOMContentLoaded", () => {
    optionsTable = document.getElementById("optionsTable");
    renderOptions();
});

function renderOptions(): void {
    optionsTable.innerText = "";
    let btnid = "A";

    for (const option of jsondata["meaning"]) {
        if (option["meaning"] != "Valides Auto" && option["meaning"] != "Kein Auto") {
            const row: HTMLElement = document.createElement("tr");
            row.innerHTML = `<td>${option["meaning"]}</td>
                        <td>
                        <div class="btn-group-toggle" data-toggle="buttons">
                          <label class="btn btn-secondary active">
                            <input id=${btnid} type="checkbox" autocomplete="off" onclick=check(this.id)>                          
                          </label>
                        </div> 
                        </td>`;
            optionsTable.appendChild(row);
            if (firstTime) {
                checked[btnid] = false;
            }
        }
        btnid = String.fromCharCode(btnid.charCodeAt(0) + 1);
    }
    const row: HTMLElement = document.createElement("tr");
    row.innerHTML = `<td><b>Valides Auto</b></td>
                        <td>
                        <div class="btn-group-toggle" data-toggle="buttons">
                          <label class="btn btn-secondary active">
                            <input id="w" type="checkbox" autocomplete="off" disabled>                          
                          </label>
                        </div> 
                        </td>`;
    optionsTable.appendChild(row);
    if (firstTime) {
        checked["w"] = false;
    }
    firstTime = false;
}

function readJSON(file) {
    let request = new XMLHttpRequest();
    request.open('GET', file, false);
    request.send(null);
    if (request.status == 200)
        return request.responseText;
}

function enableActive(id: string) {
    let b = document.getElementById(id) as HTMLButtonElement;
    b.disabled = false;
}

function disableActive(id: string) {
    let b = document.getElementById(id) as HTMLButtonElement;
    b.disabled = true;
}

function isDisabled(id: string): boolean {
    let b = document.getElementById(id) as HTMLButtonElement;
    return b.disabled;
}

function enableCheck(id: string) {
    let b = document.getElementById(id) as HTMLInputElement;
    b.checked = true;
}

function disableCheck(id: string) {
    let b = document.getElementById(id) as HTMLInputElement;
    b.checked = false;
}

function check(id: string) {
    checked[id] = !checked[id];
    testLogic(id);
}

function enableAll() {
    for (let option in checked) {
        if (option.toString() != 'w') {
            let b = document.getElementById(option.toString()) as HTMLButtonElement;
            b.disabled = false;
        }
    }
}

function testLogic(id: string) {
    let clauseToCheck: string[] = [];
    if (checked[id] == null) {
        checked[id] = false;
    }
    if (checked[id]) {
        for (let option in checked) {
            if (checked[option]) {
                for (const optionLeftSide of jsondata["left"]) {
                    if (optionLeftSide["literal"] == option) {
                        clauseToCheck.push(optionLeftSide["clause"]);
                    }
                }
            }
        }
    } else {
        enableAll();
        for (let option in checked) {
            if (checked[option]) {
                for (const optionLeftSide of jsondata["left"]) {
                    if (optionLeftSide["literal"] == option) {
                        clauseToCheck.push(optionLeftSide["clause"]);
                    }
                }
            }
        }
    }

    let clauseToExecute: string[] = [];

    let stopExecutingClause: boolean;
    let stopExecutingClause2: boolean;

    for (let clause = 0; clause < clauseToCheck.length; clause++) {
        stopExecutingClause = false;
        for (const optionLeftSide of jsondata["left"]) {
            if (optionLeftSide["clause"] == clauseToCheck[clause].toString()) {
                if (!checked[optionLeftSide["literal"]]) {
                    stopExecutingClause = true;
                }
            }
        }
        if (!stopExecutingClause) {
            stopExecutingClause2 = false;
            for (const optionRightSide of jsondata["right"]) {
                if (optionRightSide["clause"] == clauseToCheck[clause].toString()) {
                    if (checked[optionRightSide["literal"]]) {
                        stopExecutingClause2 = true;
                    }
                }
            }
            if (!stopExecutingClause2) {
                clauseToExecute.push(clauseToCheck[clause].toString());
            }
        }
    }

    disableCheck('w');
    disableActive('w');
    checked['w'] = false;

    for (let clause = 0; clause < clauseToExecute.length; clause++) {
        for (const optionRightSide of jsondata["right"]) {
            if (optionRightSide["clause"] == clauseToExecute[clause].toString()) {
                if (optionRightSide["literal"].charAt(0) == '-') {
                    if (!isDisabled(optionRightSide["literal"].charAt(1))) {
                        checked[optionRightSide["literal"].charAt(1)] = false;
                        disableActive(optionRightSide["literal"].charAt(1));
                        disableCheck(optionRightSide["literal"].charAt(1));
                    }
                } else {
                    if (!checked[optionRightSide["literal"]]) {
                        checked[optionRightSide["literal"]] = true;
                        enableActive(optionRightSide["literal"]);
                        enableCheck(optionRightSide["literal"]);
                    }
                }
            }
        }
    }
    checkForValidesAuto();
}

function checkForValidesAuto() {
    let clauseToCheckForw: string[] = [];
    let activatew: boolean = false;
    let activatewHelper: boolean = true;
    for (const optionRightSide of jsondata["right"]) {
        if (optionRightSide["literal"] == 'w') {
            clauseToCheckForw.push(optionRightSide["clause"]);
        }
    }
    for (let clause = 0; clause < clauseToCheckForw.length; clause++) {
        activatewHelper = true;
        for (const optionLeftSide of jsondata["left"]) {
            if (optionLeftSide["clause"] == clauseToCheckForw[clause].toString()) {
                if (!checked[optionLeftSide["literal"]]) {
                    activatewHelper = false;
                }
            }
        }
        if (activatewHelper) {
            activatew = true;
        }
    }

    if (activatew) {
        enableActive('w');
        enableCheck('w');
    } else {
        disableActive('w');
        disableCheck('w');
    }
}

