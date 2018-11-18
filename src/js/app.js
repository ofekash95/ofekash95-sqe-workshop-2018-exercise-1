import $ from 'jquery';
import {parseCode} from './code-analyzer';
import {program} from './code-analyzer';


$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let parsedCode = parseCode(codeToParse);
        program(parsedCode);
        $('#parsedCode').val(JSON.stringify(parsedCode, null, 2));
    });
});

