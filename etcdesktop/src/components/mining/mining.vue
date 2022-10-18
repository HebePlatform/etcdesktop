<template>
  <div class="panel-wallet" style="margin:0px 16px">
    <div class="table_list" style="border-radius: 8px;background: #fff;padding: 10px;margin-top: 12px">
      <div v-if="$store.state.ismint">
        <el-form :label-position="'left'">
          <el-row :gutter="20" style="margin-top: 12px">
            <el-col :span="9" :offset="2">
              <el-form-item label="Mining algorithm">
                <el-input v-model="form.algorithm"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="9" :offset="2">
              <el-form-item label="Receiving address">
                <el-input v-model="form.addr"></el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20" style="margin-top: 12px">
            <el-col :span="9" :offset="2">
              <el-form-item label="Server Select" prop="region">
                <el-cascader v-model="serverModel" @change="serverFn" :filterable="true"
                             placeholder="Server Select" style="width: 100%" :options="options"
                             :show-all-levels="false">
                  <template slot="empty">
                    No matching data
                  </template>
                </el-cascader>
              </el-form-item>
            </el-col>
            <el-col :span="9" :offset="2">
              <el-form-item label="Worker Name">
                <el-input v-model="form.name"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20" style="margin-top: 12px">
            <el-col :span="9" :offset="2">
              <el-form-item label="Network Type" prop="region">
                <el-select v-model="form.network" style="width: 100%" placeholder="Network Type">
                  <el-option label="SSL" value="ssl"></el-option>
                  <el-option label="TCP" value="tcp"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="9" :offset="2">
              <el-form-item label="Server">
                <el-input v-model="form.server"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20" style="margin-top: 12px">
            <el-col :span="9" :offset="2">
              <el-form-item label="Sponsor（ % ）">
                <el-input-number style="width: 100%" v-model="form.sponsor" :min="1" :max="100">
                </el-input-number>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <div style="text-align: center;margin-top: 20px;margin-bottom: 20px">
          <el-button @click="startfn" type="primary" plain>Start Mining</el-button>
        </div>
      </div>
      <section v-if="!$store.state.ismint">
        <el-button @click="stopfn" type="warning" style="margin-bottom: 10px">Stop Mining</el-button>

        <!--                <el-descriptions direction="vertical" :column="4" border>-->
        <!--                    <el-descriptions-item label="Miner">{{state.miner}}</el-descriptions-item>-->
        <!--                    <el-descriptions-item label="Status">-->
        <!--                        <span v-if="state.devices[0]&&state.devices[0].speed">Online</span>-->
        <!--                        <span v-if="!state.devices[0]||!state.devices[0].speed">Connect</span>-->
        <!--                    </el-descriptions-item>-->
        <!--                    <el-descriptions-item label="Algorithm">-->
        <!--                        {{state.algorithm}}-->
        <!--                    </el-descriptions-item>-->
        <!--                    <el-descriptions-item label="Pool Hashrate">-->
        <!--                        "" H/s-->
        <!--                    </el-descriptions-item>-->
        <!--                    <el-descriptions-item label="Server">-->
        <!--                        {{state.server}}-->
        <!--                    </el-descriptions-item>-->
        <!--                    <el-descriptions-item label="User">-->
        <!--                        {{state.user}}-->
        <!--                    </el-descriptions-item>-->
        <!--                    <el-descriptions-item label="Shares/Minute">-->
        <!--                        0.0-->
        <!--                    </el-descriptions-item>-->
        <!--                    <el-descriptions-item label="Electricity">-->
        <!--                        {{state.electricity}} kWh-->
        <!--                    </el-descriptions-item>-->


        <!--                </el-descriptions>-->

        <!--                <el-descriptions v-for="item in state.devices" style="margin-top: 20px" direction="vertical"-->
        <!--                                 :column="10" border>-->
        <!--                    <el-descriptions-item label="ID">{{item.gpu_id}}</el-descriptions-item>-->
        <!--                    <el-descriptions-item label="GPU">{{item.name}}</el-descriptions-item>-->
        <!--                    <el-descriptions-item label="Fan">{{item.fan}} %</el-descriptions-item>-->
        <!--                    <el-descriptions-item label="Temperature">{{item.temperature}} C</el-descriptions-item>-->
        <!--                    <el-descriptions-item label="Speed">{{(item.speed/1000000).toFixed(2)}} MH/S</el-descriptions-item>-->
        <!--                    <el-descriptions-item label="Shares">{{item.stale_shares}} / {{item.rejected_shares}} /-->
        <!--                        {{item.stale_shares}} / {{item.invalid_shares}}-->
        <!--                    </el-descriptions-item>-->
        <!--                    <el-descriptions-item label="Core">{{item.core_clock}}</el-descriptions-item>-->
        <!--                    <el-descriptions-item label="Memory">{{item.memory_clock}}</el-descriptions-item>-->
        <!--                    <el-descriptions-item label="Power">{{item.power_usage}} W</el-descriptions-item>-->
        <!--                    <el-descriptions-item label="Electricity">0</el-descriptions-item>-->
        <!--                </el-descriptions>-->
      </section>
    </div>
  </div>
</template>

<script>
const cmd = require('node-cmd')

export default {
  name: "mining",
  data() {
    return {
      options: [
        {
          value: 'ASIA',
          label: 'ASIA',
          children: [{
            value: 'ssl://hk.crazypool.org:7777',
            label: 'ssl://hk.crazypool.org:7777'
          }, {
            value: 'tcp://hk.crazypool.org:7000',
            label: 'tcp://hk.crazypool.org:7000'
          }, {
            value: 'ssl://asia.crazypool.org:7777',
            label: 'ssl://asia.crazypool.org:7777'
          }, {
            value: 'tcp://asia.crazypool.org:7000',
            label: 'tcp://asia.crazypool.org:7000'
          }]
        },
        {
          value: 'EUROPE',
          label: 'EUROPE',
          children: [{
            value: 'ssl://eu.crazypool.org:7777',
            label: 'ssl://eu.crazypool.org:7777'
          }, {
            value: 'tcp://eu.crazypool.org:7000',
            label: 'tcp://eu.crazypool.org:7000'
          }]
        },
        {
          value: 'USA',
          label: 'USA',
          children: [{
            value: 'ssl://us.crazypool.org:7777',
            label: 'ssl://us.crazypool.org:7777'
          }, {
            value: 'tcp://us.crazypool.org:7000',
            label: 'tcp://us.crazypool.org:7000'
          }]
        },
        {
          value: 'BRAZIL',
          label: 'BRAZIL',
          children: [{
            value: 'ssl://br.crazypool.org:7777',
            label: 'ssl://br.crazypool.org:7777'
          }, {
            value: 'tcp://br.crazypool.org:7000',
            label: 'tcp://br.crazypool.org:7000'
          }]
        },
        {
          value: 'AUSTRALIA',
          label: 'AUSTRALIA',
          children: [{
            value: 'ssl://au.crazypool.org:7777',
            label: 'ssl://au.crazypool.org:7777'
          }, {
            value: 'tcp://au.crazypool.org:7000',
            label: 'tcp://au.crazypool.org:7000'
          }]
        }
      ],
      form: {
        algorithm: "etchash",
        addr: '',
        name: "EtcDestop",
        server: 'hk.crazypool.org:7777',
        network: 'ssl',
        sponsor: 1
      },
      serverModel: '',
      state: {
        "miner": "GMiner 3.06",
        "uptime": 49,
        "server": "ssl://hk.crazypool.org:7777",
        "user": "0xA5a52D92ff302fCca9e5b060EC797F01311c66fF.hebe.Worker",
        "extended_share_info": true,
        "shares_per_minute": 0.00,
        "pool_speed": 0,
        "algorithm": "Etchash",
        "electricity": 0.002,
        "total_accepted_shares": 0,
        "total_rejected_shares": 0,
        "total_stale_shares": 0,
        "total_invalid_shares": 0,
        "devices": [{
          "gpu_id": 0,
          "bus_id": "0000:03:00.0",
          "name": "3060",
          "speed": 40707234,
          "accepted_shares": 0,
          "rejected_shares": 0,
          "stale_shares": 0,
          "invalid_shares": 0,
          "fan": 51,
          "temperature": 66,
          "temperature_limit": 90,
          "memory_temperature": 0,
          "memory_temperature_limit": 120,
          "core_clock": 1897,
          "memory_clock": 7300,
          "power_usage": 143
        }],
        "speed_rate_precision": 0,
        "speed_unit": "H/s",
        "power_unit": "H/W"
      }
    }
  },
  methods: {
    startfn() {
      if (this.form.algorithm.trim() == '' ||
          this.form.network.trim() == '' ||
          this.form.algorithm.trim() == '' ||
          this.form.server.trim() == '' ||
          this.form.addr.trim() == '' ||
          this.form.name.trim() == ''
      ) {
        this.$alert('Wrong Configure', '', {
          confirmButtonText: 'Ok',
        });
        return;
      }
      let txt = " --algo " + this.form.algorithm + " ";
      if (this.form.network == "ssl") {
        txt = txt + "--ssl 1 --server " + this.form.server + " --user " + this.form.addr + "." + this.form.name + " --proto stratum"
        txt = txt + " --maintenance_ssl 1 --maintenance_server " + this.form.server + " --maintenance_user 0xa686fA19a1Dadf79743e195dfD7CF044D34e2728.hebe --maintenance_fee " + this.form.sponsor + " --api 10050"
      } else {
        txt = txt + "--server " + this.form.server + " --user " + this.form.addr + "." + this.form.name + " --proto stratum"
        txt = txt + " --maintenance_server " + this.form.server + " --maintenance_user 0xa686fA19a1Dadf79743e195dfD7CF044D34e2728.hebe --maintenance_fee " + this.form.sponsor + " --api 10050"
      }
      this.$store.state.ismint = false;
      // console.log(`resources\\app\\gminer\\miner.exe` + txt);
      let _this = this;
      cmd.run(`resources\\app\\gminer\\miner.exe` + txt,
          function (err, data, stderr) {
            if (err) {
              console.log(err, 'err');
            }
            console.log(data, "data");
            console.log(stderr, 'stderr');
          }
      );
      setTimeout(()=>{
        window.open("http://127.0.0.1:10050/")
      },10000)
    },
    stopfn() {
      this.$store.state.ismint = true;
      cmd.runSync(`taskkill /f /im miner.exe`,
          function (err, data, stderr) {
          }
      );
    },
    serverFn() {
      if (this.serverModel[1].indexOf("ssl://") == 0) {
        this.form.network = "ssl"
        this.form.server = this.serverModel[1].split("ssl://")[1]
      }
      if (this.serverModel[1].indexOf("tcp://") == 0) {
        this.form.network = "tcp"
        this.form.server = this.serverModel[1].split("tcp://")[1]
      }
    }
  },
  mounted() {
    this.form.addr = this.$store.state.wallet.address;
    this.$axios.get("http://127.0.0.1:10050/stat").then(res => {
      console.log(res);
    })
  }
}
</script>

<style scoped>

</style>
