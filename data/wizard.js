/*	
	plugin by Mar10us
*/

//const APIGW = "http://192.168.2.104/api/";
const APIGW=window.location.protocol+'//'+window.location.host+'/api/';
const URL_HISTORY_DAYS = APIGW + "../RNGdays.json";
const URL_HISTORY_MONTHS = APIGW + "../RNGmonths.json";
const URL_SM_ACTUAL = APIGW + "v2/sm/actual";

let timerRefresh = 0;
let sCurrentChart = "MONTHS";

testMeterstanden = [
	
	//{date:"2022-02-05", values:[7059, 6163, 0, 0, 5683, 0]},
	/*{date:"2022-02-05", values:[6163, 7059, 0, 0, 5683, 0]},
	{date:"2021-02-13", values:[5174, 4411, 0, 0, 4375, 0]},
	{date:"2020-02-12", values:[3483, 3018, 0, 0, 2779, 0]},
	{date:"2019-01-27", values:[1717, 1510, 0, 0, 1588, 0]},
	{date:"2018-02-13", values:[149,   169, 0, 0,  284, 0]}*/
];
testMeterstanden.reverse();

//testHuidigeMeterstand = {date:"2023-02-13", values:[8861, 7733, 900, 1900, 6781, 900]};
let currentReading = {date:"2000-00-00", values:[0, 0, 0, 0, 0, 0]};
var listMONTHS = [];

const listValuesCeilingE = [339, 280, 267, 207, 181, 159, 161, 176, 199, 266, 306, 356];
const listValuesCeilingG = [221, 188, 159,  86,  35,  19,  17,  17,  24,  81, 146, 207];

var objChart1;
var objChart2;
var objChart3;

var cfgE = {
	type: 'line',
	data: [],
	options: {
		plugins: {
			title: {
				display: true,
				text: 'VERBRUIK ELEKTRA',
			},
			legend: {
				position: 'right',
			}				
		},			
		responsive: true,
		maintainAspectRatio: true,
		scales: {
			x: {
				display: true,
				title: {
				display: true,
				text: 'Maanden'
				}
			},
			y: {
				display: true,
				title: {
				display: true,
				text: 'kWh'
				}
			}
		} // scales
	}
};

var cfgG = {
	type: 'line',
	data: {},
	options: {
		plugins: {
			legend: {
				position: 'right',
			},
			title: {
				display: true,
				text: 'VERBRUIK GAS',
			}
		},	
		responsive: true,
		maintainAspectRatio: true,
		scales: {
			x: {
				display: true,
				title: {
				  display: true,
				  text: 'Maanden'
				}
			},
			y: {
				display: true,
				title: {
				  display: true,
				  text: 'm3'
				}
			}
		} // scales
	}
};

var cfgW = {
	type: 'line',
	data: {},
	options: {
		plugins: {
			legend: {
				position: 'right',
			},
			title: {
				display: true,
				text: 'VERBRUIK WATER',
			}
		},	
		responsive: true,
		maintainAspectRatio: true,
		scales: {
			x: {
				display: true,
				title: {
				  display: true,
				  text: 'Maanden'
				}
			},
			y: {
				display: true,
				title: {
				  display: true,
				  text: 'm3'
				}
			}
		} // scales
	}
};

function createCharts() {
	const ctx1 = document.getElementById('chartE').getContext('2d');
	const ctx2 = document.getElementById('chartG').getContext('2d');
	const ctx3 = document.getElementById('chartW').getContext('2d');

	objChart1 = new Chart(ctx1, cfgE);
	objChart2 = new Chart(ctx2, cfgG);
	objChart3 = new Chart(ctx3, cfgW);

	console.log("charts ready");
}

window.onload = fnBootstrap;

function fnBootstrap() 
{
	createCharts();

	//set handlers
	document.getElementById("addrow1").addEventListener("click", onButtonAdd);
	document.getElementById("addrow2").addEventListener("click", onButtonAddActual);
	//document.getElementById("delete").addEventListener("click", onButtonDelete);
	document.getElementById("analyse-plot").addEventListener("click", onButtonAnalysePlot);
	document.getElementById("analyse-lin").addEventListener("click", onButtonAnalyseLinear);
	document.getElementById("analyse-cur").addEventListener("click", onButtonAnalyseCurved);
	document.getElementById("export-download").addEventListener("click", onButtonExportSave);
	document.getElementById("export-store").addEventListener("click", onButtonExportStore);

	resetFormFields();

	//update table with internal json
	updateTable(testMeterstanden);
	
	//refresh and schedule every 60sec
	refreshData();
	clearInterval(timerRefresh);
    timerRefresh = setInterval(refreshData, 60 * 1000); // repeat every 60s
}

//display internal json to table
function updateTable(data)
{
	var tablerows="";
	for( var i=0; i<data.length; i++)
	{
		var item = data[i];
		var date = item.date;
		var [ED1, ED2, ER1, ER2, GD, WD] = item.values;
		var icon = `<iconify-icon icon="mdi:receipt-text-remove" height="24"></iconify-icon>`;

		var rowheader = "<tr Id='" + date + "' data-date='" + date + 
		"' data-ed1='" + ED1 + "' data-ed2='" + ED2 + 
		"' data-er1='" + ER1 + "' data-er2='" + ER2 + 
		"' data-gd='" + GD + "' data-wd='" + WD + 
		"'>";
		//var rowaction = "<button id='" + btneditId + "' class='btn btn-info btn-xs btn-editcustomer' onclick='showeditrow(" + EmployeeID + ")'><i class='fa fa-pencil' aria-hidden='true'></i>Edit</button>";
		//rowaction+= "<button id='" + btndeleteId + "' class='btn btn-danger btn-xs btn-deleteEmployee' onclick='deleteEmployeeRow(" + EmployeeID + ")'><i class='fa fa-trash' aria-hidden='true'>Delete</button>"
		var rowdata = 
		  "<td class='td-data'>" + date + "</td>"
		+ "<td class='td-data'>" + ED1 + "</td>"
		+ "<td class='td-data'>" + ED2 + "</td>"
		+ "<td class='td-data'>" + ER1 + "</td>"
		+ "<td class='td-data'>" + ER2 + "</td>"
		+ "<td class='td-data'>" + GD + "</td>"
		+ "<td class='td-data'>" + WD + "</td>"
		+ "<td class='td-data'>" 
		+ `<div class='action' id='action${i}' onclick='onButtonRemove(this)'>${icon}</div>`
		+ "</td>";
		+ "</tr>";
		var tablerow = rowheader + rowdata;
		tablerows += tablerow;
	}
	document.getElementById('TABLE_METERSTANDEN').innerHTML = tablerows;
}

function onButtonRemove(element)
{
	//console.log(element);
	var idx = Number(element.id.split("action")[1]);
	removeReading(idx);
}

function removeReading(idx)
{
	console.log("removeReading() - idx=" + idx);
  	
	//rebuild a filelist but skip the item to remove
	var new_readings = [];
	for (let i = 0; i < testMeterstanden.length; i++) {
		if (idx !== i) new_readings.push( testMeterstanden[i] );
	}

	// Assign buffer to file input	
	testMeterstanden = new_readings;

	updateTable(testMeterstanden);
}

function onButtonAdd(event)
{
	event.preventDefault();

	Spinner(true);

	//var get all from values	
	var date = document.getElementById("date").value;
	var ED1 = Number(document.getElementById("ED_TARIF1").value);
	var ED2 = Number(document.getElementById("ED_TARIF2").value);
	var ER1 = Number(document.getElementById("ER_TARIF1").value);
	var ER2 = Number(document.getElementById("ER_TARIF2").value);
	var GD  = Number(document.getElementById("GD").value);
	var WD  = Number(document.getElementById("WD").value);

	//validate date and standen
	var fValid = false;
	
	//verify meterstanden 
	//TODO
	fValid = true;

	if( fValid )
	{
		//create row
		var row = {date: date.toString(), values: [ED1,ED2, ER1, ER2, GD, WD]};

		//add to internal json
		testMeterstanden.push(row);

		//sort data
		testMeterstanden.sort( (a,b) => {
			//console.log(a, a.date, b, b.date);
			b.date.localeCompare(a.date);
		});
		testMeterstanden.reverse();

		//update table
		updateTable(testMeterstanden);
	
		resetFormFields();
	}

	Spinner(false);
}

function onButtonAddActual(event)
{
	event.preventDefault();

	Spinner(true);

	var currentReading = getCurrentReading();
	setFormFields(currentReading);

	Spinner(false);
}

function setFormFields(item)
{
	document.getElementById("date").value = item.date;
	document.getElementById("ED_TARIF1").value = item.values[0];
	document.getElementById("ED_TARIF2").value = item.values[1];
	document.getElementById("ER_TARIF1").value = item.values[2];
	document.getElementById("ER_TARIF2").value = item.values[3];
	document.getElementById("GD").value = item.values[4];
	document.getElementById("WD").value = item.values[5];
}

function resetFormFields()
{
	document.getElementById("date").value = "";
	document.getElementById("ED_TARIF1").value = "";
	document.getElementById("ED_TARIF2").value = "";
	document.getElementById("ER_TARIF1").value = "";
	document.getElementById("ER_TARIF2").value = "";
	document.getElementById("GD").value = "";
	document.getElementById("WD").value = "";
}

function refreshData()
{	
	fetchDataJSON(URL_SM_ACTUAL, parseActualData);
}

function getCurrentReading()
{
	console.log("getCurrentReading() - ", currentReading);
	return currentReading;
}

function fetchDataJSON(url, fnHandleData) 
{
	console.log("fetchDataJSON( "+url+" )");

	fetch(url)
	.then(response => response.json())
	.then(json => { fnHandleData(json); })
	.catch(function (error) {
	  console.error("fetchDataJSON() - " + error.message);
	  var p = document.createElement('p');
	  p.appendChild( document.createTextNode('Error: ' + error.message) );
	});
}

function parseActualData(data)
{
	//parse date and store in currentReading
	for (var item in data) 
    {
		switch(item)
		{
			case "timestamp":
				//230421093210S
				let sdate = data[item].value.substring(0,6);
				let tdate = "20"+ sdate.substring(0,2) + "-" + sdate.substring(2,4) + "-" + sdate.substring(4,6);
				currentReading.date = tdate;
				break;
						
			case 'energy_delivered_tariff1': currentReading.values[0] = data[item].value; break;
			case 'energy_delivered_tariff2': currentReading.values[1] = data[item].value; break;
			case 'energy_returned_tariff1':  currentReading.values[2] = data[item].value; break;
			case 'energy_returned_tariff2':  currentReading.values[3] = data[item].value; break;
			
			case 'gas_delivered': currentReading.values[4] = data[item].value; break;
		} //endswitch
	}
}

function onButtonAnalysePlot(event)
{
	//event.preventDefault();
	console.log("onButtonAnalyse() - plot");

	Spinner(true);

	//get all entered readings (sorted 2008 -> 2022)
	var data = structuredClone(testMeterstanden);
	//console.log(data);

	//get current readings
	//var currentReading = getCurrentReading();
	//data.push(currentReading);

	//sort ASC
	data.sort((a,b) => {return a.date.localeCompare(b.date);});

	//generate chartdata
	//Dont calc internmediate, just to see raw input in chart
	const [dcEX, dcGX, dcWX] = createChartData(data, false);

	//copy chartdata to charts
	objChart1.data = dcEX;
	objChart2.data = dcGX;
	objChart3.data = dcWX;

	document.getElementById('chartE').style.display = "block";
	document.getElementById('chartG').style.display = "block";
	document.getElementById('chartW').style.display = "block";
	if( !dcGX.valid ) document.getElementById('chartG').style.display = "none";
	if( !dcWX.valid ) document.getElementById('chartW').style.display = "none";

	//update charts
	objChart1.update(0);
	objChart2.update(0);
	objChart3.update(0);

	Spinner(false);
}

function onButtonAnalyseLinear(event)
{
	console.log("onButtonAnalyse() - linear");

	Spinner(true);

	//get all entered readings (sorted 2008 -> 2022)
	var data = structuredClone(testMeterstanden);
	//console.log(data);

	//get current readings
	//var currentReading = getCurrentReading();
	//data.push(currentReading);

	//sort ASC
	data.sort((a,b) => {return a.date.localeCompare(b.date);});

	//generate chartdata
	//Calc intermediate, we want monthdata to export
	const [dcEX, dcGX, dcWX] = createChartData(data, true);

	//copy chartdata to charts
	objChart1.data = dcEX;
	objChart2.data = dcGX;
	objChart3.data = dcWX;

	document.getElementById('chartE').style.display = "block";
	document.getElementById('chartG').style.display = "block";
	document.getElementById('chartW').style.display = "block";
	if( !dcGX.valid ) document.getElementById('chartG').style.display = "none";
	if( !dcWX.valid ) document.getElementById('chartW').style.display = "none";

	//update charts
	objChart1.update(0);
	objChart2.update(0);
	objChart3.update(0);

	//Spinner(false);
}

function createChartData(data, fCalculateIntermediate)
{
	var dsED1 = createDatasetLINE(false, "rgba(0,30,138,.4)", "Stroom I");
	var dsED2 = createDatasetLINE(false, "rgba(0,60,108,.4)", "Stroom II");
	var dsEDX = createDatasetLINE(false, "rgba(0,0,168, 1)", "Stroom (I+II)");
	
	var dsER1 = createDatasetLINE(false, "rgba(138,30,0,.4)", "Teruglevering I");
	var dsER2 = createDatasetLINE(false, "rgba(108,60,0,.4)", "Teruglevering II");
	var dsERX = createDatasetLINE(false, "rgba(168,0, 0, 1)", "Teruglevering (I+II)");

	var dsGD  = createDatasetLINE(false, "rgba(0,138,0, 1)", "Gas");
	var dsWD  = createDatasetLINE(false, "rgba(138,0,0, 1)", "Water");

	//determine chart show/hide
	var fEnableDUALTARIF = false;
	var fEnableED = false;
	var fEnableER = false;
	var fEnableG = false;
	var fEnableW = false;
	for(var i=0; i<data.length; i++)
	{
		var metingC = data[i];
		var dateC = metingC.date;
		var valuesC = metingC.values;
		if( (valuesC[0]>0) || (valuesC[1]>0)) fEnableED = true;
		if( (valuesC[2]>0) || (valuesC[3]>0)) fEnableER = true;
		if( (valuesC[4]>0) ) fEnableG = true;
		if( (valuesC[5]>0) ) fEnableW = true;
		if( (valuesC[0]>0) && (valuesC[1]>0) ) fEnableDUALTARIF = true;
	}

	//generate one big day-based array
	const [bigLABELS, bigED1, bigED2, bigER1, bigER2, bigGD, bigWD] = generateBigArrays(data, fCalculateIntermediate);

	//fill datasets
	dsED1.data = bigED1;
	dsED1.valid = true;
	dsED2.data = bigED2;
	dsED2.valid = true;	
	dsER1.data = bigER1;
	dsER1.valid = true;
	dsER2.data = bigER2;
	dsER2.valid = true;	
	dsGD.data = bigGD;
	dsWD.data = bigWD;

	bigEDX = [];
	bigERX = [];
	for(var i=0; i<bigER1.length; i++)
	{
		if( bigED1[i] != null ) bigEDX[i] = bigED1[i] + bigED2[i];
		if( bigER1[i] != null ) bigERX[i] = bigER1[i] + bigER2[i];
	}
	dsEDX.data = bigEDX;
	dsEDX.valid = true;
	dsERX.data = bigERX;
	dsERX.valid = true;

	dcEX = createChartDataContainer();
	dcEX.labels = bigLABELS;
	if(fEnableED){
		if(dsED1.valid) dcEX.datasets.push(dsED1);
		if(fEnableDUALTARIF){
			if(dsED2.valid) dcEX.datasets.push(dsED2);
			if(dsEDX.valid) dcEX.datasets.push(dsEDX);
		}
	}
	if(fEnableER){
		if(dsER1.valid) dcEX.datasets.push(dsER1);
		if (fEnableDUALTARIF) {
			if (dsER2.valid) dcEX.datasets.push(dsER2);
			if (dsERX.valid) dcEX.datasets.push(dsERX);
		}
	}	
	dcEX.valid = fEnableED || fEnableER;

	dcGX = createChartDataContainer();
	dcGX.labels = bigLABELS;
	dcGX.datasets.push(dsGD);
	dcGX.valid = fEnableG;

	dcWX = createChartDataContainer();
	dcWX.labels = bigLABELS;
	dcWX.datasets.push(dsWD);
	dcWX.valid = fEnableW;

	//store for export; if calculated, we have month data so enable the export, else clear it
	if( fCalculateIntermediate )
		listMONTHS = extractDataForMonths(bigLABELS, bigED1, bigED2, bigGD, bigWD);
	else
		listMONTHS = [];

	return [dcEX, dcGX, dcWX];
}

function onButtonAnalyseCurved(event)
{
	//event.preventDefault();
	console.log("onButtonAnalyse() - curved");

	Spinner(true);

	//alert("Nog niet geimplementeerd!");

	//get all entered readings (sorted 2008 -> 2022)
	var data = structuredClone(testMeterstanden);
	//console.log(data);

	//get current readings
	//var currentReading = getCurrentReading();
	//data.push(currentReading);
	
	//sort ASC
	data.sort((a,b) => {return a.date.localeCompare(b.date);});

	//generate chartdata
	//Calc intermediate, we want monthdata to export
	const [dcEX, dcGX, dcWX] = createChartDataCURVE(data, true);

	//copy chartdata to charts
	objChart1.data = dcEX;
	objChart2.data = dcGX;
	objChart3.data = dcWX;

	document.getElementById('chartE').style.display = "block";
	document.getElementById('chartG').style.display = "block";
	document.getElementById('chartW').style.display = "block";
	if( !dcGX.valid ) document.getElementById('chartG').style.display = "none";
	if( !dcWX.valid ) document.getElementById('chartW').style.display = "none";

	//update charts
	objChart1.update(0);
	objChart2.update(0);
	objChart3.update(0);

	Spinner(false);
}

//create download for json
function onButtonExportSave(event)
{
	event.preventDefault();
	console.log("onButtonExport() - download");

	if( listMONTHS.length == 0)
	{
		alert("Geen data voor download. Kies een analyse methode.");
		return;
	} 

	//create listEXPORT with last 25 rows of listMONTHS
	//TODO: what if there no 25 rows?
	listEXPORT = [];
	for(var i=0; i<25; i++)
	{
		var nOffset = listMONTHS.length - 25;
		listEXPORT.push( listMONTHS[i+nOffset] );
	}
	//console.log(listEXPORT);
	
	//prepare fileobject
	var file = createFile(25);
	file.actSlot = 0;
	file.data = listEXPORT;
	//console.log(file);

	//create download
	downloadObjectAsJson(file, 'months.json');
}

function downloadObjectAsJson(exportObj, exportName){
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
    var dummyNode = document.createElement('a');
    dummyNode.setAttribute("href",     dataStr);
    dummyNode.setAttribute("download", exportName);
    document.body.appendChild(dummyNode); // required for firefox
    dummyNode.click();
    dummyNode.remove();
}

//store directly on FS
function onButtonExportStore(event)
{
	event.preventDefault();
	console.log("onButtonExport() - store");	

	alert("Nog niet geimplementeerd!");
}

function createFile(depth)
{
	var file = {actSlot: 0, data: []};	
	for(var x=0; x<depth; x++)
	{
		var row = {date: "00000000", values:[0,0,0,0,0]};
		file.data.push(row);
	}
	return file;
}

//return a date object into an string "YYMMDD"
function formatDateYYMMDD(objDate)
{
	var t="";
	var nYY = objDate.getFullYear()-2000;
	var nMM = objDate.getMonth()+1;
	var nDD = objDate.getDate();
	var sMM = (nMM<10)?"0"+nMM:""+nMM;
	var sDD = (nDD<10)?"0"+nDD:""+nDD;
	t = ""+nYY+sMM+sDD;
	return t;
}

//return a date object into an string "YYMMDD"
function formatDateYYYYMMDD(objDate)
{
	var t="";
	var nYYYY = objDate.getFullYear();
	var nMM = objDate.getMonth()+1;
	var nDD = objDate.getDate();
	var sMM = (nMM<10)?"0"+nMM:""+nMM;
	var sDD = (nDD<10)?"0"+nDD:""+nDD;
	t = nYYYY+"-"+sMM+"-"+sDD;
	return t;
}

//extract data for months
//beacuse the big array has readings per day, we can safely copy all readings on the first of each month to a separate list
function extractDataForMonths(bigLABELS, bigED1, bigED2, bigGD, bigWD )
{
	//export big arrays to months
	var listMONTHS = [];	
	for(var i=0; i<bigLABELS.length; i++)
	{
		var sdate = bigLABELS[i];
		if( sdate != null)
		{
			var objDate = new Date(sdate);
			var nDD = objDate.getDate();
			if(nDD == 1)
			{
				var month = {date: "", values:[0,0,0,0,0,0]};
				month.date = formatDateYYMMDD(objDate) + "23";
				month.values[0] = Number(bigED1[i].toFixed(3));
				month.values[1] = Number(bigED2[i].toFixed(3));
				//month.values[2] = bigER1[i].toFixed(3);
				//month.values[3] = bigER2[i].toFixed(3);
				month.values[4] = Number(bigGD[i].toFixed(3));
				month.values[5] = Number(bigWD[i].toFixed(3));
				listMONTHS.push(month);
			}
		}
	}
	return listMONTHS;
}

//copy all readings to a BIG day array and calculate all intermediate readings
function generateBigArrays(data, fCalculateIntermediate)
{
	var objToday = new Date();
	var dateStart = data[0].date;
	var objStart = new Date(dateStart);
	var nDays = Math.floor((objToday - objStart) / (1000*60*60*24));
	//console.log(objToday, objStart, dateStart, nDays);

	var bigLABELS = new Array(nDays);
	fillArrayNULL(bigLABELS);
	var bigED1 = structuredClone(bigLABELS);
	var bigED2 = structuredClone(bigLABELS);	
	var bigER1 = structuredClone(bigLABELS);
	var bigER2 = structuredClone(bigLABELS);
	var bigGD = structuredClone(bigLABELS);
	var bigWD = structuredClone(bigLABELS);

	//create month labels
	generateMonthTicks(bigLABELS, objStart, objToday);

	//process each item in list
	for( var i=0; i<data.length; i++ )
	{
		var metingC = data[i];
		var dateC = metingC.date;
		var valuesC = metingC.values;
		
		if( fCalculateIntermediate)
		{
			if((i+1)<data.length)
			{
				//console.log(i, data[i+1]);
				var metingN = data[i+1];
				var dateN = metingN.date;
				var valuesN = metingN.values;
				objDateC = new Date(dateC);
				objDateN = new Date(dateN);
				var nDays = Math.floor((objDateN - objDateC) / (1000*60*60*24));
				var nOffset = Math.floor((objDateC - objStart) / (1000*60*60*24));
				var nStepED1 = (valuesN[0] - valuesC[0]) / nDays;
				var nStepED2 = (valuesN[1] - valuesC[1]) / nDays;
				var nStepER1 = (valuesN[2] - valuesC[2]) / nDays;
				var nStepER2 = (valuesN[3] - valuesC[3]) / nDays;
				var nStepGD =  (valuesN[4] - valuesC[4]) / nDays;
				var nStepWD =  (valuesN[5] - valuesC[5]) / nDays;
				for(var x=0; x<nDays; x++)
				{
					var pos = x+nOffset;
					var val = valuesC[0] + (nStepED1 * x);
					bigED1[pos] = val;
					var val = valuesC[1] + (nStepED2 * x);
					bigED2[pos] = val;
					var val = valuesC[2] + (nStepER1 * x);
					bigER1[pos] = val;
					var val = valuesC[3] + (nStepER2 * x);
					bigER2[pos] = val;
					var val = valuesC[4] + (nStepGD * x);
					bigGD[pos] = val;
					var val = valuesC[5] + (nStepWD * x);
					bigWD[pos] = val;
				}
			}
		}

		//place current date
		objDate = new Date(dateC);
		var idx = Math.floor((objDate - objStart) / (1000*60*60*24));
		bigLABELS[idx] = dateC;
		bigED1[idx] = valuesC[0];
		bigED2[idx] = valuesC[1];
		bigER1[idx] = valuesC[2];
		bigER2[idx] = valuesC[3];
		bigGD[idx] = valuesC[4];
		bigWD[idx] = valuesC[5];
	}

	return [bigLABELS, bigED1, bigED2, bigER1, bigER2, bigGD, bigWD];
}

function createChartDataCURVE(data)
{
	var dsED1 = createDatasetLINE(false, "rgba(0,0,138,.4)", "Stroom I");
	var dsED2 = createDatasetLINE(false, "rgba(0,0,108,.4)", "Stroom II");
	var dsEDX = createDatasetLINE(false, "rgba(0,0,168, 1)", "Stroom (I+II)");
	
	var dsER1 = createDatasetLINE(false, "rgba(138,0,0,.4)", "Teruglevering I");
	var dsER2 = createDatasetLINE(false, "rgba(108,0,0,.4)", "Teruglevering II");
	var dsERX = createDatasetLINE(false, "rgba(168,0,0, 1)", "Teruglevering (I+II)");

	var dsGD  = createDatasetLINE(false, "rgba(0,138,0, 1)", "Gas");
	var dsWD  = createDatasetLINE(false, "rgba(138,0,0, 1)", "Water");

	//determine chart show/hide
	var fEnableDUALTARIF = false;
	var fEnableED = false;
	var fEnableER = false;
	var fEnableG = false;
	var fEnableW = false;
	for(var i=0; i<data.length; i++)
	{
		var metingC = data[i];
		var dateC = metingC.date;
		var valuesC = metingC.values;
		if( (valuesC[0]>0) || (valuesC[1]>0)) fEnableED = true;
		if( (valuesC[2]>0) || (valuesC[3]>0)) fEnableER = true;
		if( (valuesC[4]>0) ) fEnableG = true;
		if( (valuesC[5]>0) ) fEnableW = true;
		if( (valuesC[0]>0) && (valuesC[1]>0) ) fEnableDUALTARIF = true;
	}

	//generate one big day-based array
	const [bigLABELS, bigED1, bigED2, bigEDX, bigGD, bigWD] = generateBigArraysCURVE(data);

	//fill datasets
	dsED1.data = bigED1;
	dsED1.valid = true;
	dsED2.data = bigED2;
	dsED2.valid = true;
	dsEDX.data = bigEDX;
	dsEDX.valid = true;
	dsGD.data = bigGD;
	dsWD.data = bigWD;

	dcEX = createChartDataContainer();
	dcEX.labels = bigLABELS;
	if(fEnableED){
		if(dsED1.valid) dcEX.datasets.push(dsED1);
		if(fEnableDUALTARIF){
			if(dsED2.valid) dcEX.datasets.push(dsED2);
			if(dsEDX.valid) dcEX.datasets.push(dsEDX);
		}
	}
	if(fEnableER){
		if(dsER1.valid) dcEX.datasets.push(dsER1);
		if (fEnableDUALTARIF) {
			if (dsER2.valid) dcEX.datasets.push(dsER2);
			if (dsERX.valid) dcEX.datasets.push(dsERX);
		}
	}	
	dcEX.valid = fEnableED || fEnableER;

	dcGX = createChartDataContainer();
	dcGX.labels = bigLABELS;
	dcGX.datasets.push(dsGD);
	dcGX.valid = fEnableG;

	dcWX = createChartDataContainer();
	dcWX.labels = bigLABELS;
	dcWX.datasets.push(dsWD);
	dcWX.valid = fEnableW;

	listMONTHS = extractDataForMonths(bigLABELS, bigED1, bigED2, bigGD, bigWD);

	return [dcEX, dcGX, dcWX];
}

//copy all readings to a BIG day array and calculate all intermediate readings
function generateBigArraysCURVE(data)
{
	var objToday = new Date();
	var dateStart = data[0].date;
	var objStart = new Date(dateStart);
	var nDays = Math.floor((objToday - objStart) / (1000*60*60*24));
	//console.log(objToday, objStart, dateStart, nDays);

	var bigLABELS = new Array(nDays);
	fillArrayNULL(bigLABELS);
	var bigED1 = structuredClone(bigLABELS);
	var bigED2 = structuredClone(bigLABELS);
	var bigEDX = structuredClone(bigLABELS);
	var bigGD = structuredClone(bigLABELS);
	var bigWD = structuredClone(bigLABELS);

	//create month labels
	generateMonthTicks(bigLABELS, objStart, objToday);

	for( var i=0; i<data.length; i++ )
	{
		//current moment
		var metingC = data[i];
		var dateC = metingC.date;
		var valuesC = metingC.values;
		var nEDX0 = valuesC[0] + valuesC[1];
		
		if((i+1)<data.length)
		{
			//console.log(i, data[i+1]);

			//next moment
			var metingN = data[i+1];
			var dateN = metingN.date;
			var valuesN = metingN.values;

			//calc days diff
			objDateC = new Date(dateC);
			objDateN = new Date(dateN);
			var nDays = Math.floor((objDateN - objDateC) / (1000*60*60*24));
			var nOffset = Math.floor((objDateC - objStart) / (1000*60*60*24));

			listPE = calculateMonthPercentages( listValuesCeilingE );
			listPG = calculateMonthPercentages( listValuesCeilingG );
			//console.log(listPE);
			//console.log(listPG);

			var nTotalED1 = valuesN[0] - valuesC[0];
			var nTotalED2 = valuesN[1] - valuesC[1];
			var nTotalG   = valuesN[4] - valuesC[4];
			listEM1 = calculateMonthSteps(listPE, objDateC, objDateN, nTotalED1);
			listEM2 = calculateMonthSteps(listPE, objDateC, objDateN, nTotalED2);
			listGM  = calculateMonthSteps(listPG, objDateC, objDateN, nTotalG);

			//calc stepsize for all resources			
			var nStepWD =  (valuesN[5] - valuesC[5]) / nDays;

			//apply diffs per day
			var nTED1=valuesC[0];
			var nTED2=valuesC[1];
			var nTGD=valuesC[4];
			for(var x=0; x<nDays; x++)
			{
				var pos = x+nOffset;

				nTED1 += listEM1[x];
				nTED2 += listEM2[x];
				nTGD += listGM[x];

				bigED1[pos] = nTED1;
				bigED2[pos] = nTED2;				
				bigEDX[pos] = nTED1 + nTED2;
				bigGD[pos] = nTGD;

				var val = valuesC[5] + (nStepWD * x);
				bigWD[pos] = val;
			}
		}

		//place current date
		objDate = new Date(dateC);
		var idx = Math.floor((objDate - objStart) / (1000*60*60*24));
		bigLABELS[idx] = dateC;
		bigED1[idx] = valuesC[0];
		bigED2[idx] = valuesC[1];
		bigEDX[idx] = valuesC[0] + valuesC[1];		
		bigGD[idx] = valuesC[4];
		bigWD[idx] = valuesC[5];
	}

	return [bigLABELS, bigED1, bigED2, bigEDX, bigGD, bigWD];
}

//create month labels
function generateMonthTicks(bigLABELS, dateStart, dateToday)
{	
	for(var nYY=dateStart.getFullYear(); nYY<=dateToday.getFullYear(); nYY++)
	{
		for(var nMM=1; nMM<=12; nMM++)
		{
			dateX = new Date( nYY + "-" + nMM + "-1");
			//if date is between start and end
			if( (dateStart < dateX) && (dateX < dateToday) )
			{
				var pos = Math.floor((dateX - dateStart) / (1000*60*60*24));
				bigLABELS[pos] = formatDateYYYYMMDD(dateX);
			}
		}
	}
}

function calculateMonthPercentages(listV)
{
	var listP=[];
	//calc sum of all values
	var nTotal=0;
	for(var i=0; i<listV.length; i++) 
	{
		nTotal += listV[i];
	}
	
	//calc each percentage of listV
	//var nTotalP=0;
	for(var i=0; i<listV.length; i++) 
	{
		listP[i] = Number((listV[i] / nTotal).toFixed(3));
		//nTotalP += listP[i];
	}
	return listP;
}

function calculateMonthSteps(listP, dateS, dateE, nTotal)
{
//	console.log("calculateMonthSteps()");

	var dateX = new Date();
	var listM = new Array(12);
	fillArray(listM,0);	
	var nTime = dateS.getTime();
	var nDays = Math.floor((dateE - dateS) / (1000*60*60*24));
	var listV = new Array( Math.abs(nDays) );
	fillArray(listV,0);
	
	//calculate the days each month for this timespan
	for(var i=0; i<nDays; i++)
	{		
		dateX.setTime( nTime + (i*86400000) );
		var nMM = dateX.getMonth();
		listM[nMM] += 1;
	}

	//we now know how many days of each month we need, so calc
	//how much of that percentage is per day
	for(var i=0; i<nDays; i++)
	{
		dateX.setTime( nTime + (i*86400000) );
		var nMM = dateX.getMonth();		
		listV[i] = listP[nMM] / listM[nMM];
	}
	
	//now we know the percentage for that timespan per day, so calc
	//the sum of all percentages
	var sum=0;
	for(var x=0;x<listV.length; x++){sum += listV[x];}
	//console.log(sum);

	//now we know the total percentage, total and values, so
	//apply all on the values
	for(var i=0; i<nDays; i++)
	{		
		listV[i] = listV[i] * (nTotal / sum);
	}

	return listV;	
}












//====================================== UTILS ====================================================

function createDataset() {
	let ds = {};
	ds.labels = [];
	ds.datasets = [];
	return ds;
}

function createDatasetLINE(fill, color, label) {
	let ds = {};
	ds.fill = fill;
	ds.borderColor = color;
	ds.backgroundColor = color;
	ds.data = [];
	ds.label = label;
	ds.tension = 0.2;
	ds.spanGaps = true;
	ds.valid = false;
	//no stack
	return ds;
}

function createChartDataContainer() {
	let ds = {};
	ds.labels = [];
	ds.datasets = [];
	ds.valid = false;
	return ds;
}

function fillArray(array, value) {
	for (var idx = 0; idx < array.length; idx++) {
		array[idx] = value;
	}
}
function fillArrayNULL(array) {
	fillArray(array, null);
}

//accumelate list with values
function accumulateArray(listValues)
{
	var listACCU=[];
	var nTotal=0;	
	for (var i=0; i < listValues.length; i++) 
	{		
		listACCU.push(nTotal);
		//fix a gap in the data
		if(isNaN(nTotal)) nTotal = 0;
		nTotal += listValues[i];
	}
	//add remaining total
	listACCU.push(nTotal);
	return listACCU;
}

//create a history container with depth = 3
function createHistoryContainer()
{
	let dc = {};
	dc.current 	  ={name:"", valid:false, data: []};
	dc.previous	  ={name:"", valid:false, data: []};
	dc.preprevious={name:"", valid:false, data: []};
	return dc;
}

//create a 3 year datacontainer with months in year
function createHistoryContainerMIY(listLEGEND)
{
	var hcED = createHistoryContainer();
	hcED.current.name = listLEGEND[0];
	hcED.current.data = new Array(12);
	hcED.previous.name = listLEGEND[1];
	hcED.previous.data = new Array(12);
	hcED.preprevious.name = listLEGEND[2];
	hcED.preprevious.data = new Array(12);
	return hcED;
}

// convert from a 24 months ringbuffer to a 3 static, 12 months buffers.
function convertRingBufferToStaticHistoryContainerMIY(data)
{
	//calculate current year
	var nCurrentYYYY = new Date().getFullYear();
	var nCurrentYY = nCurrentYYYY - 2000;
	var nPreviousYY = nCurrentYY-1;
	var nPrePreviousYY = nCurrentYY-2;

	var listLEGEND = [];
	listLEGEND.push(nCurrentYYYY);
	listLEGEND.push(nCurrentYYYY-1);
	listLEGEND.push(nCurrentYYYY-2);

	var hcED = createHistoryContainerMIY(listLEGEND);
	var hcGD = createHistoryContainerMIY(listLEGEND);
	var hcWD = createHistoryContainerMIY(listLEGEND);

	//filter values ELEKTRA and store in correct month	
	for (var idx = 0; idx < data.data.length; idx++) 
	{
		var item = data.data[idx];
		var timestamp = item.date;
		var date = timestamp.substring(0, 6);
		var nYY = parseInt(date.substring(0, 2));
		var nMM = parseInt(date.substring(2, 4)) - 1;
		//var nDD = parseInt(date.substring(4, 6));
		//var nHH = parseInt(timestamp.substring(6, 8));

		//this is the corrupt dataslot, so skip
		if( idx == data.actSlot+1) continue;

		//select correct array based on the year
		if(nYY == nCurrentYY) 
		{
			hcED.current.valid = true;			
			hcED.current.data[nMM] = item.p_ed * 1.0;
			hcGD.current.data[nMM] = item.p_gd * 1.0;
			hcWD.current.data[nMM] = item.p_wd * 1.0;
		}
		if(nYY == nPreviousYY)
		{
			hcED.previous.valid = true;
			hcED.previous.data[nMM] = item.p_ed * 1.0;
			hcGD.previous.data[nMM] = item.p_gd * 1.0;
			hcWD.previous.data[nMM] = item.p_wd * 1.0;
		}
		if(nYY == nPrePreviousYY)
		{
			hcED.preprevious.valid = true;
			hcED.preprevious.data[nMM] = item.p_ed * 1.0;
			hcGD.preprevious.data[nMM] = item.p_gd * 1.0;
			hcWD.preprevious.data[nMM] = item.p_wd * 1.0;
		}
	} //end for

	return [hcED, hcGD, hcWD];
}

function Spinner(fShow) {
	if (fShow) {
		//document.getElementById("loader").removeAttribute('hidden');
		//setTimeout(() => { document.getElementById("loader").setAttribute('hidden', ''); }, 5000);
		console.log("spinner = on");
		//document.getElementById("xloader").style.display = "block";
	} 
	else {
		//document.getElementById("loader").setAttribute('hidden', '');
		console.log("spinner = off");
		//document.getElementById("xloader").style.display = "none";
	}
}

/* 
************************************************************************************************
*/