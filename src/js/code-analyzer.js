import * as esprima from 'esprima';

const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse, {loc:true});
};

export {parseCode, program, arr};

let arr = [];

function addToTable(line, type, name, cond, val){
    arr = arr.concat({'Line' : line.toString(), 'Type' : type, 'Name' : name, 'Condition' : cond, 'Value' : val});
}

function program(obj) {
    arr = [];
    for(let i = 0; i < obj.body.length; ++i)
        objMap(obj.body[i]);
}

function objMap (nextObj) {
    let handlers = {'VariableDeclaration' : varDec, 'FunctionDeclaration' : funcDec,
        'ExpressionStatement': expressionStatement, 'ReturnStatement' : returnStatement, 'IfStatement' : ifStatement,
        'WhileStatement' : whileStatement, 'ForStatement' : forStatement, 'BlockStatement' : blockStatement,
        'SequenceExpression' : sequenceExpression, 'AssignmentExpression' : assignmentExpression,
        'UpdateExpression' : updateExpression};
    if(!(handlers[nextObj.type] === undefined))
        handlers[nextObj.type](nextObj);
}

function varDec(obj){
    for(let i = 0; i < obj.declarations.length; ++i){
        let nextObj = obj.declarations[i], val = nextObj.init === null ? null : getVal(nextObj.init);
        addToTable(getLine(nextObj.id), 'Variable Declaration', nextObj.id.name, '', val);
    }
}

function funcDec(obj) {
    addToTable(getLine(obj), 'Function Declaration', obj.id.name, '', '');
    for(let i = 0; i < obj.params.length; ++i)
        addToTable(getLine(obj), 'Variable Declaration', obj.params[i].name, '', '');
    objMap(obj.body);
}

function returnStatement(obj){
    addToTable(getLine(obj), 'Return Statement', '', '', getVal(obj.argument));
}

function expressionStatement(obj){
    objMap(obj.expression);
}

function updateExpression(obj){
    let op = obj.operator, val = getVal(obj.argument);
    val = obj.prefix ? op.concat(val.toString()) : val.toString().concat(op);
    addToTable(getLine(obj), 'Update Expression', '', '', val);
}

function sequenceExpression(obj){
    for(let i = 0; i < obj.expressions.length; ++i)
        objMap(obj.expressions[i]);
}

function assignmentExpression (obj) {
    addToTable(getLine(obj), 'Assignment Expression', obj.left.name, '', getVal(obj.right));
}

function blockStatement(obj){
    for(let i = 0; i < obj.body.length; ++i)
        objMap(obj.body[i]);
}

function ifStatement(obj){
    let alternate = obj.alternate;
    addToTable(getLine(obj), 'If Statement', '', getVal(obj.test), '');
    objMap(obj.consequent);
    if(alternate !== null)
        alternate.type === 'IfStatement' ? elseIfStatement(alternate) : elseStatement(alternate);
}

function elseIfStatement(obj) {
    let alternate = obj.alternate;
    addToTable(getLine(obj), 'Else If Statement', '', getVal(obj.test), '');
    objMap(obj.consequent);
    if(alternate !== null)
        alternate.type === 'IfStatement' ? elseIfStatement(alternate) : elseStatement(alternate);
}

function elseStatement (obj){
    addToTable(getLine(obj), 'Else Statement', '', '', '');
    objMap(obj);
}

function whileStatement(obj){
    addToTable(getLine(obj), 'While Statement', '', getVal(obj.test), '');
    objMap(obj.body);
}

function forStatement(obj){
    addToTable(getLine(obj), 'for Statement', '', getVal(obj.test), '');
    objectsMap([obj.init, obj.update, obj.body], 0);
}

function objectsMap(objects, ind){
    objMap(objects[ind++]);
    if(ind < objects.length)
        objectsMap(objects, ind);
}

function getVal(obj){
    let handlers = { 'Literal' : literal, 'Identifier' : identifier, 'UnaryExpression' : unaryExpression,
        'BinaryExpression' : binaryExpression, 'CallExpression' : callExpression,
        'LogicalExpression' : logicalExpression, 'MemberExpression' : memberExpression,
        'UpdateExpression' : updateExpressionForVal};
    return handlers[obj.type](obj);
}

function literal(exp){
    return exp.value;
}

function identifier(exp){
    return exp.name;
}

function unaryExpression(exp){
    return exp.operator.concat(getVal(exp.argument).toString());
}

function binaryExpression(exp){
    let op = exp.operator, valLeft = getVal(exp.left), valRight = getVal(exp.right);
    return '('.concat(valLeft.toString()).concat(op).concat(valRight.toString()).concat(')');
}

function callExpression(exp){
    let func = exp.callee.name.concat('('), length =  exp.arguments.length;
    for(let i = 0; i < length; ++i){
        func = func.concat(getVal(exp.arguments[i]).toString());
        if (!isLastElement(i, length))
            func.concat(', ');
    }
    return func.concat(')');
}

function isLastElement(ind, length){
    return ind+1 >= length;
}

function logicalExpression(test){
    return binaryExpression(test);
}

function memberExpression(obj){
    let object = getVal(obj.object), property = getVal(obj.property);
    return obj.computed ? object.toString().concat('[').concat(property.toString()).concat(']') :
        object.toString().concat('.').concat(property.toString());
}

function updateExpressionForVal(obj){
    let op = obj.operator, val = getVal(obj.argument);
    return obj.prefix ? op.concat(val.toString()) : val.toString().concat(op);
}

function getLine(obj) {
    return obj.loc.start.line;
}
