import $ from 'jquery';
import {parseCode, program, arr} from './code-analyzer';


$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let parsedCode = parseCode(codeToParse);
        program(parsedCode);
        displayTable();
        $('#parsedCode').val(JSON.stringify(parsedCode, null, 2));
    });
});

let alreadyDisplayed = false;

function displayTable(){
    alreadyDisplayed ? document.getElementById('dataOfProgram').remove() : alreadyDisplayed = true;
    let body = document.getElementsByTagName('body')[0], table = document.createElement('table'),
        tableBody = document.createElement('table_body');
    table.setAttribute('class', 'dataOfProgram');
    table.setAttribute('id', 'dataOfProgram');
    tableBody.setAttribute('class', 'dataOfProgram');
    tableBody.appendChild(addTitles());
    for(let i = 0; i < arr.length; ++i)
        tableBody.appendChild(addTuple(arr[i]));
    table.appendChild(tableBody);
    body.appendChild(table);
}

function addTuple(tuple){
    let tupleArr = [tuple.Line, tuple.Type, tuple.Name, tuple.Condition, tuple.Value],
        tr = document.createElement('tr');
    for(let i = 0; i < tupleArr.length; ++i){
        let td = document.createElement('td')
        td.appendChild(document.createTextNode(tupleArr[i]));
        tr.appendChild(td);
    }
    return tr;
}

function addTitles(){
    let titleArr = ['Line', 'Type', 'Name', 'Condition', 'Value'], tr = document.createElement('tr');
    for(let i = 0; i < titleArr.length; ++i){
        let th = document.createElement('th');
        th.appendChild(document.createTextNode(titleArr[i]));
        tr.appendChild(th);
    }
    return tr;
}


