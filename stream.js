var NUMBER_OF_TRADES = 20;

$('.subs-button').on('click', function() {
  console.log('subsribing');
  socket.emit('SubAdd', {subs:subscription} );
  $('#message').html('Streaming...'); 
});
  
$('.unsubs-button').on('click', function() {
  console.log('Unsubsribing');
  socket.emit('SubRemove', {subs:subscription} );
  $('#message').html('Stopped streaming.'); 
});

var getFlag = function(trade) {
  let flag = trade.F;
  if (flag === "1") {
    return "Sell";
  }
  else if (flag === "2") {
    return "Buy";
  }
  else if (flag === "4") {
    return "Unknown";
  }
};

var displayTrade = function(trade) {
  let table = document.getElementById("trades");
  row = table.insertRow(1);
  let flag = getFlag(trade);
  let fsym = CCC.STATIC.CURRENCY.SYMBOL[trade.FSYM];
  let tsym = CCC.STATIC.CURRENCY.SYMBOL[trade.TSYM];
  let price = CCC.convertValueToDisplay(tsym, trade.P);
  let quantity = CCC.convertValueToDisplay(fsym, trade.Q);
  let total = CCC.convertValueToDisplay(tsym, trade.TOTAL);
  row.className = flag;
  row.innerHTML = '<td>'+ trade.M +'</td><td>'+ flag +'</td><td>'+ trade.ID +'</td><td>'+ price +'</td><td>'+ quantity +'</td><td>' + total + '</td>';
  if (table.rows.length > NUMBER_OF_TRADES)
  {
    table.deleteRow(table.rows.length-1)
  }
};

var socket = io.connect('https://streamer.cryptocompare.com/');

//Format: {SubscriptionId}~{ExchangeName}~{FromSymbol}~{ToSymbol}
//Use SubscriptionId 0 for TRADE, 2 for CURRENT and 5 for CURRENTAGG
//For aggregate quote updates use CCCAGG as market
//You can subscribe to all exchanges for a currency pair by using the following API
var subscription;

$.getJSON( "https://min-api.cryptocompare.com/data/subs?fsym=BTC&tsyms=USD", function( data ) {
 subscription = data['USD']['TRADES'];
 socket.emit('SubAdd', {subs:subscription} );
 $('.message').innerHTML = 'Streaming...' 
});

// socket.on("m", function(message){
//   var messageType = message.substring(0, message.indexOf("~"));
//   var res = {};

//   if (messageType === CCC.STATIC.TYPE.TRADE) {
//     res = CCC.TRADE.unpack(message);
//     console.log(res);
//     displayTrade(res);
//     console.log(res);
//   } 

// });

//0~Exmo~BTC~USD~1~18530646~1504034081~0.0164262~4480.01~73.58954026~1f


let h = 600 || window.innerHeight;
console.log("h", h, window.outerHeight);  
let w = 960 || window.innerWidth;

let time = 0;
let num = 300;

let noise = new SimplexNoise();
let seed = 50 + 100 * Math.random();
let data = [seed];
let averages_50 = [0];
let averages_25 = [0];
let deltas = [seed];

let latestData = [seed];
let latestAverages_50 = [0];
let latestAverages_25 = [0];
let latestDeltas = [seed];
console.log("LOGGIN d3", d3)
let x = d3.scale.linear().range([0, w - 40]);
let y = d3.scale.linear().range([h - 40, 0]);

let xAxis = d3.svg.axis()
  .scale(x)
  .orient('bottom')
  .innerTickSize(-h + 40)
  .outerTickSize(0)
  .tickPadding(10);

let yAxis = d3.svg.axis()
  .scale(y)
  .orient('left')
  .innerTickSize(-w + 40)
  .outerTickSize(0)
  .tickPadding(10);

let line = d3.svg.line()
  .x((d, i) => x(i + time - num))
  .y(d => y(d));

let svg = d3.select('body').append('svg')
  .attr({width: w, height: h})
.append('g')
  .attr('transform', 'translate(30, 20)');

let $xAxis = svg.append('g')
  .attr('class', 'x axis')
  .attr('transform', `translate(0, ${h - 40})`)
  .call(xAxis);

let $yAxis = svg.append('g')
  .attr('class', 'y axis')
  .call(yAxis);

let $data = svg.append('path')
  .attr('class', 'line data');

let $averages_50 = svg.append('path')
  .attr('class', 'line average-50');

let $averages_25 = svg.append('path')
  .attr('class', 'line average-25');
console.log("herses");
let $rects = svg.selectAll('rect')
  .data(d3.range(num))
  .enter()
    .append('rect')
    .attr('width', (w - 40) / num)
    .attr('x', (d, i) => i * (w - 40) / num);

let legend = svg.append('g')
  .attr('transform', `translate(20, 20)`)
  .selectAll('g')
  .data([['Value', '#fff'], ['Trailing Average - 50', '#0ff'], ['Trailing Average - 25', '#ff0']])
  .enter()
    .append('g');

  legend
    .append('circle')
    .attr('fill', d => d[1])
    .attr('r', 5)
    .attr('cx', 0)
    .attr('cy', (d, i) => i * 15);

  legend
    .append('text')
    .text(d => d[0])
    .attr('transform', (d, i) => `translate(10, ${i * 15 + 4})`);

function tick() {
  time++;
  data[time] = data[time - 1] + noise.noise2D(seed, time / 2);
  data[time] = Math.max(data[time], 0);

  if (time <= 50) {
    let a = 0;
    for (let j = 0; j < time; j++) {
      a += data[time - j];
    }
    a /= 50;
    averages_50[time] = a;
  }
  else {
    let a = averages_50[time - 1] * 50 - data[time - 50];
    a += data[time];
    a /= 50;
    averages_50[time] = a;
  }

  if (time <= 25) {
    let a = 0;
    for (let j = 0; j < time; j++) {
      a += data[time - j];
    }
    a /= 25;
    averages_25[time] = a;
  }
  else {
    let a = averages_25[time - 1] * 25 - data[time - 25];
    a += data[time];
    a /= 25;
    averages_25[time] = a;
  }

  deltas[time] = data[time] - data[time - 1];

  if (time <= num) {
    latestData = data.slice(-num);
    latestAverages_50 = averages_50.slice(-num);
    latestAverages_25 = averages_25.slice(-num);
    latestDeltas = deltas.slice(-num);
  }
  else {
    latestData.shift();
    latestAverages_50.shift();
    latestAverages_25.shift();
    latestDeltas.shift();
    latestData.push(data[time]);
    latestAverages_50.push(averages_50[time]);
    latestAverages_25.push(averages_25[time]);
    latestDeltas.push(deltas[time]);
  }
}

function update() {
  x.domain([time - num, time]);
  let yDom = d3.extent(latestData);
  yDom[0] = Math.max(yDom[0] - 1, 0);
  yDom[1] += 1;
  y.domain(yDom);

  $xAxis
    .call(xAxis);

  $yAxis
    .call(yAxis);

  $data
    .datum(latestData)
    .attr('d', line);

  $averages_50
    .datum(latestAverages_50)
    .attr('d', line);

  $averages_25
    .datum(latestAverages_25)
    .attr('d', line);
  console.log("here");
  // $rects
  //   .attr('height', (_, i) => Math.abs(latestDeltas[i] * h / 10))
  //   .attr('fill', (_, i) => latestDeltas[i] < 0 ? 'red' : 'green')
  //   .attr('y', (_, i) => h - Math.abs(latestDeltas[i] * h / 10) - 42);
}

for (let i = 0; i < num + 50; i++) {
  tick();
}

update();

setInterval(() => {
  tick();
  update();
}, 60);









