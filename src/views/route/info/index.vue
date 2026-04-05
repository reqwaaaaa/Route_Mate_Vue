<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="轨迹名称" prop="trajectoryName">
        <el-input
          v-model="queryParams.trajectoryName"
          placeholder="请输入轨迹名称"
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
      <el-form-item label="轨迹状态" prop="trajectoryStatus">
        <el-select v-model="queryParams.trajectoryStatus" placeholder="请选择状态" clearable>
          <el-option
            v-for="dict in dict.type.route_trajectory_status"
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
          v-hasPermi="['route:info:add']"
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
          v-hasPermi="['route:info:edit']"
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
          v-hasPermi="['route:info:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['route:info:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="infoList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" align="center" prop="trajectoryId" width="80" />
      <el-table-column label="轨迹名称" align="center" prop="trajectoryName" show-overflow-tooltip />
      <el-table-column label="用户" align="center" prop="userName" width="100" />
      <el-table-column label="起点" align="center" prop="startLocation" show-overflow-tooltip width="120" />
      <el-table-column label="终点" align="center" prop="endLocation" show-overflow-tooltip width="120" />
      <el-table-column label="距离" align="center" prop="totalDistance" width="80" />
      <el-table-column label="时长" align="center" prop="totalDuration" width="80" />
      <el-table-column label="状态" align="center" prop="trajectoryStatus" width="100">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.route_trajectory_status" :value="scope.row.trajectoryStatus"/>
        </template>
      </el-table-column>
      <el-table-column label="公开" align="center" prop="isPublic" width="80">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.route_is_public" :value="scope.row.isPublic"/>
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
            v-hasPermi="['route:info:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['route:info:remove']"
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

    <!-- 添加或修改出行轨迹信息对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="800px" append-to-body>
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
            <el-form-item label="轨迹名称" prop="trajectoryName">
              <el-input v-model="form.trajectoryName" placeholder="请输入轨迹名称" />
            </el-form-item>
            <el-form-item label="轨迹描述" prop="trajectoryDesc">
              <el-input v-model="form.trajectoryDesc" type="textarea" placeholder="请输入描述" />
            </el-form-item>
            <el-form-item label="轨迹状态" prop="trajectoryStatus">
              <el-radio-group v-model="form.trajectoryStatus">
                <el-radio
                  v-for="dict in dict.type.route_trajectory_status"
                  :key="dict.value"
                  :label="dict.value"
                >{{dict.label}}</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="是否公开" prop="isPublic">
              <el-radio-group v-model="form.isPublic">
                <el-radio
                  v-for="dict in dict.type.route_is_public"
                  :key="dict.value"
                  :label="dict.value"
                >{{dict.label}}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="位置信息" name="location">
            <el-form-item label="起点位置" prop="startLocation">
              <el-input v-model="form.startLocation" placeholder="请输入起点位置" />
            </el-form-item>
            <el-form-item label="终点位置" prop="endLocation">
              <el-input v-model="form.endLocation" placeholder="请输入终点位置" />
            </el-form-item>
            <el-form-item label="总距离" prop="totalDistance">
              <el-input v-model="form.totalDistance" placeholder="请输入总距离" />
            </el-form-item>
            <el-form-item label="总时长" prop="totalDuration">
              <el-input v-model="form.totalDuration" placeholder="请输入总时长" />
            </el-form-item>
            <el-form-item label="轨迹点数量" prop="pointCount">
              <el-input v-model="form.pointCount" placeholder="请输入点数量" />
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="轨迹数据" name="data">
            <el-form-item label="轨迹点数据" prop="trajectoryData">
              <div class="trajectory-editor">
                <div class="editor-toolbar">
                  <el-button size="mini" type="primary" @click="showTrajectoryPointEditor">
                    <i class="el-icon-edit"></i>
                    可视化编辑
                  </el-button>
                  <el-button size="mini" type="success" @click="formatTrajectoryData">
                    <i class="el-icon-refresh"></i>
                    格式化JSON
                  </el-button>
                  <el-button size="mini" type="info" @click="addSampleTrajectoryData">
                    <i class="el-icon-plus"></i>
                    添加示例数据
                  </el-button>
                </div>
                <el-input 
                  v-model="form.trajectoryData" 
                  type="textarea" 
                  :rows="8" 
                  placeholder="请输入轨迹点数据（JSON格式）" 
                  @input="validateTrajectoryData"
                />
                <div v-if="trajectoryDataError" class="error-message">
                  <i class="el-icon-warning"></i>
                  {{ trajectoryDataError }}
                </div>
              </div>
            </el-form-item>
            <el-form-item label="轨迹图片" prop="trajectoryImages">
              <el-input v-model="form.trajectoryImages" type="textarea" placeholder="请输入轨迹图片（逗号分隔的URL）" />
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

    <!-- 查看轨迹详情对话框 -->
    <el-dialog title="轨迹详情" :visible.sync="detailOpen" width="800px" append-to-body>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="轨迹ID">{{ detailData.trajectoryId }}</el-descriptions-item>
        <el-descriptions-item label="用户">{{ detailData.userName }}</el-descriptions-item>
        <el-descriptions-item label="轨迹名称" :span="2">{{ detailData.trajectoryName }}</el-descriptions-item>
        <el-descriptions-item label="轨迹描述" :span="2">{{ detailData.trajectoryDesc }}</el-descriptions-item>
        <el-descriptions-item label="起点位置">{{ detailData.startLocation }}</el-descriptions-item>
        <el-descriptions-item label="终点位置">{{ detailData.endLocation }}</el-descriptions-item>
        <el-descriptions-item label="总距离">{{ detailData.totalDistance }}</el-descriptions-item>
        <el-descriptions-item label="总时长">{{ detailData.totalDuration }}</el-descriptions-item>
        <el-descriptions-item label="轨迹点数量">{{ detailData.pointCount }}</el-descriptions-item>
        <el-descriptions-item label="轨迹状态">
          <dict-tag :options="dict.type.route_trajectory_status" :value="detailData.trajectoryStatus"/>
        </el-descriptions-item>
        <el-descriptions-item label="是否公开">
          <dict-tag :options="dict.type.route_is_public" :value="detailData.isPublic"/>
        </el-descriptions-item>
        <el-descriptions-item label="轨迹点数据" :span="2">
          <div class="trajectory-data-container">
            <div v-if="detailData.trajectoryData && parsedTrajectoryData.length > 0">
              <div class="trajectory-points">
                <div v-for="(point, index) in parsedTrajectoryData" :key="index" class="point-item">
                  <div class="point-header">
                    <span class="point-index">{{ index + 1 }}</span>
                    <span class="point-name" v-if="point.name">{{ point.name }}</span>
                    <span class="point-name" v-else>轨迹点 {{ index + 1 }}</span>
                  </div>
                  <div class="point-details">
                    <div class="point-coords">
                      <i class="el-icon-map-location"></i>
                      <span>{{ point.lat.toFixed(4) }}, {{ point.lng.toFixed(4) }}</span>
                    </div>
                    <div class="point-time">
                      <i class="el-icon-time"></i>
                      <span>{{ point.time }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <el-collapse v-if="parsedTrajectoryData.length > 5" class="raw-data-collapse">
                <el-collapse-item title="查看原始JSON数据" name="rawData">
                  <pre class="raw-json">{{ formatJson(detailData.trajectoryData) }}</pre>
                </el-collapse-item>
              </el-collapse>
            </div>
            <div v-else class="no-data">
              <i class="el-icon-warning"></i>
              暂无轨迹点数据
            </div>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="轨迹图片" :span="2">{{ detailData.trajectoryImages }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ parseTime(detailData.createTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ parseTime(detailData.updateTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ detailData.remark }}</el-descriptions-item>
      </el-descriptions>
      <div slot="footer" class="dialog-footer">
        <el-button @click="detailOpen = false">关 闭</el-button>
      </div>
    </el-dialog>

    <!-- 轨迹点数据可视化编辑对话框 -->
    <el-dialog title="轨迹点数据编辑" :visible.sync="showTrajectoryEditor" width="900px" append-to-body>
      <div class="trajectory-editor-dialog">
        <div class="editor-header">
          <span class="editor-title">轨迹点列表</span>
          <div class="editor-actions">
            <el-button size="mini" type="primary" @click="addTrajectoryPoint">
              <i class="el-icon-plus"></i>
              添加轨迹点
            </el-button>
            <el-button size="mini" type="success" @click="autoCalculateInfo">
              <i class="el-icon-refresh"></i>
              自动计算信息
            </el-button>
          </div>
        </div>
        
        <div class="trajectory-points-editor">
          <div class="points-list">
            <div v-for="(point, index) in editableTrajectoryPoints" :key="index" class="point-editor-item">
              <div class="point-editor-header">
                <span class="point-number">轨迹点 {{ index + 1 }}</span>
                <el-button size="mini" type="danger" @click="removeTrajectoryPoint(index)">
                  <i class="el-icon-delete"></i>
                  删除
                </el-button>
              </div>
              <div class="point-editor-content">
                <el-row :gutter="12">
                  <el-col :span="8">
                    <div class="form-label">地点名称</div>
                    <el-input v-model="point.name" placeholder="如：家、公司、商场等" size="small" />
                  </el-col>
                  <el-col :span="8">
                    <div class="form-label">纬度</div>
                    <el-input-number 
                      v-model="point.lat" 
                      :precision="6" 
                      :min="-90" 
                      :max="90"
                      placeholder="39.9042"
                      size="small"
                      style="width: 100%"
                    />
                  </el-col>
                  <el-col :span="8">
                    <div class="form-label">经度</div>
                    <el-input-number 
                      v-model="point.lng" 
                      :precision="6" 
                      :min="-180" 
                      :max="180"
                      placeholder="116.4074"
                      size="small"
                      style="width: 100%"
                    />
                  </el-col>
                </el-row>
                <el-row :gutter="12">
                  <el-col :span="24">
                    <div class="form-label">时间</div>
                    <el-date-picker
                      v-model="point.time"
                      type="datetime"
                      placeholder="选择时间"
                      format="yyyy-MM-dd HH:mm:ss"
                      value-format="yyyy-MM-dd HH:mm:ss"
                      size="small"
                      style="width: 100%"
                    />
                  </el-col>
                </el-row>
              </div>
            </div>
          </div>
        </div>
        
        <div class="editor-footer">
          <el-button @click="showTrajectoryEditor = false">取 消</el-button>
          <el-button type="primary" @click="saveTrajectoryPoints">保 存</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listInfo, getInfo, delInfo, addInfo, updateInfo, getUserIdOptions } from "@/api/route/info"

export default {
  name: "Info",
  dicts: ['route_trajectory_status', 'route_is_public', 'route_del_flag'],
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
      // 出行轨迹信息表格数据
      infoList: [],
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
      // 轨迹点编辑器
      showTrajectoryEditor: false,
      editableTrajectoryPoints: [],
      trajectoryDataError: '',
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        userId: null,
        trajectoryName: null,
        trajectoryDesc: null,
        startLocation: null,
        endLocation: null,
        totalDistance: null,
        totalDuration: null,
        pointCount: null,
        trajectoryData: null,
        trajectoryImages: null,
        trajectoryStatus: null,
        isPublic: null,
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
      }
    }
  },
  computed: {
    /** 解析轨迹点数据 */
    parsedTrajectoryData() {
      if (!this.detailData.trajectoryData) return []
      try {
        const data = typeof this.detailData.trajectoryData === 'string' 
          ? JSON.parse(this.detailData.trajectoryData) 
          : this.detailData.trajectoryData
        return Array.isArray(data) ? data : (data.points || [])
      } catch (e) {
        console.error('解析轨迹数据失败:', e)
        return []
      }
    }
  },
  created() {
    this.getList()
    this.getUserIdOptions()
  },
  methods: {
    /** 查询出行轨迹信息列表 */
    getList() {
      this.loading = true
      listInfo(this.queryParams).then(response => {
        this.infoList = response.rows
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
        trajectoryId: null,
        userId: null,
        trajectoryName: null,
        trajectoryDesc: null,
        startLocation: null,
        endLocation: null,
        totalDistance: null,
        totalDuration: null,
        pointCount: null,
        trajectoryData: null,
        trajectoryImages: null,
        trajectoryStatus: null,
        isPublic: null,
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
      this.ids = selection.map(item => item.trajectoryId)
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
      this.title = "添加出行轨迹信息"
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      this.activeTab = 'basic'
      const trajectoryId = row.trajectoryId || this.ids
      getInfo(trajectoryId).then(response => {
        this.form = response.data
        this.open = true
        this.title = "修改出行轨迹信息"
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.trajectoryId != null) {
            updateInfo(this.form).then(response => {
              this.$modal.msgSuccess("修改成功")
              this.open = false
              this.getList()
            })
          } else {
            addInfo(this.form).then(response => {
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
      const trajectoryIds = row.trajectoryId || this.ids
      this.$modal.confirm('是否确认删除出行轨迹信息编号为"' + trajectoryIds + '"的数据项？').then(function() {
        return delInfo(trajectoryIds)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess("删除成功")
      }).catch(() => {})
    },
    /** 获取时间范围 */
    getTimeRange() {
      const points = this.parsedTrajectoryData
      if (!points || points.length === 0) return '无数据'
      
      const times = points
        .map(p => p.time)
        .filter(time => time && time.trim() !== '')
        .map(time => new Date(time))
        .filter(date => !isNaN(date.getTime()))
      
      if (times.length === 0) return '无有效时间'
      
      const minTime = new Date(Math.min(...times))
      const maxTime = new Date(Math.max(...times))
      
      return `${this.parseTime(minTime, '{m}-{d} {h}:{i}')} - ${this.parseTime(maxTime, '{m}-{d} {h}:{i}')}`
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
    /** 验证轨迹数据 */
    validateTrajectoryData() {
      if (!this.form.trajectoryData) {
        this.trajectoryDataError = ''
        return
      }
      
      try {
        const data = JSON.parse(this.form.trajectoryData)
        if (Array.isArray(data) || (data.points && Array.isArray(data.points))) {
          this.trajectoryDataError = ''
        } else {
          this.trajectoryDataError = '轨迹数据格式错误，应为包含points数组的对象或数组格式'
        }
      } catch (e) {
        this.trajectoryDataError = 'JSON格式错误：' + e.message
      }
    },
    /** 格式化轨迹数据 */
    formatTrajectoryData() {
      if (!this.form.trajectoryData) return
      
      try {
        const data = JSON.parse(this.form.trajectoryData)
        this.form.trajectoryData = JSON.stringify(data, null, 2)
        this.trajectoryDataError = ''
      } catch (e) {
        this.$message.error('JSON格式错误，无法格式化')
      }
    },
    /** 添加示例轨迹数据 */
    addSampleTrajectoryData() {
      const sampleData = {
        points: [
          {
            lat: 39.9042,
            lng: 116.4074,
            time: "2026-03-30 07:00:00",
            name: "家"
          },
          {
            lat: 39.9125,
            lng: 116.3912,
            time: "2026-03-30 07:15:00",
            name: "朝阳公园"
          },
          {
            lat: 39.9289,
            lng: 116.3883,
            time: "2026-03-30 07:30:00",
            name: "三里屯"
          }
        ]
      }
      this.form.trajectoryData = JSON.stringify(sampleData, null, 2)
      this.validateTrajectoryData()
    },
    /** 显示轨迹点编辑器 */
    showTrajectoryPointEditor() {
      if (!this.form.trajectoryData) {
        this.editableTrajectoryPoints = []
      } else {
        try {
          const data = JSON.parse(this.form.trajectoryData)
          this.editableTrajectoryPoints = Array.isArray(data) ? data : (data.points || [])
        } catch (e) {
          this.$message.error('轨迹数据格式错误，无法编辑')
          return
        }
      }
      this.showTrajectoryEditor = true
    },
    /** 添加轨迹点 */
    addTrajectoryPoint() {
      const newPoint = {
        lat: null,
        lng: null,
        time: new Date(),
        name: ''
      }
      this.editableTrajectoryPoints.push(newPoint)
    },
    /** 删除轨迹点 */
    removeTrajectoryPoint(index) {
      this.editableTrajectoryPoints.splice(index, 1)
    },
    /** 自动计算信息 */
    autoCalculateInfo() {
      if (this.editableTrajectoryPoints.length < 2) {
        this.$message.warning('至少需要2个轨迹点才能自动计算')
        return
      }
      
      // 计算起点和终点
      const startPoint = this.editableTrajectoryPoints[0]
      const endPoint = this.editableTrajectoryPoints[this.editableTrajectoryPoints.length - 1]
      
      this.form.startLocation = startPoint.name || `${startPoint.lat.toFixed(4)}, ${startPoint.lng.toFixed(4)}`
      this.form.endLocation = endPoint.name || `${endPoint.lat.toFixed(4)}, ${endPoint.lng.toFixed(4)}`
      
      // 计算轨迹点数量
      this.form.pointCount = this.editableTrajectoryPoints.length
      
      this.$message.success('自动计算完成')
    },
    /** 保存轨迹点 */
    saveTrajectoryPoints() {
      const validPoints = this.editableTrajectoryPoints.filter(point => 
        point.lat !== null && point.lng !== null && point.time
      )
      
      if (validPoints.length === 0) {
        this.$message.error('请至少添加一个有效的轨迹点')
        return
      }
      
      const trajectoryData = {
        points: validPoints
      }
      
      this.form.trajectoryData = JSON.stringify(trajectoryData, null, 2)
      this.form.pointCount = validPoints.length
      this.showTrajectoryEditor = false
      this.validateTrajectoryData()
      
      this.$message.success('轨迹点数据保存成功')
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('route/info/export', {
        ...this.queryParams
      }, `info_${new Date().getTime()}.xlsx`)
    }
  }
}
</script>

<style scoped>
.trajectory-data-container {
  max-height: 400px;
  overflow-y: auto;
}

.trajectory-summary {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #409eff;
}

.summary-info {
  display: flex;
  align-items: center;
  color: #606266;
  font-size: 14px;
}

.summary-info i {
  margin-right: 6px;
  color: #409eff;
}

.summary-info strong {
  color: #409eff;
  font-weight: 600;
}

.trajectory-points {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.point-item {
  display: flex;
  flex-direction: column;
  padding: 12px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  background: #fff;
  transition: all 0.3s ease;
}

.point-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.point-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.point-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: #409eff;
  color: #fff;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 600;
}

.point-name {
  font-weight: 600;
  color: #303133;
  font-size: 15px;
  flex: 1;
  text-align: center;
}

.point-details {
  display: flex;
  gap: 16px;
  font-size: 13px;
}

.point-coords, .point-time {
  display: flex;
  align-items: center;
  color: #606266;
}

.point-coords i, .point-time i {
  margin-right: 6px;
  color: #909399;
}

.raw-data-collapse {
  margin-top: 16px;
}

.raw-json {
  background: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 12px;
  font-size: 12px;
  line-height: 1.4;
  max-height: 200px;
  overflow-y: auto;
}

.no-data {
  text-align: center;
  padding: 40px;
  color: #909399;
  font-size: 14px;
}

.no-data i {
  font-size: 24px;
  margin-bottom: 8px;
  display: block;
}

/* 轨迹编辑器样式 */
.trajectory-editor {
  width: 100%;
}

.editor-toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 6px;
}

.trajectory-editor-dialog {
  max-height: 600px;
  overflow-y: auto;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e4e7ed;
  margin-bottom: 16px;
}

.editor-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.editor-actions {
  display: flex;
  gap: 8px;
}

.trajectory-points-editor {
  padding: 0 16px;
}

.points-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.point-editor-item {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px;
  background: #fff;
  transition: all 0.3s ease;
}

.point-editor-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.point-editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.point-number {
  font-weight: 600;
  color: #409eff;
  font-size: 14px;
}

.point-editor-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.editor-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 16px;
  border-top: 1px solid #e4e7ed;
  margin-top: 16px;
}

.error-message {
  margin-top: 8px;
  padding: 8px 12px;
  background: #fef0f0;
  border: 1px solid #fde2e2;
  border-radius: 4px;
  color: #f56c6c;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 自定义表单标签样式 */
.form-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
  font-weight: 500;
}
</style>
