//
//  IndicatorMaker.swift
//  CoinTrader
//
//  Created by choi hyunjin on 2022/02/05.
//

import Foundation

class IndicatorMaker {
	let n: Int
	let k: Int
	let priceManager = PricesManager()
	var ma = 0.0
	
	var touchedBottom = false
	var touchedTop = false
	
	
	init(n: Int, k: Int){
		self.n = n
		self.k = k
	}
	
	convenience init(){
		self.init(n: 20, k:2)
	}
	
	func setPrices(_ prices:[Double]){
		priceManager.prices = prices
	}
	
	func lower() -> Double{
		return self.ma - self.priceManager.getStandardDeviation(during: self.n) * Double(self.k)
	}
	func upper() -> Double{
		return self.ma + self.priceManager.getStandardDeviation(during: self.n) * Double(self.k)
	}
	
	func movingAverage(during: Int) -> Double{
		return self.priceManager.getAverage(during: during)
	}
	
	func pushPrice(price: Double){
		self.priceManager.pushPrice(price: price)
		self.ma = Double(self.movingAverage(during: self.n))
		
		if self.lower() >= price {
			self.touchedBottom = true
		}else if self.upper() <= price {
			self.touchedTop = true
		}
	}
	
	func getBW() -> Double {
		return (self.upper() - self.lower()) / self.ma
	}
	
	func resetTouched () {
		self.touchedTop = false
		self.touchedBottom = false
	}
}
