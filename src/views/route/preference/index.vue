<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="用户账号" prop="userId">
        <el-select v-model="queryParams.userId" placeholder="请选择用户账号" clearable filterable>
          <el-option
            v-for="item in userIdOptions"
            :key="item.user_id"
            :label="item.userName"
            :value="item.user_id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="偏好类型" prop="preferenceType">
        <el-select v-model="queryParams.preferenceType" placeholder="请选择偏好类型" clearable>
          <el-option
            v-for="dict in dict.type.route_preference_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="偏好键" prop="preferenceKey">
        <el-input
          v-model="queryParams.preferenceKey"
          placeholder="请输入偏好键"
          clearable
          @keyup.enter.native="handleQuery"
        />
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
          v-hasPermi="['route:preference:add']"
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
          v-hasPermi="['route:preference:edit']"
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
          v-hasPermi="['route:preference:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['route:preference:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="preferenceList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" align="center" prop="preferenceId" width="80" />
      <el-table-column label="用户" align="center" prop="userName" width="100" />
      <el-table-column label="偏好类型" align="center" prop="preferenceType" width="120">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.route_preference_type" :value="scope.row.preferenceType"/>
        </template>
      </el-table-column>
      <el-table-column label="偏好键" align="center" prop="preferenceKey" show-overflow-tooltip />
      <el-table-column label="偏好值" align="center" prop="preferenceValue" show-overflow-tooltip />
      <el-table-column label="偏好分数" align="center" prop="preferenceScore" width="100">
        <template slot-scope="scope">
          <el-rate v-model="scope.row.preferenceScore" disabled show-score text-color="#ff9900"></el-rate>
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
            v-hasPermi="['route:preference:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['route:preference:remove']"
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

    <!-- 添加或修改用户偏好对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="基本信息" name="basic">
            <el-form-item label="用户" prop="userId">
              <el-select v-model="form.userId" placeholder="请选择用户" clearable filterable>
                <el-option
                  v-for="item in userIdOptions"
                  :key="item.user_id"
                  :label="item.userName"
                  :value="item.user_id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="偏好类型" prop="preferenceType">
              <el-select v-model="form.preferenceType" placeholder="请选择偏好类型">
                <el-option
                  v-for="dict in dict.type.route_preference_type"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="偏好键" prop="preferenceKey">
              <el-input v-model="form.preferenceKey" placeholder="请输入偏好键" />
            </el-form-item>
            <el-form-item label="偏好分数" prop="preferenceScore">
              <el-rate v-model="form.preferenceScore" show-score text-color="#ff9900"></el-rate>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="偏好值" name="value">
            <el-form-item label="偏好值" prop="preferenceValue">
              <el-input v-model="form.preferenceValue" type="textarea" :rows="8" placeholder="请输入偏好值（JSON格式）" />
              <div class="json-tip">
                <el-button size="mini" type="text" @click="formatPreferenceValue">格式化JSON</el-button>
                <span class="tip-text">请输入有效的JSON格式数据</span>
              </div>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="其他信息" name="other">
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

    <!-- 查看偏好详情对话框 -->
    <el-dialog title="偏好详情" :visible.sync="detailOpen" width="600px" append-to-body>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="偏好ID">{{ detailData.preferenceId }}</el-descriptions-item>
        <el-descriptions-item label="用户">{{ detailData.userName }}</el-descriptions-item>
        <el-descriptions-item label="偏好类型">
          <dict-tag :options="dict.type.route_preference_type" :value="detailData.preferenceType"/>
        </el-descriptions-item>
        <el-descriptions-item label="偏好键">{{ detailData.preferenceKey }}</el-descriptions-item>
        <el-descriptions-item label="偏好值" :span="2">
          <pre>{{ formatJson(detailData.preferenceValue) }}</pre>
        </el-descriptions-item>
        <el-descriptions-item label="偏好分数" :span="2">
          <el-rate v-model="detailData.preferenceScore" disabled show-score text-color="#ff9900"></el-rate>
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
import { listPreference, getPreference, delPreference, addPreference, updatePreference, getUserIdOptions } from "@/api/route/preference"

export default {
  name: "Preference",
  dicts: ['route_preference_type'],
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
      // 用户偏好表格数据
      preferenceList: [],
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
        userId: null,
        preferenceType: null,
        preferenceKey: null,
        preferenceValue: null,
        preferenceScore: null,
      },
      // 表单参数
      form: {},
      // 用户ID（关联sys_user.user_id）（关联用户信息表）选项列表
      userIdOptions: [],
      // 表单校验
      rules: {
        userId: [
          { required: true, message: "用户ID不能为空", trigger: "change" }
        ],
        preferenceType: [
          { required: true, message: "偏好类型不能为空", trigger: "change" }
        ],
        preferenceKey: [
          { required: true, message: "偏好键不能为空", trigger: "blur" }
        ],
      }
    }
  },
  created() {
    this.getList()
    this.getUserIdOptions()
  },
  methods: {
    /** 查询用户偏好列表 */
    getList() {
      this.loading = true
      listPreference(this.queryParams).then(response => {
        this.preferenceList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    /** 查询用户ID（关联sys_user.user_id）（关联用户信息表）选项列表 */
    getUserIdOptions() {
      getUserIdOptions().then(response => {
        this.userIdOptions = response.data || []
      }).catch(error => {
        console.error('获取用户ID（关联sys_user.user_id）（关联用户信息表）选项失败：', error)
        this.userIdOptions = []
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
        preferenceId: null,
        userId: null,
        preferenceType: null,
        preferenceKey: null,
        preferenceValue: null,
        preferenceScore: null,
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
      this.ids = selection.map(item => item.preferenceId)
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
      this.title = "添加用户偏好"
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      this.activeTab = 'basic'
      const preferenceId = row.preferenceId || this.ids
      getPreference(preferenceId).then(response => {
        this.form = response.data
        this.open = true
        this.title = "修改用户偏好"
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.preferenceId != null) {
            updatePreference(this.form).then(response => {
              this.$modal.msgSuccess("修改成功")
              this.open = false
              this.getList()
            })
          } else {
            addPreference(this.form).then(response => {
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
      const preferenceIds = row.preferenceId || this.ids
      this.$modal.confirm('是否确认删除用户偏好编号为"' + preferenceIds + '"的数据项？').then(function() {
        return delPreference(preferenceIds)
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
    /** 格式化偏好值 */
    formatPreferenceValue() {
      this.form.preferenceValue = this.formatJson(this.form.preferenceValue)
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('route/preference/export', {
        ...this.queryParams
      }, `preference_${new Date().getTime()}.xlsx`)
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
