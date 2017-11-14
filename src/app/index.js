
import './style.css';
import * as d3 from 'd3';

//import {editor} from '../editor';
import {single} from '../single';
import {loader,setValue} from '../loader';

//import {tree} from '../tree';

import simple from '../../data/test.csv';
//console.log(simple);
let _loader;
let _single;
let _data;
//let _tree;

console.log('Skeleton started');
setup();


function setup() {
  // setup file loader
  d3.select('#load')
    .on('click', () =>  document.getElementById('fileLoader').click());

  d3.select('#fileLoader')
    .on('change', function () { selectFile(this.files.length && this.files[0]); });

  // setup the editor
  _loader= loader(document.getElementById('loader'), {});
  //console.log(_loader);
  _data = setValue(simple,_data);
  //_tree = tree('#tree');
  _single = single('#single');
}


function selectFile(path) {
  d3.select('#filename').text(path.name);
  if (path) load(path);
}

function load(path) {
  let reader = new FileReader();
  reader.onloadend = (event) => {
    d3.text(event.target.result)
      .get( data => setValue(data,_data));
  };
  //console.log(_data);
  reader.readAsDataURL(path);
}
