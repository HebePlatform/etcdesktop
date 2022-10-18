<template>

    <div class="swap">
        <div style="position: absolute;top:70px;right: 20px">
            <el-popover
                    style="margin-left: 10px"
                    placement="bottom-start"
                    width="240"
                    trigger="hover">
                <div>
                    <div style="font-weight: bold;color: #000">
                        Transaction Settings
                    </div>
                    <div style="margin-top: 10px">
                        Slippage tolerance
                    </div>
                    <div style="overflow: hidden;margin-top: 10px;font-size: 12px">
                        <div class="swaplll" @click="slippagesfn(0.001)">
                            0.1%
                        </div>
                        <div class="swaplll" @click="slippagesfn(0.005)">
                            0.5%
                        </div>
                        <div class="swaplll" @click="slippagesfn(0.01)">
                            1%
                        </div>
                        <div style="float: left;width: 70px;height: 32px;border-radius: 36px;;border: 1px solid rgb(237, 238, 242)">
                            <input v-model="slippagemodel" @input="slippagefn"
                                   style="float: left;width: 40px;margin-left: 10px; text-align: right;text-indent: -10px;height: 30px"
                                   type="text"/>
                            <div style="margin-left: 4px;float: left;line-height: 32px">%</div>
                        </div>
                    </div>
                    <div style="margin-top: 10px">
                        Transaction deadline
                    </div>
                    <div style="overflow: hidden;margin-top: 10px;font-size: 12px">
                        <div style="float: left;width: 84px;height: 32px;border-radius: 36px;;border: 1px solid rgb(237, 238, 242)">
                            <input v-model="deadline"
                                   style="float: left;width: 64px;margin-left: 10px; text-align: right;text-indent: -10px;height: 30px"
                                   type="text"/>
                        </div>
                        <div style="margin-left: 8px;color: #000;float: left;line-height: 32px">minutes</div>

                    </div>
                </div>

                <el-button slot="reference" size="mini" type="primary" plain icon="el-icon-s-tools" circle></el-button>
            </el-popover>
        </div>
        <el-card class="swapui" v-if="type=='swap'||type=='pool'">
            <el-row style="margin: 6px 0px 20px 0px;text-align: center;font-size: 20px;color: rgb(136, 141, 155);">
                <el-col :class="{swapselect:type=='swap'}" :span="12">
                    <span @click="type='swap'" style="cursor: pointer;">
                        Swap
                    </span>
                </el-col>
                <el-col :class="{swapselect:type=='pool'}" :span="12">
                   <span style="cursor: pointer;" @click="poolfn">
                       Pool
                   </span>
                </el-col>
            </el-row>
            <div v-if="type=='swap'">
                <div style="border-radius: 20px;border: 1px solid #ebebeb;    color: rgb(86, 90, 105);">
                    <div style="margin: 10px 0px 10px 16px">
                        <el-row>
                            <el-col :span="6">From</el-col>
                            <el-col :span="18" style="text-align: right;">
                                <div style="margin-right: 16px">
                                    Balance: {{from.sum}}
                                </div>
                            </el-col>
                        </el-row>
                    </div>
                    <div style="height: 40px;margin-left: 14px;padding-top: 6px;margin-bottom: 6px;">
                        <el-row>
                            <el-col :span="15">
                                <div style="position: relative">
                                    <input @input="swapinput('from')" v-model="from.amount" type="text"
                                           style="cursor: pointer" placeholder="0.0"
                                           class="inputswap"/>
                                    <el-tag @click="maxfn"
                                            style="position: absolute;top: 0; right: 0;cursor: pointer">MAX
                                    </el-tag>
                                </div>
                            </el-col>
                            <el-col :span="9" style="text-align: right;">
                                <div style="margin-right: 14px">
                                    <el-button
                                            v-if="from.symbol==''"
                                            @click="dialog('from')"
                                            style="border-radius: 8px;height: 36px;width: 100px;padding: 0;margin-top: -2px"
                                            type="primary" size="small">Select token<i
                                            class="el-icon-arrow-down el-icon--right"></i></el-button>
                                    <el-button
                                            v-if="from.symbol!=''"
                                            @click="dialog('from')"
                                            style="border-radius: 8px;height: 36px;width: 100px;padding: 0;margin-top: -2px"
                                            size="small">
                                        <img :src="from.logoURI"
                                             @error="imgError"
                                             style="margin-left: 6px;;float: left;width: 24px;height: 24px">
                                        <div style="width: 60px;overflow: hidden;float: left;margin-top: 6px;font-size: 14px;margin-left: 4px">
                                            {{from.symbol}}
                                            <i class="el-icon-arrow-down el-icon--right"></i>
                                        </div>
                                    </el-button>

                                </div>
                            </el-col>
                        </el-row>
                    </div>
                </div>
                <div style="text-align: center;padding: 14px 0px;font-size: 20px;">
                    <i @click="toggle" class="el-icon-bottom" style="cursor: pointer"></i>
                </div>
                <div style="border-radius: 20px;border: 1px solid #ebebeb;    color: rgb(86, 90, 105);">
                    <div style="margin: 10px 0px 10px 16px">
                        <el-row>
                            <el-col :span="6">To</el-col>
                            <el-col :span="18" style="text-align: right;">
                                <div style="margin-right: 16px">
                                    Balance: {{to.sum}}
                                </div>
                            </el-col>
                        </el-row>
                    </div>
                    <div style="height: 40px;margin-left: 14px;    padding-top: 6px;margin-bottom: 6px;">
                        <el-row>
                            <el-col :span="15">
                                <div style="position: relative">
                                    <input @input="swapinput('to')" v-model="to.amount" type="text"
                                           style="cursor: pointer"
                                           placeholder="0.0"
                                           class="inputswap"/>
                                </div>
                            </el-col>
                            <el-col :span="9" style="text-align: right;">
                                <div style="margin-right: 14px">
                                    <el-button
                                            v-if="to.symbol==''"
                                            @click="dialog('to')"
                                            style="border-radius: 8px;height: 36px;width: 100px;padding: 0;margin-top: -2px"
                                            type="primary" size="small">Select token<i
                                            class="el-icon-arrow-down el-icon--right"></i></el-button>
                                    <el-button
                                            v-if="to.symbol!=''"
                                            @click="dialog('to')"
                                            style="border-radius: 8px;height: 36px;width: 100px;padding: 0;margin-top: -2px"
                                            size="small">
                                        <img :src="to.logoURI"
                                             @error="imgError"
                                             style="margin-left: 6px;;float: left;width: 24px;height: 24px">
                                        <div style="width: 60px;overflow: hidden;float: left;margin-top: 6px;font-size: 14px;margin-left: 4px">
                                            {{to.symbol}}
                                            <i class="el-icon-arrow-down el-icon--right"></i>
                                        </div>
                                    </el-button>
                                </div>
                            </el-col>
                        </el-row>
                    </div>
                </div>
                <el-row style="margin-top: 6px;padding: 0 10px" v-if="from.symbol!=''&&to.symbol!=''">
                    <el-col :span="12">Price</el-col>
                    <el-col :span="12" style="text-align: right">{{price}} {{from.symbol}} per {{to.symbol}}</el-col>
                </el-row>
                <el-row style="margin-top: 6px;padding: 0 10px">
                    <el-col :span="12">Slippage Tolerance</el-col>
                    <el-col :span="12" style="text-align: right">{{(slippage*100).toFixed(2)}} %</el-col>
                </el-row>
                <div style="margin: 16px 0px 16px 0">
                    <el-button v-if="!fromApprove&&!toApprove" :disabled="disabledswap"
                               @click="hebeswap"
                               type="primary" style="height: 46px;font-size: 18px;width: 100%;border-radius: 8px">
                        Swap
                    </el-button>
                    <el-row style="margin-top: 10px">
                        <el-col v-if="fromApprove&&from.symbol!=''" :span="12" style="text-align: center">
                            <el-button @click="approve('from')" style="width: 100%" type="primary">
                                Approve {{from.symbol}}
                            </el-button>
                        </el-col>
                        <el-col v-if="toApprove&&to.symbol!=''" :span="12" style="text-align: center">
                            <el-button @click="approve('to')" type="primary">Approve {{to.symbol}}</el-button>
                        </el-col>
                    </el-row>
                </div>
                <div>
                    <el-row style="margin-top: 6px;padding: 0 10px">
                        <el-col :span="12">Minimum received
                        </el-col>
                        <el-col :span="12" style="text-align: right">
                            {{Math.floor(to.amount*(1-slippage) * 10000) / 10000}}
                            {{to.symbol}}
                        </el-col>
                    </el-row>
                    <el-row style="margin-top: 6px;padding: 0 10px">
                        <el-col :span="12">Price Impact</el-col>
                        <el-col :span="12" style="color: rgb(255, 104, 113);text-align: right">{{ratemodel}}%</el-col>
                    </el-row>
                    <el-row style="margin-top: 6px;padding: 0 10px">
                        <el-col :span="12">Liquidity Provider Fee</el-col>
                        <el-col :span="12" style="text-align: right">{{Math.floor(from.amount*0.003 * 10000) / 10000}}
                            {{from.symbol}}
                        </el-col>
                    </el-row>
                </div>
            </div>
            <div v-if="type=='pool'">
                <div style="width: 100%;margin: 24px 0;">
                    <el-button @click="addliquidity" style="width: 100%;padding: 16px 20px;font-size: 16px"
                               type="primary">Add Liquidity
                    </el-button>
                </div>
                <div v-loading="poolis" style="height: 360px;overflow: scroll;margin-top: 10px">
                    <el-collapse v-model="activeNames">
                        <el-collapse-item v-for="item in pool" :name="item.contract">
                            <template slot="title">
                                <div>
                                    <div style="float: left;margin-top: 12px;margin-right: 10px">
                                        <el-image
                                                style="width: 20px;height: 20px"
                                                :src="'https://hebeswap.com/assets/'+item.tokenA.contract.toLocaleLowerCase()+'/logo.png'">
                                            <div slot="error" style="line-height: 22px !important;">
                                                <img :src="logoerr" style="width: 20px;height: 20px"/>
                                            </div>
                                        </el-image>
                                        <el-image
                                                style="width: 20px;height: 20px;"
                                                :src="'https://hebeswap.com/assets/'+item.tokenB.contract.toLocaleLowerCase()+'/logo.png'">
                                            <div slot="error" style="line-height: 22px !important;">
                                                <img :src="logoerr" style="width: 20px;height: 20px"/>
                                            </div>
                                        </el-image>
                                    </div>
                                    <div style="float: left;font-size: 20px;color: rgb(0, 0, 0);margin-top: 6px">
                                        {{item.tokenA.symbol}}/{{item.tokenB.symbol}}
                                    </div>
                                </div>
                            </template>
                            <div>
                                <el-row style="font-size: 16px;color: #000000">
                                    <el-col :span="12">
                                        <div>
                                            Pooled {{item.tokenA.symbol}}:
                                        </div>
                                    </el-col>
                                    <el-col :span="12">
                                        <div style="text-align: right;margin-right: 10px">
                                            <el-image
                                                    style="margin-left: 6px;float: right;width: 16px;height: 16px;margin-top: 5px"
                                                    :src="'https://hebeswap.com/assets/'+item.tokenA.contract.toLocaleLowerCase()+'/logo.png'">
                                                <div slot="error" style="line-height: 18px !important;">
                                                    <img :src="logoerr" style="width: 16px;height: 16px"/>
                                                </div>
                                            </el-image>

                                            <div style="float: right">
                                                {{Math.floor((item.sum/item.alllp*item.tokenA.sum) * 10000) / 10000}}
                                            </div>
                                        </div>
                                    </el-col>
                                </el-row>
                                <el-row style="font-size: 16px;color: #000000">
                                    <el-col :span="12">
                                        <div>
                                            Pooled {{item.tokenB.symbol}}:
                                        </div>
                                    </el-col>
                                    <el-col :span="12">
                                        <div style="text-align: right;margin-right: 10px">
                                            <el-image
                                                    style="margin-left: 6px;float: right;width: 16px;height: 16px;margin-top: 5px"
                                                    :src="'https://hebeswap.com/assets/'+item.tokenB.contract.toLocaleLowerCase()+'/logo.png'">
                                                <div slot="error" style="line-height: 18px !important;">
                                                    <img :src="logoerr" style="width: 16px;height: 16px"/>
                                                </div>
                                            </el-image>

                                            <div style="float: right">
                                                {{Math.floor((item.sum/item.alllp*item.tokenB.sum) * 10000) / 10000}}
                                            </div>
                                        </div>
                                    </el-col>
                                </el-row>
                                <el-row style="font-size: 16px;color: #000000">
                                    <el-col :span="12">
                                        <div>
                                            Your pool tokens:
                                        </div>
                                    </el-col>
                                    <el-col :span="12">
                                        <div style="text-align: right;margin-right: 10px">
                                            <div style="float: right">
                                                {{item.sum}}
                                            </div>
                                        </div>
                                    </el-col>
                                </el-row>
                                <el-row style="font-size: 16px;color: #000000">
                                    <el-col :span="12">
                                        <div>
                                            Your pool share:
                                        </div>
                                    </el-col>
                                    <el-col :span="12">
                                        <div style="text-align: right;margin-right: 10px">
                                            <div style="float: right">
                                                {{Math.floor((item.sum/item.alllp*100) * 10000) / 10000}}%
                                            </div>
                                        </div>
                                    </el-col>
                                </el-row>
                                <el-row style="margin-top: 10px">
                                    <el-col :span="12">
                                        <div>
                                            <el-button
                                                    @click="pooladd(item)"
                                                    style="width: 96%;border-radius: 8px;"
                                                    type="primary">
                                                Add
                                            </el-button>
                                        </div>
                                    </el-col>
                                    <el-col :span="12">
                                        <div>
                                            <el-button @click="poolrm(item)" style="width: 96%;border-radius: 8px;"
                                                       type="primary">
                                                Remove
                                            </el-button>
                                        </div>
                                    </el-col>
                                </el-row>
                            </div>
                        </el-collapse-item>
                    </el-collapse>
                </div>
            </div>
        </el-card>
        <el-card class="swapui" v-if="type=='add'">
            <el-row style="margin: 6px 0px 20px 0px;font-size: 20px;color: rgb(0, 0, 0)">
                <el-col :span="4">
                    <div style="cursor: pointer;width: 100%;height: 100%" @click="type='pool'">
                        <i class="el-icon-back"></i>
                    </div>
                </el-col>
                <el-col :span="20">
                    <span style="margin-left: 68px;">
                       Add Liquidity
                   </span>
                </el-col>
            </el-row>
            <div class="addpool">
                <div style="border-radius: 20px;border: 1px solid #ebebeb;    color: rgb(86, 90, 105);">
                    <div style="margin: 10px 0px 10px 16px">
                        <el-row>
                            <el-col :span="6">From</el-col>
                            <el-col :span="18" style="text-align: right;">
                                <div style="margin-right: 16px">
                                    Balance: {{from.sum}}
                                </div>
                            </el-col>
                        </el-row>
                    </div>
                    <div style="height: 40px;margin-left: 14px;padding-top: 6px;margin-bottom: 6px;">
                        <el-row>
                            <el-col :span="15">
                                <div style="position: relative">
                                    <input @input="swapinputadd('from')" v-model="from.amount" type="text"
                                           style="cursor: pointer" placeholder="0.0"
                                           class="inputswap"/>
                                    <el-tag @click="maxAdd('from')"
                                            style="position: absolute;top: 0; right: 0;cursor: pointer">MAX
                                    </el-tag>
                                </div>
                            </el-col>
                            <el-col :span="9" style="text-align: right;">
                                <div style="margin-right: 14px">
                                    <el-button
                                            v-if="from.symbol==''"
                                            @click="dialog('from')"
                                            style="border-radius: 8px;height: 36px;width: 100px;padding: 0;margin-top: -2px"
                                            type="primary" size="small">Select token<i
                                            class="el-icon-arrow-down el-icon--right"></i></el-button>
                                    <el-button
                                            v-if="from.symbol!=''"
                                            @click="dialog('from')"
                                            style="border-radius: 8px;height: 36px;width: 100px;padding: 0;margin-top: -2px"
                                            size="small">
                                        <img :src="from.logoURI"
                                             @error="imgError"
                                             style="margin-left: 6px;;float: left;width: 24px;height: 24px">
                                        <div style="width: 60px;overflow: hidden;float: left;margin-top: 6px;font-size: 14px;margin-left: 4px">
                                            {{from.symbol}}
                                            <i class="el-icon-arrow-down el-icon--right"></i>
                                        </div>
                                    </el-button>

                                </div>
                            </el-col>
                        </el-row>
                    </div>
                </div>
                <div style="text-align: center;padding: 14px 0px;font-size: 20px;">
                    <i class="el-icon-plus"></i>
                </div>
                <div style="border-radius: 20px;border: 1px solid #ebebeb;    color: rgb(86, 90, 105);">
                    <div style="margin: 10px 0px 10px 16px">
                        <el-row>
                            <el-col :span="6">To</el-col>
                            <el-col :span="18" style="text-align: right;">
                                <div style="margin-right: 16px">
                                    Balance: {{to.sum}}
                                </div>
                            </el-col>
                        </el-row>
                    </div>
                    <div style="height: 40px;margin-left: 14px;    padding-top: 6px;margin-bottom: 6px;">
                        <el-row>
                            <el-col :span="15">
                                <div style="position: relative">
                                    <input @input="swapinputadd('to')" v-model="to.amount" type="text"
                                           style="cursor: pointer"
                                           placeholder="0.0"
                                           class="inputswap"/>
                                    <el-tag @click="maxAdd('to')"
                                            style="position: absolute;top: 0; right: 0;cursor: pointer">MAX
                                    </el-tag>
                                </div>
                            </el-col>
                            <el-col :span="9" style="text-align: right;">
                                <div style="margin-right: 14px">
                                    <el-button
                                            v-if="to.symbol==''"
                                            @click="dialog('to')"
                                            style="border-radius: 8px;height: 36px;width: 100px;padding: 0;margin-top: -2px"
                                            type="primary" size="small">Select token<i
                                            class="el-icon-arrow-down el-icon--right"></i></el-button>
                                    <el-button
                                            v-if="to.symbol!=''"
                                            @click="dialog('to')"
                                            style="border-radius: 8px;height: 36px;width: 100px;padding: 0;margin-top: -2px"
                                            size="small">
                                        <img :src="to.logoURI"
                                             @error="imgError"
                                             style="margin-left: 6px;;float: left;width: 24px;height: 24px">
                                        <div style="width: 60px;overflow: hidden;float: left;margin-top: 6px;font-size: 14px;margin-left: 4px">
                                            {{to.symbol}}
                                            <i class="el-icon-arrow-down el-icon--right"></i>
                                        </div>
                                    </el-button>
                                </div>
                            </el-col>
                        </el-row>
                    </div>
                </div>
                <el-collapse style="margin-top: 10px" v-if="pair.is&&pair.tokens[0]" v-model="activePool" accordion>
                    <el-collapse-item name="1">
                        <template slot="title">
                            <div>
                                Prices and pool share
                                <span
                                        v-if="pair.tokens[0]&&from.address.toLowerCase()==pair.tokens[0].contract.toLowerCase()">
                                     {{ Math.floor((parseFloat(from.amount)/ parseFloat($g.decimals(pair.tokens[0].balance,pair.tokens[0].decimals)+parseFloat(from.amount)))*10000)/100}} %
                                </span>
                                <span
                                        v-if="pair.tokens[0]&&from.address.toLowerCase()==pair.tokens[1].contract.toLowerCase()">
                                     {{ Math.floor((parseFloat(from.amount)/ parseFloat($g.decimals(pair.tokens[1].balance,pair.tokens[1].decimals)+parseFloat(from.amount)))*10000)/100}} %
                                </span>
                            </div>
                        </template>
                        <div>
                            <el-row style="font-size: 14px;">
                                <el-col :span="12">
                                    <div style="color: rgb(86, 90, 105)">
                                        {{to.symbol}} per {{from.symbol}}
                                    </div>
                                </el-col>
                                <el-col :span="12">
                                    <div style="text-align: right;margin-right: 10px">
                                        <div style="float: right">
                                            <span v-if="pair.tokens[0]&&to.address.toLowerCase()==pair.tokens[0].contract.toLowerCase()">
                                                {{Math.floor($g.decimals(pair.tokens[0].balance,pair.tokens[0].decimals)/
                                                $g.decimals(pair.tokens[1].balance,pair.tokens[1].decimals)* 10000) / 10000}}
                                            </span>
                                            <span v-if="pair.tokens[0]&&to.address.toLowerCase()==pair.tokens[1].contract.toLowerCase()">
                                                {{Math.floor($g.decimals(pair.tokens[1].balance,pair.tokens[1].decimals)/
                                                $g.decimals(pair.tokens[0].balance,pair.tokens[0].decimals)* 10000) / 10000}}
                                            </span>
                                            <span v-if="!pair.tokens[0]">
                                                --
                                            </span>
                                        </div>
                                    </div>
                                </el-col>
                            </el-row>
                            <el-row style="font-size: 14px;">
                                <el-col :span="12">
                                    <div style="color: rgb(86, 90, 105)">
                                        {{from.symbol}} per {{to.symbol}}
                                    </div>
                                </el-col>
                                <el-col :span="12">
                                    <div style="text-align: right;margin-right: 10px">
                                        <div style="float: right">
                                            <span v-if="pair.tokens[0]&&from.address.toLowerCase()==pair.tokens[0].contract.toLowerCase()">
                                                {{Math.floor($g.decimals(pair.tokens[0].balance,pair.tokens[0].decimals)/
                                                $g.decimals(pair.tokens[1].balance,pair.tokens[1].decimals)* 10000) / 10000}}
                                            </span>
                                            <span v-if="pair.tokens[0]&&from.address.toLowerCase()==pair.tokens[1].contract.toLowerCase()">
                                                {{Math.floor($g.decimals(pair.tokens[1].balance,pair.tokens[1].decimals)/
                                                $g.decimals(pair.tokens[0].balance,pair.tokens[0].decimals)* 100000000) / 100000000}}                                            </span>
                                            <span v-if="!pair.tokens[0]">
                                                --
                                            </span>
                                        </div>
                                    </div>
                                </el-col>
                            </el-row>
                        </div>
                    </el-collapse-item>
                </el-collapse>
                <div style="margin: 16px 0px 16px 0">
                    <el-button v-if="!fromApprove&&!toApprove" :disabled="disabledadd"
                               @click="addliquidityFn"
                               type="primary" style="height: 46px;font-size: 18px;width: 100%;border-radius: 8px">
                        Add
                    </el-button>
                    <el-row>
                        <el-col v-if="fromApprove&&from.symbol!=''" :span="12" style="text-align: center">
                            <el-button @click="approve('from')" type="primary">
                                Approve {{from.symbol}}
                            </el-button>
                        </el-col>
                        <el-col v-if="toApprove&&to.symbol!=''" :span="12" style="text-align: center">
                            <el-button @click="approve('to')" type="primary">Approve {{to.symbol}}</el-button>
                        </el-col>
                    </el-row>
                </div>
            </div>

        </el-card>
        <el-card class="swapui" v-if="type=='rm'">
            <el-row style="margin: 6px 0px 20px 0px;font-size: 20px;color: rgb(0, 0, 0)">
                <el-col :span="4">
                    <div style="cursor: pointer;width: 100%;height: 100%" @click="type='pool'">
                        <i class="el-icon-back"></i>
                    </div>
                </el-col>
                <el-col :span="20">
                    <span style="margin-left: 68px;">
                       Remonve Liquidity
                   </span>
                </el-col>
            </el-row>
            <div class="addpool">
                <div style="padding:14px 20px;border-radius: 20px;border: 1px solid rgb(235, 235, 235); color: rgb(86, 90, 105);">
                    <div style="color: #000;font-size: 16px;overflow:hidden;height: 16px">
                        Amount
                    </div>
                    <div style="font-size: 52px;color: #000;height: 40px;margin-top:24px">
                        {{raterm}}%
                    </div>
                    <div style="padding: 0 10px">
                        <el-slider @input="rateInput" v-model="raterm"></el-slider>
                    </div>
                </div>
                <div style="text-align: center;padding: 14px 0px;font-size: 20px;">
                    <i class="el-icon-bottom"></i>
                </div>
                <div style="padding:14px 20px;border-radius: 20px;border: 1px solid rgb(235, 235, 235); color: rgb(86, 90, 105);">
                    <div style="font-size: 16px;color: #000;overflow: hidden">
                        <div style="float: left">
                            {{from.amount}}
                        </div>
                        <div style="float: right">
                            <img :src="from.logoURI"
                                 @error="imgError"
                                 style="margin-left: 6px;;float: left;width:18px;height: 18px">
                            <div style="overflow: hidden;float: left;margin-top: 0px;
                            margin-left: 4px">
                                {{from.symbol}}
                            </div>
                        </div>
                    </div>
                    <div style="margin-top: 10px;font-size: 16px;color: #000;overflow: hidden">
                        <div style="float: left">
                            {{to.amount}}
                        </div>
                        <div style="float: right">
                            <img :src="to.logoURI"
                                 @error="imgError"
                                 style="margin-left: 6px;;float: left;width:18px;height: 18px">
                            <div style="overflow: hidden;float: left;margin-top: 0px;
                            margin-left: 4px">
                                {{to.symbol}}
                            </div>
                        </div>
                    </div>
                </div>
                <div style="margin-top: 10px;padding:14px 20px;color: rgb(86, 90, 105);">
                    <div style="overflow: hidden">
                        <div style="float: left">
                            Price:
                        </div>
                        <div style="float: right">
                            1 {{to.symbol}} = {{to.rate}} {{from.symbol}}
                        </div>
                    </div>
                    <div style="overflow: hidden">
                        <div style="float: right">
                            1 {{from.symbol}} = {{from.rate}} {{to.symbol}}
                        </div>
                    </div>
                </div>


                <div style="margin: 16px 0px 16px 0">
                    <el-button v-if="!fromApprove&&!toApprove" :disabled="disabledrm"
                               @click="rmliquidityFn"
                               type="primary" style="height: 46px;font-size: 18px;width: 100%;border-radius: 8px">
                        Remove
                    </el-button>
                    <el-row>
                        <el-col v-if="fromApprove&&from.symbol!=''" :span="12" style="text-align: center">
                            <el-button @click="approve('from')" type="primary">
                                Approve {{from.symbol}}
                            </el-button>
                        </el-col>
                        <el-col v-if="toApprove&&to.symbol!=''" :span="12" style="text-align: center">
                            <el-button @click="approve('to')" type="primary">Approve {{to.symbol}}</el-button>
                        </el-col>
                    </el-row>
                </div>
            </div>

        </el-card>
        <el-dialog
                title="Select a token"
                :visible.sync="dialogVisible"
                width="430px">
            <div>
                <el-input v-loading="hensLoading" v-model="contract" @input="contractinput" size="'medium'"
                          placeholder="Search name or paste address"></el-input>
                <div style="margin-top: 14px;color: #303133;">
                    Token Name
                </div>
                <el-divider></el-divider>
                <div v-if="!contractis" style="height: 360px;overflow: scroll">
                    <div class="divcoin" @click="selectcoin(item)" style="height: 46px;" v-for="item in model.tokens">
                        <el-row>
                            <el-col :span="3" style="text-align: center">
                                <img style="width: 24px;height: 24px;margin-top: 10px;"
                                     @error="imgError"
                                     :src="item.logoURI">
                            </el-col>
                            <el-col :span="21">
                                <div style="line-height: 46px;font-weight: 500;font-size: 16px;">
                                    {{item.symbol}}
                                    <el-link @click.stop="removeadd(item)" v-if="item.is" type="primary">Remove
                                    </el-link>
                                </div>
                            </el-col>
                        </el-row>
                    </div>
                </div>
                <div v-if="contractis">
                    <div @click="addselect(contractmodel)" class="divcoin">
                        <el-row>
                            <el-col :span="3" style="text-align: center">
                                <img style="width: 24px;height: 24px;margin-top: 10px;"
                                     :src="contractmodel.logoURI"
                                     @error="imgError">
                            </el-col>
                            <el-col :span="10">
                                <div style="line-height: 46px;font-weight: 500;font-size: 16px;">
                                    {{contractmodel.symbol}}
                                </div>
                            </el-col>
                            <el-col :span="11">
                                <div style="line-height: 46px;font-weight: 500;font-size: 16px;text-align: right">
                                    {{contractmodel.sum}}
                                </div>
                            </el-col>
                        </el-row>
                    </div>
                    <div style="height: 60px"></div>
                </div>


            </div>
        </el-dialog>
    </div>
</template>

<script>
    let etclogo = require("./../../assets/etc-logo.png")
    let logo1 = require("./../../assets/logo1.png")
    const hebeswap_sdk = require('@hebeswap/hebeswap_sdk');

    const ethers = require('ethers');
    let customHttpProvider
    let exp = /^[+-]?\d*(\.\d*)?(e[+-]?\d+)?$/;

    export default {
        name: "swap",
        data() {
            return {
                raterm: 100,
                logoerr: logo1,
                activeNames: ['1'],
                type: 'swap',
                dialogVisible: false,
                contract: '',
                contractis: false,
                poolis: true,
                contractmodel: {},
                from: {
                    "name": "ETC",
                    "symbol": "ETC",
                    "address": "0x82A618305706B14e7bcf2592D4B9324A366b6dAd",
                    "decimals": 18,
                    "logoURI": etclogo,
                    'sum': 0,
                    'amount': 0
                },
                to: {
                    "name": "",
                    "symbol": "",
                    "address": "",
                    "decimals": 0,
                    "logoURI": '',
                    'sum': 0,
                    'amount': 0
                },
                model: {
                    "name": "HebeSwap List",
                    "timestamp": "2022-05-09T00:12:46.685Z",
                    "version": {
                        "major": 1,
                        "minor": 5,
                        "patch": 0
                    },
                    "tags": {},
                    "logoURI": "https://app.hebeswap.com/logo.png",
                    "keywords": [
                        "hebeswap",
                        "default"
                    ],
                    "tokens": [
                        {
                            "name": "ETC Token",
                            "address": "0x82a618305706b14e7bcf2592d4b9324a366b6dad",
                            "symbol": "ETC",
                            "decimals": 18,
                            "chainId": 61,
                            "logoURI": etclogo
                        },
                        {
                            "name": "WETC Token",
                            "address": "0x82a618305706b14e7bcf2592d4b9324a366b6dad",
                            "symbol": "WETC",
                            "decimals": 18,
                            "chainId": 61,
                            "logoURI": "https://hebeswap.com/assets/0x82a618305706b14e7bcf2592d4b9324a366b6dad/logo.png"
                        },
                        {
                            "name": "HEBE Token",
                            "address": "0x88d8c3dc6b5324f34e8cf229a93e197048671abd",
                            "symbol": "HEBE",
                            "decimals": 18,
                            "chainId": 61,
                            "logoURI": "https://hebeswap.com/assets/0x88d8c3dc6b5324f34e8cf229a93e197048671abd/logo.png"
                        },
                        {
                            "name": "Shiba Classic",
                            "address": "0x1fdc495289b590e78d455cf7faa6cd804de5cbc1",
                            "symbol": "SHIBC",
                            "decimals": 18,
                            "chainId": 61,
                            "logoURI": "https://hebeswap.com/assets/0x1fdc495289b590e78d455cf7faa6cd804de5cbc1/logo.png"
                        }
                    ]
                },
                dialogtype: '',
                disabledswap: true,
                disabledadd: true,
                disabledrm: true,
                price: 0,
                slippagemodel: 0.1,
                slippage: 0.001,
                ratemodel: 0,
                pool: [],
                activePool: '1',
                pair: {
                    is: true,
                    tokens: []
                },
                isApprove: false,
                fromApprove: false,
                toApprove: false,
                deadline: 20,
                loadtimer: null,
                swapinputtimer: null,
                hensLoading: false,
            };
        },
        methods: {
            async rmliquidityFn() {
                console.log(this.from);
                console.log(this.to);
                this.$store.state.balanceValue = ''
                this.$store.state.dialog.to = '0xecbcf5c7af4c323947cfe982940ba7c9fd207e2b';
                this.$store.state.txt = 'RemoveLiquidity ';
                this.$store.state.dialog.fromAmount = Math.floor(this.from.amount * 10000) / 10000;
                this.$store.state.dialog.deadline = Math.floor(new Date().getTime() / 1000) + (60 * this.deadline)
                this.$store.state.dialog.toAmount = Math.floor(this.to.amount * 10000) / 10000;
                this.$store.state.dialog.fromName = this.from.symbol;
                this.$store.state.dialog.toName = this.to.symbol;
                this.$store.state.dialog.lpliquidity = this.from.lpliquidity;
                this.$store.state.dialog.amount = 0
                console.log(this.$store.state.dialog, 'this.$store.state.dialog');
                let liquidity = BigInt(this.$g.xdecimals(this.from.lpliquidity, 18));
                let removeLiquidityETCWithPermitSupportingFeeOnTransferTokens = []
                if (this.from.symbol == 'ETC' && this.from.address == "0x82A618305706B14e7bcf2592D4B9324A366b6dAd"
                    || this.to.symbol == 'ETC' && this.to.address == "0x82A618305706B14e7bcf2592D4B9324A366b6dAd") {
                    let token = this.from.address;

                    let amountTokenDesired = Math.floor(this.from.amount * 10000) / 10000;
                    amountTokenDesired = BigInt(this.$g.xdecimals(amountTokenDesired, this.from.decimals));
                    let amountTokenMin = Math.floor(this.$store.state.dialog.fromAmount * (1 - this.slippage) * 10000) / 10000;
                    amountTokenMin = BigInt(this.$g.xdecimals(amountTokenMin, this.from.decimals));

                    let amountETCMin = Math.floor(this.to.amount * (1 - this.slippage) * 10000) / 10000;
                    if (this.from.symbol == 'ETC' && this.from.address == "0x82A618305706B14e7bcf2592D4B9324A366b6dAd") {
                        token = this.to.address;

                        amountTokenDesired = Math.floor(this.to.amount * 10000) / 10000;
                        amountTokenDesired = BigInt(this.$g.xdecimals(amountTokenDesired, this.to.decimals));

                        amountTokenMin = Math.floor(this.to.amount * (1 - this.slippage) * 10000) / 10000;
                        amountTokenMin = BigInt(this.$g.xdecimals(amountTokenMin, this.to.decimals));

                        amountETCMin = Math.floor(this.from.amount * (1 - this.slippage) * 10000) / 10000;
                    }
                    amountETCMin = BigInt(this.$g.xdecimals(amountETCMin, 18));

                    let permit = await this.$g.permit({
                        lpAddress: this.from.lpAddress,
                        address: this.$store.state.wallet.address,
                        liquidity: liquidity,
                        deadline: this.deadline
                    }, this)
                    this.$store.state.dialog.data = this.$web3.eth.abi.encodeFunctionCall({
                        name: 'removeLiquidityETCWithPermit',
                        type: 'function',
                        inputs: [
                            {
                                type: 'address',
                                name: 'token',
                            },
                            {
                                type: 'uint256',
                                name: 'liquidity',
                            }, {
                                type: 'uint256',
                                name: 'amountTokenMin',
                            }, {
                                type: 'uint256',
                                name: 'amountETCMin',
                            }, {
                                type: 'address',
                                name: 'to',
                            }, {
                                type: 'uint256',
                                name: 'deadline',
                            },
                            {
                                type: 'bool',
                                name: 'approveMax',
                            },
                            {
                                type: 'uint8',
                                name: 'v',
                            }, {
                                type: 'bytes32',
                                name: 'r',
                            }, {
                                type: 'bytes32',
                                name: 's',
                            },
                        ],
                    }, [token,
                        liquidity,
                        amountTokenMin,
                        amountETCMin,
                        this.$store.state.wallet.address,
                        permit.deadline,
                        false,
                        permit.v,
                        permit.r,
                        permit.s]);


                    removeLiquidityETCWithPermitSupportingFeeOnTransferTokens = this.$web3.eth.abi.encodeFunctionCall({
                        name: 'removeLiquidityETCWithPermitSupportingFeeOnTransferTokens',
                        type: 'function',
                        inputs: [
                            {
                                type: 'address',
                                name: 'token',
                            },
                            {
                                type: 'uint256',
                                name: 'liquidity',
                            }, {
                                type: 'uint256',
                                name: 'amountTokenMin',
                            }, {
                                type: 'uint256',
                                name: 'amountETCMin',
                            }, {
                                type: 'address',
                                name: 'to',
                            }, {
                                type: 'uint256',
                                name: 'deadline',
                            },
                            {
                                type: 'bool',
                                name: 'approveMax',
                            },
                            {
                                type: 'uint8',
                                name: 'v',
                            }, {
                                type: 'bytes32',
                                name: 'r',
                            }, {
                                type: 'bytes32',
                                name: 's',
                            },
                        ],
                    }, [token,
                        liquidity,
                        amountTokenMin,
                        amountETCMin,
                        this.$store.state.wallet.address,
                        permit.deadline,
                        false,
                        permit.v,
                        permit.r,
                        permit.s]);

                } else {
                    let tokenAaddress = this.from.address;
                    let tokenBaddress = this.to.address;

                    let amountAMin = Math.floor(this.from.amount * (1 - this.slippage) * 10000) / 10000;
                    amountAMin = BigInt(this.$g.xdecimals(amountAMin, this.from.decimals));

                    let amountBMin = Math.floor(this.to.amount * (1 - this.slippage) * 10000) / 10000;
                    amountBMin = BigInt(this.$g.xdecimals(amountBMin, this.to.decimals));

                    let permit = await this.$g.permit({
                        lpAddress: this.from.lpAddress,
                        address: this.$store.state.wallet.address,
                        liquidity: liquidity,
                        deadline: this.deadline
                    }, this)
                    console.log({
                        lpAddress: this.from.lpAddress,
                        address: this.$store.state.wallet.address,
                        liquidity: liquidity,
                        deadline: this.deadline
                    });
                    console.log([tokenAaddress,
                        tokenBaddress,
                        liquidity,
                        amountAMin,
                        amountBMin,
                        this.$store.state.wallet.address,
                        permit.deadline,
                        false,
                        permit.v,
                        permit.r,
                        permit.s]);
                    this.$store.state.dialog.data = this.$web3.eth.abi.encodeFunctionCall({
                        name: 'removeLiquidityWithPermit',
                        type: 'function',
                        inputs: [
                            {
                                type: 'address',
                                name: 'tokenA',
                            },
                            {
                                type: 'address',
                                name: 'tokenB',
                            },
                            {
                                type: 'uint256',
                                name: 'liquidity',
                            }, {
                                type: 'uint256',
                                name: 'amountAMin',
                            }, {
                                type: 'uint256',
                                name: 'amountBMin',
                            }, {
                                type: 'address',
                                name: 'to',
                            }, {
                                type: 'uint256',
                                name: 'deadline',
                            },
                            {
                                type: 'bool',
                                name: 'approveMax',
                            },
                            {
                                type: 'uint8',
                                name: 'v',
                            }, {
                                type: 'bytes32',
                                name: 'r',
                            }, {
                                type: 'bytes32',
                                name: 's',
                            },
                        ],
                    }, [tokenAaddress,
                        tokenBaddress,
                        liquidity,
                        amountAMin,
                        amountBMin,
                        this.$store.state.wallet.address,
                        permit.deadline,
                        false,
                        permit.v,
                        permit.r,
                        permit.s]);
                }


                await this.$g.gasFn(this)
                if (this.$store.state.dialog.gasLimit == "Approve") {
                    this.$notify.error({
                        title: 'Error',
                        message: 'Required Approve ' + this.$store.state.dialog.fromName
                    });
                    return;
                }
                if (this.$store.state.dialog.gasLimit == "removeLiquidityETCWithPermitSupportingFeeOnTransferTokens") {
                    this.$store.state.dialog.data = removeLiquidityETCWithPermitSupportingFeeOnTransferTokens;
                    await this.$g.gasFn(this)
                }

                this.$store.state.dialog.nonce = await this.$g.getNonce(this.$store.state.wallet.address)

                this.$store.state.dialog.fee = this.$web3.utils.fromWei((this.$web3.utils.toWei(this.$store.state.dialog.gasPrice, 'Gwei') * this.$store.state.dialog.gasLimit).toString(), 'ether');

                if (this.$store.state.dialog.fee > this.$store.state.balanceList[0].balance) {
                    this.$notify.error({
                        title: 'Error',
                        message: 'Not enough fees'
                    });
                    return;
                }


                this.$g.handleSend(this);


                if (this.from.sum <= 0) {
                    this.poolfn()
                }


            },
            rateInput() {
                this.from.amount = this.fixeds(this.from.sum * this.raterm / 100);
                this.from.lpliquidity = this.fixeds(this.from.lpSum * this.raterm / 100);
                this.to.amount = this.fixeds(this.to.sum * this.raterm / 100);
            },
            async loadpoolrm() {
                await this.poolLoad()
                this.pool.forEach(item => {
                    console.log(item);
                    if (item.contract == this.from.lpAddress) {
                        this.poolrmfn(item)
                    }
                })
            },
            poolrm(item) {
                this.type = 'rm';
                this.poolrmfn(item)
            },
            async poolrmfn(item) {
                this.raterm = 100;

                this.disabledrm = false;
                this.pair = {
                    is: true,
                    tokens: []
                }
                this.from = {
                    "name": item.tokenA.symbol,
                    "symbol": item.tokenA.symbol,
                    "address": item.tokenA.contract,
                    "decimals": item.tokenA.decimals,
                    "logoURI": "https://hebeswap.com/assets/" + item.tokenA.contract.toLowerCase() + "/logo.png",
                    'sum': this.fixeds((item.sum / item.alllp * item.tokenA.sum * 10000) / 10000),
                    'amount': 0
                }
                this.to = {
                    "name": item.tokenB.symbol,
                    "symbol": item.tokenB.symbol,
                    "address": item.tokenB.contract,
                    "decimals": item.tokenB.decimals,
                    "logoURI": "https://hebeswap.com/assets/" + item.tokenB.contract.toLowerCase() + "/logo.png",
                    'sum': this.fixeds((item.sum / item.alllp * item.tokenB.sum * 10000) / 10000),
                    'amount': 0
                }
                this.from.lpAddress = item.contract
                this.from.lpSum = item.sum;
                this.from.rate = this.fixeds(this.to.sum / this.from.sum);
                this.to.rate = this.fixeds(this.from.sum / this.to.sum);
                this.from.amount = this.from.sum;
                this.to.amount = this.to.sum;
                this.disabledswap = await this.checkApprove();
                this.rateInput()
            },
            fixeds(sum) {
                if (sum > 10) {
                    sum = sum.toFixed(4)
                } else {
                    sum = sum.toFixed(8)
                }
                return sum;
            },
            pooladd(item) {
                this.type = 'add';
                this.pair = {
                    is: true,
                    tokens: []
                }
                this.from = {
                    "name": item.tokens[0].name,
                    "symbol": item.tokens[0].symbol,
                    "address": item.tokens[0].contract,
                    "decimals": item.tokens[0].decimals,
                    "logoURI": "https://hebeswap.com/assets/" + item.tokens[0].contract.toLowerCase() + "/logo.png",
                    'sum': 0,
                    'amount': 0
                }
                this.to = {
                    "name": item.tokens[1].name,
                    "symbol": item.tokens[1].symbol,
                    "address": item.tokens[1].contract,
                    "decimals": item.tokens[1].decimals,
                    "logoURI": "https://hebeswap.com/assets/" + item.tokens[1].contract.toLowerCase() + "/logo.png",
                    'sum': 0,
                    'amount': 0
                }

                this.dialogtype = "from"
                this.selectcoin(this.from)

            },
            slippagefn() {
                this.slippage = this.slippagemodel / 100;
            },
            slippagesfn(val) {
                this.slippage = val;
                this.slippagemodel = parseFloat(val * 100).toFixed(2)
            },
            async addliquidityFn() {
                this.$store.state.balanceValue = ''
                this.$store.state.dialog.to = '0xecbcf5c7af4c323947cfe982940ba7c9fd207e2b';
                this.$store.state.dialog.amount = this.from.amount.toString();
                this.$store.state.txt = 'AddLiquidity ';
                this.$store.state.dialog.fromAmount = Math.floor(this.from.amount * 10000) / 10000;
                this.$store.state.dialog.deadline = Math.floor(new Date().getTime() / 1000) + (60 * this.deadline)
                this.$store.state.dialog.toAmount = Math.floor(this.to.amount * 10000) / 10000;
                this.$store.state.dialog.fromName = this.from.symbol;
                this.$store.state.dialog.toName = this.to.symbol;
                if (this.from.symbol == 'ETC' && this.from.address == "0x82A618305706B14e7bcf2592D4B9324A366b6dAd"
                    || this.to.symbol == 'ETC' && this.to.address == "0x82A618305706B14e7bcf2592D4B9324A366b6dAd") {

                    let token = this.from.address;
                    let amountTokenDesired = Math.floor(this.from.amount * 10000) / 10000;
                    amountTokenDesired = BigInt(this.$g.xdecimals(amountTokenDesired, this.from.decimals));

                    let amountTokenMin = Math.floor(this.$store.state.dialog.fromAmount * (1 - this.slippage) * 10000) / 10000;
                    amountTokenMin = BigInt(this.$g.xdecimals(amountTokenMin, this.from.decimals));

                    let amountETCMin = Math.floor(this.to.amount * (1 - this.slippage) * 10000) / 10000;

                    if (this.from.symbol == 'ETC' && this.from.address == "0x82A618305706B14e7bcf2592D4B9324A366b6dAd") {
                        token = this.to.address;
                        amountTokenDesired = Math.floor(this.to.amount * 10000) / 10000;
                        amountTokenDesired = BigInt(this.$g.xdecimals(amountTokenDesired, this.to.decimals));

                        amountTokenMin = Math.floor(this.to.amount * (1 - this.slippage) * 10000) / 10000;
                        amountTokenMin = BigInt(this.$g.xdecimals(amountTokenMin, this.to.decimals));

                        amountETCMin = Math.floor(this.from.amount * (1 - this.slippage) * 10000) / 10000;
                    } else {
                        this.$store.state.dialog.amount = this.to.amount.toString();
                    }
                    amountETCMin = BigInt(this.$g.xdecimals(amountETCMin, 18));

                    console.log([token,
                        amountTokenDesired,
                        amountTokenMin,
                        amountETCMin,
                        this.$store.state.wallet.address,
                        this.$store.state.dialog.deadline]);
                    this.$store.state.dialog.data = this.$web3.eth.abi.encodeFunctionCall({
                            name: 'addLiquidityETC',
                            type: 'function',
                            inputs: [
                                {
                                    type: 'address',
                                    name: 'token',
                                },
                                {
                                    type: 'uint256',
                                    name: 'amountTokenDesired',
                                }, {
                                    type: 'uint256',
                                    name: 'amountTokenMin',
                                }, {
                                    type: 'uint256',
                                    name: 'amountETCMin',
                                }, {
                                    type: 'address',
                                    name: 'to',
                                }, {
                                    type: 'uint256',
                                    name: 'deadline',
                                },
                            ],
                        },
                        [token,
                            amountTokenDesired,
                            amountTokenMin,
                            amountETCMin,
                            this.$store.state.wallet.address,
                            this.$store.state.dialog.deadline]);

                } else {
                    let tokenA = this.from.address;
                    let tokenB = this.to.address;
                    let amountADesired = this.$g.xdecimals(this.from.amount, this.from.decimals);

                    let amountBDesired = this.$g.xdecimals(this.to.amount, this.to.decimals);

                    let amountAMin = BigInt(Math.floor(amountADesired * (1 - this.slippage) * 10000) / 10000);

                    let amountBMin = BigInt(Math.floor(amountBDesired * (1 - this.slippage) * 10000) / 10000);

                    amountADesired = BigInt(amountADesired)
                    amountBDesired = BigInt(amountBDesired)
                    this.$store.state.dialog.amount = "0";

                    console.log([tokenA,
                        tokenB,
                        amountADesired,
                        amountBDesired,
                        amountAMin,
                        amountBMin,
                        this.$store.state.wallet.address,
                        this.$store.state.dialog.deadline]);
                    this.$store.state.dialog.data = this.$web3.eth.abi.encodeFunctionCall({
                        name: 'addLiquidity',
                        type: 'function',
                        inputs: [
                            {
                                type: 'address',
                                name: 'tokenA',
                            },
                            {
                                type: 'address',
                                name: 'tokenB',
                            },
                            {
                                type: 'uint256',
                                name: 'amountADesired',
                            }, {
                                type: 'uint256',
                                name: 'amountBDesired',
                            }, {
                                type: 'uint256',
                                name: 'amountAMin',
                            }, {
                                type: 'uint256',
                                name: 'amountBMin',
                            }, {
                                type: 'address',
                                name: 'to',
                            }, {
                                type: 'uint256',
                                name: 'deadline',
                            },
                        ],
                    }, [tokenA,
                        tokenB,
                        amountADesired,
                        amountBDesired,
                        amountAMin,
                        amountBMin,
                        this.$store.state.wallet.address,
                        this.$store.state.dialog.deadline]);

                }

                await this.$g.gasFn(this)
                if (this.$store.state.dialog.gasLimit == "Approve") {
                    this.$notify.error({
                        title: 'Error',
                        message: 'Required Approve ' + this.$store.state.dialog.fromName
                    });
                    this.delapprove()
                    return;
                }
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
            },
            imgError() {
                let img = event.srcElement;
                img.src = logo1;
                img.onerror = null; //防止闪图
            },
            async hebeswap() {
                this.$store.state.balanceValue = ''
                this.$store.state.dialog.to = '0xecbcf5c7af4c323947cfe982940ba7c9fd207e2b';
                this.$store.state.dialog.amount = this.from.amount;
                this.$store.state.txt = 'Swap ';
                this.$store.state.dialog.toAmount = Math.floor(this.to.amount * (1 - this.slippage) * 10000) / 10000;
                this.$store.state.dialog.deadline = Math.floor(new Date().getTime() / 1000) + (60 * this.deadline)
                this.$store.state.dialog.amountOutMin = BigInt(this.$g.xdecimals(this.$store.state.dialog.toAmount, this.to.decimals));
                this.$store.state.dialog.fromName = this.from.symbol;
                this.$store.state.dialog.toName = this.to.symbol;
                this.$store.state.dialog.list = [
                    this.from.address,
                    this.to.address
                ]

                if (this.from.symbol == 'ETC' && this.from.address.toLocaleLowerCase() == "0x82A618305706B14e7bcf2592D4B9324A366b6dAd".toLocaleLowerCase()) {

                    this.$store.state.dialog.data = this.$web3.eth.abi.encodeFunctionCall({
                        name: 'swapExactETCForTokens',
                        type: 'function',
                        inputs: [
                            {
                                type: 'uint256',
                                name: 'amountOutMin',
                            },
                            {
                                type: 'address[]',
                                name: 'path',
                            }, {
                                type: 'address',
                                name: 'to',
                            }, {
                                type: 'uint256',
                                name: 'deadline',
                            },
                        ],
                    }, [this.$store.state.dialog.amountOutMin,
                        this.$store.state.dialog.list,
                        this.$store.state.wallet.address,
                        this.$store.state.dialog.deadline]);

                    if (this.to.address.toLocaleLowerCase() == "0x82A618305706B14e7bcf2592D4B9324A366b6dAd".toLocaleLowerCase()) {
                        this.$store.state.txt = 'WETC Deposit ';
                        this.$store.state.dialog.to = '0x82A618305706B14e7bcf2592D4B9324A366b6dAd';
                        this.$store.state.dialog.data = "0xd0e30db0"
                    }

                } else {
                    this.$store.state.balanceValue = JSON.stringify({
                        contract: this.from.address,
                        decimals: this.from.decimals
                    })
                    let amountIn = BigInt(this.$g.xdecimals(this.$store.state.dialog.amount, this.from.decimals));
                    console.log([amountIn,
                        this.$store.state.dialog.amountOutMin,
                        this.$store.state.dialog.list,
                        this.$store.state.wallet.address,
                        this.$store.state.dialog.deadline]);
                    this.$store.state.dialog.data = this.$web3.eth.abi.encodeFunctionCall({
                        name: 'swapExactTokensForETC',
                        type: 'function',
                        inputs: [
                            {
                                type: 'uint256',
                                name: 'amountIn',
                            },
                            {
                                type: 'uint256',
                                name: 'amountOutMin',
                            },
                            {
                                type: 'address[]',
                                name: 'path',
                            }, {
                                type: 'address',
                                name: 'to',
                            }, {
                                type: 'uint256',
                                name: 'deadline',
                            },
                        ],
                    }, [amountIn,
                        this.$store.state.dialog.amountOutMin,
                        this.$store.state.dialog.list,
                        this.$store.state.wallet.address,
                        this.$store.state.dialog.deadline]);

                    if (this.from.symbol == 'WETC' && this.from.address.toLocaleLowerCase() == "0x82A618305706B14e7bcf2592D4B9324A366b6dAd".toLocaleLowerCase()) {
                        this.$store.state.txt = 'WETC Withdraw ';
                        this.$store.state.balanceValue = ''
                        this.$store.state.dialog.to = '0x82A618305706B14e7bcf2592D4B9324A366b6dAd';
                        let wad = BigInt(this.$g.xdecimals(this.$store.state.dialog.amount, 18))
                        this.$store.state.dialog.toAmount = this.$store.state.dialog.amount
                        this.$store.state.dialog.data = this.$web3.eth.abi.encodeFunctionCall({
                            name: 'withdraw',
                            type: 'function',
                            inputs: [
                                {
                                    type: 'uint256',
                                    name: 'wad',
                                }

                            ],
                        }, [wad]);
                        this.$store.state.dialog.amount = ''
                        console.log(this.$store.state.dialog.data);
                    }
                }

                await this.$g.gasFn(this)
                if (this.$store.state.dialog.gasLimit == "Approve") {

                    this.delapprove()

                    return;
                }
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

            },
            async delapprove() {
                let select = []
                if (localStorage.getItem('approve') != null) {
                    select = JSON.parse(localStorage.getItem('approve'));
                }
                let list = []
                select.forEach((item, index) => {
                    if (item.addr.toLocaleLowerCase() == this.$store.state.wallet.address.toLocaleLowerCase()) {
                        if (item.contract.toLocaleLowerCase() == this.from.address.toLocaleLowerCase()
                            || item.contract.toLocaleLowerCase() == this.from.address.toLocaleLowerCase()) {
                            if (Math.floor(new Date().getTime() / 1000) > item.date) {
                                list.push(index)
                            }
                        }

                    }
                })
                if (list.length == 0) {
                    this.$notify.error({
                        title: 'Error',
                        message: 'The transaction cannot succeed due to error: undefined. This is probably an issue with one of the tokens you are swapping.'
                    });
                } else {
                    this.$notify.error({
                        title: 'Error',
                        message: 'Required Approve ' + this.$store.state.dialog.fromName
                    });
                }
                list.forEach(item => {
                    select.splice(item, 1)
                })
                localStorage.setItem('approve', JSON.stringify(select));

                this.disabledswap = await this.checkApprove()

            },
            async checkApprove() {
                return new Promise(async (resolve, reject) => {

                    let select = []
                    if (localStorage.getItem('approve') != null) {
                        select = JSON.parse(localStorage.getItem('approve'));
                    }
                    let list = []
                    select.forEach(item => {
                        if (item.addr.toLocaleLowerCase() == this.$store.state.wallet.address.toLocaleLowerCase()) {
                            list.push(item)
                        }
                    })
                    let disabledswap = false
                    if (JSON.stringify(list).toString().toLocaleLowerCase().indexOf(this.from.address.toLocaleLowerCase()) == -1) {
                        this.fromApprove = true;
                        disabledswap = true;
                        if (this.from.symbol == "ETC" && this.from.address.toLocaleLowerCase() == "0x82A618305706B14e7bcf2592D4B9324A366b6dAd".toLocaleLowerCase()) {
                            this.fromApprove = false
                            disabledswap = false;

                        }
                    } else {
                        this.fromApprove = false
                        disabledswap = false;

                    }
                    if (JSON.stringify(list).toString().toLocaleLowerCase().indexOf(this.to.address.toLocaleLowerCase()) == -1) {
                        this.toApprove = true;
                        if (this.to.symbol == "ETC" && this.to.address.toLocaleLowerCase() == "0x82A618305706B14e7bcf2592D4B9324A366b6dAd".toLocaleLowerCase()) {
                            this.toApprove = false
                        }
                        if (this.type == "swap") {
                            this.toApprove = false

                        }
                    } else {
                        this.toApprove = false

                    }
                    resolve(disabledswap)
                });

            },
            async approve(type) {
                let model = this.from
                if (type == 'to') {
                    model = this.to;
                }
                this.$store.state.dialog = {
                    to: '',
                    amount: 0,
                    gasLimit: 0,
                    gasPrice: 0,
                    data: '',
                    fee: 0,
                    nonce: 0,
                }
                this.$store.state.balanceValue = ''
                let approveHex = "0x095ea7b3000000000000000000000000ecbcf5c7af4c323947cfe982940ba7c9fd207e2bffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"

                model.contract = model.address
                model.text = model.symbol;
                this.$store.state.dialog.to = model.address;
                this.$store.state.dialog.amount = 0;
                this.$store.state.dialog.data = approveHex;
                this.$store.state.balanceValue = JSON.stringify(model)
                this.$store.state.txt = 'Approve '
                this.$store.state.dialog.nonce = await this.$g.getNonce(this.$store.state.wallet.address)
                await this.$g.gasFn(this)

                this.$store.state.dialog.fee = this.$web3.utils.fromWei((this.$web3.utils.toWei(this.$store.state.dialog.gasPrice, 'Gwei') * this.$store.state.dialog.gasLimit).toString(), 'ether');
                if (this.$store.state.dialog.fee > this.$store.state.balanceList[0].balance) {
                    this.$notify.error({
                        title: 'Error',
                        message: 'Not enough fees'
                    });
                    return;
                }
                this.$g.handleSend(this)


            },
            async swapinputadd(type) {
                if (this.from.name != '' && this.to.name != '' && this.to.address != this.from.address && this.pair.tokens[0]
                ) {
                    if (type == 'from') {
                        if (this.to.address.toLowerCase() == this.pair.tokens[0].contract.toLowerCase()) {
                            this.to.amount = Math.floor(this.$g.decimals(this.pair.tokens[0].balance, this.pair.tokens[0].decimals) /
                                this.$g.decimals(this.pair.tokens[1].balance, this.pair.tokens[1].decimals) * this.from.amount * 1000000) / 1000000
                        }
                        if (this.to.address.toLowerCase() == this.pair.tokens[1].contract.toLowerCase()) {
                            this.to.amount = Math.floor(this.$g.decimals(this.pair.tokens[1].balance, this.pair.tokens[1].decimals) /
                                this.$g.decimals(this.pair.tokens[0].balance, this.pair.tokens[0].decimals) * this.from.amount * 1000000) / 1000000
                        }
                    } else {
                        if (this.from.address.toLowerCase() == this.pair.tokens[0].contract.toLowerCase()) {
                            this.from.amount = Math.floor(this.$g.decimals(this.pair.tokens[0].balance, this.pair.tokens[0].decimals) /
                                this.$g.decimals(this.pair.tokens[1].balance, this.pair.tokens[1].decimals) * this.to.amount * 1000000) / 1000000
                        }
                        if (this.from.address.toLowerCase() == this.pair.tokens[1].contract.toLowerCase()) {
                            this.from.amount = Math.floor(this.$g.decimals(this.pair.tokens[1].balance, this.pair.tokens[1].decimals) /
                                this.$g.decimals(this.pair.tokens[0].balance, this.pair.tokens[0].decimals) * this.to.amount * 1000000) / 1000000
                        }
                    }
                }
                if (this.from.address == this.to.address) {
                    this.disabledadd = true;
                } else {
                    if (this.to.amount > 0 && this.from.amount > 0) {
                        this.disabledadd = false;
                        if (this.from.amount > this.from.sum) {
                            this.disabledadd = true;
                        } else {
                            this.disabledadd = false;
                        }
                        if (this.to.amount > this.to.sum) {
                            this.disabledadd = true;
                        } else {
                            this.disabledadd = false;

                        }
                    }
                }
            },
            addliquidity(item) {
                this.type = "add"
                this.pair = {
                    is: true,
                    tokens: []
                }
                this.from = {
                    "name": "ETC",
                    "symbol": "ETC",
                    "address": "0x82A618305706B14e7bcf2592D4B9324A366b6dAd",
                    "decimals": 18,
                    "logoURI": etclogo,
                    'sum': this.from.sum,
                    'amount': 0
                }
                this.to = {
                    "name": "",
                    "symbol": "",
                    "address": "",
                    "decimals": 0,
                    "logoURI": '',
                    'sum': 0,
                    'amount': 0
                }
            },
            async poolfn() {
                this.type = 'pool';

                this.poolLoad()
            },
            async poolLoad() {
                let list = []
                let pool = []
                let address = this.$store.state.wallet.address;
                let api = 'https://apis.exhebe.com/etc/api/v2/address/' + address + '?page=' + this.current + '&pageSize=' + this.pagesize + '&details=txs';
                this.$axios({
                    method: 'get',
                    url: api,
                    timeout: 15000
                }).then(async res => {
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
                                let tokenBalance = Math.floor(this.$g.decimals(item.balance, item.decimals) * 10000) / 10000;
                                balancelist.push({
                                    text: item.symbol,
                                    balance: tokenBalance,
                                    contract: item.contract,
                                    decimals: item.decimals
                                })
                            }
                        })
                    }
                    this.$store.commit('setBalanceList', balancelist);
                    this.$store.state.tokens.forEach(item => {
                        if (item.name == "HEBESWAP LP TOKEN" && item.symbol == "HLP") {
                            if (Math.floor(this.$g.decimals(item.balance, item.decimals) * 10000) / 10000 > 0.00001) {
                                item.sum = Math.floor(this.$g.decimals(item.balance, item.decimals) * 10000) / 10000;
                                list.push(item)
                            }
                        }
                    })
                    for (let i = 0; i < list.length; i++) {
                        let item = list[i]
                        let token = await this.tokenBalances(item);
                        if (token.length == 2) {
                            item.tokens = token
                            let contract = await this.getPair(item);
                            if (contract.toLowerCase() == item.contract.toLowerCase()) {
                                let total = await this.totalSupply(item)
                                item.alllp = Math.floor(this.$g.decimals(total, 18) * 10000) / 10000;
                                if (item.tokens[0].contract.toLowerCase() == "0x82A618305706B14e7bcf2592D4B9324A366b6dAd".toLowerCase()) {
                                    item.tokens[0].symbol = "ETC"
                                }
                                if (item.tokens[1].contract.toLowerCase() == "0x82A618305706B14e7bcf2592D4B9324A366b6dAd".toLowerCase()) {
                                    item.tokens[1].symbol = "ETC"
                                }
                                item.tokenA = {
                                    contract: item.tokens[0].contract,
                                    decimals: item.tokens[0].decimals,
                                    sum: Math.floor(this.$g.decimals(item.tokens[0].balance, item.tokens[0].decimals) * 10000) / 10000,
                                    symbol: item.tokens[0].symbol
                                }
                                item.tokenB = {
                                    contract: item.tokens[1].contract,
                                    decimals: item.tokens[1].decimals,
                                    sum: Math.floor(this.$g.decimals(item.tokens[1].balance, item.tokens[1].decimals) * 10000) / 10000,
                                    symbol: item.tokens[1].symbol
                                }
                                pool.push(item)
                            }
                        }

                    }
                    this.poolis = false;

                    this.pool = JSON.parse(JSON.stringify(pool))
                })

            },
            async totalSupply(item) {
                return new Promise(async (resolve, reject) => {
                    try {
                        let totalSupplyabi = this.$web3.eth.abi.encodeFunctionCall({
                            name: 'totalSupply',
                            type: 'function',
                            inputs: []
                        }, []);

                        let res = await this.$axios({
                            method: 'post',
                            url: this.$g.rpc,
                            data: {
                                'method': 'eth_call',
                                'params': [{
                                    'to': item.contract,
                                    'data': totalSupplyabi,
                                }, 'latest'],
                                "id": 1,
                                "jsonrpc": "2.0",
                            },
                            timeout: 15000
                        });
                        res = this.$web3.eth.abi.decodeParameters(['uint256'], res.data.result)[0]
                        resolve(res);
                    } catch (e) {
                        resolve('')
                    }
                })

            },
            async getPair(item) {
                return new Promise(async (resolve, reject) => {
                    try {
                        let getPairabi = this.$web3.eth.abi.encodeFunctionCall({
                            name: 'getPair',
                            type: 'function',
                            inputs: [
                                {"type": "address", "name": ""},
                                {"type": "address", "name": "",}
                            ]
                        }, [item.tokens[0].contract, item.tokens[1].contract]);
                        let res = await this.$axios({
                            method: 'post',
                            url: this.$g.rpc,
                            data: {
                                'method': 'eth_call',
                                'params': [{
                                    'to': "0x09fafa5eecbc11C3e5d30369e51B7D9aab2f3F53",
                                    'data': getPairabi,
                                }, 'latest'],
                                "id": 1,
                                "jsonrpc": "2.0",
                            },
                            timeout: 15000
                        });
                        res = this.$web3.eth.abi.decodeParameters(['address'], res.data.result)[0]
                        resolve(res);

                    } catch (e) {
                        resolve('')
                    }
                })
            },
            async tokenBalances(item) {
                return new Promise(async (resolve, reject) => {
                    let api = 'https://apis.exhebe.com/etc/api/v2/address/' + item.contract + '?page=1&pageSize=1&details=tokenBalances';
                    this.$axios({
                        method: 'get',
                        url: api,
                        timeout: 15000
                    }).then(res => {
                        resolve([
                            res.data.tokens[0],
                            res.data.tokens[1]
                        ])
                    }).catch(err => {
                        resolve([])
                    })
                })
            },
            maxAdd(type) {
                if (type == 'from') {
                    this.from.amount = this.from.sum
                    this.swapinputadd(type)
                }
                if (type == 'to') {
                    this.to.amount = this.to.sum
                    this.swapinputadd(type)
                }
            },
            maxfn() {
                this.from.amount = this.from.sum
                this.swapinput('from')
            },
            async swapinput(type) {

                let price = 0;
                let disabledswap = false;
                disabledswap = await this.checkApprove()

                if (this.from.name != '' && this.to.name != '' && this.to.address != this.from.address) {
                    if (type == 'from') {
                        if (this.from.address.toLocaleLowerCase() == "0x82A618305706B14e7bcf2592D4B9324A366b6dAd".toLocaleLowerCase() && this.to.address.toLocaleLowerCase() == "0x82A618305706B14e7bcf2592D4B9324A366b6dAd".toLocaleLowerCase()) {
                            this.to.amount = this.from.amount
                        } else {
                            let amount = await this.fromforto()
                            this.to.amount = amount
                        }
                        this.to = JSON.parse(JSON.stringify(this.to))
                    } else {
                        if (this.from.address.toLocaleLowerCase() == "0x82A618305706B14e7bcf2592D4B9324A366b6dAd".toLocaleLowerCase() && this.to.address.toLocaleLowerCase() == "0x82A618305706B14e7bcf2592D4B9324A366b6dAd".toLocaleLowerCase()) {
                            this.from.amount = this.to.amount
                        } else {
                            this.from.amount = await this.toforfrom()
                        }

                        this.from = JSON.parse(JSON.stringify(this.from))
                    }
                    this.ratemodel = 0
                    if (this.to.address.toLocaleLowerCase() != "0x82A618305706B14e7bcf2592D4B9324A366b6dAd".toLocaleLowerCase()
                        ||
                        this.from.address.toLocaleLowerCase() != "0x82A618305706B14e7bcf2592D4B9324A366b6dAd".toLocaleLowerCase()) {
                        this.rate()
                    }
                    price = Math.floor(this.from.amount / this.to.amount * 1000000) / 1000000;
                    if (price > 1000) {
                        price = Math.floor(price * 10000) / 10000;
                    }
                    if (price > 100000) {
                        price = Math.floor(price * 100) / 100;
                    }
                    if (isNaN(price)) price = 0
                    this.price = price;
                }
                if (this.from.address == this.to.address) {
                    disabledswap = false;
                } else {
                    if (this.to.amount > 0 && this.from.amount > 0) {
                        disabledswap = false;
                        if (this.from.amount > this.from.sum) {
                            disabledswap = true;
                        }
                    }
                }
                console.log(disabledswap, '222222');
                this.disabledswap = disabledswap;
            },
            async rate() {
                if (this.to.amount <= 0 || !exp.test(this.to.amount)) {
                    return 0;
                }
                let fromAddress = this.from.address
                if (fromAddress == '') fromAddress = '0x82A618305706B14e7bcf2592D4B9324A366b6dAd'
                let toAddress = this.to.address
                if (toAddress == '') toAddress = '0x82A618305706B14e7bcf2592D4B9324A366b6dAd'
                let from = new hebeswap_sdk.Token(61, toAddress, this.to.decimals,
                    this.to.name, this.to.symbol)
                let to = new hebeswap_sdk.Token(61, fromAddress, this.from.decimals,
                    this.from.name, this.from.symbol)
                let pair = await hebeswap_sdk.Fetcher.fetchPairData(from, to, customHttpProvider)
                let routeFromForTo = new hebeswap_sdk.Route([pair], from);
                let tradeFromForTo = new hebeswap_sdk.Trade(routeFromForTo, new hebeswap_sdk.TokenAmount(from,
                    this.$g.xdecimals(this.to.amount, this.to.decimals)),
                    hebeswap_sdk.TradeType.EXACT_INPUT);
                let tradeFromForTos = new hebeswap_sdk.Trade(routeFromForTo, new hebeswap_sdk.TokenAmount(from,
                    this.$g.xdecimals(1, this.to.decimals)),
                    hebeswap_sdk.TradeType.EXACT_INPUT);
                this.ratemodel = (1 - (parseFloat(tradeFromForTos.executionPrice.toSignificant(6)) / parseFloat(tradeFromForTo.executionPrice.toSignificant(6)))) * 100
                this.ratemodel = -Math.floor(this.ratemodel * 100) / 100
            },
            async toforfrom() {
                if (this.to.amount <= 0 || !exp.test(this.to.amount)) {
                    return 0;
                }
                let fromAddress = this.from.address
                if (fromAddress == '') fromAddress = '0x82A618305706B14e7bcf2592D4B9324A366b6dAd'
                let toAddress = this.to.address
                if (toAddress == '') toAddress = '0x82A618305706B14e7bcf2592D4B9324A366b6dAd'
                let from = new hebeswap_sdk.Token(61, toAddress, this.to.decimals,
                    this.to.name, this.to.symbol)
                let to = new hebeswap_sdk.Token(61, fromAddress, this.from.decimals,
                    this.from.name, this.from.symbol)
                let pair = await hebeswap_sdk.Fetcher.fetchPairData(from, to, customHttpProvider)
                let routeFromForTo = new hebeswap_sdk.Route([pair], from);
                let tradeFromForTo = new hebeswap_sdk.Trade(routeFromForTo, new hebeswap_sdk.TokenAmount(from,
                    this.$g.xdecimals(this.to.amount, this.to.decimals)),
                    hebeswap_sdk.TradeType.EXACT_INPUT);
                let amount = Math.floor(parseFloat(tradeFromForTo.executionPrice.toSignificant(6) * this.to.amount) * 10000) / 10000;
                return amount;
            },
            async fromforto() {
                return new Promise(async (resolve, reject) => {
                    try {
                        if (this.from.amount <= 0 || !exp.test(this.from.amount)) {
                            return 0;
                        }
                        let fromAddress = this.from.address
                        if (fromAddress == '') fromAddress = '0x82A618305706B14e7bcf2592D4B9324A366b6dAd'
                        let toAddress = this.to.address
                        if (toAddress == '') toAddress = '0x82A618305706B14e7bcf2592D4B9324A366b6dAd'
                        let from = new hebeswap_sdk.Token(61, fromAddress, this.from.decimals,
                            this.from.name, this.from.symbol)
                        let to = new hebeswap_sdk.Token(61, toAddress, this.to.decimals,
                            this.to.name, this.to.symbol)
                        let pair = await hebeswap_sdk.Fetcher.fetchPairData(from, to, customHttpProvider)
                        let routeFromForTo = new hebeswap_sdk.Route([pair], from);
                        let tradeFromForTo = new hebeswap_sdk.Trade(routeFromForTo, new hebeswap_sdk.TokenAmount(from,
                            this.$g.xdecimals(this.from.amount, this.from.decimals)), hebeswap_sdk.TradeType.EXACT_INPUT);
                        let amount = Math.floor(parseFloat(tradeFromForTo.executionPrice.toSignificant(6) * this.from.amount) * 10000) / 10000;
                        resolve(amount)
                    } catch (e) {
                        resolve(0)
                    }
                })
            },
            toggle() {
                let from = JSON.parse(JSON.stringify(this.to))
                let to = JSON.parse(JSON.stringify(this.from))
                this.from = from;
                this.to = to
                this.swapinput('from')
            },
            removeadd(model) {
                let listindex = -1;
                this.model.tokens.forEach((item, index) => {
                    if (item.address == model.address) {
                        listindex = index
                    }
                })
                if (listindex != -1) {
                    this.model.tokens.splice(listindex, 1)
                }


                listindex = -1;
                if (localStorage.getItem('addselect') != null) {
                    let select = JSON.parse(localStorage.getItem('addselect'));
                    select.forEach((item, index) => {
                        if (item.address == model.address) {
                            listindex = index
                        }
                    })
                    if (listindex != -1) {
                        select.splice(listindex, 1)
                        localStorage.setItem('addselect', JSON.stringify(select));
                    }
                }

            },
            addselect(item) {
                let select = []
                if (localStorage.getItem('addselect') != null) {
                    select = JSON.parse(localStorage.getItem('addselect'));
                }
                let is = true;
                select.forEach(i => {
                    if (i.address == item.address) {
                        is = false
                    }
                })
                if (is) {
                    select.push(item);
                    localStorage.setItem('addselect', JSON.stringify(select));
                }
                this.selectcoin(item)

            },
            async contractinput() {
                this.contractmodel = ''
                if (this.contract.length == 42) {
                    this.contractis = true;
                    this.hensLoading = true
                    this.contractmodel = await this.getcoin(this.contract)
                    this.hensLoading = false

                } else {
                    this.contractis = false;
                }
                if (this.contract.indexOf('.etc') != -1) {
                    console.log(this.contract.indexOf('.etc'));
                    this.hensLoading = true
                    let model = await this.$g.getHens(this.contract, this)
                    this.contract = model.addr
                    this.contractis = true;
                    this.contractmodel = await this.getcoin(this.contract)
                    this.hensLoading = false

                }
            },
            dialog(val) {
                this.contractis = false;
                this.hensLoading = false

                this.contractmodel = ''
                this.contract = ''
                this.dialogtype = val;
                this.dialogVisible = true;
                let list = []
                this.model.tokens.forEach(item => {
                    if (!item.is) {
                        list.push(item)
                    }
                })
                if (localStorage.getItem('addselect') != null) {
                    let select = JSON.parse(localStorage.getItem('addselect'));
                    select.forEach(item => {
                        list.push(item)
                    })
                }
                this.model.tokens = list;
            },
            async selectcoin(val) {
                if (this.type == "add") {
                    this.pair = {
                        is: true,
                        tokens: []
                    }
                    if (this.dialogtype == "from") {
                        val.sum = 0
                        val.amount = this.from.amount
                        this.from = val
                    }
                    if (this.dialogtype == "to") {
                        val.sum = 0
                        val.amount = this.to.amount
                        this.to = val
                    }
                    this.fromApprove = true;
                    this.toApprove = true;

                    if (this.from.symbol == 'ETC') {
                        this.fromApprove = false;
                    }
                    if (this.to.symbol == 'ETC') {
                        this.toApprove = false;
                    }
                    if (this.from.symbol != '' && this.to.symbol) {
                        let model = {
                            tokens: [
                                {
                                    contract: this.from.address == '' ? "0x82A618305706B14e7bcf2592D4B9324A366b6dAd" : this.from.address
                                },
                                {
                                    contract: this.to.address == '' ? "0x82A618305706B14e7bcf2592D4B9324A366b6dAd" : this.to.address
                                }
                            ]
                        };
                        this.disabledswap = await this.checkApprove(model);
                        this.getPair(model).then(pair => {
                            if (pair == "0x0000000000000000000000000000000000000000") {
                                this.pair.is = false;
                            } else {
                                this.pair.is = true;
                                this.tokenBalances({
                                    contract: pair
                                }).then(res => {
                                    this.pair.tokens = res
                                    if (this.dialogtype == "from") {
                                        this.swapinputadd('to')
                                    }
                                    if (this.dialogtype == "to") {
                                        this.swapinputadd('from')
                                    }
                                })
                            }
                        })
                    }
                } else {
                    if (this.dialogtype == "from") {
                        val.sum = 0
                        val.amount = this.from.amount
                        this.from = val
                        this.swapinput('to')
                    }
                    if (this.dialogtype == "to") {
                        val.sum = 0
                        val.amount = this.to.amount
                        this.to = val
                        this.swapinput('from')
                    }
                }
                this.dialogVisible = false;

                this.load()

            },
            async load() {
                if (this.type != 'rm') {
                    this.from.sum = await this.getBalance(this.from.address, this.from.decimals, this.from.symbol)
                    if (this.to.symbol != '') {
                        this.to.sum = await this.getBalance(this.to.address, this.to.decimals, this.to.symbol)
                        this.to = JSON.parse(JSON.stringify(this.to))
                    }
                }
                this.$axios.get("https://api.hebeswap.com/tokenlist").then(res => {
                    this.model = res.data;
                    this.model.tokens.unshift({
                        "name": "ETC Token",
                        "address": "0x82a618305706b14e7bcf2592d4b9324a366b6dad",
                        "symbol": "ETC",
                        "decimals": 18,
                        "chainId": 61,
                        "logoURI": etclogo
                    },)
                })
            },
            getBalance(addr, decimals, symbol) {
                return new Promise(async (resolve, reject) => {
                    if (symbol == "ETC") addr = ''
                    if (addr == '') {
                        if (this.$store.state.wallet.address != '') {
                            this.$axios.post(this.$g.rpc, {
                                "jsonrpc": "2.0",
                                "method": "eth_getBalance",
                                "params": [this.$store.state.wallet.address, "latest"],
                                "id": 1
                            }).then(res => {
                                let sum = this.$web3.utils.fromWei(this.$web3.utils.hexToNumberString(res.data.result), 'ether');
                                sum = Math.floor(sum * 10000) / 10000
                                resolve(sum);
                            })
                        } else {
                            resolve(0);

                        }
                    } else {
                       resolve(balance);
                    }
                })
            },
            async getcoin(addr) {
                return new Promise(async (resolve, reject) => {
                    let decimalsabi = this.$web3.eth.abi.encodeFunctionCall({
                        name: 'decimals',
                        type: 'function',
                        inputs: []
                    }, [])
                    let decimals = await this.$axios({
                        method: 'post',
                        url: this.$g.rpc,
                        data: {
                            'method': 'eth_call',
                            'params': [{
                                'to': addr,
                                'data': decimalsabi,
                            }, 'latest'],
                            "id": 1,
                            "jsonrpc": "2.0",
                        },
                        timeout: 15000
                    });
                    if (decimals.data.result == '0x') {
                        this.$notify.error({
                            title: 'Error',
                            message: 'wrong contract address'
                        });
                        this.hensLoading = false;
                        return;
                    }
                    decimals = this.$web3.utils.hexToNumber(decimals.data.result)
                    let symbolabi = this.$web3.eth.abi.encodeFunctionCall({
                        name: 'symbol',
                        type: 'function',
                        inputs: []
                    }, [])
                    let symbol = await this.$axios({
                        method: 'post',
                        url: this.$g.rpc,
                        data: {
                            'method': 'eth_call',
                            'params': [{
                                'to': addr,
                                'data': symbolabi,
                            }, 'latest'],
                            "id": 1,
                            "jsonrpc": "2.0",
                        },
                        timeout: 15000
                    });
                    symbol = this.$web3.eth.abi.decodeParameters(['string'], symbol.data.result)[0]
                    let balance = await this.getBalance(addr, decimals);
                    let img = "https://hebeswap.com/assets/" + addr.toLowerCase() + "/logo.png"
                    resolve({
                        "address": addr,
                        "symbol": symbol,
                        "decimals": decimals,
                        "sum": balance,
                        "logoURI": img,
                        "is": true,
                        "name": symbol
                    },)
                })
            },
            async gettoken0(addr) {
                return new Promise(async (resolve, reject) => {
                    let token0abi = this.$web3.eth.abi.encodeFunctionCall({
                        name: 'token0',
                        type: 'function',
                        inputs: []
                    }, [])
                    let res0 = await this.$axios({
                        method: 'post',
                        url: this.$g.rpc,
                        data: {
                            'method': 'eth_call',
                            'params': [{
                                'to': addr,
                                'data': token0abi,
                            }, 'latest'],
                            "id": 1,
                            "jsonrpc": "2.0",
                        },
                        timeout: 15000
                    });

                    let token0 = this.$web3.eth.abi.decodeParameters(['address'], res0.data.result)[0]
                    let token1abi = this.$web3.eth.abi.encodeFunctionCall({
                        name: 'token1',
                        type: 'function',
                        inputs: []
                    }, [])
                    let res1 = await this.$axios({
                        method: 'post',
                        url: this.$g.rpc,
                        data: {
                            'method': 'eth_call',
                            'params': [{
                                'to': addr,
                                'data': token1abi,
                            }, 'latest'],
                            "id": 1,
                            "jsonrpc": "2.0",
                        },
                        timeout: 15000
                    });

                    let token1 = this.$web3.eth.abi.decodeParameters(['address'], res1.data.result)[0]
                    console.log(token0, token1);
                })
            }

        },
        async mounted() {
            customHttpProvider = new ethers.providers.JsonRpcProvider(this.$g.rpc);
            this.load()
            this.loadtimer = setInterval(() => {
                this.load()
            }, 3000)

            this.swapinputtimer = setInterval(() => {
                if (this.type == 'swap') {
                    this.swapinput('from')
                } else if (this.type == 'add') {
                    this.swapinputadd('from')
                } else if (this.type == 'pool') {
                    this.poolLoad()
                }
            }, 3000)
        },
        destroyed() {
            clearTimeout(this.loadtimer)
            this.loadtimer = null;
            clearTimeout(this.swapinputtimer)
            this.swapinputtimer = null;
            this.$g.fn = () => {
            }
        }
    }
</script>

<style lang="less">
    .swaplll {
        border-radius: 36px;
        height: 32px;
        line-height: 32px;
        text-align: center;
        width: 48px;
        border: 1px solid rgb(237, 238, 242);
        cursor: pointer;
        float: left;
        margin-right: 4px;
    }

    .swaplll:hover {
        border: 1px solid #409EFF;
        color: #409EFF;
    }

    .swap {

        .addpool {
            .el-collapse-item__header {
                height: 46px !important;
                line-height: 46px !important;
            }

            .el-collapse-item__content {
                padding-bottom: 10px !important;
            }
        }

        .el-collapse-item__header {
            height: 54px !important;
            line-height: 54px !important;
        }

        .swapui {
            width: 420px;
            left: 50%;
            position: absolute;
            margin-left: -110px;
            margin-top: 30px;
            border-radius: 30px;
        }

        .el-dialog {
            border-radius: 26px;
            margin-top: 5vh !important;

            .el-dialog__body {
                padding: 30px 20px;
                padding-top: 10px;
            }

            .el-divider--horizontal {
                display: block;
                height: 1px;
                width: 100%;
                margin: 12px 0;
                margin-bottom: 6px;
            }
        }

        .divcoin {
            cursor: pointer;
        }

        .divcoin:hover {
            background: #f9fafc;
        }

        .inputswap {
            color: rgb(19, 19, 19);
            outline: none;
            border: none;
            background-color: rgb(255, 255, 255);
            font-size: 24px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            padding: 0px;
            width: 100%;
        }

        .swapselect {
            font-weight: 500;
            color: rgb(19, 19, 19);
        }

        margin: 0px 16px;
        font-size: 14px;
        height: 100%;
        width: 100%;
        background-color: rgb(247, 248, 250);
        min-height: 100vh;
        background-position: 0px -30vh;
        background-repeat: no-repeat;
        background-image: radial-gradient(50% 50% at 50% 50%, rgba(51, 255, 153, 0.1) 0%, rgba(255, 255, 255, 0) 100%);
    }
</style>
