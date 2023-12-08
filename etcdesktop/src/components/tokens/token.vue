<template>
    <div class="token" style="margin:0px 16px;font-size: 14px">
        <div v-loading="loading"
             class="table_list" style="border-radius: 8px;background: #fff;padding: 10px;margin-top: 12px">
            <el-row :gutter="20"
                    style="margin-top: 6px;font-size: 14px;font-weight: bold;margin-bottom: 16px;text-align: center">
                <el-col :span="5">Name</el-col>
                <el-col :span="4">Amount</el-col>
                <el-col :span="3">Symbol</el-col>
                <el-col :span="3">Transfers</el-col>
                <el-col :span="8">Contract</el-col>
            </el-row>
            <el-empty v-if="$store.state.tokens.length==0" description="No Date"></el-empty>

            <div v-for="item in $store.state.tokens" v-if="item.balance!=0"  style="border-bottom: 1px solid #f0f0f0;">
                <el-row  style="margin:10px 0;text-align: center">
                    <el-col :span="5">{{item.name}}</el-col>
                    <el-col :span="4" style="color: green;">
                        <span v-if="item.balance!=0">
                             {{$g.numberx($g.decimals(item.balance, item.decimals))}}
                        </span>
                    </el-col>
                    <el-col :span="3">{{item.symbol}}</el-col>
                    <el-col :span="3" style="color: #1890ff;cursor: pointer">
                        <span @click="gotransfers(item)">
                            {{item.transfers}}
                        </span>
                    </el-col>
                    <el-col :span="8" style="color: #1890ff;cursor: pointer">
                        <span @click="$g.open('https://blockscout.com/etc/mainnet/address/'+item.contract)">
                            {{item.contract}}
                        </span>
                    </el-col>
                </el-row>
            </div>
            <div style="height: 20px">
            </div>
        </div>
        <div style="height: 20px">
        </div>
    </div>
</template>

<script>
    export default {
        name: "token",
        data() {
            return {
                current: 1,
                pagesize: 10,
                total: 0,
                list: [],
                loading: false,
                loadtimer:null

            }
        },
        methods: {
            gotransfers(item) {
                this.$g.item = item;
                this.$router.push('/index/tokentransfers')
            },
            changge(val) {
                this.current = val;
                this.load()
            },
            load() {
                let address = this.$store.state.wallet.address;
                let api = 'https://hebe.etcdesktop.com/etcblockexplorer/api/v2/address/' + address + '?page=' + this.current + '&pageSize=1&details=txs';
                this.$axios({
                    method: 'get',
                    url: api,
                    timeout: 15000
                }).then(res => {
                    this.loading = false
                    if( res.data.tokens){
                    let tokens = res.data.tokens.sort(this.$g.compare("transfers"));
                        this.$store.commit('setTokens', tokens);

                    }else{
                        this.$store.commit('setTokens', []);

                    }

                })
            },
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
    .token {
        .el-col {
            padding: 2px 0px !important;
            font-size: 14px;
        }
    }
</style>
