/*
***************************************************************************  
**  Program  : DSMRgraphics.js, part of DSMRloggerAPI
**  Version  : v4.3.0
**
**  Copyright (c) 2020 Willem Aandewiel
**
**  TERMS OF USE: MIT License. See bottom of file.                                                            
***************************************************************************      
*/

let TimerActual;
let actPoint        = 0;
let maxPoints       = 100;
var actLabel        = "-";
var gasDelivered    = 0;

function createChartDataContainer()
{
	let ds = {};	
	ds.labels = [];
	ds.datasets=[];
	return ds;
}

function createChartDataContainerWithStack()
{
	let ds = {};	
	ds.labels = [];
	ds.datasets=[];
  ds.stack = [];
	return ds;
}

function createDatasetBAR(fill, color, label, stack)
{
	let ds = {};
	ds.fill = fill;
	ds.borderColor = color;
	ds.backgroundColor = color;
	ds.data = [];
	ds.label = label;
	ds.stack = stack;
	return ds;
}

function createDatasetLINE(fill, color, label)
{
	let ds = {};
	ds.fill = fill;
	ds.borderColor = color;
	ds.backgroundColor = color;
	ds.data = [];
	ds.label = label;
	//no stack
	return ds;
}


var electrData = createChartDataContainer();
var actElectrData = createChartDataContainer();
var actGasData = createChartDataContainer();
var actWaterData = createChartDataContainer();

var actElectrOptions = {
		plugins: {labels: false},
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          yAxes: [{
            ticks : {
              beginAtZero : true
            },
            scaleLabel: {
              display: true,
              labelString: 'kilo Watt',
            },
          }]
        } // scales
      }; // options

var hourOptions = {
		plugins: {labels: false},
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          yAxes: [{
            ticks : {
              beginAtZero : true
            },
            scaleLabel: {
              display: true,
              labelString: 'Watt/Uur',
            },
          }]
        } // scales
      }; // options

var dayOptions = {
		plugins: {labels: false},
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          yAxes: [{
            ticks : {
              beginAtZero : true
            },
            scaleLabel: {
              display: true,
              labelString: 'kWh',
            },
          }]
        } // scales
      }; // options

var monthOptions = {
		plugins: {labels: false},
		responsive: true,
        maintainAspectRatio: true,
        scales: {
          yAxes: [{
            ticks : {
              beginAtZero : true
            },
            scaleLabel: {
              display: true,
              labelString: 'kWh',
            },
          }]
        } // scales
      }; // options

//----------------Chart's-------------------------------------------------------
var myElectrChart;
var myGasChart;
var myWaterChart;

  //============================================================================  
  function renderElectrChart(dataSet, options) {
    //console.log("Now in renderElectrChart() ..");
    
    if (myElectrChart) {
      myElectrChart.destroy();
    }

    var ctxElectr = document.getElementById("dataChart").getContext("2d");
    myElectrChart = new Chart(ctxElectr, {
      type: 'bar',
      data: dataSet,
      options: options,
    });
    
  } // renderElectrChart()

  //============================================================================  
  function renderWaterChart(dataSet, labelString) {
    //console.log("Now in renderGasChart() ..");
    
    if (myWaterChart) {
      myWaterChart.destroy();
    }

    var ctxWater = document.getElementById("waterChart").getContext("2d");
    myWaterChart = new Chart(ctxWater, {
      type: 'line',
      data: dataSet,
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          yAxes: [{
            ticks : {
              beginAtZero : true,
            },
            scaleLabel: {
              display: true,
              labelString: labelString,
            },
          }]
        } // scales
      } // options

    });
    
  } // renderWaterChart()
  
  //============================================================================  
  function renderGasChart(dataSet, labelString) {
    //console.log("Now in renderGasChart() ..");
    
    if (myGasChart) {
      myGasChart.destroy();
    }

    var ctxGas = document.getElementById("gasChart").getContext("2d");
    myGasChart = new Chart(ctxGas, {
      type: 'line',
      data: dataSet,
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          yAxes: [{
            ticks : {
              beginAtZero : true,
            },
            scaleLabel: {
              display: true,
              labelString: labelString,
            },
          }]
        } // scales
      } // options

    });
    
  } // renderGasChart()
  
  
  //============================================================================  
  function showHistGraph(data, type)
  {
    //console.log("Now in showHistGraph()..");
    copyDataToChart(data, type);
    if (type == "Hours")
          renderElectrChart(electrData, hourOptions);
    else  renderElectrChart(electrData, dayOptions);
    myElectrChart.update();
    
    //renderGasChart(gasData, actGasOptions);
    if (HeeftGas) {
		if ( Dongle_Config == "p1-q") renderGasChart(gasData, "kJ");
		else renderGasChart(gasData, "dm3");

		myGasChart.update();
		document.getElementById("gasChart").style.display   = "block";
    }

    //renderWaterChart(gasData, actGasOptions);
    if (HeeftWater) {
        renderWaterChart(waterData, "dm3");
    	myWaterChart.update();
		document.getElementById("waterChart").style.display = "block";
     } 
    //--- hide table
    document.getElementById("lastHours").style.display  = "none";
    document.getElementById("lastDays").style.display   = "none";
    document.getElementById("lastMonths").style.display = "none";
    //--- show canvas
	document.getElementById("dataChart").style.display  = Dongle_Config == "p1-q" ? "none" : "block";


  } // showHistGraph()
  
  
  //============================================================================  
  function showMonthsGraph(data, type)
  {
    //console.log("Now in showMonthsGraph()..");
    copyMonthsToChart(data, type);
    renderElectrChart(electrData, monthOptions);
    myElectrChart.update();
    //renderGasChart(gasData, actGasOptions);
    if (HeeftGas) {
		if ( Dongle_Config == "p1-q") renderGasChart(gasData, "kJ");
		else renderGasChart(gasData, "m3");
		myGasChart.update();
		document.getElementById("gasChart").style.display = "block";
    }  
	if (HeeftWater) {
		renderWaterChart(waterData, "m3");
		myWaterChart.update();
		document.getElementById("waterChart").style.display = "block";
	}
  
    //--- hide table
    document.getElementById("lastHours").style.display  = "none";
    document.getElementById("lastDays").style.display   = "none";
    document.getElementById("lastMonths").style.display = "none";
    //--- show canvas
	document.getElementById("dataChart").style.display  = Dongle_Config == "p1-q" ? "none" : "block";

    document.getElementById('mCOST').checked   = false;

  } // showMonthsGraph()
  
  
  //============================================================================  
  function copyDataToChart(data, type)
  {
    //console.log("Now in copyDataToChart()..");
    
    electrData = createChartDataContainerWithStack();
    gasData = createChartDataContainerWithStack();
    waterData  = createChartDataContainerWithStack();
    
    // idx 0 => ED
    var ds1 = createDatasetBAR('false', 'red', "Gebruikt", "STACK");
    electrData.datasets.push(ds1);

    // idx 0 => ER
    var ds2 = createDatasetBAR('false', 'green', "Opgewekt", "STACK");
    electrData.datasets.push(ds2);
    
    // idx 0 => GAS
    var ds3 = createDatasetLINE('false', 'blue', "Gas Gebruikt");
    if ( Dongle_Config == "p1-q") ds3.label = "Warmte Gebruikt";
    gasData.datasets.push(ds3);
 
    // idx 0 => WATER
    var ds4 = createDatasetLINE('false', 'blue', "Water Gebruikt");
    waterData.datasets.push(ds4);
      
    //      console.log("data.actSlot "+data.actSlot);
    //      console.log("data.data.length "+data.data.length);
  
    var p = 0;                
    for (let y=data.data.length + data.actSlot; y > data.actSlot+1; y--)
    {	
      var i = y % data.data.length;

    //console.log("i: "+i);            
    //console.log("y: "+y);
    //console.log("slotbefore: "+slotbefore);
    
      //console.log("["+i+"] label["+data.data[i].date+"] => slotbefore["+slotbefore+"]");
      // adds x axis labels (timestamp)
      electrData.labels.push(formatGraphDate(type, data.data[i].date)); 
      gasData.labels.push(formatGraphDate(type, data.data[i].date)); 
	    waterData.labels.push(formatGraphDate(type, data.data[i].date));
      if (type == "Hours")
      {
        if (data.data[i].p_edw >= 0) electrData.datasets[0].data[p]  = (data.data[i].p_edw *  1.0);
        if (data.data[i].p_erw >= 0) electrData.datasets[1].data[p]  = (data.data[i].p_erw * -1.0);
      }
      else
      {
        if (data.data[i].p_ed >= 0) electrData.datasets[0].data[p]  = (data.data[i].p_ed *  1.0).toFixed(3);
        if (data.data[i].p_er >= 0) electrData.datasets[1].data[p]  = (data.data[i].p_er * -1.0).toFixed(3);
      }
      if (data.data[i].p_gd  >= 0) gasData.datasets[0].data[p]      = (data.data[i].p_gd * 1000.0).toFixed(0);
      if (data.data[i].water  >= 0) waterData.datasets[0].data[p]   = (data.data[i].water * 1000.0).toFixed(0);
	    p++;
    } // for i ..

  } // copyDataToChart()
  
  
  //============================================================================  
  function copyMonthsToChart(data)
  {
    console.log("Now in copyMonthsToChart()..");
    
    electrData = createChartDataContainerWithStack();    
    gasData = createChartDataContainerWithStack();    
	  waterData = createChartDataContainerWithStack();
    
    // idx 0 => ED
    var ds1 = createDatasetBAR('false', 'red', "Gebruikt deze periode", "DP");
    electrData.datasets.push(ds1);

    // idx 1 => ER
    var ds2 = createDatasetBAR('false', 'green', "Opgewekt deze periode", "DP");
    electrData.datasets.push(ds2);
    
    // idx 2 => ED -1
    var ds3 = createDatasetBAR('false', 'orange', "Gebruikt vorige periode", "RP");
    electrData.datasets.push(ds3);

    // idx 3 => ER -1
    var ds4 = createDatasetBAR('false', 'lightgreen', "Opgewekt vorige periode", "RP");
    electrData.datasets.push(ds4);

    // idx 0 => GD
    var ds5 =  createDatasetLINE('false', "blue", "Gas deze periode");
    if(Dongle_Config == "p1-q") ds5.label = "Warmte deze periode";
    gasData.datasets.push(ds5);
    
    // idx 0 => GD -1
    var ds6 =  createDatasetLINE('false', "blue", "Gas vorige periode");
    if(Dongle_Config == "p1-q") ds5.label = "Warmte vorige periode";
    gasData.datasets.push(ds6);

    // idx 0 => WATER
    // idx 0 => WATER -1
    var ds7 =  createDatasetLINE('false', "blue", "Water deze periode");
    var ds8 =  createDatasetLINE('false', "lightblue", "Water vorige periode");
    waterData.datasets.push(ds7);
    waterData.datasets.push(ds8);    
    
    //console.log("there are ["+data.data.length+"] rows");
  
	  var start = data.data.length + data.actSlot ; //  maar 1 jaar ivm berekening jaar verschil
    var stop = start - 12;
    var i;
    var slotyearbefore = 0;
    var p        = 0;
  	for (let index=start; index>stop; index--)
    {  
      i = index % data.data.length;
      slotyearbefore = math.mod(i-12,data.data.length);

      electrData.labels.push(formatGraphDate("Months", data.data[i].date)); // adds x axis labels (timestamp)
      gasData.labels.push(formatGraphDate("Months", data.data[i].date)); // adds x axis labels (timestamp)
      waterData.labels.push(formatGraphDate("Months", data.data[i].date)); // adds x axis labels (timestamp)
      //electrData.labels.push(p); // adds x axis labels (timestamp)
      if (data.data[i].p_ed >= 0) {
      	electrData.datasets[0].data[p]  = (data.data[i].p_ed *  1.0).toFixed(3);
		    electrData.datasets[2].data[p]  = (data.data[slotyearbefore].p_ed *  1.0).toFixed(3);
	    }
      
	    if (data.data[i].p_er >= 0) {
	  	  electrData.datasets[1].data[p]  = (data.data[i].p_er * -1.0).toFixed(3);
      	electrData.datasets[3].data[p]  = (data.data[slotyearbefore].p_er * -1.0).toFixed(3);
      }
      
      if (data.data[i].p_gd >= 0) {
		    gasData.datasets[0].data[p]     = data.data[i].p_gd;
		    gasData.datasets[1].data[p]     = data.data[slotyearbefore].p_gd;
	    }
	    if (data.data[i].water >= 0) {
		    waterData.datasets[0].data[p]     = data.data[i].water;
		    waterData.datasets[1].data[p]     = data.data[slotyearbefore].water;
	    }
      p++;
    }

    //--- hide months Table
    document.getElementById("lastMonths").style.display = "none";
    //--- show canvas
    document.getElementById("dataChart").style.display  = "block";
    //     document.getElementById("gasChart").style.display   = "block";
    // 	document.getElementById("waterChart").style.display   = "block";
  } // copyMonthsToChart()
    
  
  //============================================================================  
  function copyActualToChart(data)
  {
    //console.log("Now in copyActualToChart()..");
    
    for (i in data)
    {
      //console.log("i ="+i+"] value["+data[i].value+"]");
      if (i == "timestamp")  
      {
        //console.log("i["+i+"] label["+data[i].value+"]");
        if (data[i].value == actLabel)
        {
          console.log("actLabel["+actLabel+"] == value["+data[i].value+"] =>break!");
          return;
        }
        actElectrData.labels.push(formatGraphDate("Actual", data[i].value)); // adds x axis labels (timestamp)
        actGasData.labels.push(formatGraphDate("Actual", data[i].value)); // adds x axis labels (timestamp)
        actLabel = data[i].value;
      }
      
      if (i == "power_delivered_l1") 
        actElectrData.datasets[0].data[actPoint]  = (data[i].value).toFixed(3);
      if (i == "power_delivered_l2") 
        actElectrData.datasets[1].data[actPoint]  = (data[i].value).toFixed(3);
      if (i == "power_delivered_l3") 
        actElectrData.datasets[2].data[actPoint]  = (data[i].value).toFixed(3);
      if (i == "power_returned_l1")  
        actElectrData.datasets[3].data[actPoint]  = (data[i].value * -1.0).toFixed(3);
      if (i == "power_returned_l2")  
        actElectrData.datasets[4].data[actPoint]  = (data[i].value * -1.0).toFixed(3);
      if (i == "power_returned_l3")  
        actElectrData.datasets[5].data[actPoint]  = (data[i].value * -1.0).toFixed(3);
      if (i == "gas_delivered") 
      {
        if (actPoint > 0)
              actGasData.datasets[0].data[actPoint] = ((data[i].value - gasDelivered) * 1000.0).toFixed(0);
        else  actGasData.datasets[0].data[actPoint] = 0.0;
        gasDelivered = data[i].value;
      }
    } // for i in data ..
    actPoint++;    
    
    if (actPoint > maxPoints) 
    {
      for (let s=0; s<6; s++)
      {
        actElectrData.labels.shift();
        actElectrData.datasets[0].data.shift();
        actElectrData.datasets[1].data.shift();
        actElectrData.datasets[2].data.shift();
        actElectrData.datasets[3].data.shift();
        actElectrData.datasets[4].data.shift();
        actElectrData.datasets[5].data.shift();
        actGasData.labels.shift();
        actGasData.datasets[0].data.shift();
        actWaterData.labels.shift();
        actWaterData.datasets[0].data.shift();
        actPoint--;
      } // for s ..
    } 
    
  } // copyActualToChart()

  
  //============================================================================  
  function initActualGraph()
  {
    //console.log("Now in initActualGraph()..");

    actElectrData = createChartDataContainerWithStack();
    actGasData = createChartDataContainerWithStack();
    
    // idx 0 => EDL1
    var ds1 = createDatasetBAR('false', 'red', "Gebruikt L1", "A");
    actElectrData.datasets.push(ds1);
    
    // idx 1 => EDL2
    var ds2 = createDatasetBAR('false', 'tomato', "Gebruikt L2", "A");
    actElectrData.datasets.push(ds2);
    
    // idx 2 => EDL3
    var ds3 = createDatasetBAR('false', 'salmon', "Gebruikt L3", "A");
    actElectrData.datasets.push(ds3);

    // idx 3 ERL1
    var ds4 = createDatasetBAR('false', 'yellowgreen', "Opgewekt L1", "A");
    actElectrData.datasets.push(ds4);
    
    // idx 4 => ERL2
    var ds5 = createDatasetBAR('false', 'springgreen', "Opgewekt L2", "A");
    actElectrData.datasets.push(ds5);
    
    // idx 5 => ERL3
    var ds6 = createDatasetBAR('false', 'green', "Opgewekt L3", "A");
    actElectrData.datasets.push(ds6);
    
    // idx 0 => GDT
    var ds7 = createDatasetLINE('false', 'blue', "Gas verbruikt");
    if(Dongle_Config == "p1-q") ds7.label = "Warmte verbruikt";
    actGasData.datasets.push(ds7);
    
    actPoint = 0;
  
  } // initActualGraph()
  
  
  //============================================================================  
  function showActualGraph()
  {
    if (activeTab != "bActualTab") return;

    //console.log("Now in showActualGraph()..");

    //--- hide Table
    document.getElementById("actual").style.display    = "none";
    //--- show canvas
    document.getElementById("dataChart").style.display = "block";
    document.getElementById("gasChart").style.display  = "block";
    
    renderElectrChart(actElectrData, actElectrOptions);
    myElectrChart.update();
    
    //renderGasChart(actGasData, actGasOptions);
    renderGasChart(actGasData, Dongle_Config == "p1-q" ? "GJ * 1000": "dm3" );

    gasChart.update();

  } // showActualGraph()
  
  
  //============================================================================  
  function formatGraphDate(type, dateIn) 
  {
    let dateOut = "";
    if (type == "Hours")
    {
      dateOut = "("+dateIn.substring(4,6)+") "+dateIn.substring(6,8);
    }
    else if (type == "Days")
      dateOut = [recidToWeekday(dateIn), dateIn.substring(4,6)+"-"+dateIn.substring(2,4)];
    else if (type == "Months")
    {
      let MM = parseInt(dateIn.substring(2,4))
      dateOut = monthNames[MM];
    }
    else if (type == "Actual")
    {
      dateOut = dateIn.substring(6,8)+":"+dateIn.substring(8,10)+":"+dateIn.substring(10,12);
    }
    else
      dateOut = "20"+dateIn.substring(0,2)+"-"+dateIn.substring(2,4)+"-"+dateIn.substring(4,6)+":"+dateIn.substring(6,8);
    
    return dateOut;
  }
  
  
/*
***************************************************************************
*
* Permission is hereby granted, free of charge, to any person obtaining a
* copy of this software and associated documentation files (the
* "Software"), to deal in the Software without restriction, including
* without limitation the rights to use, copy, modify, merge, publish,
* distribute, sublicense, and/or sell copies of the Software, and to permit
* persons to whom the Software is furnished to do so, subject to the
* following conditions:
*
* The above copyright notice and this permission notice shall be included
* in all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
* OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
* MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
* IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
* CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT
* OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR
* THE USE OR OTHER DEALINGS IN THE SOFTWARE.
* 
***************************************************************************
*/
