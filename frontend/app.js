let Provider;
let MyContract;
let Account;
let ContractInstance;

window.addEventListener("load", async () => {
  if (typeof web3 !== "undefined") {
    Provider = web3.currentProvider;
    web3 = new Web3(web3.currentProvider);
  } else {
    Provider = new Web3.providers.HttpProvider("http://localhost:7545");
    web3 = new Web3(Provider);
  }

  MyContract = TruffleContract(MyABI);
  MyContract.setProvider(Provider);

  web3.eth.getCoinbase(function(err, account) {
    if (err === null) {
      Account = account;
    }
  });
});

function submitform() {
  var name = $("input[name=name]").val();
  var goal = $("input[name=goal]").val();
  var Deadline = $("input[name=dead]").val();

  MyContract.defaults({ gas: 6000000 });

  MyContract.new(web3.toWei(goal, "wei"), Deadline * 60 * 60)
    .then(function(instance) {
      contractInstance = instance;
      $.post(
        "http://localhost:8080/data", //l url
        { Address: instance.address, name: name }, // data to be submit
        function(data, status, jqXHR) {
          // success callback
          console.log(data);
          console.log(status);
        },
        "json"
      );
    })
    .catch(function(error) {
      console.warn(error);
    });
}

oldContracts = [];

async function displayTransactions() {
  $.get(
    "http://localhost:8080/get_data",
    async function(data) {
      var j = 0;
      var temp = "";
      for (var i in data) {
        console.log(data[i], j);
        var address = data[i]["Address"];
        instance = await MyContract.at(address);
        oldContracts.push(instance);

        let efgoal = await instance.effectivegoal();
        efgoal = efgoal.toNumber();

        let nf = await instance.numberoffunders();
        nf = nf.toNumber();

        web3.eth.getBalance(address, function(e, balance) {
          let goal = efgoal + balance.toNumber();

          if (i % 3 == 0) {
            temp += '<div class="row"><div class="col-sm-4 block">';
          } else {
            temp += '<div class="col-sm-4 block">';
          }

          temp +=
            "<p> Project Owner - " +
            data[i]["name"] +
            "</p><p>Goal - " +
            goal +
            " wei </p><p>Effecitve Goal - " +
            efgoal +
            " wei </p><p>Number of Funders - " +
            nf +
            "</p>";
          temp +=
            '<button class="button" name="submit" type="submit" onClick="fundTransaction(' +
            i +
            ')">Fund</button></div>';
          if (i % 3 == 2) {
            temp += "</div>";
          }
          document.getElementById("contracts").innerHTML = temp;
        });
      }
    },
    "json"
  );
}

function fundTransaction(i) {
  instance = oldContracts[i]
  MyContract.defaults({value: web3.toWei(1, 'ether')})
  instance.participate()
}

