//
//  ViewController.swift
//  CoinTrader
//
//  Created by choi hyunjin on 2022/02/05.
//

import UIKit

class ViewController: UIViewController {
	@IBOutlet weak var StartButton: UIButton!
	@IBOutlet weak var MoneyLabel: UILabel!
	@IBOutlet weak var CoinLabel: UILabel!
	@IBOutlet weak var TotalMoneyLabel: UILabel!
	@IBOutlet weak var TimeLabel: UILabel!
	
	var trader : Trader!
	var totalMoney = 10000.0
	
	override func viewDidLoad() {
		super.viewDidLoad()
		self.trader = Trader(startMoney: totalMoney, self.updateUI)
		// Do any additional setup after loading the view.
		self.StartButton.titleLabel?.text = "start"
		self.updateUI()
	}

	@IBAction func onPressStart(_ sender: UIButton) {
		if(trader.isRunning) {
			trader.stop()
			self.StartButton.titleLabel?.text = "start"
		}else{
			self.trader.start()
			self.StartButton.titleLabel?.text = "stop"
		}
	}
	
	func updateUI(){
		self.MoneyLabel.text = String(self.trader.money)
		self.CoinLabel.text = String(self.trader.amount)
		self.TotalMoneyLabel.text = String((self.trader.money + self.trader.amount*self.trader.currentPrice) - self.totalMoney)
		self.TimeLabel.text = Date(timeIntervalSince1970: TimeInterval(self.trader.timestamp)).formatted()
	}
	
}

