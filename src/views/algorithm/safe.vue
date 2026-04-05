<template>
  <div class="app-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <el-row :gutter="20">
        <el-col :span="24">
          <el-card class="box-card">
            <div slot="header">
              <span class="card-title">🚀 算法分析系统</span>
              <el-button style="float: right;" type="primary" size="small" @click="checkApiStatus">
                检查状态
              </el-button>
            </div>
            <div class="api-status">
              <el-tag :type="apiStatus.type" size="medium">
                {{ apiStatus.text }}
              </el-tag>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 任务创建区域 -->
    <el-row :gutter="20" style="margin-bottom: 20px;">
      <el-col :span="24">
        <el-card class="box-card">
          <div slot="header">
            <span class="card-title">📊 创建分析任务</span>
          </div>
          <el-form :model="analysisForm" :rules="analysisRules" ref="analysisForm" label-width="100px">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="轨迹ID" prop="trajectoryId">
                  <el-select v-model="analysisForm.trajectoryId"
                             placeholder="请选择轨迹" style="width: 100%;" filterable>
                    <el-option
                      v-for="trajectory in trajectoryList"
                      :key="trajectory.trajectoryId"
                      :label="`${trajectory.trajectoryName} (ID: ${trajectory.trajectoryId})`"
                      :value="trajectory.trajectoryId">
                      <span style="float: left">{{ trajectory.trajectoryName }}</span>
                      <span style="float: right; color: #8492a6; font-size: 13px">
                        ID: {{ trajectory.trajectoryId }} | {{ trajectory.pointCount }}个点
                      </span>
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="算法选择" prop="algorithm">
                  <el-select v-model="analysisForm.algorithm"
                             placeholder="请选择算法" style="width: 100%;">
                    <el-option label="SW-FP-TRtree + GSCM-SW" value="both"></el-option>
                    <el-option label="仅 SW-FP-TRtree" value="sw_fp"></el-option>
                    <el-option label="仅 GSCM-SW" value="gscm_sw"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item style="text-align: center; margin-top: 20px;">
              <el-button type="primary" @click="startAnalysis"
                         :loading="analysisLoading" size="medium">
                🚀 开始分析
              </el-button>
              <el-button @click="loadTrajectories"
                         :loading="trajectoryLoading" size="medium" style="margin-left: 10px;">
                🔄 刷新轨迹
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>

    <!-- 任务列表 -->
    <el-row :gutter="20" style="margin-bottom: 20px;">
      <el-col :span="24">
        <el-card class="box-card">
          <div slot="header">
            <span class="card-title">📋 分析任务</span>
            <el-button style="float: right;" type="text" @click="loadTasks">刷新</el-button>
          </div>
          <el-table :data="taskList" style="width: 100%" v-loading="taskLoading">
            <el-table-column prop="name" label="任务名称" min-width="150"></el-table-column>
            <el-table-column prop="algorithm" label="算法" min-width="180">
              <template slot-scope="scope">
                <el-tag size="small">{{ getAlgorithmName(scope.row.algorithm) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template slot-scope="scope">
                <el-tag :type="getStatusType(scope.row.status)" size="small">
                  {{ getStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="创建时间" width="160"></el-table-column>
            <el-table-column label="操作" width="100">
              <template slot-scope="scope">
                <el-button size="mini" type="text" @click="viewTaskResults(scope.row)">
                  查看结果
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 结果展示区域 -->
    <el-row :gutter="20" v-show="currentTaskId">
      <el-col :span="24">
        <el-card class="box-card">
          <div slot="header">
            <span class="card-title">📈 分析结果</span>
            <el-button style="float: right;" type="text" @click="refreshResults">刷新</el-button>
          </div>

          <!-- 总览 -->
          <el-tabs v-model="activeTab" @tab-click="handleTabClick">
            <el-tab-pane label="总览" name="overview">
              <el-row :gutter="20" style="margin-top: 20px;">
                <el-col :span="6" v-for="(stat, index) in overviewStats" :key="`stat-${index}`">
                  <el-card shadow="hover" :body-style="{ padding: '20px', textAlign: 'center' }">
                    <div style="font-size: 24px; color: #409eff; font-weight: bold;">
                      {{ stat.value }}
                    </div>
                    <div style="margin-top: 10px; color: #909399;">
                      {{ stat.label }}
                    </div>
                  </el-card>
                </el-col>
              </el-row>
            </el-tab-pane>

            <!-- 热点区域 -->
            <el-tab-pane label="热点区域" name="hotspots">
              <el-row :gutter="20" style="margin-top: 20px;">
                <el-col :span="14">
                  <div style="margin-bottom: 10px;">
                    <el-button-group>
                      <el-button size="small" @click="showTrajectory = !showTrajectory" :type="showTrajectory ? 'primary' : 'default'">
                        {{ showTrajectory ? '隐藏轨迹' : '显示轨迹' }}
                      </el-button>
                      <el-button size="small" @click="renderHotspots()">刷新地图</el-button>
                    </el-button-group>
                  </div>
                  <div id="tencentMap" style="height: 400px; background: #f0f2f5; border: 1px solid #dcdfe6; border-radius: 4px;"></div>
                </el-col>
                <el-col :span="10">
                  <div style="max-height: 400px; overflow-y: auto;">
                    <el-card v-for="(hotspot, index) in hotspots" :key="`hotspot-${index}`"
                              class="hotspot-card" shadow="hover">
                      <div slot="header">
                        <span>{{ hotspot.hotspot_type || '未知' }}</span>
                        <el-tag style="float: right;" type="success" size="mini">
                          置信度: {{ (hotspot.confidence || 0).toFixed(2) }}
                        </el-tag>
                      </div>
                      <div>
                        <p><strong>访问次数:</strong> {{ hotspot.visit_count }}</p>
                        <p><strong>半径:</strong> {{ hotspot.radius_m }}m</p>
                        <p><strong>访问频率:</strong> {{ hotspot.visit_frequency || 0 }}次/小时</p>
                      </div>
                    </el-card>
                  </div>
                </el-col>
              </el-row>
            </el-tab-pane>

            <!-- 语义轨迹 -->
            <el-tab-pane label="语义轨迹" name="semantic">
              <el-row :gutter="20" style="margin-top: 20px;">
                <el-col :span="12">
                  <h4>轨迹序列</h4>
                  <div style="margin: 20px 0;">
                    <div v-for="(item, index) in semanticSequence" :key="`seq-${index}`" style="display: inline-block; margin-right: 8px;">
                      <el-tag type="primary" style="margin-right: 8px; margin-bottom: 8px;">
                        {{ item }}
                      </el-tag>
                      <span v-if="index < semanticSequence.length - 1" style="margin-right: 8px;">
                        →
                      </span>
                    </div>
                  </div>
                </el-col>
                <el-col :span="12">
                  <h4>停留点详情</h4>
                  <div style="max-height: 350px; overflow-y: auto; margin-top: 20px;">
                    <el-card v-for="(point, index) in stayPoints" :key="`point-${index}`"
                              class="hotspot-card" shadow="hover">
                      <div slot="header">
                        <span>{{ point.semantic_label || '未知' }}</span>
                        <el-tag style="float: right;" type="info" size="mini">
                          {{ point.semantic_type || '未知' }}
                        </el-tag>
                      </div>
                      <div>
                        <p><strong>停留时间:</strong> {{ point.duration_minutes }}分钟</p>
                        <p><strong>置信度:</strong> {{ (point.confidence || 0).toFixed(2) }}</p>
                        <p><strong>开始时间:</strong> {{ point.start_time }}</p>
                      </div>
                    </el-card>
                  </div>
                </el-col>
              </el-row>
            </el-tab-pane>

            <!-- 频繁模式 -->
            <el-tab-pane label="频繁模式" name="pattern">
              <el-row :gutter="20" style="margin-top: 20px;">
                <el-col :span="12">
                  <h4>SW-FP-TRtree 模式</h4>
                  <div style="max-height: 350px; overflow-y: auto; margin-top: 20px;">
                    <el-card v-for="(pattern, index) in swfpPatterns" :key="`swfp-${index}`"
                              class="hotspot-card" shadow="hover">
                      <div slot="header">
                        <span>{{ pattern.pattern_string || '未知模式' }}</span>
                        <el-tag style="float: right;" type="warning" size="mini">
                          长度: {{ pattern.length || 0 }}
                        </el-tag>
                      </div>
                      <div>
                        <p><strong>支持度:</strong> {{ pattern.support }}</p>
                        <p><strong>置信度:</strong> {{ (pattern.confidence || 0).toFixed(2) }}</p>
                        <p><strong>支持率:</strong> {{ (pattern.support_ratio || 0).toFixed(3) }}</p>
                      </div>
                    </el-card>
                  </div>
                </el-col>
                <el-col :span="12">
                  <h4>GSCM-SW 模式</h4>
                  <div style="max-height: 350px; overflow-y: auto; margin-top: 20px;">
                    <el-card v-for="(pattern, index) in gscmPatterns" :key="`gscm-${index}`"
                              class="hotspot-card" shadow="hover">
                      <div slot="header">
                        <span>{{ pattern.pattern_string || '未知模式' }}</span>
                        <el-tag style="float: right;" :type="pattern.is_closed ? 'success' : 'info'" size="mini">
                          {{ pattern.is_closed ? '闭包' : '开包' }}
                        </el-tag>
                      </div>
                      <div>
                        <p><strong>支持度:</strong> {{ pattern.support }}</p>
                        <p><strong>质量评分:</strong> {{ (pattern.quality_score || 0).toFixed(2) }}</p>
                        <p><strong>时间一致性:</strong> {{ (pattern.temporal_consistency || 0).toFixed(2) }}</p>
                      </div>
                    </el-card>
                  </div>
                </el-col>
              </el-row>
            </el-tab-pane>

            <!-- 路径推荐 -->
            <el-tab-pane label="路径推荐" name="recommendation">
              <div style="margin-top: 20px;">
                <el-card v-for="(rec, index) in recommendations" :key="`rec-${index}`"
                          :class="['recommendation-card', index === 0 ? 'best' : '']"
                          shadow="hover">
                  <div slot="header">
                    <span style="font-size: 16px; font-weight: bold;">
                      {{ index === 0 ? '🏆 ' : '' }}推荐路径 #{{ rec.rank }}
                    </span>
                    <div style="float: right;">
                      <el-tag type="success" size="small">
                        评分: {{ (rec.score || 0).toFixed(2) }}
                      </el-tag>
                      <el-tag type="warning" size="small" style="margin-left: 8px;">
                        置信度: {{ (rec.confidence || 0).toFixed(2) }}
                      </el-tag>
                    </div>
                  </div>
                  <div>
                    <el-row :gutter="20">
                      <el-col :span="8">
                        <p><strong>距离:</strong> {{ rec.estimated_distance || 0 }}m</p>
                        <p><strong>预计时间:</strong> {{ Math.round((rec.estimated_time || 0) / 60) }}分钟</p>
                      </el-col>
                      <el-col :span="8">
                        <p><strong>算法:</strong> {{ rec.algorithm || 'Unknown' }}</p>
                        <p><strong>支持度:</strong> {{ rec.support || 0 }}</p>
                      </el-col>
                      <el-col :span="8">
                        <p><strong>路径点数:</strong> {{ getWaypointsCount(rec.waypoints) }}</p>
                      </el-col>
                    </el-row>

                    <!-- 推荐路径小地图 -->
                    <el-row :gutter="20" style="margin-top: 15px;">
                      <el-col :span="24">
                        <div style="margin-bottom: 10px;">
                          <strong>路径预览：</strong>
                        </div>
                        <div :id="`recommendation-map-${index}`"
                             class="recommendation-small-map">
                        </div>
                      </el-col>
                    </el-row>

                    <el-divider></el-divider>
                    <h5>推荐解释：</h5>
                    <p style="background: #f5f7fa; padding: 12px; border-radius: 4px; line-height: 1.6;">
                      {{ rec.explanation || '暂无解释' }}
                    </p>
                  </div>
                </el-card>
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import request from '@/utils/request'
import axios from 'axios'

export default {
  name: 'AlgorithmAnalysis',
  data() {
    return {
      // API配置
      apiBase: 'http://localhost:5000',
      backendApiBase: process.env.VUE_APP_BASE_API || 'http://localhost:8080',

      // 状态
      apiStatus: { type: 'info', text: '服务未连接' },
      currentTaskId: null,
      activeTab: 'overview',

      // 加载状态
      analysisLoading: false,
      taskLoading: false,
      trajectoryLoading: false,

      // 表单数据
      analysisForm: {
        trajectoryId: null,
        algorithm: 'both'
      },
      analysisRules: {
        trajectoryId: [
          { required: true, message: '请选择轨迹', trigger: 'change' }
        ],
        algorithm: [
          { required: true, message: '请选择算法', trigger: 'change' }
        ]
      },

      // 数据 - 确保所有数组都有默认值
      trajectoryList: [],
      taskList: [],
      overviewStats: [],
      hotspots: [],
      semanticSequence: [],
      stayPoints: [],
      swfpPatterns: [],
      gscmPatterns: [],
      recommendations: [],

      // 地图
      amap: null,
      recommendationMaps: {}, // 存储推荐路径小地图实例
      showTrajectory: true, // 控制是否显示原始轨迹
      currentTaskData: null // 存储当前任务数据
    }
  },
  mounted() {
    this.initializeAmap()
    this.checkApiStatus()
    this.loadTrajectories()
    this.loadTasks()
  },
  methods: {
    // 初始化高德地图
    initializeAmap() {
      // 动态加载高德地图API
      if (!window.AMap) {
        const script = document.createElement('script')
        script.charset = 'utf-8'
        script.src = 'https://webapi.amap.com/maps?v=2.0&key=6253f60b492542c14ed86231b3581992&plugin=AMap.Scale,AMap.ToolBar'
        script.onload = () => {
          this.$nextTick(() => {
            this.createMap()
          })
        }
        document.head.appendChild(script)
      } else {
        this.createMap()
      }
    },

    // 创建地图
    createMap() {
      if (document.getElementById('tencentMap')) {
        try {
          this.amap = new window.AMap.Map('tencentMap', {
            center: [116.4074, 39.9042], // 高德地图使用 [lng, lat] 格式
            zoom: 11
          })
          console.log('高德地图初始化成功')
        } catch (error) {
          console.error('高德地图初始化失败:', error)
        }
      }
    },

    // 检查API状态
    async checkApiStatus() {
      try {
        const response = await axios.get(`${this.apiBase}/`)
        this.apiStatus = { type: 'success', text: '🟢 服务正常' }
      } catch (error) {
        this.apiStatus = { type: 'danger', text: '🔴 服务未连接' }
      }
    },

    // 开始分析
    async startAnalysis() {
      this.$refs.analysisForm.validate(async (valid) => {
        if (!valid) return

        this.analysisLoading = true

        try {
          const response = await request({
            url: '/route/analysis/execute',
            method: 'post',
            data: {
              trajectoryId: this.analysisForm.trajectoryId,
              algorithmType: this.analysisForm.algorithm,
              taskName: `轨迹分析_${this.analysisForm.trajectoryId}`,
              userId: this.$store.getters.id || 100, // 从store获取用户ID，回退到100
              algorithmParams: {
                eps: 0.01,
                minSamples: 5,
                timeThreshold: 300,
                distanceThreshold: 100.0,
                minSupport: 0.1,
                minConfidence: 0.8,
                slidingWindow: 7
              }
            }
          })

          if (response.code === 200) {
            this.currentTaskId = response.data.taskId
            this.$message.success('分析任务创建成功！')
            this.loadTasks()
            // 开始轮询任务状态
            this.pollTaskStatus(this.currentTaskId)
          } else {
            throw new Error(response.msg || '分析失败')
          }
        } catch (error) {
          console.error('分析请求失败:', error)
          this.$message.error(`分析失败: ${error.message}`)
        } finally {
          this.analysisLoading = false
        }
      })
    },

    // 加载轨迹列表
    async loadTrajectories() {
      this.trajectoryLoading = true
      try {
        const response = await request({
          url: '/route/info/list',
          method: 'get',
          params: {
            pageNum: 1,
            pageSize: 100
          }
        })

        if (response.code === 200) {
          // 转换数据格式以适配前端
          this.trajectoryList = response.rows.map(item => ({
            trajectoryId: item.trajectoryId,
            trajectoryName: item.trajectoryName || `轨迹${item.trajectoryId}`,
            pointCount: this.extractPointCount(item.trajectoryData),
            startLocation: item.startLocation || '未知',
            endLocation: item.endLocation || '未知',
            totalDistance: item.totalDistance || 0,
            createTime: item.createTime
          }))
        } else {
          // 如果API不可用，使用模拟数据
          this.trajectoryList = [
            {
              trajectoryId: 1,
              trajectoryName: '通勤轨迹',
              pointCount: 456,
              startLocation: '北京市朝阳区',
              endLocation: '北京市海淀区',
              totalDistance: 15.2,
              createTime: '2026-03-25 08:00:00'
            },
            {
              trajectoryId: 2,
              trajectoryName: '周末出行',
              pointCount: 234,
              startLocation: '北京市海淀区',
              endLocation: '北京市朝阳区',
              totalDistance: 8.7,
              createTime: '2026-03-26 14:30:00'
            },
            {
              trajectoryId: 3,
              trajectoryName: '商务出行',
              pointCount: 678,
              startLocation: '北京市朝阳区',
              endLocation: '北京市西城区',
              totalDistance: 22.5,
              createTime: '2026-03-27 09:15:00'
            }
          ]
        }
      } catch (error) {
        console.error('加载轨迹列表失败:', error)
        // 使用模拟数据
        this.trajectoryList = [
          {
            trajectoryId: 1,
            trajectoryName: '通勤轨迹',
            pointCount: 456,
            startLocation: '北京市朝阳区',
            endLocation: '北京市海淀区',
            totalDistance: 15.2,
            createTime: '2026-03-25 08:00:00'
          }
        ]
      } finally {
        this.trajectoryLoading = false
      }
    },

    // 从轨迹数据中提取点数量
    extractPointCount(trajectoryData) {
      try {
        if (!trajectoryData) return 0
        if (typeof trajectoryData === 'string') {
          const data = JSON.parse(trajectoryData)
          return Array.isArray(data) ? data.length : (data.points ? data.points.length : 0)
        } else if (Array.isArray(trajectoryData)) {
          return trajectoryData.length
        } else if (trajectoryData.points) {
          return trajectoryData.points.length
        }
        return 0
      } catch (error) {
        console.error('解析轨迹数据失败:', error)
        return 0
      }
    },

    // 轮询任务状态
    async pollTaskStatus(taskId) {
      const maxAttempts = 60 // 最多轮询60次（10分钟）
      let attempts = 0

      const poll = async () => {
        try {
          const response = await request({
            url: `/route/analysis/progress/${taskId}`,
            method: 'get'
          })

          if (response.code === 200) {
            const progress = response.data.progress
            const status = response.data.status

            if (status === '2') { // 已完成
              this.loadTaskResults(taskId)
              this.$message.success('分析任务完成！')
              return
            } else if (status === '3') { // 失败
              this.$message.error('分析任务失败')
              return
            }

            if (attempts < maxAttempts) {
              attempts++
              setTimeout(poll, 10000) // 10秒后再次查询
            }
          }
        } catch (error) {
          console.error('查询任务状态失败:', error)
        }
      }

      poll()
    },

    // 加载任务列表
    async loadTasks() {
      this.taskLoading = true
      try {
        const response = await request({
          url: '/route/task/list',
          method: 'get',
          params: {
            pageNum: 1,
            pageSize: 20,
            orderByColumn: 'create_time',
            isAsc: 'desc'
          }
        })
console.log(response)
        if (response.code === 200) {
          // 转换数据格式以适配前端，保留完整数据
          this.taskList = response.rows.map(item => ({
            id: item.taskId,
            name: item.taskName,
            algorithm: item.algorithmType,
            status: this.convertTaskStatus(item.taskStatus),
            createTime: item.createTime,
            progress: item.progress || 0,
            // 保留完整数据用于详情查看
            fullData: item
          }))
        } else {
          // 模拟任务数据
          this.taskList = [
            {
              id: 'task_001',
              name: '轨迹分析任务',
              algorithm: 'both',
              status: 'completed',
              createTime: '2024-01-01 10:30:00'
            },
            {
              id: 'task_002',
              name: '用户行为分析',
              algorithm: 'sw_fp',
              status: 'running',
              createTime: '2024-01-01 14:20:00'
            }
          ]
        }
      } catch (error) {
        console.error('加载任务列表失败:', error)
        // 模拟任务数据
        this.taskList = [
          {
            id: 'task_001',
            name: '轨迹分析任务',
            algorithm: 'both',
            status: 'completed',
            createTime: '2024-01-01 10:30:00'
          }
        ]
      } finally {
        this.taskLoading = false
      }
    },

    // 转换任务状态
    convertTaskStatus(status) {
      const statusMap = {
        '0': 'pending',    // 待执行
        '1': 'running',   // 运行中
        '2': 'completed', // 已完成
        '3': 'failed'     // 失败
      }
      return statusMap[status] || 'pending'
    },

    // 查看任务结果
    viewTaskResults(task) {
      this.currentTaskId = task.id
      // 如果任务列表中已有完整数据，优先使用
      if (task.fullData && task.fullData.resultData) {
        console.log('使用任务列表中的数据:', task.fullData)
        this.renderResults(task.fullData)
      } else {
        // 否则从后端重新获取
        this.loadTaskResults(task.id)
      }
    },

    // 加载任务结果
    async loadTaskResults(taskId) {
      if (!taskId) return

      const loading = this.$loading({
        lock: true,
        text: '正在加载分析结果...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })

      try {
        const response = await request({
          url: `/route/analysis/result/${taskId}`,
          method: 'get'
        })

        if (response.code === 200) {
          this.renderResults(response.data)
          console.log('渲染结果完成', response.data)
        } else {
          throw new Error(response.msg || '加载结果失败')
        }
      } catch (error) {
        console.error('加载任务结果失败:', error)
        // 如果后端API不可用，尝试使用Python分析服务
        try {
          const pythonResponse = await axios.get(`${this.apiBase}/analysis/result/${taskId}`)
          if (pythonResponse.data.success) {
            this.renderResults(pythonResponse.data.data)
          } else {
            throw new Error(pythonResponse.data.message || '加载结果失败')
          }
        } catch (pythonError) {
          this.$message.error(`加载结果失败: ${error.message}`)
        }
      } finally {
        loading.close()
      }
    },

    // 渲染分析结果
    renderResults(data) {
      try {
        console.log('开始渲染分析结果:', data)

        // 保存当前任务数据
        this.currentTaskData = data

        // 解析resultData中的JSON字符串
        let analysisData = {}
        if (data.resultData) {
          if (typeof data.resultData === 'string') {
            analysisData = JSON.parse(data.resultData)
          } else {
            analysisData = data.resultData
          }
        } else if (data.analysisData) {
          analysisData = data.analysisData
        }

        console.log('解析后的分析数据:', analysisData)
        console.log('patterns_swfp:', analysisData.patterns_swfp)
        console.log('patterns_gscm:', analysisData.patterns_gscm)
        console.log('recommendations:', analysisData.recommendations)
        console.log('hotspots:', analysisData.hotspots)
        console.log('semantic_trajectory:', analysisData.semantic_trajectory)
        console.log('pois:', analysisData.pois)

        // 适配后端返回的数据结构
        const adaptedData = {
          statistics: {
            totalPoints: analysisData.total_points || 0,
            totalHotspots: analysisData.total_hotspots || (analysisData.hotspots?.length || 0),
            totalPatterns: (analysisData.patterns_swfp?.length || 0) + (analysisData.patterns_gscm?.length || 0),
            dataQualityScore: analysisData.data_quality_score || 95
          },
          hotspots: this.adaptHotspotsData(analysisData.hotspots || []),
          semanticTrajectory: this.adaptSemanticTrajectoryData(analysisData.semantic_trajectory),
          patterns: {
            swFpPatterns: analysisData.patterns_swfp || [],
            gscmPatterns: analysisData.patterns_gscm || []
          },
          recommendations: analysisData.recommendations || []
        }

        console.log('适配后的数据:', adaptedData)

        // 总览统计
        const stats = adaptedData.statistics || {}
        this.overviewStats = [
          { label: '热点区域', value: stats.totalHotspots || 0 },
          { label: '频繁模式', value: stats.totalPatterns || 0 },
          { label: '数据质量', value: `${stats.dataQualityScore || 0}%` }
        ]

        // 热点区域
        this.hotspots = Array.isArray(adaptedData.hotspots) ? adaptedData.hotspots : []
        this.renderHotspots()

        // 渲染原始轨迹点
        this.renderTrajectoryPoints()

        // 语义轨迹
        if (adaptedData.semanticTrajectory) {
          this.semanticSequence = Array.isArray(adaptedData.semanticTrajectory.semanticSequence) ?
            adaptedData.semanticTrajectory.semanticSequence : []
          this.stayPoints = Array.isArray(adaptedData.semanticTrajectory.stayPoints) ?
            adaptedData.semanticTrajectory.stayPoints : []
        }

        // 频繁模式
        const patterns = adaptedData.patterns || {}
        this.swfpPatterns = Array.isArray(patterns.swFpPatterns) ? patterns.swFpPatterns : []
        this.gscmPatterns = Array.isArray(patterns.gscmPatterns) ? patterns.gscmPatterns : []

        // 推荐路径
        this.recommendations = Array.isArray(adaptedData.recommendations) ? adaptedData.recommendations : []
        console.log('设置推荐路径数据:', this.recommendations)

        // 强制更新Vue响应式数据
        this.$forceUpdate()

        // 延迟渲染小地图，确保DOM已更新
        this.$nextTick(() => {
          console.log('开始渲染推荐路径小地图')
          this.recommendations.forEach((rec, index) => {
            this.renderRecommendationSmallMap(rec, index)
          })
        })

        console.log('分析结果处理完成')
        console.log('热点数量:', this.hotspots.length)
        console.log('SW-FP模式数量:', this.swfpPatterns.length)
        console.log('GSCM模式数量:', this.gscmPatterns.length)
        console.log('推荐数量:', this.recommendations.length)
      } catch (error) {
        console.error('渲染结果时出错:', error)
        this.$message.error('渲染结果失败')
      }
    },

    // 渲染热点地图和推荐路径
    renderHotspots() {
      if (!this.amap) {
        return
      }

      try {
        console.log(`准备渲染${this.hotspots.length}个热点标记`)

        // 清除之前的标记和路径
        this.amap.clearMap()

        // 如果启用轨迹显示，先渲染轨迹点
        if (this.showTrajectory) {
          this.renderTrajectoryPoints()
        }

        // 添加热点标记
        this.hotspots.forEach((hotspot, index) => {
          if (hotspot.latitude && hotspot.longitude) {
            const marker = new window.AMap.Marker({
              position: [hotspot.longitude, hotspot.latitude], // 高德地图使用 [lng, lat] 格式
              title: hotspot.hotspot_type || '热点区域',
              label: {
                content: `${hotspot.hotspot_type || '热点'} (${hotspot.visit_count}次)`,
                direction: 'top'
              }
            })

            // 添加点击事件
            marker.on('click', () => {
              const infoWindow = new window.AMap.InfoWindow({
                content: `
                  <div style="padding: 10px;">
                    <h4>${hotspot.hotspot_type || '未知'}</h4>
                    <p>访问次数: ${hotspot.visit_count}</p>
                    <p>半径: ${hotspot.radius_m}m</p>
                    <p>置信度: ${(hotspot.confidence || 0).toFixed(2)}</p>
                  </div>
                `,
                offset: new window.AMap.Pixel(0, -30)
              })
              infoWindow.open(this.amap, marker.getPosition())
            })

            this.amap.add(marker)
          }
        })

        // 渲染推荐路径
        this.renderRecommendationRoutes()

        console.log('热点和路径渲染完成')
      } catch (error) {
        console.error('渲染热点时出错:', error)
      }
    },

    // 渲染原始轨迹点
    renderTrajectoryPoints() {
      if (!this.amap || !this.currentTaskData || !this.currentTaskData.trajectoryData) {
        return
      }

      try {
        // 解析轨迹数据
        let trajectoryData
        if (typeof this.currentTaskData.trajectoryData === 'string') {
          trajectoryData = JSON.parse(this.currentTaskData.trajectoryData)
        } else {
          trajectoryData = this.currentTaskData.trajectoryData
        }

        const points = trajectoryData.points || trajectoryData
        if (!Array.isArray(points) || points.length === 0) {
          return
        }

        console.log(`准备渲染${points.length}个轨迹点`)

        // 绘制轨迹线
        const path = points.map(point => [point.lng || point.longitude, point.lat || point.latitude])
        const polyline = new window.AMap.Polyline({
          path: path,
          strokeColor: '#409EFF',
          strokeOpacity: 0.6,
          strokeWeight: 3,
          strokeStyle: 'solid',
          lineJoin: 'round'
        })

        this.amap.add(polyline)

        // 添加轨迹点标记
        points.forEach((point, index) => {
          const lng = point.lng || point.longitude
          const lat = point.lat || point.latitude
          const name = point.name || `点${index + 1}`

          // 重要地点使用特殊标记
          const isImportant = index === 0 || index === points.length - 1 ||
                           point.name && point.name !== '未知地点'

          const marker = new window.AMap.Marker({
            position: [lng, lat],
            icon: new window.AMap.Icon({
              size: isImportant ? new window.AMap.Size(25, 34) : new window.AMap.Size(12, 12),
              image: isImportant ?
                'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUiIGhlaWdodD0iMzQiIHZpZXdCb3g9IjAgMCAyNSAzNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIuNSIgY3k9IjEyLjUiIHI9IjEyLjUiIGZpbGw9IiM0MDlFRkYiLz4KPGNpcmNsZSBjeD0iMTIuNSIgY3k9IjEyLjUiIHI9IjQiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=' :
                'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCAxMiAxMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iNiIgY3k9IjYiIHI9IjYiIGZpbGw9IiM5MEE0RjAiLz4KPGNpcmNsZSBjeD0iNiIgY3k9IjYiIHI9IjIiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=',
              imageOffset: new window.AMap.Pixel(-12, -34)
            }),
            title: name,
            label: isImportant ? {
              content: name,
              direction: 'top'
            } : undefined
          })

          // 添加点击事件
          marker.on('click', () => {
            const infoWindow = new window.AMap.InfoWindow({
              content: `
                <div style="padding: 8px; min-width: 150px;">
                  <h4 style="margin: 0 0 5px 0;">${name}</h4>
                  <p style="margin: 2px 0; font-size: 12px;">时间: ${point.time || '未知'}</p>
                  <p style="margin: 2px 0; font-size: 12px;">坐标: ${lat.toFixed(4)}, ${lng.toFixed(4)}</p>
                  <p style="margin: 2px 0; font-size: 12px;">序号: ${index + 1}/${points.length}</p>
                </div>
              `,
              offset: new window.AMap.Pixel(0, -30)
            })
            infoWindow.open(this.amap, marker.getPosition())
          })

          this.amap.add(marker)
        })

        console.log('轨迹点渲染完成')
      } catch (error) {
        console.error('渲染轨迹点时出错:', error)
      }
    },

    // 渲染推荐路径
    renderRecommendationRoutes() {
      console.log('开始渲染推荐路径...')
      console.log('推荐路径数据:', this.recommendations)

      if (!this.amap || !Array.isArray(this.recommendations) || this.recommendations.length === 0) {
        console.log('跳过推荐路径渲染：地图未初始化或无推荐数据')
        return
      }

      try {
        console.log(`准备渲染${this.recommendations.length}条推荐路径`)

        // 为每条推荐路径绘制线路
        this.recommendations.forEach((rec, index) => {
          if (Array.isArray(rec.waypoints) && rec.waypoints.length > 1) {
            const path = rec.waypoints.map(point => [point.longitude, point.latitude])

            // 创建路径样式
            const strokeColor = index === 0 ? '#FF4500' : '#1E90FF' // 最佳路径用红色，其他用蓝色
            const strokeOpacity = index === 0 ? 0.8 : 0.6
            const strokeWeight = index === 0 ? 6 : 4

            // 绘制路径
            const polyline = new window.AMap.Polyline({
              path: path,
              strokeColor: strokeColor,
              strokeOpacity: strokeOpacity,
              strokeWeight: strokeWeight,
              strokeStyle: 'solid',
              lineJoin: 'round'
            })

            this.amap.add(polyline)

            // 为每个路径点添加地点名称标记
            rec.waypoints.forEach((waypoint, waypointIndex) => {
              console.log(`渲染路径点 ${waypointIndex}:`, waypoint.name, waypoint.longitude, waypoint.latitude)

              const marker = new window.AMap.Marker({
                position: [waypoint.longitude, waypoint.latitude],
                icon: new window.AMap.Icon({
                  size: new window.AMap.Size(20, 20),
                  image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iOCIgZmlsbD0iIzFFOTBGRiIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIi8+Cjwvc3ZnPgo=',
                  imageOffset: new window.AMap.Pixel(-10, -10)
                }),
                title: waypoint.name || `路径点${waypointIndex + 1}`,
                label: {
                  content: waypoint.name || `点${waypointIndex + 1}`,
                  direction: 'top'
                },
                anchor: 'bottom-center'
              })

              this.amap.add(marker)

              // 如果标签没有显示，尝试使用文本标记
              if (waypoint.name && waypoint.name !== `点${waypointIndex + 1}`) {
                const textMarker = new window.AMap.Text({
                  text: waypoint.name,
                  position: [waypoint.longitude, waypoint.latitude],
                  anchor: 'top-center',
                  style: {
                    'background-color': 'rgba(255, 255, 255, 0.9)',
                    'border': '1px solid #1E90FF',
                    'border-radius': '4px',
                    'padding': '2px 6px',
                    'font-size': '12px',
                    'color': '#333',
                    'box-shadow': '0 2px 4px rgba(0,0,0,0.1)'
                  }
                })

                this.amap.add(textMarker)
                console.log(`添加文本标记: ${waypoint.name}`)
              }
            })

            // 为路径添加点击事件
            polyline.on('click', () => {
              const infoWindow = new window.AMap.InfoWindow({
                content: `
                  <div style="padding: 10px; min-width: 200px;">
                    <h4 style="margin: 0 0 8px 0; color: ${index === 0 ? '#FF4500' : '#1E90FF'};">
                      ${index === 0 ? '🏆 ' : ''}推荐路径 #${rec.rank}
                    </h4>
                    <p style="margin: 4px 0;"><strong>评分:</strong> ${(rec.score || 0).toFixed(2)}</p>
                    <p style="margin: 4px 0;"><strong>置信度:</strong> ${(rec.confidence || 0).toFixed(2)}</p>
                    <p style="margin: 4px 0;"><strong>距离:</strong> ${rec.estimated_distance || 0}m</p>
                    <p style="margin: 4px 0;"><strong>预计时间:</strong> ${Math.round((rec.estimated_time || 0) / 60)}分钟</p>
                    <p style="margin: 4px 0;"><strong>算法:</strong> ${rec.algorithm || 'Unknown'}</p>
                    <hr style="margin: 8px 0;">
                    <p style="margin: 4px 0; font-size: 12px; color: #666;">${rec.explanation || '暂无解释'}</p>
                    <p style="margin: 4px 0; font-size: 12px; color: #666;">
                      <strong>路径点:</strong> ${rec.waypoints.map(wp => wp.name || '未知地点').join(' → ')}
                    </p>
                  </div>
                `,
                offset: new window.AMap.Pixel(0, -20)
              })
              infoWindow.open(this.amap, polyline.getPath()[Math.floor(polyline.getPath().length / 2)])
            })
          }

          // 同时渲染推荐卡片中的小地图
          this.renderRecommendationSmallMap(rec, index)
        })

        // 自动调整视野
        this.amap.setFitView()

        console.log('推荐路径渲染完成')
      } catch (error) {
        console.error('渲染推荐路径时出错:', error)
      }
    },

    // 渲染推荐路径小地图
    renderRecommendationSmallMap(rec, index) {
      try {
        const mapId = `recommendation-map-${index}`
        const mapElement = document.getElementById(mapId)

        console.log(`渲染推荐路径 #${index + 1} 小地图:`, {
          mapId,
          hasElement: !!mapElement,
          waypoints: rec.waypoints,
          waypointsCount: rec.waypoints?.length
        })

        if (!mapElement || !Array.isArray(rec.waypoints) || rec.waypoints.length < 2) {
          console.warn(`推荐路径 #${index + 1} 数据不足，跳过渲染`)
          return
        }

        // 清除之前的地图实例
        if (this.recommendationMaps[mapId]) {
          this.recommendationMaps[mapId].destroy()
          delete this.recommendationMaps[mapId]
        }

        // 创建小地图实例
        const map = new window.AMap.Map(mapId, {
          zoom: 12,
          center: [rec.waypoints[0].longitude, rec.waypoints[0].latitude],
          viewMode: '2D'
        })

        // 绘制路径
        const path = rec.waypoints.map(point => [point.longitude, point.latitude])
        const strokeColor = index === 0 ? '#FF4500' : '#1E90FF'

        console.log(`推荐路径 #${index + 1} 路径点:`, path)

        const polyline = new window.AMap.Polyline({
          path: path,
          strokeColor: strokeColor,
          strokeOpacity: 0.8,
          strokeWeight: 4,
          strokeStyle: 'solid',
          lineJoin: 'round'
        })

        map.add(polyline)

        // 添加起点和终点标记
        const startMarker = new window.AMap.Marker({
          position: [rec.waypoints[0].longitude, rec.waypoints[0].latitude],
          icon: new window.AMap.Icon({
            size: new window.AMap.Size(20, 30),
            image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMzAiIHZpZXdCb3g9IjAgMCAyMCAzMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iOCIgZmlsbD0iIzAzQTU0RiIvPgo8Y2lyY2xlIGN4PSIxMCIgY3k9IjEwIiByPSI0IiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4=',
            imageOffset: new window.AMap.Pixel(-10, -30)
          }),
          title: `起点: ${rec.waypoints[0].name || '未知'}`
        })

        const endMarker = new window.AMap.Marker({
          position: [rec.waypoints[rec.waypoints.length - 1].longitude, rec.waypoints[rec.waypoints.length - 1].latitude],
          icon: new window.AMap.Icon({
            size: new window.AMap.Size(20, 30),
            image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMzAiIHZpZXdCb3g9IjAgMCAyMCAzMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iOCIgZmlsbD0iI0ZGNDUwMCIvPgo8Y2lyY2xlIGN4PSIxMCIgY3k9IjEwIiByPSI0IiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4=',
            imageOffset: new window.AMap.Pixel(-10, -30)
          }),
          title: `终点: ${rec.waypoints[rec.waypoints.length - 1].name || '未知'}`
        })

        map.add(startMarker)
        map.add(endMarker)

        // 为每个路径点添加地点名称标记
        rec.waypoints.forEach((waypoint, waypointIndex) => {
          console.log(`小地图渲染路径点 ${waypointIndex}:`, waypoint.name)

          // 添加路径点标记
          const waypointMarker = new window.AMap.Marker({
            position: [waypoint.longitude, waypoint.latitude],
            icon: new window.AMap.Icon({
              size: new window.AMap.Size(16, 16),
              image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iOCIgY3k9IjgiIHI9IjYiIGZpbGw9IiMxRTkwRkYiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPgo8L3N2Zz4=',
              imageOffset: new window.AMap.Pixel(-8, -8)
            }),
            title: waypoint.name || `路径点${waypointIndex + 1}`
          })

          map.add(waypointMarker)

          // 添加地点名称文本标记
          if (waypoint.name && waypoint.name !== `点${waypointIndex + 1}`) {
            const textMarker = new window.AMap.Text({
              text: waypoint.name,
              position: [waypoint.longitude, waypoint.latitude],
              anchor: 'bottom-center',
              style: {
                'background-color': 'rgba(255, 255, 255, 0.9)',
                'border': '1px solid #1E90FF',
                'border-radius': '3px',
                'padding': '1px 4px',
                'font-size': '10px',
                'color': '#333',
                'box-shadow': '0 1px 2px rgba(0,0,0,0.1)'
              }
            })

            map.add(textMarker)
            console.log(`小地图添加文本标记: ${waypoint.name}`)
          }
        })

        // 自动调整视野
        map.setFitView()

        // 保存地图实例
        this.recommendationMaps[mapId] = map

        console.log(`推荐路径 #${index + 1} 小地图渲染完成`)
      } catch (error) {
        console.error(`渲染推荐路径 #${index + 1} 小地图时出错:`, error)
      }
    },

    // 刷新结果
    refreshResults() {
      if (this.currentTaskId) {
        this.loadTaskResults(this.currentTaskId)
      }
    },

    // 标签页切换
    handleTabClick(tab) {
      this.activeTab = tab.name
      // 当切换到路径推荐标签页时，重新渲染地图以确保路径显示
      if (tab.name === 'recommendation') {
        this.$nextTick(() => {
          this.renderHotspots()
        })
      }
    },

    // 安全获取路径点数量
    getWaypointsCount(waypoints) {
      if (!Array.isArray(waypoints)) return 0
      return waypoints.length
    },

    // 适配热点数据格式
    adaptHotspotsData(hotspots) {
      console.log('原始热点数据:', hotspots)
      if (!Array.isArray(hotspots)) return []

      const adapted = hotspots.map(hotspot => ({
        latitude: hotspot.center_latitude || hotspot.latitude,
        longitude: hotspot.center_longitude || hotspot.longitude,
        radius_m: hotspot.radius_m || 100,
        visit_count: hotspot.visit_count || hotspot.pointCount || 0,
        hotspot_type: hotspot.hotspot_type || '未知',
        confidence: hotspot.confidence || 0.8,
        visit_frequency: hotspot.visit_frequency || 0,
        time_span_hours: hotspot.time_span_hours || 0,
        avg_stay_time_minutes: hotspot.avg_stay_time_minutes || 0
      }))

      console.log('适配后的热点数据:', adapted)
      return adapted
    },

    // 适配语义轨迹数据格式
    adaptSemanticTrajectoryData(semanticData) {
      console.log('原始语义轨迹数据:', semanticData)
      if (!semanticData) return null

      const adapted = {
        semanticSequence: semanticData.semantic_sequence || semanticData.semanticSequence || [],
        stayPoints: (semanticData.stay_points || semanticData.stayPoints || []).map(point => ({
          latitude: point.center_latitude || point.latitude,
          longitude: point.center_longitude || point.longitude,
          semantic_label: point.semantic_label || point.semanticLabel || '未知',
          semantic_type: point.semantic_type || point.semanticType || '未知',
          duration_minutes: point.duration_minutes || point.durationMinutes || 0,
          confidence: point.confidence || 0.8,
          start_time: point.start_time || point.startTime || '',
          end_time: point.end_time || point.endTime || ''
        }))
      }

      console.log('适配后的语义轨迹数据:', adapted)
      return adapted
    },

    // 辅助函数
    getAlgorithmName(algorithm) {
      const names = {
        'both': 'SW-FP-TRtree + GSCM-SW',
        'sw_fp': 'SW-FP-TRtree',
        'gscm_sw': 'GSCM-SW'
      }
      return names[algorithm] || algorithm
    },

    getStatusType(status) {
      const types = {
        'running': 'warning',
        'completed': 'success',
        'error': 'danger'
      }
      return types[status] || 'info'
    },

    getStatusText(status) {
      const texts = {
        'running': '运行中',
        'completed': '已完成',
        'error': '失败'
      }
      return texts[status] || status
    }
  }
}
</script>

<style scoped>
.app-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.box-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-title {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.api-status {
  margin-top: 10px;
  text-align: center;
}

.hotspot-card {
  margin-bottom: 12px;
  border-radius: 4px;
}

.recommendation-card {
  margin-bottom: 16px;
  border-radius: 8px;
}

.recommendation-card.best {
  border: 2px solid #409eff;
  box-shadow: 0 4px 12px 0 rgba(64, 158, 255, 0.2);
}

.recommendation-small-map {
  height: 200px;
  background: #f0f2f5;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  position: relative;
}

/* 确保表格铺满容器 */
.el-table {
  width: 100% !important;
}

.el-table__body-wrapper {
  width: 100% !important;
}

.el-table__header-wrapper {
  width: 100% !important;
}
</style>
