"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import { Laptop, Lightbulb, Award } from "lucide-react";

// Donut Chart Component with multiple segments
interface SegmentData {
  value: number;
  color: string;
  label?: string;
}

function DonutChart({ data, total, size = 200 }: { data: SegmentData[]; total: number; size?: number }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const center = size / 2;
  const outerRadius = (size - 20) / 2;
  const innerRadius = outerRadius - 20; // 20px stroke width
  const strokeWidth = 20;
  
  // Helper function to create arc path
  const createArcPath = (startAngle: number, endAngle: number, outerR: number, innerR: number) => {
    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;
    
    const x1 = center + outerR * Math.cos(startAngleRad);
    const y1 = center + outerR * Math.sin(startAngleRad);
    const x2 = center + outerR * Math.cos(endAngleRad);
    const y2 = center + outerR * Math.sin(endAngleRad);
    
    const x3 = center + innerR * Math.cos(endAngleRad);
    const y3 = center + innerR * Math.sin(endAngleRad);
    const x4 = center + innerR * Math.cos(startAngleRad);
    const y4 = center + innerR * Math.sin(startAngleRad);
    
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
    
    return `M ${x1} ${y1} A ${outerR} ${outerR} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 ${largeArcFlag} 0 ${x4} ${y4} Z`;
  };
  
  // Calculate angles for each segment
  let currentAngle = -90; // Start from top
  const segments: Array<{ 
    path: string; 
    color: string; 
    value: number;
    startAngle: number;
    endAngle: number;
    midAngle: number;
    label?: string;
  }> = [];
  
  data.forEach((segment) => {
    const percentage = (segment.value / total) * 100;
    const angle = (percentage / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    const midAngle = (startAngle + endAngle) / 2;
    
    const path = createArcPath(startAngle, endAngle, outerRadius, innerRadius);
    segments.push({ 
      path, 
      color: segment.color,
      value: segment.value,
      startAngle,
      endAngle,
      midAngle,
      label: segment.label
    });
    
    currentAngle = endAngle;
  });
  
  const totalValue = data.reduce((sum, segment) => sum + segment.value, 0);

  const handleMouseEnter = (index: number, midAngle: number) => {
    setHoveredIndex(index);
    // Calculate tooltip position at the middle of the segment
    const midAngleRad = (midAngle * Math.PI) / 180;
    const tooltipRadius = (outerRadius + innerRadius) / 2;
    const x = center + tooltipRadius * Math.cos(midAngleRad);
    const y = center + tooltipRadius * Math.sin(midAngleRad);
    setTooltipPos({ x, y });
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
    setTooltipPos(null);
  };

  const hoveredSegment = hoveredIndex !== null ? segments[hoveredIndex] : null;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={outerRadius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        {/* Segments */}
        {segments.map((segment, index) => {
          const isHovered = hoveredIndex === index;
          const scale = isHovered ? 1.08 : 1;
          const midAngleRad = (segment.midAngle * Math.PI) / 180;
          const offsetX = isHovered ? Math.cos(midAngleRad) * 3 : 0;
          const offsetY = isHovered ? Math.sin(midAngleRad) * 3 : 0;
          
          return (
            <g 
              key={index} 
              transform={`translate(${center + offsetX}, ${center + offsetY}) scale(${scale}) translate(${-center}, ${-center})`}
              className="transition-all duration-300"
            >
              <path
                d={segment.path}
                fill={segment.color}
                stroke={isHovered ? "#fff" : segment.color}
                strokeWidth={isHovered ? "2.5" : "1"}
                className="cursor-pointer"
                onMouseEnter={() => handleMouseEnter(index, segment.midAngle)}
                onMouseLeave={handleMouseLeave}
                style={{ 
                  filter: isHovered ? 'brightness(1.15) drop-shadow(0 4px 8px rgba(0,0,0,0.2))' : 'none',
                }}
              />
            </g>
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-2xl font-bold text-gray-800">{Math.round(totalValue)}h</span>
        <span className="text-xs text-gray-500">Total</span>
      </div>
      {/* Tooltip */}
      {hoveredSegment && tooltipPos && (
        <div
          className="absolute bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg pointer-events-none z-10 whitespace-nowrap"
          style={{
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y}px`,
            transform: 'translate(-50%, -120%)',
          }}
        >
          <div className="font-semibold">{hoveredSegment.label || `Segment ${hoveredIndex! + 1}`}</div>
          <div className="text-gray-300">{hoveredSegment.value.toFixed(1)}h</div>
          <div className="text-gray-400">
            {((hoveredSegment.value / total) * 100).toFixed(1)}%
          </div>
          {/* Tooltip arrow */}
          <div
            className="absolute top-full left-1/2 transform -translate-x-1/2"
            style={{
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '6px solid #111827',
            }}
          />
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { currentUser, loading } = useAuth();

  useEffect(() => {
    if (!loading && !currentUser) {
      router.push("/login");
    }
  }, [currentUser, loading, router]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!currentUser) {
    return null;
  }

  const userName = currentUser.displayName || currentUser.email?.split("@")[0] || "User";

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Panel */}
            <div className="lg:col-span-2 space-y-6">
              {/* Welcome Section */}
              <div className="mb-6">
                <h1 className="text-4xl font-bold text-gray-900 mb-3">
                  Welcome back, {userName} 👋
                </h1>
                <p className="text-gray-600 text-base leading-relaxed">
                  Your progress this week is Awesome. let's keep it up and get a lot of points reward!
                </p>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Hours Spent */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Laptop className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-600 mb-1">Hours Spent</p>
                      <p className="text-3xl font-bold text-purple-600">34h</p>
                    </div>
                  </div>
                </div>

                {/* Test Results */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Lightbulb className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-600 mb-1">Test Results</p>
                      <p className="text-3xl font-bold text-blue-600">82%</p>
                    </div>
                  </div>
                </div>

                {/* Course Completed */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-600 mb-1">Course Completed</p>
                      <p className="text-3xl font-bold text-orange-600">14</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel - Time Spendings */}
            <div className="lg:col-span-1 bg-white rounded-lg shadow-sm p-6">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900 mb-1">Time spendings</h2>
                <p className="text-xs text-gray-500">Weekly report</p>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-2xl font-bold text-gray-900 mb-2">231h 14m</p>
                  <div className="inline-flex items-center px-2.5 py-1 bg-green-100 rounded-md">
                    <span className="text-xs font-semibold text-green-700">+18.4%</span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <DonutChart 
                    data={[
                      { value: 85, color: "#10b981", label: "Study Materials" }, // Medium green
                      { value: 65, color: "#34d399", label: "Practice Tests" }, // Light green
                      { value: 45, color: "#6ee7b7", label: "Video Lessons" }, // Lighter green
                      { value: 25, color: "#a7f3d0", label: "Quizzes" }, // Very light green
                      { value: 11.14, color: "#d1fae5", label: "Other" }, // Lightest green
                    ]}
                    total={231.14}
                    size={140}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

