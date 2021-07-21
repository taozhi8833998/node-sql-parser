const fs = require('fs');
const path = require('path');
const peg = require('pegjs');

const syntax = fs.readFileSync(path.resolve(__dirname, './pegjs/postgresql.pegjs'), 'utf-8')
const ast = peg.parser.parse(syntax);


const built = [];
function checkCode(r, onName) {
    const simple = /^[\s$]*\/\/\s*=>\s*([^$\r\n]+)$/m.exec(r.code);
    if (simple) return simple[1].trim();
    const complex = /^[\s$]*\/\*([^§]+)\*\//m.exec(r.code);
    if (!complex) throw new Error('You must provide a type for code block: ' + onName);
    const typecode = complex[1];
    const at = typecode.lastIndexOf('=>');
    if (at < 0) throw new Error('Wrong type code format for code block: ' + onName);
    const toInsert = typecode.substr(0, at);
    built.push(toInsert.trim());
    return typecode.substr(at + 2).trim();
}
function buildExpression(r, onName) {
    if (r.code) return checkCode(r, onName)
    switch (r.type) {
        case 'choice':
            const ret = r.alternatives
                .map(e => buildExpression(e, onName))
                .map(e => e && e.trim())

            return ret.some(x => !x)
                ? null
                : [...new Set(ret.filter(e => e !== 'IGNORE'))].join(' | ').trim();
        case 'rule_ref':
            return r.name;
        case 'literal':
            return JSON.stringify(r.value);
        case 'labeled': // mmmh.. weird. Remove ? See extract_filed
            return buildExpression(r.expression, onName);
        case 'zero_or_more':
        case 'one_or_more':
            const of = buildExpression(r.expression, onName);
            return of && `(${of.trim()})[]`;
        case 'simple_not':
        case 'class':
        case 'any':
        case 'sequence':
            return null;
        default:
            throw new Error('Unsupported node type: ' + r.type);
    }
}
let parsed = 0;
const strings = new Set([
    'single_quote_char',
    'single_char',
    'escape_char',
    'line_terminator',
    'int', // yea...
    'frac',
    'digits',
    'digit',
    'hexDigit',
    'e',
    'exp',
    'ident'
])

for (const r of ast.rules) {
    if (r.name === 'number') {
        continue;
    }
    let value;
    switch (r.name) {
        case 'data_type':
            value = `{
                    dataType: string;
                    length?: number;
                    suffix?: string;
                    scale?: number;
                    parentheses?: boolean;
                    expr?: expr_list;
                }`;
            break;
        default:
            value = strings.has(r.name) ? 'string'
                : r.name.indexOf('KW_') === 0 ? null
                    : buildExpression(r.expression, r.name);
            break;
    }

    if (value) {
        built.push(`export type ${r.name} = ${value.trim()};`);
    } else {
        built.push(`type ${r.name} = never;`);
        // console.log('Ignoring ' + r.name);
    }
    parsed++;
}
if (!fs.existsSync(path.resolve(__dirname, './ast'))) {
    fs.mkdirSync(path.resolve(__dirname, './ast'));
}
fs.writeFileSync(path.resolve(__dirname, './ast/postgresql.ts'), `
/*
⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔
⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔ THIS FILE HAS BEEN AUTO-GENERATED DO NOT EDIT IT ! ⛔⛔⛔⛔⛔⛔⛔⛔
⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔
*/

`
 + built.join('\n\n'));

console.log(`Parsed ${parsed}/${ast.rules.length} rules !`);
