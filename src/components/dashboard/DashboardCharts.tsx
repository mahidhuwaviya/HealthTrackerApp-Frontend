import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from "recharts";

interface ChartData {
    name: string;
    value: number;
    [key: string]: any;
}

interface WeeklyProgressChartProps {
    data: ChartData[];
    barColor: string;
    unit: string;
    title?: string;
}

export const WeeklyProgressChart = ({ data, barColor, unit, title }: WeeklyProgressChartProps) => {
    return (
        <div className="h-[300px] w-full">
            {title && <h3 className="text-sm font-medium mb-4 text-muted-foreground">{title}</h3>}
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    />
                    <Tooltip
                        cursor={{ fill: "hsl(var(--muted)/0.4)" }}
                        contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            borderColor: "hsl(var(--border))",
                            borderRadius: "8px",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                        }}
                        itemStyle={{ color: "hsl(var(--foreground))" }}
                        formatter={(value: number) => [`${value} ${unit}`, ""]}
                    />
                    <Bar
                        dataKey="value"
                        fill={barColor}
                        radius={[4, 4, 0, 0]}
                        barSize={40}
                        animationDuration={1500}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

interface TrendLineChartProps {
    data: ChartData[];
    lineColor: string;
    unit: string;
    title?: string;
}

export const TrendLineChart = ({ data, lineColor, unit, title }: TrendLineChartProps) => {
    return (
        <div className="h-[300px] w-full">
            {title && <h3 className="text-sm font-medium mb-4 text-muted-foreground">{title}</h3>}
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id={`gradient-${lineColor}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={lineColor} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            borderColor: "hsl(var(--border))",
                            borderRadius: "8px",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                        }}
                        itemStyle={{ color: "hsl(var(--foreground))" }}
                        formatter={(value: number) => [`${value} ${unit}`, ""]}
                    />
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke={lineColor}
                        fill={`url(#gradient-${lineColor})`}
                        strokeWidth={3}
                        animationDuration={1500}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};
