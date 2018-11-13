pragma solidity ^0.4.24;


contract CrowdFunding {
    address private beneficiary;
    address[] private funders;

    uint private deadline;
    uint private startParticipation;
    uint private goal;

    mapping(uint => uint) private fundersIDFunding;
    mapping(address => uint) private addressID;

    modifier isbeneficiary() {
        require(msg.sender == beneficiary, "Cannot be called by you!");
        _;
    }

    modifier isnotbeneficiary() {
        require(msg.sender != beneficiary, "Beneficiary cannot participate");
        _;
    }

    modifier notafterendtime() {
        require(now <= deadline, "Crowd funding Session is already over");
        _;
    }

    modifier onlyafterendtime() {
        require(now >= deadline, "Crowd funding session going on");
        _;
    }

    modifier goalReached() {
        require(this.balance >= goal, "Not enough balance");
        _;
    }

    modifier goalFailed() {
        require(this.balance < goal, "Not enough balance");
        _;
    }

    constructor(uint _goal, uint _timelimit)
    public
    payable {
        beneficiary = msg.sender;
        goal = _goal;
        deadline = startParticipation + _timelimit;
        id = 0;
    }

    function participate(uint _pfee)
    public
    payable
    isnotbeneficiary()
    notafterendtime()
    returns(uint) {
        uint id = funders.push(msg.sender) - 1;
        addressID[msg.sender] = id;
        return tempID;
    }

    function effectivegoal()
    public
    view
    returns(uint) {
        return goal - this.balance;
    }

    function finalize()
    public
    notafterendtime()
    goalReached()
    isbeneficiary() {
        selfdestruct(beneficiary);
    }

    function refund()
    public
    isnotbeneficiary()
    onlyafterendtime()
    goalFailed() {
        uint temp = fundersIDFunding[addressID[msg.sender]];
        fundersIDFunding[addressID[msg.sender]] = 0;
        msg.sender.transfer(temp);
    }
}

