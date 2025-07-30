declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: {
      finalY: number;
    };
  }
}

declare module 'jspdf-autotable' {
  interface UserOptions {
    head?: any[][];
    body?: any[][];
    startY?: number;
    theme?: string;
    headStyles?: any;
    bodyStyles?: any;
    columnStyles?: any;
    alternateRowStyles?: any;
    margin?: any;
    didDrawPage?: (data: any) => void;
  }

  function autoTable(doc: any, options: UserOptions): void;
  export = autoTable;
} 