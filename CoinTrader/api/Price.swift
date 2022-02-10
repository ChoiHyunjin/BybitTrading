//
//  price.swift
//  CoinTrader
//
//  Created by choi hyunjin on 2022/02/06.
//

import Foundation
import Alamofire

struct Result : Codable{
	let open_time : Int
	let symbol : String
	let period : String
	let open : String
	let high : String
	let low : String
	let close : String
}

struct Price : Codable{
	let id: Int
	let symbol: String
	let period: String
	let interval: String
	let open_time: Int
	let start_at: Int
	let volume: Double
	let open: Double
	let high: Double
	let low: Double
	let close: Double
	let turnover: Double
}

func apiGetPrice(time:Int, limit: Int,completeHandler:@escaping (Bool, Response<Price>) -> Void){
    let params: Parameters = [
        "interval": "String(Constants.callInterval)",
        "limit" :String(limit),
        "from": String(time)
    ]
    AF.request("/public/linear/kline?symbol=", parameters: params).response{ response in
        guard let response = response.result else { return }
    }
}

func apiGetPrice2(time:Int, limit: Int,completeHandler:@escaping (Bool, Response<Price>) -> Void){
    apiGet(url: "/public/linear/kline?symbol=" + Constants.coinSymbol
                 + "&interval=" + String(Constants.callInterval)
                 + "&limit=" + String(limit)
                 + "&from=" + String(time), completeHandler: completeHandler)
}
