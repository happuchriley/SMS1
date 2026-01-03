import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
import studentsService from '../../services/studentsService';
import { useModal } from '../../components/ModalProvider';

const ParentsList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { showViewModal, toast } = useModal();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const allStudents = await studentsService.getAll();
      setStudents(allStudents);
    } catch (error) {
      console.error('Error loading parents:', error);
      toast.showError('Failed to load parents list');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Extract unique parents from students
  const parents = useMemo(() => {
    const parentMap = new Map();
    students.forEach(student => {
      const parentName = student.parent || student.parentName || 'Unknown';
      const parentId = parentName.toLowerCase().replace(/\s+/g, '_');
      
      if (!parentMap.has(parentId)) {
        parentMap.set(parentId, {
          id: parentId,
          name: parentName,
          contact: student.contact || student.parentContact || 'N/A',
          email: student.email || student.parentEmail || 'N/A',
          address: student.address || 'N/A',
          children: []
        });
      }
      parentMap.get(parentId).children.push({
        id: student.id,
        name: `${student.firstName || ''} ${student.surname || ''}`.trim(),
        class: student.class,
        studentId: student.studentId || student.id
      });
    });
    return Array.from(parentMap.values());
  }, [students]);

  const filteredParents = useMemo(() => {
    if (!searchTerm) return parents;
    const term = searchTerm.toLowerCase();
    return parents.filter(parent => 
      parent.name.toLowerCase().includes(term) ||
      parent.contact.includes(term) ||
      parent.email.toLowerCase().includes(term)
    );
  }, [parents, searchTerm]);

  const handleView = (parent) => {
    showViewModal({
      title: 'Parent/Guardian Details',
      data: parent,
      fields: [
        { label: 'Name', key: 'name' },
        { label: 'Contact', key: 'contact' },
        { label: 'Email', key: 'email' },
        { label: 'Address', key: 'address' },
        { 
          label: 'Children', 
          accessor: (p) => p.children.length,
          render: (_, p) => (
            <div>
              {p.children.map((child, idx) => (
                <div key={idx} className="mb-2">
                  <strong>{child.name}</strong> - {child.class} (ID: {child.studentId})
                </div>
              ))}
            </div>
          )
        }
      ]
    });
  };

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Parents List</h1>
        <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
          <Link to="/" className="text-gray-600 no-underline hover:text-primary">Home</Link>
          <span>/</span>
          <span>Students</span>
          <span>/</span>
          <span>Parents List</span>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200 mb-4">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by name, contact, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-md"
          />
        </div>
        <div className="text-sm text-gray-600 mb-4">
          Total Parents/Guardians: {filteredParents.length}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <i className="fas fa-spinner fa-spin text-4xl text-gray-300 mb-3"></i>
            <div className="text-gray-500">Loading parents...</div>
          </div>
        ) : filteredParents.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <i className="fas fa-inbox text-4xl mb-3 text-gray-300"></i>
            <div>No parents found</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary-500">
                <tr>
                  <th className="p-3 text-left text-white text-xs uppercase">Name</th>
                  <th className="p-3 text-left text-white text-xs uppercase">Contact</th>
                  <th className="p-3 text-left text-white text-xs uppercase">Email</th>
                  <th className="p-3 text-left text-white text-xs uppercase">Children</th>
                  <th className="p-3 text-left text-white text-xs uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredParents.map((parent) => (
                  <tr key={parent.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="p-3 text-sm font-medium">{parent.name}</td>
                    <td className="p-3 text-sm">{parent.contact}</td>
                    <td className="p-3 text-sm">{parent.email}</td>
                    <td className="p-3 text-sm">{parent.children.length}</td>
                    <td className="p-3">
                      <button
                        onClick={() => handleView(parent)}
                        className="px-3 py-1 text-sm text-primary-500 hover:bg-primary-50 rounded"
                      >
                        <i className="fas fa-eye mr-1"></i> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ParentsList;
