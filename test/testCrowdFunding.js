var crowdfunding = artifacts.require("../contracts/CrowdFunding.sol");
var assert = require("assert");

// Helps is asserting events
var truffleAssert = require("truffle-assertions");

var timePeriodInSeconds = 10;
var goal = 100;

var now = Math.floor(new Date() / 1000);
var upto = now + timePeriodInSeconds;

var sleep = seconds => {
    console.log("Sleeping for " + seconds + "seconds");
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
};

contract("Fund Test", async accounts => {
    var projectMaker = accounts[0];

    var instance;
    beforeEach("setup contract for each test", async () => {
        instance = await crowdfunding.new(goal, timePeriodInSeconds, {
            from: projectMaker
        });
    });

    it("Benificiary cannot fund", async () => {
        await truffleAssert.reverts(
            instance.participate({
                value: web3.toWei(10, "wei"),
                from: projectMaker
            })
        );
    });

    it("Others can fund", async () => {
        var result = await instance.participate({
            value: web3.toWei(10, "wei"),
            from: accounts[1]
        });

        var goalleft = await instance.effectivegoal();
        var balance = await web3.eth.getBalance(instance.address);
        assert.equal(balance.toNumber(), 10);
        assert.equal(goalleft.toNumber(), 90);

        truffleAssert.eventEmitted(result, "ParticipateLogger", ev => {
            return ev.funder == accounts[1] && ev.totalFunders == 1;
        });

        var result2 = await instance.participate({
            value: web3.toWei(10, "wei"),
            from: accounts[2]
        });

        var goalleft = await instance.effectivegoal();
        var balance = await web3.eth.getBalance(instance.address);
        assert.equal(balance.toNumber(), 20);
        assert.equal(goalleft.toNumber(), 80);

        truffleAssert.eventEmitted(result2, "ParticipateLogger", ev => {
            return ev.funder == accounts[2] && ev.totalFunders == 2;
        });
    });

    it("Same funder can fund again", async () => {
        var result = await instance.participate({
            value: web3.toWei(10, "wei"),
            from: accounts[1]
        });

        var goalleft = await instance.effectivegoal();
        var balance = await web3.eth.getBalance(instance.address);
        assert.equal(balance.toNumber(), 10);
        assert.equal(goalleft.toNumber(), 90);

        truffleAssert.eventEmitted(result, "ParticipateLogger", ev => {
            return ev.funder == accounts[1] && ev.totalFunders == 1;
        });

        var result2 = await instance.participate({
            value: web3.toWei(10, "wei"),
            from: accounts[2]
        });

        var goalleft = await instance.effectivegoal();
        var balance = await web3.eth.getBalance(instance.address);
        assert.equal(balance.toNumber(), 20);
        assert.equal(goalleft.toNumber(), 80);

        truffleAssert.eventEmitted(result2, "ParticipateLogger", ev => {
            return ev.funder == accounts[2] && ev.totalFunders == 2;
        });

        var result3 = await instance.participate({
            value: web3.toWei(10, "wei"),
            from: accounts[1]
        });

        var goalleft = await instance.effectivegoal();
        var balance = await web3.eth.getBalance(instance.address);
        assert.equal(balance.toNumber(), 30);
        assert.equal(goalleft.toNumber(), 70);

        truffleAssert.eventEmitted(result3, "ParticipateLogger", ev => {
            return ev.funder == accounts[1] && ev.totalFunders == 2;
        });
    });
});

contract("Goal Test", async accounts => {
    var projectMaker = accounts[0];

    var instance;
    beforeEach("setup contract for each test", async () => {
        goal = web3.toWei(1, "ether");
        instance = await crowdfunding.new(goal, timePeriodInSeconds, {
            from: projectMaker
        });
    });

    it("Goal Reached!", async () => {
        
        var a0b = web3.eth.getBalance(accounts[0]);
        var a1b = web3.eth.getBalance(accounts[1]);

        var result = await instance.participate({
            value: web3.toWei(1.001, "ether"),
            from: accounts[1]
        });

        var goalleft = await instance.effectivegoal();
        var balance = await web3.eth.getBalance(instance.address);

        assert.equal(balance.toNumber(), web3.toWei(1.001, "ether"));

        assert.equal(goalleft.toNumber(), -web3.toWei(0.001, "ether"));

        await sleep(timePeriodInSeconds);

        var finalize_result = await instance.finalize({
            from: accounts[0]
        });

        truffleAssert.eventEmitted(finalize_result, "FinalizeLogger", ev => {
            return ev.beneficiary == accounts[0];
        });

        var a0a = web3.eth.getBalance(accounts[0]);
        var a1a = web3.eth.getBalance(accounts[1]);
                
        assert.equal(a0a > a0b, true);
        assert.equal(a1b > a1a, true);
    });

     it("Reverts if finalize is called before deadline", async () => {
         await truffleAssert.reverts(
             instance.finalize({ from: accounts[0] })
         );
     });

});

contract("Refund Test", async accounts => {
    var projectMaker = accounts[0];

    var instance;
    beforeEach("setup contract for each test", async () => {
        goal = web3.toWei(1, "ether");
        instance = await crowdfunding.new(goal, timePeriodInSeconds, {
            from: projectMaker
        });
    });

    it("Goal Not Reached!", async () => {
        var result = await instance.participate({
            value: web3.toWei(0.4, "ether"),
            from: accounts[1]
        });

        var goalleft = await instance.effectivegoal();
        var balance = await web3.eth.getBalance(instance.address);

        assert.equal(balance.toNumber(), web3.toWei(0.4, "ether"));
        assert.equal(goalleft.toNumber(), web3.toWei(0.6, "ether"));

        var result = await instance.participate({
            value: web3.toWei(0.4, "ether"),
            from: accounts[2]
        });

        var goalleft = await instance.effectivegoal();
        var balance = await web3.eth.getBalance(instance.address);

        assert.equal(balance.toNumber(), web3.toWei(0.8, "ether"));
        assert.equal(goalleft.toNumber(), web3.toWei(0.2, "ether"));

        await sleep(timePeriodInSeconds);

        var a1b = web3.fromWei(web3.eth.getBalance(accounts[1]));

        var refund1 = await instance.refund({
            from: accounts[1]
        });

        var a1a = web3.fromWei(web3.eth.getBalance(accounts[1]));

        assert.equal(a1b < a1a, true);

        var a2b = web3.fromWei(web3.eth.getBalance(accounts[2]));

        var refund2 = await instance.refund({
            from: accounts[2]
        });

        var a2a = web3.fromWei(web3.eth.getBalance(accounts[2]));

        assert.equal(a2b < a2a, true);
    });

     it("Reverts if refund is called before deadline", async () => {
         await truffleAssert.reverts(
             instance.refund({ from: accounts[1] })
         );
     });

});
