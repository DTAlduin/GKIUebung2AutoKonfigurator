var optionsTable;
var jsondata = JSON.parse(readJSON("data.json"));
var checked = {};
var firstTime = true;
document.addEventListener("DOMContentLoaded", function () {
    optionsTable = document.getElementById("optionsTable");
    // optionsTable.addEventListener("click", deleteTask);
    renderOptions();
});
function renderOptions() {
    optionsTable.innerText = "";
    var btnid = "A";
    for (var _i = 0, _a = jsondata["meaning"]; _i < _a.length; _i++) {
        var option = _a[_i];
        if (option["meaning"] != "Valides Auto" && option["meaning"] != "Kein Auto") {
            var row_1 = document.createElement("tr");
            row_1.innerHTML = "<td>" + option["meaning"] + "</td>\n                        <td>\n                        <div class=\"btn-group-toggle\" data-toggle=\"buttons\">\n                          <label class=\"btn btn-secondary active\">\n                            <input id=" + btnid + " type=\"checkbox\" autocomplete=\"off\" onclick=check(this.id)>                          \n                          </label>\n                        </div> \n                        </td>";
            optionsTable.appendChild(row_1);
            if (firstTime) {
                console.log("Jetzt kommen die Buttons:");
                console.log(btnid);
                checked[btnid] = false;
            }
        }
        btnid = String.fromCharCode(btnid.charCodeAt(0) + 1);
    }
    var row = document.createElement("tr");
    row.innerHTML = "<td><b>Valides Auto</b></td>\n                        <td>\n                        <div class=\"btn-group-toggle\" data-toggle=\"buttons\">\n                          <label class=\"btn btn-secondary active\">\n                            <input id=\"w\" type=\"checkbox\" autocomplete=\"off\" disabled>                          \n                          </label>\n                        </div> \n                        </td>";
    optionsTable.appendChild(row);
    if (firstTime) {
        console.log("Jetzt kommt w:");
        console.log("w");
        checked["w"] = false;
    }
    firstTime = false;
}
function readJSON(file) {
    var request = new XMLHttpRequest();
    request.open('GET', file, false);
    request.send(null);
    if (request.status == 200)
        return request.responseText;
}
function toggleActive(id) {
    var b = document.getElementById(id);
    b.disabled = !b.disabled;
}
function enableActive(id) {
    var b = document.getElementById(id);
    b.disabled = false;
}
function disableActive(id) {
    var b = document.getElementById(id);
    b.disabled = true;
}
function toggleCheck(id) {
    var b = document.getElementById(id);
    b.checked = !b.checked;
}
function isDisabled(id) {
    var b = document.getElementById(id);
    return b.disabled;
}
function enableCheck(id) {
    var b = document.getElementById(id);
    b.checked = true;
}
function disableCheck(id) {
    var b = document.getElementById(id);
    b.checked = false;
}
function check(id) {
    checked[id] = !checked[id];
    testLogic(id);
}
function enableAll() {
    for (var option in checked) {
        if (option.toString() != 'w') {
            console.log("enableAll:");
            console.log(option);
            var b = document.getElementById(option.toString());
            b.disabled = false;
        }
    }
}
function testLogic(id) {
    var clauseToCheck = [];
    console.log("clauseToCheck: ");
    if (checked[id] == null) {
        checked[id] = false;
    }
    if (checked[id]) {
        for (var option in checked) {
            if (checked[option]) {
                for (var _i = 0, _a = jsondata["left"]; _i < _a.length; _i++) {
                    var optionLeftSide = _a[_i];
                    if (optionLeftSide["literal"] == option) {
                        clauseToCheck.push(optionLeftSide["clause"]);
                        console.log(optionLeftSide["clause"]);
                    }
                }
            }
        }
    }
    else {
        enableAll();
        for (var option in checked) {
            if (checked[option]) {
                for (var _b = 0, _c = jsondata["left"]; _b < _c.length; _b++) {
                    var optionLeftSide = _c[_b];
                    if (optionLeftSide["literal"] == option) {
                        clauseToCheck.push(optionLeftSide["clause"]);
                        console.log(optionLeftSide["clause"]);
                    }
                }
            }
        }
    }
    console.log("clauseToCheck Test: ");
    for (var i = 0; i < clauseToCheck.length; i++) {
        console.log(clauseToCheck[i]);
    }
    console.log("clauseToExecute: ");
    var clauseToExecute = [];
    var stopExecutingClause;
    var stopExecutingClause2;
    for (var clause = 0; clause < clauseToCheck.length; clause++) {
        // console.log("Mark1");
        console.log(clauseToCheck[clause]);
        stopExecutingClause = false;
        for (var _d = 0, _e = jsondata["left"]; _d < _e.length; _d++) {
            var optionLeftSide = _e[_d];
            if (optionLeftSide["clause"] == clauseToCheck[clause].toString()) {
                if (!checked[optionLeftSide["literal"]]) {
                    stopExecutingClause = true;
                }
            }
        }
        if (!stopExecutingClause) {
            stopExecutingClause2 = false;
            for (var _f = 0, _g = jsondata["right"]; _f < _g.length; _f++) {
                var optionRightSide = _g[_f];
                if (optionRightSide["clause"] == clauseToCheck[clause].toString()) {
                    if (checked[optionRightSide["literal"]]) {
                        stopExecutingClause2 = true;
                        console.log("stopExecutingClause2 = true");
                    }
                }
            }
            if (!stopExecutingClause2) {
                clauseToExecute.push(clauseToCheck[clause].toString());
                console.log("Added to clauseToCheck");
                console.log(clauseToCheck[clause]);
            }
        }
    }
    disableCheck('w');
    disableActive('w');
    checked['w'] = false;
    console.log("rightSide: ");
    for (var clause = 0; clause < clauseToExecute.length; clause++) {
        for (var _h = 0, _j = jsondata["right"]; _h < _j.length; _h++) {
            var optionRightSide = _j[_h];
            if (optionRightSide["clause"] == clauseToExecute[clause].toString()) {
                if (optionRightSide["literal"].charAt(0) == '-') {
                    if (!isDisabled(optionRightSide["literal"].charAt(1))) {
                        checked[optionRightSide["literal"].charAt(1)] = false;
                        disableActive(optionRightSide["literal"].charAt(1));
                        disableCheck(optionRightSide["literal"].charAt(1));
                        console.log(optionRightSide["literal"].charAt(1));
                        // testLogic(optionRightSide["literal"].charAt(1));
                    }
                }
                else {
                    if (!checked[optionRightSide["literal"]]) {
                        checked[optionRightSide["literal"]] = true;
                        enableActive(optionRightSide["literal"]);
                        enableCheck(optionRightSide["literal"]);
                        console.log(optionRightSide["literal"]);
                        // testLogic(optionRightSide["literal"]);
                    }
                }
            }
        }
    }
    checkForValidesAuto();
}
function checkForValidesAuto() {
    console.log("Beginning of checkForValidesAuto");
    var clauseToCheckForw = [];
    var activatew = false;
    var activatewHelper = true;
    for (var _i = 0, _a = jsondata["right"]; _i < _a.length; _i++) {
        var optionRightSide = _a[_i];
        if (optionRightSide["literal"] == 'w') {
            clauseToCheckForw.push(optionRightSide["clause"]);
        }
    }
    for (var clause = 0; clause < clauseToCheckForw.length; clause++) {
        activatewHelper = true;
        for (var _b = 0, _c = jsondata["left"]; _b < _c.length; _b++) {
            var optionLeftSide = _c[_b];
            if (optionLeftSide["clause"] == clauseToCheckForw[clause].toString()) {
                console.log("activatewHelper: ");
                if (!checked[optionLeftSide["literal"]]) {
                    activatewHelper = false;
                    console.log("activatewHelper = false");
                }
            }
        }
        if (activatewHelper) {
            console.log("activatewHelper = true");
            activatew = true;
        }
    }
    if (activatew) {
        console.log("activate w");
        enableActive('w');
        enableCheck('w');
    }
    else {
        console.log("disable w");
        disableActive('w');
        disableCheck('w');
    }
}
