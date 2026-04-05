<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="名称" prop="poiName">
        <el-input
          v-model="queryParams.poiName"
          placeholder="请输入名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="分类" prop="poiCategory">
        <el-select v-model="queryParams.poiCategory" placeholder="请选择分类" clearable>
          <el-option
            v-for="dict in dict.type.route_poi_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="auditStatus">
        <el-select v-model="queryParams.auditStatus" placeholder="请选择状态" clearable>
          <el-option
            v-for="dict in dict.type.route_audit_status"
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
          v-hasPermi="['route:detail:add']"
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
          v-hasPermi="['route:detail:edit']"
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
          v-hasPermi="['route:detail:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['route:detail:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="detailList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" align="center" prop="poiId" width="80" />
      <el-table-column label="名称" align="center" prop="poiName" show-overflow-tooltip />
      <el-table-column label="类型" align="center" prop="poiType" width="100" />
      <el-table-column label="分类" align="center" prop="poiCategory" width="100">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.route_poi_type" :value="scope.row.poiCategory"/>
        </template>
      </el-table-column>
      <el-table-column label="评分" align="center" prop="rating" width="80" />
      <el-table-column label="状态" align="center" prop="auditStatus" width="100">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.route_audit_status" :value="scope.row.auditStatus"/>
        </template>
      </el-table-column>
      <el-table-column label="创建人" align="center" prop="userName" width="100" />
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
            v-hasPermi="['route:detail:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['route:detail:remove']"
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

    <!-- 添加或修改POI信息对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="800px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="基本信息" name="basic">
            <el-form-item label="名称" prop="poiName">
              <el-input v-model="form.poiName" placeholder="请输入名称" />
            </el-form-item>
            <el-form-item label="类型" prop="poiType">
              <el-input v-model="form.poiType" placeholder="请输入类型" />
            </el-form-item>
            <el-form-item label="分类" prop="poiCategory">
              <el-select v-model="form.poiCategory" placeholder="请选择分类">
                <el-option
                  v-for="dict in dict.type.route_poi_type"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="评分" prop="rating">
              <el-input v-model="form.rating" placeholder="请输入评分" />
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="位置信息" name="location">
            <el-form-item label="纬度" prop="latitude">
              <el-input v-model="form.latitude" placeholder="请输入纬度" />
            </el-form-item>
            <el-form-item label="经度" prop="longitude">
              <el-input v-model="form.longitude" placeholder="请输入经度" />
            </el-form-item>
            <el-form-item label="地址" prop="address">
              <el-input v-model="form.address" type="textarea" placeholder="请输入地址" />
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="联系信息" name="contact">
            <el-form-item label="电话" prop="contactPhone">
              <el-input v-model="form.contactPhone" placeholder="请输入电话" />
            </el-form-item>
            <el-form-item label="营业时间" prop="businessHours">
              <el-input v-model="form.businessHours" placeholder="请输入营业时间" />
            </el-form-item>
            <el-form-item label="图片" prop="poiImages">
              <image-upload v-model="form.poiImages"/>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="审核信息" name="audit">
            <el-form-item label="贡献者" prop="contributorId">
              <el-select v-model="form.contributorId" placeholder="请选择贡献者" clearable filterable>
                <el-option
                  v-for="item in contributorIdOptions"
                  :key="item.user_id"
                  :label="item.userName"
                  :value="item.user_id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="数据来源" prop="dataSource">
              <el-select v-model="form.dataSource" placeholder="请选择来源">
                <el-option
                  v-for="dict in dict.type.route_data_source"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="审核状态" prop="auditStatus">
              <el-radio-group v-model="form.auditStatus">
                <el-radio
                  v-for="dict in dict.type.route_audit_status"
                  :key="dict.value"
                  :label="dict.value"
                >{{dict.label}}</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="审核人" prop="auditBy">
              <el-select v-model="form.auditBy" placeholder="请选择审核人" clearable filterable>
                <el-option
                  v-for="item in auditByOptions"
                  :key="item.user_id"
                  :label="item.nickName"
                  :value="item.user_id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="审核时间" prop="auditTime">
              <el-date-picker clearable
                v-model="form.auditTime"
                type="date"
                value-format="yyyy-MM-dd"
                placeholder="请选择时间">
              </el-date-picker>
            </el-form-item>
            <el-form-item label="审核备注" prop="auditRemark">
              <el-input v-model="form.auditRemark" type="textarea" placeholder="请输入备注" />
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="其他信息" name="other">
            <el-form-item label="描述" prop="poiDesc">
              <el-input v-model="form.poiDesc" type="textarea" placeholder="请输入描述" />
            </el-form-item>
            <el-form-item label="访问次数" prop="visitCount">
              <el-input v-model="form.visitCount" placeholder="请输入次数" />
            </el-form-item>
            <el-form-item label="点赞次数" prop="likeCount">
              <el-input v-model="form.likeCount" placeholder="请输入次数" />
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

    <!-- 查看POI详情对话框 -->
    <el-dialog title="POI详情" :visible.sync="detailOpen" width="800px" append-to-body>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="POI ID">{{ detailData.poiId }}</el-descriptions-item>
        <el-descriptions-item label="名称">{{ detailData.poiName }}</el-descriptions-item>
        <el-descriptions-item label="类型">{{ detailData.poiType }}</el-descriptions-item>
        <el-descriptions-item label="分类">
          <dict-tag :options="dict.type.route_poi_type" :value="detailData.poiCategory"/>
        </el-descriptions-item>
        <el-descriptions-item label="纬度">{{ detailData.latitude }}</el-descriptions-item>
        <el-descriptions-item label="经度">{{ detailData.longitude }}</el-descriptions-item>
        <el-descriptions-item label="地址" :span="2">{{ detailData.address }}</el-descriptions-item>
        <el-descriptions-item label="描述" :span="2">{{ detailData.poiDesc }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ detailData.contactPhone }}</el-descriptions-item>
        <el-descriptions-item label="营业时间">{{ detailData.businessHours }}</el-descriptions-item>
        <el-descriptions-item label="评分">{{ detailData.rating }}</el-descriptions-item>
        <el-descriptions-item label="创建人">{{ detailData.userName }}</el-descriptions-item>
        <el-descriptions-item label="数据来源">
          <dict-tag :options="dict.type.route_data_source" :value="detailData.dataSource"/>
        </el-descriptions-item>
        <el-descriptions-item label="审核状态">
          <dict-tag :options="dict.type.route_audit_status" :value="detailData.auditStatus"/>
        </el-descriptions-item>
        <el-descriptions-item label="审核人">{{ detailData.nickName }}</el-descriptions-item>
        <el-descriptions-item label="审核时间">{{ parseTime(detailData.auditTime, '{y}-{m}-{d}') }}</el-descriptions-item>
        <el-descriptions-item label="访问次数">{{ detailData.visitCount }}</el-descriptions-item>
        <el-descriptions-item label="点赞次数">{{ detailData.likeCount }}</el-descriptions-item>
        <el-descriptions-item label="审核备注" :span="2">{{ detailData.auditRemark }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ detailData.remark }}</el-descriptions-item>
      </el-descriptions>
      <div slot="footer" class="dialog-footer">
        <el-button @click="detailOpen = false">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listDetail, getDetail, delDetail, addDetail, updateDetail, getContributorIdOptions, getAuditByOptions } from "@/api/route/detail"

export default {
  name: "Detail",
  dicts: ['route_poi_type', 'route_del_flag', 'route_audit_status', 'route_data_source'],
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
      // POI信息表格数据
      detailList: [],
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
        poiName: null,
        poiType: null,
        poiCategory: null,
        latitude: null,
        longitude: null,
        address: null,
        poiDesc: null,
        poiImages: null,
        contactPhone: null,
        businessHours: null,
        rating: null,
        contributorId: null,
        dataSource: null,
        auditStatus: null,
        auditBy: null,
        auditTime: null,
        auditRemark: null,
        visitCount: null,
        likeCount: null,
      },
      // 表单参数
      form: {},
      // 贡献者ID（关联sys_user.user_id）（关联用户信息表）选项列表
      contributorIdOptions: [],
      // 审核人ID（关联用户信息表）选项列表
      auditByOptions: [],
      // 表单校验
      rules: {
        poiName: [
          { required: true, message: "POI名称不能为空", trigger: "blur" }
        ],
        poiType: [
          { required: true, message: "POI类型不能为空", trigger: "blur" }
        ],
        latitude: [
          { required: true, message: "纬度不能为空", trigger: "blur" }
        ],
        longitude: [
          { required: true, message: "经度不能为空", trigger: "blur" }
        ],
        contributorId: [
          { required: true, message: "贡献者ID不能为空", trigger: "change" }
        ],
      }
    }
  },
  created() {
    this.getList()
    this.getContributorIdOptions()
    this.getAuditByOptions()
  },
  methods: {
    /** 查询POI信息列表 */
    getList() {
      this.loading = true
      listDetail(this.queryParams).then(response => {
        this.detailList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    /** 查询贡献者ID（关联sys_user.user_id）（关联用户信息表）选项列表 */
    getContributorIdOptions() {
      getContributorIdOptions().then(response => {
        this.contributorIdOptions = response.data || []
      }).catch(error => {
        console.error('获取贡献者ID（关联sys_user.user_id）（关联用户信息表）选项失败：', error)
        this.contributorIdOptions = []
      })
    },
    /** 查询审核人ID（关联用户信息表）选项列表 */
    getAuditByOptions() {
      getAuditByOptions().then(response => {
        this.auditByOptions = response.data || []
      }).catch(error => {
        console.error('获取审核人ID（关联用户信息表）选项失败：', error)
        this.auditByOptions = []
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
        poiId: null,
        poiName: null,
        poiType: null,
        poiCategory: null,
        latitude: null,
        longitude: null,
        address: null,
        poiDesc: null,
        poiImages: null,
        contactPhone: null,
        businessHours: null,
        rating: null,
        contributorId: null,
        dataSource: null,
        auditStatus: null,
        auditBy: null,
        auditTime: null,
        auditRemark: null,
        visitCount: null,
        likeCount: null,
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
      this.ids = selection.map(item => item.poiId)
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
      this.title = "添加POI信息"
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      this.activeTab = 'basic'
      const poiId = row.poiId || this.ids
      getDetail(poiId).then(response => {
        this.form = response.data
        this.open = true
        this.title = "修改POI信息"
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.poiId != null) {
            updateDetail(this.form).then(response => {
              this.$modal.msgSuccess("修改成功")
              this.open = false
              this.getList()
            })
          } else {
            addDetail(this.form).then(response => {
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
      const poiIds = row.poiId || this.ids
      this.$modal.confirm('是否确认删除POI信息编号为"' + poiIds + '"的数据项？').then(function() {
        return delDetail(poiIds)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess("删除成功")
      }).catch(() => {})
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('route/detail/export', {
        ...this.queryParams
      }, `detail_${new Date().getTime()}.xlsx`)
    }
  }
}
</script>
