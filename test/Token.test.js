import {tokens, EVM_REVERT} from './helpers'

const Token = artifacts.require("./Token") 

require('chai')
	.use(require('chai-as-promised'))
	.should()

//contract('Token', (accounts) => { // all the accounts used in this contract
contract('Token', ([deployer, receiver, exchange]) => { 
	const name = 'JoisToken'
	const symbol = 'JOIS'
	const decimals = '18'
	const totalSupply = tokens(1000000).toString()
	// to make token available to every test case 
	let token
	
	beforeEach(async () => {
		// Fetch token from blockchain
		token = await Token.new()
	})
	describe('deployment', () => {
		it('tracks the name', async () => {
			// Read token name here
			const result = await token.name()
			// Check if the token name is "My Name"
			result.should.equal(name) 
		})
		it('tracks the symbol', async () => {
			const result = await token.symbol()
			result.should.equal(symbol) 
		})
		it('tracks the decimals', async () => {
			const result = await token.decimals()
			result.toString().should.equal(decimals) 
		})
		it('tracks the total supply', async () => {
			const result = await token.totalSupply()
			result.toString().should.equal(totalSupply.toString()) 
		})
		it('assigns the total supply to the deployer', async () => {
			const result = await token.balanceOf(deployer)
			result.toString().should.equal(totalSupply.toString())
		})
		
	})

	describe('sending tokens', () => {
		let result
		let amount

		// test on success
		describe('success', async () => {
			beforeEach(async () => {
				//token = await Token.new()
				amount = tokens(100)
				result = await token.transfer(receiver, amount, { from: deployer })
			})

			it('transfers token balances', async () => {
				let balanceOf
				// Before transfer
				//balanceOf = await token.balanceOf(deployer)
				//console.log("deployer balance before transfer ", balanceOf.toString())
				//balanceOf = await token.balanceOf(receiver)
				//console.log("receiver balance before transfer ", balanceOf.toString())

				// Transfer
				//await token.transfer(receiver, tokens(100), { from: deployer })

				// After transfer
				balanceOf = await token.balanceOf(deployer)
				balanceOf.toString().should.equal(tokens(999900).toString())
				// console.log("deployer balance after transfer ", balanceOf.toString())
				balanceOf = await token.balanceOf(receiver)
				balanceOf.toString().should.equal(tokens(100).toString())
				// console.log("receiver balance after transfer ", balanceOf.toString())

			})

			it('emits a Transfer event', async () => {
				// console.log(result.logs)
				const log = result.logs[0]
				log.event.should.eq('Transfer')
				const event = log.args
				// good to have these coz if something is wrong truffle will tell you
				event.from.toString().should.eq(deployer, 'from is correct')
				event.to.should.eq(receiver, 'to is correct')
				event.value.toString().should.equal(amount.toString(), 'value is correct')

			})
		})

		// test on failure
		describe('failure', async () => {
			it('rejects insufficient balances', async () => {
				let invalidAmount
				invalidAmount = tokens(100000000) // 100 million - greater than total supply so invalid
				await token.transfer(receiver, invalidAmount, { from: deployer }).should.be.rejectedWith(EVM_REVERT);

				// Attempt transfer tokens, when you have none
				invalidAmount = tokens(10) // recipient has no tokens
				await token.transfer(deployer, invalidAmount, { from: receiver }).should.be.rejectedWith(EVM_REVERT);

			})

			// we dont want to send tokens to no-address that is 0x0
			it('rejects invalid recipients', async () => {
				await token.transfer(0x0, amount, { from: deployer }).should.be.rejected;
			})
		})
	})

	describe('approving tokens', () => {
		let result
		let amount

		beforeEach(async () => {
			amount = tokens(100)
			result = await token.approve(exchange, amount, { from: deployer})
		})

		describe('success', () => {
			it('allocates on allowance for delegated token spending', async () => {
				const allowance = await token.allowance(deployer, exchange)
				allowance.toString().should.eq(amount.toString())

			})

			it('emits an Approval event', async () => {
				// console.log(result.logs)
				const log = result.logs[0]
				log.event.should.eq('Approval')
				const event = log.args
				// good to have these coz if something is wrong truffle will tell you
				event.owner.toString().should.eq(deployer, 'owner is correct')
				event.spender.should.eq(exchange, 'spender is correct')
				event.value.toString().should.equal(amount.toString(), 'value is correct')

			})

		})

		describe('failure', () => {
			it('rejects invalid spenders', async () => {
				await token.approve(0x0, amount, { from: deployer }).should.be.rejected;
			})
			
		})
	})


describe('delegated token transfers', () => {
	let result
	let amount

	beforeEach(async () => {
		amount = tokens(100)
		// transfer happens coz they are approved from the exchange
		await token.approve(exchange, amount, {from: deployer})
	})

	// test on success
	describe('success', async () => {
		beforeEach(async () => {
			//token = await Token.new()
			// amount = tokens(100)
			result = await token.transferFrom(deployer, receiver, amount, { from: exchange })
		})

		it('transfers token balances', async () => {
			let balanceOf
			// Before transfer
			//balanceOf = await token.balanceOf(deployer)
			//console.log("deployer balance before transfer ", balanceOf.toString())
			//balanceOf = await token.balanceOf(receiver)
			//console.log("receiver balance before transfer ", balanceOf.toString())

			// Transfer
			//await token.transfer(receiver, tokens(100), { from: deployer })

			// After transfer
			balanceOf = await token.balanceOf(deployer)
			balanceOf.toString().should.equal(tokens(999900).toString())
			// console.log("deployer balance after transfer ", balanceOf.toString())
			balanceOf = await token.balanceOf(receiver)
			balanceOf.toString().should.equal(tokens(100).toString())
			// console.log("receiver balance after transfer ", balanceOf.toString())

		})

		it('resets the allowance', async () => {
			const allowance = await token.allowance(deployer, exchange)
			allowance.toString().should.eq('0')

		})

		it('emits a Transfer event', async () => {
			// console.log(result.logs)
			const log = result.logs[0]
			log.event.should.eq('Transfer')
			const event = log.args
			// good to have these coz if something is wrong truffle will tell you
			event.from.toString().should.eq(deployer, 'from is correct')
			event.to.should.eq(receiver, 'to is correct')
			event.value.toString().should.equal(amount.toString(), 'value is correct')

		})
	})

	// test on failure
	describe('failure', async () => {
		it('rejects insufficient amounts', async () => {
			let invalidAmount
			// Attempt to transfer too many tokens than the from account has
			// also way more tokens than they are approved for
			invalidAmount = tokens(100000000) // 100 million - greater than total supply so invalid
			// await token.transfer(receiver, invalidAmount, { from: deployer }).should.be.rejectedWith(EVM_REVERT);
			await token.transferFrom(deployer, receiver, invalidAmount, { from: exchange }).should.be.rejectedWith(EVM_REVERT);

			// Attempt transfer tokens, when you have none
			// invalidAmount = tokens(10) // recipient has no tokens
			// await token.transfer(deployer, invalidAmount, { from: receiver }).should.be.rejectedWith(EVM_REVERT);

		})

		// we dont want to send tokens to no-address that is 0x0
		it('rejects invalid recipients', async () => {
			// await token.transfer(0x0, amount, { from: deployer }).should.be.rejected;
			await token.transferFrom(deployer, 0x0, amount, { from: exchange }).should.be.rejected;
		})
	})
})






























})