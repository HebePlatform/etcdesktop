<template>
    <div class="panel-wallet" style="margin:0px 16px">
        <el-row :gutter="20" style="margin-top: 12px">
            <el-col :span="8">
                <el-card shadow="always">
                    <div class="txtcolor">
                        Balance
                    </div>
                    <div class="txtcolor1">
                        {{balance}} ETC
                    </div>
                </el-card>
            </el-col>
            <el-col :span="8">
                <el-card shadow="always">
                    <div class="txtcolor">
                        Name Service
                    </div>
                    <div class="txtcolor1" v-if="$store.state.hens.name!=''">
                        {{$store.state.hens.name}}
                    </div>
                    <div class="txtcolor1" v-if="$store.state.hens.name==''">
                        <span style=" color: #1890ff;cursor: pointer"
                              @click="$g.open('https://app.hens.domains')">
                        Mint Hens
                      </span>
                    </div>
                </el-card>
            </el-col>
            <el-col :span="8">
                <el-card shadow="always">
                    <div class="txtcolor">
                        Block Last Updated <span>- {{syncmode.toUpperCase()}}</span>
                    </div>
                    <div class="txtcolor1">
                        <div v-if="$store.state.network==''">Connecting</div>
                        <div v-if="$store.state.network!=''">
                            {{$store.state.network.currentBlock}}
                        </div>

                    </div>
                </el-card>
            </el-col>
        </el-row>
        <div v-loading="loading"
             class="table_list" style="border-radius: 8px;background: #fff;padding: 10px;margin-top: 12px">
            <el-row :gutter="20"
                    style="margin-top: 6px;font-size: 14px;font-weight: bold;margin-bottom: 14px;text-align: center">
                <el-col :span="4">Date</el-col>
                <el-col :span="4">Type</el-col>
                <el-col :span="4">Amount</el-col>
                <el-col :span="2">Fee</el-col>
                <el-col :span="6">Account</el-col>
                <el-col :span="2" style="text-align: left;">Height</el-col>
                <el-col :span="2" style="text-align: left;">Confirms</el-col>
            </el-row>
            <el-empty v-if="list.length==0" description="No Date"></el-empty>

            <div v-for="item in list" style="border-bottom: 1px solid #f0f0f0;">
                <el-row style="text-align: left;margin:10px 0;text-align: center">
                    <el-col :span="4" style="color: #1890ff;cursor: pointer">
                      <span @click="$g.open('https://blockscout.com/etc/mainnet/tx/'+item.txid)">
                          {{item.time}}
                      </span>
                    </el-col>
                    <el-col :span="4">
                        {{item.typetxt}}
                    </el-col>
                    <el-col :span="4">
                        <span style="color: green;" v-if="item.is">
                              +{{item.sum}}
                        </span>
                        <span style="color: red;" v-if="!item.is">
                              -{{item.sum}}
                        </span>
                    </el-col>
                    <el-col :span="2">{{item.fee}}</el-col>
                    <el-col :span="6" style="color: #1890ff;cursor: pointer">
                        <span v-if="item.is"
                              @click="$g.open('https://blockscout.com/etc/mainnet/address/'+item.senderRS)">
                            {{$g.subname(item.senderRS)}}
                        </span>
                        <span v-if="!item.is"
                              @click="$g.open('https://blockscout.com/etc/mainnet/address/'+item.recipientRS)">
                              {{$g.subname(item.recipientRS)}}
                        </span>
                    </el-col>
                    <el-col :span="2">{{item.height}}</el-col>
                    <el-col :span="2" style="text-align: center">{{item.confirmations.toLocaleString()}}+</el-col>
                </el-row>
            </div>
            <div style="text-align: center;margin-top: 10px">
                <el-pagination
                        background
                        :current-page.sync="current"
                        @current-change="changge"
                        :page-size="pagesize"
                        layout="prev, pager, next"
                        :total="total">
                </el-pagination>
            </div>
        </div>
    </div>
</template>

<script>

    export default {
        name: 'landing-page',
        data() {
            return {
                loadtimer: null,
                cmdData: '',
                current: 1,
                pagesize: 8,
                total: 0,
                list: [],
                balance: 0,
                loading: true,
                syncmode:''
            }
        },
        methods: {
            changge(val) {
                this.current = val;
                this.load(true)
            },
            load(is) {
                // ;
                let address = this.$store.state.wallet.address;
                this.loading = is;
                let api = 'https://apis.exhebe.com/etc/api/v2/address/' + address + '?page=' + this.current + '&pageSize=' + this.pagesize + '&details=txs';
                this.$axios({
                    method: 'get',
                    url: api,
                    timeout: 15000
                }).then(res => {
                    this.loading = false
                    this.total = res.data.txs;
                    this.list = []
                    this.balance = this.$g.decimals(res.data.balance, 18)
                    this.balance = Math.floor(this.balance * 10000) / 10000;
                    console.log(this.balance, "page=1&pageSize=8&");
                    let balancelist = [
                        {
                            text: 'ETC',
                            balance: this.balance,
                            contract: ""
                        }
                    ]
                    if (res.data.tokens) {
                        let tokens = res.data.tokens.sort(this.$g.compare("transfers"));
                        this.$store.commit('setTokens', tokens);
                        tokens.forEach(item => {
                            if (item.type == "ERC20") {
                                let tokenBalance = this.$g.decimals(item.balance, item.decimals);
                                if (tokenBalance != 0) {
                                    tokenBalance = this.$g.numberx(tokenBalance)
                                    balancelist.push({
                                        text: item.symbol,
                                        balance: tokenBalance,
                                        contract: item.contract,
                                        decimals: item.decimals
                                    })
                                }
                            }
                        })
                    }
                    this.$store.commit('setBalanceList', balancelist);

                    if (res.data.transactions) {
                        res.data.transactions.forEach(v => {
                            v.height = v.blockHeight;
                            v.time = this.$g.formatDateTime(parseInt(v.blockTime) * 1000);
                            v.is = false;

                            v.vin.forEach(items => {
                                items.addr = items.addresses[0]
                                if (items.addr.toUpperCase() == address.toUpperCase()) {
                                    v.is = false;
                                } else {
                                    v.is = true;
                                    v.senderRS = items.addr;
                                }
                            })
                            if (v.is == false) {
                                v.senderRS = address;
                            }
                            v.vout.forEach(items => {
                                if (items.addresses) {
                                    items.addr = items.addresses[0]
                                    if (v.is) {
                                        if (items.addr.toUpperCase() == address.toUpperCase()) {
                                            v.sum = items.value
                                            v.recipientRS = address;
                                        }
                                    } else {
                                        if (items.addr.toUpperCase() != address.toUpperCase()) {
                                            v.sum = items.value
                                            v.recipientRS = items.addr;
                                        }

                                    }
                                } else {
                                    v.is = true
                                }
                            });

                            if (v.is) {
                                v.typetxt = "Receive Etc"
                            } else {
                                v.typetxt = "Send Etc"
                            }
                            v.sum = this.$g.float(v.sum).toFixed(6);

                            //Receive token
                            if (v.is && v.tokenTransfers) {
                                v.tokenTransfers.forEach(vv => {
                                    if (vv.to.toUpperCase() == address.toUpperCase()) {
                                        if (vv.from == "0x0000000000000000000000000000000000000000") {
                                            v.typetxt = "Tokens Minted"
                                        } else {
                                            v.typetxt = "Tokens Transfer"
                                        }
                                        v.sum = this.$g.decimals(vv.value, parseInt(vv.decimals))
                                        v.sum = Math.floor(v.sum * 10000) / 10000
                                        v.sum = v.sum.toLocaleString() + " " + vv.symbol
                                    }
                                })
                            }
                            if (!v.is && v.tokenTransfers) {
                                if (v.sum == 0) {
                                    v.tokenTransfers.forEach(vv => {
                                        if (vv.from.toUpperCase() == address.toUpperCase()) {
                                            v.typetxt = "Tokens Transfer"
                                            v.sum = this.$g.decimals(vv.value, parseInt(vv.decimals))
                                            v.sum = Math.floor(v.sum * 10000) / 10000
                                            v.sum = v.sum.toLocaleString() + " " + vv.symbol
                                            v.recipientRS = vv.to
                                        }
                                    })
                                }

                            }

                            if (v.ethereumSpecific && v.ethereumSpecific.data) {
                                let txt = this.$g.methodId(v.ethereumSpecific.data)
                                if (txt != '') {
                                    v.typetxt = txt
                                }
                                if (v.ethereumSpecific.status == 0) {
                                    v.typetxt = "Error"
                                }
                                if (JSON.stringify(v).toString().toLocaleLowerCase().indexOf('0x03f4a95d964d364614E514e8638d61CDEed4f8D4'.toLocaleLowerCase()) != -1) {
                                    v.typetxt = "HENS Transfer"
                                }
                                if (JSON.stringify(v).toString().toLocaleLowerCase().indexOf('0x82a618305706b14e7bcf2592d4b9324a366b6dad'.toLocaleLowerCase()) != -1) {
                                    if (v.ethereumSpecific.data.indexOf("0xd0e30db0") == 0) {
                                        v.typetxt = "WETC Deposit";
                                    }
                                    if (v.ethereumSpecific.data.indexOf("0x2e1a7d4d") == 0) {
                                        v.typetxt = "WETC Withdraw";
                                        v.is = true;
                                        let sums = '0x' + v.ethereumSpecific.data.split("0x2e1a7d4d")[1]
                                        sums = this.$web3.utils.hexToNumber(sums)
                                        v.sum = this.$g.decimals(sums,18)
                                        v.sum = Math.floor(v.sum * 10000) / 10000
                                    }
                                }
                            }

                            v.fee = this.$g.float(v.fees).toFixed(6);
                            v.transaction = v.txid;
                            this.pushTime(v);
                        });

                    }
                })
                this.$g.getNameOfOwner(address).then(name => {
                    this.$store.state.hens.name = name;
                    if (name != '') {
                        this.$g.getTokenIdOfName(name).then(id => {

                            this.$store.state.hens.id = id;
                            this.$store.state.hens.img = 'https://json.hens.domains/hens/' + id + '/hens.jpg';
                        })
                    }
                })
            },
            pushTime(v) {
                let pushIs = true;
                this.list.forEach(model => {
                    if (model.transaction == v.transaction) {
                        pushIs = false;
                    }
                });
                if (pushIs) {
                    if (this.list[0]) {
                        let stdt = new Date(this.list[0].time.replace(/-/g, "/"));
                        let etdt = new Date(v.time.replace(/-/g, "/"));
                        if (stdt.getTime() > etdt.getTime()) {
                            this.list.push(v);
                        } else {
                            this.list.unshift(v);
                        }
                    } else {
                        this.list.push(v);
                    }

                }
            }
        },
        computed: {},
        mounted() {
            let setting = localStorage.getItem('setting')
            if (setting != null) {
                setting = JSON.parse(setting)
                this.syncmode=setting.syncmode;
            }

            setTimeout(() => {
                this.load(true)
            }, 200)
            this.loadtimer = setInterval(() => {
                this.load(false)
            }, 3000)
        },
        destroyed() {
            clearTimeout(this.loadtimer)
            this.loadtimer = null;
        }
    }
</script>

<style lang="less">
    .panel-wallet {
        .txtcolor {
            color: rgb(103, 116, 142);
            font-size: 14px;
            padding-bottom: 6px;
        }

        .txtcolor1 {
            font-size: 18px;
            text-align: right;
            font-weight: 700 !important;;
            color: rgb(52, 71, 103)
        }

        .table_list .el-col {
            padding: 2px 0px !important;
            font-size: 14px;
        }
    }

</style>
