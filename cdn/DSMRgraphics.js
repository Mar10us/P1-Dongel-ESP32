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

//store last 90 TELEGRAM objects
const MAX_TELEGRAM_HISTORY = 15 * 6;
var listTELEGRAMS = [];
const listChartTypes = [
  {type:"SLIDING_REVERSED", name:"Achteruit Schuivend"}, 
  {type:"STATIC_NORMAL", name:"Normaal Vast"}
];

//let TimerActual;
//let actPoint        = 0;
//let maxPoints       = 100;
//var actLabel        = "-";
//var gasDelivered    = 0;
var fGraphsReady    = false;
var listTELEGRAMS   = [];
//var sGraphMode = "REVERSED_SLIDING";
var sGraphMode = "NORMAL_STATIC";

var electrData = createChartDataContainer();
var actElectrData = createChartDataContainer();
var actGasData = createChartDataContainer();
var actWaterData = createChartDataContainer();

//helper functions for datacontainers and datasets
function createChartDataContainer(){
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
  ds.type= "line";
	ds.fill = fill;
	ds.borderColor = color;
	ds.backgroundColor = color;
	ds.data = [];
	ds.label = label;
	//no stack
	return ds;
}

var optionsGLOBAL = {
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
        labelString: '---',
      },
    }]
  } // scales
}; // optionsGLOBAL

var optionsELEKTRA = structuredClone(optionsGLOBAL);
optionsELEKTRA.scales.yAxes[0].scaleLabel.labelString = "kWh";

var actElectrOptions = structuredClone(optionsGLOBAL);
actElectrOptions.scales.yAxes[0].scaleLabel.labelString = "kilo Watt";

var hourOptions = structuredClone(optionsGLOBAL);
hourOptions.scales.yAxes[0].scaleLabel.labelString = "Watt/Uur";

var dayOptions = structuredClone(optionsGLOBAL);
dayOptions.scales.yAxes[0].scaleLabel.labelString = "kWh";

var monthOptions = structuredClone(optionsGLOBAL);
monthOptions.scales.yAxes[0].scaleLabel.labelString = "kWh";

var optionsGAS = structuredClone(optionsGLOBAL);
optionsGAS.scales.yAxes[0].scaleLabel.labelString = "m3";

var optionsWATER = structuredClone(optionsGLOBAL);
optionsWATER.scales.yAxes[0].scaleLabel.labelString = "m3";


//----------------Chart's-------------------------------------------------------
var myElectrChart;
var myGasChart;
var myWaterChart;

function createChartsGRAPH()
{
  var ctx = null;
  ctx = document.getElementById("dataChart").getContext("2d");
  myElectrChart = new Chart(ctx, { type: 'bar', data: [], options: optionsELEKTRA});
  ctx = document.getElementById("gasChart").getContext("2d");
  myGasChart = new Chart(ctx, { type: 'line', data: [], options: optionsGAS });
  ctx = document.getElementById("waterChart").getContext("2d");
  myWaterChart = new Chart(ctx, { type: 'line', data: [], options: optionsWATER });
  fGraphsReady = true;
}
function ensureChartsReady()
{
  if( !fGraphsReady) createChartsGRAPH();
}

//function to set new type of graphs
function setGraphVersion(nVersion)
{
  if( nVersion==1) sGraphMode = "REVERSED_SLIDING";
  if( nVersion==2) sGraphMode = "NORMAL_STATIC";
}

//ENTRY point from DSMRindex.js for HOURS, DAYS and MONTHS
function showHistGraph(data, type)
{
  switch(sGraphMode)
  {
    case "REVERSED_SLIDING":
      switch(type)
      {
        case "Hours":   //fall through
        case "Days":    showGraphHistory(data, type); break;
        case "Months":  showGraphMonths(data, type); break;
      }
      break;

    case "NORMAL_STATIC":
      switch(type)
      {
        case "Hours":   showGraphSTATIC_HOURS(data); break;
        case "Days":    showGraphSTATIC_DAYS(data); break;
        case "Months":  showGraphSTATIC_MONTHS(data); break;
      }        
      break;
  }
  return true;
}

/*
//============================================================================
*/

  //show Graph for HOURS and DAYS (original)
  function showGraphHistory(data, type)
  {
    ensureChartsReady();

    copyDataToChart(data, type);

    var labelString = "kWh";
    if( type == "Hours") labelString = "Watt";
    myElectrChart.options.scales.yAxes[0].scaleLabel.labelString = labelString;
    myElectrChart.data = electrData;
    myElectrChart.update();
    
    if (HeeftGas) {           
      myGasChart.data = gasData;
      labelString = "m3";
      if( type == "Hours") labelString = "dm3";
      if ( Dongle_Config == "p1-q") labelString = "kJ";
      myGasChart.options.scales.yAxes[0].scaleLabel.labelString = labelString;
      myGasChart.update();
      document.getElementById("gasChart").style.display   = "block";
    }

    if (HeeftWater) {
      myWaterChart.data = waterData;
      labelString = "m3";
      if( type == "Hours") labelString = "dm3";
      myWaterChart.options.scales.yAxes[0].scaleLabel.labelString = labelString;
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
    
  //show graph for MONTHS (original)
  function showGraphMonths(data, type)
  {
    ensureChartsReady();
    
    //console.log("Now in showMonthsGraph()..");
    copyMonthsToChart(data, type);
    myElectrChart.data = electrData;
    myElectrChart.update();

    if (HeeftGas) {
      myGasChart.data = gasData;
      var labelString = SQUARE_M_CUBED;
      if ( Dongle_Config == "p1-q") labelString = "kJ";
      myGasChart.options.scales.yAxes[0].scaleLabel.labelString = labelString;
      myGasChart.update();
      document.getElementById("gasChart").style.display = "block";
    }

    if (HeeftWater) {
      myWaterChart.data = waterData;
      myWaterChart.options.scales.yAxes[0].scaleLabel.labelString = SQUARE_M_CUBED;
      myWaterChart.update();
      document.getElementById("waterChart").style.display = "block";
    }
  
    //--- hide table
    document.getElementById("lastHours").style.display  = "none";
    document.getElementById("lastDays").style.display   = "none";
    document.getElementById("lastMonths").style.display = "none";
    //--- show canvas
	  document.getElementById("dataChart").style.display  = Dongle_Config == "p1-q" ? "none" : "block";
    //reset cost checkbox
    document.getElementById('mCOST').checked   = false;

  } // showMonthsGraph()
    
  //============================================================================  
  function copyDataToChart(data, type)
  {
    electrData = createChartDataContainerWithStack();
    gasData = createChartDataContainerWithStack();
	  waterData = createChartDataContainerWithStack();
    
    //create datasets ED & ER
    var dsED1 = createDatasetBAR('false', 'red',    "Gebruikt T1", "STACK");
    var dsED2 = createDatasetBAR('false', 'orange', "Gebruikt T2", "STACK");
    var dsER1 = createDatasetBAR('false', 'green',  "Opgewekt T1", "STACK");
    var dsER2 = createDatasetBAR('false', 'lightgreen', "Opgewekt T2", "STACK");
    
    // GAS
    var dsG1 = createDatasetLINE('false', 'blue', "Gas Gebruikt");
    if ( Dongle_Config == "p1-q") dsG1.label = "Warmte Gebruikt";
   
    // WATER
    var dsW1 = createDatasetLINE('false', 'blue', "Water Gebruikt");
  
    var p = 0;
    var fTarif1 = false;
    var fTarif2 = false;
    //copy all data from entries to correct dataset
    for (let y=data.data.length + data.actSlot; y > data.actSlot+1; y--)
    {	
      var i = y % data.data.length;
    
      // adds x axis labels (timestamp)
      electrData.labels.push(formatGraphDate(type, data.data[i].date)); 
      gasData.labels.push(   formatGraphDate(type, data.data[i].date)); 
	    waterData.labels.push( formatGraphDate(type, data.data[i].date));

      //add data to the sets
      var nFactor = 1.0;
      if (type == "Hours") nFactor = 1000.0;
      if (data.data[i].p_edt1 >= 0){dsED1.data[p] = (data.data[i].p_edt1 * nFactor); fTarif1 = true;}
      if (data.data[i].p_edt2 >= 0){dsED2.data[p] = (data.data[i].p_edt2 * nFactor); fTarif2 = true;}
      if (data.data[i].p_ert1 >= 0) dsER1.data[p] = (data.data[i].p_ert1 * nFactor * -1.0);
      if (data.data[i].p_ert2 >= 0) dsER2.data[p] = (data.data[i].p_ert2 * nFactor * -1.0);
      if (data.data[i].p_gd   >= 0)  dsG1.data[p] = (data.data[i].p_gd   * 1000.0);
      if (data.data[i].water  >= 0)  dsW1.data[p] = (data.data[i].water  * 1000.0);
	    p++;
    } // for i ..

    //limit all numbers in array to 3 decimals
    applyArrayFixedDecimals(dsED1.data, 3);
    applyArrayFixedDecimals(dsED2.data, 3);
    applyArrayFixedDecimals(dsER1.data, 3);
    applyArrayFixedDecimals(dsER2.data, 3);
    applyArrayFixedDecimals(dsG1.data, 0);
    applyArrayFixedDecimals(dsW1.data, 0);

    //push all the datasets to the container
    electrData.datasets.push(dsED1);
    if( Injection) electrData.datasets.push(dsER1);
    if( fTarif1 && fTarif2)
    {
      electrData.datasets.push(dsED2);
      if( Injection) electrData.datasets.push(dsER2);
    }
    gasData.datasets.push(dsG1);
    waterData.datasets.push(dsW1);

  } // copyDataToChart()
    
  //============================================================================  
  function copyMonthsToChart(data)
  {
    var fDoubleTarif = true;
    console.log("Now in copyMonthsToChart()..");

    electrData= createChartDataContainerWithStack();    
    gasData   = createChartDataContainerWithStack();    
	  waterData = createChartDataContainerWithStack();

    listPeriods = ["Gebruikt deze periode", "Gebruikt vorige periode", "Opgewekt T1 deze periode", "Opgewekt T1 vorige periode"];
    
    // ED this & prev
    var dsED1 = createDatasetBAR('false', 'rgba(255,0,  0, 1)', "Gebruikt T1 deze periode",   "DP");    
    var dsED2 = createDatasetBAR('false', 'rgba(255,0,  0,.5)', "Gebruikt T1 vorige periode", "RP");
    var dsED3 = createDatasetBAR('false', 'rgba(255,165,0, 1)', "Gebruikt T2 deze periode",   "DP");
    var dsED4 = createDatasetBAR('false', 'rgba(255,165,0,.5)', "Gebruikt T2 vorige periode", "RP");

    // ER this & prev
    var dsER1 = createDatasetBAR('false', 'rgba(0, 255,0, 1)', "Opgewekt T1 deze periode",  "DP");
    var dsER2 = createDatasetBAR('false', 'rgba(0, 255,0,.5)', "Opgewekt T1 vorige periode","RP");
    var dsER3 = createDatasetBAR('false', 'rgba(74,240,0, 1)', "Opgewekt T2 deze periode",  "DP");
    var dsER4 = createDatasetBAR('false', 'rgba(74,240,0,.5)', "Opgewekt T2 vorige periode","RP");

    // GD this & prev
    var dsGD1 =  createDatasetLINE('false', "rgba(0,  0,138, 1)", "Gas deze periode");
    var dsGD2 =  createDatasetLINE('false', "rgba(0,128,255, 1)", "Gas vorige periode");
    if(Dongle_Config == "p1-q"){ 
      dsGD1.label = "Warmte deze periode";
      dsGD2.label = "Warmte vorige periode";
    }

    // WD
    var dsW1 =  createDatasetLINE('false', "rgba(0,  0,138, 1)", "Water deze periode");
    var dsW2 =  createDatasetLINE('false', "rgba(0,128,255, 1)", "Water vorige periode");
  
    //
    // fill datasets
    //
	  var start = data.data.length + data.actSlot ; //  maar 1 jaar ivm berekening jaar verschil
    var stop = start - 12;
    var i;
    var slotyearbefore = 0;
    var p        = 0;
  	for (let index=start; index>stop; index--)
    {  
      i = index % data.data.length;
      slotyearbefore = math.mod(i-12,data.data.length);

      //add labels
      electrData.labels.push(formatGraphDate("Months", data.data[i].date));
      gasData.labels.push(   formatGraphDate("Months", data.data[i].date));
      waterData.labels.push( formatGraphDate("Months", data.data[i].date));
      
      //add data to the datatsets
      if (data.data[i].p_edt1 >= 0) {
      	dsED1.data[p] = (data.data[i].p_edt1 *  1.0);
		    dsED2.data[p] = (data.data[slotyearbefore].p_edt1 *  1.0);
	    }
      if (data.data[i].p_edt2 >= 0) {
      	dsED3.data[p] = (data.data[i].p_edt2 *  1.0);
		    dsED4.data[p] = (data.data[slotyearbefore].p_edt2 *  1.0);
	    }
      
	    if (data.data[i].p_ert1 >= 0) {
	  	  dsER1.data[p] = (data.data[i].p_ert1 * -1.0);
      	dsER2.data[p] = (data.data[slotyearbefore].p_ert1 * -1.0);
      }
      if (data.data[i].p_ert2 >= 0) {
	  	  dsER3.data[p] = (data.data[i].p_ert2 * -1.0);
      	dsER4.data[p] = (data.data[slotyearbefore].p_ert2 * -1.0);
      }
      
      if (data.data[i].p_gd >= 0) {
		    dsGD1.data[p] = data.data[i].p_gd;
		    dsGD2.data[p] = data.data[slotyearbefore].p_gd;
	    }
	    if (data.data[i].water >= 0) {
		    dsW1.data[p] = data.data[i].water;
		    dsW2.data[p] = data.data[slotyearbefore].water;
	    }
      p++;
    }//endfor

    //limit all numbers in the arrays to 3 decimals
    applyArrayFixedDecimals( dsED1, 3);
    applyArrayFixedDecimals( dsED2, 3);
    applyArrayFixedDecimals( dsED3, 3);
    applyArrayFixedDecimals( dsED4, 3);
    applyArrayFixedDecimals( dsER1, 3);
    applyArrayFixedDecimals( dsER2, 3);
    applyArrayFixedDecimals( dsER3, 3);
    applyArrayFixedDecimals( dsER4, 3);

    //add datasets to the container, order is also display order
    electrData.datasets.push(dsED1);
    electrData.datasets.push(dsED2);
    if(fDoubleTarif) {
      electrData.datasets.push(dsED3);
      electrData.datasets.push(dsED4);
    }
    if(Injection){
      electrData.datasets.push(dsER1);
      electrData.datasets.push(dsER2);
      if(fDoubleTarif) {
        electrData.datasets.push(dsER3);
        electrData.datasets.push(dsER4);
      }
    }
    gasData.datasets.push(dsGD1);
    gasData.datasets.push(dsGD2);
    waterData.datasets.push(dsW1);
    waterData.datasets.push(dsW2); 

    //--- hide months Table
    document.getElementById("lastMonths").style.display = "none";
    //--- show canvas
    document.getElementById("dataChart").style.display  = "block";

  } // copyMonthsToChart()
    
  //============================================================================  
  function copyActualToChart(data) 
  {
    //convert telegram
    var objTelegram = parseTelegramData(data);

    //add to telegramhistory
    if(listTELEGRAMS.length >= MAX_ACTUAL_HISTORY) listTELEGRAMS.shift();
    listTELEGRAMS.push(objTelegram);
  }
 
  //not really needed anymore; replaced by createChartsGRAPH.
  //So this will act as a legacy wrapper
  function initActualGraph()
  {
    if(!fGraphsReady) createChartsGRAPH();  
  } // initActualGraph()

  //============================================================================  
  function showActualGraph()
  {
    if (activeTab != "bActualTab") return;

    //--- hide Table
    document.getElementById("actual").style.display    = "none";
    //--- show canvas
    document.getElementById("dataChart").style.display = "block";
    document.getElementById("gasChart").style.display  = "block";

    //display current listTELEGRAMS
    const [dcEX, dcGX] = createDataContainersACTUAL( listTELEGRAMS );
    
    //update Elektra
    myElectrChart.data = dcEX;
    myElectrChart.update(0);
    
    //update Gas
    myGasChart.data = dcGX;
    var labelString = "dm3";
    if( Dongle_Config == "p1-q") labelString = "GJ * 1000";
    myGasChart.options.scales.yAxes[0].scaleLabel.labelString = labelString;    
    myGasChart.update(0);

    //update water???
    //TODO

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

  //format timestamp
  //input: 230215223319W
  //output: "22:33:19"
  function formatHHMMSS(itemvalue)
  {
    //230215 223319 W
    var time = itemvalue.slice(6,12);
    var nHH = time.slice(0,2);
    var nMM = time.slice(2,4);
    var nSS = time.slice(4,6);
    return ""+nHH+":"+nMM+":"+nSS;
  }

  function parseTelegramData( data )
  {
    var telegram = new Map();
    for (key in data) 
    {
      item = data[key];
      // key: {value:0, unit:""}
      switch( key )
      {
        case "timestamp": telegram.set('timestamp', formatHHMMSS(item.value) ); break;

        case "power_delivered_l1": telegram.set('pdl1', (item.value).toFixed(3) ); break;
        case "power_delivered_l2": telegram.set('pdl2', (item.value).toFixed(3) ); break;
        case "power_delivered_l3": telegram.set('pdl3', (item.value).toFixed(3) ); break;
        case "power_delivered":    telegram.set('pd',   (item.value).toFixed(3) ); break;
        
        case "power_returned_l1": telegram.set('prl1', (item.value).toFixed(3) ); break;
        case "power_returned_l2": telegram.set('prl2', (item.value).toFixed(3) ); break;
        case "power_returned_l3": telegram.set('prl3', (item.value).toFixed(3) ); break;
        case "power_returned":    telegram.set('pr',   (item.value).toFixed(3) ); break;

        case "gas_delivered_timestamp": 
          telegram.set('gas_timestamp', formatHHMMSS(item.value) );
          break;

        case "gas_delivered": 
          telegram.set("gd", item.value ); 
          break;

        default:
          //nothing

      }//endswitch
    }//endfor

    return telegram;
  }

  function copyActualHistoryToChart(histdata) 
  {
    listTELEGRAMS = [];
    for(var i=0; i<histdata.length; i++)
    {
      //convert telegram
      var objTelegram = parseTelegramData( histdata[i] );
    
      //add to telegramhistory
      listTELEGRAMS.push(objTelegram);
    }
  }

  //convert the telegram list to datasets
  function createDataContainersACTUAL( listTELEGRAMS )
  {
    var dcEX = createChartDataContainerWithStack();
    var dcGX = createChartDataContainerWithStack();

    //ED L1..3
    var dsED1 = createDatasetBAR('false', 'red', "Gebruikt L1", "A");    
    var dsED2 = createDatasetBAR('false', 'tomato', "Gebruikt L2", "A");    
    var dsED3 = createDatasetBAR('false', 'salmon', "Gebruikt L3", "A");

    //ER L1..3
    var dsER1 = createDatasetBAR('false', 'yellowgreen', "Opgewekt L1", "A");
    var dsER2 = createDatasetBAR('false', 'springgreen', "Opgewekt L2", "A");
    var dsER3 = createDatasetBAR('false', 'green',       "Opgewekt L3", "A");
    
    //GD
    var dsG1 = createDatasetLINE('false', 'blue', "Gas verbruikt");
    if(Dongle_Config == "p1-q") dsG1.label = "Warmte verbruikt";
    dsG1.spanGaps = true;

    // Fill datasets
    var gd_prev = "";
    var ts_prev = "";
    for( var i=0; i<listTELEGRAMS.length; i++)
    {
      telegram = listTELEGRAMS[i];

      dcEX.labels.push(telegram.get("timestamp"));

      dsED1.data.push( telegram.get("pdl1") );
      dsED2.data.push( telegram.get("pdl2") );
      dsED3.data.push( telegram.get("pdl3") );

      dsER1.data.push( telegram.get("prl1") );
      dsER2.data.push( telegram.get("prl2") );
      dsER3.data.push( telegram.get("prl3") );
      
      if(i==0){        
        gd_prev = telegram.get("gd");
        ts_prev = telegram.get("gas_timestamp");
        dsG1.data.push(0);
        dsG1.data.push(null);
        dcGX.labels.push( ts_prev);
        dcGX.labels.push( telegram.get("timestamp") );
      }
      else
      {
        gd_ts = telegram.get("gas_timestamp");        
        if( gd_ts != ts_prev)
        {
          var gd = telegram.get("gd");
          dsG1.data.push( gd - gd_prev );
          ts_prev = gd_ts;
          gd_prev = gd;
        }
        else{
          dsG1.data.push( null );
        }
        dcGX.labels.push( telegram.get("timestamp") );
      }
    }

    //add datasets
    dcEX.datasets.push(dsED1);
    if( Phases > 1) dcEX.datasets.push(dsED2);
    if( Phases > 2) dcEX.datasets.push(dsED3);
    if (Injection) {
      dcEX.datasets.push(dsER1);
      if( Phases > 1) dcEX.datasets.push(dsER2);
      if( Phases > 2) dcEX.datasets.push(dsER3);
    }
    dcGX.datasets.push(dsG1);

    return [dcEX, dcGX];
  }


/* 
EXPERIMENTEEL
*/



























  //display hour history from 00 till 23 + depth (vandaag,gister,eergister)
  function showGraphSTATIC_HOURS(data)
  {
    var listWIDTH = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"];
    var listDEPTH = ["vandaag","gisteren","eergisteren"];

    //prepare data
    const [hcED, hcER, hcGD, hcWD] = prepareDataForHistoryContainerHOURS(data);

    //convert to datasets for E,G and W
    var dcEX = createDatasetsForChartSpecial( hcED, hcER, listWIDTH, listDEPTH);
    var dcGX = createDatasetsForChart( hcGD, listWIDTH, listDEPTH);
    var dcWX = createDatasetsForChart( hcWD, listWIDTH, listDEPTH);

    //set chartdata
    myElectrChart.data = dcEX;
    myGasChart.data = dcGX;
    myWaterChart.data = dcWX;

    //set label Yaxes    
    myElectrChart.options.scales.yAxes[0].scaleLabel.labelString = "Watt/uur";
    var labelString = "dm3";
    if ( Dongle_Config == "p1-q") labelString = "kJ";
    myGasChart.options.scales.yAxes[0].scaleLabel.labelString = labelString;
    myWaterChart.options.scales.yAxes[0].scaleLabel.labelString = "dm3";
    
    //update chart
    myElectrChart.update();
    myGasChart.update();
    myWaterChart.update();
  }

  //display days history from MAA till ZON + depth (deze week,vorige week,twee weken geleden)  
  function showGraphSTATIC_DAYS(data)
  {
    var listWIDTH  = ["Maandag", "Dinsdag", "Woensdag","Donderdag","Vrijdag","Zaterdag", "Zondag"];
    var listDEPTH = ["deze week","vorige week","twee weken geleden"];
    //TODO: wat als 31 dagen (= 5 weken) ? drie en vier weken geleden? of weeknummers?

    //prepare data
    const [hcED, hcER, hcGD, hcWD] = prepareDataForHistoryContainerDAYS(data);

    //convert to datasets Elektra, Gas, Water
    var dcEX = createDatasetsForChartSpecial( hcED, hcER, listWIDTH, listDEPTH);
    var dcGX = createDatasetsForChart( hcGD, listWIDTH, listDEPTH);
    var dcWX = createDatasetsForChart( hcWD, listWIDTH, listDEPTH);

    //set chartdata
    myElectrChart.data = dcEX;
    myGasChart.data = dcGX;
    myWaterChart.data = dcWX;

    //update label Yaxe
    myElectrChart.options.scales.yAxes[0].scaleLabel.labelString = "kWh";
    var labelString = "m3";
    if ( Dongle_Config == "p1-q") labelString = "kJ";
    myGasChart.options.scales.yAxes[0].scaleLabel.labelString = labelString;
    myWaterChart.options.scales.yAxes[0].scaleLabel.labelString = "m3";
    
    //update chart
    myElectrChart.update();
    myGasChart.update();
    myWaterChart.update();
  }
 
  //display month history from JAN till DEC + depth (dit jaar, vorig jaar,twee jaar gelden)
  function showGraphSTATIC_MONTHS(data)
  {
    var listWIDTH  = ["JAN", "FEB", "MRT","APR","MEI","JUN", "JUL", "AUG","SEP", "OKT", "NOV", "DEC"];
    var listDEPTH = ["dit jaar","vorig jaar","twee jaar geleden"];

    //prepare data
    const [hcED, hcER, hcGD, hcWD] = prepareDataForHistoryContainerMONTHS(data);

    //convert to datasets
    var dcEX = createDatasetsForChartSpecial( hcED, hcER, listWIDTH, listDEPTH);
    var dcGX = createDatasetsForChart( hcGD, listWIDTH, listDEPTH );
    var dcWX = createDatasetsForChart( hcWD, listWIDTH, listDEPTH );

    //set chartdata
    myElectrChart.data = dcEX;
    myGasChart.data = dcGX;
    myWaterChart.data = dcWX;

    //update label Yaxe
    myElectrChart.options.scales.yAxes[0].scaleLabel.labelString = "kWh";
    var labelString = "m3";
    if ( Dongle_Config == "p1-q") labelString = "kJ";
    myGasChart.options.scales.yAxes[0].scaleLabel.labelString = labelString;
    myWaterChart.options.scales.yAxes[0].scaleLabel.labelString = "m3";
    
    //update chart
    myElectrChart.update();
    myGasChart.update();
    myWaterChart.update();
  }







  // create for one color a list where alphablend is 50% of the previous color
  // e.g.
  //    factor=2 --> 100%, 50%, 25%, 12,5%, 6,25%, etc
  //    factor=3 --> 100%, 33.3%, 11.1%, 3,7%, etc
  //    factor=4 --> 100%, 25%, 6,25%, etc
  function createAlphaList(rgb, nDepth, nFactor)
  {
    var listCOLORS = [];    
    var nA = 1;
    for(var i=0; i<nDepth; i++)
    {
      color = "rgba(" + rgb + "," + nA.toString() + ")";
      listCOLORS.push(color);
      nA = (nA/nFactor).toFixed(3);
    }
    return listCOLORS;
  }

  //combine datasets for returns 
  function createDatasetsForChartSpecial(hcDX, hcRX, listLABELS_X, listDATASETS)
  {    
    var dcDX = createChartDataContainer();
    var nLEN = hcDX.current.length;
    var nDEPTH = 3;
    //TODO for the weeks if days=31
    //TODO check depth and length labels

    //create a alphablend for one color
    var listCOLORS1 = createAlphaList( "255,0,0", listDATASETS.length, 2 );
    var listCOLORS2 = createAlphaList( "0,255,0", listDATASETS.length, 2 );

    //create datasets for BAR chart
    const [dsED1, dsED2, dsED3] = createHistoryDatasetsBAR( listCOLORS1, listDATASETS);
    const [dsER1, dsER2, dsER3] = createHistoryDatasetsBAR( listCOLORS2, listDATASETS);

    //TODO NETTO datasets????
    
    //fill datasets with historycontainers
    for(var i=0; i<nLEN; i++)
    {
      dsED1.data[i]  = hcDX.current[i];
      dsED2.data[i]  = hcDX.previous[i];
      dsED3.data[i]  = hcDX.preprevious[i];
      dsER1.data[i]  = hcRX.current[i];
      dsER2.data[i]  = hcRX.previous[i];
      dsER3.data[i]  = hcRX.preprevious[i];
    }    
    
    //add to chartcontainer
    dcDX.labels = listLABELS_X;
    dcDX.datasets.push(dsED1);
    dcDX.datasets.push(dsED2);
    dcDX.datasets.push(dsED3);
    if( Injection ){
      dcDX.datasets.push(dsER1);
      dcDX.datasets.push(dsER2);
      dcDX.datasets.push(dsER3);
    }
    return dcDX;
  }

  //single triple datasets
  function createDatasetsForChart( hcDX, listLABELS_X, listDATASETS )
  {
    var dcDX = createChartDataContainer();
    var nLEN = hcDX.current.length;
    var nDEPTH = 3;
    //TODO for the weeks if days=31
    //TODO check depth and length labels
    
    //create a alphablend for color BLUE
    var listCOLORS1 = createAlphaList( "0,0,255", listDATASETS.length, 2 );
    //or create your own list
    //var listCOLORS1 = ["rgba(255,0,0,1)", "rgba(0,255,0,1)", "rgba(0,0,255,1)"];
    
    //create datasets for LINE chart
    const [dsXD1, dsXD2, dsXD3] = createHistoryDatasetsLINE( listCOLORS1, listDATASETS);

    //fill data
    for(var i=0; i<nLEN; i++)
    {
      dsXD1.data.push( hcDX.current[i]);      
      dsXD2.data.push( hcDX.previous[i]);
      dsXD3.data.push( hcDX.preprevious[i]);
    }
    
    //add to chartcontainer
    dcDX.labels = listLABELS_X;
    dcDX.datasets.push(dsXD1);
    dcDX.datasets.push(dsXD2);
    dcDX.datasets.push(dsXD3);

    //return datacontainer
    return dcDX;
  }

  //create 3 datasets in one go
  function createHistoryDatasetsBAR(listColors, listLabels)
  {
    var dsX1 = createDatasetBAR(false, listColors[0], listLabels[0], 'STACK_A');
    var dsX2 = createDatasetBAR(false, listColors[1], listLabels[1], 'STACK_B');
    var dsX3 = createDatasetBAR(false, listColors[2], listLabels[2], 'STACK_A'); //The first and lst will never overlap, so can use the same 'stack'
    return [dsX1, dsX2, dsX3];
  }

   //create 3 datasets LINE in one go
   function createHistoryDatasetsLINE(listColors, listLabels)
   {
     var dsX1 = createDatasetLINE(false, listColors[0], listLabels[0]);
     var dsX2 = createDatasetLINE(false, listColors[1], listLabels[1]);
     var dsX3 = createDatasetLINE(false, listColors[2], listLabels[2]);
     return [dsX1, dsX2, dsX3];
   }

  //create a container for history data and init with null
  function createHistoryContainer(width, depth)
  {
    hs = [];
    hs.current = new Array(width);
    hs.previous = new Array(width);
    hs.preprevious = new Array(width);
    fillArrayNULL(hs.current);
    fillArrayNULL(hs.previous);
    fillArrayNULL(hs.preprevious);
    hs.history = [];
    for( var i=0; i<depth-3; i++)
    {
      //add more history
      var arr = new Array(width);
      fillArrayNULL(arr);
      hs.history.push(arr);
    }
    return hs;
  }







  //=======================================================================
  //prepare the data 
  //divide the data into 3 day-arrays (each 24 days; start=00)
  function prepareDataForHistoryContainerHOURS(data)
  {
    //var listLABELS = ["vandaag","gisteren","eergisteren"];
    var objTODAY = new Date();
    var nDD0 = objTODAY.getDate();
    var nMM0 = objTODAY.getMonth();
    //var nDDp = objTODAY.getDate()-1;
    //var nDDpp = objTODAY.getDate()-2;
    //TODO: determine yesterday correctly

    //create history container
    var hcED = createHistoryContainer(24,3);
    var hcER = createHistoryContainer(24,3);
    var hcGD = createHistoryContainer(24,3);
    var hcWD = createHistoryContainer(24,3);

    //fill container with data
    for(var i=0; i<data.data.length; i++)
    {
      var item = data.data[i];
      var date = item.date;
      var nYY = date.substring(0,2);
      var nMM = date.substring(2,4);
      var nDD = date.substring(4,6);
      var nHH = parseInt(date.substring(6,8));

      //get values
      var nED = item.p_edw;
      var nER = item.p_erw;
      var nGD = item.p_gd;      
      var nWD = item.p_wd;

      //skip the corrupt slot
      if( i != (data.actSlot+1))
      {
        //store values
        if( nDD == nDD0 ){
          hcED.current[nHH] = nED;
          hcER.current[nHH] = nER;
          hcGD.current[nHH] = nGD;
          hcWD.current[nHH] = nWD;
        }
        if( nDD == (nDD0-1) ){
          hcED.previous[nHH] = nED;
          hcER.previous[nHH] = nER;
          hcGD.previous[nHH] = nGD;
          hcWD.previous[nHH] = nWD;
        }
        if( nDD == (nDD0-2)){
          hcED.preprevious[nHH] = nED;
          hcER.preprevious[nHH] = nER;
          hcGD.preprevious[nHH] = nGD;
          hcWD.preprevious[nHH] = nWD;
        }
      }
    }

    return [hcED, hcER, hcGD, hcWD];
  }

  //divide the data into 3 week-arrays (each 7 days; start=monday)
  //example:
    //  today=14 sep 2023 on donderdag
    // dc.labels              | M | D | W | D | V | Z | Z || wk# | 
    //                        |---|---|---|---|---|---|---||-----|
    // dc.datasets.preprevious| . | . | . | . | 1 | 2 | 3 || n+2 |
    // dc.datasets.previous   | 4 | 5 | 6 | 7 | 8 | 9 | 10|| n+1 |
    // dc.datasets.current    | 11| 12| 13| 14| . | . | . || n   |
    //  with . => null; 
  //and each resource (E,G or W) has its own history container
  function prepareDataForHistoryContainerDAYS(data)
  {
    var nDays = data.data.length;
    //with 14 days you need 3 weeks, with 31 days you need 5 weeks
    var nWeeks = Math.ceil( (nDays+1)/7 );
    var objTODAY = new Date();
    var nThisWeek = getWeeknumber(objTODAY);

    var listLABELS = ["deze week","vorige week","twee weken geleden"];
    //TODO: what if days=31; dire weken en vier weken geleden?
    //TODO: weeknummers?

    var dcED = createHistoryContainer(7, nWeeks);
    var dcER = createHistoryContainer(7, nWeeks);
    var dcGD = createHistoryContainer(7, nWeeks);
    var dcWD = createHistoryContainer(7, nWeeks);

    //fill container
    for(var i=0; i<data.data.length; i++)
    {
      var item = data.data[i];
      var date = item.date;
      var nYY = parseInt( date.substring(0,2) );
      var nMM = parseInt( date.substring(2,4) );
      var nDD = parseInt( date.substring(4,6) );
      var nHH = parseInt( date.substring(6,8) );
      var objDate = new Date(nYY+2000, nMM-1, nDD);
      //returns 0=sunday,etc but we need 0=monday, etc
      var nDOW = (objDate.getDay()+6) % 7;
      var nWeek = getWeeknumber(objDate);

      if( i == data.actSlot+1) continue;

      //get values
      var nED = item.p_ed;
      var nER = item.p_er;
      var nGD = item.p_gd;
      var nWD = item.p_wd;

      //0=monday, 1=tuesday, etc
      //this week
      if( nWeek == nThisWeek){
        dcED.current[nDOW] = nED;
        dcER.current[nDOW] = nER;
        dcGD.current[nDOW] = nGD;
        dcWD.current[nDOW] = nWD;
      }
      
      //prev week
      if( nWeek == nThisWeek-1){
        dcED.previous[nDOW] = nED;
        dcER.previous[nDOW] = nER;
        dcGD.previous[nDOW] = nGD;
        dcWD.previous[nDOW] = nWD;
      }

      //prev prev week
      if( nWeek == nThisWeek-2){
        dcED.preprevious[nDOW] = nED;
        dcER.preprevious[nDOW] = nER;
        dcGD.preprevious[nDOW] = nGD;
        dcWD.preprevious[nDOW] = nWD;
      }
    }

    return [dcED, dcER, dcGD, dcWD];
  }

  //divide the data into 3 year-arrays (each 12 months; start=jan) 
  function prepareDataForHistoryContainerMONTHS(data)
  {
    var listLABELS = ["dit jaar","vorig jaar","twee jaar geleden"];
    var objTODAY = new Date();
    var nYY_current = objTODAY.getFullYear() - 2000;
    
    var dcED = createHistoryContainer(12,3);
    var dcER = createHistoryContainer(12,3);
    var dcGD = createHistoryContainer(12,3);
    var dcWD = createHistoryContainer(12,3);

    //fill container     
    for(var i=0; i<data.data.length; i++)
    {
      var item = data.data[i];
      var date = item.date;
      var nYY = parseInt( date.substring(0,2) );
      var nMM = parseInt( date.substring(2,4) )-1;
      var nDD = parseInt( date.substring(4,6) );
      //var nHH = parseInt( date.substring(6,8) );
      //var objDate = new Date(nYY+2000, nMM-1, nDD);
      //var nWD = objDate.getDay();

      //get values
      var nED = item.p_ed;
      var nER = item.p_er;
      var nGD = item.p_gd;      
      var nWD = item.p_wd;

      //skip corrupt slot
      if( i == (data.actSlot+1)) continue;
      
      //store in correct container
      if( nYY == nYY_current){
        dcED.current[nMM] = nED;
        dcER.current[nMM] = nER;
        dcGD.current[nMM] = nGD;
        dcWD.current[nMM] = nWD;
      }

      if( nYY == nYY_current-1){
        dcED.previous[nMM] = nED;
        dcER.previous[nMM] = nER;
        dcGD.previous[nMM] = nGD;
        dcWD.previous[nMM] = nWD;
      }

      if( nYY == nYY_current-2){
        dcED.preprevious[nMM] = nED;
        dcER.preprevious[nMM] = nER;
        dcGD.preprevious[nMM] = nGD;
        dcWD.preprevious[nMM] = nWD;
      }
    }

    //return all containers
    return [dcED, dcER, dcGD, dcWD];
  }  

/*
//==============================UTILS=========================================
*/

//helper function to set all values to a value in an array
function fillArray(array, value) {
	for (var idx = 0; idx < array.length; idx++) {
		array[idx] = value;
	}
}

function fillArrayNULL(array) {
	fillArray(array, null);
}

// Returns the ISO week of the date.  
function getWeeknumber(dateIN)
{ 
  // Thursday in current week decides the year. 
  var date = new Date(dateIN.getTime());
  date.setHours(0, 0, 0, 0);  
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  // January 4 is always in week 1.
  var week1 = new Date(date.getFullYear(), 0, 4);
  // Adjust to Thursday in week 1 and count number of weeks from date to week1.
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
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
