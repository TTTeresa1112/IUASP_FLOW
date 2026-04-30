import React, { useState } from 'react';
import { Node, ReactFlow, Background, Controls, MarkerType, Handle, Position, Edge, SelectionMode } from '@xyflow/react';
import { FileSignature, Send, Presentation, X, ArrowRight, ArrowDown, User, Activity, AlertCircle, Pointer, SquareDashed, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface NodeDetailsProps {
  node: Node;
}

interface WorkflowStep {
  label: string;
  isCurrent?: boolean;
  isDecision?: boolean;
}

interface DecisionOutcome {
  label: string;
  cc?: string;
  nextStep?: string;
  type: 'pass' | 'reject' | 'revise' | 'default';
}

interface ApprovalAction {
  initiator: string;
  executor: string;
  material?: string;
  decisions: DecisionOutcome[];
}

interface MiniFlowConfig {
  nodes: Node[];
  edges: Edge[];
}

interface NodeConfig {
  role: string;
  workflow: string;
  action?: ApprovalAction;
  diagram: WorkflowStep[];
  states: { role: string, state: string }[];
  miniFlow?: MiniFlowConfig;
}

const CustomMiniNode = ({ data }: any) => {
  let borderClass = 'border-slate-300';
  let bgClass = 'bg-white';
  
  if (data.isCurrent) {
    borderClass = 'border-indigo-500';
    bgClass = 'bg-indigo-50';
  }
  
  if (data.borderColor === 'green') {
    borderClass = 'border-emerald-500';
    bgClass = 'bg-emerald-50';
  } else if (data.borderColor === 'orange') {
    borderClass = 'border-amber-500';
    bgClass = 'bg-amber-50';
  } else if (data.borderColor === 'red') {
    borderClass = 'border-red-500';
    bgClass = 'bg-red-50';
  } else if (data.borderColor === 'purple') {
    borderClass = 'border-purple-500';
    bgClass = 'bg-purple-50';
  } else if (data.borderColor === 'white') {
    borderClass = 'border-slate-200';
    bgClass = 'bg-white';
  } else if (data.borderColor === 'sky') {
    borderClass = 'border-sky-500';
    bgClass = 'bg-sky-50';
  }

  return (
    <div className={`px-3 py-2 rounded-lg border-2 w-52 shadow-sm ${borderClass} ${bgClass} ${data.isCurrent ? 'shadow-md' : ''}`}>
      <Handle type="target" position={Position.Left} className="w-1.5 h-1.5 !bg-slate-400" />
      {data.showTopHandle && <Handle type="source" position={Position.Top} id="top" className="w-1.5 h-1.5 !bg-slate-400" />}
      <div className="space-y-1.5">
        {data.actorLabel && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{data.actorLabel}</span>
            <span className="text-xs font-bold text-slate-700">{data.actor || ''}</span>
          </div>
        )}
        {data.showAction !== false && (
          <div className="flex items-start gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap mt-0.5">Action</span>
            <span className="text-sm font-bold text-slate-800 leading-tight">{data.actionLabel || data.label || ''}</span>
          </div>
        )}
        {data.currentStatus && (
          <div className="flex items-start gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap mt-0.5">Status</span>
            <span className={`text-xs font-medium leading-tight px-2 py-0.5 rounded ${data.isCurrent ? 'text-indigo-700 bg-indigo-100/60' : 'text-slate-600 bg-slate-100'}`}>
              {data.currentStatus}
            </span>
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Right} id="right" className="w-1.5 h-1.5 !bg-slate-400" />
      {data.showBottomHandle && <Handle type="source" position={Position.Bottom} id="bottom" className="w-1.5 h-1.5 !bg-slate-400" />}
    </div>
  );
};

const miniNodeTypes = { miniNode: CustomMiniNode };

const defaultEdgeOptions = {
  type: 'smoothstep',
  style: { strokeWidth: 2, stroke: '#94a3b8' },
  markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
  labelStyle: { fill: '#64748b', fontWeight: 600, fontSize: 11 },
  labelBgStyle: { fill: '#f8fafc', fillOpacity: 0.9, stroke: '#e2e8f0', strokeWidth: 1, ry: 4, rx: 4 },
  labelBgPadding: [6, 4] as [number, number]
};

const pmConfig: Record<string, NodeConfig> = {
  'node-0-1': {
    role: 'AU',
    workflow: '作者在系统内填写并核对所有必填元数据，上传稿件正文等必要附件。确认无误后点击提交，触发流转，稿件正式进入编辑部处理环节。(注：系统提交动作无需经ME确认入库)',
    action: {
      initiator: 'AU',
      executor: '投审稿系统',
      material: '新稿件',
      decisions: [
        { label: '填写数据', type: 'pass', nextStep: '点击提交', cc: 'ME' }
      ]
    },
    diagram: [
      { label: '准备稿件' },
      { label: '在线提交', isCurrent: true },
      { label: '初审 ME' },
    ],
    states: [
      { role: 'ME 端', state: 'NA' },
      { role: 'EIC 端', state: 'NA' },
      { role: 'AU 端', state: '提交新稿件' },
      { role: 'AE 端', state: 'NA' },
    ],
    miniFlow: {
      nodes: [
        { id: 'n1', position: { x: 100, y: 100 }, type: 'miniNode', data: { actorLabel: '发起人', actor: 'AU', actionLabel: '提交新稿件 AU', currentStatus: '[提交新稿件 AU] 等待 AU 提交新稿件', isCurrent: true } },
        { id: 'n2', position: { x: 400, y: 107 }, type: 'miniNode', data: { actorLabel: '执行人', actor: '系统', actionLabel: '提交新稿件', currentStatus: '静默执行中' } },
        { id: 'n3', position: { x: -200, y: 132 }, type: 'miniNode', data: { actorLabel: '状态', actor: '提交新稿件 AU', actionLabel: '提交新稿件 AU', currentStatus: '', borderColor: 'white', showAction: false } },
        { id: 'n4', position: { x: 750, y: 132 }, type: 'miniNode', data: { actorLabel: '状态', actor: '初审 ME', actionLabel: '初审 ME', currentStatus: '', borderColor: 'green', showAction: false } },
      ],
      edges: [
        { id: 'e1', source: 'n3', target: 'n1' },
        { id: 'e2', source: 'n1', target: 'n2' },
        { id: 'e3', source: 'n2', target: 'n4', label: '提交成功' }
      ]
    }
  },
  'node-1-1': {
    role: '作者 (Author)',
    workflow: '作者在系统内填写并核对所有必填元数据，上传稿件正文等必要附件。确认无误后点击提交，触发流转，稿件正式进入编辑部处理环节。(注：系统提交动作无需经ME确认入库)',
    action: {
      initiator: '作者',
      executor: '投审稿系统',
      material: '返修稿',
      decisions: [
        { label: '提交成功 (待ME确认)', type: 'pass', nextStep: 'ME审批中', cc: '作者' }
      ]
    },
    diagram: [
      { label: '准备稿件' },
      { label: '在线提交', isCurrent: true },
      { label: 'ME初审' },
    ],
    states: [
      { role: 'ME 端', state: 'NA' },
      { role: 'EIC 端', state: 'NA' },
      { role: 'AU 端', state: '提交新稿件' },
      { role: 'AE 端', state: 'NA' },
    ],
    miniFlow: {
      nodes: [
        { id: 'n1', position: { x: 100, y: 100 }, type: 'miniNode', data: { actorLabel: '发起人', actor: 'AU', actionLabel: '提交返修稿件 AU', currentStatus: '[提交返修稿件 AU] 等待 AU 提交返修稿', isCurrent: true } },
        { id: 'n2', position: { x: 400, y: 107 }, type: 'miniNode', data: { actorLabel: '执行人', actor: '系统', actionLabel: '提交返修稿件', currentStatus: '静默执行中' } },
        { id: 'n3', position: { x: -200, y: 132 }, type: 'miniNode', data: { actorLabel: '状态', actor: '提交返修稿件 AU', actionLabel: '提交返修稿件 AU', currentStatus: '', borderColor: 'white', showAction: false } },
        { id: 'n4', position: { x: 750, y: 132 }, type: 'miniNode', data: { actorLabel: '状态', actor: '初审 ME', actionLabel: '初审 ME', currentStatus: '', borderColor: 'green', showAction: false } },
      ],
      edges: [
        { id: 'e1', source: 'n3', target: 'n1' },
        { id: 'e2', source: 'n1', target: 'n2' },
        { id: 'e3', source: 'n2', target: 'n4', label: '提交成功' }
      ]
    }
  },
  'node-1-2': {
    role: 'ME',
    workflow: 'ME 收到投稿后进行技术与格式初审。主要检查稿件格式、查重率、是否包含必填文件。审查通过则流转至主编评估；不通过拒稿通知主编进行初审决定；退修给作者反馈修稿要求补全信息。',
    action: {
      initiator: '作者',
      executor: '管理编辑 (ME)',
      material: '新稿件 / 返修稿',
      decisions: [
        { label: '通过初审 ME', type: 'pass', nextStep: '分配EIC初审', cc: '主编, 作者' },
        { label: '初审拒稿 ME', type: 'reject', nextStep: '初审决策 (主编)', cc: '主编' }
      ]
    },
    diagram: [
      { label: '收到新投稿' },
      { label: '格式/技术审查', isCurrent: true },
      { label: '分发决策', isDecision: true },
    ],
    states: [
      { role: 'ME 端', state: '初审拒稿 / EIC 初审' },
      { role: 'EIC 端', state: 'NA' },
      { role: 'AU 端', state: 'NA' },
      { role: 'AE 端', state: 'NA' },
    ],
    miniFlow: {
      nodes: [
        { id: 'n1', position: { x: -150, y: 172 }, type: 'miniNode', data: { actorLabel: '状态', actor: '初审 ME', actionLabel: '初审 ME', currentStatus: '', borderColor: 'green', showAction: false } },
        { id: 'n2', position: { x: 200, y: 147 }, type: 'miniNode', data: { actorLabel: '发起人', actor: '系统', actionLabel: '初审 材料传递', currentStatus: '静默执行中', isCurrent: true } },
        { id: 'n3', position: { x: 550, y: 138 }, type: 'miniNode', data: { actorLabel: '执行人', actor: 'ME', actionLabel: '初审 ME', currentStatus: '[初审 ME] 等待 ME 初审新稿件', showBottomHandle: true, showTopHandle: true } },
        { id: 'n4', position: { x: 950, y: 140 }, type: 'miniNode', data: { actorLabel: '发起人', actor: 'ME', actionLabel: '初审 分配 EIC', currentStatus: '[初审 ME] 等待 ME 分配 EIC', isCurrent: true, showTopHandle: true  } },
        { id: 'n5', position: { x: 1300, y: 138 }, type: 'miniNode', data: { actorLabel: '执行人', actor: 'EIC', actionLabel: '初审分配 EIC', currentStatus: '[初审 ME] 等待 系统 分配 EIC 和材料', showTopHandle: true  } },
        { id: 'n6', position: { x: 1700, y: 170 }, type: 'miniNode', data: { actorLabel: '状态', actor: '初审 EIC', actionLabel: '初审 EIC', currentStatus: '', borderColor: 'orange', showAction: false } },
        { id: 'n7', position: { x: 950, y: 360 }, type: 'miniNode', data: { actorLabel: '状态', actor: '提交返修稿件 AU', actionLabel: '提交返修稿件 AU', currentStatus: '', borderColor: 'white', showBottomHandle: true, showAction: false } },
        { id: 'n8', position: { x: 950, y: -30 }, type: 'miniNode', data: { actorLabel: '发起人', actor: 'ME', actionLabel: '初审 分配 AE', currentStatus: '[初审 ME] 等待 ME 分配 AE', isCurrent: true, showTopHandle: true  } },
        { id: 'n9', position: { x: 1300, y: -30 }, type: 'miniNode', data: { actorLabel: '执行人', actor: 'EIC', actionLabel: '初审分配 AE', currentStatus: '[初审 ME] 等待 EIC 分配 AE 和材料', showTopHandle: true  } },
        { id: 'n10', position: { x: 2200, y: 2 }, type: 'miniNode', data: { actorLabel: '状态', actor: '初审 AE', actionLabel: '初审 AE', currentStatus: '', borderColor: 'purple', showAction: false } },
        { id: 'n11', position: { x: 1600, y: -30 }, type: 'miniNode', data: { actorLabel: '发起人', actor: 'ME', actionLabel: '初审 分配 AE', currentStatus: '[初审 ME] 等待 ME 分配 AE', isCurrent: true, showTopHandle: true  } },
        { id: 'n12', position: { x: 1900, y: -30 }, type: 'miniNode', data: { actorLabel: '执行人', actor: 'AE', actionLabel: '初审 分配 AE', currentStatus: '[初审 ME] 等待 AE 确认 初审 AE 和材料', showTopHandle: true  } },        
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2'},
        { id: 'e2', source: 'n2', target: 'n3', label: '通知' },
        { id: 'e3', source: 'n3', target: 'n4', label: '初审拒稿 / 初审 EIC', sourceHandle: 'right' },
        { id: 'e6', source: 'n3', target: 'n7', label: '初审 返修', sourceHandle: 'bottom' },
        { id: 'e4', source: 'n4', target: 'n5', label: '选择 EIC' , sourceHandle: 'right' },
        { id: 'e5-1', source: 'n5', target: 'n6', label: '通知', sourceHandle: 'right' },
        { id: 'e5-2', source: 'n5', target: 'n4', label: '驳回 重提', sourceHandle: 'top', style: { stroke: '#f43f5e', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f43f5e' } },
        { id: 'e6-1', source: 'n3', target: 'n8', label: '初审 ME', sourceHandle: 'top' },
        { id: 'e6-2', source: 'n9', target: 'n8', label: '驳回 重提', sourceHandle: 'top', style: { stroke: '#f43f5e', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f43f5e' } },
        { id: 'e7', source: 'n8', target: 'n9', label: '选择 AE' , sourceHandle: 'right' },
        { id: 'e8', source: 'n9', target: 'n11', sourceHandle: 'right' },
        { id: 'e9', source: 'n11', target: 'n12', sourceHandle: 'right' },
        { id: 'e9-1', source: 'n12', target: 'n8', label: '驳回 重提', sourceHandle: 'top', style: { stroke: '#f43f5e', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f43f5e' } },
        { id: 'e10', source: 'n12', target: 'n10', sourceHandle: 'right' },
      ]
    }
  },
  'node-1-3': {
    role: '主编 (EIC)',
    workflow: '主编依据 ME 初审通过的稿件，从学术视角评估其是否符合期刊范畴。若符合，则为主编分配合适的学术编辑 (AE) 进入下一环节；若明显不符，执行直接拒稿 (Desk Reject)。(注：主编的任何阶段性决策与流转，均需经ME审批确认后方可真正执行)',
    action: {
      initiator: '管理编辑 (ME)',
      executor: '主编 (EIC)',
      material: 'ME格式初审合格的手稿',
      decisions: [
        { label: '分配学术编辑 (待ME确认)', type: 'pass', nextStep: 'ME审批确认流转', cc: '学术编辑 (AE)' },
        { label: '直接拒稿 (Desk Reject) (待ME确认)', type: 'reject', nextStep: 'ME审批确认流转', cc: '管理编辑, 作者' }
      ]
    },
    diagram: [
      { label: 'ME 递交' },
      { label: '学术价值评估', isCurrent: true },
      { label: '分配学术编辑', isDecision: true },
    ],
    states: [
      { role: 'ME 端', state: 'NA' },
      { role: 'EIC 端', state: 'NA' },
      { role: 'AU 端', state: 'na' },
      { role: 'AE 端', state: 'NA' },
    ],
    miniFlow: {
      nodes: [      
        { id: 'n1', position: { x: -80, y: 172 }, type: 'miniNode', data: { actorLabel: '状态', actor: '初审 EIC', actionLabel: '初审 EIC', currentStatus: '', borderColor: 'orange', showAction: false, showTopHandle: true, showBottomHandle: true } },
        { id: 'n2', position: { x: 210, y: 140 }, type: 'miniNode', data: { actorLabel: '发起人', actor: 'EIC', actionLabel: '初审 EIC', currentStatus: '[初审 EIC] 等待 EIC 初审新稿件', isCurrent: true } },
        { id: 'n3-1', position: { x: 600, y: -250 }, type: 'miniNode', data: { actorLabel: '执行人', actor: 'ME', actionLabel: 'EIC 初审', currentStatus: '[初审 EIC] 等待 ME 确认 EIC 初审', showTopHandle: true } },
        { id: 'n3-2', position: { x: 600, y: 10 }, type: 'miniNode', data: { actorLabel: '执行人', actor: 'ME', actionLabel: 'EIC 初审', currentStatus: '[初审 EIC] 等待 ME 确认 EIC 初审', showTopHandle: true } },
        { id: 'n3-3', position: { x: 600, y: 270 }, type: 'miniNode', data: { actorLabel: '执行人', actor: 'ME', actionLabel: 'EIC 初审', currentStatus: '[初审 EIC] 等待 ME 确认 EIC 初审', showBottomHandle: true } },
        { id: 'n3-4', position: { x: 600, y: 500 }, type: 'miniNode', data: { actorLabel: '执行人', actor: 'ME', actionLabel: 'EIC 初审', currentStatus: '[初审 EIC] 等待 ME 确认 EIC 初审', showBottomHandle: true } },
        { id: 'n4', position: { x: 950, y: -220 }, type: 'miniNode', data: { actorLabel: '状态', actor: '系统归档', actionLabel: '系统归档', currentStatus: '', borderColor: 'red', showAction: false } },
        { id: 'n5', position: { x: 950, y: 43 }, type: 'miniNode', data: { actorLabel: '状态', actor: '预接受 ME', actionLabel: '预接受 ME', currentStatus: '', borderColor: 'green', showAction: false } },
        { id: 'n7', position: { x: 950, y: 530 }, type: 'miniNode', data: { actorLabel: '状态', actor: '提交返修稿件 AU', actionLabel: '提交返修稿件 AU', currentStatus: '', borderColor: 'white', showBottomHandle: true, showAction: false } },
        { id: 'n6', position: { x: 950, y: 268 }, type: 'miniNode', data: { actorLabel: '发起人', actor: 'EIC', actionLabel: '初审EIC 分配 AE', currentStatus: '[初审 EIC] 等待 EIC 分配 AE', isCurrent: true } },
        { id: 'n11', position: { x: 1290, y: 268 }, type: 'miniNode', data: { actorLabel: '执行人', actor: 'ME', actionLabel: '初审EIC 分配 AE', currentStatus: '[初审 EIC] 等待 ME 确认 EIC 分配 AE', showTopHandle: true } },
        { id: 'n12', position: { x: 1650, y: 268 }, type: 'miniNode', data: { actorLabel: '发起人', actor: 'ME', actionLabel: '初审EIC 分配 AE', currentStatus: '[初审 EIC] 等待 ME 确认 EIC 分配 AE', isCurrent: true, showTopHandle: true  } },
        { id: 'n13', position: { x: 2050, y: 278 }, type: 'miniNode', data: { actorLabel: '执行人', actor: '系统', actionLabel: '分配 AE 和材料', currentStatus: '静默执行中', showBottomHandle: true  } },
        { id: 'n15', position: { x: 2450, y: 302 }, type: 'miniNode', data: { actorLabel: '状态', actor: '初审 AE', actionLabel: '初审 AE', currentStatus: '', borderColor: 'purple', showAction: false } },
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2', sourceHandle: 'right' },
        { id: 'e2-1', source: 'n2', target: 'n3-1', label: '初审 拒稿' },
        { id: 'e2-2', source: 'n2', target: 'n3-2', label: '初审 接受' },
        { id: 'e2-3', source: 'n2', target: 'n3-3', label: '初审 AE' },
        { id: 'e2-4', source: 'n2', target: 'n3-4', label: '初审 返修' },
        { id: 'e2-1-1', source: 'n3-1', target: 'n4', label: '确认', sourceHandle: 'right' },
        { id: 'e2-1-2', source: 'n3-1', target: 'n1', label: '驳回 重提', sourceHandle: 'top', style: { stroke: '#f43f5e', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f43f5e' } },
        { id: 'e2-2-1', source: 'n3-2', target: 'n5', label: '确认', sourceHandle: 'right' },
        { id: 'e2-2-2', source: 'n3-2', target: 'n1', label: '驳回 重提', sourceHandle: 'top', style: { stroke: '#f43f5e', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f43f5e' } },
        { id: 'e2-3-1', source: 'n3-3', target: 'n6', label: '确认', sourceHandle: 'right' },
        { id: 'e2-3-2', source: 'n3-3', target: 'n1', label: '驳回 重提/ ME 发起初审 返修', sourceHandle: 'bottom', style: { stroke: '#f43f5e', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f43f5e' } },
        { id: 'e2-4-1', source: 'n3-4', target: 'n7', label: '确认', sourceHandle: 'right' },
        { id: 'e2-4-2', source: 'n3-4', target: 'n1', label: '驳回 重提', sourceHandle: 'bottom', style: { stroke: '#f43f5e', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f43f5e' } },         
        { id: 'e3', source: 'n6', target: 'n8', sourceHandle: 'right' },
        { id: 'e4', source: 'n7', target: 'n9', sourceHandle: 'right' },
        { id: 'e5', source: 'n6', target: 'n11', sourceHandle: 'right' },
        { id: 'e6', source: 'n9', target: 'n14', sourceHandle: 'right' },
        { id: 'e7-1', source: 'n11', target: 'n6', sourceHandle: 'top', label: '驳回 重提', style: { stroke: '#f43f5e', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f43f5e' } },
        { id: 'e7-2', source: 'n11', target: 'n12', sourceHandle: 'right', label: '通过' },
        { id: 'e7-3', source: 'n12', target: 'n13', sourceHandle: 'right', label: '选择 EIC' },
        { id: 'e7-4', source: 'n13', target: 'n15', sourceHandle: 'right', label: '通知' },
        { id: 'e7-5', source: 'n13', target: 'n6', sourceHandle: 'bottom', label: '驳回 重提', style: { stroke: '#f43f5e', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f43f5e' } },
        { id: 'e8', source: 'n14', target: 'n16', sourceHandle: 'right', label: '提交返修稿' },
      ]
    }
  },
  'node-1-4': {
    role: '学术编辑 (AE)',
    workflow: '学术编辑 收到分配 of 稿件后，进行更深入的对口评估。若判断稿件有外审价值，则开始物色合适的同行审稿人。同时，学术编辑也拥有在此节点建议拒稿的权限。(注：学术编辑的所有评审意见及流转意向均需经ME审批确认)',
    action: {
      initiator: '主编 (EiC)',
      executor: '学术编辑 (AE)',
      material: '主编分配的手稿',
      decisions: [
        { label: '建议外审 (待ME确认)', type: 'pass', nextStep: 'ME审批确认流转', cc: '管理编辑' },
        { label: '建议拒稿 (待ME确认)', type: 'reject', nextStep: 'ME审批确认流转', cc: '主编' }
      ]
    },
    diagram: [
      { label: '分配到 AE' },
      { label: '深入评估', isCurrent: true },
      { label: '开始外审', isDecision: true },
    ],
    states: [
      { role: 'ME端', state: '确认 / 退回AE重新做决定' },
      { role: '主编端', state: '主编审核结果 -> 分配AE / 拒稿 / 接受 / 返修' },
      { role: '作者端', state: '提交返修稿' },
      { role: 'AE端', state: 'AE审核结果 -> 进入同行评议 / 直接拒稿 / 返修' },
    ],
    miniFlow: {
      nodes: [      
        { id: 'n1', position: { x: -80, y: 172 }, type: 'miniNode', data: { actorLabel: '状态', actor: '初审 AE', actionLabel: '初审 AE', currentStatus: '', borderColor: 'purple', showAction: false } },
        { id: 'n2', position: { x: 210, y: 140 }, type: 'miniNode', data: { actorLabel: '发起人', actor: 'AE', actionLabel: '初审 AE', currentStatus: '[初审 AE] 等待 AE 初审新稿件', isCurrent: true } },
        { id: 'n3-1', position: { x: 600, y: -250 }, type: 'miniNode', data: { actorLabel: '执行人', actor: 'ME', actionLabel: 'AE 初审', currentStatus: '[初审 AE] 等待 ME 确认 AE 初审', showTopHandle: true } },
        { id: 'n3-2', position: { x: 600, y: 10 }, type: 'miniNode', data: { actorLabel: '执行人', actor: 'ME', actionLabel: 'AE 初审', currentStatus: '[初审 AE] 等待 ME 确认 AE 初审', showTopHandle: true } },
        { id: 'n3-3', position: { x: 600, y: 270 }, type: 'miniNode', data: { actorLabel: '执行人', actor: 'ME', actionLabel: 'AE 初审', currentStatus: '[初审 AE] 等待 ME 确认 AE 初审', showBottomHandle: true } },
        { id: 'n3-4', position: { x: 600, y: 500 }, type: 'miniNode', data: { actorLabel: '执行人', actor: 'ME', actionLabel: 'AE 初审', currentStatus: '[初审 AE] 等待 ME 确认 AE 初审', showBottomHandle: true } },
        { id: 'n4', position: { x: 950, y: -80 }, type: 'miniNode', data: { actorLabel: '状态', actor: '初审 EIC', actionLabel: '初审 EIC', currentStatus: '', borderColor: 'orange', showAction: false, showTopHandle: true, showBottomHandle: true } },
        { id: 'n6', position: { x: 950, y: 302 }, type: 'miniNode', data: { actorLabel: '状态', actor: '同行评议意见 RE', actionLabel: '同行评议意见 RE', currentStatus: '', borderColor: 'sky', showAction: false } },
        { id: 'n7', position: { x: 950, y: 530 }, type: 'miniNode', data: { actorLabel: '状态', actor: '提交返修稿件 AU', actionLabel: '提交返修稿件 AU', currentStatus: '', borderColor: 'white', showBottomHandle: true, showAction: false } },
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2', sourceHandle: 'right' },
        { id: 'e2-1', source: 'n2', target: 'n3-1', label: '初审 拒稿' },
        { id: 'e2-2', source: 'n2', target: 'n3-2', label: '初审 接受' },
        { id: 'e2-3', source: 'n2', target: 'n3-3', label: '初审 AE' },
        { id: 'e2-4', source: 'n2', target: 'n3-4', label: '初审 返修' },
        { id: 'e2-1-1', source: 'n3-1', target: 'n4', label: '确认', sourceHandle: 'right' },
        { id: 'e2-1-2', source: 'n3-1', target: 'n1', label: '驳回 重提', sourceHandle: 'top', style: { stroke: '#f43f5e', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f43f5e' } },
        { id: 'e2-2-1', source: 'n3-2', target: 'n4', label: '确认', sourceHandle: 'right' },
        { id: 'e2-2-2', source: 'n3-2', target: 'n1', label: '驳回 重提', sourceHandle: 'top', style: { stroke: '#f43f5e', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f43f5e' } },
        { id: 'e2-3-1', source: 'n3-3', target: 'n6', label: '确认', sourceHandle: 'right' },
        { id: 'e2-3-2', source: 'n3-3', target: 'n1', label: '驳回 重提/ ME 发起初审 返修', sourceHandle: 'bottom', style: { stroke: '#f43f5e', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f43f5e' } },
        { id: 'e2-4-1', source: 'n3-4', target: 'n7', label: '确认', sourceHandle: 'right' },
        { id: 'e2-4-2', source: 'n3-4', target: 'n1', label: '驳回 重提', sourceHandle: 'bottom', style: { stroke: '#f43f5e', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f43f5e' } },         
        { id: 'e3', source: 'n6', target: 'n8', sourceHandle: 'right' },
        { id: 'e4', source: 'n7', target: 'n9', sourceHandle: 'right' },
        { id: 'e5', source: 'n6', target: 'n11', sourceHandle: 'right' },
        { id: 'e6', source: 'n9', target: 'n14', sourceHandle: 'right' },
        { id: 'e7-1', source: 'n11', target: 'n6', sourceHandle: 'top', label: '驳回 重提', style: { stroke: '#f43f5e', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f43f5e' } },
        { id: 'e8', source: 'n14', target: 'n16', sourceHandle: 'right', label: '提交返修稿' },
      ]
    }
  },
  'node-2-3': {
    role: '学术编辑 (AE)',
    workflow: '在达到要求的最少审稿人数量并收齐他们返回的审稿意见后，学术编辑 负责提炼专家的核心反馈，并基于此形成最终的推荐结论，呈送给主编裁决。(注：学术编辑生成的结案推荐报告必须途经ME确认后方可送达主编)',
    action: {
      initiator: '所有外审专家',
      executor: '学术编辑 (AE)',
      material: '多名专家的评审意见和打分',
      decisions: [
        { label: '生成推荐报告 (待ME确认)', type: 'pass', nextStep: 'ME审批确认流转', cc: '主编 (EiC)' }
      ]
    },
    diagram: [
      { label: '收齐评审意见' },
      { label: '撰写推荐报告', isCurrent: true },
      { label: '呈报主编' },
    ],
    states: [
      { role: '学术编辑端', state: '待处理 - 意见已收齐，待起草推荐报告' },
      { role: '主编端', state: '等待 学术编辑 递交推荐结果' },
      { role: '审稿人端', state: '已完成 - 感谢您的专家评审' },
    ],
    miniFlow: {
      nodes: [      
        { id: 'n1', position: { x: -80, y: 172 }, type: 'miniNode', data: { actorLabel: '状态', actor: '同行评议意见 AE', actionLabel: '同行评议意见 AE', currentStatus: '', borderColor: 'purple', showAction: false } },
        { id: 'n2', position: { x: 210, y: 140 }, type: 'miniNode', data: { actorLabel: '发起人', actor: 'AE', actionLabel: 'AE 同行评议意见', currentStatus: '[同行评议意见 AE] 等待 AE 同行评议意见', isCurrent: true } },
        { id: 'n3-1', position: { x: 600, y: -100 }, type: 'miniNode', data: { actorLabel: '执行人', actor: 'ME', actionLabel: 'AE 同行评议意见', currentStatus: '[同行评议意见 AE] 等待 ME 确认 AE 同行评议意见', showTopHandle: true } },
        { id: 'n3-2', position: { x: 600, y: 133 }, type: 'miniNode', data: { actorLabel: '执行人', actor: 'ME', actionLabel: 'AE 同行评议意见', currentStatus: '[同行评议意见 AE] 等待 ME 确认 AE 同行评议意见', showTopHandle: true } },
        { id: 'n3-4', position: { x: 600, y: 350 }, type: 'miniNode', data: { actorLabel: '执行人', actor: 'ME', actionLabel: 'AE 同行评议意见', currentStatus: '[同行评议意见 AE] 等待 ME 确认 AE 同行评议意见', showBottomHandle: true } },
        { id: 'n4', position: { x: 950, y: 50 }, type: 'miniNode', data: { actorLabel: '状态', actor: '同行评议意见 EIC', actionLabel: '同行评议意见 EIC', currentStatus: '', borderColor: 'orange', showAction: false, showTopHandle: true, showBottomHandle: true } },
        { id: 'n7', position: { x: 950, y: 389 }, type: 'miniNode', data: { actorLabel: '状态', actor: '提交返修稿件 AU', actionLabel: '提交返修稿件 AU', currentStatus: '', borderColor: 'white', showBottomHandle: true, showAction: false } },
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2', sourceHandle: 'right' },
        { id: 'e2-1', source: 'n2', target: 'n3-1', label: '拒稿' },
        { id: 'e2-2', source: 'n2', target: 'n3-2', label: '接受' },
        { id: 'e2-3', source: 'n2', target: 'n3-3', label: '初审 AE' },
        { id: 'e2-4', source: 'n2', target: 'n3-4', label: '返修' },
        { id: 'e2-1-1', source: 'n3-1', target: 'n4', label: '确认', sourceHandle: 'right' },
        { id: 'e2-1-2', source: 'n3-1', target: 'n1', label: '驳回 重提', sourceHandle: 'top', style: { stroke: '#f43f5e', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f43f5e' } },
        { id: 'e2-2-1', source: 'n3-2', target: 'n4', label: '确认', sourceHandle: 'right' },
        { id: 'e2-2-2', source: 'n3-2', target: 'n1', label: '驳回 重提', sourceHandle: 'top', style: { stroke: '#f43f5e', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f43f5e' } },
        { id: 'e2-4-1', source: 'n3-4', target: 'n7', label: '确认', sourceHandle: 'right' },
        { id: 'e2-4-2', source: 'n3-4', target: 'n1', label: '驳回 重提', sourceHandle: 'bottom', style: { stroke: '#f43f5e', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f43f5e' } },         
        { id: 'e3', source: 'n6', target: 'n8', sourceHandle: 'right' },
        { id: 'e4', source: 'n7', target: 'n9', sourceHandle: 'right' },
        { id: 'e5', source: 'n6', target: 'n11', sourceHandle: 'right' },
        { id: 'e6', source: 'n9', target: 'n14', sourceHandle: 'right' },
        { id: 'e7-1', source: 'n11', target: 'n6', sourceHandle: 'top', label: '驳回 重提', style: { stroke: '#f43f5e', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f43f5e' } },
        { id: 'e8', source: 'n14', target: 'n16', sourceHandle: 'right', label: '提交返修稿' },
      ]
    }
  },
  'node-2-4': {
    role: '主编 (EiC)',
    workflow: '主编统筹阅览所有相关的同行评审意见及学术编辑的总结推荐，对稿件进行最终判定，并草拟决定信稿 (Decision Letter)。(注：主编的偏向意向需下移至ME预接受网关，由ME审核后最终执行)',
    action: {
      initiator: '学术编辑 (AE)',
      executor: '主编 (EiC)',
      material: '推荐报告综合包 (含原件、专家意见)',
      decisions: [
        { label: '起草评估决议 (待ME预接受确认)', type: 'pass', nextStep: 'ME预接受确认流转', cc: '学术编辑 (阅知)' }
      ]
    },
    diagram: [
      { label: '汇总 AE 报告' },
      { label: '主编终审评估', isCurrent: true },
      { label: '形成决定信草稿' },
    ],
    states: [
      { role: '主编端', state: '待处理 - 待做最终判定与发送决定信' },
      { role: '学术编辑端', state: '已协同 - 等待主编最后裁定' },
      { role: '作者端', state: '终审中 (Evaluating Recommendation)' },
    ],
    miniFlow: {
      nodes: [      
        { id: 'n1', position: { x: -80, y: 172 }, type: 'miniNode', data: { actorLabel: '状态', actor: '同行评议意见 EIC', actionLabel: '同行评议意见 EIC', currentStatus: '', borderColor: 'orange', showAction: false, showTopHandle: true, showBottomHandle: true } },
        { id: 'n2', position: { x: 210, y: 133 }, type: 'miniNode', data: { actorLabel: '发起人', actor: 'EIC', actionLabel: '同行评议意见 EIC', currentStatus: '[同行评议意见 EIC] 等待 EIC 同行评议意见', isCurrent: true } },
        { id: 'n3-1', position: { x: 600, y: -130 }, type: 'miniNode', data: { actorLabel: '执行人', actor: 'ME', actionLabel: 'EIC 同行评议意见', currentStatus: '[同行评议意见 EIC] 等待 ME 确认 EIC 同行评议意见', showTopHandle: true } },
        { id: 'n3-2', position: { x: 600, y: 130 }, type: 'miniNode', data: { actorLabel: '执行人', actor: 'ME', actionLabel: 'EIC 同行评议意见', currentStatus: '[同行评议意见 EIC] 等待 ME 确认 EIC 同行评议意见', showTopHandle: true } },
        { id: 'n3-4', position: { x: 600, y: 400 }, type: 'miniNode', data: { actorLabel: '执行人', actor: 'ME', actionLabel: 'EIC 同行评议意见', currentStatus: '[同行评议意见 EIC] 等待 ME 确认 EIC 同行评议意见', showBottomHandle: true } },
        { id: 'n4', position: { x: 950, y: -93 }, type: 'miniNode', data: { actorLabel: '状态', actor: '系统归档', actionLabel: '系统归档', currentStatus: '', borderColor: 'red', showAction: false } },
        { id: 'n5', position: { x: 950, y: 170 }, type: 'miniNode', data: { actorLabel: '状态', actor: '预接受 ME', actionLabel: '预接受 ME', currentStatus: '', borderColor: 'green', showAction: false } },
        { id: 'n7', position: { x: 950, y: 438 }, type: 'miniNode', data: { actorLabel: '状态', actor: '提交返修稿件 AU', actionLabel: '提交返修稿件 AU', currentStatus: '', borderColor: 'white', showBottomHandle: true, showAction: false } },
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2', sourceHandle: 'right' },
        { id: 'e2-1', source: 'n2', target: 'n3-1', label: '拒稿' },
        { id: 'e2-2', source: 'n2', target: 'n3-2', label: '接受' },
        { id: 'e2-3', source: 'n2', target: 'n3-3', label: 'AE' },
        { id: 'e2-4', source: 'n2', target: 'n3-4', label: '返修' },
        { id: 'e2-1-1', source: 'n3-1', target: 'n4', label: '确认', sourceHandle: 'right' },
        { id: 'e2-1-2', source: 'n3-1', target: 'n1', label: '驳回 重提', sourceHandle: 'top', style: { stroke: '#f43f5e', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f43f5e' } },
        { id: 'e2-2-1', source: 'n3-2', target: 'n5', label: '确认', sourceHandle: 'right' },
        { id: 'e2-2-2', source: 'n3-2', target: 'n1', label: '驳回 重提', sourceHandle: 'top', style: { stroke: '#f43f5e', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f43f5e' } },
        { id: 'e2-4-1', source: 'n3-4', target: 'n7', label: '确认', sourceHandle: 'right' },
        { id: 'e2-4-2', source: 'n3-4', target: 'n1', label: '驳回 重提', sourceHandle: 'bottom', style: { stroke: '#f43f5e', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f43f5e' } },         
        { id: 'e4', source: 'n7', target: 'n9', sourceHandle: 'right' },
        { id: 'e5', source: 'n6', target: 'n11', sourceHandle: 'right' },
        { id: 'e6', source: 'n9', target: 'n14', sourceHandle: 'right' },
        { id: 'e8', source: 'n14', target: 'n16', sourceHandle: 'right', label: '提交返修稿' },
      ]
    }
  },
  'node-2-5': {
    role: '管理编辑 (ME)',
    workflow: '主编完成决议草拟后，管理编辑(ME)进行状态合规检验和最终的预接受(Pre-Accept)操作或拒稿操作授权确认。确认通过后才正式通知作者并步入归档序列流转。',
    action: {
      initiator: '主编 (EiC)',
      executor: '管理编辑 (ME)',
      material: '主编起草的决定信及全部决议包',
      decisions: [
        { label: 'ME确认决议合规执行', type: 'pass', nextStep: '系统归档分发', cc: '归档系统、作者' },
        { label: '驳回主编决议重审', type: 'reject', nextStep: '退回 主编终审', cc: '主编 (预警)' }
      ]
    },
    diagram: [
      { label: 'EiC 决议待发' },
      { label: '预接受 / ME最终确认', isCurrent: true },
      { label: '授权出信与归档' },
    ],
    states: [
      { role: 'ME 端', state: '待处理 - 阶段把关与执行确认' },
      { role: '主编端', state: '已处理 - 等待ME审核执行' },
      { role: '系统', state: '挂起阻塞 - 待解除归档锁' }
    ],
    miniFlow: {
      nodes: [      
        { id: 'n1', position: { x: -80, y: 165 }, type: 'miniNode', data: { actorLabel: '状态', actor: '预接受 ME', actionLabel: '预接受 ME', currentStatus: '', borderColor: 'green', showAction: false } },
        { id: 'n2', position: { x: 210, y: 133 }, type: 'miniNode', data: { actorLabel: '发起人', actor: 'ME', actionLabel: 'ME 预接受', currentStatus: '[预接受 ME] 等待 ME 确认预接受 ME', isCurrent: true } },
        { id: 'n3-4', position: { x: 600, y: 400 }, type: 'miniNode', data: { actorLabel: '执行人', actor: 'EIC', actionLabel: 'ME 预接受 ', currentStatus: '[预接受 ME] 等待 EIC 确认 ME 预接受 ', showBottomHandle: true } },
        { id: 'n4', position: { x: 600, y: -93 }, type: 'miniNode', data: { actorLabel: '状态', actor: '系统归档', actionLabel: '系统归档', currentStatus: '', borderColor: 'red', showAction: false } },
        { id: 'n5', position: { x: 600, y: 170 }, type: 'miniNode', data: { actorLabel: '状态', actor: '系统归档', actionLabel: '系统归档', currentStatus: '', borderColor: 'green', showAction: false } },
        { id: 'n7', position: { x: 950, y: 430 }, type: 'miniNode', data: { actorLabel: '状态', actor: '提交返修稿件 AU', actionLabel: '提交返修稿件 AU', currentStatus: '', borderColor: 'white', showBottomHandle: true, showAction: false } },
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2', sourceHandle: 'right' },
        { id: 'e2-1', source: 'n2', target: 'n4', label: '拒稿' },
        { id: 'e2-2', source: 'n2', target: 'n5', label: '接受' },
        { id: 'e2-3', source: 'n2', target: 'n3-3', label: 'AE' },
        { id: 'e2-4', source: 'n2', target: 'n3-4', label: '返修' },
        { id: 'e2-2-2', source: 'n3-2', target: 'n1', label: '驳回 重提', sourceHandle: 'top', style: { stroke: '#f43f5e', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f43f5e' } },
        { id: 'e2-4-1', source: 'n3-4', target: 'n7', label: '确认', sourceHandle: 'right' },
        { id: 'e2-4-2', source: 'n3-4', target: 'n1', label: '驳回 重提', sourceHandle: 'bottom', style: { stroke: '#f43f5e', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f43f5e' } },         
        { id: 'e4', source: 'n7', target: 'n9', sourceHandle: 'right' },
        { id: 'e5', source: 'n6', target: 'n11', sourceHandle: 'right' },
        { id: 'e6', source: 'n9', target: 'n14', sourceHandle: 'right' },
        { id: 'e8', source: 'n14', target: 'n16', sourceHandle: 'right', label: '提交返修稿' },
      ]
    }
  },
  'node-3-decision': {
    role: '系统与归档 (System)',
    workflow: '该自动化网关仅在接受到 ME 审核通过并发出的信号后，进行自动的状态流转变更和正式邮件分发。将稿件流推进至录用、拒稿或撤稿结案。',
    action: {
      initiator: '管理编辑 (ME)',
      executor: '归档分发规则引擎',
      material: '经过ME确认授权的正式决定信',
      decisions: [
        { label: '录用及投产 (Accept)', type: 'pass', nextStep: '归档待刊', cc: '全体关联编辑、作者' },
        { label: '拒稿结案 (Reject)', type: 'reject', nextStep: '归档结案', cc: '全体关联编辑、作者' },
        { label: '撤销结案 (Withdraw)', type: 'revise', nextStep: '撤稿登记', cc: '全体关联编辑、作者' }
      ]
    },
    diagram: [
      { label: 'ME 授权通过' },
      { label: '系统归档分发', isCurrent: true, isDecision: true },
      { label: '下发终态结果' },
    ],
    states: [
      { role: '环境系统', state: '静默执行中 - 分发变更结果集' }
    ],
    miniFlow: {
      nodes: [
        { id: 'n1', position: { x: 50, y: 100 }, type: 'miniNode', data: { actorLabel: '执行人', actor: '系统', actionLabel: '归档分发', currentStatus: '静默执行中', isCurrent: true } },
        { id: 'n2', position: { x: 500, y: -20 }, type: 'miniNode', data: { actorLabel: '接收人', actor: '作者', actionLabel: '录用通知', currentStatus: '录用待刊' } },
        { id: 'n3', position: { x: 500, y: 100 }, type: 'miniNode', data: { actorLabel: '接收人', actor: '作者', actionLabel: '拒稿通知', currentStatus: '拒稿结案' } },
        { id: 'n4', position: { x: 500, y: 220 }, type: 'miniNode', data: { actorLabel: '接收人', actor: '作者', actionLabel: '撤稿通知', currentStatus: '撤单结案' } },
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2', label: '录用 (Accept)' },
        { id: 'e2', source: 'n1', target: 'n3', label: '拒稿 (Reject)' },
        { id: 'e3', source: 'n1', target: 'n4', label: '撤销 (Withdraw)' }
      ]
    }
  },
  'node-outcome-accept': {
    role: '系统自动流转',
    workflow: '触发模版邮件，向作者发送正式的录用通知。当前状态结束，稿件数据将转移至生产出版(Production)环节。',
    diagram: [
      { label: '录用决策' },
      { label: '通知作者', isCurrent: true },
      { label: '转入生产 phase' },
    ],
    states: [
      { role: '作者端', state: '状态完结 - 收到录用通知 (Accepted)' },
      { role: 'ME端', state: '待处理 - 准备转出出版' },
    ]
  },
  'node-outcome-reject': {
    role: '系统自动流转',
    workflow: '发送包含审稿评价的拒信，感谢作者投稿。稿件随之进入历史归档不再流转，状态实质结束。',
    diagram: [
      { label: '退稿决策' },
      { label: '通知作者', isCurrent: true },
      { label: '入库存档' },
    ],
    states: [
      { role: '作者端', state: '状态完结 - 收到拒稿通知 (Rejected)' },
    ]
  },
  'node-outcome-withdraw': {
    role: '系统自动流转',
    workflow: '收到撤稿通知或逾期未响应自动撤下，经ME确认后系统进行撤单结案处理。',
    diagram: [
      { label: '撤销决策' },
      { label: '通知撤稿', isCurrent: true },
      { label: '撤稿存档' },
    ],
    states: [
      { role: '作者端', state: '状态完结 - 稿件已撤销 (Withdrawn)' },
    ]
  },
  'node-2-6': {
    role: 'ME',
    workflow: 'ME 收到投稿后进行技术与格式初审。主要检查稿件格式、查重率、是否包含必填文件。审查通过则流转至主编评估；不通过拒稿通知主编进行初审决定；退修给作者反馈修稿要求补全信息。',
    action: {
      initiator: '作者',
      executor: '管理编辑 (ME)',
      material: '新稿件 / 返修稿',
      decisions: [
        { label: '通过初审 ME', type: 'pass', nextStep: '分配EIC初审', cc: '主编, 作者' },
        { label: '初审拒稿 ME', type: 'reject', nextStep: '初审决策 (主编)', cc: '主编' }
      ]
    },
    diagram: [
      { label: '收到新投稿' },
      { label: '格式/技术审查', isCurrent: true },
      { label: '分发决策', isDecision: true },
    ],
    states: [
      { role: 'ME 端', state: '初审拒稿 / EIC 初审' },
      { role: 'EIC 端', state: 'NA' },
      { role: 'AU 端', state: 'NA' },
      { role: 'AE 端', state: 'NA' },
    ],
    miniFlow: {
      nodes: [
        { id: 'n1', position: { x: -150, y: 179 }, type: 'miniNode', data: { actorLabel: '状态', actor: '同行评议意见 ME', actionLabel: '同行评议意见 ME', currentStatus: '', borderColor: 'green', showAction: false } },
        { id: 'n2', position: { x: 200, y: 154 }, type: 'miniNode', data: { actorLabel: '发起人', actor: '系统', actionLabel: '同行评议 材料传递', currentStatus: '静默执行中', isCurrent: true } },
        { id: 'n3', position: { x: 550, y: 138 }, type: 'miniNode', data: { actorLabel: '执行人', actor: 'ME', actionLabel: '同行评议意见 ME', currentStatus: '[同行评议意见 ME] 等待 ME 同行评议意见', showBottomHandle: true, showTopHandle: true } },
        { id: 'n4', position: { x: 950, y: 140 }, type: 'miniNode', data: { actorLabel: '发起人', actor: 'ME', actionLabel: '同行评议意见 分配 EIC', currentStatus: '[同行评议意见 ME] 等待 ME 分配 EIC', isCurrent: true, showTopHandle: true  } },
        { id: 'n5', position: { x: 1300, y: 158 }, type: 'miniNode', data: { actorLabel: '执行人', actor: '系统', actionLabel: '分配 EIC 和材料', currentStatus: '静默执行中', showTopHandle: true  } },
        { id: 'n6', position: { x: 1700, y: 183 }, type: 'miniNode', data: { actorLabel: '状态', actor: '同行评议意见 EIC', actionLabel: '同行评议意见 EIC', currentStatus: '', borderColor: 'orange', showAction: false } },
        { id: 'n7', position: { x: 950, y: 360 }, type: 'miniNode', data: { actorLabel: '状态', actor: '提交返修稿件 AU', actionLabel: '提交返修稿件 AU', currentStatus: '', borderColor: 'white', showBottomHandle: true, showAction: false } },
        { id: 'n8', position: { x: 950, y: -40 }, type: 'miniNode', data: { actorLabel: '发起人', actor: 'ME', actionLabel: '同行评议意见 分配 AE', currentStatus: '[同行评议意见 ME] 等待 ME 分配 AE', isCurrent: true, showTopHandle: true  } },
        { id: 'n9', position: { x: 1300, y: -47 }, type: 'miniNode', data: { actorLabel: '执行人', actor: 'EIC', actionLabel: '同行评议意见分配 AE', currentStatus: '[同行评议意见 ME] 等待 EIC 分配 AE 和材料', showTopHandle: true  } },
        { id: 'n10', position: { x: 2200, y: 10 }, type: 'miniNode', data: { actorLabel: '状态', actor: '同行评议意见 AE', actionLabel: '同行评议意见 AE', currentStatus: '', borderColor: 'purple', showAction: false } },
        { id: 'n11', position: { x: 1600, y: -30 }, type: 'miniNode', data: { actorLabel: '发起人', actor: 'ME', actionLabel: '同行评议意见 分配 AE', currentStatus: '[同行评议意见 ME] 等待 ME 分配 AE', isCurrent: true, showTopHandle: true  } },
        { id: 'n12', position: { x: 1900, y: -30 }, type: 'miniNode', data: { actorLabel: '执行人', actor: 'AE', actionLabel: '同行评议意见 AE', currentStatus: '[同行评议意见 ME] 等待 AE 确认 同行评议意见 AE 和材料', showTopHandle: true  } },
                
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2'},
        { id: 'e2', source: 'n2', target: 'n3', label: '通知' },
        { id: 'e3', source: 'n3', target: 'n4', label: '拒稿', sourceHandle: 'right' },
        { id: 'e6', source: 'n3', target: 'n7', label: '同行评议 返修', sourceHandle: 'bottom' },
        { id: 'e4', source: 'n4', target: 'n5', label: '选择 EIC' , sourceHandle: 'right' },
        { id: 'e5-1', source: 'n5', target: 'n6', label: '通知', sourceHandle: 'right' },
        { id: 'e5-2', source: 'n5', target: 'n4', label: '驳回 重提', sourceHandle: 'top', style: { stroke: '#f43f5e', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f43f5e' } },
        { id: 'e6-1', source: 'n3', target: 'n8', label: '通知', sourceHandle: 'top' },
        { id: 'e6-2', source: 'n9', target: 'n8', label: '驳回 重提', sourceHandle: 'top', style: { stroke: '#f43f5e', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f43f5e' } },
        { id: 'e7', source: 'n8', target: 'n9', label: '选择 AE' , sourceHandle: 'right' },
        { id: 'e9', source: 'n8', target: 'n11', label: '通知' , sourceHandle: 'right' },
        { id: 'e10', source: 'n11', target: 'n12', label: '通知' , sourceHandle: 'right' },
        { id: 'e11', source: 'n12', target: 'n8', label: '驳回 重提', sourceHandle: 'top', style: { stroke: '#f43f5e', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f43f5e' } },
        { id: 'e12', source: 'n12', target: 'n10', label: '确认' , sourceHandle: 'right' },
      ]
    }
  },
  'node-2-7': {
    role: '作者 (Author)',
    workflow: '作者在系统内填写并核对所有必填元数据，上传稿件正文等必要附件。确认无误后点击提交，触发流转，稿件正式进入编辑部处理环节。(注：系统提交动作无需经ME确认入库)',
    action: {
      initiator: '作者',
      executor: '投审稿系统',
      material: '返修稿',
      decisions: [
        { label: '提交成功 (待ME确认)', type: 'pass', nextStep: 'ME审批中', cc: '作者' }
      ]
    },
    diagram: [
      { label: '准备稿件' },
      { label: '在线提交', isCurrent: true },
      { label: 'ME初审' },
    ],
    states: [
      { role: 'ME 端', state: 'NA' },
      { role: 'EIC 端', state: 'NA' },
      { role: 'AU 端', state: '提交新稿件' },
      { role: 'AE 端', state: 'NA' },
    ],
    miniFlow: {
      nodes: [
        { id: 'n1', position: { x: 100, y: 100 }, type: 'miniNode', data: { actorLabel: '发起人', actor: 'AU', actionLabel: '提交返修稿件 AU', currentStatus: '[提交返修稿件 AU] 等待 AU 提交返修稿', isCurrent: true } },
        { id: 'n2', position: { x: 400, y: 108 }, type: 'miniNode', data: { actorLabel: '执行人', actor: '系统', actionLabel: '提交返修稿件', currentStatus: '静默执行中' } },
        { id: 'n3', position: { x: -200, y: 132 }, type: 'miniNode', data: { actorLabel: '状态', actor: '提交返修稿件 AU', actionLabel: '提交返修稿件 AU', currentStatus: '', borderColor: 'white', showAction: false } },
        { id: 'n4', position: { x: 750, y: 132 }, type: 'miniNode', data: { actorLabel: '状态', actor: '同行评议意见 ME', actionLabel: '同行评议意见 ME', currentStatus: '', borderColor: 'green', showAction: false } },
      ],
      edges: [
        { id: 'e1', source: 'n3', target: 'n1' },
        { id: 'e2', source: 'n1', target: 'n2' },
        { id: 'e3', source: 'n2', target: 'n4', label: '提交成功' }
      ]
    }
  },
  'node-4-1': {
    role: '管理编辑 (ME)',
    workflow: 'ME 收到投稿后进行技术与格式初审。主要检查稿件格式、查重率、是否包含必填文件。审查通过则流转至主编评估；不通过拒稿通知主编进行初审决定；退修给作者反馈修稿要求补全信息。',
    action: {
      initiator: '作者',
      executor: '管理编辑 (ME)',
      material: '新稿件 / 返修稿',
      decisions: [
        { label: '通过ME初审', type: 'pass', nextStep: '分配EIC初审', cc: '主编, 作者' },
        { label: '需初审返修', type: 'revise', nextStep: '退回作者', cc: '作者' },
        { label: '初审拒稿', type: 'reject', nextStep: '初审决策 (主编)', cc: '主编' }
      ]
    },
    diagram: [
      { label: '收到新投稿' },
      { label: '格式/技术审查', isCurrent: true },
      { label: '分发决策', isDecision: true },
    ],
    states: [
      { role: 'ME端', state: '编辑部ME审核结果 -> 分配EIC初审 / 需要初审返修 / 初审拒稿' },
      { role: '主编端', state: 'NA' },
      { role: '作者端', state: 'NA' },
      { role: 'AE端', state: 'NA' },
    ],
    miniFlow: {
      nodes: [
        { id: 'n1', position: { x: 100, y: 92 }, type: 'miniNode', data: { actorLabel: '发起人', actor: 'ME', actionLabel: '提交归档更新意见 RE', currentStatus: '[归档更新 ME] 等待 ME 提交归档更新意见', isCurrent: true } },
        { id: 'n2', position: { x: 400, y: 107 }, type: 'miniNode', data: { actorLabel: '执行人', actor: '系统', actionLabel: '提交归档更新意见 RE', currentStatus: '静默执行中' } },
        { id: 'n3', position: { x: -200, y: 140 }, type: 'miniNode', data: { actorLabel: '状态', actor: '提交归档更新意见 RE', actionLabel: '提交归档更新意见 RE', currentStatus: '', borderColor: 'white', showAction: false } },
        { id: 'n4', position: { x: 750, y: 140 }, type: 'miniNode', data: { actorLabel: '状态', actor: '归档更新 EIC', actionLabel: '归档更新 EIC', currentStatus: '', borderColor: 'orange', showAction: false } },
      ],
      edges: [
        { id: 'e1', source: 'n3', target: 'n1' },
        { id: 'e2', source: 'n1', target: 'n2' },
        { id: 'e3', source: 'n2', target: 'n4', label: '提交成功' }
      ]
    }
  },
  'node-4-2': {
    role: '主编 (EiC)',
    workflow: '主编依据 ME 初审通过的稿件，从学术视角评估其是否符合期刊范畴。若符合，则为主编分配合适的学术编辑 (AE) 进入下一环节；若明显不符，执行直接拒稿 (Desk Reject)。(注：主编的任何阶段性决策与流转，均需经ME审批确认后方可真正执行)',
    action: {
      initiator: '管理编辑 (ME)',
      executor: '主编 (EiC)',
      material: 'ME格式初审合格的手稿',
      decisions: [
        { label: '分配学术编辑 (待ME确认)', type: 'pass', nextStep: 'ME审批确认流转', cc: '学术编辑 (AE)' },
        { label: '直接拒稿 (Desk Reject) (待ME确认)', type: 'reject', nextStep: 'ME审批确认流转', cc: '管理编辑, 作者' }
      ]
    },
    diagram: [
      { label: 'ME 递交' },
      { label: '学术价值评估', isCurrent: true },
      { label: '分配学术编辑', isDecision: true },
    ],
    states: [
      { role: 'ME端', state: '确认 / 退回主编重新做决定' },
      { role: '主编端', state: '主编审核结果 -> 分配AE / 拒稿 / 接受 / 返修' },
      { role: '作者端', state: '提交返修稿' },
      { role: 'AE端', state: 'NA' },
    ],
    miniFlow: {
      nodes: [      
        { id: 'n1', position: { x: -80, y: 165 }, type: 'miniNode', data: { actorLabel: '状态', actor: '归档更新 EIC', actionLabel: '归档更新 EIC', currentStatus: '', borderColor: 'orange', showAction: false, showTopHandle: true, showBottomHandle: true } },
        { id: 'n2', position: { x: 210, y: 133 }, type: 'miniNode', data: { actorLabel: '发起人', actor: 'EIC', actionLabel: 'EIC 归档更新', currentStatus: '[归档更新 EIC] 等待 EIC 归档更新', isCurrent: true } },
        { id: 'n3-1', position: { x: 600, y: -130 }, type: 'miniNode', data: { actorLabel: '执行人', actor: 'ME', actionLabel: 'EIC 归档更新', currentStatus: '[归档更新 EIC] 等待 ME 确认 EIC 归档更新', showTopHandle: true } },
        { id: 'n3-2', position: { x: 600, y: 130 }, type: 'miniNode', data: { actorLabel: '执行人', actor: 'ME', actionLabel: 'EIC 归档更新', currentStatus: '[归档更新 EIC] 等待 ME 确认 EIC 归档更新', showTopHandle: true } },
        { id: 'n3-4', position: { x: 600, y: 400 }, type: 'miniNode', data: { actorLabel: '执行人', actor: 'ME', actionLabel: 'EIC 归档更新', currentStatus: '[归档更新 EIC] 等待 ME 确认 EIC 归档更新', showBottomHandle: true } },
        { id: 'n4', position: { x: 950, y: -93 }, type: 'miniNode', data: { actorLabel: '状态', actor: '归档更新', actionLabel: '归档更新', currentStatus: '', borderColor: 'red', showAction: false } },
        { id: 'n5', position: { x: 950, y: 170 }, type: 'miniNode', data: { actorLabel: '状态', actor: '归档更新', actionLabel: '归档更新', currentStatus: '', borderColor: 'sky', showAction: false } },
        { id: 'n7', position: { x: 950, y: 438 }, type: 'miniNode', data: { actorLabel: '状态', actor: '归档更新', actionLabel: '归档更新', currentStatus: '', borderColor: 'white', showBottomHandle: true, showAction: false } },
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2', sourceHandle: 'right' },
        { id: 'e2-1', source: 'n2', target: 'n3-1', label: '拒稿 / 撤稿' },
        { id: 'e2-2', source: 'n2', target: 'n3-2', label: '更正' },
        { id: 'e2-3', source: 'n2', target: 'n3-3', label: 'AE' },
        { id: 'e2-4', source: 'n2', target: 'n3-4', label: '记录' },
        { id: 'e2-1-1', source: 'n3-1', target: 'n4', label: '确认', sourceHandle: 'right' },
        { id: 'e2-1-2', source: 'n3-1', target: 'n1', label: '驳回 重提', sourceHandle: 'top', style: { stroke: '#f43f5e', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f43f5e' } },
        { id: 'e2-2-1', source: 'n3-2', target: 'n5', label: '确认', sourceHandle: 'right' },
        { id: 'e2-2-2', source: 'n3-2', target: 'n1', label: '驳回 重提', sourceHandle: 'top', style: { stroke: '#f43f5e', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f43f5e' } },
        { id: 'e2-4-1', source: 'n3-4', target: 'n7', label: '确认', sourceHandle: 'right' },
        { id: 'e2-4-2', source: 'n3-4', target: 'n1', label: '驳回 重提', sourceHandle: 'bottom', style: { stroke: '#f43f5e', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f43f5e' } },         
        { id: 'e4', source: 'n7', target: 'n9', sourceHandle: 'right' },
        { id: 'e5', source: 'n6', target: 'n11', sourceHandle: 'right' },
        { id: 'e6', source: 'n9', target: 'n14', sourceHandle: 'right' },
        { id: 'e8', source: 'n14', target: 'n16', sourceHandle: 'right', label: '提交返修稿' },
      ]
    }
  }
};

const getReviewerConfig = (): NodeConfig => ({
  role: '受邀审稿人 (Reviewers)',
  workflow: '多名审稿人同意审阅后，分别下载稿件全文，填写评审问卷并留下专业学术意见（包括给作者的修订建议以及私下给编辑的补充反馈）。最终给出录用或拒稿偏向的评分。(注：所有外审打分与反馈提交后，需ME查验与确认才可正式汇总)',
  action: {
    initiator: '学术编辑 (AE)',
    executor: '受邀审稿专家群',
    material: '手稿匿名包、在线打分表',
    decisions: [
      { label: '分别提交评估意见与打分 (待ME并行确认)', type: 'pass', nextStep: 'ME审批确认流转', cc: '学术编辑' }
    ]
  },
  diagram: [
    { label: '接受邀请' },
    { label: '多方审阅反馈', isCurrent: true },
    { label: '提交待汇总' },
  ],
  states: [
    { role: '审稿人端', state: '待处理 - 待提交审阅意见和评分表' },
    { role: 'AE端', state: '等待所有受邀专家返回意见' },
    { role: '作者端', state: '外审中 (Under Peer Review)' },
  ],
  miniFlow: {
    nodes: [
      { id: 'n1', position: { x: 0, y: 0 }, type: 'miniNode', data: { actorLabel: '状态', actor: '同行评议意见 RE', actionLabel: '同行评议意见 RE', currentStatus: '', borderColor: 'sky', showAction: false } },
      { id: 'n1-1', position: { x: 400, y: -150 }, type: 'miniNode', data: { actorLabel: '发起人', actor: 'AE', actionLabel: '等待 AE 建议 RE', currentStatus: '[同行评议意见 RE] 等待 AE 建议 RE', isCurrent: true } },
      { id: 'n1-2', position: { x: 400, y: 100 }, type: 'miniNode', data: { actorLabel: '发起人', actor: 'ME', actionLabel: '等待 ME 建议 RE', currentStatus: '[同行评议意见 RE] 等待 ME 建议 RE', isCurrent: true } },
      { id: 'n2', position: { x: 800, y: -25 }, type: 'miniNode', data: { actorLabel: '执行人', actor: '系统', actionLabel: '建议 RE', currentStatus: '静默执行中' } },
      { id: 'n3', position: { x: 1150, y: -25 }, type: 'miniNode', data: { actorLabel: '发起人', actor: '系统', actionLabel: '反馈 建议 RE', currentStatus: '静默执行中', isCurrent: true } },
      { id: 'n4', position: { x: 1500, y: -32 }, type: 'miniNode', data: { actorLabel: '执行人', actor: 'ME', actionLabel: '反馈 建议 RE', currentStatus: '[提交同行评议意见 RE] 等待 ME 邀请 RE', showTopHandle: true, showBottomHandle: true } },
      { id: 'n5', position: { x: 1850, y: -23 }, type: 'miniNode', data: { actorLabel: '发起人', actor: '系统', actionLabel: '邀请 RE', currentStatus: '静默执行中', isCurrent: true  } },
      { id: 'n6', position: { x: 2200, y: -37 }, type: 'miniNode', data: { actorLabel: '执行人', actor: 'RE', actionLabel: '邀请 RE', currentStatus: '[提交同行评议意见 RE] 等待 RE 反馈 系统', showTopHandle: true, showBottomHandle: true } },
      { id: 'n9', position: { x: 2550, y: 0 }, type: 'miniNode', data: { actorLabel: '状态', actor: '同行评议意见 AE', actionLabel: '同行评议意见 AE', currentStatus: '', borderColor: 'purple', showAction: false } },
    ],
    edges: [
      { id: 'e1-1', source: 'n1', target: 'n1-1' },
      { id: 'e1-2', source: 'n1', target: 'n1-2' },
      { id: 'e2-1', source: 'n1-1', target: 'n2' },
      { id: 'e2-2', source: 'n1-2', target: 'n2' },
      { id: 'e3', source: 'n2', target: 'n3' },
      { id: 'e4', source: 'n3', target: 'n4'},
      { id: 'e6', source: 'n4', target: 'n5', sourceHandle: 'right', label: '确认' },
      { id: 'e7', source: 'n4', target: 'n1', sourceHandle: 'top', label: '驳回 重提', style: { stroke: '#f43f5e', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f43f5e' } },
      { id: 'e8', source: 'n5', target: 'n6'},
      { id: 'e9', source: 'n6', target: 'n1', sourceHandle: 'top', label: '驳回 重提', style: { stroke: '#f43f5e', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f43f5e' } },
      { id: 'e10', source: 'n6', target: 'n9', sourceHandle: 'right', label: '确认' },
    ]
  }
});

export function NodeDetails({ node }: NodeDetailsProps) {
  const [isDiagramModalOpen, setIsDiagramModalOpen] = useState(false);
  const [isMiniSelectionMode, setIsMiniSelectionMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // If no internal config found, fallback to generic
  const isReviewerNode = node.type === 'reviewer';
  const config = isReviewerNode ? getReviewerConfig() : pmConfig[node.id];

  return (
    <>
      <div className="space-y-6 text-slate-800">
        <div className="border-b border-slate-200 pb-4">
          <h3 className="text-lg font-bold">{String(node.data.label || node.type)}</h3>
        </div>

        <div className="space-y-6">
          {/* Module 1: Role */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-2">一、节点角色</h4>
            <p className="text-sm text-slate-700">
              {config ? config.role : (node.data.role as string) || '未指定'}
            </p>
          </div>

          {/* Module 2: Workflow Description */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-2">二、审批工作流</h4>
            <div className="space-y-4">
              <p className="text-sm text-slate-700 leading-relaxed">
                {config ? config.workflow : '通用流转节点。'}
              </p>

              {/* View Detailed Status Button */}
              <div className="mt-4">
                <button 
                  onClick={() => setIsDiagramModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  <Presentation size={16} />
                  查看审批流程与流转图
                </button>
              </div>

              {/* Minimal Diagram */}
              {config?.diagram && (
                <div className="pt-2">
                  <div className="flex items-center gap-1 overflow-x-auto pb-2 no-scrollbar">
                    {config.diagram.map((step, idx) => (
                      <React.Fragment key={idx}>
                        <div 
                          className={`px-3 py-1.5 rounded-md border text-[11px] font-medium whitespace-nowrap transition-all
                            ${step.isCurrent 
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm scale-105' 
                              : 'bg-white text-slate-500 border-slate-200'
                            }
                            ${step.isDecision ? 'rounded-lg rotate-1' : ''}
                          `}
                        >
                          {step.label}
                        </div>
                        {idx < config.diagram.length - 1 && (
                          <div className="text-slate-300 px-1">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M5 12h14M12 5l7 7-7 7"/>
                            </svg>
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Module 3: Operation States */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-3">三、对应的操作（Action）</h4>
            <div className="space-y-3">
              {config && config.states ? (
                config.states.map((s, i) => (
                  <div key={i} className="flex flex-col gap-1 text-[13px]">
                     <div className="font-semibold text-slate-800">
                       {s.role}：
                     </div>
                     <div className="text-slate-600 pl-4 border-l-2 border-slate-200">
                       {s.state}
                     </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-slate-500 italic">
                  无可用状态记录
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Modal / Dialog for Detailed Diagram */}
      {isDiagramModalOpen && config && (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm ${isFullscreen ? 'p-0' : 'p-4'}`}>
          <div className={`bg-white w-full flex flex-col overflow-hidden ${isFullscreen ? 'h-screen' : 'h-[85vh] max-w-5xl rounded-xl'}`}>
            {/* 操作工具栏 */}
            <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-200 shrink-0">
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5 shadow-sm">
                <button
                  onClick={() => setIsMiniSelectionMode(false)}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer",
                    !isMiniSelectionMode ? "bg-indigo-100 text-indigo-700" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  <Pointer size={12} />
                  平移
                </button>
                <button
                  onClick={() => setIsMiniSelectionMode(true)}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer",
                    isMiniSelectionMode ? "bg-indigo-100 text-indigo-700" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  <SquareDashed size={12} />
                  框选
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsFullscreen(!isFullscreen)} 
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                  title={isFullscreen ? '退出全屏' : '全屏'}
                >
                  {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </button>
                <button 
                  onClick={() => setIsDiagramModalOpen(false)} 
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* 流程图画布 */}
            <div className="flex-1 relative">
              {config.miniFlow ? (
                <ReactFlow
                  nodes={config.miniFlow.nodes}
                  edges={config.miniFlow.edges.map((e: Edge) => ({ ...defaultEdgeOptions, ...e }))}
                  nodeTypes={miniNodeTypes}
                  fitView
                  proOptions={{ hideAttribution: true }}
                  nodesDraggable={false}
                  panOnDrag={!isMiniSelectionMode}
                  selectionOnDrag={isMiniSelectionMode}
                  selectionMode={SelectionMode.Partial}
                  zoomOnScroll={true}
                  minZoom={0.3}
                  maxZoom={2}
                >
                  <Background color="#cbd5e1" gap={16} />
                  <Controls className="!bg-white !border-slate-200 !shadow-md" showInteractive={false} />
                </ReactFlow>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <AlertCircle className="mr-2" />
                  暂无流程状态图配置
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
