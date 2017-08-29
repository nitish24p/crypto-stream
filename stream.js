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