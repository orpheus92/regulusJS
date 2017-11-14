import * as d3 from 'd3';

import './style.css';

/*
import 'codemirror/lib/codemirror.css';
import * as CodeMirror from 'codemirror';

import 'codemirror/mode/clike/clike';

import 'codemirror/addon/fold/foldgutter.css';
import 'codemirror/addon/fold/foldcode';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/fold/brace-fold';
import 'codemirror/addon/fold/comment-fold';

//import 'codemirror/addon/edit/matchBrackets';
import 'codemirror/addon/hint/show-hint.css';
import 'codemirror/addon/hint/show-hint';
*/
/*
let defaults = {
  mode: "text/x-c++src",
  matchBrackets: true,
  lineNumbers: true,
  foldGutter: true,
  gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
  extraKeys: {
    'Cmd-/': 'toggleComment',
    'Ctrl-/': 'toggleComment',
    'Ctrl-Q': function(cm){ cm.foldCode(cm.getCursor()); }
  }
}
*/
export function loader(node, options) {

  return node;
  //return (node.type == 'textarea') ?
  //    CodeMirror.fromTextArea(node, options) : CodeMirror(node, options);
}



export function setValue(val,option) {
    option = val;
    console.log('Data loaded!');
    //console.log(option);
    return option;
}
