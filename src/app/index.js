
import './style.css';
import * as d3 from 'd3';

import {editor} from '../editor';
import {single} from '../single';
import simple from '../../data/simple.cpp';

let _editor;
let _single;

console.log('Skeleton started');
setup();


function setup() {
  // setup file loader
  d3.select('#load')
    .on('click', () =>  document.getElementById('fileLoader').click());

  d3.select('#fileLoader')
    .on('change', function () { selectFile(this.files.length && this.files[0]); });

  // setup the editor
  _editor = editor(document.getElementById('editor'), {});
  _editor.setValue(simple);

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
      .get( data => _editor.setValue(data));
  };
  reader.readAsDataURL(path);
}
