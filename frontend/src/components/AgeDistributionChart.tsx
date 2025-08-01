import React from 'react';
import styled from 'styled-components';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useLanguage } from '../contexts/LanguageContext';

ChartJS.register(ArcElement, Tooltip, Legend);

const ChartContainer = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
`;

const ChartTitle = styled.h3<{ $isRTL?: boolean }>`
  font-family: ${props => props.$isRTL ? "'Cairo', 'Tajawal', sans-serif" : "'Poppins', sans-serif"};
  font-size: 18px;
  font-weight: 600;
  color: #141F25;
  margin: 0 0 20px 0;
  text-align: center;
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
`;

const ChartWrapper = styled.div`
  position: relative;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CenterLabel = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
`;

const CenterNumber = styled.div`
  font-family: 'Poppins', sans-serif;
  font-size: 24px;
  font-weight: 600;
  color: #141F25;
  line-height: 1;
`;

const CenterLabel2 = styled.div<{ $isRTL?: boolean }>`
  font-family: ${props => props.$isRTL ? "'Cairo', 'Tajawal', sans-serif" : "'Poppins', sans-serif"};
  font-size: 12px;
  font-weight: 400;
  color: #666;
  margin-top: 4px;
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
`;

const LegendContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 20px;
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
  border-radius: 50%;
  background: ${props => props.$color};
`;

interface AgeDistribution {
  under24: number;
  between24And32: number;
  above32: number;
  total: number;
}

interface AgeDistributionChartProps {
  data: AgeDistribution;
}

const AgeDistributionChart: React.FC<AgeDistributionChartProps> = ({ data }) => {
  const { t, isRTL } = useLanguage();
  const total = data.total || 1; // Prevent division by zero
  
  const chartData = {
    labels: ['Less 24 Years', 'Bet 24-32 Years', 'Above 32 Years'],
    datasets: [
      {
        data: [data.under24, data.between24And32, data.above32],
        backgroundColor: ['#D6B10E', '#E6D693', '#997C0C'],
        borderWidth: 0,
        cutout: '70%',
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
        displayColors: false,
        callbacks: {
          label: function(context: any) {
            const percentage = ((context.parsed / total) * 100).toFixed(0);
            return `${context.label}: ${percentage}%`;
          }
        }
      },
    },
  };

  const percentages = {
    under24: Math.round((data.under24 / total) * 100),
    between24And32: Math.round((data.between24And32 / total) * 100),
    above32: Math.round((data.above32 / total) * 100),
  };

  return (
    <ChartContainer>
      <ChartTitle $isRTL={isRTL}>{t('dashboard.averageTeachersAges')}</ChartTitle>
      <ChartWrapper>
        <Doughnut data={chartData} options={options} />
        <CenterLabel>
          <CenterNumber>{total}</CenterNumber>
          <CenterLabel2 $isRTL={isRTL}>{t('nav.teachers')}</CenterLabel2>
        </CenterLabel>
      </ChartWrapper>
      <LegendContainer>
        <LegendItem>
          <LegendColor $color="#D6B10E" />
          Less 24 Years ({percentages.under24}%)
        </LegendItem>
        <LegendItem>
          <LegendColor $color="#E6D693" />
          Bet 24-32 Years ({percentages.between24And32}%)
        </LegendItem>
        <LegendItem>
          <LegendColor $color="#997C0C" />
          Above 32 Years ({percentages.above32}%)
        </LegendItem>
      </LegendContainer>
    </ChartContainer>
  );
};

export default AgeDistributionChart; 
