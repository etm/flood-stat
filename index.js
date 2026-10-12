/*
  This file is part of FLOOD-STAT.

  FLOOD-STAT is free software: you can redistribute it and/or modify it under
  the terms of the GNU General Public License as published by the Free Software
  Foundation, either version 3 of the License, or (at your option) any later
  version.

  FLOOD-STAT is distributed in the hope that it will be useful, but WITHOUT ANY
  WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
  A PARTICULAR PURPOSE.  See the GNU General Public License for more details.

  You should have received a copy of the GNU General Public License along with
  FLOOD-STAT (file LICENSE in the main directory). If not, see
  <http://www.gnu.org/licenses/>.
*/

const chars = ['p', 'g', 'b', 'o', 'r', 'y'];

function seed() {
  let url = new URL(window.location);
  let seed = Math.floor(Math.random() * 4294967296);
  url.searchParams.set('field', seed);
  history.pushState(null, '', url);
  return seed;
}

function rng(seed) {
  // mulberry32i deterministic floats in [0,1) for a 32bit seed
  return function() {
    seed = (seed + 0x6D2B79F5) | 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function init(size,seed) {
  let random = rng(seed);
  let field = [];
  for (let i=0; i<size; i++) {
    field[i] = [];
    for (let j=0; j<size; j++) {
      field[i][j] = chars[Math.floor(random() * chars.length)];
    }
  }
  return field;
}

function draw(field,steps,ends) {
  let tab = document.querySelector('table#field');
  tab.replaceChildren();
  for (let i=0; i<field.length; i++) {
    let tr = document.createElement('tr');
    for (let j=0; j<field.length; j++) {
      let td = document.createElement('td');
      td.className = field[i][j];
      tr.append(td);
    }
    tab.append(tr);
  }
  document.querySelector('span#stats').textContent = 'Steps: ' + steps;

  draw_stats(document.querySelector('div#neighbors'), neighbors(field), 'N: ' + ends.n);
  draw_stats(document.querySelector('div#neighbor_fields'), neighbor_fields(field), 'NF: ' + ends.nf);
}
function calc_ends(field) {
  return { n: steps_to_end(field,neighbors), nf: steps_to_end(field,neighbor_fields) };
}
function steps_to_end(field,stat) {
  // greedy: always color with biggest number
  let copy = structuredClone(field);
  let steps = 0;
  let s = Object.keys(stat(copy));
  while (s.length > 0) {
    color(s[0],copy);
    steps += 1;
    s = Object.keys(stat(copy));
  }
  return steps;
}
function draw_stats(div,stats,name) {
  div.replaceChildren();
  let title = document.createElement('div');
  title.textContent = name;
  div.append(title);
  for (const [key, value] of Object.entries(stats)) {
    let d = document.createElement('div');
    d.className = key;
    d.textContent = key + ': ' + value;
    div.append(d);
  }
}

function color(what,field) {
  let orig = field[0][0];
  if (orig == what) { return; }
  color_r(orig,what,field,0,0);
}
function color_r(orig,what,field,i,j) {
  if (i >= field.length || i < 0) { return; }
  if (j >= field.length || j < 0) { return; }
  if (field[i][j] == orig) {
    field[i][j] = what;
    color_r(orig,what,field,i+1,j);
    color_r(orig,what,field,i-1,j);
    color_r(orig,what,field,i,j+1);
    color_r(orig,what,field,i,j-1);
  }
}
function neighbors(field) {
  let stats = {};
  let instats = [];
  let visited = [];
  let orig = field[0][0];
  neighbors_r(orig,field,stats,visited,instats,0,0);
  return Object.fromEntries(
    Object.entries(stats).sort((a, b) => b[1] - a[1])
  );
}
function neighbors_r(orig,field,stats,visited,instats,i,j) {
  if (i >= field.length || i < 0) { return; }
  if (j >= field.length || j < 0) { return; }
  if (field[i][j] == orig) {
    if (!visited.includes(i+','+j)) {
      visited.push(i+','+j);
      neighbors_r(orig,field,stats,visited,instats,i+1,j);
      neighbors_r(orig,field,stats,visited,instats,i-1,j);
      neighbors_r(orig,field,stats,visited,instats,i,j+1);
      neighbors_r(orig,field,stats,visited,instats,i,j-1);
    }
  } else {
    if (!instats.includes(i+','+j)) {
      if (!stats[field[i][j]]) { stats[field[i][j]] = 0; }
      instats.push(i+','+j);
      stats[field[i][j]] += 1;
    }
  }
}

function neighbor_fields(field) {
  let stats = {};
  let instats = [];
  let visited = [];
  let orig = field[0][0];
  neighbor_fields_r(orig,field,stats,visited,instats,0,0);
  return Object.fromEntries(
    Object.entries(stats).sort((a, b) => b[1] - a[1])
  );
}
function neighbor_fields_r(orig,field,stats,visited,instats,i,j) {
  if (i >= field.length || i < 0) { return; }
  if (j >= field.length || j < 0) { return; }
  if (field[i][j] == orig) {
    if (!visited.includes(i+','+j)) {
      visited.push(i+','+j);
      neighbor_fields_r(orig,field,stats,visited,instats,i+1,j);
      neighbor_fields_r(orig,field,stats,visited,instats,i-1,j);
      neighbor_fields_r(orig,field,stats,visited,instats,i,j+1);
      neighbor_fields_r(orig,field,stats,visited,instats,i,j-1);
    }
  } else {
    cellcount(field[i][j],field,stats,instats,i,j);
  }
}

function cellcount(what,field,stats,visited,i,j) {
  if (i >= field.length || i < 0) { return; }
  if (j >= field.length || j < 0) { return; }
  if (field[i][j] == what) {
    if (!visited.includes(i+','+j)) {
      visited.push(i+','+j);
      if (!stats[field[i][j]]) { stats[field[i][j]] = 0; }
      stats[field[i][j]] += 1;
      cellcount(what,field,stats,visited,i+1,j);
      cellcount(what,field,stats,visited,i-1,j);
      cellcount(what,field,stats,visited,i,j+1);
      cellcount(what,field,stats,visited,i,j-1);
    }
  }
}

document.addEventListener('DOMContentLoaded', function(){
  let param = new URL(window.location).searchParams.get('field');
  let field = init(32,param === null || isNaN(parseInt(param)) ? seed() : parseInt(param));
  let field_save = structuredClone(field);
  let ends = calc_ends(field);
  let steps = 0;
  draw(field, steps, ends);
  document.addEventListener('keydown', function(event) {
    const key = event.key;
    if (chars.includes(key)) {
      steps += 1;
      color(key,field);
      draw(field,steps,ends);
      event.preventDefault();
    }
  });
  document.addEventListener('click', function(event) {
    const target = event.target;
    if (target.matches('table#field td, div.stats div') && chars.includes(target.className)) {
      steps += 1;
      color(target.className,field);
      draw(field,steps,ends);
    } else if (target.matches('button#restart')) {
      field = structuredClone(field_save);
      steps = 0;
      draw(field,steps,ends);
    } else if (target.matches('button#new')) {
      field = init(32,seed());
      field_save = structuredClone(field);
      ends = calc_ends(field);
      steps = 0;
      draw(field, steps, ends);
    }
  });
});
