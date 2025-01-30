import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

export function Overview({ chartData }: any) { // eslint-disable-line
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={chartData}>
        <XAxis
          dataKey="name"
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
          tickFormatter={(value) => `₱${value}`}
        />
        <Tooltip
          formatter={(value: number) => `₱${new Intl.NumberFormat('en-US').format(value)}`}
          labelFormatter={(label) => `Interval: ${label}`}
        />
        <Bar
          dataKey="total"
          fill="currentColor"
          radius={[4, 4, 0, 0]}
          className="fill-primary"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}