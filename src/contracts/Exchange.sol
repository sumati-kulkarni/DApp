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

import "openzeppelin-solidity/contracts/math/SafeMath.sol";

/**
 * The contractName contract does this and that...
 */
contract Exchange {
	using SafeMath for uint;

	// Variables
	address public feeAccount; // the account that receives exchange
	uint256 public feePercent; // the fee percentage

	address constant ETHER = address(0); // store Ether in tokens mapping with blank address

	// first key - all the tokens that has been deposited address, token addresses
	// second key - address of the user who has deposited the tokens themselves
	mapping(address => mapping(address => uint256)) public tokens;

	// Events
	event Deposit(address token, address user, uint256 amount, uint256 balance);

	constructor(address _feeAccount, uint256 _feePercent) public {
		feeAccount = _feeAccount;
		feePercent = _feePercent;
	}

	function depositEther() payable public {
		// solidity allows you to send ether with any function call
		// mag.value also accepts ether. therefore we should have payable
		tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender].add(msg.value);
		emit Deposit(ETHER, msg.sender, msg.value, tokens[ETHER][msg.sender]);
	}

	function depositToken(address _token, uint _amount) public {
		// TODO: Dont allow Ether Deposits
		require (_token != ETHER);
		
		// which token? This can be any ERC Token - as parameter
		// how much token to deposit - as parameter
		// this represents smart contract in solidity
		// send tokens to this contract
		require(Token(_token).transferFrom(msg.sender, address(this), _amount));

		// manage deposit - update balance
		// default will be zero if no tokens
		tokens[_token][msg.sender]  = tokens[_token][msg.sender].add(_amount);
		
		// emit event
		emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
	}
}

