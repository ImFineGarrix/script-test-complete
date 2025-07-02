const onScreenObj = Sys.Desktop.ActiveWindow()
const directLocation = {
	enter: '[Enter]',
	left: '[Left]',
	right: '[Right]',
	prtSc: '[PrtSc]',
	f2: '[F2]',
	numSlash: '[NumSlash]',
	s: '^s',
	b: '^b',
	buyin: '[Buyin]',
	'1firm': '[PTD-1FIRM]',
	'2firm': '[PTD-2FIRM]'
}

const onDelayDirector = (direct) => {
	Delay(1000)
	onScreenObj.Keys(directLocation[direct])
}

const checkSideOrder = (side) => {
	if (side === 'b' || side === 's') {
		return side
	}
	return ''
}

const checkPrice = (price) => {
	if (!price) return ''
	switch (price.toLowerCase()) {
		case 'mkt':
			return 'k';
		case 'mtl':
			return 'l';
		case 'ato':
			return 'a';
		case 'atc':
			return 'c';
		case 'upper':
			return '1000';
		case 'lower':
			return '0.01';
		default:
			return price
	}
}

const checkConditon = (condition) => {
	switch (condition.toLowerCase()) {
		case 'ioc':
			return 'i';
		case 'fok':
			return 'f';
		case 'gtc':
			return 'c';
		case 'gtd':
			return 'd'
		default:
			return ''
	}
}


const sendNormalOrder = (side, stock, price, volume, account, publish, condition, date, nvdr, ot) => {
	const locationSide = checkSideOrder(side.toLowerCase())
	const alreadyPrice = checkPrice(price)

	if (!locationSide || !alreadyPrice) {
		Log.Message(`Parameter not correct => side: ${side}, price: ${price}`)
	} else {
		onDelayDirector(locationSide)

		// key order
		onScreenObj.Keys(stock)
		onDelayDirector('enter')
		onScreenObj.Keys(volume)
		onDelayDirector('enter')
		onScreenObj.Keys(alreadyPrice)
		onDelayDirector('enter')
		onScreenObj.Keys(account)
		onDelayDirector('enter')

		// condition
		if (publish || condition || nvdr || ot) {
			for (let i = 0; i < 4; i++) {
				onScreenObj.Keys(directLocation.left)
			}
			if (publish) {
				onScreenObj.Keys(publish)
			}
			onDelayDirector('enter')
			if (condition) {
				onScreenObj.Keys(checkPrice(condition))
			}
			onDelayDirector('enter')
			if (date && condition.toLowerCase() === 'gtd') {
				onScreenObj.Keys(date)
			}
			onDelayDirector('enter')
			if (nvdr) {
				onScreenObj.Keys(nvdr)
			}
			onDelayDirector('enter')
			if (ot) {
				onScreenObj.Keys(ot)
			}
			onDelayDirector('enter')
		}
		onDelayDirector('enter')

		Log.Message(`Key Order Succes with Ordno: `)
	}
}

const send2FirmAndBuyinOrder = (action, stock, price, volume, account1, account2, brokerId, controlKey) => {
	onDelayDirector(action)
	onScreenObj.Keys(stock)
	onDelayDirector('enter')
	onScreenObj.Keys(volume)
	onDelayDirector('enter')
	onScreenObj.Keys(price)
	onDelayDirector('enter')
	onScreenObj.Keys(account1)
	onDelayDirector('enter')
	if (nvdr1) {
		onScreenObj.Keys(nvdr1)
	}
	onDelayDirector('enter')
	onScreenObj.Keys(brokerId || '00U8')
	onDelayDirector('enter')
	onScreenObj.Keys(account2)
	onDelayDirector('enter')
	if (nvdr2) {
		onScreenObj.Keys(nvdr2)
	}
	onDelayDirector('enter')
	onScreenObj.Keys(controlKey || '')
	onDelayDirector('enter')
	onDelayDirector('enter')
}

const send1FirmOrder = (side, stock, price, volume, account, brokerId, controlKey) => {
	onDelayDirector('1firm')
	onScreenObj.Keys(side)
	onDelayDirector('enter')
	onScreenObj.Keys(stock)
	onDelayDirector('enter')
	onScreenObj.Keys(price)

}

const changeOrder = (ordno, price, volume, publish) => {

}

const cancelOrder = (ordno) => {
	onDelayDirector('prtSc')
	onDelayDirector('left')
	onScreenObj.Keys(ordno)
	onDelayDirector('enter')
	onDelayDirector('numSlash')
	onScreenObj.Keys('y')
	onDelayDirector('enter')
	Log.Message(`Cancel Order => ordno: ${ordno}`)
}

const main = () => {}



