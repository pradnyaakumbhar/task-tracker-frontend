import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import * as d3 from 'd3'
import { useAuth } from '@/context/authContext'
import axios from 'axios'

interface AnalyticsData {
  totalTasks: number
  statusDistribution: Array<{
    label: string
    value: number
    percentage: number
  }>
  priorityDistribution: Array<{
    label: string
    value: number
    percentage: number
  }>
}

interface TaskAnalyticsModalProps {
  isOpen: boolean
  onClose: () => void
  workspaceId: string
  workspaceName: string
}

const TaskAnalytics = ({
  isOpen,
  onClose,
  workspaceId,
  workspaceName,
}: TaskAnalyticsModalProps) => {
  const donutRef = useRef<SVGSVGElement>(null)
  const barRef = useRef<SVGSVGElement>(null)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const { token } = useAuth()

  // Color schemes
  const statusColors = {
    TODO: '#64748b',
    IN_PROGRESS: '#3b82f6',
    IN_REVIEW: '#f59e0b',
    DONE: '#10b981',
    CANCELLED: '#ef4444',
  }

  const priorityColors = {
    LOW: '#64748b',
    MEDIUM: '#3b82f6',
    HIGH: '#f59e0b',
    URGENT: '#ef4444',
  }

  const fetchAnalytics = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_APP_BASE_URL}/api/task/analytics`,
        { workspaceId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (response) {
        const data = await response.data
        setAnalyticsData(data.analytics)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const createDonutChart = (data: AnalyticsData['statusDistribution']) => {
    if (!donutRef.current || !data.length) return

    const svg = d3.select(donutRef.current)
    svg.selectAll('*').remove()

    const width = 300
    const height = 300
    const radius = Math.min(width, height) / 2
    const innerRadius = radius * 0.5

    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`)

    const pie = d3
      .pie<any>()
      .value((d) => d.value)
      .sort(null)

    const arc = d3.arc<any>().innerRadius(innerRadius).outerRadius(radius)

    const arcs = g
      .selectAll('.arc')
      .data(pie(data))
      .enter()
      .append('g')
      .attr('class', 'arc')

    // Add slices
    arcs
      .append('path')
      .attr('d', arc)
      .attr(
        'fill',
        (d) =>
          statusColors[d.data.label as keyof typeof statusColors] || '#64748b'
      )
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('mouseover', function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('transform', 'scale(1.05)')

        // Show tooltip
        const tooltip = d3
          .select('body')
          .append('div')
          .attr('class', 'tooltip')
          .style('position', 'absolute')
          .style('background', 'rgba(0, 0, 0, 0.8)')
          .style('color', 'white')
          .style('padding', '8px')
          .style('border-radius', '4px')
          .style('font-size', '12px')
          .style('pointer-events', 'none')
          .style('z-index', '1000')
          .html(`${d.data.label}: ${d.data.value} (${d.data.percentage}%)`)
          .style('left', event.pageX + 10 + 'px')
          .style('top', event.pageY - 10 + 'px')
      })
      .on('mouseout', function () {
        d3.select(this).transition().duration(200).attr('transform', 'scale(1)')

        d3.selectAll('.tooltip').remove()
      })

    // Add center text
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.5em')
      .style('font-size', '24px')
      .style('font-weight', 'bold')
      .style('fill', '#374151')
      .text(data.reduce((sum, d) => sum + d.value, 0))

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1em')
      .style('font-size', '14px')
      .style('fill', '#6b7280')
      .text('Total Tasks')
  }

  const createBarChart = (data: AnalyticsData['priorityDistribution']) => {
    if (!barRef.current || !data.length) return

    const svg = d3.select(barRef.current)
    svg.selectAll('*').remove()

    const margin = { top: 20, right: 30, bottom: 40, left: 80 }
    const width = 400 - margin.left - margin.right
    const height = 250 - margin.bottom - margin.top

    const g = svg
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`)

    const x = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.value) || 0])
      .range([0, width])

    const y = d3
      .scaleBand()
      .domain(data.map((d) => d.label))
      .range([0, height])
      .padding(0.1)

    // Add bars
    g.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', 0)
      .attr('y', (d) => y(d.label) || 0)
      .attr('height', y.bandwidth())
      .attr(
        'fill',
        (d) =>
          priorityColors[d.label as keyof typeof priorityColors] || '#64748b'
      )
      .style('cursor', 'pointer')
      .on('mouseover', function (event, d) {
        d3.select(this).attr('opacity', 0.8)

        const tooltip = d3
          .select('body')
          .append('div')
          .attr('class', 'tooltip')
          .style('position', 'absolute')
          .style('background', 'rgba(0, 0, 0, 0.8)')
          .style('color', 'white')
          .style('padding', '8px')
          .style('border-radius', '4px')
          .style('font-size', '12px')
          .style('pointer-events', 'none')
          .style('z-index', '1000')
          .html(`${d.label}: ${d.value} tasks (${d.percentage}%)`)
          .style('left', event.pageX + 10 + 'px')
          .style('top', event.pageY - 10 + 'px')
      })
      .on('mouseout', function () {
        d3.select(this).attr('opacity', 1)
        d3.selectAll('.tooltip').remove()
      })
      .transition()
      .duration(1000)
      .attr('width', (d) => x(d.value))

    // Add value labels
    g.selectAll('.label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', (d) => x(d.value) + 5)
      .attr('y', (d) => (y(d.label) || 0) + y.bandwidth() / 2)
      .attr('dy', '0.35em')
      .style('font-size', '12px')
      .style('fill', '#374151')
      .text((d) => d.value)

    // Add axes
    g.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(x).ticks(5))

    g.append('g').call(d3.axisLeft(y))
  }

  useEffect(() => {
    if (isOpen && workspaceId) {
      setLoading(true)
      fetchAnalytics()
    }
  }, [isOpen, workspaceId])

  useEffect(() => {
    if (analyticsData && isOpen) {
      createDonutChart(analyticsData.statusDistribution)
      createBarChart(analyticsData.priorityDistribution)
    }
  }, [analyticsData, isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {workspaceName} - Task Analytics
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">Loading analytics...</span>
            </div>
          ) : !analyticsData || analyticsData.totalTasks === 0 ? (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <div className="text-6xl mb-4">📊</div>
                <p>No tasks found</p>
                <p className="text-sm">Create some tasks to see analytics</p>
              </div>
            </div>
          ) : (
            <>
              {/* Summary Stats */}
              {/* <div className="mb-8 text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {analyticsData.totalTasks} Total Tasks
                </h3>
                <p className="text-gray-600">
                  Analytics overview for {workspaceName}
                </p>
              </div> */}

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Status Distribution - Donut Chart */}
                <div className="text-center">
                  <h4 className="text-lg font-medium text-gray-700 mb-4">
                    Task Status Distribution
                  </h4>
                  <div className="flex justify-center">
                    <svg ref={donutRef}></svg>
                  </div>
                  <div className="mt-4 space-y-2">
                    {analyticsData.statusDistribution.map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center">
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{
                              backgroundColor:
                                statusColors[
                                  item.label as keyof typeof statusColors
                                ],
                            }}
                          ></div>
                          <span className="text-gray-600">
                            {item.label.replace('_', ' ')}
                          </span>
                        </div>
                        <span className="font-medium">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Priority Distribution - Bar Chart */}
                <div className="text-center">
                  <h4 className="text-lg font-medium text-gray-700 mb-4">
                    Task Priority Distribution
                  </h4>
                  <div className="flex justify-center">
                    <svg ref={barRef}></svg>
                  </div>
                  <div className="mt-4 space-y-2">
                    {analyticsData.priorityDistribution.map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center">
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{
                              backgroundColor:
                                priorityColors[
                                  item.label as keyof typeof priorityColors
                                ],
                            }}
                          ></div>
                          <span className="text-gray-600">{item.label}</span>
                        </div>
                        <span className="font-medium">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default TaskAnalytics
