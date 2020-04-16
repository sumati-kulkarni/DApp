pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
	
contract Token {
	using SafeMath for uint;

	string public name = "JoisToken";
	string public symbol = "JOIS";
	uint256 public decimals = 18;
	uint256 public totalSupply; // state variables. 

	// Track balances - storing tokens on blockchain
	mapping(address => uint256) public balanceOf; // mapping is associative array holding key-value pairs. uint256 is a unsigned number. That is we never want token balances to be negative
	mapping(address => mapping(address => uint256)) public allowance; // first key is address of deployer, second amt to be approved

	// Events from, to, how many
	event Transfer(address indexed from, address indexed to, uint256 value);
	event Approval(address indexed owner, address indexed spender, uint256 value);


	constructor() public {
		totalSupply = 1000000 * (10 ** decimals); // ether can be divided by 18 decimal places
		balanceOf[msg.sender] = totalSupply;
		// Solidity has some global variables. One of it is msg with a property called sender, sender is the person who is deploying the smart contract
	}

	// Send tokens - deduct balance from one account and credit it to another account
	function transfer(address _to, uint256 _value) public returns (bool success) {
		require(balanceOf[msg.sender] >= _value); // if true then it continues executing next line, if false, it stops execution
		_transfer(msg.sender, _to, _value);
		
		return true;
	}

	function _transfer(address _from, address _to, uint256 _value) internal {
		require(_to != address(0));
		//decrease sender's balance
		// sub is not a native library. Use OpenZeppelin Library - it is a secure library
		// Also use SafeMath library, gives all safe mathematical operations 
		balanceOf[_from] = balanceOf[_from].sub(_value);

		//increase receiver's balance
		balanceOf[_to] = balanceOf[_to].add(_value);

		emit Transfer(_from, _to, _value);
	}

	// Approve tokens
	function approve(address _spender, uint256 _value) public returns (bool success) {
		require(_spender != address(0));
		allowance[msg.sender][_spender] = _value;
		emit Approval(msg.sender, _spender, _value);
		return true;
	}

	// Transfer from
	function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
		// spender must have enough tokens to complete the transfer
		require (_value <= balanceOf[_from]);
		// value must be less than the approved amount than the exchange itself
		require (_value <= allowance[_from][msg.sender]);

		allowance[_from][msg.sender] = allowance[_from][msg.sender].sub(_value);
		_transfer(_from, _to, _value);
		return true;
	}
	
}