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
        "symbol": Constants.coinSymbol,
        "interval": String(Constants.callInterval),
        "limit" :String(limit),
        "from": String(time)
    ]
    AF.request("\(Constants.url)/public/linear/kline", method: .get, parameters: params, encoding: URLEncoding.default, headers: [:])
        .validate(statusCode: 200..<300)
        .responseDecodable(of: Response<Price>.self, completionHandler: { response in
            do{
                let data = try response.result.get()
                completeHandler(true, data)
            }catch{
            }
    })
}

func apiGetPrice2(time:Int, limit: Int,completeHandler:@escaping (Bool, Response<Price>) -> Void){
    apiGet(url: "/public/linear/kline?symbol=" + Constants.coinSymbol
                 + "&interval=" + String(Constants.callInterval)
                 + "&limit=" + String(limit)
                 + "&from=" + String(time), completeHandler: completeHandler)
}
