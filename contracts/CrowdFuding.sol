pragma solidity ^0.4.24;


contract Crowdfunding {
    address private beneficiary;
    address[] private funders;

    uint private deadline;
    uint private startParticipation;
    uint private goal;
    uint private totalRaised = 0;
    uint private currentBalance=0;
    uint private id;

    mapping(uint => uint) private fundersIDFunding;
    mapping(address => uint) private addressID;

    modifier isbeneficiary() {
        require(msg.sender == beneficiary, "Can't be called");
        _;
    }

    modifier isnotbeneficiary() {
        require(msg.sender != beneficiary, "Beneficiary cannot participate");
        _;
    }

    modifier notbeforestarttime(uint ptime) {
        require(ptime >= startParticipation, "Can't participate before the starting time");
        _;
    }

    modifier notafterendtime(uint ptime) {
        require(ptime <= deadline, "Crowd funding Session is already over");
        _;
    }

    modifier onlyafterendtime(uint ptime) {
        require(ptime >= deadline, "Crowd funding session going on");
        _;
    }

    modifier morebalance(uint balance) {
        require(balance >= goal, "Not enough balance");
        _;
    }

    modifier lessbalance(uint balance) {
        require(balance < goal, "Not enough balance");
        _;
    }

    constructor(uint _goal, uint _timelimit)
    public
    payable {
        beneficiary = msg.sender;
        goal = _goal;
        startParticipation = now;
        deadline = startParticipation + _timelimit;
        id = 0;
    }

    function participate(uint _pfee)
    public
    payable
    isnotbeneficiary()
    notbeforestarttime(now)
    notafterendtime(now)
    returns(uint) {
        uint tempID = id;
        funders.push(msg.sender) - 1;
        addressID[msg.sender] = id;
        id = id + 1;
        totalRaised = totalRaised + _pfee;
        currentBalance = totalRaised;
        return tempID;
    }

    function effectivegoal()
    public
    view
    returns(uint) {
        uint te = goal - currentBalance;
        return te;
    }

    function finalize()
    public
    notafterendtime(now)
    morebalance(currentBalance)
    isbeneficiary() {
        selfdestruct(beneficiary);
    }

    function refund()
    public
    isnotbeneficiary()
    onlyafterendtime(now)
    lessbalance(currentBalance) {
        uint temp = fundersIDFunding[addressID[msg.sender]]
        fundersIDFunding[addressID[msg.sender]] = 0;
        msg.sender.transfer(temp);
    }
}

