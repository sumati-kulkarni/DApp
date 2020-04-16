import {tokens, EVM_REVERT} from './helpers'

const Token = artifacts.require("./Token") 
const Exchange = artifacts.require("./Exchange") 

require('chai')
	.use(require('chai-as-promised'))
	.should()

contract('Exchange', ([deployer, feeAccount, user1]) => { 
	let token
	// to make exchange available to every test case 
	let exchange
	const feePercent = 10
	
	beforeEach(async () => {
		token = await Token.new()
		// Transfer some tokens to user1
		token.transfer(user1, tokens(100), { from: deployer })
		// Fetch account from blockchain to deploy exchange
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
			result = await exchange.depositToken(token.address, tokens(10), { from: user1 })
		})

		describe('success', () => {
			it('tracks the token deposit', async () => {
				// Check exchange token balance
				let balance
				balance = await token.balanceOf(exchange.address)
				balance.toString().should.eq(amount.toString())
				// check tokens on exchange
				balance = await exchange.tokens(token.address, user1)
				balance.toString().should.eq(amount.toString())
			})

			it('emits a Deposit event', async () => {
				// console.log(result.logs)
				const log = result.logs[0]
				log.event.should.eq('Deposit')
				const event = log.args
				// good to have these coz if something is wrong truffle will tell you
				event.token.should.eq(token.address, 'token address is correct')
				event.user.should.eq(user1, 'user address is correct')
				event.amount.toString().should.eq(tokens(10).toString(), 'amount is correct')
				event.balance.toString().should.equal(tokens(10).toString(), 'balance is correct')
			})
		})
		describe('failure', () => {
			it('rejects ether deposits', async() => {
				await exchange.depositToken(ETHER_ADDRESS, tokens(10), { from: user1}).should.be.rejectedWith(EVM_REVERT)
			})

			it('fails when no tokens are approved', async () => {
				await exchange.depositToken(token.address, tokens(10), { from: user1 }).should.be.rejectedWith(EVM_REVERT)
			})
		})
	})
})