import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TestRecord, TestError } from '../types';
import { calculateErrorStats } from '../utils/metrics';
import { TestLogHeader } from '../components/testlog/TestLogHeader';
import { TestSummaryCards } from '../components/testlog/TestSummaryCards';
import { TestMarksTrendChart } from '../components/testlog/TestMarksTrendChart';
import { TestListSection } from '../components/testlog/TestListSection';
import { MasterErrorVaultSection } from '../components/testlog/MasterErrorVaultSection';
import { AddEditTestModal } from '../components/modals/AddEditTestModal';
import { AddEditErrorModal } from '../components/modals/AddEditErrorModal';

export const TestErrorLogPage: React.FC = () => {
  const { tests, testErrors, addTest, addTestError } = useApp();

  const [activeTab, setActiveTab] = useState<'tests' | 'errors'>('tests');
  const [addTestModalOpen, setAddTestModalOpen] = useState(false);
  const [addErrorModalOpen, setAddErrorModalOpen] = useState(false);

  const errorStats = calculateErrorStats(testErrors);

  const handleSaveNewTest = (testData: Omit<TestRecord, 'id' | 'createdAt'> | TestRecord) => {
    if (!('id' in testData)) {
      addTest(testData);
    }
  };

  const handleSaveNewError = (errorData: Omit<TestError, 'id' | 'createdAt' | 'updatedAt'> | TestError) => {
    if (!('id' in errorData)) {
      addTestError(errorData);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* A. Page Header & Tab Navigation */}
      <TestLogHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onAddTest={() => setAddTestModalOpen(true)}
        onAddError={() => setAddErrorModalOpen(true)}
        totalTests={tests.length}
        totalErrors={testErrors.length}
        unresolvedErrors={errorStats.unresolved}
      />

      {/* B. Performance Summary Widgets */}
      <TestSummaryCards />

      {/* Tab 1: Mock Tests & Marks Analytics */}
      {activeTab === 'tests' && (
        <>
          {/* C. Marks Trend Chart */}
          <TestMarksTrendChart onAddTest={() => setAddTestModalOpen(true)} />

          {/* D & E. Filters, Sorting & Test Records Grid/Table */}
          <TestListSection onAddTest={() => setAddTestModalOpen(true)} />
        </>
      )}

      {/* Tab 2: Error Vault & Mistake Taxonomy */}
      {activeTab === 'errors' && (
        <MasterErrorVaultSection onAddError={() => setAddErrorModalOpen(true)} />
      )}

      {/* Quick Add Test Modal */}
      <AddEditTestModal
        isOpen={addTestModalOpen}
        onClose={() => setAddTestModalOpen(false)}
        onSave={handleSaveNewTest}
      />

      {/* Quick Add Error Modal */}
      <AddEditErrorModal
        isOpen={addErrorModalOpen}
        onClose={() => setAddErrorModalOpen(false)}
        onSave={handleSaveNewError}
      />
    </div>
  );
};
