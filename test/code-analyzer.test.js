import assert from 'assert';
import {parseCode, program, arr} from '../src/js/code-analyzer';

describe('The javascript parser',() => {
    it('empty', () => {
        program(parseCode(''));
        assert(JSON.stringify(arr) === '[]');
    });
    it('VariableDeclaration with value', () => {
        program(parseCode('let x = 5;'));
        assert(JSON.stringify(arr) === '[{"Line":"1","Type":"Variable Declaration","Name":"x","Condition":"","Value":5}]');
    });
    it('VariableDeclaration with null', () => {
        program(parseCode('let x;'));
        assert(JSON.stringify(arr) === '[{"Line":"1","Type":"Variable Declaration","Name":"x","Condition":"","Value":null}]');
    });
    it('func + params + return + binaryExp', () => {
        program(parseCode('function myFunc(x, y){ return x+y;}'));
        assert(JSON.stringify(arr) === '[{"Line":"1","Type":"Function Declaration","Name":"myFunc","Condition":"","Value":""},' +
            '{"Line":"1","Type":"Variable Declaration","Name":"x","Condition":"","Value":""},' +
            '{"Line":"1","Type":"Variable Declaration","Name":"y","Condition":"","Value":""},' +
            '{"Line":"1","Type":"Return Statement","Name":"","Condition":"","Value":"(x+y)"}]');
    });
    it('expressionStatement + sequenceExpression + assignmentExpression + unary + literal', () => {
        program(parseCode('x = -7, y = 8;'));
        assert(JSON.stringify(arr) === '[{"Line":"1","Type":"Assignment Expression","Name":"x","Condition":"","Value":"-7"},' +
            '{"Line":"1","Type":"Assignment Expression","Name":"y","Condition":"","Value":8}]');
    });
    it('function + params + return + callExp', () => {
        program(parseCode('function foo(x) {return x;}\n' + 'let z = foo(6);'));
        assert(JSON.stringify(arr) === '[{"Line":"1","Type":"Function Declaration","Name":"foo","Condition":"","Value":""},' +
            '{"Line":"1","Type":"Variable Declaration","Name":"x","Condition":"","Value":""},' +
            '{"Line":"1","Type":"Return Statement","Name":"","Condition":"","Value":"x"},' +
            '{"Line":"2","Type":"Variable Declaration","Name":"z","Condition":"","Value":"foo(6)"}]');
    });
    it('memberExp + id', () => {
        program(parseCode('x = v[n];'));
        assert(JSON.stringify(arr) === '[{"Line":"1","Type":"Assignment Expression","Name":"x","Condition":"","Value":"v[n]"}]');
    });
    it('if', () => {
        program(parseCode('let x = 0;\n' + 'if(x < 0){\n' + 'x = x + 1;\n' + '}\n' + 'else if(x < 0){\n' +
            'x = x + 1;\n' + '}\n' + 'else if(x < 0){\n' + 'x = x + 1;\n' + '}\n' + 'else{\n' + 'x = 7;\n' +
            '} \n' + 'if(x < 0){\n' + 'x = x + 1;\n' + '}\n' + 'else{\n' + 'x = 7;\n' + '} '));
        assert(JSON.stringify(arr) === '[{"Line":"1","Type":"Variable Declaration","Name":"x","Condition":"","Value":0},' +
            '{"Line":"2","Type":"If Statement","Name":"","Condition":"(x<0)","Value":""},' +
            '{"Line":"3","Type":"Assignment Expression","Name":"x","Condition":"","Value":"(x+1)"},' +
            '{"Line":"5","Type":"Else If Statement","Name":"","Condition":"(x<0)","Value":""},' +
            '{"Line":"6","Type":"Assignment Expression","Name":"x","Condition":"","Value":"(x+1)"},' +
            '{"Line":"8","Type":"Else If Statement","Name":"","Condition":"(x<0)","Value":""},' +
            '{"Line":"9","Type":"Assignment Expression","Name":"x","Condition":"","Value":"(x+1)"},' +
            '{"Line":"11","Type":"Else Statement","Name":"","Condition":"","Value":""},' +
            '{"Line":"12","Type":"Assignment Expression","Name":"x","Condition":"","Value":7},' +
            '{"Line":"14","Type":"If Statement","Name":"","Condition":"(x<0)","Value":""},' +
            '{"Line":"15","Type":"Assignment Expression","Name":"x","Condition":"","Value":"(x+1)"},' +
            '{"Line":"17","Type":"Else Statement","Name":"","Condition":"","Value":""},' +
            '{"Line":"18","Type":"Assignment Expression","Name":"x","Condition":"","Value":7}]');
    });
    it('while + logical', () => {
        program(parseCode('let x = true;\n' + 'let y = !x;\n' + 'while(x || y){\n' + 'x = false;\n' + '}'));
        assert(JSON.stringify(arr) === '[{"Line":"1","Type":"Variable Declaration","Name":"x","Condition":"","Value":true},' +
            '{"Line":"2","Type":"Variable Declaration","Name":"y","Condition":"","Value":"!x"},' +
            '{"Line":"3","Type":"While Statement","Name":"","Condition":"(x||y)","Value":""},' +
            '{"Line":"4","Type":"Assignment Expression","Name":"x","Condition":"","Value":false}]');
    });
    it('for', () => {
        program(parseCode('for(let i = 0; i < 5; i++){\n' + 'x = 7;\n' + '}'));
        assert(JSON.stringify(arr) === '[{"Line":"1","Type":"for Statement","Name":"","Condition":"(i<5)","Value":""},' +
            '{"Line":"1","Type":"Variable Declaration","Name":"i","Condition":"","Value":0},' +
            '{"Line":"1","Type":"Update Expression","Name":"","Condition":"","Value":"i++"},' +
            '{"Line":"2","Type":"Assignment Expression","Name":"x","Condition":"","Value":7}]');
    });
    it('only literal + f(5,6)', () => {
        program(parseCode('let x = f(5, 6);\n' +
            '5;'));
        assert(JSON.stringify(arr) === '[{"Line":"1","Type":"Variable Declaration","Name":"x","Condition":"","Value":"f(56)"}]');
    });
    it('more if without nothing after', () => {
        program(parseCode('if(0 < 5){\n' + 'let x = 7;\n' + '}\n' + '\n' + 'if(0 < 5){\n' + 'let x = 7;\n' + '}\n' +
            'else if(0 < 5){\n' + 'let x = 7;\n' + '}\n'));
        assert(JSON.stringify(arr) === '[{"Line":"1","Type":"If Statement","Name":"","Condition":"(0<5)","Value":""},' +
            '{"Line":"2","Type":"Variable Declaration","Name":"x","Condition":"","Value":7},' +
            '{"Line":"5","Type":"If Statement","Name":"","Condition":"(0<5)","Value":""},' +
            '{"Line":"6","Type":"Variable Declaration","Name":"x","Condition":"","Value":7},' +
            '{"Line":"8","Type":"Else If Statement","Name":"","Condition":"(0<5)","Value":""},' +
            '{"Line":"9","Type":"Variable Declaration","Name":"x","Condition":"","Value":7}]');
    });
    it('update', () => {
        program(parseCode('let x = x++;\n' + 'x++;\n' + 'let x = --x;\n' + '++x;'));
        assert(JSON.stringify(arr) === '[{"Line":"1","Type":"Variable Declaration","Name":"x","Condition":"","Value":"x++"},' +
            '{"Line":"2","Type":"Update Expression","Name":"","Condition":"","Value":"x++"},' +
            '{"Line":"3","Type":"Variable Declaration","Name":"x","Condition":"","Value":"--x"},' +
            '{"Line":"4","Type":"Update Expression","Name":"","Condition":"","Value":"++x"}]');
    });
    it('arr.length', () => {
        program(parseCode('let z = arr.length'));
        assert(JSON.stringify(arr) === '[{"Line":"1","Type":"Variable Declaration","Name":"z","Condition":"","Value":"arr.length"}]');
    });
});
