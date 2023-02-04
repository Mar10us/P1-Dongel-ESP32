/*
	
	P1-Dongle Pro
	plugin by Mar10us
*/

const APIGW = window.location.protocol+'//'+window.location.host+'/api/';
const URL_HISTORY_DAYS = APIGW + "../RNGdays.json";
const URL_HISTORY_MONTHS = APIGW + "../RNGmonths.json";
const listValuesCeilingE = [339, 280, 267, 207, 181, 159, 161, 176, 199, 266, 306, 356];
const listValuesCeilingG = [221, 188, 159,  86,  35,  19,  17,  17,  24,  81, 146, 207];

let timerRefresh = 0;
let sCurrentChart = "MONTHS";

var objChart1;
var objChart2;

function createCharts() {
	const ctx1 = document.getElementById('myChart1').getContext('2d');
	const ctx2 = document.getElementById('myChart2').getContext('2d');

	objChart1 = new Chart(ctx1, {
		type: 'line',
		data: [],
		options: {
			plugins: {
				title: {
					display: true,
					text: 'BURNUP ELEKTRA',
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
	});
	objChart2 = new Chart(ctx2, {
		type: 'line',
		data: {},
		options: {
			plugins: {
				legend: {
					position: 'right',
				},
				title: {
					display: true,
					text: 'BURNUP GAS',
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
	});
	console.log("chart ready");
}

function createChartDataContainer() {
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
	//no stack
	return ds;
}

window.onload = fnBootstrap;

function fnBootstrap() 
{
	createCharts();

	//handle #
	if (location.hash)
	{
		console.log(location.hash);
		subpage = location.hash.slice(1);
		switch(subpage){
			case "months": sCurrentChart = "MONTHS"; break;
			case "days": sCurrentChart = "DAYS"; break;
		}
	}

	//refresh and schedule every 60sec
	refreshData();
	clearInterval(timerRefresh);
    timerRefresh = setInterval(refreshData, 60 * 1000); // repeat every 60s
}

function refreshData()
{
	switch(sCurrentChart){
		case "MONTHS": getMonths(); break;
		//case "DAYS": getDays(); break;
	}
}

function getMonths()
{
	console.log("fetch(" + URL_HISTORY_MONTHS + ")");
	fetch(URL_HISTORY_MONTHS, {"setTimeout": 5000})
		.then(function (response) {
			if (response.status !== 200) {
				throw new Error(response.status);
			} else {
				return response.json();
			}
		})
		.then(function (json) {
			parseMonths(json);
		})
		.catch(function (error) {
			var p = document.createElement('p');
			p.appendChild(
				document.createTextNode('Error: ' + error.message)
			);
			console.log(error);
			//alert_message("Fout bij ophalen van de historische daggegevens");
		});
}

function parseMonths(json)
{
	console.log("parseMonth");

	data = expandData_v2(json);
	
	//show months
	showMonths(data);
}

function expandData_v2(dataIN) {
	console.log("expandData_v2()");
	console.log(dataIN);

	var i;
	var slotbefore;
	var AvoidSpikes = true;

	//deepcopy dataIN to dataOUT
	var data = structuredClone(dataIN);

	for (let x = dataIN.data.length + dataIN.actSlot; x > dataIN.actSlot; x--) 
	{
		i = x % dataIN.data.length;
		slotbefore = math.mod(i - 1, dataIN.data.length);

		var costs = 0;
		if (x != dataIN.actSlot) {
			if (AvoidSpikes && (data.data[slotbefore].values[0] == 0))
				data.data[slotbefore].values = data.data[i].values;//avoid gaps and spikes

			data.data[i].p_ed = ((data.data[i].values[0] + data.data[i].values[1]) - (data.data[slotbefore].values[0] + data.data[slotbefore].values[1])).toFixed(3);
			data.data[i].p_edw = (data.data[i].p_ed * 1000).toFixed(0);
			data.data[i].p_er = ((data.data[i].values[2] + data.data[i].values[3]) - (data.data[slotbefore].values[2] + data.data[slotbefore].values[3])).toFixed(3);
			data.data[i].p_erw = (data.data[i].p_er * 1000).toFixed(0);
			data.data[i].p_gd = (data.data[i].values[4] - data.data[slotbefore].values[4]).toFixed(3);
			data.data[i].water = (data.data[i].values[5] - data.data[slotbefore].values[5]).toFixed(3);
		}
		else {
			data.data[i].p_ed = (data.data[i].values[0] + data.data[i].values[1]).toFixed(3);
			data.data[i].p_edw = (data.data[i].p_ed * 1000).toFixed(0);
			data.data[i].p_er = (data.data[i].values[2] + data.data[i].values[3]).toFixed(3);
			data.data[i].p_erw = (data.data[i].p_er * 1000).toFixed(0);
			data.data[i].p_gd = (data.data[i].values[4]).toFixed(3);
			data.data[i].water = (data.data[i].values[5]).toFixed(3);
		}
	} //endfor
	console.log(data);
	console.log("~expandData_v2()");
	return data;
} // expandData_v2()

function showMonths(histdata)
{
	const [dcE1, dcG1] = createChartDataContainerBURNUP(histdata);
	
	objChart1.data = dcE1;
	objChart1.update();
	
	objChart2.data = dcG1;
	objChart2.update();
}

//=============================TODO: REFACTOR=============================================================

function createDataset() {
	let ds = {};
	ds.labels = [];
	ds.datasets = [];
	return ds;
}

function getDays() {
	console.log("fetch(" + URL_HISTORY_DAYS + ")");
	const other_params = {
		setTimeout: 5000
	};
	fetch(URL_HISTORY_DAYS, other_params)
		.then(function (response) {
			if (response.status !== 200) {
				throw new Error(response.status);
			} else {
				return response.json();
			}
		})
		.then(function (json) {
			updateDays(testdata);
		})
		.catch(function (error) {
			var p = document.createElement('p');
			p.appendChild(
				document.createTextNode('Error: ' + error.message)
			);
			console.log(error);
			//alert_message("Fout bij ophalen van de historische daggegevens");
		});
}

function updateDays(json) {
	console.log(json);

	nStart = 6440;
	ds1 = createBreakdown1(nStart, json);
	ds2 = createBreakdown2(nStart, json);

	myChart1.data = ds1;
	myChart1.update();

	myChart2.data = ds2;
	myChart2.update();
}

function createBreakdown1(nStart, json) {
	//get date and hour from json
	var current = json.data[json.actSlot];
	var timestamp = current.date;
	var date = timestamp.substring(0, 6);
	var hour = timestamp.substring(6, 8);

	//get daycount for month
	var nDaycount = 31;

	//get prijsplafond for month
	var nCeilingMonth = 288;

	//prepare arrays and labels
	var ceiling = [nDaycount + 1];
	var labelsx = [nDaycount + 1];
	var values = [nDaycount + 1];
	var valuesPREV = [nDaycount + 1];
	for (i = 0; i < nDaycount + 1; i++) {
		ceiling[i] = null;
		values[i] = null;
		valuesPREV[i] = null;
		labelsx[i] = i.toString();
	}
	ceiling[0] = 0;
	ceiling[nDaycount] = nCeilingMonth;

	var offset = json.actSlot;
	//values[0]=0;
	//fill array with daily values
	for (var i = 0; i < 14; i++) {
		//calc offset for start ringbuffer
		var idx = (i + offset + 1 - 14 + json.data.length) % json.data.length;

		//get timestamp and skip if invalid
		var timestamp = json.data[idx].date;
		if (timestamp == "20000000") continue;

		//split timestamp
		var date = "20" + timestamp.substring(0, 6);
		var hour = timestamp.substring(6, 8);

		//get values
		var vals = json.data[idx].values;

		//values for gas / elektra
		var nGAS = vals[4];
		var nELEKTRA = vals[0] + vals[1];

		//get month
		var nMM = parseInt(date.substring(4, 6));
		//TODO: place in thismonth or previous month dataset
		//if nMM == nThisMM
		//values[j] = nGAS - nStart
		//else
		//valuesPREV = nGas - nStart;

		//get day of the month
		var j = parseInt(date.substring(6, 8)) + 1;
		//write value to correct index
		values[j] = nGAS - nStart;
	}

	console.log(labelsx);
	console.log(ceiling);
	console.log(values);

	//create a datacontainer
	var ds = createDataset();
	ds.labels = labelsx;

	//create datasets
	var ds1 = createDatasetLINE(false, 'blue', "verbruik");
	var ds2 = createDatasetLINE(false, 'red', "plafond");

	//some extra settings
	ds1.data = values;
	ds1.spanGaps = true;
	ds2.data = ceiling;
	ds2.spanGaps = true;
	ds2.fill = "end";
	ds2.backgroundColor = 'LightPink';

	//add to datacontainer
	ds.datasets.push(ds1);
	ds.datasets.push(ds2);

	//return
	return ds;
}

function createBreakdown2(nStart, json) {
	//get date and hour from json
	current = json.data[json.actSlot];
	timestamp = current.date;
	date = timestamp.substring(0, 6);
	hour = timestamp.substring(6, 8);

	//get daycount for month
	var nDaycount = 31;

	//get prijsplafond for month
	var nCeilingMonth = 288;

	//prepare arrays and labels
	nEntries = nDaycount + 1;
	var ceiling = [nEntries];
	var labelsx = [nEntries];
	var values = [nEntries];
	for (i = 0; i < nEntries; i++) {
		ceiling[i] = null;
		values[i] = null;
		labelsx[i] = i.toString();
	}
	ceiling[0] = nCeilingMonth;
	ceiling[nDaycount] = 0;

	var offset = json.actSlot;
	nBreakDown = nCeilingMonth;
	//fill array with daily values
	for (var i = 0; i < 14; i++) {
		//calc offset for start ringbuffer
		var idx = (i + offset + 1 - 14 + json.data.length) % json.data.length;

		//get timestamp and skip if invalid
		var timestamp = json.data[idx].date;
		if (timestamp == "20000000") continue;

		//split timestamp
		var date = "20" + timestamp.substring(0, 6);
		var hour = timestamp.substring(6, 8);

		//get values
		var vals = json.data[idx].values;

		//values for gas / elektra
		var nGAS = vals[4];
		var nELEKTRA = vals[0] + vals[1];

		//get day of the month
		var j = parseInt(date.substring(6, 8)) + 1;
		//write value to correct index
		var nDayValue = nGAS - nStart;
		nBreakDown = nCeilingMonth - nDayValue;
		values[j] = nBreakDown;
	}

	//create a datacontainer
	var ds = createDataset();
	ds.labels = labelsx;

	//create datasets
	var ds1 = createDatasetLINE(false, 'blue', "verbruik");
	var ds2 = createDatasetLINE(false, 'red', "plafond");

	//some extra settings
	ds1.data = values;
	ds1.spanGaps = true;
	ds2.data = ceiling;
	ds2.spanGaps = true;
	ds2.fill = 'start';
	ds2.backgroundColor = 'LightPink';

	//add to datacontainer
	ds.datasets.push(ds1);
	ds.datasets.push(ds2);

	//return
	return ds;
}


//
//============================================ CHECKED ====================================================
//
function fillArray(array, value) {
	for (var idx = 0; idx < array.length; idx++) {
		array[idx] = value;
	}
}
function fillArrayNULL(array) {
	fillArray(array, null);
}

//create chartdata for the history ringbuffer MONTHS
function createChartDataContainerBURNUP(data) 
{
	//labels for a year
	var listLABELS = ["0", "JAN", "FEB", "MRT", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
	//calculate chart data
	const [hcED, hcGD, hcWD] = convertRingBufferToStaticHistoryContainerMIY(data);
	//create datasets for ELEKTRA
	var dcE1 = createDataContainerBURNUP(listLABELS, listValuesCeilingE, hcED);
	//create datasets for GAS
	var dcG1 = createDataContainerBURNUP(listLABELS, listValuesCeilingG, hcGD);
	//create datasets for WATER
	//var dcW1 = createDataContainerBURNUP(listLABELS, listValuesCeilingW, hcWD);
	return [dcE1,dcG1];
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

//accumelate the historycontainer and create a dataset
function createDataContainerBURNUP(listLABELS, listValuesCeiling, hcDELIVERED)
{	
	console.log("createDataContainerBURNUP()");

	//fill ceiling
	var listCeiling = accumulateArray(listValuesCeiling);

	//calculate accumulated months
	var hcBURNUP = structuredClone(hcDELIVERED);
	hcBURNUP.current.data = accumulateArray(hcDELIVERED.current.data);
	hcBURNUP.previous.data = accumulateArray(hcDELIVERED.previous.data);
	hcBURNUP.preprevious.data = accumulateArray(hcDELIVERED.preprevious.data);

	var dcBX = createDatasetsForBURNUP(listLABELS, hcBURNUP, listCeiling);
	return dcBX;
}

//create a dataset for the historycontainer, with labels and ceiling
function createDatasetsForBURNUP(listLABELS, hcBURNUP, listCeiling)
{
	//create a datacontainer
	var dsBreakdown = createChartDataContainer();
	dsBreakdown.labels = listLABELS;

	//create datasets
	var dsE1 = createDatasetLINE(false, 'rgba(0, 0, 139, 1)', hcBURNUP.current.name);
	var dsE2 = createDatasetLINE(false, 'rgba(0, 0, 139, .25)', hcBURNUP.previous.name);
	var dsE3 = createDatasetLINE(false, 'rgba(0, 0, 139, .0625)', hcBURNUP.preprevious.name);
	var dsE4 = createDatasetLINE(false, 'red', "plafond");

	//attach data
	dsE1.data = hcBURNUP.current.data;
	dsE2.data = hcBURNUP.previous.data;
	dsE3.data = hcBURNUP.preprevious.data;

	//set additional config
	dsE3.spanGaps = true;		//this dataset is not complete, so straighten line from 0 to first datapoint
	
	//hide previous years by default	
	dsE2.hidden = true;
	dsE3.hidden = true;

	//config for ceiling
	dsE4.data = listCeiling;
	dsE4.fill = "end";
	dsE4.backgroundColor = 'rgba(255, 0, 0, .125)';
	
	//add datasets to chartdata
	dsBreakdown.datasets.push(dsE1);
	dsBreakdown.datasets.push(dsE2);
	dsBreakdown.datasets.push(dsE3);
	dsBreakdown.datasets.push(dsE4);

	//return chartdata
	return dsBreakdown;
}