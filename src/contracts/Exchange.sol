// Deposit and Withdraw Funds
// Manage Orders - Make orders or cancel them
// Handle Trades - Charge fees

// TODO
// [X] Set the fee account
// [ ] Deposit Ether
// [ ] Withdraw Ether
// [ ] Deposit tokens
// [ ] Withdraw tokens
// [ ] Check balances
// [ ] Make order
// [ ] Cancel order
// [ ] Fill order
// [ ] Charge Fees

pragma solidity ^0.5.0;

import "./Token.sol";

/**
 * The contractName contract does this and that...
 */
contract Exchange {

	// Variables
	address public feeAccount; // the account that receives exchange
	uint256 public feePercent; // the fee percentage

	constructor(address _feeAccount, uint256 _feePercent) public {
		feeAccount = _feeAccount;
		feePercent = _feePercent;
	}

	function depositToken(address _token, uint _amount) public {
		// which token? This can be any ERC Token - as parameter
		// how much token to deposit - as parameter
		// this represents smart contract in solidity
		Token(_token).transferFrom(msg.sender, address(this), _amount);
		// send tokens to this contract

		// manage balance of exchange

		// emit event
	}
}

