//
//  PricesManager.swift
//  CoinTrader
//
//  Created by choi hyunjin on 2022/02/05.
//

import Foundation

class PricesManager {
	var prices: [Double] = []
	let max: Int
	
	init(maxCount: Int) {
		self.max = maxCount
	}
	
	convenience init(){
		self.init(maxCount: Constants.longer)
	}
	
	func pushPrice (price : Double){
		self.prices.append(price)
		if self.prices.count > self.max {
			self.prices.remove(at: 0)
		}
	}
	
	func getAverage(during: Int) -> Double {
		return self.getSum(during: during) / Double(during)
	}
	
	func getSum(during: Int) -> Double {
		let start = self.prices.count - during
		return self.prices.enumerated().reduce(0){
			$0 + ($1.0 >= start ? $1.1 : 0)
		}
	}
	
	func getVariance(during: Int) -> Double{
			let avg = self.getAverage(during: during)
			
			let start = self.prices.count - during
			return self.prices.enumerated().reduce(0, { prev, tpl in
				return prev + (tpl.0 >= start ? (avg - tpl.1)*(avg - tpl.1) : 0)
			}) / Double(during - 1)
	}
	
	func getStandardDeviation(during: Int) -> Double {
		let variance = self.getVariance(during: during)
		return NSDecimalNumber(decimal: Decimal(variance)).doubleValue.squareRoot()
	}
}
