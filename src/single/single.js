import './style.css';

import * as d3 from 'd3';
//import {chart} from '../chart';
import {tree} from '../tree';


export function single(parent) {
  //let charts = ['Chart A', 'Chart 2', 'Chart 3' ];
  let trees = ['Tree A'];

  let root = d3.select(parent)
    .attr('class', 'container col trees');

  root.append('div')
    .attr('class', 'single-title')
    .text('Trees');

  root.selectAll('.tree')
    .data(trees)
    .enter()
      .append('div')
      .call(tree);

  function api() {}

  return api;
}
