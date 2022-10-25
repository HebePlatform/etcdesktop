<template>
    <div style="height: 100%">
        <el-container>
            <el-header>
                <div style="float: left;color: #fff;margin-left: 20px">
                    <div style="float: left;cursor: pointer"
                         v-clipboard:copy="$store.state.wallet.address"
                         v-clipboard:success="onCopy"
                         v-clipboard:error="onError">
                        {{$store.state.wallet.address}}
                    </div>
                    <el-button @click="send" style="margin-left: 14px" size="mini" type="primary" plain>Send</el-button>
                </div>

                <div @click="infoVisible=true" style="cursor: pointer;float: right;margin-right: 20px;color: #fff">
                    Core-Geth Version: 1.12.8 <i class="el-icon-info"></i>
                </div>
            </el-header>

            <el-container>
                <el-aside width="200px">
                    <div style="overflow: hidden;margin:14px 0px">
                        <div v-if="$store.state.hens.name!=''" style="float: left;overflow: hidden;position: relative;cursor: pointer;width: 76px;height: 76px;
                                border: 4px solid #52c234;border-radius: 50%;left:50%;margin-left: -38px;">
                            <img @error="imgError" style="position: absolute;top: -39px;width: 154px;left: -39px;"
                                 :src="$store.state.hens.img"/>
                        </div>
                        <div v-if="$store.state.hens.name==''" style="float: left;overflow: hidden;position: relative;cursor: pointer;width: 76px;height: 76px;
                                border: 4px solid #52c234;border-radius: 50%;left:50%;margin-left: -38px;">
                            <img style="width: 76px;position: absolute;" :src="etclogo"/>
                        </div>
                    </div>
                    <div style="text-align: center;    line-height: 0px;margin-bottom: 18px">
                        <el-button size="small" @click="switchFn" round>Switch Wallet</el-button>
                    </div>
                    <el-menu @select="handleSelect"
                             default-active=""
                             class="el-menu-vertical-demo">
                        <el-menu-item index="">
                            <span slot="title">Dashboard</span>
                        </el-menu-item>
                        <el-menu-item index="token">
                            <span slot="title">Tokens</span>
                        </el-menu-item>
                        <el-menu-item index="nft">
                            <span slot="title">Nfts</span>
                        </el-menu-item>
                        <el-menu-item index="swap">
                            <span slot="title">Swap</span>
                        </el-menu-item>

                      <el-menu-item v-if="platform == 'win32'" index="mining">
                            <span slot="title">Mining</span>
                        </el-menu-item>
                        <el-menu-item index="setting">
                            <span slot="title">Setting</span>
                        </el-menu-item>
                    </el-menu>
                </el-aside>
                <el-container>
                    <el-main>
                        <router-view/>
                    </el-main>
                    <!--                    <el-footer>Footer</el-footer>-->
                </el-container>
            </el-container>
        </el-container>
        <div v-if="$store.state.syncing"
             style="position: fixed;bottom: 10px;right: 10px;color: white;background: black;padding: 10px 15px 10px 15px;border-radius: 3px;">
            <div v-if="$store.state.network==''" style="font-size: 14px">
                Downloading Blockchain
                <i class="el-icon-loading"></i>
            </div>
            <div v-if="$store.state.network!=''">
                Sync block: {{$store.state.network.currentBlock}} / {{$store.state.network.highestBlock}}
            </div>
        </div>
        <el-dialog
                title="My Accounts"
                :visible.sync="dialogVisible"
                width="500px">
            <div style="max-height: 320px;overflow-y: scroll;margin-top: 10px;margin-bottom: 10px">
                <div v-for="item in walletList.wallet" style="position: relative;overflow: hidden">
                    <el-card shadow="hover" style="position: relative;cursor: pointer;margin-bottom: 10px"
                             @click.native="switchAddress(item)">
                        <div style="color: #000;margin-bottom: 6px">{{item.name}}</div>
                        <div style="color: #67748e;">{{item.address}}</div>
                        <div v-if="item.address==walletList.address"
                             style="position: absolute; top: 0px; left: 0px; background-color: rgb(60, 123, 255); width: 26px; height: 20px; border-top-left-radius: 6px; border-bottom-right-radius: 20px;">
                            <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAADZElEQVR4Xu2azatNURjGf2/IR/JRSiiiy0CKgckVbiIi5c5kIImZ/8NcGRmIgQwYUCIinzFgQEIMiCJE5CMhPXprnTrd7t577XP3Pnufc/YantZurd/zPu/a73r3MQZ82IDz0wjQOGDAFWhSYMAN0ByCTQo0KTDgCjQpMOAG6L+3gKRFwD4zOxwT3L5KAUkLgbvAEuC4mR3IEqFvBJC0GLgV4FvcZ4A9ZvYvSYi+ECDAe+Td/mPHJWDUzP6MJ0LPCyBpCLiRAN9i3mhmt/tOAElLgXvA/ASL/w3Rv9h3KSBpRcj5JPjfwE4zu5p2EPZkCkhaCdwE5iXAOfw2M/M5qaPnBAjwd4C5CWS/gO0x8P58TwkgaTVwPQN+s5n5uRA1ekaAAO/v+VkJZD+ArXnge8YBktYC1zLgN5nZg6iwt02qvQMCvNt+ZgLcN8Btnxu+9g6QNAxcyYD3IudR3si35tfWAQHebT89Ae4L4LbvGL62DpA0AngNnwa/3syedhr52jogwF8GpibAfQJGioCPdoCkOeH9e8TMTkxU9aTnJW0BLqTAfwA8518UtYfMM6ANfk1YdH8ZIkjaAZwDpiTAOfywmb0qCj7TAePAt9YuVIQAfx6YnAD3FthQNHyqACnwhYogaRTwzk0a/Doze1Nk5DMPQUlueW80zE5ZeEJOCPBngUkJa7wOOV8KfEwKlCaCpN3AqQx4j/y7MiKf6YDWhDKcEOBPp9xGX4acLxU+0wFliCBpL3AyA95P+49lRj7aAUWKEAH/POR8V+CjHVCECJIOAsdSIv8kVHifuxH53A6YiAiSDgFHU8Ac3mv7r92Ez+2ATkSIgH8YbnVdh+9YAH8w8u3g1d2ulKg6vNf237sd+Y5ToH2jQQS/HHmzMu+4Hzo5lcFPyAFt6eA3Ra8Y84jg8N7M+JlXtaLnZ94GYxYM94ZYEfwjpndvK4cvxAFjnOAdmgUponlNv7Iu8IUKEA7GVYB3Z8fr5njffrmZvY9xVbfmFJICYw5G/1z9GJjW9rsfdEPdKm/ziFe4AMEJ/m+NZ8AMwOGXmZn38mo3ShEgiOD/1vDv8t7ArKTIiVG7NAFiFq/DnEaAOkShyj00DqhS/Tqs3TigDlGocg+NA6pUvw5rNw6oQxSq3EPjgCrVr8Pa/wHgrhxQfYMO8wAAAABJRU5ErkJggg=="
                                 style="width: 20px; height: 20px; margin-left: 2px;">
                        </div>
                    </el-card>
                    <div style="position: absolute; top: 20px; right: 40px;  width: 26px; height: 20px; border-top-left-radius: 6px; border-bottom-right-radius: 20px;">
                        <el-dropdown @command="updateWallet" trigger="click">
                              <span class="el-dropdown-link">
                                  <el-button @click.native="updateFn(item)" icon="el-icon-edit" circle></el-button>
                              </span>
                            <el-dropdown-menu slot="dropdown">
                                <el-dropdown-item command="name" icon="el-icon-edit">Name</el-dropdown-item>
                                <el-dropdown-item command="password" icon="el-icon-edit">PassWord</el-dropdown-item>
                                <el-dropdown-item command="showprv" icon="el-icon-view">Show Private Key
                                </el-dropdown-item>
                                <el-dropdown-item command="delete" icon="el-icon-delete">Delete Wallet
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </el-dropdown>
                    </div>

                </div>

            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="importFn">Import</el-button>
                <el-button type="primary" @click="createFn">Create</el-button>
            </span>
        </el-dialog>
        <el-dialog
                :title="passtxt"
                :visible.sync="passwordIs"
                width="30%">
            <div>
                <el-form :label-position="'top'" label-width="80px">
                    <el-form-item label="Old Password">
                        <el-input v-model="pass.old" show-password></el-input>
                    </el-form-item>
                    <el-form-item label="New Password">
                        <el-input v-model="pass.new" show-password></el-input>
                    </el-form-item>
                    <el-form-item label="Two New Password">
                        <el-input v-model="pass.twonew" show-password></el-input>
                    </el-form-item>
                </el-form>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="passwordIs = false">Cancel</el-button>
                <el-button type="primary" @click="updatePass">Update</el-button>
            </span>
        </el-dialog>
        <el-dialog
                :visible.sync="infoVisible"
                width="40%">
            <div>
                <el-descriptions title="Info" column="1">
                    <el-descriptions-item label="Website">
                        <el-button style="padding: 0 !important;margin-top: 2px"
                                   @click="$g.open('https://etcdesktop.com')" type="text">https://etcdesktop.com
                        </el-button>
                    </el-descriptions-item>
                    <el-descriptions-item label="Core-Geth">
                        <el-button style="padding: 0 !important;margin-top: 2px"
                                   @click="$g.open('https://etclabscore.github.io/core-geth')" type="text">
                            https://etclabscore.github.io/core-geth
                        </el-button>
                    </el-descriptions-item>
                    <el-descriptions-item label="HebeSwap">
                        <el-button style="padding: 0 !important;margin-top: 2px"
                                   @click="$g.open('https://hebeswap.com')" type="text">https://hebeswap.com
                        </el-button>
                    </el-descriptions-item>
                    <el-descriptions-item label="HebeBlock">
                        <el-button style="padding: 0 !important;margin-top: 2px"
                                   @click="$g.open('https://hebeblock.com')" type="text">https://hebeblock.com
                        </el-button>
                    </el-descriptions-item>
                    <el-descriptions-item label="Hens">
                        <el-button style="padding: 0 !important;margin-top: 2px"
                                   @click="$g.open('https://app.hens.domains')" type="text">https://app.hens.domains
                        </el-button>
                    </el-descriptions-item>
                    <el-descriptions-item label="Github">
                        <el-button style="padding: 0 !important;margin-top: 2px"
                                   @click="$g.open('https://github.com/HebePlatform/etcdesktop')" type="text">
                            https://github.com/HebePlatform/etcdesktop
                        </el-button>
                    </el-descriptions-item>
                </el-descriptions>
            </div>
            <span slot="footer" class="dialog-footer">
             <el-button type="primary" @click="infoVisible = false">OK</el-button>
            </span>
        </el-dialog>
        <el-dialog
                :title="this.wallet.name + ' Wallet PrivateKey'"
                :visible.sync="showPrvVisible"
                width="30%"
                :before-close="showPrvVisibleClose">
            <div style="cursor: pointer;color:#409EFF " v-clipboard:copy="prv"
                 v-clipboard:success="onCopy"
                 v-clipboard:error="onError">
                {{prv}}
            </div>
            <span slot="footer" class="dialog-footer">
            <el-button type="primary" @click="showPrvVisible = false">Ok</el-button>
          </span>
        </el-dialog>
    </div>
</template>
<script>
    const cmd = require('node-cmd')
    // const sudo = require('sudo-prompt');
    let etclogo = require("./../assets/etc-logo.png")
    const os = require('os');
    import eruda from 'eruda'

    const {exec, execSync} = require('child_process');

    export default {
        data() {
            return {
                platform: 'win32',
                showPrvVisible: false,
                infoVisible: false,
                passwordIs: false,
                dialogVisible: false,
                etclogo: etclogo,
                collapsed: false,
                syncing: true,
                walletList: {},
                wallet: {},
                pass: {
                    old: '',
                    new: '',
                    twonew: ''
                },
                passtxt: '',
                prv: '',

            }
        },
        methods: {
            showPrvVisibleClose() {
                this.prv = ''
                this.infoVisible = false;
            },
            onCopy() {
                this.$message({
                    showClose: true,
                    message: 'Copy Success',
                    type: 'success',
                });
            },
            onError() {
                this.$message({
                    showClose: true,
                    message: 'Copy Error',
                    type: 'error',
                });
            },
            switchAddress(item) {
                this.walletList.address = item.address
                this.$g.stores.set('wallet', this.walletList);
                this.$store.commit('setWallet', {
                    address: item.address,
                    prv: item.prv,
                });
                this.$notify({
                    title: 'Success',
                    message: 'Switch Wallet Success',
                    type: 'success'
                });
                this.dialogVisible = false
            },
            importFn() {
                this.$prompt('Please enter PrivateKey', '', {
                    inputType: 'textarea',
                    confirmButtonText: 'Ok',
                    cancelButtonText: 'Cancel',
                }).then(({value}) => {
                    if (value != null && value.trim() != '') {
                        let prv = value.trim()
                        let addr = this.$g.address(prv)
                        if (addr == '') {
                            this.$alert('Wrong PrivateKey', '', {
                                confirmButtonText: 'Ok',
                            });
                            return;
                        }
                        this.$prompt('Please enter password', '', {
                            inputType: 'password',
                            confirmButtonText: 'Ok',
                            cancelButtonText: 'Cancel',
                        }).then(({value}) => {
                            let model = this.$g.decrypt(this.$store.state.wallet.prv, value)
                            if (model.plaintext != "") {
                                let encrypt = this.$g.encrypt(prv, value)
                                this.walletList.wallet.push({
                                    address: addr,
                                    name: "wallet" + (this.walletList.wallet.length + 1),
                                    prv: encrypt
                                })
                                this.$g.stores.set('wallet', this.walletList);
                                this.$notify({
                                    title: 'Success',
                                    message: 'Import Wallet Success',
                                    type: 'success'
                                });
                            }
                        })
                    } else {
                        this.$alert('Wrong PrivateKey', '', {
                            confirmButtonText: 'Ok',
                        });
                    }
                })
            },
            createFn() {
                this.$prompt('Please enter password', '', {
                    inputType: 'password',
                    confirmButtonText: 'Ok',
                    cancelButtonText: 'Cancel',
                }).then(({value}) => {
                    let model = this.$g.decrypt(this.$store.state.wallet.prv, value)
                    if (model.plaintext != "") {
                        let prv = this.$g.create().privateKey
                        let addr = this.$g.address(prv)
                        let encrypt = this.$g.encrypt(prv, value)
                        this.walletList.wallet.push({
                            address: addr,
                            name: "wallet" + (this.walletList.wallet.length + 1),
                            prv: encrypt
                        })
                        this.$g.stores.set('wallet', this.walletList);
                        this.$notify({
                            title: 'Success',
                            message: 'Create Wallet Success',
                            type: 'success'
                        });
                    } else {
                        this.$alert('Wrong wallet password', '', {
                            confirmButtonText: 'Ok',
                        });
                    }
                }).catch(() => {
                    this.$alert('Wrong wallet password', '', {
                        confirmButtonText: 'Ok',
                    });
                });
            },
            updatePass() {
                if (this.pass.old == '' || this.pass.new == '' || this.pass.twonew == '') {
                    this.$message.error('Password cannot be empty');
                    return;
                }
                if (this.pass.new != this.pass.twonew) {
                    this.$message.error('Different passwords twice');
                    return;
                }

                let prv = this.$g.decrypt(this.wallet.prv, this.pass.old)
                if (prv.plaintext == '') {
                    this.$message.error('Wrong old password');
                    return;
                }
                let encrypt = this.$g.encrypt(prv.plaintext, this.pass.new)
                this.wallet.prv = encrypt
                this.$g.stores.set('wallet', this.walletList);
                this.$notify({
                    title: 'Success',
                    message: 'Update Wallet Password Success',
                    type: 'success'
                });
                this.passwordIs = false;
            },
            updateFn(item) {
                this.wallet = item;
            },
            switchFn() {
                let wallet = this.$g.stores.get('wallet')
                this.walletList = wallet;
                this.dialogVisible = true
            },
            updateWallet(key) {
                if (key == "name") {
                    this.$prompt('Please enter a new wallet name', 'Update Wallet Name', {
                        confirmButtonText: 'Update',
                        cancelButtonText: 'Cancel',
                    }).then(({value}) => {
                        if (value != '') {
                            this.wallet.name = value
                            this.$g.stores.set('wallet', this.walletList);
                            this.$notify({
                                title: 'Success',
                                message: 'Update Wallet Name Success',
                                type: 'success'
                            });
                        }
                    }).catch(() => {
                    });
                }
                if (key == "password") {
                    this.pass = {
                        old: '',
                        new: '',
                        twonew: ''
                    }
                    this.passtxt = "Update " + this.wallet.name + " Wallet PassWord"
                    this.passwordIs = true;

                }
                if (key == "showprv") {
                    this.$prompt('Please enter password', '', {
                        inputType: 'password',
                        confirmButtonText: 'Ok',
                        cancelButtonText: 'Cancel',
                    }).then(({value}) => {
                        let model = this.$g.decrypt(this.wallet.prv, value)
                        if (model.plaintext != "") {
                            this.prv = model.plaintext;
                            this.showPrvVisible = true
                            // this.$alert(model.plaintext, this.wallet.name + ' Wallet PrivateKey', {
                            //     confirmButtonText: 'OK',
                            //     callback: action => {
                            //     }
                            // });
                        } else {
                            this.$alert('Wrong wallet password', '', {
                                confirmButtonText: 'Ok',
                            });
                        }
                    }).catch(() => {
                        this.$alert('Wrong wallet password', '', {
                            confirmButtonText: 'Ok',
                        });
                    });

                }
                if (key == "delete") {
                    this.$prompt('please enter the password, remember to backup the PrivateKey,', 'Delete Wallet', {
                        inputType: 'password',
                        confirmButtonText: 'Ok',
                        cancelButtonText: 'Cancel',
                    }).then(({value}) => {
                        let model = this.$g.decrypt(this.wallet.prv, value)
                        if (model.plaintext != "") {
                            let walletindex = -1;
                            this.walletList.wallet.forEach((item, index) => {
                                if (item.address == this.wallet.address) {
                                    walletindex = index
                                }
                            })
                            this.walletList.wallet.splice(walletindex, 1)
                            if (this.wallet.address == this.walletList.address) {
                                if (this.walletList.wallet[0]) {
                                    this.walletList.address = this.walletList.wallet[0].address
                                    this.$g.stores.set('wallet', this.walletList);
                                    this.$store.commit('setWallet', {
                                        address: this.walletList.wallet[0].address,
                                        prv: this.walletList.wallet[0].prv,
                                    });

                                } else {
                                    this.$g.stores.clear()
                                    this.$store.commit('setWallet', '');
                                    this.$router.push('/')
                                }
                            }
                            this.wallet = ''
                        } else {
                            this.$alert('Wrong wallet password', '', {
                                confirmButtonText: 'Ok',
                            });
                        }
                    }).catch(() => {
                        this.$alert('Wrong wallet password', '', {
                            confirmButtonText: 'Ok',
                        });
                    });

                }
            },
            imgError() {
                let img = event.srcElement;
                img.src = etclogo;
                img.onerror = null; //防止闪图
            },
            send() {
                this.$store.state.balanceValue = ''
                this.$store.state.txt = '';

                this.$store.state.dialog = {
                    to: '',
                    amount: 0,
                    gasLimit: 0,
                    gasPrice: 0,
                    data: '',
                    fee: 0,
                    nonce: 0
                }
                this.$store.state.dialogVisible = true;

            },
            handleSelect(key, keyPath) {
                if (key == '' && this.$route.path != '/index') {
                    this.$router.push('/index')
                }
                if (key == 'token' && this.$route.path != '/index/token') {
                    this.$router.push('/index/token')
                }
                if (key == 'nft' && this.$route.path != '/index/nft') {
                    this.$router.push('/index/nft')
                }
                if (key == 'swap' && this.$route.path != '/index/swap') {
                    this.$router.push('/index/swap')
                }
                if (key == 'mining' && this.$route.path != '/index/mining') {
                    this.$router.push('/index/mining')
                }
                if (key == "setting") {
                    let setting = localStorage.getItem('setting')
                    if (setting != null) {
                        setting = JSON.parse(setting)
                        this.$store.state.form = setting;
                    }
                    this.$store.state.settingVisible = true;
                }
            },
            async eth_syncing() {
                this.$axios.post(this.$g.rpc, {
                    "jsonrpc": "2.0",
                    "id": 42,
                    "method": "eth_syncing",
                    "params": []
                }).then(async res => {
                    if (res.data.result == false) {
                        let eth_blockNumber = await this.eth_blockNumber()
                        if (eth_blockNumber != false) {
                            let network = {
                                currentBlock: this.$store.state.network.currentBlock
                            }
                            network.currentBlock = this.$web3.utils.hexToNumber(eth_blockNumber).toLocaleString()
                            this.$store.commit('setNetwork', network);
                            this.$store.state.syncing = false;
                        } else {
                            this.$store.state.syncing = true
                        }
                    } else {
                        if (res.data.result.currentBlock) {
                            let network = {
                                currentBlock: this.$web3.utils.hexToNumber(res.data.result.currentBlock).toLocaleString(),
                                highestBlock: this.$web3.utils.hexToNumber(res.data.result.highestBlock).toLocaleString(),

                            }
                            this.$store.commit('setNetwork', network);
                            this.$store.state.syncing = true
                        }
                    }
                }).catch(err => {
                    // if (this.$store.state.network != '') {
                    //     this.peerrun()
                    // }
                })
            },
            eth_blockNumber() {
                return new Promise(async (resolve, reject) => {
                    this.$axios.post(this.$g.rpc, {
                        "jsonrpc": "2.0",
                        "id": 42,
                        "method": "eth_blockNumber",
                        "params": []
                    }).then(res => {
                        resolve(res.data.result);
                    })
                })
            },
            peerrun() {
                let setting = localStorage.getItem('setting')
                if (setting == null) {
                    this.$store.state.settingVisible = true;
                    return;
                }
                setting = JSON.parse(setting)
                if (setting.eruda) {
                    eruda.init();
                }
                let txt = '';
                if (setting.syncmode == 'fast') {
                    txt = 'snap'
                }
                if (setting.syncmode == 'full') {
                    txt = 'full'
                }
                if (setting.syncmode == 'light') {
                    txt = 'light'
                }
                if (setting.syncmode == 'rpc') {
                    this.$g.rpc = setting.rpc
                    return;
                }
                if (setting.http) {
                    txt = txt + ' --http'
                    if (setting.cros) {
                        txt = txt + ' --http.corsdomain "*"'
                    }
                }
                if (setting.ws) {
                    txt = txt + ' --ws  --ws.api debug,eth,ethash,trace,txpool,net,web3'
                    if (setting.cros) {
                        txt = txt + ' --ws.origins "*"'
                    }
                }
                let _this = this;
                if (os.platform() == "win32") {
                    cmd.run(`resources\\app\\win\\geth --classic --syncmode ` + txt + ` --datadir "../../etc/etcdata"`,
                        function (err, data, stderr) {
                            console.log(err, "syncmode +x err");
                            console.log(data, "syncmode +x data");
                            console.log(stderr, "syncmode +x stderr");
                            if (err) {
                                // _this.peerrun()
                                _this.$message.error('Failed to start core-geth');
                                console.log(err, 'err');
                            }
                            console.log(data, "data");
                            console.log(stderr, 'stderr');
                        }
                    );
                    window.addEventListener('beforeunload', () => {
                        cmd.runSync(`taskkill /f /im geth.exe`,
                            function (err, data, stderr) {
                            }
                        );
                        cmd.runSync(`taskkill /f /im Etc-Desktop.exe`,
                            function (err, data, stderr) {
                            }
                        );
                      cmd.runSync(`taskkill /f /im miner.exe`,
                          function (err, data, stderr) {
                          }
                      );

                    })
                }
                if (os.platform() == "darwin") {
                    cmd.run(
                        `chmod +x /Applications/Etc-Desktop.app/Contents/Resources/app/macos/geth`,
                        function (err, data, stderr) {
                            console.log(err, "chmod +x err");
                            console.log(data, "chmod +x data");
                            console.log(stderr, "chmod +x stderr");
                            console.log('run geth');

                            cmd.run(
                                `/Applications/Etc-Desktop.app/Contents/Resources/app/macos/geth --classic --syncmode ` + txt + ` --datadir "~/Library/Application Support/Etc-Desktop/etc"`,
                                function (err, data, stderr) {
                                    console.log(err, "syncmode +x err");
                                    console.log(data, "syncmode +x data");
                                    console.log(stderr, "syncmode +x stderr");
                                    if (err) {
                                        _this.$message.error('Failed to start core-geth');
                                        // _this.peerrun()
                                        console.log(err, 'err');
                                    }
                                    console.log(data, "data");
                                    console.log(stderr, 'stderr');
                                })
                        }
                    );
                }
                // var options = {
                //     name: 'EtcCore',
                //     icns: '/Applications/Etc-Desktop.app/Contents/Resources/app/icons/icon.icns', // (optional)
                // };
                // sudo.exec('/Applications/Etc-Core.app/Contents/Resources/app/dist/electron/static/macos/geth --classic --syncmode snap --http --http.corsdomain "*" --datadir "/Applications/Etc-Core.app/etc"', options,
                //     function (error, stdout, stderr) {
                //         if (error) {
                //             _this.peerrun()
                //             console.log('错误重新启动');
                //             console.log(error, 'error');
                //         }
                //         console.log(stdout, 'stdout');
                //         console.log(stderr, 'stderr');
                //     }
                // );
            }
        },
        mounted() {
            this.peerrun()
            console.log('触发，eth_syncingeth_syncingeth_syncingeth_syncing');
            setInterval(() => {
                this.eth_syncing()
            }, 6000)
            this.platform = os.platform()
        }

    }
</script>
<style>
    .el-menu {
        border: 0 !important;
    }

    .el-menu-vertical-demo .is-active {
        background-color: #e6f7ff !important;
    }

    .el-menu-vertical-demo .is-active:after {
        transform: scaleY(1);
        opacity: 1;
        transition: transform .15s cubic-bezier(.645, .045, .355, 1), opacity .15s cubic-bezier(.645, .045, .355, 1);
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        border-right: 3px solid #1890ff;
        content: "";
    }

    .el-header {
        font-size: 14px;
        padding: 0 !important;
        background: linear-gradient(to right, #00c6ff, #0072ff);
        line-height: 60px;
    }

    .el-footer {
        line-height: 60px;

    }

    .el-aside {
        background-color: #fff;
        color: #333;
        line-height: 200px;
    }

    .el-main {
        background-color: #f0f2f5;
        color: #333;
        padding: 0 !important;
    }

    body > .el-container {
        margin-bottom: 40px;
        height: 100%;
    }

    .el-container {
        height: 100%;
    }

    .el-container:nth-child(5) .el-aside,
    .el-container:nth-child(6) .el-aside {
        line-height: 260px;
    }

    .el-container:nth-child(7) .el-aside {
        line-height: 320px;
    }

    #components-layout-demo-custom-trigger .trigger {
        font-size: 18px;
        line-height: 64px;
        padding: 0 24px;
        cursor: pointer;
        transition: color .3s;
    }

    #components-layout-demo-custom-trigger .trigger:hover {
        color: #1890ff;
    }

    #components-layout-demo-custom-trigger .logo {
        height: 32px;
        margin: 16px;
    }
</style>
