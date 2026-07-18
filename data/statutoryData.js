// data/statutoryData.js
export const INITIAL_STATUTORY_DATA = [
  {
    id: 'CAC-2026-0091',
    companyName: 'Evault SolarFlex Solutions LTD',
    type: 'cac_limited',
    label: 'CAC Private Limited Company',
    date: 'July 18, 2026',
    status: 'completed',
    cost: '₦65,000.00',
    // CAC demands 3 distinct official statutory files
    documents: [
      { id: 'doc1', name: 'Certificate', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', fileName: 'CAC_Certificate_SolarFlex.pdf' },
      { id: 'doc2', name: 'MEMART', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', fileName: 'CAC_MEMART_SolarFlex.pdf' },
      { id: 'doc3', name: 'Status Report', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', fileName: 'CAC_Status_Report_SolarFlex.pdf' }
    ]
  },
  {
    id: 'TIN-2026-8841',
    companyName: 'Malam NUK Media Enterprise',
    type: 'tin_joint',
    label: 'Corporate TIN Generation',
    date: 'July 14, 2026',
    status: 'completed',
    cost: '₦15,000.00',
    // TIN requires only the official letter/certificate
    documents: [
      { id: 'doc1', name: 'TIN Certificate', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', fileName: 'FIRS_TIN_Letter_MalamNUK.pdf' }
    ]
  },
  {
    id: 'SCM-2026-1102',
    companyName: 'iServebay Logistics Hub',
    type: 'scuml_cert',
    label: 'SCUML Compliance Certificate',
    date: 'July 10, 2026',
    status: 'completed',
    cost: '₦35,000.00',
    // SCUML delivers a single verification asset
    documents: [
      { id: 'doc1', name: 'SCUML Certificate', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', fileName: 'SCUML_Certificate_iServebay.pdf' }
    ]
  },
  {
    id: 'CAC-2026-0045',
    companyName: 'Ziya Energy & Geochemical Analytics',
    type: 'cac_limited',
    label: 'CAC Incorporation Update',
    date: 'June 28, 2026',
    status: 'review',
    cost: '₦20,000.00',
    documents: [] // No files unlocked yet while processing adjustments
  }
];