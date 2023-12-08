import CryptoJS from 'crypto-js';
import Web3 from 'web3';
import axios from 'axios';
import {Eip2612PermitUtils, Web3ProviderConnector, fromRpcSig} from '@1inch/permit-signed-approvals-utils';

const eth_sig_util = require('@metamask/eth-sig-util');

let web3 = new Web3();
const Stores = require('electron-store');
let option = {
    encryptionKey: "hebeblock"
}

let stores = new Stores(option);
const BigNumber = require('bignumber.js');
const Ether = new BigNumber(10e+17);
const {isConfusing, confusables, rectifyConfusion} = require('unicode-confusables');

// let key=web3.eth.accounts.encrypt(
//     '0089babe3837a1711671898d3afbc31b9ced663efd65ffd6d705e769bdc2b607','123');
// console.log(key);
// console.log(web3.eth.accounts.decrypt(key,'123'));
export default {
    item: '',
    rpc: 'http://localhost:8545',
    numberx(num) {
        if (num < 10) {
            let nums = Math.floor(num * 1000000) / 1000000;
            if (nums == 0) {
                let nums = Math.floor(num * 100000000) / 100000000;
            }
            return nums;
        }
        return Math.floor(num * 10000) / 10000;
    },
    fn() {
    },
    compare(p) {
        return function (m, n) {
            let a = m[p];
            let b = n[p];
            return b - a;
        }
    },
    methodId(txt) {
        if (txt.indexOf("0x9f50973e") == 0) {
            return "SwapETCForTokens";
        }
        if (txt.indexOf("0x65f705d3") == 0) {
            return "SwapTokensForETC";
        }
        if (txt.indexOf("0xe75f59dd") == 0) {
            return "RemoveLiquidity";
        }
        if (txt.indexOf("0x86eaa82f") == 0 || txt.indexOf("0xe8e33700") == 0) {
            return "AddLiquidity";
        }
        if (txt.indexOf("0x3ccfd60b") == 0) {
            return "Withdraw";
        }
        if (txt.indexOf("0x095ea7b3") == 0) {
            return "Approve";
        }
        if (txt.indexOf("0xa0712d68") == 0) {
            return "Mint";
        }
        if (txt.indexOf("0x23b872dd") == 0 || txt.indexOf("0x42842e0e") == 0) {
            return "NFT Transfer";
        }
        return ''
    },
    subname(txt) {
        if (txt) {
            if (txt.length > 41) {
                return txt.substring(0, 10) + '...' + txt.substring(30, 42);
            } else {
                return txt;
            }
        }
    },
    open(href) {
        const shell = require('electron').shell
        if (href.indexOf('http') == 0) {
            shell.openExternal(href)
        }
    },
    decimals(sum, decimals) {
        return sum / Math.pow(10, decimals)
    },
    xdecimals(sum, decimals) {
        return Number((sum * Math.pow(10, decimals)).toFixed(0))
    },
    float(sum) {
        let ret = new BigNumber(sum);
        return parseFloat(ret.dividedBy(Ether))
    },
    formatDateTime(timeStamp) {
        let date = new Date(timeStamp);
        let y = date.getFullYear();
        let m = date.getMonth() + 1;
        m = m < 10 ? ('0' + m) : m;
        let d = date.getDate();
        d = d < 10 ? ('0' + d) : d;
        let h = date.getHours();
        h = h < 10 ? ('0' + h) : h;
        let minute = date.getMinutes();
        let second = date.getSeconds();
        minute = minute < 10 ? ('0' + minute) : minute;
        second = second < 10 ? ('0' + second) : second;
        return y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second;
    },
    stores: stores,
    address(prv) {
        let address = '';
        try {
            let account = web3.eth.accounts.privateKeyToAccount(prv);
            address = account.address;
            return address;
        } catch (e) {
            return address;
        }
    },
    create() {
        let account = web3.eth.accounts.create(web3.utils.randomHex(32));
        if (account.privateKey.indexOf('0x') == 0) {
            account.privateKey = account.privateKey.substr(2, account.privateKey.length);
        }
        return {
            address: account.address,
            privateKey: account.privateKey,
        };
    },
    encrypt(key, pass) {
        return web3.eth.accounts.encrypt(
            key, pass)
    },
    decrypt(encryptPass, keyPass) {
        let plaintext;

        try {
            let key = web3.eth.accounts.decrypt(encryptPass, keyPass)
            plaintext = key.privateKey
        } catch (e) {
            plaintext = ''
        }
        return {
            plaintext: plaintext,
            pass: keyPass,
        }
    },
    prvplaintext: '',
    openprv(_this, wallet) {
        return new Promise(async (resolve, reject) => {
            if (this.prvplaintext == '') {
                _this.$prompt('Please enter password', '', {
                    inputType: 'password',
                    confirmButtonText: 'Ok',
                    cancelButtonText: 'Cancel',
                }).then(({value}) => {
                    let model = this.decrypt(wallet.prv, value)
                    if (model.plaintext == "") {
                        _this.$alert('Wrong wallet password', '', {
                            confirmButtonText: 'Ok',
                        });
                        resolve(model.plaintext)
                    } else {
                        this.prvplaintext = model.plaintext
                        resolve(model.plaintext)
                    }
                }).catch(() => {
                    _this.$alert('Wrong wallet password', '', {
                        confirmButtonText: 'Ok',
                    });
                    resolve('')
                });
            } else {
                resolve(this.prvplaintext)
            }
        });

    },
    async permit(model, _this) {
        return new Promise(async (resolve, reject) => {

            let web33 = new Web3(this.rpc);
            let connector = new Web3ProviderConnector(web33);
            const eip2612PermitUtils = new Eip2612PermitUtils(connector);

            let nonce = await eip2612PermitUtils.getTokenNonce(model.lpAddress, model.address);
            console.log(nonce);

            let privateKey = await _this.$g.openprv(_this, _this.$store.state.wallet)
            let deadline = Math.floor(new Date().getTime() / 1000) + (60 * model.deadline)
            let signature = eth_sig_util.signTypedData({
                privateKey,
                data: {
                    "types": {
                        "EIP712Domain": [{"name": "name", "type": "string"}, {
                            "name": "version",
                            "type": "string"
                        }, {"name": "chainId", "type": "uint256"}, {"name": "verifyingContract", "type": "address"}],
                        "Permit": [{"name": "owner", "type": "address"}, {
                            "name": "spender",
                            "type": "address"
                        }, {"name": "value", "type": "uint256"}, {
                            "name": "nonce",
                            "type": "uint256"
                        }, {"name": "deadline", "type": "uint256"}]
                    },
                    "domain": {
                        "name": "HEBESWAP LP TOKEN",
                        "version": "1",
                        "chainId": 61,
                        "verifyingContract": model.lpAddress
                    },
                    "primaryType": "Permit",
                    "message": {
                        "owner": "0xc2c66040752EaB8de435109F84C34a3c49DD1D29",
                        "spender": "0xEcBcF5C7aF4c323947CFE982940BA7c9fd207e2b",
                        "value": model.liquidity.toString(),
                        "nonce": web3.utils.toHex(nonce),
                        "deadline": deadline
                    }
                }
                ,
                version: eth_sig_util.SignTypedDataVersion.V4,
            });
            console.log({
                "types": {
                    "EIP712Domain": [{"name": "name", "type": "string"}, {
                        "name": "version",
                        "type": "string"
                    }, {"name": "chainId", "type": "uint256"}, {"name": "verifyingContract", "type": "address"}],
                    "Permit": [{"name": "owner", "type": "address"}, {
                        "name": "spender",
                        "type": "address"
                    }, {"name": "value", "type": "uint256"}, {
                        "name": "nonce",
                        "type": "uint256"
                    }, {"name": "deadline", "type": "uint256"}]
                },
                "domain": {
                    "name": "HEBESWAP LP TOKEN",
                    "version": "1",
                    "chainId": 61,
                    "verifyingContract": "0xC1f4DF5cA7894C32689072De15C5267E46B6747b"
                },
                "primaryType": "Permit",
                "message": {
                    "owner": "0xc2c66040752EaB8de435109F84C34a3c49DD1D29",
                    "spender": "0xEcBcF5C7aF4c323947CFE982940BA7c9fd207e2b",
                    "value": model.liquidity.toString(),
                    "nonce": web3.utils.toHex(nonce),
                    "deadline": deadline
                }
            });
            let sig = fromRpcSig(signature);
            let r = sig.r.toString('hex');
            let s = sig.s.toString('hex');
            let v = sig.v;
            resolve({
                r: "0x" + r,
                s: "0x" + s,
                v: v,
                deadline: deadline
            })
        })
    },
    async eth_sendRawTransaction(data) {
        return new Promise((resolve, reject) => {
            axios({
                method: 'post',
                url: this.rpc,
                data: {
                    'jsonrpc': '2.0',
                    'method': 'eth_sendRawTransaction',
                    'params': [data],
                    'id': 1,
                },
            }).then(res => {
                let msg = '';
                if (res.data.error && res.data.error.msg) {
                    msg = res.data.error.msg;
                }
                resolve({
                    transaction: res.data.result,
                    error: msg,
                });
            }).catch(err => {
                resolve('400');
            });
        });
    },
    async eth_estimateGas(data, _this) {
        return new Promise((resolve, reject) => {
            axios({
                method: 'post',
                url: this.rpc,
                data: {
                    'jsonrpc': '2.0',
                    'method': 'eth_estimateGas',
                    'params': [data],
                    'id': 1,
                },
            }).then(res => {
                console.log(res);
                if (res.data.error) {
                    if (res.data.error.code == 3) {
                        if (res.data.error.message == "execution reverted: TransferHelper: TRANSFER_FROM_FAILED") {
                            resolve('Approve')

                        } else if (res.data.error.message == "execution reverted: HebeswapV2Router: INSUFFICIENT_A_AMOUNT") {
                            _this.$notify.error({
                                title: 'Error',
                                message: 'Please increase slippage'
                            });
                        } else if (res.data.error.message == "execution reverted: TransferHelper: TRANSFER_FAILED") {
                            resolve('removeLiquidityETCWithPermitSupportingFeeOnTransferTokens')
                        } else {
                            _this.$notify.error({
                                title: 'Error',
                                message: res.data.error.message
                            });
                        }
                    }
                    return;
                }
                let feegaslimit = (web3.utils.hexToNumber(res.data.result));
                resolve(parseInt(feegaslimit * 1.2));
            }).catch(err => {
                resolve(parseInt(21000 * 1.2));
            });
        });
    },
    async eth_gasPrice() {
        return new Promise((resolve, reject) => {
            axios({
                method: 'post',
                url: this.rpc,
                data: {"jsonrpc": "2.0", "method": "eth_gasPrice", "params": [], "id": 1},
            }).then(res => {
                let gas = (web3.utils.hexToNumber(res.data.result));
                gas = web3.utils.fromWei(gas.toString(), 'Gwei')
                resolve(gas);
            }).catch(err => {
                resolve(10);
            });
        });
    },
    async getNonce(addr) {
        return new Promise((resolve, reject) => {
            let nonce = -1;
            axios({
                method: 'post',
                url: this.rpc,
                data: {
                    'jsonrpc': '2.0',
                    'method': 'eth_getTransactionCount',
                    'params': [addr, 'latest'],
                    'id': 1,
                },
            }).then(res => {
                nonce = web3.utils.toDecimal(res.data.result);
                resolve(nonce);
            }).catch(err => {
                resolve(-1);
            });
        });
    },
    send(_this, model) {
        //_this.$store.state.dialogVisible = true;
    },
    isAddress(addr) {
        return web3.utils.isAddress(addr);
    },
    async gasFn(_this) {
        let model = {
            contract: ''
        }
        console.log(_this.$store.state.balanceValue);
        if (_this.$store.state.balanceValue != '') {
            model = JSON.parse(_this.$store.state.balanceValue)
        }
        let to = _this.$store.state.dialog.to || '0x0000000000000000000000000000000000000000';
        if (model.contract != '') {
            to = model.contract
        }
        if (_this.$store.state.txt.trim() == 'Swap') {
            to = _this.$store.state.dialog.to
        }
        let gas = {
            'from': _this.$store.state.wallet.address,
            'to': to
        };
        if (model.contract != '') {
            let amount = _this.$store.state.dialog.amount.toString() || '0.0000000001'
            if (amount == 0) {
                amount = model.balance * 0.5
            }
            if (!amount) {
                amount = '0.0000000001'
            }
            console.log(amount);
            let tokensum = BigInt(amount * Math.pow(10, model.decimals))
            let data = _this.$web3.eth.abi.encodeFunctionCall({
                name: 'transfer',
                type: 'function',
                inputs: [
                    {
                        type: 'address',
                        name: '_to',
                    },
                    {
                        type: 'uint256',
                        name: '_value',
                    },
                ],
            }, ['0x9B5fbEdAA0c2474b43e4f96F58E62f702614C8B8', tokensum]);
            gas.data = data
        } else {
            let amount = _this.$store.state.dialog.amount.toString() || '0.0001'
            gas.value = _this.$web3.utils.toHex(_this.$web3.utils.toWei(amount, 'ether'))
        }

        if (_this.$store.state.dialog.data != '') {
            gas.data = _this.$store.state.dialog.data;
        }
        if (_this.$store.state.txt.trim() == 'WETC Withdraw') {
            delete gas.value
        }
        _this.$store.state.dialog.gasLimit = await _this.$g.eth_estimateGas(gas, _this)
        _this.$store.state.dialog.gasPrice = await _this.$g.eth_gasPrice();
    },
    async handleSend(_this) {
        _this.$store.state.send100 = false
        console.log(_this.$store.state.dialog);
        let isAddress = _this.$g.isAddress(_this.$store.state.dialog.to)
        if (!isAddress) {
            _this.$notify.error({
                title: 'Error',
                message: 'Wrong address'
            });
            return
        }
        if (isNaN(parseInt(_this.$store.state.dialog.gasPrice)) || parseInt(_this.$store.state.dialog.gasPrice) <= 0) {
            _this.$notify.error({
                title: 'Error',
                message: 'Wrong GasPrice'
            });
            return
        }
        if (isNaN(parseInt(_this.$store.state.dialog.gasLimit)) || parseInt(_this.$store.state.dialog.gasLimit) <= 0) {
            _this.$notify.error({
                title: 'Error',
                message: 'Wrong GasLimit'
            });
            return
        }
        console.log('222222');
        if (_this.$store.state.txt.trim() != 'Swap' && _this.$store.state.txt.trim() != 'Approve' && _this.$store.state.balanceValue != '') {
            if (isNaN(parseFloat(_this.$store.state.dialog.amount))
                ||
                parseFloat(_this.$store.state.dialog.amount) <= 0 || JSON.parse(_this.$store.state.balanceValue).balance < _this.$store.state.dialog.amount) {
                _this.$notify.error({
                    title: 'Error',
                    message: 'Wrong Amount'
                });
                return
            }
        }
        let fee = _this.$web3.utils.fromWei((_this.$web3.utils.toWei(_this.$store.state.dialog.gasPrice, 'Gwei') * _this.$store.state.dialog.gasLimit).toString(), 'ether');
        if (fee > _this.$store.state.balanceList[0].balance) {
            _this.$notify.error({
                title: 'Error',
                message: 'Not enough fees'
            });
            return;
        }
        _this.$store.state.dialog.fee = fee;
        let amount
        if (_this.$store.state.dialog.amount == 0) {
            amount = 0
        } else {
            if (_this.$store.state.txt.trim() != 'Swap') {
                amount = _this.$web3.utils.toHex(_this.$web3.utils.toWei(_this.$store.state.dialog.amount, 'ether'))
            } else {
                console.log(_this.$store.state.dialog.fromName);
                if (_this.$store.state.dialog.fromName == 'ETC') {
                    amount = _this.$web3.utils.toHex(_this.$web3.utils.toWei(_this.$store.state.dialog.amount, 'ether'))
                }
            }
        }
        let data = _this.$store.state.dialog.data
        let to = _this.$store.state.dialog.to
        console.log(_this.$store.state.txt.trim());

        if (_this.$store.state.balanceValue != '') {
            if (_this.$store.state.txt.trim() == 'Approve') {
                let erc20 = JSON.parse(_this.$store.state.balanceValue)
                to = erc20.contract;
            } else if (_this.$store.state.txt.trim() == 'Swap') {
                console.log(_this.$store.state.balanceValue);
                console.log(_this.$store.state.dialog);

                console.log('swap');
            } else {
                let erc20 = JSON.parse(_this.$store.state.balanceValue)
                console.log(erc20);
                if (erc20.decimals) {
                    amount = _this.$web3.utils.toHex(0)
                    let tokensum = BigInt(_this.$store.state.dialog.amount * Math.pow(10, erc20.decimals))
                    data = _this.$web3.eth.abi.encodeFunctionCall({
                        name: 'transfer',
                        type: 'function',
                        inputs: [
                            {
                                type: 'address',
                                name: '_to',
                            },
                            {
                                type: 'uint256',
                                name: '_value',
                            },
                        ],
                    }, [_this.$store.state.dialog.to, tokensum]);
                    to = erc20.contract;
                }
            }

        }

        if (_this.$store.state.txt.trim() == 'Swap') {

            console.log(_this.$store.state.dialog);

            console.log('swap');


        }
        let model = {
            nonce: _this.$web3.utils.toHex(_this.$store.state.dialog.nonce),
            to: to,
            gas: _this.$store.state.dialog.gasLimit,
            value: amount,
            gasPrice: _this.$web3.utils.toHex(_this.$web3.utils.toWei(_this.$store.state.dialog.gasPrice, 'Gwei')),
            data: _this.$web3.utils.toHex(data),
            common: {
                baseChain: 'mainnet',
                hardfork: 'petersburg',
                customChain: {
                    name: 'Ethereum Classic',
                    chainId: _this.$web3.utils.hexToNumber(61),
                    networkId: _this.$web3.utils.hexToNumber(61),
                },
            }
        };
        console.log(model);
        let wif = await _this.$g.openprv(_this, _this.$store.state.wallet)
        if (wif != '') {
            let tx = await _this.$web3.eth.accounts.signTransaction(model, wif);
            _this.$store.state.hex = tx.rawTransaction
            _this.$store.state.dialogVisible = false;
            _this.$store.state.dialogSendVisible = true
            _this.$store.state.sendis = true;
            _this.$store.state.send200 = false;
            _this.$store.state.send400 = false;
        }
    },
    async eth_getTransactionReceipt(tx) {

        return new Promise((resolve, reject) => {
            axios({
                method: 'post',
                url: this.rpc,
                data: {"jsonrpc": "2.0", "method": "eth_getTransactionReceipt", "params": [tx], "id": 1},
            }).then(res => {
                console.log(res.data, '222222');
                if (res.data.result == null) {
                    setTimeout(() => {
                        resolve(this.eth_getTransactionReceipt(tx))
                    }, 3000)
                    return
                } else if (res.data.result.status) {
                    resolve(res.data.result.status)
                }
            }).catch(err => {
                resolve('')
            });
        });
    },
    async getHens(alias, _this) {
        return new Promise(async (resolve, reject) => {
            if (isConfusing(alias)) {
                _this.$notify.error({
                    title: 'Prompt',
                    message: 'There are confusing characters, avoid confusing characters, please enter manually, if the prompt appears again after manual input, please ignore'
                });
            }

            let getAllPropertiesabi = web3.eth.abi.encodeFunctionCall({
                name: 'getAllProperties',
                type: 'function',
                inputs: [{
                    type: 'string',
                    name: 'name_'
                }]
            }, [alias])
            let abi = await axios({
                method: 'post',
                url: this.rpc,
                data: {
                    "jsonrpc": "2.0",
                    "method": "eth_call",
                    "params": [
                        {
                            "to": "0x925da8387c81e1b1d8aaBE4CfDb1BD0b873ba278",
                            "data": getAllPropertiesabi
                        },
                        "latest"
                    ],
                    "id": 1
                }
            })
            let textlist =
                [
                    {
                        txt: 'Url',
                        get: 'getUrl',
                        set: 'setUrl',
                        val: ''
                    }, {
                    txt: 'Telegram',
                    get: 'getOrgTelegram',
                    set: 'setOrgTelegram',
                    val: ''
                }, {
                    txt: 'Notice',
                    get: 'getNotice',
                    set: 'setNotice',
                    val: ''
                }, {
                    txt: 'Keywords',
                    get: 'getKeywords',
                    set: 'setKeywords',
                    val: ''
                }, {
                    txt: 'IpfsUrl',
                    get: 'getIpfsUrl',
                    set: 'setIpfsUrl',
                    val: ''
                }, {
                    txt: 'Email',
                    get: 'getEmail',
                    set: 'setEmail',
                    val: ''
                }, {
                    txt: 'Description',
                    get: 'getDescription',
                    set: 'setDescription',
                    val: ''
                }, {
                    txt: 'Twitter',
                    get: 'getComTwitter',
                    set: 'setComTwitter',
                    val: ''
                }, {
                    txt: 'Reddit',
                    get: 'getComReddit',
                    set: 'setComReddit',
                    val: ''
                }, {
                    txt: 'Github',
                    get: 'getComGithub',
                    set: 'setComGithub',
                    val: ''
                }, {
                    txt: 'Avatar',
                    get: 'getAvatar',
                    set: 'setAvatar',
                    val: ''
                }
                ]
            let txt = web3.eth.abi.decodeParameters(['string'], abi.data.result);
            txt = txt[0]
            console.log(txt);
            let listcoin = []
            if (txt != '' && txt.split('+').length > 10) {
                textlist.forEach((item, index) => {
                    item.val = txt.split('+')[index].trim()
                })
                if (txt.split('+')[11] != '') {
                    let addripfs = txt.split('+')[11].trim()
                    if (addripfs != '' && addripfs.length > 10) {
                        let ress = await axios.get('https://apis.hebe.cc/ipfs/?id=' + addripfs)
                        listcoin = ress.data
                    }
                }
            }
            let t = true;
            let etcaddr = ''
            listcoin.forEach(item => {
                if (item.val == 'Etc') {
                    t = false;
                    etcaddr = item.addr;
                }
            })
            if (t) {
                let addr = await this.getOwner(alias)
                listcoin.push({val: 'Etc', addr: addr})
                etcaddr = addr;
            }
            resolve({
                textlist: textlist,
                listcoin: listcoin,
                addr: etcaddr
            })
        })
    },
    async getOwner(alias) {
        return new Promise(async (resolve, reject) => {

            let getAllPropertiesabi = web3.eth.abi.encodeFunctionCall({
                name: 'getOwner',
                type: 'function',
                inputs: [{
                    type: 'string',
                    name: 'name_'
                }]
            }, [alias])
            let abi = await axios({
                method: 'post',
                url: this.rpc,
                data: {
                    "jsonrpc": "2.0",
                    "method": "eth_call",
                    "params": [
                        {
                            "to": "0x925da8387c81e1b1d8aaBE4CfDb1BD0b873ba278",
                            "data": getAllPropertiesabi
                        },
                        "latest"
                    ],
                    "id": 1
                }
            })
            let res = abi.data.result;
            if (res == '0x0000000000000000000000000000000000000000000000000000000000000000') {
                resolve('')
            } else {
                let addr = '0x' + res.split('0x000000000000000000000000')[1]
                resolve(addr)
            }
        })
    },
    async getNameOfOwner(addr) {
        return new Promise(async (resolve, reject) => {
            let getNameOfOwnerabi = web3.eth.abi.encodeFunctionCall({
                name: 'getNameOfOwner',
                type: 'function',
                inputs: [{
                    type: 'address',
                    name: 'addr_',
                }],
            }, [addr]);
            let abi = await axios({
                method: 'post',
                url: this.rpc,
                data: {
                    'jsonrpc': '2.0',
                    'method': 'eth_call',
                    'params': [
                        {
                            'to': '0x03f4a95d964d364614E514e8638d61CDEed4f8D4',
                            'data': getNameOfOwnerabi,
                        },
                        'latest',
                    ],
                    'id': 1,
                },
            });
            if (abi.data.error) {
                resolve('');
                return;
            }
            let tt = web3.eth.abi.decodeLog(['bytes'], abi.data.result)
            let name = web3.utils.hexToString(tt[0])
            resolve(name);
        });
    },
    async getTokenIdOfName(name) {
        return new Promise(async (resolve, reject) => {
            let web3 = new Web3();
            name = name.slice(0, name.length - 4);
            let getTokenIdOfNameabi = web3.eth.abi.encodeFunctionCall({
                name: 'getTokenIdOfName',
                type: 'function',
                inputs: [{
                    type: 'string',
                    name: '_name',
                },
                ],
            }, [name]);
            let abi = await axios({
                method: 'post',
                url: this.rpc,
                data: {
                    'jsonrpc': '2.0',
                    'method': 'eth_call',
                    'params': [
                        {
                            'to': '0x03f4a95d964d364614E514e8638d61CDEed4f8D4',
                            'data': getTokenIdOfNameabi,
                        },
                        'latest',
                    ],
                    'id': 1,
                },
            });
            if (abi.data.error) {
                resolve('');
                return;
            }
            let number = web3.utils.hexToNumber(abi.data.result);
            resolve(number);
        });
    },


};
