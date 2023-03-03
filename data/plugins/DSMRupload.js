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

function handleFileSelect()
{
  var txt = "";
  //let fileSize = document.querySelector('fileSize');
  var nTotalSize =0;
  var files = document.getElementById('Ifile').files;
  for( var file of files)
  {
    console.log( file.name, file.size);
    //var sFilesize = formatFilesize(file.size);
    nTotalSize += file.size;

    txt += `filename= ${file.name}, filesize= ${file.size} bytes <br>`;
  }
   
  //enable or disable upload button based on freesize
  var sTotalSize = formatFilesize(nTotalSize);
  if (nTotalSize > nFreeSize) 
  {    
    //fileSize.innerHTML = 
    //`<p><small> Bestand Grootte: ${sTotalSize}</small><strong style="color: red;"> niet genoeg ruimte! </strong><p>`;
    document.getElementById('Iupload').setAttribute('disabled', 'disabled');
  }
  else {
    //fileSize.innerHTML = `<b>Bestand grootte:</b> ${sTotalSize}<p>`;
    document.getElementById('Iupload').removeAttribute('disabled');
  }

  document.getElementById("uploadlist").innerHTML = txt;
}

const download_icon = '<span class="iconify" data-icon="mdi-file-download-outline"></span>'
const delete_icon = '<span class="iconify" data-icon="mdi-file-document-remove-outline"></span>'

function clearFilelist(){
  var list = document.getElementById("FSmain");
  while (list.hasChildNodes()) {
    list.removeChild(list.firstChild);
  }
}

function showFileList(json)
{
  let main = document.querySelector('main');
  let btn_download = "Download";
  let btn_delete = "Delete";
  
  //clear previous content	 
  clearFilelist();

  //create table from listfiles json
  let dir = '<table id="FSTable" width=90%>';
  for (var i = 0; i < json.length - 1; i++) {
    var href = `href="${json[i].name}"`;
    var href2= `href="${json[i].name}?delete=/${json[i].name}"`;
    dir += "<tr>";
    dir += `<td width=250px nowrap> <a ${href} target="_blank">${json[i].name}</a></td>`;
    dir += `<td width=100px nowrap> <small>${json[i].size}</small></td>`;
    dir += `<td width=100px nowrap> <a ${href} download="${json[i].name}"> ${btn_download} </a></td>`;
    dir += `<td width=100px nowrap> <a ${href2} > ${btn_delete} </a></td>`;
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
  main.insertAdjacentHTML('beforeend', `<div id='FSFilecount'>Aantal bestanden: ${json.length} </div>`);
  main.insertAdjacentHTML('beforeend', `<p id="FSFree">Opslag: <b>${json[i].usedBytes} gebruikt</b> | ${json[i].totalBytes} totaal`);
  
  //store freebytes
  nFreeSize = json[i].freeBytes;
  //document.querySelector('fileSize').innerHTML = "<b> &nbsp; </b><p>";
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

function fetchDataJSON(url, fnCallback)
{
  console.log("fetchDataJSON() url=", url, "callback=", fnCallback);
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

function formatFilesize(nBytes)
{
  let output = `${nBytes} Byte`;
  for (var aMultiples = [' KB', ' MB'], i = 0, nApprox = nBytes / 1024; nApprox > 1; nApprox /= 1024, i++) 
  {
    output = nApprox.toFixed(2) + aMultiples[i];
  }
  return output;
}
