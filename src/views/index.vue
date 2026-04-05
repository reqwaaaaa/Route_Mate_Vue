<template>
  <div class="dashboard-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="dashboard-title">
          <i class="el-icon-monitor"></i>
          系统概览仪表板
        </h1>
        <p class="dashboard-subtitle">实时监控系统运行状态和数据统计</p>
        <div class="update-time">
          <i class="el-icon-time"></i>
          最后更新：{{ updateTime }}
        </div>
      </div>
    </div>

    <!-- 系统统计概览 -->
    <div class="stats-section">
      <el-row :gutter="24">
        <el-col :xs="12" :sm="6" :md="6" :lg="6" v-for="(item, index) in overviewStats" :key="index">
          <div class="stats-card" @click="handleStatsClick(item)">
            <div class="stats-content">
              <div class="stats-icon-wrapper">
                <div class="stats-icon" :style="{ background: item.color }">
                  <i :class="item.icon"></i>
                </div>
              </div>
              <div class="stats-details">
                <div class="stats-number" :data-value="item.value">{{ item.value }}</div>
                <div class="stats-label">{{ item.label }}</div>
                <div class="stats-trend" v-if="item.trend">
                  <i :class="item.trend > 0 ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i>
                  <span>{{ Math.abs(item.trend) }}%</span>
                </div>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 图表区域 -->
    <div class="charts-section">
      <!-- 第一行图表 -->
      <el-row :gutter="24" class="chart-row">
        <el-col :xs="24" :sm="24" :md="12" :lg="12">
          <div class="chart-container">
            <div class="chart-header">
              <div class="chart-title">
                <i class="el-icon-pie-chart"></i>
                <span>POI类别统计</span>
              </div>
              <div class="chart-subtitle">各类兴趣点分布情况</div>
            </div>
            <div class="chart-content">
              <div ref="poiStatsChart" class="chart-canvas"></div>
            </div>
          </div>
        </el-col>
        
        <el-col :xs="24" :sm="24" :md="12" :lg="12">
          <div class="chart-container">
            <div class="chart-header">
              <div class="chart-title">
                <i class="el-icon-s-data"></i>
                <span>热点排行榜</span>
              </div>
              <div class="chart-subtitle">热门区域访问排行</div>
            </div>
            <div class="chart-content">
              <div ref="hotspotStatsChart" class="chart-canvas"></div>
            </div>
          </div>
        </el-col>
      </el-row>

      <!-- 第二行图表 -->
      <el-row :gutter="24" class="chart-row">
        <el-col :xs="24" :sm="24" :md="12" :lg="12">
          <div class="chart-container">
            <div class="chart-header">
              <div class="chart-title">
                <i class="el-icon-user"></i>
                <span>用户活跃度</span>
              </div>
              <div class="chart-subtitle">用户活跃程度分析</div>
            </div>
            <div class="chart-content">
              <div ref="userStatsChart" class="chart-canvas"></div>
            </div>
          </div>
        </el-col>
        
        <el-col :xs="24" :sm="24" :md="12" :lg="12">
          <div class="chart-container">
            <div class="chart-header">
              <div class="chart-title">
                <i class="el-icon-time"></i>
                <span>出行时间分布</span>
              </div>
              <div class="chart-subtitle">24小时出行热力分析</div>
            </div>
            <div class="chart-content">
              <div ref="trajectoryStatsChart" class="chart-canvas"></div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { getSystemOverview, getUserTrend, getOnlineTrend, getModuleUsage, getPoiStats, getHotspotStats, getUserStats, getTrajectoryStats } from '@/api/system/index'

export default {
  name: "Index",
  data() {
    return {
      // 版本号
      version: "3.9.0",
      // 当前时间
      currentTime: '',
      // 概览统计数据
      overviewStats: [
        {
          label: '总用户数',
          value: 0,
          icon: 'el-icon-user-solid',
          color: 'linear-gradient(135deg, #4A90E2 0%, #5CA9E8 100%)',
          trend: null
        },
        {
          label: '在线用户',
          value: 0,
          icon: 'el-icon-monitor',
          color: 'linear-gradient(135deg, #67B8F5 0%, #81D4FA 100%)',
          trend: null
        },
        {
          label: '今日新增',
          value: 0,
          icon: 'el-icon-plus',
          color: 'linear-gradient(135deg, #64B5F6 0%, #90CAF9 100%)',
          trend: null
        },
        {
          label: '总访问量',
          value: 0,
          icon: 'el-icon-view',
          color: 'linear-gradient(135deg, #42A5F5 0%, #64B5F6 100%)',
          trend: null
        }
      ],
      // 系统信息
      systemInfo: {
        runningDays: 0
      },
      // 更新时间
      updateTime: '',
      // 图表实例
      poiStatsChart: null,
      hotspotStatsChart: null,
      userStatsChart: null,
      trajectoryStatsChart: null,
      // 定时器
      timeTimer: null
    }
  },
  mounted() {
    this.initData()
    this.startTimeUpdate()
    // 添加窗口大小改变事件监听
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    // 清除定时器
    if (this.timeTimer) {
      clearInterval(this.timeTimer)
    }
    // 移除事件监听
    window.removeEventListener('resize', this.handleResize)
    // 销毁图表实例
    this.destroyCharts()
  },
  methods: {
    // 开始时间更新
    startTimeUpdate() {
      this.updateCurrentTime()
      this.timeTimer = setInterval(() => {
        this.updateCurrentTime()
      }, 1000)
    },
    
    // 更新当前时间
    updateCurrentTime() {
      this.currentTime = new Date().toLocaleString()
    },
    
    // 处理窗口大小改变
    handleResize() {
      this.$nextTick(() => {
        if (this.poiStatsChart) this.poiStatsChart.resize()
        if (this.hotspotStatsChart) this.hotspotStatsChart.resize()
        if (this.userStatsChart) this.userStatsChart.resize()
        if (this.trajectoryStatsChart) this.trajectoryStatsChart.resize()
      })
    },
    
    // 销毁图表
    destroyCharts() {
      if (this.poiStatsChart) {
        this.poiStatsChart.dispose()
        this.poiStatsChart = null
      }
      if (this.hotspotStatsChart) {
        this.hotspotStatsChart.dispose()
        this.hotspotStatsChart = null
      }
      if (this.userStatsChart) {
        this.userStatsChart.dispose()
        this.userStatsChart = null
      }
      if (this.trajectoryStatsChart) {
        this.trajectoryStatsChart.dispose()
        this.trajectoryStatsChart = null
      }
    },
    
    // 处理统计卡片点击
    handleStatsClick(item) {
      this.$message.info(`点击了${item.label}统计`)
    },
    
    // 初始化数据
    async initData() {
      try {
        await this.loadOverviewData()
        await this.$nextTick()
        await Promise.all([
          this.loadPoiStatsChart(),
          this.loadHotspotStatsChart(),
          this.loadUserStatsChart(),
          this.loadTrajectoryStatsChart()
        ])
        this.updateTime = new Date().toLocaleString()
      } catch (error) {
        console.error('加载数据失败:', error)
        this.$message.error('数据加载失败，请稍后重试')
      }
    },
    
    // 加载概览数据
    async loadOverviewData() {
      const { data } = await getSystemOverview()
      this.overviewStats[0].value = data.totalUsers || 0
      this.overviewStats[1].value = data.onlineUsers || 0
      this.overviewStats[2].value = data.todayNewUsers || 0
      this.overviewStats[3].value = data.totalVisits || 0
      this.systemInfo.runningDays = data.runningDays || 0
      
      // 模拟趋势数据
      this.overviewStats[0].trend = 5.2
      this.overviewStats[1].trend = -2.1
      this.overviewStats[2].trend = 12.5
      this.overviewStats[3].trend = 8.3
    },

    // 加载用户注册趋势图
    async loadUserTrendChart() {
      if (!this.$refs.userTrendChart) return
      
      const { data } = await getUserTrend()
      this.userTrendChart = echarts.init(this.$refs.userTrendChart)
      
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            crossStyle: {
              color: '#999'
            }
          },
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderColor: '#4A90E2',
          borderWidth: 1,
          textStyle: {
            color: '#333'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '8%',
          top: '10%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: data.dates,
          axisLabel: {
            formatter: function(value) {
              return value.substring(5)
            },
            color: '#666'
          },
          axisLine: {
            lineStyle: {
              color: '#e0e0e0'
            }
          }
        },
        yAxis: {
          type: 'value',
          minInterval: 1,
          axisLabel: {
            color: '#666'
          },
          axisLine: {
            lineStyle: {
              color: '#e0e0e0'
            }
          },
          splitLine: {
            lineStyle: {
              color: '#f0f0f0'
            }
          }
        },
        series: [{
          data: data.counts,
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [{
                offset: 0, color: 'rgba(74, 144, 226, 0.3)'
              }, {
                offset: 1, color: 'rgba(74, 144, 226, 0.05)'
              }]
            }
          },
          lineStyle: {
            color: '#4A90E2',
            width: 3
          },
          itemStyle: {
            color: '#4A90E2',
            borderColor: '#fff',
            borderWidth: 2
          }
        }]
      }
      
      this.userTrendChart.setOption(option)
    },

    // 加载在线用户趋势图
    async loadOnlineTrendChart() {
      if (!this.$refs.onlineTrendChart) return
      
      const { data } = await getOnlineTrend()
      this.onlineTrendChart = echarts.init(this.$refs.onlineTrendChart)
      
      const option = {
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderColor: '#81D4FA',
          borderWidth: 1,
          textStyle: {
            color: '#333'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '8%',
          top: '10%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: data.hours,
          axisLabel: {
            color: '#666'
          },
          axisLine: {
            lineStyle: {
              color: '#e0e0e0'
            }
          }
        },
        yAxis: {
          type: 'value',
          minInterval: 1,
          axisLabel: {
            color: '#666'
          },
          axisLine: {
            lineStyle: {
              color: '#e0e0e0'
            }
          },
          splitLine: {
            lineStyle: {
              color: '#f0f0f0'
            }
          }
        },
        series: [{
          data: data.counts,
          type: 'bar',
          barWidth: '60%',
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [{
                offset: 0, color: '#67B8F5'
              }, {
                offset: 1, color: '#81D4FA'
              }]
            },
            borderRadius: [4, 4, 0, 0]
          }
        }]
      }
      
      this.onlineTrendChart.setOption(option)
    },

    // 加载模块使用统计图
    async loadModuleUsageChart() {
      if (!this.$refs.moduleUsageChart) return
      
      const { data } = await getModuleUsage()
      this.moduleUsageChart = echarts.init(this.$refs.moduleUsageChart)
      
      const colors = ['#4A90E2', '#5CA9E8', '#67B8F5', '#81D4FA', '#90CAF9', '#64B5F6', '#42A5F5', '#2196F3']
      
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderColor: '#ddd',
          borderWidth: 1,
          textStyle: {
            color: '#333'
          }
        },
        legend: {
          orient: 'vertical',
          left: 10,
          top: 20,
          data: data.map(item => item.name),
          textStyle: {
            color: '#666'
          }
        },
        series: [{
          name: '模块使用量',
          type: 'pie',
          radius: ['45%', '70%'],
          center: ['65%', '50%'],
          avoidLabelOverlap: false,
          label: {
            show: false
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '14',
              fontWeight: 'bold'
            },
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          labelLine: {
            show: false
          },
          data: data.map((item, index) => ({
            ...item,
            itemStyle: {
              color: colors[index % colors.length],
              borderRadius: 8,
              borderColor: '#fff',
              borderWidth: 2
            }
          }))
        }]
      }
      
      this.moduleUsageChart.setOption(option)
    },

    // 加载POI类别统计图（饼图）
    async loadPoiStatsChart() {
      if (!this.$refs.poiStatsChart) return
      
      const { data } = await getPoiStats()
      this.poiStatsChart = echarts.init(this.$refs.poiStatsChart)
      
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderColor: '#4A90E2',
          borderWidth: 1,
          textStyle: {
            color: '#333'
          }
        },
        legend: {
          orient: 'vertical',
          left: 10,
          top: 20,
          textStyle: {
            color: '#666'
          }
        },
        series: [{
          name: 'POI类别',
          type: 'pie',
          radius: ['45%', '70%'],
          center: ['65%', '50%'],
          avoidLabelOverlap: false,
          label: {
            show: false
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '14',
              fontWeight: 'bold'
            },
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          labelLine: {
            show: false
          },
          data: data.map((item, index) => ({
            ...item,
            itemStyle: {
              color: ['#4A90E2', '#5CA9E8', '#67B8F5', '#81D4FA', '#90CAF9', '#64B5F6'][index % 6],
              borderRadius: 8,
              borderColor: '#fff',
              borderWidth: 2
            }
          }))
        }]
      }
      
      this.poiStatsChart.setOption(option)
    },

    // 加载热点排行图（柱状图）
    async loadHotspotStatsChart() {
      if (!this.$refs.hotspotStatsChart) return
      
      const { data } = await getHotspotStats()
      this.hotspotStatsChart = echarts.init(this.$refs.hotspotStatsChart)
      
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            crossStyle: {
              color: '#999'
            }
          },
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderColor: '#5CA9E8',
          borderWidth: 1,
          textStyle: {
            color: '#333'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '8%',
          top: '10%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: data.map(item => item.name),
          axisLabel: {
            color: '#666',
            rotate: 45
          },
          axisLine: {
            lineStyle: {
              color: '#e0e0e0'
            }
          }
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            color: '#666'
          },
          axisLine: {
            lineStyle: {
              color: '#e0e0e0'
            }
          },
          splitLine: {
            lineStyle: {
              color: '#f0f0f0'
            }
          }
        },
        series: [{
          data: data.map(item => item.value),
          type: 'bar',
          barWidth: '60%',
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [{
                offset: 0, color: '#5CA9E8'
              }, {
                offset: 1, color: '#81D4FA'
              }]
            },
            borderRadius: [4, 4, 0, 0]
          }
        }]
      }
      
      this.hotspotStatsChart.setOption(option)
    },

    // 加载用户活跃度图
    async loadUserStatsChart() {
      if (!this.$refs.userStatsChart) return
      
      const { data } = await getUserStats()
      this.userStatsChart = echarts.init(this.$refs.userStatsChart)
      
      const option = {
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderColor: '#67B8F5',
          borderWidth: 1,
          textStyle: {
            color: '#333'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '8%',
          top: '10%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: data.map(item => item.name),
          axisLabel: {
            color: '#666'
          },
          axisLine: {
            lineStyle: {
              color: '#e0e0e0'
            }
          }
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            color: '#666'
          },
          axisLine: {
            lineStyle: {
              color: '#e0e0e0'
            }
          },
          splitLine: {
            lineStyle: {
              color: '#f0f0f0'
            }
          }
        },
        series: [{
          data: data.map(item => item.value),
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [{
                offset: 0, color: 'rgba(103, 184, 245, 0.3)'
              }, {
                offset: 1, color: 'rgba(103, 184, 245, 0.05)'
              }]
            }
          },
          lineStyle: {
            color: '#67B8F5',
            width: 3
          },
          itemStyle: {
            color: '#67B8F5',
            borderColor: '#fff',
            borderWidth: 2
          }
        }]
      }
      
      this.userStatsChart.setOption(option)
    },

    // 加载出行时间分布图
    async loadTrajectoryStatsChart() {
      if (!this.$refs.trajectoryStatsChart) return
      
      const { data } = await getTrajectoryStats()
      this.trajectoryStatsChart = echarts.init(this.$refs.trajectoryStatsChart)
      
      const option = {
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderColor: '#90CAF9',
          borderWidth: 1,
          textStyle: {
            color: '#333'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '8%',
          top: '10%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: data.map(item => item.hour),
          axisLabel: {
            color: '#666'
          },
          axisLine: {
            lineStyle: {
              color: '#e0e0e0'
            }
          }
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            color: '#666'
          },
          axisLine: {
            lineStyle: {
              color: '#e0e0e0'
            }
          },
          splitLine: {
            lineStyle: {
              color: '#f0f0f0'
            }
          }
        },
        series: [{
          data: data.map(item => item.count),
          type: 'bar',
          barWidth: '60%',
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [{
                offset: 0, color: '#90CAF9'
              }, {
                offset: 1, color: '#64B5F6'
              }]
            },
            borderRadius: [4, 4, 0, 0]
          }
        }]
      }
      
      this.trajectoryStatsChart.setOption(option)
    }
  }
}
</script>

<style scoped lang="scss">
.dashboard-container {
  min-height: calc(100vh - 84px);
  background: linear-gradient(135deg, #E8F4FD 0%, #F0F8FF 100%);
  padding: 24px;
  
  // 页面标题区域
  .page-header {
    background: white;
    border-radius: 12px;
    padding: 32px;
    margin-bottom: 24px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    position: relative;
    overflow: hidden;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #4A90E2 0%, #5CA9E8 50%, #81D4FA 100%);
    }
    
    .header-content {
      position: relative;
      z-index: 1;
    }
    
    .dashboard-title {
      margin: 0 0 8px 0;
      font-size: 28px;
      font-weight: 600;
      color: #1f2937;
      display: flex;
      align-items: center;
      
      i {
        margin-right: 12px;
        color: #4A90E2;
        font-size: 32px;
      }
    }
    
    .dashboard-subtitle {
      margin: 0 0 16px 0;
      font-size: 16px;
      color: #6b7280;
      line-height: 1.6;
    }
    
    .update-time {
      display: inline-flex;
      align-items: center;
      padding: 8px 16px;
      background: rgba(74, 144, 226, 0.1);
      border-radius: 20px;
      font-size: 14px;
      color: #4A90E2;
      
      i {
        margin-right: 6px;
      }
    }
  }
  
  // 统计概览区域
  .stats-section {
    margin-bottom: 24px;
    
    .stats-card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
      transition: all 0.3s ease;
      cursor: pointer;
      border: 2px solid transparent;
      height: 120px;
      
      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        border-color: rgba(74, 144, 226, 0.3);
      }
      
      .stats-content {
        display: flex;
        align-items: center;
        height: 100%;
        
        .stats-icon-wrapper {
          margin-right: 20px;
          
          .stats-icon {
            width: 64px;
            height: 64px;
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            
            i {
              font-size: 28px;
              color: white;
            }
          }
        }
        
        .stats-details {
          flex: 1;
          
          .stats-number {
            font-size: 32px;
      font-weight: 700;
            color: #1f2937;
            line-height: 1;
            margin-bottom: 4px;
          }
          
          .stats-label {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 8px;
          }
          
          .stats-trend {
            display: flex;
            align-items: center;
            font-size: 12px;
            font-weight: 500;
            
            &:has(.el-icon-arrow-up) {
              color: #10b981;
            }
            
            &:has(.el-icon-arrow-down) {
              color: #ef4444;
            }
            
            i {
              margin-right: 4px;
              font-size: 14px;
            }
          }
        }
      }
    }
  }
  
  // 图表区域
  .charts-section {
    .chart-row {
      margin-bottom: 24px;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
    
    .chart-container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
      overflow: hidden;
      height: 420px;
      display: flex;
      flex-direction: column;
      
      .chart-header {
        padding: 20px 24px 16px;
        background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        border-bottom: 1px solid #e2e8f0;
        
        .chart-title {
          display: flex;
          align-items: center;
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 4px;
          
          i {
            margin-right: 10px;
            color: #4A90E2;
            font-size: 20px;
          }
        }
        
        .chart-subtitle {
          font-size: 14px;
          color: #64748b;
        }
      }
      
      .chart-content {
        flex: 1;
        padding: 16px;
        display: flex;
        flex-direction: column;
        
        .chart-canvas {
          flex: 1;
          min-height: 280px;
        }
        
        // 技术栈特殊样式
        &.tech-stack {
          .tech-section {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 24px;
            
            .tech-category {
              .category-header {
                display: flex;
                align-items: center;
                margin-bottom: 12px;
                font-size: 16px;
                font-weight: 600;
                color: #374151;
                
                i {
                  margin-right: 8px;
                  color: #4A90E2;
                }
              }
              
              .tech-tags {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                
                .tech-tag {
                  padding: 6px 12px;
                  border-radius: 20px;
                  font-size: 13px;
                  font-weight: 500;
                  border: 1px solid;
                  transition: all 0.2s ease;
                  
                  &.backend {
                    background: rgba(74, 144, 226, 0.1);
                    color: #2C6AB8;
                    border-color: rgba(74, 144, 226, 0.25);
                    
                    &:hover {
                      background: rgba(74, 144, 226, 0.2);
                      transform: translateY(-1px);
                    }
                  }
                  
                  &.frontend {
                    background: rgba(129, 212, 250, 0.15);
                    color: #1976D2;
                    border-color: rgba(129, 212, 250, 0.3);
                    
                    &:hover {
                      background: rgba(129, 212, 250, 0.25);
                      transform: translateY(-1px);
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  
  // 系统信息区域
  .system-info-section {
    .info-card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
      
      .info-header {
        display: flex;
        align-items: center;
        margin-bottom: 20px;
        font-size: 18px;
        font-weight: 600;
        color: #1f2937;
        
        i {
          margin-right: 10px;
          color: #4A90E2;
          font-size: 20px;
        }
      }
      
      .info-content {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 16px;
        
        .info-item {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          background: #f8fafc;
          border-radius: 8px;
          border-left: 4px solid #4A90E2;
          
          .info-label {
            font-weight: 500;
            color: #374151;
            margin-right: 8px;
          }
          
          .info-value {
            color: #1f2937;
            font-weight: 600;
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .dashboard-container {
    .charts-section .chart-container {
      height: 380px;
      
      .chart-content .chart-canvas {
        min-height: 240px;
      }
    }
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 16px;
    
    .page-header {
      padding: 20px;
      
      .dashboard-title {
        font-size: 24px;
        
        i {
          font-size: 28px;
        }
      }
      
      .dashboard-subtitle {
        font-size: 14px;
      }
    }
    
    .stats-section .stats-card {
      margin-bottom: 16px;
      height: auto;
      min-height: 100px;
      
      .stats-content {
        .stats-details .stats-number {
          font-size: 24px;
        }
      }
    }
    
    .charts-section {
      .chart-row {
        margin-bottom: 16px;
      }
      
      .chart-container {
        height: 350px;
        
        .chart-content {
          &.tech-stack .tech-section {
            gap: 16px;
            
            .tech-category .tech-tags .tech-tag {
              font-size: 12px;
              padding: 4px 8px;
            }
          }
        }
      }
    }
    
    .system-info-section .info-card {
      .info-content {
        grid-template-columns: 1fr;
      }
    }
  }
}

@media (max-width: 480px) {
  .dashboard-container {
    .stats-section .stats-card .stats-content {
      flex-direction: column;
      text-align: center;
      
      .stats-icon-wrapper {
        margin-right: 0;
        margin-bottom: 12px;
      }
    }
  }
}
</style>

