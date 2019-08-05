const CONST = require('./const.js')
const db = require('../diskdb.js')
const crypto = require('crypto')

var sd = require('silly-datetime');
var time = sd.format(new Date())


module.exports = ($scope) => {
  web3 = $scope.web3

  return {

    propose: function(query, cb, req){

      function  propose() {
        var rsContract = new web3.eth.Contract(proposalContractAbi, contractAddress)
            // console.log(rsContract)

        var startTimeDate = new Date(query.proposalStartTime)
        var startTime = startTimeDate.getTime()/1000 + 60 * 60 * 7

        var endTimeDate = new Date(query.proposalEndTime)
        var endTime = endTimeDate.getTime()/1000 + 60 * 60 * 7
        var duration = endTime - startTime

        if(startTime < Date.now()/1000 +10 ) {
          return cb({err: 6, msg: "The start time of this proposal has passed." })
        }
        if(duration > 60 * 60 *24 * 30){
          return cb({err: 7, msg: "The duration of this proposal is too long."})
        }

        var md5 = crypto.createHash('md5')
        var _proposalHash = '0x' + md5.update(query.proposalDetail, 'utf8').digest('hex')
        var proposalobjs = db.proposals.find({proposalHash: _proposalHash})
        console.log(_proposalHash)
//        console.log(proposalobjs)
//        var proposalobj = new Array();
        if (proposalobjs.length) {
          return cb({err:8, msg: "This proposal has already been proposed."})
        }
        //        console.log(proposalHash)
        // console.log(_proposalHash)
        //        var proposalHash = web3.utils.fromDecimal(query.proposalHash)
//        var hex = stringtohex
//        console.log(_proposalHash)
        rsContract.methods.propose(_proposalHash, startTime, duration)
        .send({
            from: accobj.address,
            gas: 20000000,
            gasPrice: query.usefreegas==='1' ? '0' : web3.eth.currentGasPrice,
            chainId: 5816,
            value: web3.utils.toWei(query.proposalCost, 'ether').toString()
        }, (err, value) => {
            if(err){
            return cb({err: 5, msg: err})
            }
            db.proposals.save({
              userName:           query.userName,
              userProfile:        query.userProfile,
              proposalTitle:      query.proposalTitle,
              proposalSummary:    query.proposalSummary,
              proposalDetail:     query.proposalDetail,
              proposalStartTime:  query.proposalStartTime,
              proposalEndTime:    query.proposalEndTime,
              proposalDuration:   duration,
              proposalHash:       _proposalHash,
            })
            //console.log()
            cb(null, { status: 'ok', trshash: value })
        })
      }  

      var accobj = CONST.checkLoginForApi(web3, req, cb)
      if( !accobj ) return
      try{
        propose();
      }catch(e){
        cb({err: 5, msg: 'propose error:' + e})
      }
    },

    vote: function(query, cb, req){

      function  vote() {
        var rsContract = new web3.eth.Contract(proposalContractAbi, contractAddress)
        // console.log(rsContract)
        var voteOption = parseInt(query.voteOption)
        console.log(query.proposalHash)
        rsContract.methods.vote( query.proposalHash, voteOption)
        .send({
            from: accobj.address,
            gas: 200000,
            gasPrice: query.usefreegas==='1' ? '0' : web3.eth.currentGasPrice,
            chainId: 5816,
        }, (err, value) => {
            if(err){
            return cb({err: 5, msg: err})
            }
            cb(null, { status: 'ok', trshash: value })
        })
      }  

      var accobj = CONST.checkLoginForApi(web3, req, cb)
      if( !accobj ) return
      try{
        vote();
      }catch(e){
        cb({err: 5, msg: 'vote error:' + e})
      }
    },

    deposit: function(query, cb, req){
      function  deposit() {
//        var rsContract = new web3.eth.Contract(proposalContractAbi, contractAddress)
//        var _value = parseInt(query.value)
        web3.eth.sendTransaction({
          from: accobj.address,
          to:   contractAddress,
          gas:  200000,
          gasPrice: query.usefreegas==='1' ? '0' : web3.eth.currentGasPrice,
          value: web3.utils.toWei(query.value, 'ether'),
          chainId: 5816
        },(err, value) => {
            if(err){
            return cb({err: 5, msg: err})
            }
            cb(null, { status: 'ok', trshash: value })
        })
      }  

      var accobj = CONST.checkLoginForApi(web3, req, cb)
      if( !accobj ) return
      try{
        deposit();
      }catch(e){
        cb({err: 5, msg: 'deposit error:' + e})
      }
    },

    withdraw: function(query, cb, req){
      function  withdraw() {
        var rsContract = new web3.eth.Contract(proposalContractAbi, contractAddress)
//        var _value = parseInt(query.value)
        console.log(query.value)
        console.log(web3.utils.toWei(query.value, 'ether'))
        rsContract.methods.withdraw(web3.utils.toWei(query.value, 'ether'))
        .send({
            from: accobj.address,
            gas: 200000,
            gasPrice: query.usefreegas==='1' ? '0' : web3.eth.currentGasPrice,
            chainId: 5816,
        }, (err, value) => {
            if(err){
            return cb({err: 5, msg: err})
            }
            cb(null, { status: 'ok', trshash: value })
        })
      }  

      var accobj = CONST.checkLoginForApi(web3, req, cb)
      if( !accobj ) return
      try{
        withdraw();
      }catch(e){
        cb({err: 5, msg: 'withdraw error:' + e})
      }
    },

    voteResults: function(query, cb, req){
      function voteResults() {
        var rsContract = new web3.eth.Contract(proposalContractAbi, contractAddress)
//        var proposalHash = web3.utils.fromDecimal(query.proposalHash)
        console.log(123213123)
        console.log()
        rsContract.methods.results(query.proposalHash, query.voteOption)
        .call({
            chainId: 5816,
        }, (err, value) => {
            if(err){
            return cb({err: 5, msg: err})
            }
            cb(null, { status: 'ok', voteResult: value })
        })
      }  

      var accobj = CONST.checkLoginForApi(web3, req, cb)
      if( !accobj ) return
      try{
        voteResults();
      }catch(e){
        cb({err: 5, msg: 'Call VoteResults error:' + e})
      }
    },

    depositsOf: function(query, cb, req){
      function depositsOf(userobj) {

        console.log(userobj.address)
        var rsContract = new web3.eth.Contract(proposalContractAbi, contractAddress)
//        var proposalHash = web3.utils.fromDecimal(query.proposalHash)
        rsContract.methods.depositsOf(userobj.address)
        .call({
            chainId: 5816,
        }, (err, value) => {
            console.log(value, userobj.address)
            if(err){
            return cb({err: 5, msg: err})
            }
            console.log(value)
            cb(null, { status: 'ok', votes: web3.utils.fromWei(value, 'ether') })
        })
      }  
      var accobj = CONST.checkLoginForApi(web3, req, cb)
      if( !accobj ) return
      try{
        depositsOf(accobj);
      }catch(e){
        cb({err: 5, msg: 'Call depositsOf error:' + e})
      }
    },

    getActiveProposal: function(query, cb, req){
      function getActiveProposal() {
        var proposalobjs = db.proposals.find()
        var proposalobj = new Array();
        for(var _i in proposalobjs){
          var proposal = proposalobjs[_i]
          console.log(proposal)
          console.log(Date.now())
          var startTime = new Date(proposal.proposalStartTime)
          startTime = startTime.getTime()/1000 + 60 * 60 * 7
          var endTime = new Date(proposal.proposalEndTime)
          endTime = endTime.getTime()/1000 + 60 * 60 * 7

          if(startTime <= Date.now()/1000 
          && endTime >= Date.now()/1000) {
            proposalobj.push(proposal)
          }
        }
        console.log(startTime)
        console.log(proposalobjs)
        console.log(proposalobj)
        cb(null, {datas: proposalobj})
      }
      try{
        getActiveProposal()
      }catch(e){
        cb({err: 5, msg: 'Call activeProposals error:' + e})
      }
    },

    getLeaderBoard: function(query, cb, req){
      function getLeaderBoard() {
        var proposalobjs = db.proposals.find()
        var proposalobj = new Array();
//        console.log(proposalobjs)
        for(var _i in proposalobjs){
          var proposal = proposalobjs[_i]

          var endTime = new Date(proposal.proposalEndTime)
          endTime = endTime.getTime()/1000 + 60 * 60 * 7
//          console.log(proposal.proposalEndTime, endTime)
          if(endTime <= Date.now()/1000) {
            // console.log(proposal)
            // console.log(_i, endTime, Date.now()/1000)
            proposalobj.push(proposal)
          }
        }
//        console.log(proposalobjs)
//        console.log(proposalobj)
        cb(null, {datas: proposalobj})
      }
      try{
        getLeaderBoard()
      }catch(e){
        cb({err: 5, msg: 'Call LeaderBoard error:' + e})
      }
    }

  }
}

// This var should be changed to a new address of your contract.
const contractAddress = '0xdd7fc4849580c96647660c92dab2e3dba25339e4';

const proposalContractAbi = [
	{
		"constant": false,
		"inputs": [
			{
				"name": "_duration",
				"type": "uint256"
			}
		],
		"name": "changeMortage",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_cost",
				"type": "uint256"
			}
		],
		"name": "changeProposalCost",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_cost",
				"type": "uint256"
			}
		],
		"name": "changeVoteCost",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [],
		"name": "deposit",
		"outputs": [],
		"payable": true,
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_hash",
				"type": "bytes"
			},
			{
				"name": "_startTime",
				"type": "uint256"
			},
			{
				"name": "_duration",
				"type": "uint256"
			}
		],
		"name": "propose",
		"outputs": [],
		"payable": true,
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [],
		"name": "renounceOwnership",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_hash",
				"type": "bytes"
			},
			{
				"name": "_vote",
				"type": "uint8"
			}
		],
		"name": "vote",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_payment",
				"type": "uint256"
			}
		],
		"name": "withdraw",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"name": "_proposalcostI",
				"type": "uint256"
			},
			{
				"name": "_voteCostI",
				"type": "uint256"
			}
		],
		"payable": true,
		"stateMutability": "payable",
		"type": "constructor"
	},
	{
		"payable": true,
		"stateMutability": "payable",
		"type": "fallback"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"name": "_proposer",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "_hash",
				"type": "bytes"
			},
			{
				"indexed": false,
				"name": "_startTime",
				"type": "uint256"
			}
		],
		"name": "Proposed",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"name": "_voter",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "_hash",
				"type": "bytes"
			},
			{
				"indexed": false,
				"name": "_vote",
				"type": "uint8"
			}
		],
		"name": "Voted",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "payee",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "weiAmount",
				"type": "uint256"
			}
		],
		"name": "Deposited",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "payee",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "weiAmount",
				"type": "uint256"
			}
		],
		"name": "Withdrawn",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "payee",
				"type": "address"
			}
		],
		"name": "depositsOf",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "isOwner",
		"outputs": [
			{
				"name": "",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "_payee",
				"type": "address"
			}
		],
		"name": "mortageInfo",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			},
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "proposalCost",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "_hash",
				"type": "bytes"
			}
		],
		"name": "proposalInfo",
		"outputs": [
			{
				"name": "",
				"type": "address"
			},
			{
				"name": "",
				"type": "uint256"
			},
			{
				"name": "",
				"type": "uint256"
			},
			{
				"name": "",
				"type": "uint256"
			},
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "_hash",
				"type": "bytes"
			},
			{
				"name": "_vote",
				"type": "uint8"
			}
		],
		"name": "results",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "voteCost",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	}
]