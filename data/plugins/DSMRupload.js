/*
*
*/

const APIGW = window.location.protocol + '//' + window.location.host + '/api/';
const URL_LOCAL_LISTFILES = "api/listfiles";

"use strict";

let nFreeSize=0;
let activeTab = "bFSexplorer";

//entrypoint
window.onload = onLoad;

//first function
function onLoad()
{
  console.log("onLoad()");
  FSExplorer();
}

/*
************************************* MAIN **************************************
*/

//show a filelist, browse button and an upload button
function FSExplorer() 
{
  fetchDataJSON( URL_LOCAL_LISTFILES, showFileList );

  //create upload handler 
  document.getElementById('Ifile').addEventListener('change', handleFileSelect);
  document.getElementById("FileExplorer").style.display = "block";
}

function formatFilesize(nBytes)
{
  let output = `${nBytes} Byte`;
  for (var aMultiples = [' KB', ' MB'], i = 0, nApprox = nBytes / 1024; nApprox > 1; nApprox /= 1024, i++) 
  {
    output = nApprox.toFixed(2) + aMultiples[i];
  }
  return output;
}

function handleFileSelect()
{
  let fileSize = document.querySelector('fileSize');
  var nTotalSize =0;
  var files = document.getElementById('Ifile').files;
  for( var file of files)
  {
    console.log( file.name, file.size);
    var sFilesize = formatFilesize(file.size);
    nTotalSize += file.size;
  }
   
  //enable or disable upload button based on freesize
  var sTotalSize = formatFilesize(nTotalSize);
  if (nTotalSize > nFreeSize) 
  {    
    fileSize.innerHTML = 
    `<p><small> Bestand Grootte: ${sTotalSize}</small><strong style="color: red;"> niet genoeg ruimte! </strong><p>`;
    document.getElementById('Iupload').setAttribute('disabled', 'disabled');
  }
  else {
    fileSize.innerHTML = `<b>Bestand grootte:</b> ${sTotalSize}<p>`;
    document.getElementById('Iupload').removeAttribute('disabled');
  }
}

function showFileList(json)
{
  let main = document.querySelector('main');
  
  //clear previous content	 
  var list = document.getElementById("FSmain");
  while (list.hasChildNodes()) {
    list.removeChild(list.firstChild);
  }

  //create table from listfiles json
  let dir = '<table id="FSTable" width=90%>';
  for (var i = 0; i < json.length - 1; i++) {
    dir += "<tr>";
    dir += `<td width=250px nowrap><a href ="${json[i].name}" target="_blank">${json[i].name}</a></td>`;
    dir += `<td width=100px nowrap><small>${json[i].size}</small></td>`;
    dir += `<td width=100px nowrap><a href ="${json[i].name}"download="${json[i].name}"> Download </a></td>`;
    dir += `<td width=100px nowrap><a href ="${json[i].name}?delete=/${json[i].name}"> Delete </a></td>`;
    // 	     if (json[i].name == '!format') document.getElementById('FormatSPIFFS').disabled = false;
    dir += "</tr>";
  }

  //???
  main.insertAdjacentHTML('beforeend', dir);

  //attach onclick on each delete button 
  document.querySelectorAll('[href*=delete]').forEach((node) => {
    node.addEventListener('click', () => {
      if (!confirm('Weet je zeker dat je dit bestand wilt verwijderen?!')) event.preventDefault();
    });
  });

  //???
  main.insertAdjacentHTML('beforeend', '</table>');
  main.insertAdjacentHTML('beforeend', `<p id="FSFree">Opslag: <b>${json[i].usedBytes} gebruikt</b> | ${json[i].totalBytes} totaal`);
  
  //store freebytes
  nFreeSize = json[i].freeBytes;
  document.querySelector('fileSize').innerHTML = "<b> &nbsp; </b><p>";
}

function fetchDataJSON(url, fnCallback)
{
  Spinner(true);
  fetch(url, { "setTimeout": 5000 })
    .then(function (response) {
      return response.json();
    })
    .then(function (json) {
      fnCallback(json);
      Spinner(false);
    });
}

/*
************************************* UTILS **************************************
*/

function Spinner(show) {
  if (show) {
    document.getElementById("loader").removeAttribute('hidden');
    setTimeout(() => { document.getElementById("loader").setAttribute('hidden', ''); }, 5000);
  } else document.getElementById("loader").setAttribute('hidden', '');
}






















//============================================================================  
function showActualTable(data) {
  if (activeTab != "bActualTab") return;

  console.log("showActual()");

  for (var item in data) {
    if ((item == "gas_delivered_timestamp") && (Dongle_Config == "p1-q")) continue;
    //console.log("showActualTableV2 i: "+item);
    //console.log("showActualTableV2 data[i]: "+data[item]);
    //console.log("showActualTableV2 data[i].value: "+data[item].value);

    data[item].humanName = translateToHuman(item);
    var tableRef = document.getElementById('actualTable').getElementsByTagName('tbody')[0];
    if ((document.getElementById("actualTable_" + item)) == null) {
      var newRow = tableRef.insertRow();
      newRow.setAttribute("id", "actualTable_" + item, 0);
      // Insert a cell in the row at index 0
      var newCell = newRow.insertCell(0);            // (short)name
      var newText = document.createTextNode('');
      newCell.appendChild(newText);
      newCell = newRow.insertCell(1);                // value
      newCell.appendChild(newText);
      newCell = newRow.insertCell(2);                // unit
      newCell.appendChild(newText);
    }
    tableCells = document.getElementById("actualTable_" + item).cells;
    if ((item == "gas_delivered") && (Dongle_Config == "p1-q")) {
      tableCells[0].innerHTML = "Warmtemeter stand";
      tableCells[2].innerHTML = "GJ";
    } else {
      tableCells[0].innerHTML = data[item].humanName;
      if (data[item].hasOwnProperty('unit')) tableCells[2].innerHTML = data[item].unit;
    }

    var value;
    switch(item)
    {
      case 'timestamp':               value = formatTimestamp( data[item].value ); break;
      case 'gas_delivered_timestamp': value = formatTimestamp( data[item].value ); break;
      default:
        value = data[item].value;

    }
    tableCells[1].innerHTML = value;
  }

  //--- hide canvas
  document.getElementById("dataChart").style.display = "none";
  document.getElementById("gasChart").style.display = "none";
  document.getElementById("waterChart").style.display = "none";
  //--- show table
  document.getElementById("actual").style.display = "block";

  //hide old table
  document.getElementById("actualTable").style.display = "none";
  //show new table
  document.getElementById("wrapper").style.display = "block";

  //V2
  matrix = [];
  for (var item in data) {
    row = [];
    row.push(translateToHuman(item));
    switch(item)
    {
      case 'timestamp':               value = formatTimestamp( data[item].value ); break;
      case 'gas_delivered_timestamp': value = formatTimestamp( data[item].value ); break;
      default:
        value = data[item].value;

    }
    row.push(value);
    unit = "-";
    if (data[item].hasOwnProperty('unit')) unit = data[item].unit;
    row.push(unit);
    matrix.push(row);
  }

  //update the table with new data
  objTableACTUAL.updateConfig({
    data: matrix
  }).forceRender();

} // showActualTable()

//============================================================================  
function showHistTable(data, type) {
  console.log("showHistTable(" + type + ")");
  // the last element has the metervalue, so skip it
  var stop = data.actSlot + 1;
  var start = data.data.length + data.actSlot;
  var index;
  //console.log("showHistTable start: "+start);
  //console.log("showHistTable stop: "+stop);
  var tableRef = document.getElementById('last' + type + 'Table');
  tableRef.getElementsByTagName('tbody')[0].innerHTML = ''; //clear tbody content


  for (let i = start; i > stop; i--) {
    index = i % data.data.length;
    //console.log("showHistTable index: "+index);
    //console.log("showHistTable("+type+"): data["+i+"] => data["+i+"]name["+data[i].recid+"]");

    //       var tableRef = document.getElementById('last'+type+'Table');
    //       if( ( document.getElementById(type +"Table_"+type+"_R"+index)) == null )
    //       {
    var newRow = tableRef.getElementsByTagName('tbody')[0].insertRow();
    //newRow.setAttribute("id", type+"Table_"+data[i].recid, 0);
    newRow.setAttribute("id", type + "Table_" + type + "_R" + index, 0);
    // Insert a cell in the row at index 0
    var newCell = newRow.insertCell(0);
    var newText = document.createTextNode('-');
    newCell.appendChild(newText);
    newCell = newRow.insertCell(1);
    newCell.appendChild(newText);
    newCell = newRow.insertCell(2);
    newCell.appendChild(newText);
    newCell = newRow.insertCell(3);
    newCell.appendChild(newText);
    newCell = newRow.insertCell(4);
    newCell.appendChild(newText); 
    if (type == "Days") {
      newCell = newRow.insertCell(5);
      newCell.appendChild(newText);
    }
    //       }

    //get ref to cells
    tableCells = document.getElementById(type + "Table_" + type + "_R" + index).cells;

    //fill table
    tableCells[0].innerHTML = formatDate(type, data.data[index].date);
    if (data.data[index].p_edw >= 0) tableCells[1].innerHTML = data.data[index].p_edw;
    else tableCells[1].innerHTML = "-";

    if (data.data[index].p_erw >= 0) tableCells[2].innerHTML = data.data[index].p_erw;
    else tableCells[2].innerHTML = "-";

    if (data.data[index].p_gd >= 0) tableCells[3].innerHTML = data.data[index].p_gd;
    if (data.data[index].water >= 0) tableCells[4].innerHTML = data.data[index].water;

    if (type == "Days") tableCells[5].innerHTML = ((data.data[index].costs_e + data.data[index].costs_g) * 1.0).toFixed(2);
    
  }

  //--- hide canvas
  document.getElementById("dataChart").style.display = "none";
  document.getElementById("gasChart").style.display = "none";
  document.getElementById("waterChart").style.display = "none";

  if (Dongle_Config == "p1-q") {
    show_hide_column2('lastHoursTable', 1, false);
    show_hide_column2('lastHoursTable', 2, false);
    show_hide_column2('lastHoursTable', 4, false);

    show_hide_column2('lastDaysTable', 1, false);
    show_hide_column2('lastDaysTable', 2, false);
    show_hide_column2('lastDaysTable', 4, false);
    show_hide_column2('lastDaysTable', 5, false);
  }

  //--- show table
  document.getElementById("lastHours").style.display = "block";
  document.getElementById("lastDays").style.display = "block";

  if (type == "Days")
  {
    //get the correct data for table
    matrix = formatTableDAYS( data );

    //v2
    objTableDAYS.updateConfig({
      columns: matrix.columns,
      data: matrix.rows
    }).forceRender();  
  }
  
  if (type == "Hours")
  {
    //get the correct data for table
    matrix = formatTableHOURS( data );

    //v2
    objTableHOURS.updateConfig({
      columns: matrix.columns,
      data: matrix.rows
    }).forceRender();  
  } 

} // showHistTable()

//generate matrix
function formatTableDAYS(data)
{
  var start = data.data.length + data.actSlot;
  var stop = start - 12;

  //generate kolommen
  var cols=["Datum/Tijd", "Energie Verbruik (Wh)"];
  if (Injection) cols.push("Energie Teruglevering (Wh)");
  if (HeeftGas) cols.push("Gas-verbruik (m3)");
  if (HeeftWater) cols.push("Water-verbruik (m3)");
  cols.push("Kosten");

  //generate rijen
  var rows=[];
  for (let i = start; i > stop; i--) 
  {
    var index = i % data.data.length;

    //get entry
    var entry = data.data[index];

    //skip invalid dates
    var date = formatDate2(entry.date);
    if (date == "2020-00-00")
      continue;

    //create row
    var row=[];
    row.push( date );
    row.push( (entry.p_edw >= 0) ? entry.p_edw : "-" );
    if (Injection) row.push( (entry.p_erw >= 0) ? entry.p_erw : "-");
    if (HeeftGas)  row.push( (entry.p_gd  >= 0) ? entry.p_gd  : "-");
    if (HeeftWater)row.push( (entry.water >= 0) ? entry.water : "-");
    row.push( "\u20AC "+((entry.costs_e + entry.costs_g) * 1.0).toFixed(2) );

    //add row to matrix    
    rows.push( row );
  }
  return {columns:cols, rows: rows};
}

function formatTableHOURS(data)
{
  var stop = data.actSlot + 1;
  var start = data.data.length + data.actSlot;

  //generate kolommen
  var cols=["Datum/Tijd", "Energie Verbruik (Wh)"];
  if (Injection) cols.push("Energie Teruglevering (Wh)");
  if (HeeftGas) cols.push("Gas-verbruik (m3)");
  if (HeeftWater) cols.push("Water-verbruik (m3)");

  //generate rijen
  var rows=[];
  for (let i = start; i > stop; i--) 
  {
    var index = i % data.data.length;

    //get entry
    var entry = data.data[index];

    //format hour
    var date = formatDate3(entry.date);

    //create row
    var row=[];
    row.push( date );
    row.push( (entry.p_edw >= 0) ? entry.p_edw : "-" );
    if (Injection) row.push( (entry.p_erw >= 0) ? entry.p_erw : "-");
    if (HeeftGas)  row.push( (entry.p_gd  >= 0) ? entry.p_gd  : "-");
    if (HeeftWater)row.push( (entry.water >= 0) ? entry.water : "-");

    //add row to matrix    
    rows.push( row );
  }
  return {columns:cols, rows: rows};
}

function formatTableMONTHCOSTS(data)
{
  var colsT=["Maand"];
  var cols =[];
  cols.push("Jaar");
  cols.push("Electra");
  if(HeeftGas)   cols.push("Gas");
  if(HeeftWater) cols.push("Water");
  cols.push("Netwerk");
  cols.push("Totaal");
  colsT.push( cols );
  colsT.push( cols );
}
