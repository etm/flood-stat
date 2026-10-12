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

const chars = ['l', 'g', 'b', 'o', 'r', 'y'];

function init(size) {
  let field = [];
  for (let i=0; i<size; i++) {
    field[i] = [];
    for (let j=0; j<size; j++) {
      field[i][j] = chars[Math.floor(Math.random() * chars.length)];
    }
  }
  return field;
}

function draw(field,clicks) {
  let tab = $('table#field');
  tab.empty();
  for (let i=0; i<field.length; i++) {
    let tr = $('<tr></tr>');
    for (let j=0; j<field.length; j++) {
      tr.append($('<td class="' + field[i][j] + '"></td>'));
    }
    tab.append(tr);
  }
  $('span#stats').empty();
  $('span#stats').append('Clicks: ' + clicks);

  $('div.stats').empty();

  let n = neighbors(field);
  for (const [key, value] of Object.entries(n)) {
    $('div#neighbors').append($('<div class="' + key + '">' + key + ': ' + value + '</div>'));
  }

  let nf = neighbor_fields(field);
  for (const [key, value] of Object.entries(nf)) {
    $('div#neighbor_fields').append($('<div class="' + key + '">' + key + ': ' + value + '</div>'));
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

$(document).ready(function(){
  let field = init(32);
  let field_save = structuredClone(field);
  let clicks = 0;
  draw(field, clicks);
  $(document).on('keydown', function(event) {
    const key = event.key;
    if (chars.includes(key)) {
      clicks += 1;
      color(key,field);
      draw(field,clicks);
      event.preventDefault();
    }
  });
  $(document).on('click', 'table#field td', function(event) {
    clicks += 1;
    color(event.target.className,field);
    draw(field,clicks);
  });
  $(document).on('click', 'button#restart', function(event) {
    field = structuredClone(field_save);
    clicks = 0;
    draw(field,clicks);
  });
  $(document).on('click', 'div.stats div', function(event) {
    if (event.target.className != '') {
      clicks += 1;
      color(event.target.className,field);
      draw(field,clicks);
    }
  });
});
