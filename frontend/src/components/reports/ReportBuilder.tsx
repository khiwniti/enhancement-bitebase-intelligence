'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  FileText,
  Type,
  BarChart3,
  PieChart,
  LineChart as LineChartIcon,
  Table2,
  Image as ImageIcon,
  MapPin,
  Brain,
  Plus,
  GripVertical,
  Trash2,
  Copy,
  Settings,
  Download,
  Share,
  Save,
  Eye,
  Layout,
  Columns,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  Link,
  Palette,
  Zap,
  Sparkles,
  Clock,
  User,
  Users,
  Globe,
  Lock,
  ChevronDown,
  ChevronRight,
  Search,
  Filter,
  MoreHorizontal
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Block Types
type BlockType = 
  | 'heading' 
  | 'text' 
  | 'chart' 
  | 'table' 
  | 'image' 
  | 'map' 
  | 'ai-insight' 
  | 'divider'
  | 'callout'
  | 'code'
  | 'quote'

interface Block {
  id: string
  type: BlockType
  content: any
  style?: {
    alignment?: 'left' | 'center' | 'right'
    color?: string
    backgroundColor?: string
    fontSize?: string
    fontWeight?: string
    padding?: string
    margin?: string
  }
  config?: {
    chartType?: 'bar' | 'line' | 'pie' | 'area'
    dataSource?: string
    columns?: string[]
    width?: number
    height?: number
  }
}

interface ReportTemplate {
  id: string
  name: string
  description: string
  category: 'market-analysis' | 'performance' | 'financial' | 'custom'
  blocks: Block[]
  thumbnail?: string
  isPublic?: boolean
}

// Block Component Library
const BlockComponents = {
  heading: ({ block, isEditing, onUpdate }: { block: Block; isEditing: boolean; onUpdate: (content: any) => void }) => (
    <div className={cn("w-full", `text-${block.style?.alignment || 'left'}`)}>
      {isEditing ? (
        <Input
          value={block.content.text || ''}
          onChange={(e) => onUpdate({ text: e.target.value })}
          className="text-xl sm:text-2xl font-bold border-none bg-transparent p-0 focus:ring-0 mobile-input touch-manipulation"
          placeholder="Enter heading..."
        />
      ) : (
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded p-2 -m-2 transition-colors touch-manipulation">
          {block.content.text || 'Untitled Heading'}
        </h2>
      )}
    </div>
  ),

  text: ({ block, isEditing, onUpdate }: { block: Block; isEditing: boolean; onUpdate: (content: any) => void }) => (
    <div className={cn("w-full", `text-${block.style?.alignment || 'left'}`)}>
      {isEditing ? (
        <Textarea
          value={block.content.text || ''}
          onChange={(e) => onUpdate({ text: e.target.value })}
          className="min-h-[100px] border-none bg-transparent p-0 resize-none focus:ring-0 mobile-input touch-manipulation"
          placeholder="Start typing..."
        />
      ) : (
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded p-2 -m-2 transition-colors touch-manipulation">
          {block.content.text || 'Click to add text...'}
        </p>
      )}
    </div>
  ),

  chart: ({ block, isEditing, onUpdate }: { block: Block; isEditing: boolean; onUpdate: (content: any) => void }) => (
    <div className="w-full">
      {isEditing ? (
        <div className="space-y-4 p-4 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            <Select value={block.config?.chartType} onValueChange={(value) => onUpdate({ chartType: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Chart Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bar">Bar Chart</SelectItem>
                <SelectItem value="line">Line Chart</SelectItem>
                <SelectItem value="pie">Pie Chart</SelectItem>
                <SelectItem value="area">Area Chart</SelectItem>
              </SelectContent>
            </Select>
            <Input 
              placeholder="Data Source" 
              value={block.config?.dataSource || ''}
              onChange={(e) => onUpdate({ dataSource: e.target.value })}
            />
          </div>
          <Input 
            placeholder="Chart Title" 
            value={block.content.title || ''}
            onChange={(e) => onUpdate({ title: e.target.value })}
          />
        </div>
      ) : (
        <div className="w-full h-64 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 text-blue-500 mx-auto mb-2" />
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {block.content.title || 'Sample Chart'}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {block.config?.chartType?.toUpperCase()} • {block.config?.dataSource || 'No Data Source'}
            </div>
          </div>
        </div>
      )}
    </div>
  ),

  table: ({ block, isEditing, onUpdate }: { block: Block; isEditing: boolean; onUpdate: (content: any) => void }) => (
    <div className="w-full">
      {isEditing ? (
        <div className="space-y-2">
          <Input 
            placeholder="Table Title" 
            value={block.content.title || ''}
            onChange={(e) => onUpdate({ title: e.target.value })}
          />
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <div className="text-center text-gray-500">
              <Table2 className="h-8 w-8 mx-auto mb-2" />
              Table configuration panel
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full">
          <div className="font-medium text-gray-900 dark:text-gray-100 mb-2">
            {block.content.title || 'Data Table'}
          </div>
          <div className="overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Metric</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Change</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                <tr>
                  <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">Revenue</td>
                  <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">$125,430</td>
                  <td className="px-4 py-2 text-sm text-green-600">+12.5%</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">Orders</td>
                  <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">1,247</td>
                  <td className="px-4 py-2 text-sm text-green-600">+8.3%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  ),

  'ai-insight': ({ block, isEditing, onUpdate }: { block: Block; isEditing: boolean; onUpdate: (content: any) => void }) => (
    <div className="w-full">
      {isEditing ? (
        <div className="space-y-2">
          <Input 
            placeholder="Insight Title" 
            value={block.content.title || ''}
            onChange={(e) => onUpdate({ title: e.target.value })}
          />
          <Textarea 
            placeholder="AI-generated insight..." 
            value={block.content.insight || ''}
            onChange={(e) => onUpdate({ insight: e.target.value })}
            className="min-h-[80px]"
          />
        </div>
      ) : (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg">
              <Brain className="h-4 w-4 text-white" />
            </div>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {block.content.title || 'AI Insight'}
            </span>
            <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-200">
              <Sparkles className="h-3 w-3 mr-1" />
              AI Generated
            </Badge>
          </div>
          <p className="text-gray-700 dark:text-gray-300">
            {block.content.insight || 'AI-powered insight will appear here based on your data analysis.'}
          </p>
        </div>
      )}
    </div>
  ),

  callout: ({ block, isEditing, onUpdate }: { block: Block; isEditing: boolean; onUpdate: (content: any) => void }) => (
    <div className="w-full">
      {isEditing ? (
        <div className="space-y-2">
          <Select value={block.content.type || 'info'} onValueChange={(value) => onUpdate({ ...block.content, type: value })}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
          <Textarea 
            placeholder="Callout text..." 
            value={block.content.text || ''}
            onChange={(e) => onUpdate({ ...block.content, text: e.target.value })}
            className="min-h-[60px]"
          />
        </div>
      ) : (
        <div className={cn(
          "border-l-4 p-4 rounded-r-lg",
          block.content.type === 'warning' && "bg-yellow-50 border-yellow-400 dark:bg-yellow-900/20 dark:border-yellow-500",
          block.content.type === 'success' && "bg-green-50 border-green-400 dark:bg-green-900/20 dark:border-green-500",
          block.content.type === 'error' && "bg-red-50 border-red-400 dark:bg-red-900/20 dark:border-red-500",
          !block.content.type || block.content.type === 'info' && "bg-blue-50 border-blue-400 dark:bg-blue-900/20 dark:border-blue-500"
        )}>
          <p className="text-gray-700 dark:text-gray-300">
            {block.content.text || 'Important information or note...'}
          </p>
        </div>
      )}
    </div>
  ),

  divider: ({ block }: { block: Block; isEditing: boolean; onUpdate: (content: any) => void }) => (
    <div className="w-full py-4">
      <hr className="border-gray-300 dark:border-gray-600" />
    </div>
  )
}

// Block Toolbar Component
const BlockToolbar = ({ 
  block, 
  onDuplicate, 
  onDelete, 
  onMoveUp, 
  onMoveDown,
  isFirst,
  isLast 
}: {
  block: Block
  onDuplicate: () => void
  onDelete: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  isFirst: boolean
  isLast: boolean
}) => {
  return (
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <Button variant="ghost" size="sm" onClick={onDuplicate} className="h-8 w-8 p-0">
        <Copy className="h-3 w-3" />
      </Button>
      <Button variant="ghost" size="sm" onClick={onDelete} className="h-8 w-8 p-0 text-red-500 hover:text-red-600">
        <Trash2 className="h-3 w-3" />
      </Button>
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onMoveUp}
          disabled={isFirst}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-3 w-3 rotate-[-90deg]" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onMoveDown}
          disabled={isLast}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-3 w-3 rotate-[90deg]" />
        </Button>
      </div>
    </div>
  )
}

// Block Palette Component
const BlockPalette = ({ onAddBlock }: { onAddBlock: (type: BlockType) => void }) => {
  const blockTypes = [
    { type: 'heading' as BlockType, icon: Type, label: 'Heading', description: 'Section headers and titles' },
    { type: 'text' as BlockType, icon: AlignLeft, label: 'Text', description: 'Paragraphs and body text' },
    { type: 'chart' as BlockType, icon: BarChart3, label: 'Chart', description: 'Data visualizations' },
    { type: 'table' as BlockType, icon: Table2, label: 'Table', description: 'Structured data tables' },
    { type: 'ai-insight' as BlockType, icon: Brain, label: 'AI Insight', description: 'AI-generated recommendations' },
    { type: 'callout' as BlockType, icon: Quote, label: 'Callout', description: 'Important notes and highlights' },
    { type: 'divider' as BlockType, icon: MoreHorizontal, label: 'Divider', description: 'Section separators' },
  ]

  return (
    <div className="w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
      <div className="space-y-4">
        <div>
          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Add Blocks</h3>
          <div className="space-y-2">
            {blockTypes.map((blockType) => (
              <motion.button
                key={blockType.type}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onAddBlock(blockType.type)}
                className="w-full flex items-start gap-3 p-3 text-left rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
              >
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg group-hover:bg-orange-100 dark:group-hover:bg-orange-900/20 transition-colors">
                  <blockType.icon className="h-4 w-4 text-gray-600 dark:text-gray-300 group-hover:text-orange-600 transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                    {blockType.label}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 leading-tight">
                    {blockType.description}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Templates</h3>
          <div className="space-y-2">
            <button className="w-full flex items-center gap-3 p-3 text-left rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <FileText className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Market Analysis</span>
            </button>
            <button className="w-full flex items-center gap-3 p-3 text-left rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <BarChart3 className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Performance Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ReportBuilder() {
  const [blocks, setBlocks] = useState<Block[]>([
    {
      id: '1',
      type: 'heading',
      content: { text: 'Market Analysis Report' },
      style: { alignment: 'center' }
    },
    {
      id: '2',
      type: 'text',
      content: { text: 'This report provides comprehensive insights into restaurant market opportunities and performance metrics.' }
    }
  ])
  
  const [editingBlock, setEditingBlock] = useState<string | null>(null)
  const [reportTitle, setReportTitle] = useState('Untitled Report')
  const [showPalette, setShowPalette] = useState(true)
  const [collaborators] = useState([
    { id: '1', name: 'John Smith', avatar: '👨‍💼', status: 'online' },
    { id: '2', name: 'Sarah Chen', avatar: '👩‍💼', status: 'away' }
  ])

  const generateId = () => Math.random().toString(36).substr(2, 9)

  const addBlock = useCallback((type: BlockType, position?: number) => {
    const newBlock: Block = {
      id: generateId(),
      type,
      content: getDefaultContent(type),
      style: { alignment: 'left' }
    }

    setBlocks(prevBlocks => {
      if (position !== undefined) {
        const newBlocks = [...prevBlocks]
        newBlocks.splice(position + 1, 0, newBlock)
        return newBlocks
      }
      return [...prevBlocks, newBlock]
    })

    setEditingBlock(newBlock.id)
  }, [])

  const getDefaultContent = (type: BlockType) => {
    switch (type) {
      case 'heading': return { text: '' }
      case 'text': return { text: '' }
      case 'chart': return { title: '', chartType: 'bar' }
      case 'table': return { title: '', columns: [], rows: [] }
      case 'ai-insight': return { title: '', insight: '' }
      case 'callout': return { type: 'info', text: '' }
      case 'divider': return {}
      default: return {}
    }
  }

  const updateBlock = useCallback((blockId: string, content: any) => {
    setBlocks(prevBlocks =>
      prevBlocks.map(block =>
        block.id === blockId
          ? { ...block, content: { ...block.content, ...content } }
          : block
      )
    )
  }, [])

  const deleteBlock = useCallback((blockId: string) => {
    setBlocks(prevBlocks => prevBlocks.filter(block => block.id !== blockId))
    setEditingBlock(null)
  }, [])

  const duplicateBlock = useCallback((blockId: string) => {
    const blockToDuplicate = blocks.find(block => block.id === blockId)
    if (blockToDuplicate) {
      const newBlock = {
        ...blockToDuplicate,
        id: generateId()
      }
      const blockIndex = blocks.findIndex(block => block.id === blockId)
      setBlocks(prevBlocks => {
        const newBlocks = [...prevBlocks]
        newBlocks.splice(blockIndex + 1, 0, newBlock)
        return newBlocks
      })
    }
  }, [blocks])

  const moveBlock = useCallback((blockId: string, direction: 'up' | 'down') => {
    setBlocks(prevBlocks => {
      const blockIndex = prevBlocks.findIndex(block => block.id === blockId)
      if (blockIndex === -1) return prevBlocks

      const newBlocks = [...prevBlocks]
      const targetIndex = direction === 'up' ? blockIndex - 1 : blockIndex + 1

      if (targetIndex >= 0 && targetIndex < newBlocks.length) {
        [newBlocks[blockIndex], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[blockIndex]]
      }

      return newBlocks
    })
  }, [])

  const handleSave = async () => {
    // Simulate save operation
    console.log('Saving report...', { title: reportTitle, blocks })
    // Here you would send the data to your backend
  }

  const handleExport = async (format: 'pdf' | 'docx' | 'html') => {
    // Simulate export operation
    console.log(`Exporting report as ${format}...`)
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Block Palette Sidebar */}
      <AnimatePresence>
        {showPalette && (
          <motion.div
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <BlockPalette onAddBlock={addBlock} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Editor */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPalette(!showPalette)}
                className="text-gray-500 hover:text-gray-700"
              >
                <Layout className="h-4 w-4" />
              </Button>
              
              <Input
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                className="text-lg font-semibold border-none bg-transparent p-0 focus:ring-0 w-auto min-w-[200px]"
                placeholder="Untitled Report"
              />

              <div className="flex items-center gap-1">
                {collaborators.map((collaborator) => (
                  <div
                    key={collaborator.id}
                    className="relative w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm border-2 border-white shadow-sm"
                    title={collaborator.name}
                  >
                    {collaborator.avatar}
                    <div className={cn(
                      "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white",
                      collaborator.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                    )} />
                  </div>
                ))}
                <Button variant="ghost" size="sm" className="w-8 h-8 rounded-full p-0">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                <span>Saved 2 minutes ago</span>
              </div>

              <Button variant="ghost" size="sm" onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>

              <Button variant="ghost" size="sm">
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>

              <Select onValueChange={handleExport}>
                <SelectTrigger className="w-32">
                  <Download className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Export" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="docx">Word</SelectItem>
                  <SelectItem value="html">HTML</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="ghost" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
            </div>
          </div>
        </div>

        {/* Editor Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto py-12 px-8">
            <Reorder.Group
              axis="y"
              values={blocks}
              onReorder={setBlocks}
              className="space-y-4"
            >
              <AnimatePresence>
                {blocks.map((block, index) => (
                  <Reorder.Item
                    key={block.id}
                    value={block}
                    className="group relative"
                    whileDrag={{ scale: 1.02 }}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="relative bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                    >
                      {/* Block Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />
                          <Badge variant="outline" className="text-xs">
                            {block.type.replace('-', ' ').toUpperCase()}
                          </Badge>
                        </div>

                        <BlockToolbar
                          block={block}
                          onDuplicate={() => duplicateBlock(block.id)}
                          onDelete={() => deleteBlock(block.id)}
                          onMoveUp={() => moveBlock(block.id, 'up')}
                          onMoveDown={() => moveBlock(block.id, 'down')}
                          isFirst={index === 0}
                          isLast={index === blocks.length - 1}
                        />
                      </div>

                      {/* Block Content */}
                      <div
                        onClick={() => setEditingBlock(block.id)}
                        className={cn(
                          "cursor-text rounded-md transition-colors",
                          editingBlock === block.id ? "ring-2 ring-orange-500/20 bg-orange-50/50 dark:bg-orange-900/10" : "hover:bg-gray-50/50 dark:hover:bg-gray-700/50"
                        )}
                      >
                        {BlockComponents[block.type as keyof typeof BlockComponents] ?
                          BlockComponents[block.type as keyof typeof BlockComponents]({
                            block,
                            isEditing: editingBlock === block.id,
                            onUpdate: (content: any) => updateBlock(block.id, content)
                          }) :
                          <div className="text-gray-500">Unsupported block type: {block.type}</div>
                        }
                      </div>

                      {/* Add Block Button */}
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="flex justify-center mt-4 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => addBlock('text', index)}
                          className="text-gray-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add block
                        </Button>
                      </motion.div>
                    </motion.div>
                  </Reorder.Item>
                ))}
              </AnimatePresence>
            </Reorder.Group>

            {/* Add First Block */}
            {blocks.length === 0 && (
              <div className="text-center py-16">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Start building your report
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Add blocks from the sidebar to create your professional report.
                </p>
                <Button onClick={() => addBlock('heading')} className="bg-orange-500 hover:bg-orange-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Add your first block
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}