import {tokens, EVM_REVERT} from './helpers'

const Token = artifacts.require("./Token") 
const Exchange = artifacts.require("./Exchange") 

require('chai')
	.use(require('chai-as-promised'))
	.should()

contract('Exchange', ([deployer, feeAccount], user1) => { 
	let token
	// to make exchange available to every test case 
	let exchange
	const feePercent = 10
	
	beforeEach(async () => {
		token = await Token.new()
		// Fetch account from blockchain
		exchange = await Exchange.new(feeAccount, feePercent)
	})
	describe('deployment', () => {
		it('tracks the fee account', async () => {
			// Read token name here
			const result = await exchange.feeAccount()
			// Check if the token name is feeAccount
			result.should.equal(feeAccount) 
		})	

		it('tracks the fee percent', async () => {
			// Read token name here
			const result = await exchange.feePercent()
			// Check if the token name is feeAccount
			result.toString().should.equal(feePercent.toString()) 
		})	
	})

	describe('depositing tokens', () => {

		let result
		let amount

		beforeEach(async () => {
			amount = tokens(10)
			await token.approve(exchange.address, tokens(10), { from: user1})
			const result = await exchange.depositToken(token.address, tokens(10), { from: user1 })
		})

		describe('success', () => {
			it('tracks the token deposit', async () => {
				// Check exchange token balance
				let balance
				balance = await token.balanceOf(exchange.address)
				balance.toString().should.eq(amount.toString())
			})
		})
		describe('failure', () => {

		})
	})
})