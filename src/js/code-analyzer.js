import * as esprima from 'esprima';

const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse, {loc:true});
};

export {parseCode};
export {program};
export {displayTable};
export {arr};

let arr = [];
let alreadyDisplayed = false;

function addToTable(line, type, name, cond, val){
    arr = arr.concat({'Line' : line.toString(), 'Type' : type, 'Name' : name, 'Condition' : cond, 'Value' : val});
}
function displayTable(){
    alreadyDisplayed ? document.getElementById('dataOfProgram').remove() : alreadyDisplayed = true;
    let body = document.getElementsByTagName('body')[0], table = document.createElement('table');
    table.setAttribute('class', 'dataOfProgram');
    table.setAttribute('id', 'dataOfProgram');
    let tableBody = document.createElement('table_body');
    tableBody.setAttribute('class', 'dataOfProgram');
    tableBody.appendChild(addTitles());
    for(let i = 0; i < arr.length; ++i)
        tableBody.appendChild(addTuple(arr[i]));
    table.appendChild(tableBody);
    body.appendChild(table);
    window.alert(JSON.stringify(arr));
}

function addTuple(tuple){
    let tupleArr = [tuple.Line, tuple.Type, tuple.Name, tuple.Condition, tuple.Value];
    let tr = document.createElement('tr');
    for(let i = 0; i < 5; ++i){
        let td = document.createElement('td')
        td.appendChild(document.createTextNode(tupleArr[i]));
        tr.appendChild(td);
    }
    return tr;
}

function addTitles(){
    let titleArr = ['Line', 'Type', 'Name', 'Condition', 'Value'];
    let tr = document.createElement('tr');
    for(let i = 0; i < 5; ++i){
        let th = document.createElement('th');
        th.appendChild(document.createTextNode(titleArr[i]));
        tr.appendChild(th);
    }
    return tr;
}

function objMap (nextObj) {
    let handlers = {'VariableDeclaration' : varDec, 'FunctionDeclaration' : funcDec,
        'ExpressionStatement': expressionStatement, 'ReturnStatement' : returnStatement, 'IfStatement' : ifStatement,
        'WhileStatement' : whileStatement, 'ForStatement' : forStatement, 'BlockStatement' : blockStatement,
        'SequenceExpression' : sequenceExpression, 'AssignmentExpression' : assignmentExpression};
    if(handlers[nextObj.type] === undefined)
        return;
    else
        handlers[nextObj.type](nextObj);
}

function program(obj) {
    arr = [];
    for(let i = 0; i < obj.body.length; ++i)
        objMap(obj.body[i]);
}


function varDec(obj){
    let line, name, val, type = 'Variable Declaration';
    for(let i = 0; i < obj.declarations.length; ++i){
        let nextObj = obj.declarations[i];
        line = getLine(nextObj.id);
        name = nextObj.id.name;
        val = nextObj.init === null ? null : getVal(nextObj.init);
        addToTable(line, type, name, '', val);
    }
}

function funcDec(obj) {
    let type = 'Function Declaration', line = getLine(obj), name = obj.id.name;
    addToTable(line, type, name, '', '');
    for(let i = 0; i < obj.params.length; ++i){
        let pName = obj.params[i].name;
        let pType = 'Variable Declaration';
        addToTable(line, pType, pName, '', '');
    }
    objMap(obj.body);
}

function returnStatement(obj){
    let line, val, type = 'Return Statement';
    line = getLine(obj);
    val = getVal(obj.argument);
    addToTable(line, type, '', '', val);
}

function expressionStatement(obj){
    objMap(obj.expression);
}

function sequenceExpression(obj){
    for(let i = 0; i < obj.expressions.length; ++i)
        objMap(obj.expressions[i]);
}

function assignmentExpression (obj) {
    let val, line, name, type = 'Assignment Expression';
    name = obj.left.name;
    line = getLine(obj);
    val = getVal(obj.right);
    addToTable(line, type, name, '', val);
}

function literal(exp){
    return exp.value;
}

function identifier(exp){
    return exp.name;
}

function unaryExpression(exp){
    let op = exp.operator, value = getVal(exp.argument);
    return op.concat(value);
}

function binaryExpression(exp){
    let op = exp.operator, valLeft = getVal(exp.left), valRight = getVal(exp.right);
    if(exp.left.type === 'BinaryExpression')
        valLeft = '('.concat(valLeft).concat(')');
    if(exp.right.type === 'BinaryExpression')
        valRight = '('.concat(valRight).concat(')');
    return ((valLeft.toString()).concat(op)).concat(valRight.toString());
}

function callExpression(exp){
    let func = exp.callee.name.concat('(');
    for(let i = 0; i < exp.arguments.length; ++i){
        func = func.concat(getVal(exp.arguments[i]).toString());
        if (i+1 < exp.arguments.length)
            func.concat(', ');
    }
    return func.concat(')');
}

function memberExpression(obj){
    let object, property;
    object = getVal(obj.object);
    property = getVal(obj.property);
    return object.toString().concat('[').concat(property.toString()).concat(']');
}

function ifStatement(obj){
    let line, cond, type = 'If Statement', alternate = obj.alternate;
    line = getLine(obj);
    cond = getVal(obj.test);
    addToTable(line, type, '', cond, '');
    objMap(obj.consequent);
    if(alternate !== null)
        alternate.type === 'IfStatement' ? elseIfStatement(alternate) : elseStatement(alternate);
}

function elseIfStatement(obj) {
    let line, cond, type = 'Else If Statement', alternate = obj.alternate;
    line = getLine(obj);
    cond = getVal(obj.test);
    addToTable(line, type, '', cond, '');
    objMap(obj.consequent);
    if(alternate !== null)
        alternate.type === 'IfStatement' ? elseIfStatement(alternate) : elseStatement(alternate);
}

function blockStatement(obj){
    for(let i = 0; i < obj.body.length; ++i)
        objMap(obj.body[i]);
}

function elseStatement (obj){
    let line, type = 'Else Statement';
    line = getLine(obj);
    addToTable(line, type, '', '', '');
    objMap(obj);
}

function whileStatement(obj){
    let line, cond, type = 'While Statement';
    line = getLine(obj);
    cond = getVal(obj.test);
    addToTable(line, type, '', cond, '');
    objMap(obj.body);
}

function forStatement(obj){
    let line, cond, type = 'for Statement';
    objMap(obj.init);
    cond = getVal(obj.test);
    objMap(obj.update);
    line = getLine(obj);
    addToTable(line, type, '', cond, '');
    objMap(obj.body);
}

function logicalExpression(test){
    return binaryExpression(test);
}

function getVal(obj){
    let handlers = { 'Literal' : literal, 'Identifier' : identifier, 'UnaryExpression' : unaryExpression,
        'BinaryExpression' : binaryExpression, 'CallExpression' : callExpression,
        'LogicalExpression' : logicalExpression, 'MemberExpression' : memberExpression};
    return handlers[obj.type](obj);
}

function getLine(obj) {
    return obj.loc.start.line;
}
