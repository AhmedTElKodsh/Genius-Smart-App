import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

const DropdownContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const DropdownButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 16px;
  min-width: 140px;
  background: #ffffff;
  border: 1px solid #e1e7ec;
  border-radius: 8px;
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  color: #141F25;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #D6B10E;
  }
  
  .icon {
    color: #666;
    transition: transform 0.2s ease;
    ${props => props.className?.includes('open') && 'transform: rotate(180deg);'}
  }
`;

const DropdownList = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1000;
  background: #ffffff;
  border: 1px solid #e1e7ec;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-height: 200px;
  overflow-y: auto;
  display: ${props => props.$isOpen ? 'block' : 'none'};
  margin-top: 4px;
`;

const DropdownItem = styled.button<{ $isSelected: boolean }>`
  width: 100%;
  padding: 10px 16px;
  background: ${props => props.$isSelected ? '#F3F1E4' : 'transparent'};
  border: none;
  text-align: left;
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  color: ${props => props.$isSelected ? '#D6B10E' : '#141F25'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #F3F1E4;
    color: #D6B10E;
  }
  
  &:first-child {
    border-radius: 8px 8px 0 0;
  }
  
  &:last-child {
    border-radius: 0 0 8px 8px;
  }
  
  &:only-child {
    border-radius: 8px;
  }
`;

export interface Subject {
  value: string;
  label: string;
  arabicName?: string;
}

interface SubjectDropdownProps {
  subjects: Subject[];
  selectedSubject: string;
  onSubjectChange: (subject: string) => void;
  placeholder?: string;
}

const SubjectDropdown: React.FC<SubjectDropdownProps> = ({
  subjects,
  selectedSubject,
  onSubjectChange,
  placeholder = "All Subjects"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedSubjectLabel = selectedSubject 
    ? subjects.find(s => s.value === selectedSubject)?.label || selectedSubject
    : placeholder;

  const handleItemClick = (subjectValue: string) => {
    onSubjectChange(subjectValue);
    setIsOpen(false);
  };

  return (
    <DropdownContainer ref={containerRef}>
      <DropdownButton 
        onClick={() => setIsOpen(!isOpen)}
        className={isOpen ? 'open' : ''}
      >
        <span>📚</span>
        <span>{selectedSubjectLabel}</span>
        <span className="icon">▼</span>
      </DropdownButton>
      
      <DropdownList $isOpen={isOpen}>
        <DropdownItem
          $isSelected={!selectedSubject}
          onClick={() => handleItemClick('')}
        >
          {placeholder}
        </DropdownItem>
        {subjects.map((subject) => (
          <DropdownItem
            key={subject.value}
            $isSelected={selectedSubject === subject.value}
            onClick={() => handleItemClick(subject.value)}
          >
            {subject.label}
          </DropdownItem>
        ))}
      </DropdownList>
    </DropdownContainer>
  );
};

export default SubjectDropdown; 