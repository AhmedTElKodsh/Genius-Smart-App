import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Sidebar from '../components/Sidebar';
import AddTeacherModal from '../components/AddTeacherModal';
import EditTeacherModal from '../components/EditTeacherModal';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import DateRangePicker from '../components/DateRangePicker';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useLanguage } from '../contexts/LanguageContext';
import { format } from 'date-fns';
import AnalyticsKPIModal from '../components/AnalyticsKPIModal';
import AnalyticsCard from '../components/AnalyticsCard';
import RequestTypeDetailModal from '../components/RequestTypeDetailModal';

// TypeScript declarations
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

interface AnalyticsData {
  late_arrival: number;
  early_leave: number;
  authorized_absence: number;
  unauthorized_absence: number;
  overtime: number;
  total_hours: number;
}

interface BarChartProps {
  data: Array<{ name: string; value: number }>;
  isDarkMode: boolean;
}

const BarChart: React.FC<BarChartProps> = ({ data, isDarkMode }) => {
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#444' : '#f0f0f0'} />
        <XAxis 
          dataKey="name" 
          angle={-45}
          textAnchor="end"
          height={100}
          tick={{ fill: isDarkMode ? '#ccc' : '#666', fontSize: 12 }}
        />
        <YAxis tick={{ fill: isDarkMode ? '#ccc' : '#666' }} />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: isDarkMode ? '#2d2d2d' : '#fff',
            border: `1px solid ${isDarkMode ? '#444' : '#ccc'}`,
            borderRadius: '8px'
          }}
          labelStyle={{ color: isDarkMode ? '#ccc' : '#333' }}
        />
        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

interface DonutChartProps {
  data: Array<{ name: string; value: number }>;
  isDarkMode: boolean;
}

const DonutChart: React.FC<DonutChartProps> = ({ data, isDarkMode }) => {
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ 
            backgroundColor: isDarkMode ? '#2d2d2d' : '#fff',
            border: `1px solid ${isDarkMode ? '#444' : '#ccc'}`,
            borderRadius: '8px'
          }}
        />
        <Legend 
          verticalAlign="bottom" 
          height={36}
          formatter={(value) => <span style={{ color: isDarkMode ? '#ccc' : '#333', fontSize: '12px' }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

// Rest of the component implementation will go here...
// This is a placeholder for the fixed structure

const Teachers: React.FC = () => {
  // State and hooks
  const [activeTab, setActiveTab] = useState<'all' | 'reports' | 'statistics'>('all');
  const { language, t } = useLanguage();
  const isRTL = language === 'ar';
  
  // Return statement with fixed JSX structure
  return (
    <TeachersContainer>
      <Sidebar onAddTeacher={() => {}} />
      <MainContent $isRTL={isRTL}>
        <Header>
          {/* Header content */}
        </Header>
        
        {/* Tab contents - each in its own conditional */}
        {activeTab === 'all' && (
          <div>All Teachers Content</div>
        )}
        
        {activeTab === 'statistics' && (
          <div>Statistics Content</div>
        )}
        
        {activeTab === 'reports' && (
          <div>Reports Content</div>
        )}
      </MainContent>
      
      {/* Modals */}
    </TeachersContainer>
  );
};

// Styled components
const TeachersContainer = styled.div`
  display: flex;
  height: 100vh;
  background-color: ${props => props.theme.background};
  position: relative;
`;

const MainContent = styled.div<{ $isRTL: boolean }>`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
`;

const Header = styled.div`
  margin-bottom: 30px;
`;

export default Teachers;
