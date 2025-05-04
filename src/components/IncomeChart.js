import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LabelList } from 'recharts';

const IncomeChart = ({ income }) => {
  if (!income || !income.length) return <p>No income data available</p>;

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={income}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="sales" fill="#8884d8" name="Sales">
          <LabelList dataKey="sales" position="top" formatter={(value) => `$${value}`} />
        </Bar>
        <Bar dataKey="donations" fill="#82ca9d" name="Donations" />
        <Bar dataKey="investments" fill="#ff7300" name="Investments" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default IncomeChart;