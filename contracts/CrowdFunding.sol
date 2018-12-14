pragma solidity ^0.4.24;


contract CrowdFunding {
    address private beneficiary;
    address[] private funders;

    uint private deadline;
    uint private startParticipation;
    uint private goal;

    mapping(uint => uint) private fundersIDFunding;
    mapping(address => uint) private addressID;

    event ParticipateLogger(address indexed funder, uint totalFunders);
    event FinalizeLogger(address beneficiary);

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
        require(this.balance >= goal, "Goal Not Reached");
        _;
    }

    modifier goalFailed() {
        require(this.balance < goal, "Goal Reached");
        _;
    }

    constructor(uint _goal, uint _timelimit)
    public
    payable {
        // require(_timelimit >= 120); // At Least 2 Mins
        beneficiary = msg.sender;
        goal = _goal;
        deadline = now + _timelimit;
    }

    function participate()
    public
    payable
    isnotbeneficiary()
    notafterendtime()
    returns(uint) {
        require(msg.value > 0, "Please send some amount!");
        uint id = 0;
        if (addressID[msg.sender] == 0) {
            id = funders.push(msg.sender);
            addressID[msg.sender] = id;
        } else {
            id = addressID[msg.sender];            
        }

        fundersIDFunding[id] += msg.value;
        emit ParticipateLogger(msg.sender, funders.length);   
        return id;
    }

    function effectivegoal()
    public
    view
    returns(int) {
        int goalInt = int(goal);
        int balInt = int(this.balance);
        return goalInt - balInt;
    }

    function numberoffunders()
    public
    view
    returns(uint256) {
        return funders.length;
    }

    function finalize()
    public
    onlyafterendtime()
    goalReached()
    isbeneficiary() {
        emit FinalizeLogger(beneficiary);
        selfdestruct(beneficiary);
    }

    function refund()
    public
    isnotbeneficiary()
    onlyafterendtime()
    goalFailed() {
        require(addressID[msg.sender] > 0);
        uint amt = fundersIDFunding[addressID[msg.sender]];
        fundersIDFunding[addressID[msg.sender]] = 0;
        msg.sender.transfer(amt);
    }
}

