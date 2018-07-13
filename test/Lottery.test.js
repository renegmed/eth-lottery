const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3'); // this calls the construction function
const web3 = new Web3(ganache.provider());

const { interface, bytecode } = require('../compile');

let lottery;
let accounts;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();  // ganache would create 10 accounts

    lottery = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({ data: bytecode })                 // deploy the smart contract ABI
        .send({from: accounts[0], gas: '1000000'})  // use first account as the main account
});

describe('Lottery Contract', () => {
    it('deploys a contract', () => {
        assert.ok(lottery.options.address);
    });

    it('allows one account to enter', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.02', 'ether')
        });

        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        });

        assert(accounts[0], players[0]);
        assert(1, accounts.length);

    });

    it('allows multiple accounts to enter', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.02', 'ether')
        });
        
        await lottery.methods.enter().send({
            from: accounts[1],
            value: web3.utils.toWei('0.02', 'ether')
        });
        
        await lottery.methods.enter().send({
            from: accounts[2],
            value: web3.utils.toWei('0.02', 'ether')
        });

        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        });

        assert(accounts[0], players[0]);
        assert(accounts[1], players[1]);
        assert(accounts[2], players[2]);
        assert(3, accounts.length);

    });

    it('requires a minimum acount of ether to enter', async () => {
        try{
            await lottery.methods.enter().send({
                from: accounts[0],
                value: 200
            });
            assert(false);
        } catch (err) {
            assert(err);
        }
    });

    it('only manager can call pickWinner', async () =>{
        try {
            await lottery.methods.pickWinner().send({
                from: accounts[1]
            });
            assert(false);
        } catch (err) {
            assert(err);
        }
    });

    it('sends money to the winner and resets the players array', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('2', 'ether')
        });

        const initialBalance = await web3.eth.getBalance(accounts[0]);
        
        // Not working
        //const initialBalance = await web3.utils.fromWei(web3.eth.getBalance(accounts[0]), 'ether');
        
        await lottery.methods.pickWinner().send({
            from: accounts[0]
        });

        const finalBalance = await await web3.eth.getBalance(accounts[0]);

        const difference = finalBalance - initialBalance;

        console.log( difference);

        // account[0] won 2 ethers less gas cost.
        assert(difference, web3.utils.toWei('1.8', 'ether'));

        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        });
        //console.log( players.length);
        assert.equal(0, players.length);
    });
});