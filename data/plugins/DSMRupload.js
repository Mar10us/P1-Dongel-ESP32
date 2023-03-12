/*
*
*/

const APIGW = window.location.protocol + '//' + window.location.host + '/api/';
const URL_LOCAL_LISTFILES = "api/listfiles";
const btn_download = `<iconify-icon icon="mdi:file-download-outline" height="24"></iconify-icon>`;
const btn_delete = `<iconify-icon icon="mdi:file-document-remove-outline" height="24"></iconify-icon>`;

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

function onButtonRemoveFile(element)
{
  var idx = Number(element.id.split("action")[1]);
  removeFile(idx);
}

function removeFile(idx)
{
  console.log("removeFile() - idx=" + idx);
  
  //get original list
  var attachments = document.getElementById("Ifile").files;

  //rebuild a filelist but skip the item to remove
  var fileBuffer = new DataTransfer();
  for (let i = 0; i < attachments.length; i++) {
    if (idx !== i) fileBuffer.items.add(attachments[i]);
  }

  // Assign buffer to file input
  document.getElementById("Ifile").files = fileBuffer.files;

  //refresh list
  handleFileSelect();
}

function handleFileSelect()
{
  console.log("handleFileSelect()");
  var txt = "";
  var idx=0;
  //let fileSize = document.querySelector('fileSize');
  var nTotalSize =0;
  var files = document.getElementById('Ifile').files;
  for( var file of files)
  {    
    console.log( file.name, file.type, file.size);
    var sFilesize = formatFilesize(file.size);
    nTotalSize += file.size;
    icon = `<iconify-icon icon="mdi:file-document-remove-outline" height="24"></iconify-icon>`;
    txt += `<div class='file' id='file${idx}'>`;
    txt += `<div class='filename'>${file.name}</div>`;
    txt += `<div class='filetype'>${file.type}</div>`;
    txt += `<div class='filesize'>${sFilesize}</div>`;
    txt += `<div class='action' id='action${idx}' onclick='onButtonRemoveFile(this)'>${icon}</div>`;
    txt += `</div>`;
    idx += 1;
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

function clearFilelist(){
  var list = document.getElementById("FSmain");
  while (list.hasChildNodes()) {
    list.removeChild(list.firstChild);
  }
}

function showFileList(json)
{
  let main = document.querySelector('main');
  
  //clear previous content	 
  clearFilelist();

  //create table from listfiles json
  let dir = '<table id="FSTable">';
  dir += "<tr>";
  dir += "<th>Filename</td>";
  dir += "<th>Filetype</td>";
  dir += "<th>Filesize</td>";
  dir += "<th>Actions</td>";
  dir += "</tr>";
  for (var i = 0; i < json.length - 1; i++) {
    var href = `href="${json[i].name}"`;
    var href2= `href="${json[i].name}?delete=/${json[i].name}"`;
    var filetype = getFiletype(json[i].name);    
    dir += "<tr>";
    dir += `<td width=400px nowrap> <a ${href} target="_blank">${json[i].name}</a></td>`;
    dir += `<td width=100px nowrap> <small>${filetype}</small></td>`;
    dir += `<td width=100px nowrap> <small>${json[i].size}</small></td>`;
    dir += `<td width=100px nowrap><a ${href} download="${json[i].name}">${btn_download}</a>&emsp;<a ${href2}>${btn_delete}</a></td>`;
    // 	     if (json[i].name == '!format') document.getElementById('FormatSPIFFS').disabled = false;
    dir += "</tr>";
  }

  //???
  main.insertAdjacentHTML('beforeend', dir);

  //attach onclick on each delete button 
  document.querySelectorAll('[href*=delete]').forEach((node) => {
    node.addEventListener('click', (element) => {
      console.log("element", element);
      var filename = element.target.pathname;
      var msg = `Weet je zeker dat je bestand '${filename}' wilt verwijderen?!`;
      if (!confirm(msg)) event.preventDefault();
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

function getFiletype(filepath){
  var parts = filepath.split(".");
  var fileext = parts[parts.length-1];
  //TODO: get mimetype
  return fileext;
}
