//
//  TraderTest.swift
//  CoinTraderTests
//
//  Created by choi hyunjin on 2022/02/10.
//

import XCTest
@testable import CoinTrader

class TraderTest: XCTestCase {
	var obj :Trader!
	
	func test(){
		
	}
	
	

    override func setUpWithError() throws {
			self.obj = Trader(startMoney: 10000.0, self.test)
    }

    override func tearDownWithError() throws {
        // Put teardown code here. This method is called after the invocation of each test method in the class.
    }

    func testExample() throws {
			guard let obj = self.obj else {return}
			obj.buy(price: 45000)
			obj.sell(price: 40000)
			XCTAssertEqual(obj.money, 11100)
    }

    func testPerformanceExample() throws {
        // This is an example of a performance test case.
        self.measure {
            // Put the code you want to measure the time of here.
        }
    }

}
