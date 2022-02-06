//
//  Trader.swift
//  CoinTrader
//
//  Created by choi hyunjin on 2022/02/05.
//

import Foundation

class Trader {
	var indicatorMaker = IndicatorMaker()
	var isRunning = false
	
	var amount = 0.0
	var money = 100000.0
	var currentPrice = 0.0
	var timestamp = 0
	
	private let short = Constants.shorter
	private let long = Constants.longer
	private var counter = 1
	private var test = true
	private let onUpdate : () -> Void
	
	init(startMoney: Double,_ update: @escaping () -> Void){
		self.onUpdate = update
		self.money = startMoney
	}
	
	func start(){
		guard self.counter > 0 else { return }
		self.isRunning = true
		
//		timestamp = Int(Date().timeIntervalSince1970) - (self.test ? 60 * 60 * 24 * 365 * 2 : Constants.callInterval * 60 * long)
		timestamp = 60 * 60 * 24 * ( 365 * 51 + 10 + 365 - 31)
		
		apiGetPrice(time: self.timestamp, limit: 20, completeHandler: {success, data in
			guard self.isRunning else { return }
			self.indicatorMaker.setPrices(data.result.map{
				$0.close
			})
			let price = data.result.last!
			self.timestamp = price.open_time
			 
			DispatchQueue.global().async {
				print("thread start")
				self.counter -= 1
				if(self.test){
					 self.doTest()
				}else{
					while(self.isRunning){
						sleep(UInt32(60 * Constants.callInterval))
						apiGetPrice(time: self.timestamp, limit: 1, completeHandler: self.onSucessGet)

					}
					 
				 }
				print("thread stopped")
				self.counter += 1
			}
		})
	}
	
	func stop(){
		self.isRunning = false
	}
	
	func doTest(){
		guard self.isRunning else { return }
		apiGetPrice(time: self.timestamp, limit: 200, completeHandler: self.onSucessGetTest)
	}
	
	func onSucessGet(_ success: Bool, _ data: Response<Price>){
		guard data.result.count > 0 else {
			return
		}
		let price = data.result.last!
		self.execute(price:price)
		
		DispatchQueue.main.async {
			self.onUpdate()
		}
	}
	
	func onSucessGetTest(_ success: Bool, _ data: Response<Price>){
		guard data.result.count > 0 else {
			return
		}
		data.result.forEach{
			self.execute(price:$0)
		}
		
		DispatchQueue.main.async {
			self.onUpdate()
		}
		sleep(1)
		print(data.result.last)
		self.doTest()
	}
	
	func execute(price: Price){
		self.timestamp = price.open_time + 1
		self.currentPrice = price.close
		self.calculate(price: price)
		self.indicatorMaker.pushPrice(price: price.close)
	}
	
	private func calculate(price: Price){
		let price = price.close
		if amount > 0 {
			onHasCoin(price: price)
		} else {
			onNoCoin(price: price)
		}
	}
	
	private func onHasCoin(price: Double) {
		let bw = indicatorMaker.getBW()
		if bw >= 0.01 {
			let shortMA = indicatorMaker.movingAverage(during: self.short)
			let longMA = indicatorMaker.movingAverage(during: self.long)
			
			if shortMA > longMA {
				sell(price: price)
			}else {
				return
			}
		}else if indicatorMaker.touchedBottom && price >= indicatorMaker.movingAverage(during: self.short){
			sell(price: price)
		}
	}
	
	private func onNoCoin(price: Double){
		let bw = indicatorMaker.getBW()
		if bw >= 0.01 {
			
		}else if indicatorMaker.touchedTop && price <= indicatorMaker.movingAverage(during: self.short){
			buy(price: price)
		}
	}
	
	private func sell(price: Double){
		self.money += price * self.amount
		self.amount = 0
		self.indicatorMaker.resetTouched()
		print("[sell] money:", self.money, ", amount:", String(self.amount))
		print(price, ", bw:", self.indicatorMaker.getBW(),
					", ma6:", self.indicatorMaker.movingAverage(during: 6),
					", ma20:", self.indicatorMaker.movingAverage(during: 20),
					", touchedTop:", self.indicatorMaker.touchedTop,
					", touchedBottom:", self.indicatorMaker.touchedBottom,
					", upper:", self.indicatorMaker.upper(),
					", lower:", self.indicatorMaker.lower(),
					", subs:", self.indicatorMaker.upper()-self.indicatorMaker.lower())
	}
	
	private func buy(price: Double){
		let amount = Double(String(format: "%.3f", (self.money / price)))!
		self.money -= price * amount
		self.amount += amount
		self.indicatorMaker.resetTouched()
		print("[buy] money:", self.money, ", amount:", String(self.amount))
		print(price, ", bw:", self.indicatorMaker.getBW(),
					", ma6:", self.indicatorMaker.movingAverage(during: 6),
					", ma20:", self.indicatorMaker.movingAverage(during: 20),
					", touchedTop:", self.indicatorMaker.touchedTop,
					", touchedBottom:", self.indicatorMaker.touchedBottom,
					", upper:", self.indicatorMaker.upper(),
					", lower:", self.indicatorMaker.lower(),
					", subs:", self.indicatorMaker.upper()-self.indicatorMaker.lower())
	}
	
	deinit{
		self.isRunning = false
	}
}
