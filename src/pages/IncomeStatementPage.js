import React, { useRef } from 'react';
import IncomeChart from '../components/IncomeChart';

const IncomeStatementPage = () => {
  const chartRef = useRef(null);

  // Expanded income data with multiple sources
  const income = [
    { month: 'Jan 2025', sales: 250, donations: 100, investments: 500 },
    { month: 'Feb 2025', sales: 300, donations: 150, investments: 400 },
    { month: 'Mar 2025', sales: 200, donations: 200, investments: 300 },
    { month: 'Apr 2025', sales: 350, donations: 120, investments: 450 },
  ];

  console.log('Income data passed to chart:', income);

  return (
    <div ref={chartRef}>
      <h2>Income Statement</h2>
      <IncomeChart income={income} />
    </div>
  );
};

export default IncomeStatementPage;