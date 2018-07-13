pragma solidity ^0.4.17;

contract Lottery {
    address public manager;
    address[] public players;
    
    function Lottery() public {
        manager = msg.sender;  
    }
    
    function enter() public payable {
        require(msg.value > .01 ether);  // automatically converts .01 into ether
        players.push(msg.sender);
    }
    
    function random() private view returns (uint) {
        //keccak256(); same as sha3()
        return uint(keccak256(block.difficulty, now, players));  // block and now is global variable
    }
    
    function pickWinner() public restricted { 
        
        uint index = random() % players.length;
        // transfer the current balance of the current contract to the address of player
        players[index].transfer(this.balance);  // this refers to current contract. 
        
        // resetting the players (dynamic arrays)
        players = new address[](0);  // size 0
    }
    
    modifier restricted() {
        require(msg.sender == manager);
        _;
    }
    
    function getPlayers() public view returns (address[]) {
        return players;
    }
}