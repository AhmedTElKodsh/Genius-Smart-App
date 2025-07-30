import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useLanguage } from '../contexts/LanguageContext';

const Container = styled.div`
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 24px;
  margin-top: 20px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h2<{ $isRTL?: boolean }>`
  color: #2c3e50;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
`;

const FilterSection = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  align-items: center;
`;

const FilterItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Label = styled.label<{ $isRTL?: boolean }>`
  font-size: 12px;
  color: #7f8c8d;
  font-weight: 500;
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
`;

const Select = styled.select<{ $isRTL?: boolean }>`
  padding: 8px 12px;
  border: 1px solid #e1e7ec;
  border-radius: 6px;
  background: #ffffff;
  color: #2c3e50;
  font-size: 14px;
  cursor: pointer;
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
  
  &:focus {
    outline: none;
    border-color: #4A90E2;
  }
`;

const DateInput = styled.input<{ $isRTL?: boolean }>`
  padding: 8px 12px;
  border: 1px solid #e1e7ec;
  border-radius: 6px;
  background: #ffffff;
  color: #2c3e50;
  font-size: 14px;
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
  
  &:focus {
    outline: none;
    border-color: #4A90E2;
  }
`;

const Button = styled.button`
  padding: 8px 16px;
  background: #4A90E2;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #357ABD;
    transform: translateY(-1px);
  }
`;

const AuditTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
`;

const TableHeader = styled.th<{ $isRTL?: boolean }>`
  text-align: ${props => props.$isRTL ? 'right' : 'left'};
  padding: 12px;
  background: #f8f9fa;
  font-size: 13px;
  font-weight: 600;
  color: #495057;
  border-bottom: 2px solid #dee2e6;
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
`;

const TableRow = styled.tr`
  &:hover {
    background: #f8f9fa;
  }
`;

const TableCell = styled.td<{ $isRTL?: boolean }>`
  padding: 12px;
  border-bottom: 1px solid #e9ecef;
  font-size: 14px;
  color: #495057;
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
  text-align: ${props => props.$isRTL ? 'right' : 'left'};
`;

const ActionBadge = styled.span<{ $type: string }>`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  background: ${props => props.$type === 'approve' ? '#d4edda' : '#f8d7da'};
  color: ${props => props.$type === 'approve' ? '#155724' : '#721c24'};
`;

const RoleBadge = styled.span<{ $role: string }>`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  background: ${props => props.$role === 'Admin' ? '#cce5ff' : '#e7e7e7'};
  color: ${props => props.$role === 'Admin' ? '#004085' : '#495057'};
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 40px;
  color: #7f8c8d;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: #7f8c8d;
`;

const StatsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const StatCard = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
`;

const StatLabel = styled.div<{ $isRTL?: boolean }>`
  font-size: 13px;
  color: #7f8c8d;
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
`;

interface AuditEntry {
  id: string;
  actionType: string;
  requestId: string;
  requestType: string;
  teacherId: string;
  teacherName: string;
  performedBy: string;
  performerName: string;
  performerRole: string;
  performerEmail: string;
  timestamp: string;
  details: {
    previousStatus: string;
    newStatus: string;
    reason?: string;
  };
}

interface RequestAuditTrailProps {
  managerId: string;
  managerRole: string;
}

const RequestAuditTrail: React.FC<RequestAuditTrailProps> = ({ managerId, managerRole }) => {
  const { t, isRTL } = useLanguage();
  const [audits, setAudits] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  
  // Filters
  const [actionType, setActionType] = useState('');
  const [performerId, setPerformerId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [managers, setManagers] = useState<any[]>([]);

  useEffect(() => {
    if (managerRole === 'Admin') {
      fetchAudits();
      fetchStats();
      fetchManagers();
    }
  }, [managerRole]);

  const fetchManagers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/manager/all', {
        headers: {
          'user-id': managerId
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setManagers(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching managers:', error);
    }
  };

  const fetchAudits = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (actionType) params.append('actionType', actionType);
      if (performerId) params.append('performerId', performerId);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const response = await fetch(`http://localhost:5000/api/request-audit?${params}`, {
        headers: {
          'user-id': managerId
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAudits(data.data.audits || []);
      } else {
        console.error('Failed to fetch audits');
      }
    } catch (error) {
      console.error('Error fetching audits:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/request-audit/stats/summary', {
        headers: {
          'user-id': managerId
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleFilterApply = () => {
    fetchAudits();
    fetchStats();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(isRTL ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (managerRole !== 'Admin') {
    return (
      <Container>
        <EmptyState>
          {t('audit.adminOnly') || 'Only administrators can view the audit trail'}
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title $isRTL={isRTL}>
          {t('audit.requestAuditTrail') || 'Request Audit Trail'}
        </Title>
      </Header>

      {stats && (
        <StatsSection>
          <StatCard>
            <StatValue>{stats.totalActions}</StatValue>
            <StatLabel $isRTL={isRTL}>
              {t('audit.totalActions') || 'Total Actions'}
            </StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats.byActionType?.approve || 0}</StatValue>
            <StatLabel $isRTL={isRTL}>
              {t('audit.approvals') || 'Approvals'}
            </StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats.byActionType?.reject || 0}</StatValue>
            <StatLabel $isRTL={isRTL}>
              {t('audit.rejections') || 'Rejections'}
            </StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{Object.keys(stats.byPerformer || {}).length}</StatValue>
            <StatLabel $isRTL={isRTL}>
              {t('audit.activeManagers') || 'Active Managers'}
            </StatLabel>
          </StatCard>
        </StatsSection>
      )}

      <FilterSection>
        <FilterItem>
          <Label $isRTL={isRTL}>{t('audit.actionType') || 'Action Type'}</Label>
          <Select 
            $isRTL={isRTL}
            value={actionType}
            onChange={(e) => setActionType(e.target.value)}
          >
            <option value="">{t('audit.allActions') || 'All Actions'}</option>
            <option value="approve">{t('audit.approved') || 'Approved'}</option>
            <option value="reject">{t('audit.rejected') || 'Rejected'}</option>
          </Select>
        </FilterItem>

        <FilterItem>
          <Label $isRTL={isRTL}>{t('audit.performedBy') || 'Performed By'}</Label>
          <Select 
            $isRTL={isRTL}
            value={performerId}
            onChange={(e) => setPerformerId(e.target.value)}
          >
            <option value="">{t('audit.allManagers') || 'All Managers'}</option>
            {managers.map(manager => (
              <option key={manager.id} value={manager.id}>
                {manager.name} ({manager.systemRole})
              </option>
            ))}
          </Select>
        </FilterItem>

        <FilterItem>
          <Label $isRTL={isRTL}>{t('audit.startDate') || 'Start Date'}</Label>
          <DateInput 
            type="date"
            $isRTL={isRTL}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </FilterItem>

        <FilterItem>
          <Label $isRTL={isRTL}>{t('audit.endDate') || 'End Date'}</Label>
          <DateInput 
            type="date"
            $isRTL={isRTL}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </FilterItem>

        <FilterItem style={{ alignSelf: 'flex-end' }}>
          <Button onClick={handleFilterApply}>
            {t('audit.applyFilters') || 'Apply Filters'}
          </Button>
        </FilterItem>
      </FilterSection>

      {loading ? (
        <LoadingState>{t('loading') || 'Loading...'}</LoadingState>
      ) : audits.length === 0 ? (
        <EmptyState>{t('audit.noAudits') || 'No audit entries found'}</EmptyState>
      ) : (
        <AuditTable>
          <thead>
            <tr>
              <TableHeader $isRTL={isRTL}>
                {t('audit.timestamp') || 'Timestamp'}
              </TableHeader>
              <TableHeader $isRTL={isRTL}>
                {t('audit.action') || 'Action'}
              </TableHeader>
              <TableHeader $isRTL={isRTL}>
                {t('audit.teacher') || 'Teacher'}
              </TableHeader>
              <TableHeader $isRTL={isRTL}>
                {t('audit.requestType') || 'Request Type'}
              </TableHeader>
              <TableHeader $isRTL={isRTL}>
                {t('audit.performedBy') || 'Performed By'}
              </TableHeader>
              <TableHeader $isRTL={isRTL}>
                {t('audit.role') || 'Role'}
              </TableHeader>
              <TableHeader $isRTL={isRTL}>
                {t('audit.reason') || 'Reason'}
              </TableHeader>
            </tr>
          </thead>
          <tbody>
            {audits.map(audit => (
              <TableRow key={audit.id}>
                <TableCell $isRTL={isRTL}>
                  {formatDate(audit.timestamp)}
                </TableCell>
                <TableCell $isRTL={isRTL}>
                  <ActionBadge $type={audit.actionType}>
                    {audit.actionType === 'approve' 
                      ? (t('audit.approved') || 'Approved')
                      : (t('audit.rejected') || 'Rejected')
                    }
                  </ActionBadge>
                </TableCell>
                <TableCell $isRTL={isRTL}>
                  {audit.teacherName}
                </TableCell>
                <TableCell $isRTL={isRTL}>
                  {t(`requests.${audit.requestType.replace(' ', '')}`) || audit.requestType}
                </TableCell>
                <TableCell $isRTL={isRTL}>
                  {audit.performerName}
                </TableCell>
                <TableCell $isRTL={isRTL}>
                  <RoleBadge $role={audit.performerRole}>
                    {audit.performerRole}
                  </RoleBadge>
                </TableCell>
                <TableCell $isRTL={isRTL}>
                  {audit.details.reason || '-'}
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </AuditTable>
      )}
    </Container>
  );
};

export default RequestAuditTrail; 