import React from 'react';
import styled from 'styled-components';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ChartContainer = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
`;

const ChartTitle = styled.h3`
  font-family: 'Poppins', sans-serif;
  font-size: 18px;
  font-weight: 600;
  color: #141F25;
  margin: 0 0 20px 0;
  text-align: center;
`;

const ChartWrapper = styled.div`
  height: 200px;
`;

const LegendContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 16px;
  flex-wrap: wrap;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Poppins', sans-serif;
  font-size: 12px;
  color: #666;
`;

const LegendColor = styled.div<{ $color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 2px;
  background: ${props => props.$color};
`;

interface DailyAttendance {
  day: string;
  onTime: number;
  late: number;
  absent: number;
}

interface AttendanceChartProps {
  data: DailyAttendance[];
}

const AttendanceChart: React.FC<AttendanceChartProps> = ({ data }) => {
  const chartData = {
    labels: data.map(d => d.day),
    datasets: [
      {
        label: 'On-time',
        data: data.map(d => d.onTime),
        backgroundColor: '#D6B10E',
        borderRadius: 4,
        borderSkipped: false,
      },
      {
        label: 'Late',
        data: data.map(d => d.late),
        backgroundColor: '#E6D693',
        borderRadius: 4,
        borderSkipped: false,
      },
      {
        label: 'Absent',
        data: data.map(d => d.absent),
        backgroundColor: '#997C0C',
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#141F25',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        cornerRadius: 8,
        displayColors: true,
        titleAlign: 'center' as const,
        callbacks: {
          title: function(context: any) {
            return context[0].label;
          },
          label: function(context: any) {
            return `${context.dataset.label}: ${context.parsed.y}`;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: 'Poppins',
            size: 12,
          },
          color: '#666',
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#f0f0f0',
          lineWidth: 1,
        },
        ticks: {
          font: {
            family: 'Poppins',
            size: 12,
          },
          color: '#666',
          stepSize: 10,
          callback: function(value: any) {
            return value;
          }
        },
        max: 50, // Set a reasonable max based on expected teacher count
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  return (
    <ChartContainer>
      <ChartTitle>Attendance Status</ChartTitle>
      <ChartWrapper>
        <Bar data={chartData} options={options} />
      </ChartWrapper>
      <LegendContainer>
        <LegendItem>
          <LegendColor $color="#D6B10E" />
          On-time
        </LegendItem>
        <LegendItem>
          <LegendColor $color="#E6D693" />
          Late
        </LegendItem>
        <LegendItem>
          <LegendColor $color="#997C0C" />
          Absents
        </LegendItem>
      </LegendContainer>
    </ChartContainer>
  );
};

export default AttendanceChart; 
