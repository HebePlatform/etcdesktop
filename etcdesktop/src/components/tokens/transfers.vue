<template>
    <div class="panel-wallet" style="margin:0px 16px;">
        <div style="margin-top: 6px;">
            <el-page-header title="Back" @back="goBack">
                <div slot="content" style="font-size: 16px">
                    <span style="color: green;">
                        <span v-if="$g.item.balance!=0">
                            {{(Math.floor($g.decimals($g.item.balance, $g.item.decimals) * 10000) / 10000).toLocaleString()}}
                        </span>
                        <span v-if="$g.item.balance==0">
                             0
                        </span>
                    </span>
                    <span>{{$g.item.symbol}} Transfers</span>
                </div>
            </el-page-header>
        </div>
        <div v-loading="loading"
             class="table_list" style="border-radius: 8px;background: #fff;padding: 10px;margin-top: 8px">
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
        <div style="height: 20px"></div>

    </div>
</template>

<script>

    export default {
        name: 'transfers',
        data() {
            return {
                cmdData: '',
                current: 1,
                pagesize: 10,
                total: 0,
                list: [],
                balance: 0,
                loading: true,
            }
        },
        methods: {
            goBack() {
                this.$router.go(-1)
            },
            changge(val) {
                this.current = val;
                this.load()
            },
            load() {
                let address = this.$store.state.wallet.address;
                this.loading = true;
                let api = 'https://apis.exhebe.com/etc/api/v2/address/' + address + '?page=' + this.current + '&pageSize=' + this.pagesize +
                    '&details=txs&contract=' + this.$g.item.contract;
                this.$axios({
                    method: 'get',
                    url: api,
                    timeout: 15000
                }).then(res => {
                    this.loading = false
                    this.total = res.data.totalPages * this.pagesize;
                    this.list = []

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
                            v.tokenTransfers.forEach(vv => {
                                if (vv.from.toUpperCase() == address.toUpperCase()) {
                                    v.typetxt = "Tokens Transfer"
                                    v.sum = this.$g.decimals(vv.value, parseInt(vv.decimals))
                                    v.sum = Math.floor(v.sum * 10000) / 10000
                                    v.sum = v.sum.toLocaleString() + " " + vv.symbol
                                    v.recipientRS = vv.to
                                }
                                if (vv.to.toUpperCase() == address.toUpperCase()) {
                                    v.is = true
                                    v.typetxt = "Tokens Transfer"
                                    v.sum = this.$g.decimals(vv.value, parseInt(vv.decimals))
                                    v.sum = Math.floor(v.sum * 10000) / 10000
                                    v.sum = v.sum.toLocaleString() + " " + vv.symbol
                                    v.recipientRS = vv.to
                                }
                            })

                        }

                        if (v.ethereumSpecific && v.ethereumSpecific.data) {
                            let txt = this.$g.methodId(v.ethereumSpecific.data)
                            if (txt != '') {
                                v.typetxt = txt
                            }
                        }

                        v.fee = this.$g.float(v.fees).toFixed(6);
                        v.transaction = v.txid;
                        this.pushTime(v);
                    });
                    console.log(this.list);
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
            this.load()
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
