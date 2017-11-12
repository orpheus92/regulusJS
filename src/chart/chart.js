import * as d3 from 'd3';

import './style.css';

export function chart(selection) {
  selection
    .append('div')
    .attr('class', 'chart')
    .text( d => d);
}
