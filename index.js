
const onScreenObj = Sys.Desktop.ActiveWindow()
const keyMap = {
  enter: '[Enter]',
  left: '[Left]',
  home: '[Home]',
  prtSc: '[PrtSc]',
  numSlash: '[NumSlash]'
}

const onDelayKey = (key, delay = 1000) => {
  Delay(delay)
  onScreenObj.Keys(key)
}

const editPrice = (price) => {
  if (!price) {
    Log.Message("skip edit price !!")
    onDelayKey(keyMap.left)
    return
  }
  Log.Message("editprice: " + price)
  onDelayKey(price)
  onDelayKey(keyMap.enter)
  onDelayKey(keyMap.enter)
  onDelayKey(keyMap.enter)
}

const editVolume = (volume) => {
  if (!volume) {
    Log.Message("skip edit volume !!")
    return
  }
  Log.Message("editvolume: " + volume)
  onDelayKey(keyMap.enter)
  onDelayKey(volume)
  onDelayKey(keyMap.enter)
  onDelayKey(keyMap.enter)
  onDelayKey(keyMap.enter)
}

const editPublish = (publish) => {
  if (!publish) {
    Log.Message("skip edit publish !!")
    return
  }
  Log.Message("editpublish: " + publish)
  onDelayKey(keyMap.enter)
  onDelayKey(keyMap.enter)
  onDelayKey(publish)
  onDelayKey(keyMap.enter)
  onDelayKey(keyMap.enter)
}

const cancelOrder = () => {
  Log.Message("cancelorder")
  onDelayKey(keyMap.prtSc)
  onScreenObj.Keys("50010003")
  onDelayKey(keyMap.enter)
  onDelayKey(keyMap.numSlash)
  onScreenObj.Keys("y")
  onDelayKey(keyMap.enter)
}

function changeOrderV2(no, side, editprice, editvolume, editpublish, cancelorder) {
  Log.Message("Start change order !!")

  if (editprice || editvolume || editpublish || cancelorder) {
    onDelayKey(keyMap.home) // go to change order

    editPrice(editprice)
    editVolume(editvolume)
    editPublish(editpublish)

    if (cancelorder) {
      cancelOrder()
    } else {
      Log.Message("skip cancel order !!")
    }

  } else {
    Log.Message("Change order skip !!")
  }
}
