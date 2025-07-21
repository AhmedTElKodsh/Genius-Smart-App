import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { startOfMonth, format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Sidebar from '../components/Sidebar';
import DateRangePicker, { DateRange } from '../components/DateRangePicker';

// Styled components
const TeachersContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: #E7E7E7;
`;

const MainContent = styled.main`
  flex: 1;
  margin-left: 240px;
  padding: 24px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  gap: 16px;
  flex-wrap: wrap;
`;

const SearchContainer = styled.div`
  width: 250px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 8px 16px;
  padding-left: 40px;
  border: 1px solid #e1e7ec;
  border-radius: 8px;
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  background: #ffffff;
  
  &::placeholder {
    color: #666;
  }
  
  &:focus {
    outline: none;
    border-color: #D6B10E;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
`;

const SearchWrapper = styled.div`
  position: relative;
`;

const HeaderControls = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const Tab = styled.button<{ $isActive: boolean }>`
  padding: 8px 20px;
  background: ${props => props.$isActive ? '#D6B10E' : 'transparent'};
  color: ${props => props.$isActive ? '#ffffff' : '#666'};
  border: 1px solid ${props => props.$isActive ? '#D6B10E' : '#e1e7ec'};
  border-radius: 8px;
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.$isActive ? '#D6B10E' : '#f5f5f5'};
    color: ${props => props.$isActive ? '#ffffff' : '#141F25'};
    border-color: ${props => props.$isActive ? '#D6B10E' : '#D6B10E'};
  }
`;

const FilterDropdown = styled.select`
  padding: 8px 16px;
  border: 1px solid #e1e7ec;
  border-radius: 8px;
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  background: #ffffff;
  min-width: 180px;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #D6B10E;
  }
`;

const TeachersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const TeacherCard = styled.div`
  background: #ffffff;
  border: 1px solid #e1e7ec;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  min-height: 160px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  
  &:hover {
    border-color: #D6B10E;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const TeacherHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const TeacherName = styled.h3`
  font-family: 'Poppins', sans-serif;
  font-size: 18px;
  font-weight: 600;
  color: #141F25;
  margin: 0;
  flex: 1;
`;

const SubjectContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  text-align: center;
  min-width: 60px;
`;

const SubjectIcon = styled.div`
  width: 32px;
  height: 32px;
  background: #D6B10E;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 4px;
`;

const SubjectName = styled.span`
  font-family: 'Poppins', sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: #666;
  text-align: center;
  white-space: nowrap;
`;

const ContactDetail = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 0px;
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  color: #666;
`;

const ContactIcon = styled.span`
  font-size: 16px;
  width: 20px;
`;

const ContactValue = styled.span`
  color: #141F25;
`;

const ContactDetailsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-self: flex-start;
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  flex: 1;
`;

// Reports table styles
const TableContainer = styled.div`
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-family: 'Poppins', sans-serif;
`;

const TableHeader = styled.thead`
  background: #f8f9fa;
`;

const TableHeaderRow = styled.tr`
  border-bottom: 1px solid #e1e7ec;
`;

const TableHeaderCell = styled.th<{ $alignLeft?: boolean }>`
  padding: 16px 12px;
  text-align: ${props => props.$alignLeft ? 'left' : 'center'};
  font-size: 14px;
  font-weight: 600;
  color: #141F25;
  border-right: 1px solid #e1e7ec;
  
  &:last-child {
    border-right: none;
  }
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  border-bottom: 1px solid #f1f3f4;
  
  &:hover {
    background: #f8f9fa;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const TableCell = styled.td<{ $alignLeft?: boolean }>`
  padding: 16px 12px;
  font-size: 14px;
  color: #141F25;
  border-right: 1px solid #f1f3f4;
  text-align: ${props => props.$alignLeft ? 'left' : 'center'};
  
  &:last-child {
    border-right: none;
  }
`;

const WorkTypeBadge = styled.span<{ $workType: string }>`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  background: ${props => props.$workType === 'Full-time' ? '#e8f5e8' : '#e8f0ff'};
  color: ${props => props.$workType === 'Full-time' ? '#2d7d2d' : '#1e6091'};
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  padding: 0 4px;
`;

const PaginationInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  color: #666;
`;

const PaginationButton = styled.button`
  padding: 8px 12px;
  background: #ffffff;
  border: 1px solid #e1e7ec;
  border-radius: 6px;
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  color: #141F25;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    border-color: #D6B10E;
    background: #f9f7f4;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ExportButton = styled.button`
  padding: 10px 20px;
  background: #D6B10E;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #c4a00d;
    transform: translateY(-1px);
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #666;
  font-family: 'Poppins', sans-serif;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #666;
  font-family: 'Poppins', sans-serif;
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
`;

// Types
interface Teacher {
  id: string;
  name: string;
  subject: string;
  workType: string;
  email: string;
  phone: string;
  status: string;
  age: number;
  joinDate: string;
}

interface Subject {
  name: string;
  teacherCount: number;
}

interface TeacherReport {
  id: string;
  name: string;
  workType: string;
  attends: string;
  permittedLeaves: number;
  unpermittedLeaves: number;
  authorizedAbsence: number;
  unauthorizedAbsence: number;
}

const Teachers: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'reports'>('all');
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Reports specific state
  const [reportsData, setReportsData] = useState<TeacherReport[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: startOfMonth(new Date()),
    endDate: new Date(),
    label: 'This Month'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/manager/signin');
      return;
    }
  }, [navigate]);

  // Fetch teachers and subjects data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        
        const [teachersRes, subjectsRes] = await Promise.all([
          fetch('http://localhost:5000/api/teachers', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }),
          fetch('http://localhost:5000/api/subjects', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
        ]);

        if (!teachersRes.ok || !subjectsRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const teachersData = await teachersRes.json();
        const subjectsData = await subjectsRes.json();

        setTeachers(teachersData.data || []);
        setSubjects(subjectsData.data || []);
        setFilteredTeachers(teachersData.data || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter teachers based on subject and search query
  useEffect(() => {
    let filtered = teachers;

    // Filter by subject
    if (selectedSubject) {
      filtered = filtered.filter(teacher => teacher.subject === selectedSubject);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(teacher =>
        teacher.name.toLowerCase().includes(query) ||
        teacher.email.toLowerCase().includes(query) ||
        teacher.subject.toLowerCase().includes(query)
      );
    }

    setFilteredTeachers(filtered);
  }, [teachers, selectedSubject, searchQuery]);

  // Fetch reports data
  useEffect(() => {
    if (activeTab === 'reports') {
      const fetchReportsData = async () => {
        try {
          const token = localStorage.getItem('authToken');
          const params = new URLSearchParams();
          
          if (selectedSubject) {
            params.append('subject', selectedSubject);
          }
          params.append('startDate', format(dateRange.startDate, 'yyyy-MM-dd'));
          params.append('endDate', format(dateRange.endDate, 'yyyy-MM-dd'));

          const response = await fetch(`http://localhost:5000/api/teachers/reports?${params.toString()}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const result = await response.json();
            // Use real data from backend
            const reports: TeacherReport[] = (result.data || []).map((teacher: any) => ({
              id: teacher.id,
              name: teacher.name,
              workType: teacher.workType,
              attends: teacher.attends,
              permittedLeaves: teacher.permittedLeaves,
              unpermittedLeaves: teacher.unpermittedLeaves,
              authorizedAbsence: teacher.authorizedAbsence,
              unauthorizedAbsence: teacher.unauthorizedAbsence
            }));
            setReportsData(reports);
          } else {
            console.error('Failed to fetch reports:', response.status, response.statusText);
          }
        } catch (err) {
          console.error('Error fetching reports:', err);
        }
      };

      fetchReportsData();
    }
  }, [activeTab, selectedSubject, dateRange]);

  const handleTabChange = (tab: 'all' | 'reports') => {
    setActiveTab(tab);
  };

  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSubject(e.target.value);
  };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
  };

  const handleExportPDF = () => {
    try {
      // Create new PDF document
      const doc = new jsPDF();
      
      // Set document properties
      doc.setProperties({
        title: 'Teachers Reports',
        subject: 'Teacher Attendance and Leave Reports',
        author: 'Genius Smart Education',
        creator: 'Genius Smart App'
      });

      // Add school header
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Genius Smart Education', 105, 20, { align: 'center' });
      
      doc.setFontSize(16);
      doc.setFont('helvetica', 'normal');
      doc.text('Teachers Reports', 105, 30, { align: 'center' });

      // Add generation date and filters
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      doc.text(`Generated on: ${currentDate}`, 14, 45);

      // Add filter information
      let yPosition = 55;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Report Filters:', 14, yPosition);
      
      doc.setFont('helvetica', 'normal');
      yPosition += 8;
      
      // Date range
      const startDateStr = format(dateRange.startDate, 'MMM dd, yyyy');
      const endDateStr = format(dateRange.endDate, 'MMM dd, yyyy');
      doc.text(`Date Range: ${startDateStr} - ${endDateStr}`, 14, yPosition);
      yPosition += 6;
      
      // Subject filter
      const subjectText = selectedSubject || 'All Subjects';
      doc.text(`Subject: ${subjectText}`, 14, yPosition);
      yPosition += 6;
      
      // Total teachers
      doc.text(`Total Teachers: ${reportsData.length}`, 14, yPosition);
      yPosition += 10;

      // Prepare table data
      const tableColumns = [
        'Teacher',
        'Work Type',
        'Attends',
        'Permitted\nLeaves',
        'Unpermitted\nLeaves',
        'Authorized\nAbsence',
        'Unauthorized\nAbsence'
      ];

      const tableData = reportsData.map(report => [
        report.name,
        report.workType,
        report.attends,
        `${report.permittedLeaves}d`,
        `${report.unpermittedLeaves}d`,
        `${report.authorizedAbsence}d`,
        `${report.unauthorizedAbsence}d`
      ]);

      // Add table
      autoTable(doc, {
        head: [tableColumns],
        body: tableData,
        startY: yPosition,
        theme: 'striped',
        headStyles: {
          fillColor: [214, 177, 14], // School brand color
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 10,
          halign: 'center'
        },
        bodyStyles: {
          fontSize: 9,
          cellPadding: 3
        },
        columnStyles: {
          0: { halign: 'left' }, // Teacher name - left aligned
          1: { halign: 'center' }, // Work Type - center aligned
          2: { halign: 'center' }, // Attends - center aligned
          3: { halign: 'center' }, // Permitted Leaves - center aligned
          4: { halign: 'center' }, // Unpermitted Leaves - center aligned
          5: { halign: 'center' }, // Authorized Absence - center aligned
          6: { halign: 'center' }  // Unauthorized Absence - center aligned
        },
        alternateRowStyles: {
          fillColor: [248, 249, 250]
        },
        margin: { top: yPosition, left: 14, right: 14 },
        didDrawPage: (data) => {
          // Add page numbers
          const pageCount = (doc as any).getNumberOfPages();
          const pageSize = doc.internal.pageSize;
          const pageHeight = pageSize.height || pageSize.getHeight();
          
          doc.setFontSize(8);
          doc.text(
            `Page ${data.pageNumber} of ${pageCount}`,
            pageSize.width - 30,
            pageHeight - 10,
            { align: 'right' }
          );
        }
      });

      // Add summary at the bottom if there's space
      const finalY = (doc as any).lastAutoTable.finalY || yPosition + 50;
      if (finalY < 250) { // If there's space on the page
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Summary:', 14, finalY + 15);
        
        doc.setFont('helvetica', 'normal');
        const totalPermittedLeaves = reportsData.reduce((sum, report) => sum + report.permittedLeaves, 0);
        const totalUnpermittedLeaves = reportsData.reduce((sum, report) => sum + report.unpermittedLeaves, 0);
        const totalAuthorizedAbsence = reportsData.reduce((sum, report) => sum + report.authorizedAbsence, 0);
        const totalUnauthorizedAbsence = reportsData.reduce((sum, report) => sum + report.unauthorizedAbsence, 0);
        
        doc.text(`Total Permitted Leaves: ${totalPermittedLeaves}d`, 14, finalY + 25);
        doc.text(`Total Unpermitted Leaves: ${totalUnpermittedLeaves}d`, 14, finalY + 32);
        doc.text(`Total Authorized Absence: ${totalAuthorizedAbsence}d`, 14, finalY + 39);
        doc.text(`Total Unauthorized Absence: ${totalUnauthorizedAbsence}d`, 14, finalY + 46);
      }

      // Generate filename
      const dateString = format(new Date(), 'yyyy-MM-dd');
      const subjectString = selectedSubject ? `_${selectedSubject.replace(/\s+/g, '-')}` : '';
      const filename = `Teachers-Report_${dateString}${subjectString}.pdf`;

      // Save the PDF
      doc.save(filename);
      
      console.log('PDF exported successfully:', filename);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to export PDF. Please try again.');
    }
  };

  // Pagination helpers
  const totalPages = Math.ceil(reportsData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentReports = reportsData.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  const handleAddTeacher = () => {
    // TODO: Implement add teacher modal/page
    console.log('Add teacher clicked');
  };

  if (loading) {
    return (
      <TeachersContainer>
        <Sidebar onAddTeacher={handleAddTeacher} />
        <MainContent>
          <LoadingContainer>Loading teachers data...</LoadingContainer>
        </MainContent>
      </TeachersContainer>
    );
  }

  if (error) {
    return (
      <TeachersContainer>
        <Sidebar onAddTeacher={handleAddTeacher} />
        <MainContent>
          <LoadingContainer>Error: {error}</LoadingContainer>
        </MainContent>
      </TeachersContainer>
    );
  }

  return (
    <TeachersContainer>
      <Sidebar onAddTeacher={handleAddTeacher} />
      <MainContent>
        <Header>
          <TabContainer>
            <Tab
              $isActive={activeTab === 'all'}
              onClick={() => handleTabChange('all')}
            >
              All Teachers
            </Tab>
            <Tab
              $isActive={activeTab === 'reports'}
              onClick={() => handleTabChange('reports')}
            >
              Reports
            </Tab>
          </TabContainer>
          
          <HeaderControls>
            <FilterDropdown
              value={selectedSubject}
              onChange={handleSubjectChange}
            >
              <option value="">All Subjects</option>
              {subjects.map(subject => (
                <option key={subject.name} value={subject.name}>
                  {subject.name} ({subject.teacherCount})
                </option>
              ))}
            </FilterDropdown>
            
            {activeTab === 'reports' && (
              <DateRangePicker
                value={dateRange}
                onChange={handleDateRangeChange}
              />
            )}
            
            <SearchContainer>
              <SearchWrapper>
                <SearchIcon>🔍</SearchIcon>
                <SearchInput
                  type="text"
                  placeholder="Ahmed Mohamed"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </SearchWrapper>
            </SearchContainer>
          </HeaderControls>
        </Header>

        {activeTab === 'all' && (
          <>
            {filteredTeachers.length === 0 ? (
              <EmptyState>
                <EmptyIcon>👥</EmptyIcon>
                <h3>No teachers found</h3>
                <p>
                  {searchQuery || selectedSubject 
                    ? 'Try adjusting your search criteria'
                    : 'No teachers available in the system'
                  }
                </p>
              </EmptyState>
            ) : (
              <TeachersGrid>
                {filteredTeachers.map(teacher => (
                  <TeacherCard key={teacher.id}>
                    <TeacherHeader>
                      <TeacherName>{teacher.name}</TeacherName>
                      <SubjectContainer>
                        <SubjectIcon>
                          {teacher.subject.charAt(0).toUpperCase()}
                        </SubjectIcon>
                        <SubjectName>{teacher.subject}</SubjectName>
                      </SubjectContainer>
                    </TeacherHeader>
                    
                    <CardContent>
                      <ContactDetailsContainer>
                        <ContactDetail>
                          <ContactIcon>📧</ContactIcon>
                          <ContactValue>{teacher.email}</ContactValue>
                        </ContactDetail>
                        
                        <ContactDetail>
                          <ContactIcon>📞</ContactIcon>
                          <ContactValue>{teacher.phone}</ContactValue>
                        </ContactDetail>
                      </ContactDetailsContainer>
                    </CardContent>
                  </TeacherCard>
                ))}
              </TeachersGrid>
            )}
          </>
        )}

        {activeTab === 'reports' && (
          <>
            <TableContainer>
              <Table>
                <TableHeader>
                  <TableHeaderRow>
                    <TableHeaderCell $alignLeft>Teacher</TableHeaderCell>
                    <TableHeaderCell>Work Type</TableHeaderCell>
                    <TableHeaderCell>Attends</TableHeaderCell>
                    <TableHeaderCell>Permitted Leaves</TableHeaderCell>
                    <TableHeaderCell>Unpermitted Leaves</TableHeaderCell>
                    <TableHeaderCell>Authorized Absence</TableHeaderCell>
                    <TableHeaderCell>Unauthorized Absence</TableHeaderCell>
                  </TableHeaderRow>
                </TableHeader>
                <TableBody>
                  {currentReports.map(report => (
                    <TableRow key={report.id}>
                      <TableCell $alignLeft>{report.name}</TableCell>
                      <TableCell>
                        <WorkTypeBadge $workType={report.workType}>
                          {report.workType}
                        </WorkTypeBadge>
                      </TableCell>
                      <TableCell>{report.attends}</TableCell>
                      <TableCell>{report.permittedLeaves}d</TableCell>
                      <TableCell>{report.unpermittedLeaves}d</TableCell>
                      <TableCell>{report.authorizedAbsence}d</TableCell>
                      <TableCell>{report.unauthorizedAbsence}d</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <PaginationContainer>
              <PaginationInfo>
                <PaginationButton
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  ‹
                </PaginationButton>
                <span>Page {currentPage}</span>
                <PaginationButton
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  ›
                </PaginationButton>
              </PaginationInfo>
              
              <ExportButton onClick={handleExportPDF}>
                Export PDF
              </ExportButton>
            </PaginationContainer>
          </>
        )}
      </MainContent>
    </TeachersContainer>
  );
};

export default Teachers; 