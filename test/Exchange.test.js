import {tokens, ether, EVM_REVERT, ETHER_ADDRESS} from './helpers'

const Token = artifacts.require("./Token") 
const Exchange = artifacts.require("./Exchange") 

require('chai')
	.use(require('chai-as-promised'))
	.should()

contract('Exchange', ([deployer, feeAccount, user1, user2]) => { 
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

	// we cannot issue refund if the ether is sent back to them with smart contract
	// therefore fallback function 
	describe('fallback', () => {
		it('reverts when Ether is sent', async () => {
			await exchange.sendTransaction({ value: 1, from: user1 }).should.be.rejectedWith(EVM_REVERT)
		})
	})

	describe('depositing Ether', async() => {
		let result
		let amount

		beforeEach(async () => {
			amount = ether(1)
			result = await exchange.depositEther({ from: user1, value: amount})
		})

		it('tracks the ether deposit', async () => {
			const balance = await exchange.tokens(ETHER_ADDRESS, user1)
			balance.toString().should.eq(amount.toString())
		})

		it('emits a Deposit event', async () => {
			// console.log(result.logs)
			const log = result.logs[0]
			log.event.should.eq('Deposit')
			const event = log.args
			// good to have these coz if something is wrong truffle will tell you
			event.token.should.eq(ETHER_ADDRESS, 'ether address is correct')
			event.user.should.eq(user1, 'user address is correct')
			event.amount.toString().should.eq(amount.toString(), 'amount is correct')
			event.balance.toString().should.equal(amount.toString(), 'balance is correct')
		})

	})

	describe('withdrawing Ether', async() => {
		let result
		let amount

		beforeEach(async () => {
			// Deposit ether first
			amount = ether(1)
			await exchange.depositEther({ from: user1, value: amount})
		})

		describe('success', async () => {
			beforeEach(async () => {
				// withdraw Ether
				result = await exchange.withdrawEther(amount, { from: user1})
			})

			it('withdraws Ether funds', async () => {
				const balance = await exchange.tokens(ETHER_ADDRESS, user1)
				balance.toString().should.eq('0')
			})

			it('emits a Withdraw event', async () => {
				const log = result.logs[0]
				log.event.should.eq('Withdraw')
				const event = log.args
				event.token.should.equal(ETHER_ADDRESS)
				event.user.should.equal(user1)
				event.amount.toString().should.eq(amount.toString())
				event.balance.toString().should.equal('0')
			})
		})

		describe('failure', async () => {
			it('rejects withdrawals for insufficient funds', async () => {
				await exchange.withdrawEther(ether(100), { from: user1}).should.be.rejectedWith(EVM_REVERT)
			})
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
				event.amount.toString().should.eq(amount.toString(), 'amount is correct')
				event.balance.toString().should.equal(amount.toString(), 'balance is correct')
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

	describe('withdrawing tokens', async () => {
		let result
		let amount

		describe('success', async () => {
			beforeEach(async () => {
				// Deposit tokens first
				amount = tokens(10)
				await token.approve(exchange.address, amount, { from: user1})
				await exchange.depositToken(token.address, amount, { from: user1})

				// Withdraw tokens
				result = await exchange.withdrawToken(token.address, amount, { from: user1})
			})

			it('withdraws token funds', async () => {
				const balance = await exchange.tokens(token.address, user1)
				balance.toString().should.eq('0')
			})

			it('emits a Withdraw event', async () => {
				const log = result.logs[0]
				log.event.should.eq('Withdraw')
				const event = log.args
				event.token.should.equal(token.address)
				event.user.should.equal(user1)
				event.amount.toString().should.eq(amount.toString())
				event.balance.toString().should.equal('0')
			})
		})

		describe('failure', async () => {
			it('rejects Ether withdrawals', async () => {
				await exchange.withdrawToken(ETHER_ADDRESS, tokens(10), { from: user1}).should.be.rejectedWith(EVM_REVERT)
			})
			it('rejects withdrawals for insufficient funds', async () => {
				await exchange.withdrawToken(token.address, tokens(10), { from: user1}).should.be.rejectedWith(EVM_REVERT)
			})
		})
	})

	describe('checking balances', async () => {
		beforeEach(async () => {
			exchange.depositEther({ from: user1, value: ether(1) })
		})

		it('returns user balance', async () => {
			const result = await exchange.balanceOf(ETHER_ADDRESS, user1)
			result.toString().should.equal(ether(1).toString())
		})
	})

	describe('making orders', async () => {
		let result

		beforeEach(async () => {
			result = await exchange.makeOrder(token.address, tokens(1), ETHER_ADDRESS, ether(1), { from: user1})
		})

		it('tracks the newly created order', async () => {
			const orderCount = await exchange.orderCount()
			orderCount.toString().should.equal('1')
			const order = await exchange.orders('1')
			order.id.toString().should.eq('1', 'id is correct')
			order.user.should.equal(user1, 'user is correct')
			order.tokenGet.should.eq(token.address, 'tokenGet is correct')
			order.amountGet.toString().should.eq(tokens(1).toString(), 'amountGet is correct')
			order.tokenGive.should.eq(ETHER_ADDRESS, 'tokenGive is correct')
			order.amountGive.toString().should.eq(ether(1).toString(), 'amountGive is correct')
			order.timestamp.toString().length.should.be.at.least(1, 'timestamp is present')
		})

		it('emits a Order event', async () => {
			const log = result.logs[0]
			log.event.should.eq('Order')
			const event = log.args
			event.id.toString().should.eq('1', 'id is correct')
			event.user.should.equal(user1, 'user is correct')
			event.tokenGet.should.eq(token.address, 'tokenGet is correct')
			event.amountGet.toString().should.eq(tokens(1).toString(), 'amountGet is correct')
			event.tokenGive.should.eq(ETHER_ADDRESS, 'tokenGive is correct')
			event.amountGive.toString().should.eq(ether(1).toString(), 'amountGive is correct')
			event.timestamp.toString().length.should.be.at.least(1, 'timestamp is present')
		})
	})

	describe('order actions', async () => {
		beforeEach(async () => {
			// user1 deposits order
			await exchange.depositEther({ from: user1, value: ether(1)})
			// user1 makes an order to buy tokens with Ether
			await exchange.makeOrder(token.address, tokens(1), ETHER_ADDRESS, ether(1), { from: user1})
		})

		describe('cancelling orders', async () => {
			let result

			describe('success', async () => {
				beforeEach(async () => {
					result = await exchange.cancelOrder('1', { from: user1})
				})
			
				it('updates cancelled orders', async () => {
					const orderCancelled = await exchange.orderCancelled(1)
					orderCancelled.should.equal(true)
				})

				it('emits a Cancel event', async () => {
					const log = result.logs[0]
					log.event.should.eq('Cancel')
					const event = log.args
					event.id.toString().should.eq('1', 'id is correct')
					event.user.should.equal(user1, 'user is correct')
					event.tokenGet.should.eq(token.address, 'tokenGet is correct')
					event.amountGet.toString().should.eq(tokens(1).toString(), 'amountGet is correct')
					event.tokenGive.should.eq(ETHER_ADDRESS, 'tokenGive is correct')
					event.amountGive.toString().should.eq(ether(1).toString(), 'amountGive is correct')
					event.timestamp.toString().length.should.be.at.least(1, 'timestamp is present')
				})
			})

			describe('failure', async () => {
				it('rejects invalid order ids', async () => {
					const invalidOrderId = 99999
					await exchange.cancelOrder(invalidOrderId, { from: user1}).should.be.rejectedWith(EVM_REVERT)
				})
				it('rejects unauthorized cancellations', async () => {
					// Try to cancel order from another order
					await exchange.cancelOrder('1', { from: user2}).should.be.rejectedWith(EVM_REVERT)
				})
			})
		})

	})
})