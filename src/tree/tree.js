import * as d3 from 'd3';

import './style.css';

export function tree(selection) {
  console.log('Test initialized');
  selection
    .append('div')
    .attr('class', 'tree')
    .text( d => d);
}
