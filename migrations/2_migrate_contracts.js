var CrowdFunding = artifacts.require("CrowdFunding.sol");

module.exports = function(deployer) {
  deployer.deploy(CrowdFunding, 10, 10, {from: "0x627306090abab3a6e1400e9345bc60c78a8bef57"});
};
