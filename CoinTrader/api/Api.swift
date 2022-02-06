//
//  api.swift
//  CoinTrader
//
//  Created by choi hyunjin on 2022/02/05.
//

import Foundation

struct Response<T: Decodable> : Decodable{
	let ret_code : Int
	let ret_msg : String
	let ext_code : String
	let ext_info : String
	let time_now : String
	let result: [T]
}

func apiGet<T: Decodable>(url : String, completeHandler: @escaping (Bool, Response<T>) -> Void){
	guard let url = URL(string: "https://api-testnet.bybit.com/" + url) else {
		return
	}
	
	var request = URLRequest(url: url)
	request.httpMethod = "GET"
	
	URLSession.shared.dataTask(with: request){ data, response, error in
		guard error == nil else {
			print("Error: calling GET", error)
			return
		}
		guard let data = data else {
			print( "Error: Did not receive Data")
			return
		}
		guard let response = response as? HTTPURLResponse, (200 ..< 300) ~= response.statusCode else {
			print("Error: request failed", response)
			return
		}
		guard let output = try? JSONDecoder().decode(Response<T>.self, from: data) else {
			print("Error: JSON Data Parsing failed")
			return
		}
		
		completeHandler(true, output)
	}.resume()
}


func apiPost<T: Decodable>(url : String, params: [String: Any], completeHandler: @escaping (Bool, Response<T>) -> Void){
	guard let url = URL(string: "https://api-testnet.bybit.com/" + url) else {
		return
	}
	
	var request = URLRequest(url: url)
	let sendData = try! JSONSerialization.data(withJSONObject: params, options: [])
	request.httpMethod = "POST"
	request.addValue("application/json", forHTTPHeaderField: "Content-Type")
	request.httpBody = sendData
	
	URLSession.shared.dataTask(with: request){ data, response, error in
		guard error == nil else {
			print("Error: calling POST")
			return
		}
		guard let data = data else {
			print( "Error: Did not receive Data")
			return
		}
		guard let response = response as? HTTPURLResponse, (200 ..< 300) ~= response.statusCode else {
			print("Error: request failed")
			return
		}
		guard let output = try? JSONDecoder().decode(Response<T>.self, from: data) else {
			print("Error: JSON Data Parsing failed")
			return
		}
		
		completeHandler(true, output)
	}.resume()
}
