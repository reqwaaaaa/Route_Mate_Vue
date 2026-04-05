<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="统计类型" prop="statType">
        <el-select v-model="queryParams.statType" placeholder="请选择统计类型" clearable>
          <el-option
            v-for="dict in dict.type.route_stat_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="统计键" prop="statKey">
        <el-input
          v-model="queryParams.statKey"
          placeholder="请输入统计键"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="统计日期" prop="statDate">
        <el-date-picker clearable
          v-model="queryParams.statDate"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="请选择统计日期">
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['route:summary:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['route:summary:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['route:summary:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['route:summary:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="summaryList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" align="center" prop="statId" width="80" />
      <el-table-column label="统计类型" align="center" prop="statType" width="120">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.route_stat_type" :value="scope.row.statType"/>
        </template>
      </el-table-column>
      <el-table-column label="统计键" align="center" prop="statKey" show-overflow-tooltip />
      <el-table-column label="统计值" align="center" prop="statValue" show-overflow-tooltip />
      <el-table-column label="统计数量" align="center" prop="statCount" width="100" />
      <el-table-column label="统计日期" align="center" prop="statDate" width="100">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.statDate, '{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="统计周期" align="center" prop="statPeriod" width="100">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.route_stat_period" :value="scope.row.statPeriod"/>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="200">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-view"
            @click="handleDetail(scope.row)"
          >详情</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['route:summary:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['route:summary:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改统计数据对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="基本信息" name="basic">
            <el-form-item label="统计类型" prop="statType">
              <el-select v-model="form.statType" placeholder="请选择统计类型">
                <el-option
                  v-for="dict in dict.type.route_stat_type"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="统计键" prop="statKey">
              <el-input v-model="form.statKey" placeholder="请输入统计键" />
            </el-form-item>
            <el-form-item label="统计值" prop="statValue">
              <el-input v-model="form.statValue" placeholder="请输入统计值" />
            </el-form-item>
            <el-form-item label="统计数量" prop="statCount">
              <el-input v-model="form.statCount" placeholder="请输入统计数量" />
            </el-form-item>
            <el-form-item label="统计日期" prop="statDate">
              <el-date-picker clearable
                v-model="form.statDate"
                type="date"
                value-format="yyyy-MM-dd"
                placeholder="请选择统计日期">
              </el-date-picker>
            </el-form-item>
            <el-form-item label="统计周期" prop="statPeriod">
              <el-select v-model="form.statPeriod" placeholder="请选择统计周期">
                <el-option
                  v-for="dict in dict.type.route_stat_period"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="扩展信息" name="extra">
            <el-form-item label="扩展数据" prop="extraData">
              <el-input v-model="form.extraData" type="textarea" :rows="8" placeholder="请输入扩展数据（JSON格式）" />
              <div class="json-tip">
                <el-button size="mini" type="text" @click="formatExtraData">格式化JSON</el-button>
                <span class="tip-text">请输入有效的JSON格式数据</span>
              </div>
            </el-form-item>
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
            </el-form-item>
          </el-tab-pane>
        </el-tabs>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 查看统计详情对话框 -->
    <el-dialog title="统计详情" :visible.sync="detailOpen" width="600px" append-to-body>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="统计ID">{{ detailData.statId }}</el-descriptions-item>
        <el-descriptions-item label="统计类型">
          <dict-tag :options="dict.type.route_stat_type" :value="detailData.statType"/>
        </el-descriptions-item>
        <el-descriptions-item label="统计键">{{ detailData.statKey }}</el-descriptions-item>
        <el-descriptions-item label="统计值">{{ detailData.statValue }}</el-descriptions-item>
        <el-descriptions-item label="统计数量">{{ detailData.statCount }}</el-descriptions-item>
        <el-descriptions-item label="统计日期">{{ parseTime(detailData.statDate, '{y}-{m}-{d}') }}</el-descriptions-item>
        <el-descriptions-item label="统计周期">
          <dict-tag :options="dict.type.route_stat_period" :value="detailData.statPeriod"/>
        </el-descriptions-item>
        <el-descriptions-item label="扩展数据" :span="2">
          <pre>{{ formatJson(detailData.extraData) }}</pre>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ parseTime(detailData.createTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ parseTime(detailData.updateTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ detailData.remark }}</el-descriptions-item>
      </el-descriptions>
      <div slot="footer" class="dialog-footer">
        <el-button @click="detailOpen = false">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listSummary, getSummary, delSummary, addSummary, updateSummary } from "@/api/route/summary"

export default {
  name: "Summary",
  dicts: ['route_stat_period', 'route_stat_type'],
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 统计数据表格数据
      summaryList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 当前激活的tab
      activeTab: 'basic',
      // 详情弹框是否显示
      detailOpen: false,
      // 详情数据
      detailData: {},
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        statType: null,
        statKey: null,
        statValue: null,
        statCount: null,
        statDate: null,
        statPeriod: null,
        extraData: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        statType: [
          { required: true, message: "统计类型不能为空", trigger: "change" }
        ],
        statKey: [
          { required: true, message: "统计键不能为空", trigger: "blur" }
        ],
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询统计数据列表 */
    getList() {
      this.loading = true
      listSummary(this.queryParams).then(response => {
        this.summaryList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {
        statId: null,
        statType: null,
        statKey: null,
        statValue: null,
        statCount: null,
        statDate: null,
        statPeriod: null,
        extraData: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null,
        remark: null
      }
      this.resetForm("form")
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm")
      this.handleQuery()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.statId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 查看详情按钮操作 */
    handleDetail(row) {
      this.detailData = row
      this.detailOpen = true
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.activeTab = 'basic'
      this.open = true
      this.title = "添加统计数据"
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      this.activeTab = 'basic'
      const statId = row.statId || this.ids
      getSummary(statId).then(response => {
        this.form = response.data
        this.open = true
        this.title = "修改统计数据"
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.statId != null) {
            updateSummary(this.form).then(response => {
              this.$modal.msgSuccess("修改成功")
              this.open = false
              this.getList()
            })
          } else {
            addSummary(this.form).then(response => {
              this.$modal.msgSuccess("新增成功")
              this.open = false
              this.getList()
            })
          }
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const statIds = row.statId || this.ids
      this.$modal.confirm('是否确认删除统计数据编号为"' + statIds + '"的数据项？').then(function() {
        return delSummary(statIds)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess("删除成功")
      }).catch(() => {})
    },
    /** 格式化JSON数据 */
    formatJson(jsonStr) {
      if (!jsonStr) return ''
      try {
        return JSON.stringify(JSON.parse(jsonStr), null, 2)
      } catch (e) {
        return jsonStr
      }
    },
    /** 格式化扩展数据 */
    formatExtraData() {
      this.form.extraData = this.formatJson(this.form.extraData)
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('route/summary/export', {
        ...this.queryParams
      }, `summary_${new Date().getTime()}.xlsx`)
    }
  }
}
</script>

<style scoped>
.json-tip {
  margin-top: 5px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tip-text {
  color: #909399;
  font-size: 12px;
}

pre {
  background-color: #f5f7fa;
  padding: 10px;
  border-radius: 4px;
  font-size: 12px;
  max-height: 200px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
