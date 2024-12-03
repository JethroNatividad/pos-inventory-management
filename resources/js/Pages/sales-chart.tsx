import {
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/Components/ui/chart";

interface SalesChartProps {
    data: { label: string; count: number }[];
}

export default function SalesChart({ data }: SalesChartProps) {
    return (
        <ChartContainer
            config={{
                count: {
                    label: "Sales",
                    color: "hsl(var(--chart-1))",
                },
            }}
            className="h-[400px] w-full pr-6 py-4"
        >
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <XAxis
                        dataKey="label"
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                        tickFormatter={(count) => `${count}`}
                    />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Line
                        type="monotone"
                        dataKey="count"
                        strokeWidth={2}
                        className="stroke-primary"
                        dot={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </ChartContainer>
    );
}
