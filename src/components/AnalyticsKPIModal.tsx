import React from 'react';
import styled from 'styled-components';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

// Styled Components
const ModalOverlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: ${props => props.isOpen ? 'flex' : 'none'};
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div<{ isDarkMode: boolean; isRTL: boolean }>`
  background: ${props => props.isDarkMode ? '#2d2d2d' : '#ffffff'};
  border-radius: 20px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  direction: ${props => props.isRTL ? 'rtl' : 'ltr'};
`;

const Header = styled.div<{ isDarkMode: boolean; isRTL: boolean }>`
  display: flex;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid ${props => props.isDarkMode ? '#444' : '#f0f0f0'};
  position: relative;
`;

const CloseButton = styled.button<{ isRTL: boolean }>`
  background: #DAA520;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  cursor: pointer;
  position: absolute;
  ${props => props.isRTL ? 'left: 24px' : 'right: 24px'};
  
  &:hover {
    background: #B8860B;
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const Title = styled.h2<{ isDarkMode: boolean; isRTL: boolean }>`
  color: ${props => props.isDarkMode ? '#ffffff' : '#333333'};
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  text-align: ${props => props.isRTL ? 'right' : 'left'};
  flex: 1;
  ${props => props.isRTL ? 'margin-left: 60px' : 'margin-right: 60px'};
`;

const Content = styled.div<{ isDarkMode: boolean }>`
  padding: 24px;
  color: ${props => props.isDarkMode ? '#e0e0e0' : '#333333'};
`;

const MetricGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
`;

const MetricCard = styled.div<{ isDarkMode: boolean }>`
  background: ${props => props.isDarkMode ? '#404040' : '#f8f9fa'};
  border-radius: 10px;
  padding: 14px;
  text-align: center;
`;

const MetricValue = styled.div<{ isDarkMode: boolean; color?: string }>`
  font-size: 24px;
  font-weight: 700;
  color: ${props => props.color || (props.isDarkMode ? '#DAA520' : '#2563eb')};
  margin-bottom: 6px;
`;

const MetricLabel = styled.div<{ isDarkMode: boolean }>`
  font-size: 12px;
  color: ${props => props.isDarkMode ? '#b0b0b0' : '#666666'};
  font-weight: 500;
`;

const Description = styled.div<{ isDarkMode: boolean }>`
  background: ${props => props.isDarkMode ? '#404040' : '#f8f9fa'};
  border-radius: 12px;
  padding: 16px;
  line-height: 1.5;
  font-size: 14px;
  margin-bottom: 16px;
`;

const InsightsList = styled.ul<{ isDarkMode: boolean }>`
  list-style: none;
  padding: 0;
  margin: 0 0 20px 0;
`;

const InsightItem = styled.li<{ isDarkMode: boolean; isRTL: boolean }>`
  background: ${props => props.isDarkMode ? '#404040' : '#f8f9fa'};
  border-radius: 6px;
  padding: 10px 12px;
  margin-bottom: 6px;
  font-size: 13px;
  display: flex;
  align-items: flex-start;
  direction: ${props => props.isRTL ? 'rtl' : 'ltr'};
  
  &:before {
    content: "•";
    color: #DAA520;
    font-weight: bold;
    ${props => props.isRTL ? 'margin-left: 8px;' : 'margin-right: 8px;'}
    margin-top: 2px;
    flex-shrink: 0;
  }
`;

const TableSection = styled.div<{ isDarkMode: boolean }>`
  margin-top: 20px;
  border-top: 1px solid ${props => props.isDarkMode ? '#444' : '#e5e5e5'};
  padding-top: 20px;
`;

const TableTitle = styled.h4<{ isDarkMode: boolean }>`
  color: ${props => props.isDarkMode ? '#DAA520' : '#1f2937'};
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
`;

const Table = styled.table<{ isDarkMode: boolean; isRTL: boolean }>`
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  background: ${props => props.isDarkMode ? '#383838' : '#ffffff'};
  border-radius: 8px;
  overflow: hidden;
  direction: ${props => props.isRTL ? 'rtl' : 'ltr'};
`;

const TableHeader = styled.thead<{ isDarkMode: boolean }>`
  background: ${props => props.isDarkMode ? '#4a4a4a' : '#f8f9fa'};
`;

const TableHeaderCell = styled.th<{ isDarkMode: boolean; isRTL: boolean; $isFirstColumn?: boolean }>`
  padding: 10px 8px;
  text-align: ${props => props.isRTL ? (props.$isFirstColumn ? 'right' : 'center') : (props.$isFirstColumn ? 'left' : 'center')};
  font-weight: 600;
  color: ${props => props.isDarkMode ? '#e0e0e0' : '#333333'};
  border-bottom: 1px solid ${props => props.isDarkMode ? '#555' : '#dee2e6'};
  font-size: 11px;
  direction: ${props => props.isRTL ? 'rtl' : 'ltr'};
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr<{ isDarkMode: boolean }>`
  &:nth-child(even) {
    background: ${props => props.isDarkMode ? '#3a3a3a' : '#f9f9f9'};
  }
  
  &:hover {
    background: ${props => props.isDarkMode ? '#454545' : '#f0f0f0'};
  }
`;

const TableCell = styled.td<{ isDarkMode: boolean; isRTL: boolean; $isHighlight?: boolean; $isFirstColumn?: boolean }>`
  padding: 8px;
  border-bottom: 1px solid ${props => props.isDarkMode ? '#444' : '#e5e5e5'};
  color: ${props => props.isDarkMode ? '#e0e0e0' : '#333333'};
  font-size: 11px;
  text-align: ${props => props.isRTL ? (props.$isFirstColumn ? 'right' : 'center') : (props.$isFirstColumn ? 'left' : 'center')};
  direction: ${props => props.isRTL ? 'rtl' : 'ltr'};
  
  ${props => props.$isHighlight && `
    font-weight: 600;
    color: ${props.isDarkMode ? '#DAA520' : '#2563eb'};
  `}
`;

const StatusBadge = styled.span<{ $status: 'excellent' | 'good' | 'average' | 'poor' | 'atRisk' }>`
  padding: 2px 6px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  
  ${props => {
    switch (props.$status) {
      case 'excellent':
        return 'background: #dcfce7; color: #166534;';
      case 'good':
        return 'background: #dbeafe; color: #1e40af;';
      case 'average':
        return 'background: #fef3c7; color: #92400e;';
      case 'poor':
        return 'background: #fee2e2; color: #dc2626;';
      case 'atRisk':
        return 'background: #fecaca; color: #b91c1c;';
      default:
        return 'background: #f3f4f6; color: #374151;';
    }
  }}
`;

interface TeacherData {
  id: string;
  name: string;
  department: string;
  attendance?: number;
  absences?: number;
  punctuality?: number;
  performance?: string;
  lateArrivals?: number;
  earlyLeaves?: number;
  workHours?: number;
  status?: 'excellent' | 'good' | 'average' | 'poor' | 'atRisk';
}

interface AnalyticsKPIModalProps {
  isOpen: boolean;
  onClose: () => void;
  kpiType: 'totalTeachers' | 'attendanceRate' | 'topPerformers' | 'atRisk' | 'departments';
  data: {
    value: number | string;
    trend?: string;
    previousPeriod?: number | string;
    breakdown?: Array<{ label: string; value: number; percentage?: number }>;
    teachers?: TeacherData[];
  };
}

const AnalyticsKPIModal: React.FC<AnalyticsKPIModalProps> = ({
  isOpen,
  onClose,
  kpiType,
  data
}) => {
  const { t, isRTL } = useLanguage();
  const { isDarkMode } = useTheme();

  const getKPIContent = () => {
    switch (kpiType) {
      case 'totalTeachers':
        return {
          title: t('analytics.totalTeachers'),
          description: t('analytics.totalTeachersDesc') || 'Total number of active teachers in the system across all departments and subjects.',
          metrics: [
            { label: t('analytics.activeTeachers'), value: data.value, color: '#10b981' },
            { label: t('analytics.newThisMonth'), value: data.breakdown?.find(b => b.label === 'new')?.value || 0, color: '#3b82f6' },
            { label: t('analytics.departments'), value: data.breakdown?.find(b => b.label === 'departments')?.value || 0, color: '#f59e0b' }
          ],
          insights: [
            t('analytics.insights.staffBalance') || 'Staff distribution across departments is well balanced',
            t('analytics.insights.onboarding') || 'New teacher onboarding is proceeding smoothly',
            t('analytics.insights.ratios') || 'Teacher-to-student ratios are within optimal ranges',
            t('analytics.insights.coverage') || 'Department coverage is complete with no gaps'
          ]
        };
      
      case 'attendanceRate':
        return {
          title: t('analytics.attendanceRate'),
          description: t('analytics.attendanceRateDesc') || 'Overall attendance rate percentage calculated from daily check-ins and check-outs.',
          metrics: [
            { label: t('analytics.currentRate'), value: `${data.value}%`, color: '#10b981' },
            { label: t('analytics.lastMonth'), value: `${data.previousPeriod || 89}%`, color: '#6b7280' },
            { label: t('analytics.trend'), value: data.trend || '+2.3%', color: '#10b981' }
          ],
          insights: [
            t('analytics.insights.targetThreshold') || 'Attendance rate is above the 85% target threshold',
            t('analytics.insights.improvement') || 'Steady improvement over the past three months',
            t('analytics.insights.morningAttendance') || 'Morning attendance is consistently higher than afternoon',
            t('analytics.insights.weekendStable') || 'Weekend activities show lower but stable attendance'
          ]
        };
      
      case 'topPerformers':
        return {
          title: t('analytics.topPerformers'),
          description: t('analytics.topPerformersDesc') || 'Teachers with excellent attendance, punctuality, and overall performance ratings.',
          metrics: [
            { label: t('analytics.excellentRating'), value: data.value, color: '#10b981' },
            { label: t('analytics.averageScore'), value: '4.7/5', color: '#f59e0b' },
            { label: t('analytics.improvement'), value: '+12%', color: '#10b981' }
          ],
          insights: [
            t('analytics.insights.topAttendance') || 'Top performers maintain 95%+ attendance rates',
            t('analytics.insights.punctuality') || 'Consistent early arrivals and minimal late departures',
            t('analytics.insights.satisfaction') || 'High student satisfaction scores in evaluations',
            t('analytics.insights.development') || 'Active participation in professional development'
          ]
        };
      
      case 'atRisk':
        return {
          title: t('analytics.atRisk'),
          description: t('analytics.atRiskDesc') || 'Teachers who may need additional support based on attendance patterns and performance metrics.',
          metrics: [
            { label: t('analytics.needingSupport'), value: data.value, color: '#ef4444' },
            { label: t('analytics.attendanceBelow'), value: '<75%', color: '#f59e0b' },
            { label: t('analytics.improvementPlan'), value: '5', color: '#3b82f6' }
          ],
          insights: [
            t('analytics.insights.challenges') || 'Personal challenges affecting work attendance identified',
            t('analytics.insights.support') || 'Targeted support programs have been initiated',
            t('analytics.insights.checkins') || 'Monthly check-ins scheduled with department heads',
            t('analytics.insights.opportunities') || 'Professional development opportunities provided'
          ]
        };
      
      case 'departments':
        return {
          title: t('analytics.departments'),
          description: t('analytics.departmentsDesc') || 'Total number of active departments with assigned teaching staff.',
          metrics: [
            { label: t('analytics.totalDepartments'), value: data.value, color: '#3b82f6' },
            { label: t('analytics.fullyStaffed'), value: data.breakdown?.find(b => b.label === 'staffed')?.value || 16, color: '#10b981' },
            { label: t('analytics.needingStaff'), value: data.breakdown?.find(b => b.label === 'understaffed')?.value || 3, color: '#f59e0b' }
          ],
          insights: [
            t('analytics.insights.adequate') || 'Most departments have adequate staffing levels',
            t('analytics.insights.stemSatisfaction') || 'STEM departments show highest teacher satisfaction',
            t('analytics.insights.languageOutcomes') || 'Language departments have excellent student outcomes',
            t('analytics.insights.artsEngagement') || 'Arts departments demonstrate strong community engagement'
          ]
        };
      
      default:
        return {
          title: 'Analytics',
          description: 'Detailed analytics information.',
          metrics: [],
          insights: []
        };
    }
  };

  const content = getKPIContent();

  const getTableTitle = () => {
    switch (kpiType) {
      case 'totalTeachers':
        return t('analytics.allTeachersOverview') || 'All Teachers Overview';
      case 'attendanceRate':
        return t('analytics.attendanceDetails') || 'Attendance Details';
      case 'topPerformers':
        return t('analytics.excellentPerformers') || 'Top Performing Teachers';
      case 'atRisk':
        return t('analytics.teachersNeedingSupport') || 'Teachers Needing Support';
      case 'departments':
        return t('analytics.departmentStaffing') || 'Department Staffing Overview';
      default:
        return t('analytics.teacherPerformance') || 'Teacher Performance';
    }
  };

  const getTableHeaders = () => {
    switch (kpiType) {
      case 'totalTeachers':
        return [
          t('analytics.teacherName') || 'Teacher Name',
          t('analytics.department') || 'Department', 
          t('analytics.workType') || 'Work Type',
          t('analytics.employmentDate') || 'Employment Date',
          t('analytics.status') || 'Status'
        ];
      case 'attendanceRate':
        return [
          t('analytics.teacherName') || 'Teacher Name',
          t('analytics.department') || 'Department',
          t('analytics.attendanceRate') || 'Attendance',
          t('analytics.absences') || 'Absences',
          t('analytics.workHours') || 'Work Hours'
        ];
      case 'topPerformers':
        return [
          t('analytics.teacherName') || 'Teacher Name',
          t('analytics.department') || 'Department',
          t('analytics.attendanceRate') || 'Attendance',
          t('analytics.punctuality') || 'Punctuality',
          t('analytics.overallScore') || 'Score'
        ];
      case 'atRisk':
        return [
          t('analytics.teacherName') || 'Teacher Name',
          t('analytics.department') || 'Department',
          t('analytics.attendanceRate') || 'Attendance',
          t('analytics.absences') || 'Absences',
          t('analytics.lateArrivals') || 'Late Arrivals',
          t('analytics.concernLevel') || 'Concern Level'
        ];
      case 'departments':
        return [
          t('analytics.teacherName') || 'Teacher Name',
          t('analytics.department') || 'Department',
          t('analytics.attendanceRate') || 'Attendance',
          t('analytics.role') || 'Role',
          t('analytics.status') || 'Status'
        ];
      default:
        return [
          t('analytics.teacherName') || 'Teacher Name',
          t('analytics.department') || 'Department'
        ];
    }
  };

  const renderTableCells = (teacher: TeacherData) => {
    switch (kpiType) {
      case 'totalTeachers':
        return (
          <>
            <TableCell isDarkMode={isDarkMode} isRTL={isRTL} $isHighlight={true} $isFirstColumn={true}>{teacher.name}</TableCell>
            <TableCell isDarkMode={isDarkMode} isRTL={isRTL}>{teacher.department}</TableCell>
            <TableCell isDarkMode={isDarkMode} isRTL={isRTL}>{teacher.performance || 'Full-time'}</TableCell>
            <TableCell isDarkMode={isDarkMode} isRTL={isRTL}>{'2023-09-01'}</TableCell>
            <TableCell isDarkMode={isDarkMode} isRTL={isRTL}>
              <StatusBadge $status={teacher.status || 'good'}>
                {t(`analytics.status.${teacher.status || 'good'}`) || teacher.status || 'Active'}
              </StatusBadge>
            </TableCell>
          </>
        );
      case 'attendanceRate':
        return (
          <>
            <TableCell isDarkMode={isDarkMode} isRTL={isRTL} $isHighlight={true} $isFirstColumn={true}>{teacher.name}</TableCell>
            <TableCell isDarkMode={isDarkMode} isRTL={isRTL}>{teacher.department}</TableCell>
            <TableCell isDarkMode={isDarkMode} isRTL={isRTL}>{teacher.attendance || 0}%</TableCell>
            <TableCell isDarkMode={isDarkMode} isRTL={isRTL}>{teacher.absences || 0} days</TableCell>
            <TableCell isDarkMode={isDarkMode} isRTL={isRTL}>{teacher.workHours || 0}h</TableCell>
          </>
        );
      case 'topPerformers':
        return (
          <>
            <TableCell isDarkMode={isDarkMode} isRTL={isRTL} $isHighlight={true} $isFirstColumn={true}>{teacher.name}</TableCell>
            <TableCell isDarkMode={isDarkMode} isRTL={isRTL}>{teacher.department}</TableCell>
            <TableCell isDarkMode={isDarkMode} isRTL={isRTL}>{teacher.attendance || 0}%</TableCell>
            <TableCell isDarkMode={isDarkMode} isRTL={isRTL}>{teacher.punctuality || 0}%</TableCell>
            <TableCell isDarkMode={isDarkMode} isRTL={isRTL}>
              <StatusBadge $status={teacher.status || 'excellent'}>
                {(teacher.attendance || 95)}%
              </StatusBadge>
            </TableCell>
          </>
        );
      case 'atRisk':
        return (
          <>
            <TableCell isDarkMode={isDarkMode} isRTL={isRTL} $isHighlight={true} $isFirstColumn={true}>{teacher.name}</TableCell>
            <TableCell isDarkMode={isDarkMode} isRTL={isRTL}>{teacher.department}</TableCell>
            <TableCell isDarkMode={isDarkMode} isRTL={isRTL}>{teacher.attendance || 0}%</TableCell>
            <TableCell isDarkMode={isDarkMode} isRTL={isRTL}>{teacher.absences || 0} days</TableCell>
            <TableCell isDarkMode={isDarkMode} isRTL={isRTL}>{teacher.lateArrivals || 0}</TableCell>
            <TableCell isDarkMode={isDarkMode} isRTL={isRTL}>
              <StatusBadge $status={teacher.status || 'atRisk'}>
                {t(`analytics.status.${teacher.status || 'atRisk'}`) || 'High'}
              </StatusBadge>
            </TableCell>
          </>
        );
      case 'departments':
        return (
          <>
            <TableCell isDarkMode={isDarkMode} isRTL={isRTL} $isHighlight={true} $isFirstColumn={true}>{teacher.name}</TableCell>
            <TableCell isDarkMode={isDarkMode} isRTL={isRTL}>{teacher.department}</TableCell>
            <TableCell isDarkMode={isDarkMode} isRTL={isRTL}>{teacher.attendance || 0}%</TableCell>
            <TableCell isDarkMode={isDarkMode} isRTL={isRTL}>{teacher.performance || 'Teacher'}</TableCell>
            <TableCell isDarkMode={isDarkMode} isRTL={isRTL}>
              <StatusBadge $status={teacher.status || 'good'}>
                {t(`analytics.status.${teacher.status || 'good'}`) || 'Active'}
              </StatusBadge>
            </TableCell>
          </>
        );
      default:
        return (
          <>
            <TableCell isDarkMode={isDarkMode} isRTL={isRTL}>{teacher.name}</TableCell>
            <TableCell isDarkMode={isDarkMode} isRTL={isRTL}>{teacher.department}</TableCell>
          </>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay isOpen={isOpen} onClick={onClose}>
      <ModalContent 
        isDarkMode={isDarkMode} 
        isRTL={isRTL}
        onClick={(e) => e.stopPropagation()}
      >
        <Header isDarkMode={isDarkMode} isRTL={isRTL}>
          <Title isDarkMode={isDarkMode} isRTL={isRTL}>
            {content.title}
          </Title>
          <CloseButton 
            isRTL={isRTL}
            onClick={onClose}
          >
            ×
          </CloseButton>
        </Header>

        <Content isDarkMode={isDarkMode}>
          <Description isDarkMode={isDarkMode}>
            {content.description}
          </Description>

          <MetricGrid>
            {content.metrics.map((metric, index) => (
              <MetricCard key={index} isDarkMode={isDarkMode}>
                <MetricValue isDarkMode={isDarkMode} color={metric.color}>
                  {metric.value}
                </MetricValue>
                <MetricLabel isDarkMode={isDarkMode}>
                  {metric.label}
                </MetricLabel>
              </MetricCard>
            ))}
          </MetricGrid>

          {content.insights.length > 0 && (
            <>
              <h3 style={{ 
                color: isDarkMode ? '#DAA520' : '#1f2937', 
                marginBottom: '16px',
                fontSize: '18px',
                fontWeight: '600'
              }}>
                {t('analytics.keyInsights') || 'Key Insights'}
              </h3>
              <InsightsList isDarkMode={isDarkMode}>
                {content.insights.map((insight, index) => (
                  <InsightItem key={index} isDarkMode={isDarkMode} isRTL={isRTL}>
                    {insight}
                  </InsightItem>
                ))}
              </InsightsList>
            </>
          )}

          {data.teachers && data.teachers.length > 0 && (
            <TableSection isDarkMode={isDarkMode}>
              <TableTitle isDarkMode={isDarkMode}>
                {getTableTitle()}
              </TableTitle>
              <Table isDarkMode={isDarkMode} isRTL={isRTL}>
                <TableHeader isDarkMode={isDarkMode}>
                  <TableRow isDarkMode={isDarkMode}>
                    {getTableHeaders().map((header, index) => (
                      <TableHeaderCell 
                        key={index} 
                        isDarkMode={isDarkMode} 
                        isRTL={isRTL} 
                        $isFirstColumn={index === 0}
                      >
                        {header}
                      </TableHeaderCell>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.teachers.map((teacher, index) => (
                    <TableRow key={teacher.id} isDarkMode={isDarkMode}>
                      {renderTableCells(teacher)}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableSection>
          )}
        </Content>
      </ModalContent>
    </ModalOverlay>
  );
};

export default AnalyticsKPIModal; 