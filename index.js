const url = "http://10.22.26.36/ocr/text2";
const url_dashboard = "http://10.22.26.77:3030/api/addjsondata";
const imagePath = "D:\\dev_cke\\drx\\images";
const orderstatusFile = "D:\\dev_cke\\drx\\images\\order-status.png";
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
  '1firm': '[PTD-2FIRM]',
  '2firm': '[PTD-2FIRM]'
};

const onDelayDirector = (direct, delay = 1000) => {
  Delay(delay);
  onScreenObj.Keys(directLocation[direct]);
};

const checkSideOrder = (side) => (side === 'b' || side === 's') ? side : '';

const checkPrice = (price, side) => {
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
    const result = getFloor(side);
    if (equal(result, invalid) || result === "") return false;
    onScreenObj.Keys(StrToFloat(result));
    if (side !== "b") {
      onScreenObj.Keys("[Enter]");
      onScreenObj.Keys("y");
    }
    return true;
  }
};

const checkCondition = (condition) => {
  if (!condition) return '';
  switch (condition.toLowerCase()) {
    case 'ioc': return 'i';
    case 'fok': return 'f';
    case 'gtc': return 'c';
    case 'gtd': return 'd';
    default: return '';
  }
};

const sendNormalOrder = (side, stock, price, volume, account, publish, condition, date, nvdr, ot) => {
  const locationSide = checkSideOrder(side.toLowerCase());
  if (!locationSide) return;

  onDelayDirector(locationSide);
  onDelayDirector('left');
  onScreenObj.Keys(stock);
  onDelayDirector("enter");
  onScreenObj.Keys(volume);
  onDelayDirector("enter");

  if (!checkPrice(price, side)) return;
  onDelayDirector("enter");
  onScreenObj.Keys(account);
  onDelayDirector("enter");

  if (publish || condition || date || nvdr || ot) {
    for (let i = 0; i < 4; i++) onScreenObj.Keys(directLocation.left);
    if (publish) onScreenObj.Keys(publish);
    onDelayDirector("enter");
    if (condition) onScreenObj.Keys(checkCondition(condition));
    onDelayDirector("enter");
    if (date && condition.toLowerCase() === "gtd") onScreenObj.Keys(date);
    onDelayDirector("enter");
    if (nvdr) onScreenObj.Keys(nvdr);
    onDelayDirector("enter");
    if (ot) onScreenObj.Keys(ot);
    onDelayDirector("enter");
  }
  onDelayDirector("enter");
};

function showOrderNo() { 
	const onscreenObj = Sys.Desktop.ActiveWindow();

	onscreenObj.Keys("[PrtSc]");
	onscreenObj.Keys("[Left]");
	onscreenObj.Keys(GlobalOrderNo);
	onscreenObj.Keys("[Enter]");

	Log.Message("Latest OCR Order No is:\n" + GlobalOrderNo);
}



const send1FirmAndBuyinOrder = (action, stock, price, volume, account1, account2, brokerId, controlKey, nvdr1, nvdr2) => {
 // onDelayDirector('Alt+c', 1000); 
 onDelayDirector(action);
    onDelayDirector('f1');
    onDelayDirector('firm');
	onScreenObj.Keys(stock);
	onDelayDirector('enter');
	onScreenObj.Keys(volume);
	onDelayDirector('enter');
	onScreenObj.Keys(price);
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
	onDelayDirector('1firm');
	onScreenObj.Keys(side);
	onDelayDirector('enter');
	onScreenObj.Keys(stock);
	onDelayDirector('enter');
	onScreenObj.Keys(volume);
	onDelayDirector('enter');
	onScreenObj.Keys(price);
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

const changeOrder = (ordno, price, volume, publish) => {
	onDelayDirector('home');
	if (price) onScreenObj.Keys(price);
	onDelayDirector('enter');

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
    const oNo = getOrderno();
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
  }

  else if (action === '1firm' || action === 'buyin') {
    send1FirmAndBuyinOrder(action, stock, price, volume, account1, account2, brokerId, controlKey, nvdr1, nvdr2);
  }

  else if (action === '2firm') {
    send2FirmOrder(side, stock, price, volume, account, nvdr, brokerId, controlKey);
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

    if (price || volume || publish) changeOrder(ordno, price, volume, publish);
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
   //   let mainApplet = Aliases.javaw.MainFrame.ContentsPane.MainApplet;
    //  mainApplet.AViewOrderConfirmTScreen.AOrderConfirmTPanel1.OrderConfirmGrid.Drag(
    //    1741,
    //    49,
    //    -1500,
     //   -7
    //  ); // Drag to con
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

function getFloor(side) {
  const floorFile = "D:\\dev_cke\\drx\\images\\floor-price.png";   

  let region;
  if (side === "b") {
    region = Regions.CreateRegionInfo(
      Aliases.javaw.MainFrame.ContentsPane.MainApplet.AOrderEntryBuyScreen.AOrderEntryPanel1,
      108,
      70,
      56,
      34,
      false
    );
  } else {
    region = Regions.CreateRegionInfo(
      Aliases.javaw.MainFrame.ContentsPane.MainApplet.AOrderEntrySellScreen.AOrderEntryPanel1,
      106,
      70,
      62,
      32,
      false
    );
  }
  
  var pic = region.Picture();
  Log.Picture(pic, "image floor price");
  pic.SaveToFile(floorFile);

  const b = getByteFromFile(floorFile);
  const aqHttpResponse = callApi(b, "FLOOR");
  deleteFile(floorFile);

  const obj = JSON.parse(aqHttpResponse.Text);

  let price = invalid;
  if (aqString.Compare(obj.result, "true", false) === 0) {
    price = cleanNumber(obj.text).split("\n");
  }
  return price;
}


function getOrderno(retry = true) {
  try {
    const timestamp = new Date().getTime();
    const tempFile = `D:\\imp_pat\\image\\floor-price-${timestamp}.png`;

    var region = Regions.CreateRegionInfo(
      Aliases.javaw.MainFrame.ContentsPane.MainApplet.AOrderEntryBuyScreen.AOrderEntryPanel1,
      765, 68, 60, 35,
      false
    );

    var pic = region.Picture();
    pic.SaveToFile(tempFile);
    Log.Message("Saved orderNo image to: " + tempFile);
    Log.Picture(pic, "Captured OrderNo region");

    const b = getByteFromFile(tempFile);
    const aqHttpResponse = callApi(b, "Floor");
    Log.Message("OCR API Response: " + aqHttpResponse.Text);

    const obj = JSON.parse(aqHttpResponse.Text);
    let orderNo = "invalid";

    if (aqString.Compare(obj.result, "true", false) === 0 && obj.text.trim() !== "") {
      Log.Message("Raw OCR Text: " + obj.text);
      const cleaned = cleanNumber(obj.text);
      Log.Message("Cleaned OCR Text: " + cleaned);
      orderNo = cleaned.split("\n")[0];
      Log.Message("✅ OCR read orderNo: " + orderNo);
      return orderNo;
    } else {
      Log.Warning("⚠️ OCR ไม่ได้เลขมา (text ว่าง)");
    }

 
    if (retry) {
      Log.Warning("🔁 ลอง OCR ใหม่อีกครั้ง...");
      Delay(1000);
      return getOrderno(false);
    }

    Log.Error("❌ Failed to get valid OrderNo from OCR (ว่างทั้งสองรอบ)");
    return "";
  } catch (err) {
    Log.Error("❌ getOrderno() error: " + err.message);
    return "";
  }
}


function getByteFromFile(file) {
  f = aqFile.OpenBinaryFile(file, aqFile.faRead);
  var b = f.ReadBytes();
  f.Close();
  return b;
}

function deleteFile(file) {
  aqFile.Delete(file);
}
function callApi(b, p) {
  var aqHttpRequest = aqHttp.CreatePostRequest(url);
  aqHttpRequest.SetHeader("Content-Type", "image/png");
  aqHttpRequest.SetHeader("processing", p);
  var aqHttpResponse = aqHttpRequest.Send(b);
  httpResponse(aqHttpResponse);
  return aqHttpResponse;
}

function sendtestresult(requestBody) {
  var aqHttpRequest = aqHttp.CreatePostRequest(url_dashboard);
  aqHttpRequest.SetHeader("Content-Type", "application/json");
  var aqHttpResponse = aqHttpRequest.Send(requestBody);
  Log.Message(requestBody);
  //httpResponse(aqHttpResponse);
  return aqHttpResponse;
}
function httpResponse(aqHttpResponse) {
  // Log.Message(aqHttpResponse.AllHeaders); // All headers
  // Log.Message(aqHttpResponse.GetHeader("Content-Type")); // A specific header
  // Log.Message(aqHttpResponse.StatusCode); // A status code
  // Log.Message(aqHttpResponse.StatusText); // A status text
  Log.Message(aqHttpResponse.Text); // A response body
}

function cleanNumber(text) {
  const newtext = text.replace(",", "");
  return newtext;
}

function keyfloor() {
  var onscreenObj = Sys.Desktop.ActiveWindow();
  onscreenObj.Keys("8"); // ctrl+b btn
}

function ScreenShot_F2(symbol) {
  if (symbol_tmp != symbol) {
    let onscreenObj = Sys.Desktop.ActiveWindow();
    let javaw = Aliases.javaw;
    let mainApplet = javaw.MainFrame.ContentsPane.MainApplet;
    mainApplet.Keys("[F2]");
    mainApplet.BInputScreen.InputLinePanel1.filterTextField.filterTextField.Keys(symbol);
    onscreenObj.Keys("[Enter]");
    var pic_f2 = Regions.CreateRegionInfo(Aliases.javaw.MainFrame.ContentsPane.MainApplet, 0, 2, 1920, 1005, false);
    var pic = pic_f2.Picture();
    let dd = today.getDate();
    let mm = Number(today.getMonth()+1);
    if (String(dd).length === 1) {
      dd = "0" + dd;
    }
    if (String(mm).length === 1) {
      mm = "0" + mm;
    } 
    let datepic = dd + "_" + mm + "_" + today.getFullYear();
    let pic_path = "D:\\dev_cke\\log\\2Open1\\Log_" + datepic + "\\MarketByPrice-Pic\\" + symbol + ".png";
    Log.Message(pic_path);
    pic.SaveToFile(pic_path);
    symbol_tmp = symbol;
  } else {
    symbol_tmp = symbol;
  }
}

function ScreenShot_Vieworder()
{
    let onscreenObj = Sys.Desktop.ActiveWindow();
    let javaw = Aliases.javaw;
    let panel = javaw.LoginDialog.ContentsPane;
    let mainFrame = javaw.MainFrame;
    let mainApplet = mainFrame.ContentsPane.MainApplet;
    let AViewOrderConfirmTScreen = mainApplet.AViewOrderConfirmTScreen;
    let AOrderConfirmTPanel = AViewOrderConfirmTScreen.AOrderConfirmTPanel1;
    let dd = today.getDate();
    let mm = Number(today.getMonth()+1);
    if (String(dd).length === 1) {
      dd = "0" + dd;
    }
    if (String(mm).length === 1) {
      mm = "0" + mm;
    } 
    let datepic = dd + "_" + mm + "_" + today.getFullYear();
    for (let i = 0; i < noacc.length; i++) {
      Log.Message("dataaaaaaaaaaaa" + noacc[i].account +"/"+ noacc[i].no);
     // onscreenObj.Keys("[PrtSc]");
       onscreenObj.Keys(noacc[i].account);
        onscreenObj.Keys("[Enter]");
        onscreenObj.Keys("^b");
      for (let y = 0; y < Math.ceil(noacc[i].no/7); y++) {
        var Vieworder = Regions.CreateRegionInfo(Aliases.javaw.MainFrame.ContentsPane.MainApplet, 0, 2, 1920, 1005, true)
    var pic = Vieworder.Picture();
    let dirdatepic = "D:\\dev_cke\\log\\2Open1\\Log_" + datepic + "\\Vieworder-Pic\\" + noacc[i].account + y + "_S-Vieworder-Pic.png";
    Log.Message(dirdatepic);
    pic.SaveToFile(dirdatepic);
    Aliases.javaw.MainFrame.ContentsPane.MainApplet.AViewOrderConfirmTScreen.AOrderConfirmTPanel1.OrderConfirmGrid.Drag(1531, 50, -1371, 10);
    var Vieworder2 = Regions.CreateRegionInfo(Aliases.javaw.MainFrame.ContentsPane.MainApplet, 0, 2, 1920, 1005, true)
    var pic2 = Vieworder2.Picture();
    let dirdatepic2 = "D:\\dev_cke\\log\\2Open1\\Log_" + datepic + "\\Vieworder-Pic\\" + noacc[i].account + y + "_E-Vieworder-Pic.png";
    Log.Message(dirdatepic2);
    pic2.SaveToFile(dirdatepic2);
    Aliases.javaw.MainFrame.ContentsPane.MainApplet.AViewOrderConfirmTScreen.AOrderConfirmTPanel1.OrderConfirmGrid.Drag(1310, 151, 1536, 4);
    AViewOrderConfirmTScreen.Panel.NextButton.Click(37, 15);
      
    } 
     }
}

function Test1()
{
  Regions.AOrderEntryPanel1.Check(Regions.CreateRegionInfo(Aliases.javaw.MainFrame.ContentsPane.MainApplet.AOrderEntryBuyScreen.AOrderEntryPanel1, 759, 68, 108, 36, false));
}

function Test2()
{
  Regions.AOrderEntryPanel11.Check(Regions.CreateRegionInfo(Aliases.javaw.MainFrame.ContentsPane.MainApplet.AOrderEntryBuyScreen.AOrderEntryPanel1, 757, 68, 50, 35, false));
}

function Test3()
{
  let explorer = Aliases.explorer;
  explorer.wndTaskListThumbnailWnd.Click(526, 104);
  explorer.wndimage.Click(574, 180);
  Regions.AOrderEntryPanel12.Check(Regions.CreateRegionInfo(Aliases.javaw.MainFrame.ContentsPane.MainApplet.AOrderEntryBuyScreen.AOrderEntryPanel1, 759, 71, 66, 31, false));
}