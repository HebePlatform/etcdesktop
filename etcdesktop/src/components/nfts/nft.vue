<template>
    <div class="token nftlist" style="margin:0px 16px;font-size: 14px">
        <el-card style="margin-top: 14px">
            <el-empty v-if="list.length==0" description="No Date"></el-empty>

            <el-collapse v-if="list.length!=0" v-model="activeNames" @change="handleChange">
                <el-collapse-item v-for="item in list" :name="item.contractAddress"
                                  v-if="item.contractAddress.toLocaleLowerCase()!='0x8474D3346441F85668C1dDAB46ff2D1Af1531698'.toLocaleLowerCase()
                        &&item.listmodel.length!=0">
                    <template slot="title">
                        <div style="position: relative;width: 100%">
                            {{item.name+' （'+item.balance+'）'}}
                            <div style="position: absolute;right: 10px;top:0">
                                <el-link
                                        @click.stop="$g.open('https://blockscout.com/etc/mainnet/address/'+item.contractAddress)"
                                        style="float: right" type="primary">{{item.contractAddress}}
                                </el-link>
                            </div>
                        </div>
                    </template>
                    <div v-for="items in item.listmodel"
                         @click="sendNft(items)"
                         style="cursor: pointer;float: left;overflow: hidden;margin-bottom: 10px">
                        <el-image
                                style="width: 166px; height: 166px;margin-right: 10px"
                                :src="items.json.image"
                                :preview-src-list="items.srcList">
                        </el-image>
                        <div>
                            #{{items.nftmodel.num}}
                        </div>
                    </div>


                </el-collapse-item>
            </el-collapse>
        </el-card>
        <el-dialog
                v-if="item.nftmodel"
                :title="item.nftmodel.name+' - #'+item.nftmodel.num"
                :visible.sync="dialogVisible"
                width="40%">
            <div>
                <div v-if="item.json" style="text-align: center;padding: 10px 0px">
                    <el-image
                            style="width: 160px; height: 160px"
                            :src="item.json.image"
                            :preview-src-list="[item.json.image]">
                    </el-image>
                </div>
                <div>
                    <el-form :label-position="'top'" label-width="80px">

                        <el-form-item label="To">
                            <el-input v-loading="hensLoading" @input="contractinput" v-model="to"
                                      placeholder="0x.... / .etc"></el-input>
                        </el-form-item>
                    </el-form>
                </div>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">Cancel</el-button>
                <el-button type="primary" @click="sendNftFn">Send</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        name: "nft",
        data() {
            return {
                loadtimer: null,
                hensLoading: false,
                dialogVisible: false,
                to: '',
                activeNames: ['1'],
                url: '',
                srcList: [
                    '',
                    ''
                ],
                list: [],
                item: {}
            };
        },
        methods: {
            async sendNftFn() {
                if (this.to.indexOf('.etc') != -1) {
                    await this.contractinput()
                }
                console.log(this.item);
                this.$store.state.balanceValue = ''
                this.$store.state.dialog.to = this.item.nftmodel.contractAddress;
                this.$store.state.dialog.amount = '0';
                this.$store.state.txt = 'Send NFT ';
                this.$store.state.dialog.fromName = this.to;
                this.$store.state.dialog.fromNum = this.item.nftmodel.num;

                if (this.item.nftmodel.contractAddress.toLowerCase() != '0x03f4a95d964d364614e514e8638d61cdeed4f8d4'.toLowerCase()
                    && this.item.nftmodel.contractAddress.toLowerCase() != '0x8474d3346441f85668c1ddab46ff2d1af1531698'.toLowerCase()) {
                    this.$store.state.dialog.data = this.$web3.eth.abi.encodeFunctionCall({
                            name: 'transferFrom',
                            type: 'function',
                            inputs: [{
                                type: 'address',
                                name: '_from',
                            },
                                {
                                    type: 'address',
                                    name: '_to',
                                }, {
                                    type: 'uint256',
                                    name: '_tokenId',
                                }],
                        },
                        [this.$store.state.wallet.address,
                            this.to,
                            this.item.nftmodel.num]);
                } else {
                    let name = await this.$g.hens.getNameOfOwner(this.to)
                    if (name != '') {
                        this.$notify.error({
                            title: 'Error',
                            message: 'The address already owns a HENS'
                        });
                        return;
                    }
                    let hensName = this.$store.state.hens.name;
                    hensName = hensName.slice(0, -4)
                    this.$store.state.dialog.data = this.$web3.eth.abi.encodeFunctionCall({
                        name: 'transfer',
                        type: 'function',
                        inputs: [{
                            type: 'address',
                            name: 'to',
                        }, {
                            type: 'string',
                            name: 'name_',
                        }],
                    }, [this.to, hensName]);
                }
                await this.$g.gasFn(this)

                this.$store.state.dialog.nonce = await this.$g.getNonce(this.$store.state.wallet.address)
                this.$store.state.dialog.fee = this.$web3.utils.fromWei((this.$web3.utils.toWei(this.$store.state.dialog.gasPrice, 'Gwei') * this.$store.state.dialog.gasLimit).toString(), 'ether');

                if (this.$store.state.dialog.fee > this.$store.state.balanceList[0].balance) {
                    this.$notify.error({
                        title: 'Error',
                        message: 'Not enough fees'
                    });
                    return;
                }
                this.$g.handleSend(this)
                this.dialogVisible = false;
            },
            async contractinput() {
                if (this.to.indexOf('.etc') != -1) {
                    this.hensLoading = true
                    let model = await this.$g.getHens(this.to, this)
                    this.to = model.addr
                    this.hensLoading = false
                }
            },
            sendNft(item) {
                this.to = ''
                this.item = item;
                this.dialogVisible = true;
                console.log(this.item);
            },
            handleChange(val) {
                console.log(val);
            },
            async load() {
                // etcs
                let address = this.$store.state.wallet.address;
                let api = 'https://apis.exhebe.com/etcs/api?module=account&action=tokenlist&address=' + address;
                this.$axios({
                    method: 'get',
                    url: api,
                    timeout: 15000
                }).then(async res => {
                    this.loading = false
                    let list = []
                    res.data.result.forEach(item => {
                        if (item.type == "ERC-721") {
                            item.listmodel = []
                            item.srclist = []
                            list.push(item)
                        }
                    })
                    let ipfsurl = "https://classicsavages.mypinata.cloud/ipfs/";
                    let setting = localStorage.getItem('setting')
                    if (setting != null) {
                        setting = JSON.parse(setting)
                        ipfsurl = setting.ipfs;
                    }
                    for (let i = 0; i < list.length; i++) {
                        let model = list[i]
                        if (model.contractAddress.toLocaleLowerCase() != '0x03f4a95d964d364614e514e8638d61cdeed4f8d4'
                            && model.contractAddress.toLocaleLowerCase() != '0x8474d3346441f85668c1ddab46ff2d1af1531698') {
                            for (let ii = 0; ii < parseInt(model.balance); ii++) {
                                let nftmodel = await this.tokenOfOwnerByIndex(address, ii, model.contractAddress)
                                if (nftmodel.href) {
                                    nftmodel.name = model.name
                                    if (nftmodel.href.indexOf('ipfs://') == 0) {
                                        nftmodel.href = ipfsurl + nftmodel.href.split('ipfs://')[1];
                                    }
                                    let json = await this.getjson(nftmodel.href);
                                    if (json.image != '') {
                                        if (json.image.indexOf('ipfs://') == 0) {
                                            json.image = ipfsurl + json.image.split('ipfs://')[1];
                                        }
                                        if (json.image && json.image != '') {
                                            model.listmodel.push({
                                                nftmodel: nftmodel,
                                                json: json
                                            })
                                            model.srclist.push(json.image)
                                        }
                                    }
                                }
                            }
                        } else {
                            model.listmodel.push({
                                nftmodel: {
                                    name: "HENS",
                                    num: this.$store.state.hens.id,
                                    contractAddress: model.contractAddress
                                },
                                json: {
                                    image: this.$store.state.hens.img
                                }
                            })
                            model.srclist = []
                            model.srclist.push(this.$store.state.hens.img)

                        }
                    }

                    this.list = list;

                })
            },
            async getjson(href) {
                return new Promise(async (resolve, reject) => {
                    this.$axios({
                        method: 'get',
                        url: href,
                        timeout: 36000
                    }).then(res => {
                        resolve(res.data)
                    }).catch(err => {
                        resolve('')
                    })
                })
            },
            tokenOfOwnerByIndex(addr, index, contractAddress) {
                return new Promise(async (resolve, reject) => {
                    let tokenOfOwnerByIndexabi = this.$web3.eth.abi.encodeFunctionCall({
                        name: 'tokenOfOwnerByIndex',
                        type: 'function',
                        inputs: [{
                            type: 'address',
                            name: '_owner'
                        },
                            {
                                type: 'uint256',
                                name: '_index'
                            }]
                    }, [addr, index])
                    this.$axios({
                        method: 'post',
                        url: this.$g.rpc,
                        data: {
                            'method': 'eth_call',
                            'params': [{
                                'to': contractAddress,
                                'data': tokenOfOwnerByIndexabi,
                            }, 'latest'],
                            "id": 1,
                            "jsonrpc": "2.0",
                        },
                        timeout: 15000
                    }).then(res => {
                        if (res.data.result == null) {
                            resolve('')
                        }
                        let num = this.$web3.utils.hexToNumberString(res.data.result)

                        let tokenURIabi = this.$web3.eth.abi.encodeFunctionCall({
                            name: 'tokenURI',
                            type: 'function',
                            inputs: [
                                {
                                    type: 'uint256',
                                    name: 'tokenId'
                                }]
                        }, [num]);
                        this.$axios({
                            method: 'post',
                            url: this.$g.rpc,
                            data: {
                                'method': 'eth_call',
                                'params': [{
                                    'to': contractAddress,
                                    'data': tokenURIabi,
                                }, 'latest'],
                                "id": 1,
                                "jsonrpc": "2.0",
                            },
                            timeout: 15000
                        }).then(res => {
                            let href = this.$web3.eth.abi.decodeParameters(['string'], res.data.result)
                            resolve({
                                href: href[0],
                                num: num,
                                contractAddress: contractAddress,
                            })
                        });
                    })
                })
            }
        },
        mounted() {
            this.load()

            this.loadtimer = setInterval(() => {
                this.load()
            }, 3000)
        },
        destroyed() {
            clearTimeout(this.loadtimer)
            this.loadtimer = null;
        }
    }
</script>

<style lang="less">
    .nftlist {
        .el-dialog {
            .el-input__inner {
                border: none !important;
                border-bottom: 1px solid #DCDFE6 !important;
                border-radius: 0px !important;
            }
        }
    }
</style>
