// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract modXICO is Ownable {
    IERC20 public token;
    address public treasury;

    uint256 public rate;
    uint256 public startTime;
    uint256 public endTime;
    bool public isFinalized = false;

    mapping(address => uint256) public contributions;

    event TokensPurchased(address indexed buyer, uint256 amountBNB, uint256 amountTokens);
    event ICOFinalized(uint256 totalRaised);

    constructor(
        address _token,
        address _treasury,
        uint256 _rate,
        uint256 _startTime,
        uint256 _endTime
    ) Ownable(msg.sender) {
        require(_startTime < _endTime, "Invalid time range");
        token = IERC20(_token);
        treasury = _treasury;
        rate = _rate;
        startTime = _startTime;
        endTime = _endTime;
    }

    receive() external payable {
        buyTokens();
    }

    function buyTokens() public payable {
        require(block.timestamp >= startTime, "ICO has not started yet");
        require(block.timestamp <= endTime, "ICO has ended");
        require(msg.value > 0, "BNB amount must be greater than zero");

        uint256 tokenAmount = msg.value * rate;
        require(token.balanceOf(address(this)) >= tokenAmount, "Not enough tokens in contract");

        contributions[msg.sender] += msg.value;

        token.transfer(msg.sender, tokenAmount);

        emit TokensPurchased(msg.sender, msg.value, tokenAmount);
    }

    function finalizeICO() external onlyOwner {
        require(block.timestamp > endTime, "ICO is still ongoing");
        require(!isFinalized, "ICO already finalized");

        isFinalized = true;
        payable(treasury).transfer(address(this).balance);

        emit ICOFinalized(address(this).balance);
    }

    function withdrawUnsoldTokens() external onlyOwner {
        require(isFinalized, "ICO must be finalized first");
        uint256 remaining = token.balanceOf(address(this));
        token.transfer(owner(), remaining);
    }
}
