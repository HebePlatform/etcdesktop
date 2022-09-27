<template>
    <div id="app">
        <router-view></router-view>
        <el-dialog
                title="Send"
                :visible.sync="$store.state.dialogVisible"
                top="3%"
                width="40%"
                @open="openSend"
                :before-close="handleClose">
            <div>
                <el-form :label-position="'top'" label-width="80px">
                    <el-form-item label="To">
                        <el-input v-loading="hensLoading"
                                  @change="addrHens" placeholder="0x.... / .etc"
                                  v-model="$store.state.dialog.to"></el-input>
                    </el-form-item>
                    <el-form-item label="Asset">

                        <el-select @change="openSend" style="width: 100%" v-model="$store.state.balanceValue"
                                   placeholder="Please select asset">
                            <el-option
                                    v-for="item in $store.state.balanceList"
                                    :key="item.contract"
                                    :label="item.text"
                                    :value="JSON.stringify(item)">
                                <span style="float: left">{{ item.text }}</span>
                                <span style="float: right; color: #8492a6; font-size: 13px">
                                    {{ item.balance }}
                                </span>
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item>
                        <template slot="label">
                            Amount <span v-if="$store.state.balanceValue!=''">( {{JSON.parse($store.state.balanceValue).balance}}
                            {{JSON.parse($store.state.balanceValue).text}} )</span>
                        </template>
                        <el-input v-model="$store.state.dialog.amount"></el-input>
                    </el-form-item>
                    <el-row>
                        <el-col :span="6">
                            <el-form-item label="Nonce">
                                <el-input v-model="$store.state.dialog.nonce"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="1">
                            <div style="visibility: hidden;height: 100%;width: 100%">
                                1
                            </div>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item label="Gas Price(Gwei)">
                                <el-input v-model="$store.state.dialog.gasPrice"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="1">
                            <div style="visibility: hidden;height: 100%;width: 100%">
                                1
                            </div>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item label="Gas Limit">
                                <el-input v-model="$store.state.dialog.gasLimit"></el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <div v-if="$store.state.balanceValue!=''">

                        <el-form-item label="Data" v-if="JSON.parse($store.state.balanceValue).contract==''">
                            <el-input
                                    v-model="$store.state.dialog.data"
                                    type="textarea"
                                    :rows="2">
                            </el-input>
                        </el-form-item>
                    </div>
                </el-form>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="handleClose">Cancel</el-button>
                <el-button type="primary" @click="handleSend1">Ok</el-button>
            </span>
        </el-dialog>
        <el-dialog
                title="Confirm Send"
                :visible.sync="$store.state.dialogSendVisible"
                top="10%"
                width="40%"
                :before-close="handleCloses">
            <div v-if="$store.state.sendis" v-loading="$store.state.loading">
                <div>
                    <el-descriptions style="margin-top: 10px" :title="$store.state.txt+'Transaction Info'" :column="1">
                        <el-descriptions-item label="To">
                            <el-link
                                    @click="$g.open('https://blockscout.com/etc/mainnet/address/'+$store.state.dialog.to)"
                                    target="_blank" type="primary">
                                {{$store.state.dialog.to}}
                            </el-link>
                        </el-descriptions-item>
                        <el-descriptions-item label="Amount"
                                              v-if="$store.state.balanceValue!=''&&$store.state.txt.trim()!='Swap'">
                            <el-tag size="small">
                                    <span v-if="$store.state.txt.trim()!='Approve'">
                                    {{$store.state.dialog.amount}}
                                </span>
                                <span v-if="$store.state.txt.trim()=='Approve'">
                                    Max
                                </span>
                                {{JSON.parse($store.state.balanceValue).text}}
                            </el-tag>
                        </el-descriptions-item>
                        <el-descriptions-item label="Amount" v-if="$store.state.txt.trim()=='Swap'">
                            <el-tag size="small">
                              <span>
                                    {{$store.state.dialog.amount}} {{$store.state.dialog.fromName}} -> {{$store.state.dialog.toAmount}} {{$store.state.dialog.toName}}
                               </span>

                            </el-tag>
                        </el-descriptions-item>
                        <el-descriptions-item label="Amount" v-if="$store.state.txt.trim()=='WETC Deposit'">
                            <el-tag size="small">
                              <span>
                                    {{$store.state.dialog.amount}} ETC -> {{$store.state.dialog.amount}} WETC
                               </span>

                            </el-tag>
                        </el-descriptions-item>
                        <el-descriptions-item label="Amount" v-if="$store.state.txt.trim()=='WETC Withdraw'">
                            <el-tag size="small">
                              <span>
                                    {{$store.state.dialog.toAmount}} WETC -> {{$store.state.dialog.toAmount}} ETC
                               </span>

                            </el-tag>
                        </el-descriptions-item>
                        <el-descriptions-item
                                v-if="$store.state.balanceValue!=''&&JSON.parse($store.state.balanceValue).contract!=''"
                                label="Contract">
                            <el-link
                                    @click="$g.open('https://blockscout.com/etc/mainnet/address/'+JSON.parse($store.state.balanceValue).contract)"
                                    target="_blank" type="primary">
                                {{JSON.parse($store.state.balanceValue).contract}}
                            </el-link>
                        </el-descriptions-item>

                        <el-descriptions-item label="Amount" v-if="$store.state.txt.trim()=='AddLiquidity'">
                            <el-tag size="small">
                              <span>
                                    {{$store.state.dialog.fromAmount}} {{$store.state.dialog.fromName}} + {{$store.state.dialog.toAmount}} {{$store.state.dialog.toName}}
                               </span>

                            </el-tag>
                        </el-descriptions-item>
                        <el-descriptions-item label="NFT" v-if="$store.state.txt.trim()=='Send NFT'">
                            <el-tag size="small">
                                <span>#{{$store.state.dialog.fromNum}}</span>
                            </el-tag>
                        </el-descriptions-item>
                        <el-descriptions-item label="Transfer" v-if="$store.state.txt.trim()=='Send NFT'">
                            <el-tag size="small">
                              <span>
                                {{$store.state.dialog.fromName}}
                               </span>

                            </el-tag>
                        </el-descriptions-item>
                        <el-descriptions-item label="Amount" v-if="$store.state.txt.trim()=='RemoveLiquidity'">
                            <el-tag size="small" style="margin-right: 10px">
                              <span>
                                   - {{$store.state.dialog.lpliquidity}} HLP
                               </span>
                            </el-tag>
                            <el-tag size="small">
                              <span>
                                  +  {{$store.state.dialog.fromAmount}} {{$store.state.dialog.fromName}} + {{$store.state.dialog.toAmount}} {{$store.state.dialog.toName}}
                               </span>

                            </el-tag>
                        </el-descriptions-item>


                        <el-descriptions-item label="Fee">
                            {{$store.state.dialog.fee}} ETC （ Gas Price :{{$store.state.dialog.gasPrice}} Gas Limit :
                            {{$store.state.dialog.gasLimit}}）
                        </el-descriptions-item>
                        <el-descriptions-item label="Nonce">
                            {{$store.state.dialog.nonce}}
                        </el-descriptions-item>
                    </el-descriptions>
                    <el-collapse>
                        <el-collapse-item title="Data" name="data">
                            {{$store.state.dialog.data}}
                        </el-collapse-item>
                        <el-collapse-item title="Hex" name="1">
                            {{$store.state.hex}}
                        </el-collapse-item>
                    </el-collapse>
                </div>
                <div slot="footer"
                     style="padding: 10px 0px 20px;text-align: right;-webkit-box-sizing: border-box;box-sizing: border-box;">
                    <el-button @click="$store.state.dialogSendVisible=false">Cancel</el-button>
                    <el-button type="primary" @click="send">Ok</el-button>
                </div>
            </div>
            <div v-if="$store.state.send100">
                <el-result style="word-break: break-all;" title="Pending">
                    <template slot="icon">
                        <i class="el-icon-loading" style="color: #409EFF;font-size: 80px"></i>
                    </template>
                    <template slot="subTitle">
                        <el-link
                                @click="$g.open('https://blockscout.com/etc/mainnet/tx/'+$store.state.hash+'/token-transfers')"
                                target="_blank"
                                type="primary">
                            {{$store.state.hash}}
                        </el-link>
                    </template>
                    <template slot="extra">
                        <el-button
                                v-clipboard:copy="$store.state.hash"
                                v-clipboard:success="onCopy"
                                v-clipboard:error="onError" type="primary" size="medium">Copy Hash
                        </el-button>
                    </template>
                </el-result>
            </div>
            <div v-if="$store.state.send200">
                <el-result style="word-break: break-all;" icon="success" title="Success">
                    <template slot="subTitle">
                        <el-link
                                @click="$g.open('https://blockscout.com/etc/mainnet/tx/'+$store.state.hash+'/token-transfers')"
                                target="_blank"
                                type="primary">
                            {{$store.state.hash}}
                        </el-link>
                    </template>
                    <template slot="extra">
                        <el-button
                                v-clipboard:copy="$store.state.hash"
                                v-clipboard:success="onCopy"
                                v-clipboard:error="onError" type="primary" size="medium">Copy Hash
                        </el-button>
                    </template>
                </el-result>
            </div>
            <div v-if="$store.state.send400">
                <el-result style="word-break: break-all;" icon="error" title="Error" subTitle="Please try again">
                </el-result>
            </div>
        </el-dialog>
        <el-dialog
                title="Setting"
                :visible.sync="$store.state.settingVisible"
                width="40%">
            <div>
                <el-form label-width="80px" :label-position="labelPosition">
                    <el-form-item label="SyncMode">
                        <el-select v-model="$store.state.form.syncmode" placeholder="syncmode">
                            <el-option label="Fast" value="fast"></el-option>
                            <el-option label="Light" value="light"></el-option>
                            <el-option label="Full" value="full"></el-option>
                            <el-option label="Rpc" value="rpc"></el-option>
                        </el-select>
                    </el-form-item>
                    <div style="padding: 8px 16px;background-color: #ecf8ff;border-radius: 4px;
    border-left: 5px solid #50bfff; margin: 20px 0;">
                        <div v-if="$store.state.form.syncmode=='fast'">
                            Minimum configuration requirements: 60GB SSD + 8GB RAM
                        </div>
                        <div v-if="$store.state.form.syncmode=='full'">
                            Minimum configuration requirements: 260GB SSD + 8GB RAM
                        </div>
                        <div v-if="$store.state.form.syncmode=='light'">
                            Light nodes enable users to participate in the Ethereum network without the powerful
                            hardware or high bandwidth required to run full nodes.
                        </div>
                        <div v-if="$store.state.form.syncmode=='rpc'">
                            Use public rpc provided by a third party, no need to synchronize blocks
                        </div>
                    </div>
                    <el-form-item label="Http">
                        <el-switch v-model="$store.state.form.http"></el-switch>
                    </el-form-item>
                    <el-form-item label="Ws">
                        <el-switch v-model="$store.state.form.ws"></el-switch>
                    </el-form-item>
                    <el-form-item label="Cros">
                        <el-switch v-model="$store.state.form.cros"></el-switch>
                    </el-form-item>
                    <el-form-item label="Eruda">
                        <el-switch v-model="$store.state.form.eruda"></el-switch>
                    </el-form-item>
                    <el-form-item label="Ipfs">
                        <el-input v-model="$store.state.form.ipfs"></el-input>
                    </el-form-item>
                    <el-form-item v-if="$store.state.form.syncmode=='rpc'" label="Rpc">
                        <el-input v-model="$store.state.form.rpc"></el-input>
                    </el-form-item>
                </el-form>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="$store.state.settingVisible = false">Cancel</el-button>
                <el-button type="primary" @click="SettingFn">Ok</el-button>
          </span>
        </el-dialog>

    </div>
</template>

<script>
    const {isConfusing, confusables, rectifyConfusion} = require('unicode-confusables');

    export default {
        name: 'etc-desktop',
        data() {
            return {
                hensLoading: false,
                labelPosition: 'left',

            }
        },
        methods: {
            SettingFn() {
                if (this.$route.path == '/') {
                    this.$alert('The configuration is successful, please click Import Wallet again', '', {
                        confirmButtonText: 'Ok',
                    });
                }
                if (localStorage.getItem('setting') != null) {
                    this.$alert('The configuration modification is successful and will take effect in the next startup', '', {
                        confirmButtonText: 'Ok',
                    });
                }
                localStorage.setItem('setting', JSON.stringify(this.$store.state.form));
                this.$store.state.settingVisible = false;
            },
            async addrHens() {
                if (this.$store.state.dialog.to.indexOf('.etc') != -1) {
                    this.hensLoading = true;
                    let model = await this.$g.getHens(this.$store.state.dialog.to, this)
                    this.$store.state.dialog.to = model.addr
                    this.hensLoading = false;
                }
            },
            onCopy() {
                this.$message({
                    message: 'Copy Success',
                    type: 'success',
                });
            },
            onError() {
                this.$message.error('Copy Error');
            },
            async send() {
                this.$store.state.loading = true;
                let hash = await this.$g.eth_sendRawTransaction(this.$store.state.hex);
                this.$store.state.hash = hash.transaction;
                this.$store.state.sendis = false
                this.$store.state.loading = false;

                if (hash != '404') {
                    this.$store.state.send100 = true
                    let tt = await this.$g.eth_getTransactionReceipt(hash.transaction)
                    this.$store.state.send100 = false
                    if (tt == '0x0') {
                        this.$store.state.send400 = true;
                    } else {
                        this.$store.state.send200 = true;
                        this.$g.fn();
                        if (this.$store.state.txt.trim() == "Approve") {
                            let select = []
                            if (localStorage.getItem('approve') != null) {
                                select = JSON.parse(localStorage.getItem('approve'));
                            }
                            select.push({
                                addr: this.$store.state.wallet.address,
                                contract: this.$store.state.dialog.to,
                                date: Math.floor(new Date().getTime() / 1000) + (60 * 5)
                            })
                            localStorage.setItem('approve', JSON.stringify(select));
                        }
                    }


                } else {
                    this.$store.state.send400 = true;
                }
            },
            async openSend() {
                this.$store.state.dialog.data = ''
                this.$store.state.dialog.nonce = await this.$g.getNonce(this.$store.state.wallet.address)
                await this.$g.gasFn(this)

            },
            async handleSend1() {
                this.$g.handleSend(this)
                // await this.$g.gasFn(this)
                // let isAddress = this.$g.isAddress(this.$store.state.dialog.to)
                // if (!isAddress) {
                //     this.$notify.error({
                //         title: 'Error',
                //         message: 'Wrong address'
                //     });
                //     return
                // }
                // if (isNaN(parseInt(this.$store.state.dialog.gasPrice)) || parseInt(this.$store.state.dialog.gasPrice) <= 0) {
                //     this.$notify.error({
                //         title: 'Error',
                //         message: 'Wrong GasPrice'
                //     });
                //     return
                // }
                // if (isNaN(parseInt(this.$store.state.dialog.gasLimit)) || parseInt(this.$store.state.dialog.gasLimit) <= 0) {
                //     this.$notify.error({
                //         title: 'Error',
                //         message: 'Wrong GasLimit'
                //     });
                //     return
                // }
                // if (isNaN(parseFloat(this.$store.state.dialog.amount))
                //     ||
                //     parseFloat(this.$store.state.dialog.amount) <= 0 || JSON.parse(this.$store.state.balanceValue).balance < this.$store.state.dialog.amount) {
                //     this.$notify.error({
                //         title: 'Error',
                //         message: 'Wrong Amount'
                //     });
                //     return
                // }
                // let fee = this.$web3.utils.fromWei((this.$web3.utils.toWei(this.$store.state.dialog.gasPrice, 'Gwei') * this.$store.state.dialog.gasLimit).toString(), 'ether');
                // if (fee > this.$store.state.balanceList[0].balance) {
                //     this.$notify.error({
                //         title: 'Error',
                //         message: 'Not enough fees'
                //     });
                //     return;
                // }
                // this.$store.state.dialog.fee = fee;
                // let amount = this.$store.state.dialog.amount
                // let data = this.$store.state.dialog.data
                // let to = this.$store.state.dialog.to
                //
                //
                // if (this.$store.state.balanceValue != '') {
                //     let erc20 = JSON.parse(this.$store.state.balanceValue)
                //     amount = this.$web3.utils.toHex(0)
                //     let tokensum = BigInt(this.$store.state.dialog.amount * Math.pow(10, erc20.decimals))
                //     data = this.$web3.eth.abi.encodeFunctionCall({
                //         name: 'transfer',
                //         type: 'function',
                //         inputs: [
                //             {
                //                 type: 'address',
                //                 name: '_to',
                //             },
                //             {
                //                 type: 'uint256',
                //                 name: '_value',
                //             },
                //         ],
                //     }, [this.$store.state.dialog.to, tokensum]);
                //     to = erc20.contract;
                // }
                //
                // let model = {
                //     nonce: this.$web3.utils.toHex(this.$store.state.dialog.nonce),
                //     to: to,
                //     gas: this.$store.state.dialog.gasLimit,
                //     value: amount,
                //     gasPrice: this.$web3.utils.toHex(this.$web3.utils.toWei(this.$store.state.dialog.gasPrice, 'Gwei')),
                //     data: this.$web3.utils.toHex(data),
                //     common: {
                //         baseChain: 'mainnet',
                //         hardfork: 'petersburg',
                //         customChain: {
                //             name: 'Ethereum Classic',
                //             chainId: this.$web3.utils.hexToNumber(61),
                //             networkId: this.$web3.utils.hexToNumber(61),
                //         },
                //     }
                // };
                //
                // let wif = await this.$g.openprv(this, this.$store.state.wallet)
                // if (wif != '') {
                //     let tx = await this.$web3.eth.accounts.signTransaction(model, wif);
                //     this.$store.state.hex = tx.rawTransaction
                //     this.$store.state.dialogVisible = false;
                //     this.$store.state.dialogSendVisible = true
                //     this.sendis = true;
                //     this.send200 = false;
                //     this.send400 = false;
                // }
            },
            handleClose() {
                this.$store.state.dialogVisible = false;
                this.$store.state.balanceValue = ''
                this.$store.state.dialog = {
                    to: '',
                    amount: 0,
                    gasLimit: 0,
                    gasPrice: 0,
                    data: '',
                    fee: 0,
                    nonce: 0
                }
            },
            handleCloses() {
                this.$store.state.dialogSendVisible = false
            },
        },
        mounted() {

            setTimeout(() => {
                let is = this.$g.stores.has('wallet');
                if (is) {
                    let wallet = this.$g.stores.get('wallet')
                    let model = ''
                    wallet.wallet.forEach(item => {
                        if (item.address == wallet.address) {
                            model = item;
                        }
                    })
                    if (model != '') {
                        this.$store.commit('setWallet', model);
                        if (this.$route.path != '/index') {
                            this.$router.push({path: '/index'});
                        }
                    }

                } else if (this.$route.path != '/') {
                    this.$router.push({path: '/'});
                }

            })
        }
    }
</script>

<style>
    .el-message-box__message p {

        word-break: break-word;
    }

    .el-dialog__body {
        padding: 0px 20px !important;
    }

    .el-form-item {
        margin-bottom: 2px !important;
    }

    .el-form--label-top .el-form-item__label {
        padding: 0 0 0px !important;
    }

    html,
    body,
    ul,
    li,
    ol,
    dl,
    dd,
    dt,
    p,
    h1,
    h2,
    h3,
    h4,
    h5,
    h6,
    form,
    fieldset,
    legend,
    img {
        margin: 0;
        padding: 0;
    }

    fieldset,
    img,
    input,
    button,
    textarea {
        border: none;
        padding: 0;
        margin: 0;
        outline-style: none;
    }

    ul,
    ol {
        list-style: none;
    }

    input {
        padding-top: 0;
        padding-bottom: 0;
        font-family: "SimSun", "宋体";
    }

    select,
    input {
        vertical-align: middle;
    }

    select,
    input,
    textarea {
        font-size: 12px;
        margin: 0;
    }

    textarea {
        resize: none;
    }


    /*防止拖动*/

    img {
        border: 0;
    }


    /*  去掉图片低测默认的3像素空白缝隙*/

    table {
        border-collapse: collapse;
    }

    body {
        font: 12px/150% Arial, Verdana, "\5b8b\4f53";
        color: #666;
        background: #fff
    }

    .clearfix:before,
    .clearfix:after {
        content: "";
        display: table;
    }

    .clearfix:after {
        clear: both;
    }

    .clearfix {
        *zoom: 1;
        /*IE/7/6*/
    }

    a {
        color: #666;
        text-decoration: none;
    }


    /* a:hover {
        color: #f2ad00;
    } */

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
        text-decoration: none;
        font-weight: normal;
        font-size: 100%;
    }

    s,
    i,
    em {
        font-style: normal;
        text-decoration: none;
    }

    html, body, #app {
        height: 100%;
    }
</style>
