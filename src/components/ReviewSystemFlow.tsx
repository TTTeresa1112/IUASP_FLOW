import React, { useCallback, useMemo, useState } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  applyEdgeChanges,
  applyNodeChanges,
  addEdge,
  Connection,
  Edge,
  Node,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  Panel,
  MarkerType,
  SelectionMode,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { DecisionNode } from './nodes/DecisionNode';
import { ProcessNode } from './nodes/ProcessNode';
import { PhaseNode } from './nodes/PhaseNode';
import { ReviewerNode } from './nodes/ReviewerNode';
import { OptionalGroupNode } from './nodes/OptionalGroupNode';
import { ZoomIn, ZoomOut, Maximize, MousePointer2, BookOpen, Pointer, SquareDashed } from 'lucide-react';
import { NodeDetails } from './NodeDetails';
import { cn } from '../lib/utils';

const nodeTypes = {
  decision: DecisionNode,
  process: ProcessNode,
  phase: PhaseNode,
  reviewer: ReviewerNode,
  optionalGroup: OptionalGroupNode,
};

const initialNodes: Node[] = [
  // --- 第一阶段：初审 ---
  {
    id: 'phase-1',
    type: 'phase',
    position: { x: 50, y: 50 },
    data: { label: '初审阶段', index: 0, isExpanded: true },
    style: { width: 340, height: 750, zIndex: -1 },
    draggable: false,
  },
  {
    id: 'node-1-1',
    type: 'process',
    parentId: 'phase-1',
    position: { x: 70, y: 80 },
    data: { label: '提交稿件', role: '作者', icon: 'user' },
    extent: 'parent',
  },
  {
    id: 'node-1-2',
    type: 'process',
    parentId: 'phase-1',
    position: { x: 70, y: 200 },
    data: { 
      label: 'ME审查', role: 'ME', icon: 'search', 
      isOA: true, initiator: '作者', nextStep: '分配主编并进入主编初审', passRole: '主编, 作者', rejectStep: '终审决策 (主编)', reviseStep: '退回给作者' 
    },
    extent: 'parent',
  },
  {
    id: 'node-1-3',
    type: 'process',
    parentId: 'phase-1',
    position: { x: 70, y: 320 },
    data: { 
      label: '主编初审', role: 'EiC', icon: 'check', 
      isOA: true, initiator: '管理编辑 (ME)', nextStep: '分配学术编辑并开始初审', passRole: '学术编辑', rejectStep: '终审决策 (主编)', reviseStep: '退回至 ME / 作者' 
    },
    extent: 'parent',
  },
  {
    id: 'node-1-4',
    type: 'process',
    parentId: 'phase-1',
    position: { x: 70, y: 440 },
    data: {
      label: '学术编辑初审', role: 'AE', icon: 'search',
      isOA: true, initiator: '主编 (EiC)', nextStep: 'ME跨段审批', passRole: '管理编辑', rejectStep: '终审决策 (主编)', reviseStep: '退回至 作者',
      optional: true
    },
    extent: 'parent',
  },


  // --- 第二阶段：同行评议 ---
  {
    id: 'phase-2',
    type: 'phase',
    position: { x: 440, y: 50 },
    data: { label: '同行评议', index: 1, isExpanded: true },
    style: { width: 340, height: 750, zIndex: -1 },
    draggable: false,
  },
  {
    id: 'node-2-optional',
    type: 'optionalGroup',
    parentId: 'phase-2',
    position: { x: 50, y: 65 },
    data: { label: '可跳过' },
    style: { width: 240, height: 330, zIndex: -1 },
    draggable: false,
    selectable: false,
    extent: 'parent',
  },
  {
    id: 'node-2-1',
    type: 'process',
    parentId: 'phase-2',
    position: { x: 70, y: 80 },
    data: { label: '选择审稿人', role: 'AE', icon: 'search' },
    extent: 'parent',
  },
  {
    id: 'node-2-r',
    type: 'reviewer',
    parentId: 'phase-2',
    position: { x: 70, y: 200 },
    data: { label: '收集审稿意见' },
    extent: 'parent',
  },
  {
    id: 'node-2-3',
    type: 'process',
    parentId: 'phase-2',
    position: { x: 70, y: 320 },
    data: { label: '汇总审稿意见', role: 'AE', icon: 'book' },
    extent: 'parent',
  },
  {
    id: 'node-2-4',
    type: 'process',
    parentId: 'phase-2',
    position: { x: 70, y: 440 },
    data: { label: '主编终审评估', role: 'EiC', icon: 'check' },
    extent: 'parent',
  },
  {
    id: 'node-2-5',
    type: 'process',
    parentId: 'phase-2',
    position: { x: 70, y: 560 },
    data: { label: '预接受确认', role: 'ME', icon: 'check' },
    extent: 'parent',
  },

  // --- 第三阶段：归档阶段 ---
  {
    id: 'phase-3',
    type: 'phase',
    position: { x: 830, y: 50 },
    data: { label: '归档阶段', index: 2, isExpanded: true },
    style: { width: 760, height: 750, zIndex: -1 },
    draggable: false,
  },
  {
    id: 'node-3-decision',
    type: 'decision',
    parentId: 'phase-3',
    position: { x: 312, y: 70 },
    data: { label: '系统归档分发' },
    extent: 'parent',
  },

  // --- 结论 ---
  {
    id: 'node-outcome-accept',
    type: 'process',
    parentId: 'phase-3',
    position: { x: 50, y: 320 },
    data: { label: '录用待刊', role: 'System', icon: 'check' },
    extent: 'parent',
  },
  {
    id: 'node-outcome-reject',
    type: 'process',
    parentId: 'phase-3',
    position: { x: 510, y: 320 },
    data: { label: '稿件拒录', role: 'System', icon: 'clock' },
    extent: 'parent',
  },
  {
    id: 'node-outcome-withdraw',
    type: 'process',
    parentId: 'phase-3',
    position: { x: 280, y: 320 },
    data: { label: '稿件撤销', role: 'System', icon: 'clock' },
    extent: 'parent',
  },
];

const initialEdges: Edge[] = [
  // 初审流
  { id: 'e1-1-2', source: 'node-1-1', sourceHandle: 'bottom', target: 'node-1-2', targetHandle: 'top', type: 'smoothstep' },
  { id: 'e1-2-3', source: 'node-1-2', sourceHandle: 'bottom', target: 'node-1-3', targetHandle: 'top', type: 'smoothstep' },
  { id: 'e1-3-4', source: 'node-1-3', sourceHandle: 'bottom', target: 'node-1-4', targetHandle: 'top', type: 'smoothstep' },
  
  // Connect Phase 1 to Phase 2
  { 
    id: 'e1-p2', 
    source: 'node-1-2', 
    sourceHandle: 'right',
    target: 'node-2-1', 
    targetHandle: 'left',
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#6366f1', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' } 
  },

  // ME审查直接到阶段三系统分发
  { 
    id: 'e1-2-p3', 
    source: 'node-1-2', 
    sourceHandle: 'right',
    target: 'node-3-decision', 
    targetHandle: 'top',
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#6366f1', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' } 
  },

  // 同行评议流
  { id: 'e2-1-r', source: 'node-2-1', sourceHandle: 'bottom', target: 'node-2-r', targetHandle: 'top', type: 'smoothstep' },
  { id: 'e2-r-3', source: 'node-2-r', sourceHandle: 'bottom', target: 'node-2-3', targetHandle: 'top', type: 'smoothstep' },
  { id: 'e2-3-4', source: 'node-2-3', sourceHandle: 'bottom', target: 'node-2-4', targetHandle: 'top', type: 'smoothstep' },
  { id: 'e2-4-5', source: 'node-2-4', sourceHandle: 'bottom', target: 'node-2-5', targetHandle: 'top', type: 'smoothstep' },

  // 连接同行评议到归档决策网关
  { 
    id: 'e2-p3', 
    source: 'node-2-5', 
    sourceHandle: 'right',
    target: 'node-3-decision', 
    targetHandle: 'left',
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#6366f1', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' } 
  },

  // 决策分支
  { 
    id: 'e-dec-accept', 
    source: 'node-3-decision', 
    sourceHandle: 'bottom-left', 
    target: 'node-outcome-accept',
    targetHandle: 'top',
    type: 'smoothstep',
    label: '接受录用',
    labelBgPadding: [8, 4],
    labelBgBorderRadius: 4,
    labelBgStyle: { fill: '#ecfdf5', stroke: '#10b981', strokeWidth: 1 },
    labelStyle: { fill: '#10b981', fontWeight: 'bold', fontSize: 12 },
    style: { stroke: '#10b981', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' }
  },
  { 
    id: 'e-dec-reject', 
    source: 'node-3-decision', 
    sourceHandle: 'bottom-right', 
    target: 'node-outcome-reject',
    targetHandle: 'top',
    type: 'smoothstep',
    label: '拒稿结案',
    labelBgPadding: [8, 4],
    labelBgBorderRadius: 4,
    labelBgStyle: { fill: '#fff1f2', stroke: '#f43f5e', strokeWidth: 1 },
    labelStyle: { fill: '#f43f5e', fontWeight: 'bold', fontSize: 12 },
    style: { stroke: '#f43f5e', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#f43f5e' }
  },
  { 
    id: 'e-dec-withdraw', 
    source: 'node-3-decision', 
    sourceHandle: 'bottom-center', 
    target: 'node-outcome-withdraw',
    targetHandle: 'top',
    type: 'smoothstep',
    label: '撤稿登记',
    labelBgPadding: [8, 4],
    labelBgBorderRadius: 4,
    labelBgStyle: { fill: '#f1f5f9', stroke: '#64748b', strokeWidth: 1 },
    labelStyle: { fill: '#64748b', fontWeight: 'bold', fontSize: 12 },
    style: { stroke: '#64748b', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#64748b' }
  },
  
  // 修改循环 (From phase 2 pre-accept decision to phase 1)
  {
    id: 'e-revision-loop',
    source: 'node-2-5',
    sourceHandle: 'left',
    target: 'node-1-1',
    targetHandle: 'left',
    label: '大/小修重投 (Revision)',
    type: 'smoothstep',
    animated: true,
    labelBgPadding: [8, 4],
    labelBgBorderRadius: 4,
    labelBgStyle: { fill: '#fffbeb', stroke: '#f59e0b', strokeWidth: 1 },
    labelStyle: { fill: '#b45309', fontWeight: 'bold', fontSize: 12 },
    style: { stroke: '#f59e0b', strokeWidth: 2, dasharray: '5,5' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' },
  }
];

export default function ReviewSystemFlow() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  );
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  );
  const onConnect: OnConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [],
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  return (
    <div className="w-full h-full flex bg-slate-50 overflow-hidden font-sans text-slate-800">
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧工具栏 / 图例 */}
        <aside className="w-[180px] bg-white border-r border-slate-200 p-4 flex flex-col gap-6 shrink-0 shadow-sm z-10 overflow-y-auto">
          <div className="transform origin-top-left scale-[0.85] w-[117%]">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">角色图例</h3>
            <div className="space-y-1">
              {[
                { name: '管理编辑 (ME)', color: 'bg-emerald-500' },
                { name: '主编 (EiC)', color: 'bg-amber-500' },
                { name: '学术编辑 (AE)', color: 'bg-indigo-500' },
                { name: '审稿人 (Reviewer)', color: 'bg-slate-400' },
              ].map((role) => (
                <div key={role.name} className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 transition-colors cursor-default">
                  <div className={`w-2.5 h-2.5 rounded-full ${role.color}`}></div>
                  <span className="text-[11px] font-medium text-slate-600">{role.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="transform origin-top-left scale-[0.85] w-[117%]">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">画面图例</h3>
            <div className="space-y-3 px-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-slate-300 border-dashed rounded"></div>
                <span className="text-[11px] text-slate-500">可展开阶段集群</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rotate-45 border-2 border-slate-400"></div>
                <span className="text-[11px] text-slate-500">网关决策分支</span>
              </div>
            </div>
          </div>

          <div className="transform origin-top-left scale-[0.85] w-[117%]">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">交互模式</h3>
            <div className="space-y-1">
              <button
                onClick={() => setIsSelectionMode(false)}
                className={cn(
                  "flex items-center gap-2 p-1.5 rounded transition-colors w-full cursor-pointer",
                  !isSelectionMode ? "bg-indigo-50 text-indigo-700" : "hover:bg-slate-50 text-slate-600"
                )}
              >
                <Pointer size={14} />
                <span className="text-[11px] font-medium">平移拖拽</span>
              </button>
              <button
                onClick={() => setIsSelectionMode(true)}
                className={cn(
                  "flex items-center gap-2 p-1.5 rounded transition-colors w-full cursor-pointer",
                  isSelectionMode ? "bg-indigo-50 text-indigo-700" : "hover:bg-slate-50 text-slate-600"
                )}
              >
                <SquareDashed size={14} />
                <span className="text-[11px] font-medium">框选模式</span>
              </button>
            </div>
          </div>
        </aside>

        {/* 画板区域 */}
        <main className="flex-1 relative bg-slate-50 overflow-hidden">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            onNodeClick={onNodeClick}
            defaultEdgeOptions={{ type: 'smoothstep', style: { strokeWidth: 2, stroke: '#94a3b8' } }}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            selectionOnDrag={isSelectionMode}
            selectionMode={SelectionMode.Partial}
            panOnDrag={!isSelectionMode}
          >
            <Background color="#cbd5e1" variant="dots" gap={24} size={1} />
            <Controls className="!bg-white !border-slate-200 !shadow-xl" showInteractive={false} />
          </ReactFlow>
        </main>

        {/* 右侧属性面板 */}
        <aside className="w-[520px] bg-white border-l border-slate-200 flex flex-col shrink-0 shadow-lg z-20">
          <div className="flex-1 overflow-y-auto p-8">
            {selectedNode ? (
              <NodeDetails node={selectedNode} />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                <MousePointer2 size={32} className="text-slate-300 mb-3" />
                <p className="text-sm font-medium text-slate-500">点击流程图节点<br/>查看详细说明</p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
