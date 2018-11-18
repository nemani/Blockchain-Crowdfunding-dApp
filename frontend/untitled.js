  const MyAbi = [{'inputs': [{'name': '_goal', 'type': 'uint256'}, {'name': '_timelimit', 'type': 'uint256'}], 'payable': true, 'stateMutability': 'payable', 'type': 'constructor'}, {'anonymous': false, 'inputs': [{'indexed': true, 'name': 'funder', 'type': 'address'}, {'indexed': false, 'name': 'totalFunders', 'type': 'uint256'}], 'name': 'ParticipateLogger', 'type': 'event'}, {'anonymous': false, 'inputs': [{'indexed': false, 'name': 'beneficiary', 'type': 'address'}], 'name': 'FinalizeLogger', 'type': 'event'}, {'constant': false, 'inputs': [], 'name': 'participate', 'outputs': [{'name': '', 'type': 'uint256'}], 'payable': true, 'stateMutability': 'payable', 'type': 'function'}, {'constant': true, 'inputs': [], 'name': 'effectivegoal', 'outputs': [{'name': '', 'type': 'int256'}], 'payable': false, 'stateMutability': 'view', 'type': 'function'}, {'constant': false, 'inputs': [], 'name': 'finalize', 'outputs': [], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'function'}, {'constant': false, 'inputs': [], 'name': 'refund', 'outputs': [], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'function'}]
  const MyContract = web3.eth.contract(MyAbi);

  window.addEventListener('load', async () => {
    // Modern dapp browsers...
    if (window.ethereum) {
        window.web3 = new Web3(ethereum);
        try {
            // Request account access if needed
            await ethereum.enable();
            // Acccounts now exposed
            // web3.eth.sendTransaction({/* ... */});
        } catch (error) {
          alert("Please Allow MetaMask")
            // User denied account access...
        }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
        window.web3 = new Web3(web3.currentProvider);
        // Acccounts always exposed
        // web3.eth.sendTransaction({/* ... */});
    }
    // Non-dapp browsers...
    else {
        console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
});

  function submitform(){
    console.log("lol")
    var name = $("input[name=name]").val()
    var goal = $("input[name=goal]").val()
    var Address = $("input[name=Add]").val()
    var Deadline = $("input[name=dead]").val()

    var defAccount = web3.eth.accounts[0];
    
    var contractInstance = MyContract.new(web3.toWei(goal, 'wei'), Deadline * 60 * 60, {from: defAccount, gas: 1000000}, function(data) {
    $.post('http://localhost:8080/data',   // url
       { Address: contractInstance.address, name: name } , // data to be submit
       function(data, status, jqXHR) {// success callback
                console.log(data);
                console.log(status);
        },
        'json')
    $.get( "http://localhost:8080/get_data", function( data ) {
  console.log(data);
  alert( "Load was performed." );
  );
}, 'json');
      
  }
