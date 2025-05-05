// jsSyntaxTree - A syntax tree graph generator
// (c)2019 Andre Eisenbach <andre@ironcreek.net>

'use strict';

const VERSION = 'v1.2';

import Tree from './tree.js';
import rotateTip from './tip.js';

import * as Parser from './parser.js';
import * as Tokenizer from './tokenizer.js';

const tree = new Tree();


function e(id) {
  return document.getElementById(id);
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('syntaxtree_worker.js').then(
      (registration) => { console.info('Service worker registered.'); },
      (error) => { console.warn('Unable to register service worker.'); }
    );
  } else {
    console.info('Service workers not supported.');
  }
}

function registerCallbacks() {
  e('code').oninput = update;

  e('font').onchange = () => {
    tree.setFont(e('font').value);
    update();
  };

  e('fontsize').onchange = () => {
    tree.setFontsize(e('fontsize').value);
    update();
  };

  e('triangles').onchange = () => {
    tree.setTriangles(e('triangles').checked);
    update();
  };

  e('nodecolor').onchange = () => {
    tree.setColor(e('nodecolor').checked);
    update();
  };

  e('autosub').onchange = () => {
    tree.setSubscript(e('autosub').checked);
    update();
  };

  e('align').onchange = () => {
    tree.setAlignment(parseInt(e('align').value, 10));
    update();
  };

  e('spacing').oninput = () => {
    tree.setSpacing(parseFloat(e('spacing').value / 100));
    update();
  };

  e('canvas').onclick = () => tree.download();
}

function update() {
  const phrase = e('code').value;
  e('parse-error').innerHTML = '';

  try {
    const tokens = Tokenizer.tokenize(phrase);
    validateTokens(tokens);

    const syntax_tree = Parser.parse(tokens);
    tree.draw(syntax_tree);
  } catch (err) {
    e('parse-error').innerHTML = err;
  }
}

export function fetchTreeHtml(codeString){

  try {
    const tokens = Tokenizer.tokenize(codeString);
    validateTokens(tokens);

    const syntax_tree = Parser.parse(tokens);
    tree.draw(syntax_tree);

    const html = e('tree').innerHTML;

    return html;
  } catch (err) {
    return "Parsing Error"
  }
}



function validateTokens(tokens) {
  if (tokens.length < 3) throw 'Phrase too short';
  if (tokens[0].type != Tokenizer.TokenType.BRACKET_OPEN ||
      tokens[tokens.length - 1].type != Tokenizer.TokenType.BRACKET_CLOSE)
    throw 'Phrase must start with [ and end with ]';
  const brackets = countOpenBrackets(tokens);
  if (brackets > 0) throw brackets + ' bracket(s) open [';
  if (brackets < 0) throw Math.abs(brackets) + ' too many closed bracket(s) ]';
  return null;
}

function countOpenBrackets(tokens) {
  let o = 0;
  for (const token of tokens) {
    if (token.type == Tokenizer.TokenType.BRACKET_OPEN) ++o;
    if (token.type == Tokenizer.TokenType.BRACKET_CLOSE) --o;
  }
  return o;
}
