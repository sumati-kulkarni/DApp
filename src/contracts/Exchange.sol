// Deposit and Withdraw Funds
// Manage Orders - Make orders or cancel them
// Handle Trades - Charge fees

// TODO
// [X] Set the fee account
// [X] Deposit Ether
// [X] Withdraw Ether
// [X] Deposit tokens
// [X] Withdraw tokens
// [X] Check balances
// [X] Make order
// [X] Cancel order
// [X] Fill order
// [X] Charge Fees

pragma solidity ^0.5.0;

import "./Token.sol";

import "openzeppelin-solidity/contracts/math/SafeMath.sol";

/**
 * The contractName contract does this and that...
 */
contract Exchange {
	using SafeMath for uint256;

	// Variables
	address public feeAccount; // the account that receives exchange
	uint256 public feePercent; // the fee percentage

	address constant ETHER = address(0); // store Ether in tokens mapping with blank address

	// first key - all the tokens that has been deposited address, token addresses
	// second key - address of the user who has deposited the tokens themselves
	mapping(address => mapping(address => uint256)) public tokens;
	mapping(uint256 => _Order) public orders;

	// mapping specific for cancelling order
	mapping(uint256 => bool) public orderCancelled;
	mapping(uint256 => bool) public orderFilled;

	// keep track of orders
	uint256 public orderCount;

	// Events
	event Deposit(
		address token, 
		address user, 
		uint256 amount, 
		uint256 balance
	);

	event Withdraw(
		address token, 
		address user, 
		uint256 amount, 
		uint256 balance
	);

	event Order(
		uint256 id,
		address user,
		address tokenGet, 
		uint256 amountGet, 
		address tokenGive, 
		uint256 amountGive, 
		uint256 timestamp
	);

	event Cancel(
		uint256 id,
		address user,
		address tokenGet, 
		uint256 amountGet, 
		address tokenGive, 
		uint256 amountGive, 
		uint256 timestamp
	);

	event Trade(
		uint256 id,
		address user,
		address tokenGet, 
		uint256 amountGet, 
		address tokenGive, 
		uint256 amountGive, 
		address userFill,
		uint256 timestamp
	);

	// solidity allows to create your own data types with struct
	// blockchain contains the order data
	// model an order
	struct _Order {
		uint256 id;
		address user; // address of person who made the order
		address tokenGet; // address of token they want to purchase
		uint256 amountGet; // amount of tokens they want to get
		address tokenGive; // address of token they want to give
		uint256 amountGive; // amount
		uint256 timestamp;
	}

	// add the order to storage

	constructor(address _feeAccount, uint256 _feePercent) public {
		feeAccount = _feeAccount;
		feePercent = _feePercent;
	}

	// fallback: reverts if Ether is sent to this smart contract by mistake
	function() external {
		revert();
	}

	function depositEther() payable public {
		// solidity allows you to send ether with any function call
		// mag.value also accepts ether. therefore we should have payable
		tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender].add(msg.value);
		emit Deposit(ETHER, msg.sender, msg.value, tokens[ETHER][msg.sender]);
	}

	function withdrawEther(uint256 _amount) public {
		// to check sufficient funds
		require (tokens[ETHER][msg.sender] >= _amount);
		
		tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender].sub(_amount);
		// let the amount go back to the sender
		msg.sender.transfer(_amount);
		emit Withdraw(ETHER, msg.sender, _amount, tokens[ETHER][msg.sender]);
	}

	function depositToken(address _token, uint256 _amount) public {
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


	function withdrawToken(address _token, uint256 _amount) public {
		require(_token != ETHER);
		require(tokens[_token][msg.sender] >= _amount);
		
		tokens[_token][msg.sender] = tokens[_token][msg.sender].sub(_amount);
		require(Token(_token).transfer(msg.sender, _amount));
		emit Withdraw(_token, msg.sender, _amount, tokens[_token][msg.sender]);
	}

	function balanceOf(address _token, address _user) public view returns (uint256 data) {
		return tokens[_token][_user];
	}

	// function to create orders
	function makeOrder(address _tokenGet, uint256 _amountGet, address _tokenGive, uint256 _amountGive) public {
		// instantiate struct
		orderCount = orderCount.add(1);
		// time now is mentioned in Epoch Timestamp
		orders[orderCount] = _Order(orderCount, msg.sender, _tokenGet, _amountGet, _tokenGive, _amountGive, now);
		emit Order(orderCount, msg.sender, _tokenGet, _amountGet, _tokenGive, _amountGive, now);
	}

	function cancelOrder(uint256 _id) public {
		// must be my order and fetch it from my storage
		// Must be a valid order
		_Order storage _order = orders[_id];

		require (address(_order.user) == msg.sender);
		require (_order.id == _id);  // the order must exist
		
		orderCancelled[_id] = true;
		emit Cancel(_order.id, msg.sender, _order.tokenGet, _order.amountGet, _order.tokenGive, _order.amountGive, now);
	}

	function fillOrder(uint256 _id) public {
		// constraint to fill the order
		require(_id > 0 && _id <= orderCount);
		// make sure whether the order is not filled or cancelled
		require(!orderFilled[_id]);
		require(!orderCancelled[_id]);
		// Fetch the order
		_Order storage _order = orders[_id];
		_trade(_order.id, _order.user, _order.tokenGet, _order.amountGet, _order.tokenGive, _order.amountGive);
		// Mark order as filled
		orderFilled[_order.id] = true;
	}

	// internal functions are like private functions
	// need to swap balances
	function _trade(uint256 _orderId, address _user, address _tokenGet, uint256 _amountGet, address _tokenGive, uint256 _amountGive) internal {
		// Fee paid by the user that fills the order, a.k.a msg.sender
		// Fee deducted from _amountGet
			// Charge fees
		uint256 _feeAmount = _amountGive.mul(feePercent).div(100);

		// Execute trade
		// send msg.sender's balance to _tokenGet
		tokens[_tokenGet][msg.sender] = tokens[_tokenGet][msg.sender].sub(_amountGet.add(_feeAmount));
		// take amount from _tokenGet and add it to _user's balance
		// _user is the person who created the order
		tokens[_tokenGet][_user] = tokens[_tokenGet][_user].add(_amountGet);
		tokens[_tokenGet][feeAccount] = tokens[_tokenGet][feeAccount].add(_feeAmount);
		tokens[_tokenGive][_user] = tokens[_tokenGive][_user].sub(_amountGive);
		tokens[_tokenGive][msg.sender] = tokens[_tokenGive][msg.sender].add(_amountGet);
	
		// Emit trade event
		emit Trade(_orderId, _user, _tokenGet, _amountGet, _tokenGive, _amountGive, msg.sender, now);
	}
}

