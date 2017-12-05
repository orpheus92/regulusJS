
import './style.css';
import * as d3 from 'd3';

//import {editor} from '../editor';
import {single} from '../single';
import {loader,setValue} from '../loader';

//import {tree} from '../tree';

import simple from '../../data/test.csv';
import simple2 from '../../data/test.csv';
1
//console.log(simple);
let _loader;
let _loader2;
let _single;
let _data;
let _data2;
//let _tree;

console.log('Skeleton started');
setup();


function setup() {
  // setup file loader
  d3.select('#csvload')
    .on('click', () =>  document.getElementById('csvLoader').click());

  d3.select('#csvLoader')
    .on('change', function () { selectFile(this.files.length && this.files[0]); });

    d3.select('#jsonload')
        .on('click', () =>  document.getElementById('jsonLoader').click());

    d3.select('#jsonLoader')
        .on('change', function () { selectFile2(this.files.length && this.files[0]); });


    // setup the editor
  _loader= loader(document.getElementById('csvloader'), {});
  _loader2= loader(document.getElementById('jsonloader'), {});

    //console.log(_loader);
  _data = setValue(simple,_data);
  _data2 = setValue(simple2,_data2);

    //_tree = tree('#tree');
  _single = single('#single');
}


function selectFile(path) {
  d3.select('#csvname').text(path.name);
  if (path) load(path);
}

function selectFile2(path) {
    d3.select('#jsonname').text(path.name);
    if (path) load(path);
}

function load(path) {
  let reader = new FileReader();
  reader.onloadend = (event) => {
    d3.text(event.target.result)
      .get( data => setValue(data));
  };
  //console.log(_data);
  reader.readAsDataURL(path);
}
