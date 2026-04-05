<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="热点名称" prop="hotspotName">
        <el-input
          v-model="queryParams.hotspotName"
          placeholder="请输入热点名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="热点类型" prop="hotspotType">
        <el-select v-model="queryParams.hotspotType" placeholder="请选择热点类型" clearable>
          <el-option
            v-for="dict in dict.type.route_hotspot_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="任务名称" prop="analysisTaskId">
        <el-select v-model="queryParams.analysisTaskId" placeholder="请选择任务名称" clearable filterable>
          <el-option
            v-for="item in analysisTaskIdOptions"
            :key="item.task_id"
            :label="item.taskName"
            :value="item.task_id"
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
          v-hasPermi="['route:zone:add']"
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
          v-hasPermi="['route:zone:edit']"
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
          v-hasPermi="['route:zone:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['route:zone:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="zoneList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" align="center" prop="hotspotId" width="80" />
      <el-table-column label="热点名称" align="center" prop="hotspotName" show-overflow-tooltip />
      <el-table-column label="热点类型" align="center" prop="hotspotType" width="120">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.route_hotspot_type" :value="scope.row.hotspotType"/>
        </template>
      </el-table-column>
      <el-table-column label="中心坐标" align="center" width="120">
        <template slot-scope="scope">
          {{ scope.row.centerLatitude }}, {{ scope.row.centerLongitude }}
        </template>
      </el-table-column>
      <el-table-column label="访问次数" align="center" prop="visitCount" width="100" />
      <el-table-column label="独立用户数" align="center" prop="uniqueUsers" width="100" />
      <el-table-column label="高峰时段" align="center" prop="peakHour" width="100" />
      <el-table-column label="平均停留时长" align="center" prop="avgDuration" width="120" />
      <el-table-column label="任务名称" align="center" prop="taskName" width="120" />
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
            v-hasPermi="['route:zone:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['route:zone:remove']"
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

    <!-- 添加或修改热点数据对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="700px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="基本信息" name="basic">
            <el-form-item label="热点名称" prop="hotspotName">
              <el-input v-model="form.hotspotName" placeholder="请输入热点名称" />
            </el-form-item>
            <el-form-item label="热点类型" prop="hotspotType">
              <el-select v-model="form.hotspotType" placeholder="请选择热点类型">
                <el-option
                  v-for="dict in dict.type.route_hotspot_type"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="中心纬度" prop="centerLatitude">
              <el-input v-model="form.centerLatitude" placeholder="请输入中心纬度" />
            </el-form-item>
            <el-form-item label="中心经度" prop="centerLongitude">
              <el-input v-model="form.centerLongitude" placeholder="请输入中心经度" />
            </el-form-item>
            <el-form-item label="半径" prop="radius">
              <el-input v-model="form.radius" placeholder="请输入半径（米）" />
            </el-form-item>
            <el-form-item label="分析任务" prop="analysisTaskId">
              <el-select v-model="form.analysisTaskId" placeholder="请选择分析任务" clearable filterable>
                <el-option
                  v-for="item in analysisTaskIdOptions"
                  :key="item.task_id"
                  :label="item.taskName"
                  :value="item.task_id"
                />
              </el-select>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="统计信息" name="stats">
            <el-form-item label="访问次数" prop="visitCount">
              <el-input v-model="form.visitCount" placeholder="请输入访问次数" />
            </el-form-item>
            <el-form-item label="独立用户数" prop="uniqueUsers">
              <el-input v-model="form.uniqueUsers" placeholder="请输入独立用户数" />
            </el-form-item>
            <el-form-item label="高峰时段" prop="peakHour">
              <el-input v-model="form.peakHour" placeholder="请输入高峰时段" />
            </el-form-item>
            <el-form-item label="平均停留时长" prop="avgDuration">
              <el-input v-model="form.avgDuration" placeholder="请输入平均停留时长（分钟）" />
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="其他信息" name="other">
            <el-form-item label="关联POI" prop="relatedPois">
              <el-input v-model="form.relatedPois" type="textarea" :rows="4" placeholder="请输入关联POI（JSON格式）" />
              <div class="json-tip">
                <el-button size="mini" type="text" @click="formatRelatedPois">格式化JSON</el-button>
                <span class="tip-text">请输入有效的JSON格式数据</span>
              </div>
            </el-form-item>
            <el-form-item label="热点图片" prop="hotspotImages">
              <image-upload v-model="form.hotspotImages"/>
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

    <!-- 查看热点详情对话框 -->
    <el-dialog title="热点详情" :visible.sync="detailOpen" width="700px" append-to-body>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="热点ID">{{ detailData.hotspotId }}</el-descriptions-item>
        <el-descriptions-item label="热点名称">{{ detailData.hotspotName }}</el-descriptions-item>
        <el-descriptions-item label="热点类型">
          <dict-tag :options="dict.type.route_hotspot_type" :value="detailData.hotspotType"/>
        </el-descriptions-item>
        <el-descriptions-item label="中心纬度">{{ detailData.centerLatitude }}</el-descriptions-item>
        <el-descriptions-item label="中心经度">{{ detailData.centerLongitude }}</el-descriptions-item>
        <el-descriptions-item label="半径">{{ detailData.radius }}米</el-descriptions-item>
        <el-descriptions-item label="访问次数">{{ detailData.visitCount }}</el-descriptions-item>
        <el-descriptions-item label="独立用户数">{{ detailData.uniqueUsers }}</el-descriptions-item>
        <el-descriptions-item label="高峰时段">{{ detailData.peakHour }}</el-descriptions-item>
        <el-descriptions-item label="平均停留时长">{{ detailData.avgDuration }}分钟</el-descriptions-item>
        <el-descriptions-item label="关联POI" :span="2">
          <pre>{{ formatJson(detailData.relatedPois) }}</pre>
        </el-descriptions-item>
        <el-descriptions-item label="热点图片" :span="2">
          <image-preview :src="detailData.hotspotImages" :width="100" :height="100"/>
        </el-descriptions-item>
        <el-descriptions-item label="任务名称">{{ detailData.taskName }}</el-descriptions-item>
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
import { listZone, getZone, delZone, addZone, updateZone, getAnalysisTaskIdOptions } from "@/api/route/zone"

export default {
  name: "Zone",
  dicts: ['route_hotspot_type'],
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
      // 热点数据表格数据
      zoneList: [],
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
        hotspotName: null,
        hotspotType: null,
        centerLatitude: null,
        centerLongitude: null,
        radius: null,
        visitCount: null,
        uniqueUsers: null,
        peakHour: null,
        avgDuration: null,
        relatedPois: null,
        hotspotImages: null,
        analysisTaskId: null,
      },
      // 表单参数
      form: {},
      // 分析任务ID（关联分析任务表）选项列表
      analysisTaskIdOptions: [],
      // 表单校验
      rules: {
        hotspotName: [
          { required: true, message: "热点名称不能为空", trigger: "blur" }
        ],
        hotspotType: [
          { required: true, message: "热点类型不能为空", trigger: "change" }
        ],
        centerLatitude: [
          { required: true, message: "中心纬度不能为空", trigger: "blur" }
        ],
        centerLongitude: [
          { required: true, message: "中心经度不能为空", trigger: "blur" }
        ],
      }
    }
  },
  created() {
    this.getList()
    this.getAnalysisTaskIdOptions()
  },
  methods: {
    /** 查询热点数据列表 */
    getList() {
      this.loading = true
      listZone(this.queryParams).then(response => {
        this.zoneList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    /** 查询分析任务ID（关联分析任务表）选项列表 */
    getAnalysisTaskIdOptions() {
      getAnalysisTaskIdOptions().then(response => {
        this.analysisTaskIdOptions = response.data || []
      }).catch(error => {
        console.error('获取分析任务ID（关联分析任务表）选项失败：', error)
        this.analysisTaskIdOptions = []
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
        hotspotId: null,
        hotspotName: null,
        hotspotType: null,
        centerLatitude: null,
        centerLongitude: null,
        radius: null,
        visitCount: null,
        uniqueUsers: null,
        peakHour: null,
        avgDuration: null,
        relatedPois: null,
        hotspotImages: null,
        analysisTaskId: null,
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
      this.ids = selection.map(item => item.hotspotId)
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
      this.title = "添加热点数据"
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      this.activeTab = 'basic'
      const hotspotId = row.hotspotId || this.ids
      getZone(hotspotId).then(response => {
        this.form = response.data
        this.open = true
        this.title = "修改热点数据"
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.hotspotId != null) {
            updateZone(this.form).then(response => {
              this.$modal.msgSuccess("修改成功")
              this.open = false
              this.getList()
            })
          } else {
            addZone(this.form).then(response => {
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
      const hotspotIds = row.hotspotId || this.ids
      this.$modal.confirm('是否确认删除热点数据编号为"' + hotspotIds + '"的数据项？').then(function() {
        return delZone(hotspotIds)
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
    /** 格式化关联POI */
    formatRelatedPois() {
      this.form.relatedPois = this.formatJson(this.form.relatedPois)
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('route/zone/export', {
        ...this.queryParams
      }, `zone_${new Date().getTime()}.xlsx`)
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
