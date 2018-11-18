import * as esprima from 'esprima';

const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse, {loc:true});
};

export {parseCode};
export {program};
export {arr};

let arr = [];

function addToTable(line, type, name, cond, val){
    arr = arr.concat({'Line' : line.toString(), 'Type' : type, 'Name' : name, 'Condition' : cond, 'Value' : val});
}

function objMap (nextObj) {
    let handlers = {'VariableDeclaration' : varDec, 'FunctionDeclaration' : funcDec,
        'ExpressionStatement': expressionStatement, 'ReturnStatement' : returnStatement, 'IfStatement' : ifStatement,
        'WhileStatement' : whileStatement, 'ForStatement' : forStatement, 'BlockStatement' : blockStatement,
        'SequenceExpression' : sequenceExpression, 'AssignmentExpression' : assignmentExpression,
        'UpdateExpression' : updateExpression};
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

function updateExpression(obj){
    let line = getLine(obj), op = obj.operator, val = getVal(obj.argument), prefix = obj.prefix,
        type = 'UpdateExpression';
    val = prefix ? op.concat(val.toString()) : val.toString().concat(op);
    addToTable(line, type, '', '', val);
}

function updateExpressionForVal(obj){
    let op = obj.operator, val = getVal(obj.argument), prefix = obj.prefix;
    return prefix ? op.concat(val.toString()) : val.toString().concat(op);
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
    return '('.concat(valLeft.toString()).concat(op).concat(valRight.toString()).concat(')');
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
    let object = getVal(obj.object), property = getVal(obj.property), computed = obj.computed;
    return computed ? object.toString().concat('[').concat(property.toString()).concat(']') :
        object.toString().concat('.').concat(property.toString());
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

function logicalExpression(exp){
    let op = exp.operator, valLeft = getVal(exp.left), valRight = getVal(exp.right);
    return valLeft.toString().concat(op).concat(valRight.toString());
}

function getVal(obj){
    let handlers = { 'Literal' : literal, 'Identifier' : identifier, 'UnaryExpression' : unaryExpression,
        'BinaryExpression' : binaryExpression, 'CallExpression' : callExpression,
        'LogicalExpression' : logicalExpression, 'MemberExpression' : memberExpression,
        'UpdateExpression' : updateExpressionForVal};
    return handlers[obj.type](obj);
}

function getLine(obj) {
    return obj.loc.start.line;
}
