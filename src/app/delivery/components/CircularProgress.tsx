'use client';

import { LucideIcon } from 'lucide-react';

interface CircularProgressProps {
    value: number;
    max: number;
    label: string;
    color?: string;
    size?: number;
    icon?: LucideIcon;
}

export default function CircularProgress({
    value,
    max,
    label,
    color = '#4f46e5',
    size = 140,
    icon: Icon
}: CircularProgressProps) {
    const percentage = max > 0 ? Math.round((value / max) * 100) : 0;
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            {/* Icon above the circular graph */}
            {Icon && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '3rem',
                    height: '3rem',
                    borderRadius: '50%',
                    backgroundColor: `${color}15`,
                }}>
                    <Icon style={{ width: '1.75rem', height: '1.75rem', color }} />
                </div>
            )}

            {/* Circular graph with value in center */}
            <div style={{ position: 'relative', width: size, height: size }}>
                <svg width={size} height={size} style={{ display: 'block' }}>
                    {/* Background circle */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="8"
                    />
                    {/* Progress circle */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke={color}
                        strokeWidth="8"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                        transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    />
                </svg>
                {/* Center value */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'none'
                }}>
                    <span style={{ fontSize: '2rem', fontWeight: 'bold', color }}>{value}</span>
                </div>
            </div>

            {/* Percentage and label below the graph */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ fontSize: '1.125rem', fontWeight: '700', color }}>{percentage}%</span>
                <p style={{ fontSize: '0.875rem', fontWeight: '500', textAlign: 'center', margin: 0, color: '#6b7280' }}>{label}</p>
            </div>
        </div>
    );
}
