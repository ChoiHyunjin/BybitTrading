//
//  IndicatorMakerTest.swift
//  CoinTraderTests
//
//  Created by choi hyunjin on 2022/02/06.
//

import XCTest
@testable import CoinTrader

class IndicatorMakerTest: XCTestCase {
	let obj = IndicatorMaker()
	
	override func setUpWithError() throws {
			// Put setup code here. This method is called before the invocation of each test method in the class.
	}

	override func tearDownWithError() throws {
			// Put teardown code here. This method is called after the invocation of each test method in the class.
	}
	
	func testExample() throws {
		obj.setPrices([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20])
		let res = obj.priceManager.getStandardDeviation(during: 20)
		XCTAssertEqual(res, 5.93, accuracy: 0.01)
	}
	
	func testExample2() throws {
		obj.setPrices([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20])
		let res = obj.priceManager.getVariance(during: 20)
		XCTAssertEqual(res, 35)
	}
	
	func testExample3() throws {
		obj.setPrices([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20])
		let res = obj.priceManager.getAverage(during: 20)
		XCTAssertEqual(res, 10.5)
	}

	func testPerformanceExample() throws {
			// This is an example of a performance test case.
			self.measure {
					// Put the code you want to measure the time of here.
			}
	}

}
