import * as d3 from 'd3';

import './style.css';

export function loader(node, options) {

  return node;
  //return (node.type == 'textarea') ?
  //    CodeMirror.fromTextArea(node, options) : CodeMirror(node, options);
}



export function setValue(val) {
    //option = val;
    console.log('Data loaded!');
    //console.log(option);
    //return option;
}
