const invalid = "invalid";
const noacc = [];
let symbol_tmp = "";
const today = new Date();
var GlobalOrderNo = "";
const GlobalOrderNoList = [];
const orderNoMap = {};
const resultdata = { pass: 0, fail: 0, error: 0 };
const resultdetailfail = [];
const stockprice = { stock: "", price: "" };
const onScreenObj = Sys.Desktop.ActiveWindow();

const directLocation = {
  enter: '[Enter]',
  left: '[Left]',
  right: '[Right]',
  prtSc: '[PrtSc]',
  f2: '[F2]',
  f1:'[F1]',
  numSlash: '[NumSlash]',
  home: '[Home]',
  s: '^s',
  b: '^b',
  buyin: '[Buyin]',
  firm : '~c',
  twofirm : '[NumAsterisk]' ,
  
  '1firm': '[PTD-2FIRM]',
  '2firm': '[NumAsterisk]'
};

const onDelayDirector = (direct, delay = 1000) => {
  Delay(delay);
  onScreenObj.Keys(directLocation[direct]);
};

const checkSideOrder = (side) => (side === 'b' || side === 's') ? side : '';



 
const checkPrice = (price, side) => {
  if (price) {
    switch (price.toUpperCase()) {
      case "MKT":
        onScreenObj.Keys("k");
        Delay(1000);
        break;
      case "ATO": onScreenObj.Keys("a"); break;
      case "ATC": onScreenObj.Keys("c"); break;
      case "MTL": onScreenObj.Keys("l"); break;
      case "UPPER": onScreenObj.Keys("100"); 
      onDelayDirector("enter");
       var exceptionMsg = getorderexcepupper();
        if (exceptionMsg === "Price is Upper Ceiling") {
          Log.Message("❌ เคสนี้ไม่สามารถส่งได้ (Upper Ceiling)");
          return false;  
        }
        break;
      
      case "LOWER": onScreenObj.Keys("1"); 
      onDelayDirector("enter");
       var exceptionMsg = getorderexceplower();
        if (exceptionMsg === "Price is Lower Floor") {
          Log.Message("❌ เคสนี้ไม่สามารถส่งได้ (Lower Floor)");
          return false;  
        }
      break;
      
      default: onScreenObj.Keys(price); break;
    }
    return true;
  } else {
    const result = getprice();
    if (equal(result, invalid) || result === "") return false;
    onScreenObj.Keys(result);
    onScreenObj.Keys("[Enter]");
    //onDelayDirector("enter");
    return true;
  }
};

const checkPrice1frim = (price, side) => {
  if (price) {
    switch (price.toUpperCase()) {
      case "MKT": onScreenObj.Keys("k"); break;
      case "ATO": onScreenObj.Keys("a"); break;
      case "ATC": onScreenObj.Keys("c"); break;
      case "MLT": onScreenObj.Keys("l"); break;
      case "UPPER": onScreenObj.Keys("100"); break;
      case "LOWER": onScreenObj.Keys("1"); break;
      default: onScreenObj.Keys(price); break;
    }
    return true;
  } else {
    const result = getprice1frim();
    if (equal(result, invalid) || result === "") return false;
    onScreenObj.Keys((result));
  
    return true;
  }
  
};

const checkCondition = (condition) => {
  if (!condition) return '';
  switch (condition.toLowerCase()) {
    case 'ioc':
      onScreenObj.Keys("i");     
      break;   
    //  onScreenObj.Keys("[Enter]");  
    case 'fok': 
      onScreenObj.Keys("f");        
      break;  
    case 'gtc': return 'c';
    case 'gtd':
      onScreenObj.Keys("d");        
      onScreenObj.Keys("[Enter]");   
    default:
      return '';
  }
};


const sendNormalOrder = (side, stock, price, volume, account, publish, condition, date, nvdr, ot) => {
   onDelayDirector('f2');
  const locationSide = checkSideOrder(side.toLowerCase());
  if (!locationSide) return;

  onDelayDirector(locationSide);
  onDelayDirector('left');
  onScreenObj.Keys(stock);
  onDelayDirector("enter");
  onScreenObj.Keys(volume);
  onDelayDirector("enter");
  if (!checkPrice(price, side)) return;
  delay(1000);
  onScreenObj.Keys(account);
  onDelayDirector("enter");

  if (publish || condition || date || nvdr || ot) {
    for (let i = 0; i < 1; i++) onScreenObj.Keys(directLocation.left);
    if (publish) onScreenObj.Keys(publish);
    onDelayDirector("enter");
   // onDelayDirector('left');
    //onDelayDirector("enter");
    if (condition) onScreenObj.Keys(checkCondition(condition));
    //onDelayDirector("enter");
    if (date && condition.toLowerCase() === "gtd") onScreenObj.Keys(date);
    onDelayDirector("enter");
    if (nvdr) onScreenObj.Keys(nvdr);
    onDelayDirector("enter");
    if (ot) onScreenObj.Keys(ot);
    onDelayDirector("enter");
  }
  delay(1000);
  onDelayDirector("enter");
 // Log.Message("check enter")
};


const send1FirmAndBuyinOrder = (action, stock, price, volume, account1, account2, brokerId, controlKey, nvdr1, nvdr2) => {

    onDelayDirector('f1');
   onDelayDirector('2firm');
	onScreenObj.Keys(stock);
	onDelayDirector('enter');
	onScreenObj.Keys(volume);
	onDelayDirector('enter');
  if (!checkPrice1frim(price)) return;
	onDelayDirector('enter');
	onScreenObj.Keys(account1);
	onDelayDirector('enter');

	if (nvdr1) onScreenObj.Keys(nvdr1);
	onDelayDirector('enter');

	onScreenObj.Keys(brokerId || '00U8');
	onDelayDirector('enter');
	onScreenObj.Keys(account2);
	onDelayDirector('enter');

	if (nvdr2) onScreenObj.Keys(nvdr2);
	onDelayDirector('enter');

	if (controlKey) onScreenObj.Keys(controlKey);
	onDelayDirector('enter');
	onDelayDirector('enter');
};

const send2FirmOrder = (side, stock, price, volume, account, nvdr, brokerId, controlKey) => {
 
  onDelayDirector('f1');
  onDelayDirector('firm');
	onScreenObj.Keys(side);
	onDelayDirector('enter');
	onScreenObj.Keys(stock);
	onDelayDirector('enter');
  onScreenObj.Keys(volume);
  onDelayDirector('enter');
  if (!checkPrice(price, side)) return;
  //onScreenObj.Keys(price);
	onDelayDirector('enter');


	if (nvdr) onScreenObj.Keys(nvdr);
	onDelayDirector('enter');

	onScreenObj.Keys(brokerId || '00U8');
	onDelayDirector('enter');
	onScreenObj.Keys(account);
	onDelayDirector('enter');

	if (controlKey) onScreenObj.Keys(controlKey);
	onDelayDirector('enter');
	onDelayDirector('enter');
	onDelayDirector('enter');
};

const changeOrder = (ordno, price, volume, publish, side) => {

	onDelayDirector('home');
 
  onDelayDirector('right');
   onDelayDirector('left');
  if (price) {
    const priceChanged = checkPrice(price, side);
    	onDelayDirector('enter');
    const exceptionMsg = getorderexcepchange();
    if (exceptionMsg === "Price is Upper Ceiling") {
      Log.Message("❌ เคสนี้ไม่สามารถส่งได้ (Price is Upper Ceiling)");
      return false;
        }
  if (exceptionMsg === "SET Not Allow change limit to market price.") {
    Log.Message("❌ เคสนี้ไม่สามารถส่งได้ (Not Allow change)");
    return false;
  }

  onDelayDirector('enter');
}

	if (volume) onScreenObj.Keys(volume);
	onDelayDirector('enter');

	if (publish) onScreenObj.Keys(publish);
	onDelayDirector('enter');
	onDelayDirector('enter');

	Log.Message(`Change Order OrdNo ${ordno}: ${price ? `Price: ${price}` : ''} ${volume ? `Volume: ${volume}` : ''} ${publish ? `Publish: ${publish}` : ''}`);
};

const changeAccount = (ordno, account, nvdr) => {
	if (account) onScreenObj.Keys(account);
	onDelayDirector('enter');

	if (nvdr) onScreenObj.Keys(nvdr);
	onDelayDirector('enter');
	onDelayDirector('enter');

	Log.Message(`Change Account OrdNo ${ordno}: ${account ? `Account: ${account}` : ''} ${nvdr ? `NVDR: ${nvdr}` : ''}`);
};

const cancelOrder = (ordno) => {
	onDelayDirector('numSlash');
	onScreenObj.Keys('y');
	onDelayDirector('enter');
	Log.Message(`Cancel Order => OrdNo: ${ordno}`);
};

 
function mainOrder(
  no, action, side, stock, price, volume, account, publish, condition, date, nvdr, ot,
  account1, account2, brokerId, controlKey, nvdr1, nvdr2, refno
) {
  action = action.toLowerCase();
  no = no.toString();
  if (refno !== undefined && refno !== null) refno = refno.toString();

  if (action === 'new') {
    sendNormalOrder(side, stock, price, volume, account, publish, condition, date, nvdr, ot);
    Delay(2000)
    const oNo = getOrdNo();
   if (!oNo) {
     Log.Error(`Failed to get OrderNo for row no ${no}.`);
     return;
   }
   orderNoMap[no] = oNo;
   Log.Message(`Mapping orderNo for no ${no}: ${oNo}`);
     
    onDelayDirector('prtSc');
    onDelayDirector('left');
    onScreenObj.Keys(oNo);
    onDelayDirector('enter');
    
    Check_orderStatus(no, side, "send complete");
    onDelayDirector('f2');
  }

  else if (action === '1firm' || action === 'buyin') {
    send1FirmAndBuyinOrder(action, stock, price, volume, account1, account2, brokerId, controlKey, nvdr1, nvdr2);
    Delay(1000);
     const oNo = getOrdNo1Firm();
      if (!oNo) {
    Log.Error(`Failed to get 1firm OrderNo.`);
    return;
  }
 
  orderNoMap[no] = oNo;
  Log.Message(`Mapping 1firm orderNo for no ${no}: ${oNo}`);

  onDelayDirector('prtSc');
  onDelayDirector('left');
  onScreenObj.Keys(oNo);
  onDelayDirector('enter');
  //onDelayDirector('f2');

  Check_orderStatus(no, side, "send complete");
}

 else if (action === '2firm') {
  send2FirmOrder(side, stock, price, volume, account, nvdr, brokerId, controlKey);
  
  const oNo = getOrdNo2Firm();
  if (!oNo) {
    Log.Error(`Failed to get 2firm OrderNo.`);
    return;
  }
  orderNoMap[no] = oNo;
  Log.Message(`Mapping 2firm orderNo for no ${no}: ${oNo}`);

  onDelayDirector('prtSc');
  onDelayDirector('left');
  onScreenObj.Keys(oNo);
  onDelayDirector('enter');
//  onDelayDirector('f2');

  Check_orderStatus(no, side, "send complete");
}


  else if (action === 'change') {
    if (!orderNoMap.hasOwnProperty(refno)) {
      Log.Error(`OrderNo not found for refno ${refno}`);
      return;
    }
    const ordno = orderNoMap[refno];
    onDelayDirector('prtSc');
    onDelayDirector('left');
    onScreenObj.Keys(ordno);
    onDelayDirector('enter');

   if (price || volume || publish) changeOrder(ordno, price, volume, publish, side);
    if (account || nvdr) changeAccount(ordno, account, nvdr);


    onDelayDirector('prtSc');
    onDelayDirector('left');
    onScreenObj.Keys(ordno);
    onDelayDirector('enter');

   

    Check_orderStatus(refno, side, "change complete");
  }
  else if (action === 'cancel') {
    if (!orderNoMap.hasOwnProperty(refno)) {
      Log.Error(`OrderNo not found for refno ${refno}`);
      return;
    }
    const ordno = orderNoMap[refno];
    onDelayDirector('prtSc');
    onDelayDirector('left');
    onScreenObj.Keys(ordno);
    onDelayDirector('enter');

    cancelOrder(ordno);

   
   onDelayDirector('prtSc');
    onDelayDirector('left');
    onScreenObj.Keys(ordno);
    onDelayDirector('enter');

    Check_orderStatus(refno, side, "cancel complete");
  }
}


//  function getprice() {
  //var SecurityInfoGrid = Aliases.javaw.MainFrame.ContentsPane.MainApplet.BMarketByPriceNasdaqScreen.GeneralSecurityInfoPanel.securitiesInfoGrid;
 // var colCount = SecurityInfoGrid.getNumberOfColumns();
  
  
  //var lastValue = aqConvert.VarToStr(SecurityInfoGrid.getGridCell_2(1, colCount - 2)).trim();
  //Log.Message(" " + lastValue);
  //return lastValue;
 
//}

function getprice() {
  var SecurityInfoGrid = Aliases.javaw.MainFrame.ContentsPane.MainApplet.BMarketByPriceNasdaqScreen.GeneralSecurityInfoPanel.securitiesInfoGrid;
  var colCount = SecurityInfoGrid.getNumberOfColumns();

  var lastValueStr = aqConvert.VarToStr(SecurityInfoGrid.getGridCell_2(1, colCount - 2)).trim();
  var lastValue = parseFloat(lastValueStr);  
  var newValue = lastValue + 2; 

  Log.Message("Original value: " + lastValue + ", After adding 2: " + newValue);
  return newValue;
}


  function getprice1frim() {
  var SecurityInfoGrid = Aliases.javaw.MainFrame.ContentsPane.MainApplet.AOrderEntryPutthroughScreen.AOrderEntryPutthroughPanel1.AWTObject("FloorCeilingGrid");
   var rowCount = SecurityInfoGrid.getNumberOfRows();
  
  
  var rowCount = aqConvert.VarToStr(SecurityInfoGrid.getGridCell_2(0, 1)).trim();
  Log.Message(" " + rowCount);
   return rowCount;
 
}

  

//function getOrdNo() {
 // Aliases.javaw.MainFrame.ContentsPane.MainApplet.AOrderEntrySellScreen.AOrderEntryPanel1.AWTObject("error_grid")
//  var SecurityInfoGrid = Aliases.javaw.MainFrame.ContentsPane.MainApplet.AOrderEntryBuyScreen.AOrderEntryPanel1.error_grid;
//  var rowCount = SecurityInfoGrid.getNumberOfRows();

//  var OrdNo = aqConvert.VarToStr(SecurityInfoGrid.getGridCell_2(0, 2)).trim();
//   var OrdNoValue = OrdNo.split(':')[1].trim();
//   Log.Message(" " + OrdNoValue);
//    return OrdNoValue;
//}

function getOrdNo() {
    var buyOrdNo = null;
    var sellOrdNo = null;
    var OrdNoValue = null;

    // ----- Buy Grid -----
    try {
 //     Aliases.javaw.MainFrame.ContentsPane.MainApplet.AOrderEntryBuyScreen.AOrderEntryPanel1.error_grid
        var buyPanel = Aliases.javaw.MainFrame.ContentsPane.MainApplet.AOrderEntryBuyScreen.AOrderEntryPanel1;
        var buyGrid = null;

        for (var retry = 0; retry < 2; retry++) {
            try {
                buyGrid = buyPanel.error_grid;
                if (buyGrid.Exists && buyGrid.getNumberOfRows() > 0) break;
            } catch (e) {}
            Delay(500);
        }

        if (buyGrid && buyGrid.Exists && buyGrid.getNumberOfRows() > 0) {
            var rawBuy = aqConvert.VarToStr(buyGrid.getGridCell_2(0, 2)).trim();
            if (rawBuy.indexOf(':') !== -1) {
                buyOrdNo = parseInt(rawBuy.split(':')[1].trim(), 10);
                Log.Message("Buy Order No: " + buyOrdNo);
            }
         //   Log.Message("raw buy"+ rawBuy);
        } else {
            Log.Message("Buy Grid not found or empty");
        }
    } catch (e) {
        Log.Message("Buy Grid error: " + e.message);
    }

    // ----- Sell Grid -----
    try {
        var sellPanel = Aliases.javaw.MainFrame.ContentsPane.MainApplet.AOrderEntrySellScreen.AOrderEntryPanel1;
        var sellGrid = null;

        for (var retry = 0; retry < 2; retry++) {
            try {
                sellGrid = sellPanel.AWTObject("error_grid");
                if (sellGrid.Exists && sellGrid.getNumberOfRows() > 0) break;
            } catch (e) {}
            Delay(500);
        }

        if (sellGrid && sellGrid.Exists && sellGrid.getNumberOfRows() > 0) {
            var rawSell = aqConvert.VarToStr(sellGrid.getGridCell_2(0, 2)).trim();
            if (rawSell.indexOf(':') !== -1) {
                sellOrdNo = parseInt(rawSell.split(':')[1].trim(), 10);
                Log.Message("Sell Order No: " + sellOrdNo);
            }
        } else {
            Log.Message("Sell Grid not found or empty");
        }
    } catch (e) {
        Log.Message("Sell Grid error: " + e.message);
    }

   
    if (buyOrdNo !== null && sellOrdNo !== null) {
        OrdNoValue = (buyOrdNo > sellOrdNo) ? buyOrdNo : sellOrdNo;
    } else if (buyOrdNo !== null) {
        OrdNoValue = buyOrdNo;
    } else if (sellOrdNo !== null) {
        OrdNoValue = sellOrdNo;
    }

    if (OrdNoValue !== null) {
        Log.Message("✅ Latest Order No (Max): " + OrdNoValue);
    } else {
        Log.Warning("⚠️ No Order found in Buy or Sell grid");
    }

    return OrdNoValue;
}


function getOrdNo2Firm() {
  var SecurityInfoGrid = Aliases.javaw.MainFrame.ContentsPane.MainApplet.AOrderEntryPutthroughHalfScreen.AOrderEntryPutthrougPanelHalf.errLabel;
  var rowCount = aqConvert.VarToStr(SecurityInfoGrid.getText());

  var match = rowCount.match(/Order No\s*:\s*(\d+)/);
  var OrdNo2firm = match ? match[1] : ""; 
      Log.Message(" " + OrdNo2firm);
    return OrdNo2firm;

}

function getOrdNo1Firm() {
  var SecurityInfoGrid = Aliases.javaw.MainFrame.ContentsPane.MainApplet.AOrderEntryPutthroughScreen.AOrderEntryPutthroughPanel1.AWTObject("MessagePanel");
  var rawText = aqConvert.VarToStr(SecurityInfoGrid.getText());

 
  var match = rawText.match(/Order No\s*:\s*(\d+)/);
  var OrdNoValue = match ? match[1] : "";

 
  Log.Message(" " + OrdNoValue);
  return OrdNoValue;
}



function Check_orderStatus(no, side, expect) {
  let result = true;
  if (expect) {
    let split_expect = expect.split(",");
    if (side === "b") {
      try {
        // order status
        switch (split_expect[0]) {
          case "O":
            {
              if (
              Regions.OrderConfirmGrid9 &&
               Regions.OrderConfirmGrid9.Check(
                  Regions.CreateRegionInfo(
                    Aliases.javaw.MainFrame.ContentsPane.MainApplet
                      .AViewOrderConfirmTScreen.AOrderConfirmTPanel1
                      .OrderConfirmGrid,
                    1646, 
                    33,
                    37,
                    33,
                    false
                  )
                )
              ) {
                Log.Message("Check order status successfully !!"+no);
              } else {
                result = false;
                resultdetailfail.push(
                  "order " + no + " order status not match"
                );
              }
            }
            break;
            
            
          case "OC":
            {
              if (
              Regions.OrderConfirmGrid6 &&
                Regions.OrderConfirmGrid6.Check(
                  Regions.CreateRegionInfo(     
                    Aliases.javaw.MainFrame.ContentsPane.MainApplet
                    .AViewOrderConfirmTScreen.AOrderConfirmTPanel1
                    .OrderConfirmGrid,
                    1649, 
                    34, 
                    52, 
                    31, 
                    false
                  )
                )
              ) {
                Log.Message("Check order status successfully !!" + no);
              } else {
                result = false;
                resultdetailfail.push(
                  "order " + no + " order status not match"
                );
                Log.Message("Check order status fail !!");
              }
            } // B_OC
            break;  
                        
          case "XC":
            {
              if (
              Regions.OrderConfirmGrid10 &&
                Regions.OrderConfirmGrid10.Check(
                  Regions.CreateRegionInfo(     
                  Aliases.javaw.MainFrame.ContentsPane.MainApplet
                  .AViewOrderConfirmTScreen.AOrderConfirmTPanel1
                  .OrderConfirmGrid,    
                   1651, 
                   36, 
                   43, 
                   31, 
                   false                                  

                  )
                )
              ) {
                Log.Message("Check order status successfully !!" + no);
              } else {
                result = false;
                resultdetailfail.push(
                  "order " + no + " order status not match"
                );
                Log.Message("Check order status fail !!");
              }
            } // B_OC
            break;
                      
           case "C":
            {
              if (
              Regions.OrderConfirmGrid11 &&
                Regions.OrderConfirmGrid11.Check(
                  Regions.CreateRegionInfo(     
                  Aliases.javaw.MainFrame.ContentsPane.MainApplet
                  .AViewOrderConfirmTScreen.AOrderConfirmTPanel1
                  .OrderConfirmGrid,
                   1645,
                   35, 
                   43, 
                   30, 
                   false                                 
                  )
                )
              ) {
                Log.Message("Check order status successfully !!" + no);
              } else {
                result = false;
                resultdetailfail.push(
                  "order " + no + " order status not match"
                );
                Log.Message("Check order status fail !!");
              }
            } // B_OC
            break; 
            
            
          case "Reject":
            Log.Message("expect = Reject, Check order status skip !!");
            break;
          case "M":
            {
              if (
                Regions.OrderConfirmGrid22 &&
                Regions.OrderConfirmGrid22.Check(
                  Regions.CreateRegionInfo(
                    Aliases.javaw.MainFrame.ContentsPane.MainApplet
                      .AViewOrderConfirmTScreen.AOrderConfirmTPanel1
                      .OrderConfirmGrid,
                    1560,
                    3,
                    49,
                    63,
                    false
                  )
                )
              ) {
                Log.Message("Check order status successfully !!");
              } else {
                result = false;
                resultdetailfail.push(
                  "order " + no + " order status not match"
                );
                Log.Message("Check order status fail !!");
              }
            }
            break;
          default:
            Log.Message("no expect, Check order status skip !!");
        }
      } catch (e) {
        Log.Error("An error occurred during the region check: " + e.message);
        result = false;
      }
      try {
        // quote
        switch (split_expect[1]) {
          case "Y":
            {
              if (
              Regions.OrderConfirmGrid16 &&
                Regions.OrderConfirmGrid16.Check(
                  Regions.CreateRegionInfo(
                    Aliases.javaw.MainFrame.ContentsPane.MainApplet
                      .AViewOrderConfirmTScreen.AOrderConfirmTPanel1
                      .OrderConfirmGrid,
                    1792,
                    3,
                    46,
                    64,
                    false
                  )
                )
              ) {
                Log.Message("Check quote status successfully !!");
              } else {
                result = false;
                resultdetailfail.push(
                  "order " + no + " quote status not match"
                );
                Log.Message("Check quote fail !!");
              }
            } // B_QY
            break;
          default:
            Log.Message("no quote expect, Check quote status skip !!");
        }
      } catch (e) {
        Log.Error("An error occurred during the region check: " + e.message);
        result = false;
      }
      let mainApplet = Aliases.javaw.MainFrame.ContentsPane.MainApplet;
      mainApplet.AViewOrderConfirmTScreen.AOrderConfirmTPanel1.OrderConfirmGrid.Drag(
        1741,
      49,
        -1500,
        -7
      ); // Drag to con
      try {
        // condition
        switch (split_expect[2]) {
          case "I":
            {
              if (
              Regions.OrderConfirmGrid18 &&
                Regions.OrderConfirmGrid18.Check(
                  Regions.CreateRegionInfo(
                    Aliases.javaw.MainFrame.ContentsPane.MainApplet
                      .AViewOrderConfirmTScreen.AOrderConfirmTPanel1
                      .OrderConfirmGrid,
                    1891,
                    0,
                    111,
                    67,
                    false
                  )
                )
              ) {
                Log.Message("Check condition status successfully !!");
              } else {
                result = false;
                resultdetailfail.push(
                  "order " + no + " condition status not match"
                );
                Log.Message("Check condition fail !!");
              }
            } // BB_I
            break;
          case "F":
            {
              if (
              Regions.OrderConfirmGrid19 &&
                Regions.OrderConfirmGrid19.Check(
                  Regions.CreateRegionInfo(
                    Aliases.javaw.MainFrame.ContentsPane.MainApplet
                      .AViewOrderConfirmTScreen.AOrderConfirmTPanel1
                      .OrderConfirmGrid,
                    1894,
                    0,
                    107,
                    65,
                    false
                  )
                )
              ) {
                Log.Message("Check condition status successfully !!");
              } else {
                result = false;
                resultdetailfail.push(
                  "order " + no + " condition status not match"
                );
                Log.Message("Check condition fail !!");
              }
            }
            break;
          case "C":
            {
              if (
              Regions.OrderConfirmGrid20 &&
                Regions.OrderConfirmGrid20.Check(
                  Regions.CreateRegionInfo(
                    Aliases.javaw.MainFrame.ContentsPane.MainApplet
                      .AViewOrderConfirmTScreen.AOrderConfirmTPanel1
                      .OrderConfirmGrid,
                    1890,
                    1,
                    115,
                    66,
                    false
                  )
                )
              ) {
                Log.Message("Check condition status successfully !!");
              } else {
                result = false;
                resultdetailfail.push(
                  "order " + no + " condition status not match"
                );
                Log.Message("Check condition fail !!");
              }
            }
            break;
          case "D":
          Regions.OrderConfirmGrid21 &&
            Regions.OrderConfirmGrid21.Check(
              Regions.CreateRegionInfo(
                Aliases.javaw.MainFrame.ContentsPane.MainApplet
                  .AViewOrderConfirmTScreen.AOrderConfirmTPanel1
                  .OrderConfirmGrid,
                1890,
                2,
                110,
                66,
                false
              )
            );
            break;
          default:
            Log.Message("no condition expect, Check condition status skip !!");
        }
      } catch (e) {
        Log.Error("An error occurred during the region check: " + e.message);
        result = false;
      }
    }
  }
  if (result) {
    Log.Message("PASS");
    resultdata.pass = resultdata.pass + 1;
    result = true;
  } else {
    Log.Message("FAIL");
    resultdata.fail = resultdata.fail + 1;
    result = true;
  }
}
 
 
  

//pass
function getorderexcepupper(){
    var Securityexception = Aliases.javaw.MainFrame.ContentsPane.MainApplet.AOrderEntryBuyScreen.AOrderEntryPanel1.error_grid;

    if (Securityexception != null) {
        var rowcount = aqConvert.VarToStr(Securityexception.getGridCell_2(0, 2)).trim();
        Log.Message("" + rowcount);

        if (rowcount === "Price is Upper Ceiling") {
            Log.Message("เคสนี้ไม่สามารถส่งได้");
            
        }

        return rowcount;
    } else {
        Log.Message("Sell Grid not found or empty");
        return null;
    }
}



//pass
function getorderexceplower(){
    var Securityexception = Aliases.javaw.MainFrame.ContentsPane.MainApplet.AOrderEntryBuyScreen.AOrderEntryPanel1.error_grid;

    if (Securityexception != null) {
        var rowcount = aqConvert.VarToStr(Securityexception.getGridCell_2(0, 2)).trim();
        Log.Message("" + rowcount);

        if (rowcount === "Price is Lower Floor") {
            Log.Message("เคสนี้ไม่สามารถส่งได้");
            
        }

        return rowcount;
    } else {
        Log.Message("Sell Grid not found or empty");
        return null;
    }
}

//pass
function getorderexcepato(){
    var Securityexception = Aliases.javaw.MainFrame.ContentsPane.MainApplet.AOrderEntryBuyScreen.AOrderEntryPanel1.error_grid;

    if (Securityexception != null) {
        var rowcount = aqConvert.VarToStr(Securityexception.getGridCell_2(0, 2)).trim();
        Log.Message("" + rowcount);

        if (rowcount === "Cannot trade ATO price in MKT open period") {
            Log.Message("เคสนี้ไม่สามารถส่งได้");
            
        }

        return rowcount;
    } else {
        Log.Message("Sell Grid not found or empty");
        return null;
    }
}



//pass
function getorderexcepchange() {
    var Securityexception = Aliases.javaw.MainFrame.ContentsPane.MainApplet.AChangePriceScreen.AChangePricePanel.ErrorMessageLabel;

    if (Securityexception != null) {
        var rowcount = aqConvert.VarToStr(Securityexception.getText()).trim();
        Log.Message("ข้อความจากระบบ: " + rowcount);

        if (rowcount === "Price is Upper Ceiling") {
            Log.Message("❌ เคสนี้ไม่สามารถส่งได้ (Price is Upper Ceiling)");
        } else if (rowcount === "SET Not Allow change limit to market price.") {
            Log.Message("❌ เคสนี้ไม่สามารถส่งได้ (Not Allow change limit to market price)");
        }

        return rowcount;
    } else {
        Log.Message("❌ ไม่พบ ErrorMessageLabel หรือไม่มีข้อความแสดง");
        return null;
    }
}