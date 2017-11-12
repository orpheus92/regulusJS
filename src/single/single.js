import './style.css';

import * as d3 from 'd3';
import {chart} from '../chart';


export function single(parent) {
  let charts = ['Chart A', 'Chart 2', 'Chart 3' ];

  let root = d3.select(parent)
    .attr('class', 'container col charts');

  root.append('div')
    .attr('class', 'single-title')
    .text('Charts');

  root.selectAll('.chart')
    .data(charts)
    .enter()
      .append('div')
      .call(chart);

  function api() {}

  return api;
}
