<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="任务名称" prop="taskName">
        <el-input
          v-model="queryParams.taskName"
          placeholder="请输入任务名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
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
      <el-form-item label="任务状态" prop="taskStatus">
        <el-select v-model="queryParams.taskStatus" placeholder="请选择状态" clearable>
          <el-option
            v-for="dict in dict.type.route_task_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
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
          v-hasPermi="['route:task:add']"
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
          v-hasPermi="['route:task:edit']"
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
          v-hasPermi="['route:task:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['route:task:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="taskList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" align="center" prop="taskId"show-overflow-tooltip />
      <el-table-column label="任务名称" align="center" prop="taskName" show-overflow-tooltip />
      <el-table-column label="用户" align="center" prop="userName"/>
      <el-table-column label="算法类型" align="center" prop="algorithmType">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.route_analysis_algorithm" :value="scope.row.algorithmType"/>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="taskStatus">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.route_task_status" :value="scope.row.taskStatus"/>
        </template>
      </el-table-column>
      <el-table-column label="进度" align="center" prop="progressPercent">
        <template slot-scope="scope">
          <el-progress :percentage="scope.row.progressPercent || 0" :color="getProgressColor(scope.row.progressPercent)"></el-progress>
        </template>
      </el-table-column>
      <el-table-column label="开始时间" align="center" prop="startTime">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.startTime, '{m}-{d}') }}</span>
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
            v-hasPermi="['route:task:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['route:task:remove']"
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

    <!-- 添加或修改分析任务对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="900px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="基本信息" name="basic">
            <el-form-item label="任务名称" prop="taskName">
              <el-input v-model="form.taskName" placeholder="请输入任务名称" />
            </el-form-item>
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
            <el-form-item label="轨迹" prop="trajectoryId">
              <el-select v-model="form.trajectoryId" placeholder="请选择轨迹" clearable filterable>
                <el-option
                  v-for="item in trajectoryIdOptions"
                  :key="item.trajectory_id"
                  :label="item.trajectoryName"
                  :value="item.trajectory_id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="算法类型" prop="algorithmType">
              <el-select v-model="form.algorithmType" placeholder="请选择算法类型">
                <el-option
                  v-for="dict in dict.type.route_analysis_algorithm"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="任务状态" prop="taskStatus">
              <el-radio-group v-model="form.taskStatus">
                <el-radio
                  v-for="dict in dict.type.route_task_status"
                  :key="dict.value"
                  :label="dict.value"
                >{{dict.label}}</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="进度" prop="progressPercent">
              <el-slider v-model="form.progressPercent" :max="100" show-input></el-slider>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="时间信息" name="time">
            <el-form-item label="开始时间" prop="startTime">
              <el-date-picker clearable
                v-model="form.startTime"
                type="datetime"
                value-format="yyyy-MM-dd HH:mm:ss"
                placeholder="请选择开始时间">
              </el-date-picker>
            </el-form-item>
            <el-form-item label="结束时间" prop="endTime">
              <el-date-picker clearable
                v-model="form.endTime"
                type="datetime"
                value-format="yyyy-MM-dd HH:mm:ss"
                placeholder="请选择结束时间">
              </el-date-picker>
            </el-form-item>
            <el-form-item label="执行时长" prop="executionTime">
              <el-input v-model="form.executionTime" placeholder="请输入执行时长（秒）" />
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="数据配置" name="data">
            <el-form-item label="算法参数" prop="algorithmParams">
              <el-input v-model="form.algorithmParams" type="textarea" :rows="8" placeholder="请输入算法参数（JSON格式）" />
              <div class="json-tip">
                <el-button size="mini" type="text" @click="formatAlgorithmParams">格式化JSON</el-button>
                <span class="tip-text">请输入有效的JSON格式数据</span>
              </div>
            </el-form-item>
            <el-form-item label="结果数据" prop="resultData">
              <el-input v-model="form.resultData" type="textarea" :rows="8" placeholder="请输入结果数据（JSON格式）" readonly />
            </el-form-item>
            <el-form-item label="错误信息" prop="errorMessage">
              <el-input v-model="form.errorMessage" type="textarea" placeholder="请输入错误信息" />
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

    <!-- 查看任务详情对话框 -->
    <el-dialog title="任务详情" :visible.sync="detailOpen" width="900px" append-to-body>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="任务ID" :span="2">{{ detailData.taskId }}</el-descriptions-item>
        <el-descriptions-item label="任务名称">{{ detailData.taskName }}</el-descriptions-item>
        <el-descriptions-item label="用户">{{ detailData.userName }}</el-descriptions-item>
        <el-descriptions-item label="轨迹名称">{{ detailData.trajectoryName }}</el-descriptions-item>
        <el-descriptions-item label="起点">{{ detailData.startLocation }}</el-descriptions-item>
        <el-descriptions-item label="终点">{{ detailData.endLocation }}</el-descriptions-item>
        <el-descriptions-item label="算法类型">
          <dict-tag :options="dict.type.route_analysis_algorithm" :value="detailData.algorithmType"/>
        </el-descriptions-item>
        <el-descriptions-item label="任务状态">
          <dict-tag :options="dict.type.route_task_status" :value="detailData.taskStatus"/>
        </el-descriptions-item>
        <el-descriptions-item label="进度">
          <el-progress :percentage="detailData.progressPercent || 0" :color="getProgressColor(detailData.progressPercent)"></el-progress>
        </el-descriptions-item>
        <el-descriptions-item label="开始时间">{{ parseTime(detailData.startTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</el-descriptions-item>
        <el-descriptions-item label="结束时间">{{ parseTime(detailData.endTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</el-descriptions-item>
        <el-descriptions-item label="执行时长">{{ detailData.executionTime }}秒</el-descriptions-item>
        <el-descriptions-item label="算法参数" :span="2">
          <pre>{{ formatJson(detailData.algorithmParams) }}</pre>
        </el-descriptions-item>
        <el-descriptions-item label="结果数据" :span="2">
          <pre>{{ formatJson(detailData.resultData) }}</pre>
        </el-descriptions-item>
        <el-descriptions-item label="错误信息" :span="2">{{ detailData.errorMessage }}</el-descriptions-item>
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
import { listTask, getTask, delTask, addTask, updateTask, getUserIdOptions, getTrajectoryIdOptions } from "@/api/route/task"

export default {
  name: "Task",
  dicts: ['route_task_status', 'route_analysis_algorithm'],
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
      // 分析任务表格数据
      taskList: [],
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
        taskName: null,
        userId: null,
        trajectoryId: null,
        algorithmType: null,
        algorithmParams: null,
        taskStatus: null,
        progressPercent: null,
        startTime: null,
        endTime: null,
        resultData: null,
        errorMessage: null,
        executionTime: null,
      },
      // 表单参数
      form: {},
      // 用户ID（关联sys_user.user_id）（关联用户信息表）选项列表
      userIdOptions: [],
      // 轨迹ID（关联route_trajectory_info.trajectory_id）（关联出行轨迹信息表）选项列表
      trajectoryIdOptions: [],
      // 表单校验
      rules: {
        userId: [
          { required: true, message: "用户ID不能为空", trigger: "change" }
        ],
        trajectoryId: [
          { required: true, message: "轨迹ID不能为空", trigger: "change" }
        ],
        algorithmType: [
          { required: true, message: "算法类型不能为空", trigger: "change" }
        ],
      }
    }
  },
  created() {
    this.getList()
    this.getUserIdOptions()
    this.getTrajectoryIdOptions()
  },
  methods: {
    /** 查询分析任务列表 */
    getList() {
      this.loading = true
      listTask(this.queryParams).then(response => {
        this.taskList = response.rows
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
    /** 查询轨迹ID（关联route_trajectory_info.trajectory_id）（关联出行轨迹信息表）选项列表 */
    getTrajectoryIdOptions() {
      getTrajectoryIdOptions().then(response => {
        this.trajectoryIdOptions = response.data || []
      }).catch(error => {
        console.error('获取轨迹ID（关联route_trajectory_info.trajectory_id）（关联出行轨迹信息表）选项失败：', error)
        this.trajectoryIdOptions = []
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
        taskId: null,
        taskName: null,
        userId: null,
        trajectoryId: null,
        algorithmType: null,
        algorithmParams: null,
        taskStatus: null,
        progressPercent: null,
        startTime: null,
        endTime: null,
        resultData: null,
        errorMessage: null,
        executionTime: null,
        delFlag: null,
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
      this.ids = selection.map(item => item.taskId)
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
      this.title = "添加分析任务"
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      this.activeTab = 'basic'
      const taskId = row.taskId || this.ids
      getTask(taskId).then(response => {
        this.form = response.data
        this.open = true
        this.title = "修改分析任务"
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.taskId != null) {
            updateTask(this.form).then(response => {
              this.$modal.msgSuccess("修改成功")
              this.open = false
              this.getList()
            })
          } else {
            addTask(this.form).then(response => {
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
      const taskIds = row.taskId || this.ids
      this.$modal.confirm('是否确认删除分析任务编号为"' + taskIds + '"的数据项？').then(function() {
        return delTask(taskIds)
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
    /** 格式化算法参数 */
    formatAlgorithmParams() {
      this.form.algorithmParams = this.formatJson(this.form.algorithmParams)
    },
    /** 获取进度条颜色 */
    getProgressColor(percentage) {
      if (percentage < 30) return '#f56c6c'
      if (percentage < 70) return '#e6a23c'
      return '#67c23a'
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('route/task/export', {
        ...this.queryParams
      }, `task_${new Date().getTime()}.xlsx`)
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
