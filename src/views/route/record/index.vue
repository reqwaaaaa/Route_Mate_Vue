<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="接收用户" prop="receiverId">
        <el-select v-model="queryParams.receiverId" placeholder="请选择接收用户" clearable filterable>
          <el-option
            v-for="item in receiverIdOptions"
            :key="item.user_id"
            :label="item.userName1"
            :value="item.user_id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="消息标题" prop="messageTitle">
        <el-input
          v-model="queryParams.messageTitle"
          placeholder="请输入消息标题"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="消息类型" prop="messageType">
        <el-select v-model="queryParams.messageType" placeholder="请选择消息类型" clearable>
          <el-option
            v-for="dict in dict.type.route_message_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="阅读状态" prop="readStatus">
        <el-select v-model="queryParams.readStatus" placeholder="请选择阅读状态" clearable>
          <el-option
            v-for="dict in dict.type.yes_or_no"
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
          v-hasPermi="['route:record:add']"
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
          v-hasPermi="['route:record:edit']"
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
          v-hasPermi="['route:record:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['route:record:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="recordList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" align="center" prop="messageId" width="80" />
      <el-table-column label="发送用户" align="center" prop="userName" width="100" />
      <el-table-column label="接收用户" align="center" prop="userName1" width="100" />
      <el-table-column label="消息标题" align="center" prop="messageTitle" show-overflow-tooltip />
      <el-table-column label="消息类型" align="center" prop="messageType" width="100">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.route_message_type" :value="scope.row.messageType"/>
        </template>
      </el-table-column>
      <el-table-column label="阅读状态" align="center" prop="readStatus" width="100">
        <template slot-scope="scope">
          <el-tag :type="scope.row.readStatus === '1' ? 'success' : 'info'">
            {{ scope.row.readStatus === '1' ? '已读' : '未读' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="发送时间" align="center" prop="sendTime" width="100">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.sendTime, '{m}-{d}') }}</span>
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
            v-hasPermi="['route:record:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['route:record:remove']"
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

    <!-- 添加或修改消息通知对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="800px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="基本信息" name="basic">
            <el-form-item label="发送用户" prop="senderId">
              <el-select v-model="form.senderId" placeholder="请选择发送用户" clearable filterable>
                <el-option
                  v-for="item in senderIdOptions"
                  :key="item.user_id"
                  :label="item.userName"
                  :value="item.user_id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="接收用户" prop="receiverId">
              <el-select v-model="form.receiverId" placeholder="请选择接收用户" clearable filterable>
                <el-option
                  v-for="item in receiverIdOptions"
                  :key="item.user_id"
                  :label="item.userName1"
                  :value="item.user_id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="消息标题" prop="messageTitle">
              <el-input v-model="form.messageTitle" placeholder="请输入消息标题" />
            </el-form-item>
            <el-form-item label="消息类型" prop="messageType">
              <el-select v-model="form.messageType" placeholder="请选择消息类型">
                <el-option
                  v-for="dict in dict.type.route_message_type"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="阅读状态" prop="readStatus">
              <el-radio-group v-model="form.readStatus">
                <el-radio
                  v-for="dict in dict.type.yes_or_no"
                  :key="dict.value"
                  :label="dict.value"
                >{{dict.label}}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="消息内容" name="content">
            <el-form-item label="消息内容" prop="messageContent">
              <el-input v-model="form.messageContent" type="textarea" :rows="8" placeholder="请输入消息内容" />
            </el-form-item>
            <el-form-item label="消息图片" prop="messageImages">
              <image-upload v-model="form.messageImages"/>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="关联信息" name="related">
            <el-form-item label="关联对象ID" prop="relatedId">
              <el-input v-model="form.relatedId" placeholder="请输入关联对象ID" />
            </el-form-item>
            <el-form-item label="关联对象类型" prop="relatedType">
              <el-select v-model="form.relatedType" placeholder="请选择关联对象类型">
                <el-option
                  v-for="dict in dict.type.route_preference_type"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="发送时间" prop="sendTime">
              <el-date-picker clearable
                v-model="form.sendTime"
                type="datetime"
                value-format="yyyy-MM-dd HH:mm:ss"
                placeholder="请选择发送时间">
              </el-date-picker>
            </el-form-item>
            <el-form-item label="阅读时间" prop="readTime">
              <el-date-picker clearable
                v-model="form.readTime"
                type="datetime"
                value-format="yyyy-MM-dd HH:mm:ss"
                placeholder="请选择阅读时间">
              </el-date-picker>
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

    <!-- 查看消息详情对话框 -->
    <el-dialog title="消息详情" :visible.sync="detailOpen" width="800px" append-to-body>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="消息ID">{{ detailData.messageId }}</el-descriptions-item>
        <el-descriptions-item label="发送用户">{{ detailData.userName }}</el-descriptions-item>
        <el-descriptions-item label="接收用户">{{ detailData.userName1 }}</el-descriptions-item>
        <el-descriptions-item label="消息标题" :span="2">{{ detailData.messageTitle }}</el-descriptions-item>
        <el-descriptions-item label="消息类型">
          <dict-tag :options="dict.type.route_message_type" :value="detailData.messageType"/>
        </el-descriptions-item>
        <el-descriptions-item label="阅读状态">
          <el-tag :type="detailData.readStatus === '1' ? 'success' : 'info'">
            {{ detailData.readStatus === '1' ? '已读' : '未读' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="消息内容" :span="2">
          <div v-html="detailData.messageContent"></div>
        </el-descriptions-item>
        <el-descriptions-item label="消息图片" :span="2">
          <image-preview :src="detailData.messageImages" :width="100" :height="100"/>
        </el-descriptions-item>
        <el-descriptions-item label="关联对象ID">{{ detailData.relatedId }}</el-descriptions-item>
        <el-descriptions-item label="关联对象类型">
          <dict-tag :options="dict.type.route_preference_type" :value="detailData.relatedType"/>
        </el-descriptions-item>
        <el-descriptions-item label="发送时间">{{ parseTime(detailData.sendTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</el-descriptions-item>
        <el-descriptions-item label="阅读时间">{{ parseTime(detailData.readTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</el-descriptions-item>
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
import { listRecord, getRecord, delRecord, addRecord, updateRecord, getSenderIdOptions, getReceiverIdOptions } from "@/api/route/record"

export default {
  name: "Record",
  dicts: ['route_message_type', 'yes_or_no', 'route_preference_type'],
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
      // 消息通知表格数据
      recordList: [],
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
        senderId: null,
        receiverId: null,
        messageTitle: null,
        messageContent: null,
        messageType: null,
        messageImages: null,
        relatedId: null,
        relatedType: null,
        readStatus: null,
        sendTime: null,
        readTime: null,
      },
      // 表单参数
      form: {},
      // 发送者ID（关联sys_user.user_id）（关联用户信息表）选项列表
      senderIdOptions: [],
      // 接收者ID（关联sys_user.user_id，系统消息时为空）（关联用户信息表）选项列表
      receiverIdOptions: [],
      // 表单校验
      rules: {
        senderId: [
          { required: true, message: "发送者ID不能为空", trigger: "change" }
        ],
        messageTitle: [
          { required: true, message: "消息标题不能为空", trigger: "blur" }
        ],
        messageContent: [
          { required: true, message: "消息内容不能为空", trigger: "blur" }
        ],
        messageType: [
          { required: true, message: "消息类型不能为空", trigger: "change" }
        ],
      }
    }
  },
  created() {
    this.getList()
    this.getSenderIdOptions()
    this.getReceiverIdOptions()
  },
  methods: {
    /** 查询消息通知列表 */
    getList() {
      this.loading = true
      listRecord(this.queryParams).then(response => {
        this.recordList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    /** 查询发送者ID（关联sys_user.user_id）（关联用户信息表）选项列表 */
    getSenderIdOptions() {
      getSenderIdOptions().then(response => {
        this.senderIdOptions = response.data || []
      }).catch(error => {
        console.error('获取发送者ID（关联sys_user.user_id）（关联用户信息表）选项失败：', error)
        this.senderIdOptions = []
      })
    },
    /** 查询接收者ID（关联sys_user.user_id，系统消息时为空）（关联用户信息表）选项列表 */
    getReceiverIdOptions() {
      getReceiverIdOptions().then(response => {
        this.receiverIdOptions = response.data || []
      }).catch(error => {
        console.error('获取接收者ID（关联sys_user.user_id，系统消息时为空）（关联用户信息表）选项失败：', error)
        this.receiverIdOptions = []
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
        messageId: null,
        senderId: null,
        receiverId: null,
        messageTitle: null,
        messageContent: null,
        messageType: null,
        messageImages: null,
        relatedId: null,
        relatedType: null,
        readStatus: null,
        sendTime: null,
        readTime: null,
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
      this.ids = selection.map(item => item.messageId)
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
      this.title = "添加消息通知"
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      this.activeTab = 'basic'
      const messageId = row.messageId || this.ids
      getRecord(messageId).then(response => {
        this.form = response.data
        this.open = true
        this.title = "修改消息通知"
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.messageId != null) {
            updateRecord(this.form).then(response => {
              this.$modal.msgSuccess("修改成功")
              this.open = false
              this.getList()
            })
          } else {
            addRecord(this.form).then(response => {
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
      const messageIds = row.messageId || this.ids
      this.$modal.confirm('是否确认删除消息通知编号为"' + messageIds + '"的数据项？').then(function() {
        return delRecord(messageIds)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess("删除成功")
      }).catch(() => {})
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('route/record/export', {
        ...this.queryParams
      }, `record_${new Date().getTime()}.xlsx`)
    }
  }
}
</script>
